document.getElementById("broadcastMessageForm").addEventListener("submit", async e => {
   e.preventDefault();

   console.log('submit');

   const broadcastMessageForm = document.getElementById("broadcastMessageForm");

    $("#announcementSendButton").prop("disabled", true);

   try {
       const data = {
           channel: "Announcements",
           title: broadcastMessageForm.elements["title"].value,
           body: broadcastMessageForm.elements["body"].value,
           loc: "-"
       };

       await $.ajax({
           type: "POST",
           url: "/resources/create-a-notification",
           contentType: "application/json",
           data: JSON.stringify(data)
       });

       toastr.options.closeButton = true;
       toastr.options.timeOut = 10000;
       toastr.options.extendedTimeOut = 20000;
       toastr.options.progressBar = true;
       toastr.success("Announcement sent!", "Success!");

   } catch(e){

       toastr.options.closeButton = true;
       toastr.options.timeOut = 10000;
       toastr.options.extendedTimeOut = 20000;
       toastr.options.progressBar = true;
       toastr.error("There was an error while sending the message!", "Error!");

   }

    broadcastMessageForm.elements["title"].value = "";
    broadcastMessageForm.elements["body"].value = "";

    $("#announcementSendButton").prop("disabled", false);

});