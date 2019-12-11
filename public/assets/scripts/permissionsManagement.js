// Search module is required as it has the list of all modules !important

let modules_list;

// isOwner and isModerator provided by the backend


let currentUserPermissionsUpdatedIndex = -1;
let userList;
let userModulesList = [];

// Templates
const userListTemplateHTML = $("#tableRow-userList-template").html();
const userListTemplate = Handlebars.compile(userListTemplateHTML);

const permissionsTemplateHTML = $("#tableRow-permissions-template").html();
const permissionsTemplate = Handlebars.compile(permissionsTemplateHTML);

const getModulesList = async () => {
    try {
        // Get the list of the modules form the server

        modules_list = await $.ajax({
            url: "/resources/modules-list",
            type: "GET"
        });

        console.log(modules_list);

    } catch (e) {
        console.log(e);
    }
};

const showUserNotAuthorised = () => {
    $("#userNotAuthorisedToManagePermissionsInfo").removeClass("d-none");
};

const fetchUsersData = async () => {

    if (!isOwner && !isModerator){
        // The user can not edit the permissions so there is no point in fetching them
        showUserNotAuthorised();

        return;
    }

    $("#permissionManagementTable").removeClass("d-none");

    try {
        if (!modules_list){
            await getModulesList();
        }

        userList = await $.ajax({
            url: "/resources/get-all-users",
            type: "GET"
        });

        console.log(userList);

        displayUsersData(userList);
    } catch (e) {
        console.log(e.status);

        // TODO Fix the info
        // User not authorised
        if (e.status === 401){
            // User not authorised
            showUserNotAuthorised();
        } else if (e.status === 403){
            window.location = "/?loc=/settings";
        } else {
            toastr.options.closeButton = true;
            toastr.options.timeOut = 10000;
            toastr.options.extendedTimeOut = 20000;
            toastr.options.progressBar = true;
            toastr.error(e, "Error!");
        }
    }
};

const displayUsersData = async userList => {

    try {
        // Clear the table
        const listTableBody = document.querySelector("#userListTableBody");
        while (listTableBody.firstChild) {
            listTableBody.removeChild(listTableBody.firstChild);
        }

        const { userStatus } = await $.ajax({
            type: "GET",
            url: "/resources/get-logged-in-users-status"
        });

        // Fill out the table with users
        let i = 0;
        for (let user of userList) {
            let badge;
            let credsName;
            if (user.owner) {
                badge = "primary";
                credsName = "Owner";
            } else if (user.canEditPermissions) {
                badge = "info";
                credsName = "Moderator";
            } else {
                badge = "secondary";
                credsName = "User";
            }

            // If the user is an owner show owners options


            $(listTableBody).append(userListTemplate({
                userNameList: user.name,
                userEmailList: user.email,
                userPhotoLink: user.pictureUrl,
                userCredsBadge: badge,
                userCredsName: credsName,
                userIndex: i,
                userManagePermissionsDisabled: (credsName === "Owner" || credsName === "Moderator") ? "disabled" : "",
                userModeratorDisplay: (userStatus === "Owner" && !user.owner) ? "inline-block" : "none",
                userModeratorButtonClass: user.canEditPermissions ? "danger" : "success",
                userModeratorTooltipTitle: user.canEditPermissions ? "Downgrade to user" : "Upgrade to moderator",
                userModeratorIconClassDirection: user.canEditPermissions ? "down" : "up",
            }));

            i++;
        }

    } catch (e) {
        console.log(e);
    }
};

const editPermissions = userIndex => {

    // Remembering the index of the user that is currently being updated
    currentUserPermissionsUpdatedIndex = userIndex;

    // Compile a list of the modules that are accessable and not accessible by the user
    compileModuleList(userList[userIndex]);

    // Show the permissions to the user
    fillOutModal(userIndex);
};

const fillOutModal = userIndex => {

    // Fill out the modal with the correct data

    // Change the title
    document.querySelector("#usersPermissionsModalTitle").textContent = `${userList[currentUserPermissionsUpdatedIndex].name} - Edit Permissions`;

    // Enable the button
    document.querySelector("#fullInfoModalCheck").removeAttribute("disabled");

    // Clear and then fill out the table
    const tableUsersPermissions = document.querySelector("#tableUserPermissionsModal");

    while (tableUsersPermissions.firstChild){
        tableUsersPermissions.removeChild(tableUsersPermissions.firstChild);
    }

    for (let module of userModulesList){
        $(tableUsersPermissions).append(permissionsTemplate({
            moduleStatusClass: module.userPermitted ? "success" : "danger",
            moduleName: module.name
        }));
    }
};

const compileModuleList = currentUser => {
    userModulesList = [];

    for (let module of modules_list.modules){
        if (!module.permission_required || !module.show_up_in_search){
            continue;
        }

        let matchedModules = currentUser.permissions.filter(permission => {
            return permission.name.toLowerCase() === module.name.toLowerCase();
        });

        const newModuleElement = {
            name: module.name,
            uri: module.uri
        };

        if (matchedModules.length > 0){
            newModuleElement.userPermitted = true;
            userModulesList.push(newModuleElement);
            continue;
        }

        newModuleElement.userPermitted = false;
        userModulesList.push(newModuleElement);
    }
};

const changeSinglePermission = moduleName => {

    for (let module of userModulesList){
        if (module.name === moduleName){
            module.userPermitted = !module.userPermitted;
            break;
        }
    }

    fillOutModal();
};

const updatePermissions = async () => {
    // Disable the update button
    document.querySelector("#fullInfoModalCheck").setAttribute("disabled", "disabled");

    const newPermissionsSet = userModulesList.filter(module => {
        return module.userPermitted;
    });

    newPermissionsSet.forEach(element => {
       delete element.userPermitted;
    });

    try {
        const data = {
          newPermissionsSet,
          userEmail: userList[currentUserPermissionsUpdatedIndex].email
        };

        const response = await $.ajax({
            url: "/resources/update-user-permissions",
            type: "PATCH",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data)
        });

        // Exit the modal
        document.querySelector("#fullInfoModalCloseButton").click();

        toastr.options.closeButton = true;
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 20000;
        toastr.options.progressBar = true;
        toastr.success("The permissions have been updated.", "Success!");

        // Update the data
        fetchUsersData();

    } catch (e) {
        // Exit the modal
        document.querySelector("#fullInfoModalCloseButton").click();

        toastr.options.closeButton = true;
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 20000;
        toastr.options.progressBar = true;
        toastr.error(e.responseText, "Error!");
    }
};

const changeModeratorStatus = async index => {
    try {
        const user = userList[index];

        const data = {
            userEmail: user.email
        };

        await $.ajax({
            type: "PATCH",
            url: "/resources/change-user-moderator-status",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data)
        });

        toastr.options.closeButton = true;
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 20000;
        toastr.options.progressBar = true;
        toastr.success("The permissions have been updated.", "Success!");

        // Update the data
        fetchUsersData();

    } catch (e) {

        toastr.options.closeButton = true;
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 20000;
        toastr.options.progressBar = true;
        toastr.error(e.responseText, "Error!");

    }
};

