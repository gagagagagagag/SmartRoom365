let notificationChannels;

// Templates
const notificationChannelToggleTemplateHTML = $("#notification-toggle-template").html();
const notificationChannelToggleTemplate = Handlebars.compile(notificationChannelToggleTemplateHTML);


const getNotificationChannels = async () => {
  try {
      notificationChannels = await $.ajax({
          type: "GET",
          url: "/resources/get-user-notification-channel-list"
      });

      showNotificationChannels();
  } catch (e) {
      console.log(e);
  }
};

const showNotificationChannels = () => {
    const notificationChannelToggleContainer = document.getElementById("notificationChannelToggleContainer");

    // Clear the container
    while (notificationChannelToggleContainer.firstChild){
        notificationChannelToggleContainer.removeChild(notificationChannelToggleContainer.firstChild);
    }

    // User has access to zero notifications
    if (Object.keys(notificationChannels).length === 0){
        $("#notificationChannelChangesButton").prop("disabled", true);
        $(notificationChannelToggleContainer).append('<div class="row"><div class="col-12 text-center mt-5 mb-5">You don\'t have access to any notifications.</div></div>');
        return;
    }

    // Show the channels
    let i = 0;
    for (let channel of Object.keys(notificationChannels)){
        $(notificationChannelToggleContainer).append(notificationChannelToggleTemplate({
            notificationChannelName: channel,
            notificationChannelIndex: i
        }));
        i++;
    }

    // Set up the toggles correctly
    i = 0;
    for (let channel of Object.keys(notificationChannels)){
        $(`#notificationChannelToggle${i}`).prop("checked", notificationChannels[channel]);
        i++;
    }
};

const saveNotificationChannelChanges = async () => {
    // Disable the button
    $("#notificationChannelChangesButton").prop("disabled", true);

    // Gather the data from the site
    let i = 0;
    for (let channel of Object.keys(notificationChannels)){
        notificationChannels[channel] = document.getElementById(`notificationChannelToggle${i}`).checked;
        i++;
    }

    try {
        const data = {
            notificationChannels
        };

        await $.ajax({
            type: "POST",
            url: "/resources/change-notification-channels",
            contentType: "application/json",
            data: JSON.stringify(data)
        });

        toastr.options.closeButton = true;
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 20000;
        toastr.options.progressBar = true;
        toastr.success("The notifications have been updated!", "Success!");

        getNotificationChannels();
    } catch (e) {
        toastr.options.closeButton = true;
        toastr.options.timeOut = 10000;
        toastr.options.extendedTimeOut = 20000;
        toastr.options.progressBar = true;
        toastr.error("There was an error!", "Error!");
    }

    // Enable the button
    $("#notificationChannelChangesButton").prop("disabled", false);
};