const dataForNewCookie = {};

const checkCurrentTheme = () => {
    const mainAppContainer = document.querySelector("#mainAppContainer");

    // Header
    $('#checkedFixedHeader').prop('checked', mainAppContainer.classList.value.includes("fixed-header"));

    // Sidebar
    $('#checkedFixedSidebar').prop('checked', mainAppContainer.classList.value.includes("fixed-sidebar"));

    // Footer
    $('#checkedFixedFooter').prop('checked', mainAppContainer.classList.value.includes("fixed-footer"));
};

// Change of header
document.getElementById("checkedFixedHeader").addEventListener("click", e => {
    dataForNewCookie.fixedHeader = e.target.checked ? "fixed-header" : "";
});

// Change of sidebar
document.getElementById("checkedFixedSidebar").addEventListener("click", e => {
    dataForNewCookie.fixedSidebar = e.target.checked ? "fixed-sidebar" : "";
});

// Change of footer
document.getElementById("checkedFixedFooter").addEventListener("click", e => {
    dataForNewCookie.fixedFooter = e.target.checked ? "fixed-footer" : "";
});

const headerThemeChange = () => {
    const headerClassList = document.getElementById("headerContainer").classList;

    console.log(`${headerClassList[2]} ${headerClassList[3]}`);
    dataForNewCookie.headerColorClass = `${headerClassList[2]} ${headerClassList[3]}`;
};

const sidebarThemeChange = () => {
    const sidebarClassList = document.getElementById("sidebarContainer").classList;
    dataForNewCookie.sidebarColorClass = `${sidebarClassList[2]} ${sidebarClassList[3]}`;
};

const headerDefault = () => {
    dataForNewCookie.headerColorClass = "";
};

const sidebarDefault = () => {
    dataForNewCookie.sidebarColorClass = "";
};

const changeTheCookies = async () => {
    document.getElementById("saveChangesButton").setAttribute("disabled", true);

    try {
        await $.ajax({
            type: "PATCH",
            url: "/resources/update-jwt-with-theme-preferences",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(dataForNewCookie)
        });

        document.getElementById("saveChangesButton").removeAttribute("disabled");

        toastr.options.closeButton = true;
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 20000;
        toastr.options.progressBar = true;
        toastr.success("The theme has been updated!", "Success!");

    } catch (e) {
        console.log(e);
    }
};

checkCurrentTheme();