// Templates
const forminputSelectTemplateHTML = $("#forminput-select-template").html();
const forminputSelectTemplate = Handlebars.compile(forminputSelectTemplateHTML);


const forminputSelectMultipleTemplateHTML = $("#forminput-select-multiple-template").html();
const forminputSelectMultipleTemplate = Handlebars.compile(forminputSelectMultipleTemplateHTML);


const forminputInputTemplateHTML = $("#forminput-input-template").html();
const forminputInputTemplate = Handlebars.compile(forminputInputTemplateHTML);

let dbFields;

const checkIfTheUserAlreadyUsedOnboarding = async () => {
    try {
        const { hasEmployee } = await $.ajax({
            type: "GET",
            url: "/resources/check-if-user-has-employee"
        });

        // The user has an employee, so he can't do onboarding anymore
        if (hasEmployee) {
            // $("#onboardingCard").addClass("d-none");
            // $("#onboardingNotAccessable").removeClass("d-none");
            return true;
        } else {
            return false;
        }
    } catch (e) {
        showErrorMessage("Error!", "There was an error loading the page, please try again.");
        return true;
    }
};

const redirectToOnboarding = () => {
    // Hide the profile card
    $("#viewProfileCard").addClass("d-none");
    // Show the redirect card
    $("#redirectToOnboardingCard").removeClass("d-none");
};

const prepareTheProfilePage = async () => {
    try {

        const hasEmployee = await checkIfTheUserAlreadyUsedOnboarding();

        if (!hasEmployee){
            return redirectToOnboarding();
        }

        await showEmployeeFullInfo();

        // Stop loading the page
        stopLoadingPage();
    } catch (e) {
        console.log(e);
    }
};

const showEmployeeFullInfo = async id => {
    try {

        employeeFullInfo = await getFullInfoAboutUsersEmployee(id);

        dbFields = await getDatabaseFields();

        // Fill out the basic fields
        $("#workerAddress").val(employeeFullInfo.address);

        // Clear the container
        $("#databaseAdditionalFieldsProfileContainer").empty();

        // Additional fields
        let i = 0;
        for (let dbField of dbFields){

            if (dbField === null){
                i++;
                continue;
            }

            if (dbField.field_input_type === "Select"){
                // Add the select
                $("#databaseAdditionalFieldsProfileContainer").append(forminputSelectTemplate({
                    additionalFieldIndex: i,
                    additionalFieldLabel: dbField.name,
                    additionalFieldRequiredLabel: dbField.field_required ? "*" : ""
                }));

                // Add the options to the select
                const options = dbField.field_select_options.split(";");

                for (let option of options){
                    $(`#additionalFieldProfile${i}`).append(`<option value='${option.trim()}'>${option.trim()}</option>`);
                }

                // Select the right option
                $(`#additionalFieldProfile${i}`).val(employeeFullInfo.additionalFields[i]);

            } else if (dbField.field_input_type === "Select Multiple"){
                // Add the select multiple
                $("#databaseAdditionalFieldsProfileContainer").append(forminputSelectMultipleTemplate({
                    additionalFieldIndex: i,
                    additionalFieldLabel: dbField.name,
                    additionalFieldRequiredLabel: dbField.field_required ? "*" : ""
                }));

                // Add the options to the select
                const options = dbField.field_select_options.split(";");

                for (let option of options){
                    $(`#additionalFieldProfile${i}`).append(`<option value='${option.trim()}'>${option.trim()}</option>`);
                }

                // Select the right option
                const selectedValues = employeeFullInfo.additionalFields[i].split(",");
                $(`#additionalFieldProfile${i}`).val(selectedValues);
            } else {
                // Add the input
                $("#databaseAdditionalFieldsProfileContainer").append(forminputInputTemplate({
                    additionalFieldIndex: i,
                    additionalFieldLabel: dbField.name,
                    additionalFieldRequiredLabel: dbField.field_required ? "*" : "",
                    additionalFieldType: dbField.field_input_type
                }));

                $(`#additionalFieldProfile${i}`).val(employeeFullInfo.additionalFields[i]);
            }
            i++;
        }

    } catch (e) {
        console.log(e);
    }
};

const editFormSubmitted = async (e) => {
    e.preventDefault();

    $(".edit-buttons").prop("disabled", true);

    try {
        const data = {
            address: $("#workerAddress").val(),
            additionalFields: []
        };

        for (let i = 0; i < dbFields.length; i++){
            if ($(`#additionalFieldProfile${i}`).length) {
                data.additionalFields[i] = $(`#additionalFieldProfile${i}`).val();
            }
        }

        // Get rid of null and undefined
        data.additionalFields.forEach(field => {
            if (field === null || field === undefined){
                field = "";
            }
        });

        // Send data
        await $.ajax({
            type: "PATCH",
            url: "/resources/update-users-employee-fields",
            contentType: "application/json",
            data: JSON.stringify(data)
        });

        // Data changed successfully
        showSuccessMessage("Success!", "The data has been updated.");
        cancelEditing();
        $(".edit-buttons").prop("disabled", true);

    } catch (e) {
        console.log(e);
        // Show error
        showErrorMessage("Error!", "Someting went wrong, please try again.");
        $(".edit-buttons").prop("disabled", true);
    }
};

const startEditing = () => {
    // Hide the start edit button
    $("#startEditButton").addClass("d-none");
    // Show the editing buttons
    $(".edit-buttons").removeClass("d-none");

    // Undisable the inputs
    $(".editable").prop("disabled", false);
};

const cancelEditing = () => {
    // Show the start edit button
    $("#startEditButton").removeClass("d-none");
    // Hide the editing buttons
    $(".edit-buttons").addClass("d-none");

    // Disable the inputs
    $(".editable").prop("disabled", true);

    // Show the loading page
    startLoadingPage();

    // Refresh the data
    prepareTheProfilePage();
};

const getDatabaseFields = async () => {
    try {
        return $.ajax({
            type: "GET",
            url: "/resources/get-only-user-provided-fields"
        });
    } catch (e) {
        console.log(e);
        return undefined;
    }
};

const getFullInfoAboutUsersEmployee = id => {
    try {
        return $.ajax({
            type: "GET",
            url: "/resources/get-full-info-about-users-employee"
        });
    } catch (e) {
        console.log(e);
    }
};

const stopLoadingPage = () => {
    $("#profileCardLoader").removeClass("d-flex").addClass("d-none");
    $("#profileForm").removeClass("d-none");
};

const startLoadingPage = () => {
    $("#profileForm").addClass("d-none");
    $("#profileCardLoader").removeClass("d-none").addClass("d-flex");
};

$("#profileForm").on("submit", editFormSubmitted);

prepareTheProfilePage();