const socketInfo = io();

// Templates
const notificationTemplateHTML = $("#notification-template").html();
const notificationTemplate = Handlebars.compile(notificationTemplateHTML);

const notificationCountElement = document.getElementById("notificationCount");
let notifications;
let notificationsCount;

const getNotificationList = async () => {
    try {
        notifications = await $.ajax({
            type: "GET",
            url: "/resources/get-all-my-notifications"
        });

        showNotifications(notifications);
    } catch (e) {
        console.log(e);
    }
};

const notificationUpdateQuickCheck = async () => {
    try {
        const { notificationRefresh } = await $.ajax({
            type: "POST",
            url: "/resources/quick-check-if-notifications-up-to-date",
            contentType: "application/json",
            data: JSON.stringify({
                notificationsCount
            })
        });

        // There are new notifications, refresh
        if (notificationRefresh) {
            await getNotificationList();

            // Play notification sound
            const notificationSound = new Audio('./assets/audio/notification-sound.mp3');
            notificationSound.volume = 0.7;
            notificationSound.play();
        }
    } catch (e) {
        console.log(e);
    }
};

const showNotifications = notifications => {
    const notificationContainer = document.getElementById("notificationContainer");
    // Clear notifications
    while (notificationContainer.firstChild){
        notificationContainer.removeChild(notificationContainer.firstChild);
    }

    // Get the new notification count
    let unseenCount = 0;
    notifications.notificationStates.forEach(notification => {
        if (notification.notificationState === "Unseen"){
            unseenCount++;
        }
    });

    // Show notification count
    setNotificationCount(unseenCount);

    // Count of all notifications
    notificationsCount = notifications.notifications.length;

    if (notifications.notifications.length === 0){
        // No notifications to show
        $(notificationContainer).append('<span class="dropdown-item-text"><i class="fas fa-eye-slash mr-2"></i>Nothing to see here.</span>');
        return;
    }

    if (unseenCount > 0) {
        // Show animation
        const notificationBellIcon = document.getElementById("notificationBellIcon");
        notificationBellIcon.classList.add("animated", "tada", "notification-badge");
    }

    for (let i = notifications.notifications.length - 1; i >= 0; i--){
        // Show new notifications
        $(notificationContainer).append(notificationTemplate({
            notificationIndex: i,
            notificationHeader: notifications.notifications[i].title,
            notificationNewBadge: notifications.notificationStates[i].notificationState === "Unseen" ? 'inline-block' : 'none',
            notificationBody: notifications.notifications[i].body,
            notificationTimeStamp: moment(notifications.notifications[i].created_at).fromNow(),
            notificationViewButtonDisplay: notifications.notifications[i].loc === "-" ? "none" : "flex"
        }));
    }

    $(notificationContainer).append('<a class="dropdown-item text-right text-danger mb-1" href="javascript:void(0)" onclick="removeAllNotifications()"><i class="fas fa-trash mr-2"></i>Remove all</a>');
};

const updateNotificationTimes = () => {
    const timestamps = document.querySelectorAll(".notification-timestamp");

    for (let i = timestamps.length - 1; i >= 0; i--){
        timestamps[timestamps.length - i - 1].innerText = moment(notifications.notifications[i].created_at).fromNow();
    }
};

const openNotification = async index => {
    try {

        if (notifications.notificationStates[index].notificationState === "Unseen") {

            const data = {
                id: notifications.notifications[index]._id
            };

            await $.ajax({
                type: "POST",
                url: "/resources/set-notification-as-seen",
                contentType: "application/json",
                data: JSON.stringify(data)
            });
        }

        window.location = notifications.notifications[index].loc;
    } catch(e) {
        console.log(e);
    }
};

const notificationCountIncrement = () => {
    const newValue = parseInt(notificationCountElement.innerText) + 1;

    if (newValue > 0){
        // Show the element
        notificationCountElement.style.display = "inline-block";
    }

    notificationCountElement.innerText = `${newValue}`;
};

const notificationCountDecrement = () => {
    const newValue = parseInt(notificationCountElement.innerText) - 1;

    if (newValue === 0){
        // Hide the element
        notificationCountElement.style.display = "none";
    }

    notificationCountElement.innerText = `${newValue}`;
};

const setNotificationCount = count => {
    if (count === 0){
        // Hide the element
        notificationCountElement.style.display = "none";
    } else {
        // Show the element
        notificationCountElement.style.display = "inline-block";
    }

    notificationCountElement.innerText = `${count}`;
};

const notificationRemove = async index => {
    const notification = document.getElementById(`notificationContainer${index}`);
    const notificationContainer = document.getElementById("notificationContainer");

    notification.classList.add("animated", "fadeOutRight");

    notificationsCount--;

    notification.addEventListener('animationend', () => {
        notificationContainer.removeChild(notification);

        if (notificationsCount === 0){
            // No more notifications
            const notificationContainer = document.getElementById("notificationContainer");
            // Clear notifications
            while (notificationContainer.firstChild){
                notificationContainer.removeChild(notificationContainer.firstChild);
            }

            $(notificationContainer).append('<span class="dropdown-item-text"><i class="fas fa-eye-slash mr-2"></i>Nothing to see here.</span>');
        }
    });

    try {
        const data = {
            id: notifications.notifications[index]._id
        };

        await $.ajax({
            type: "DELETE",
            url: "/resources/remove-a-notification-from-user",
            contentType: "application/json",
            data: JSON.stringify(data)
        });

    } catch (e) {
        console.log(e);
    }

    if (notifications.notificationStates[index].notificationState === "Unseen"){
        notificationCountDecrement();
    }

    // Leave the spot in the array empty but make it undefined
    notifications.notificationStates[index] = undefined;
    notifications.notifications[index] = undefined;
};

const removeAllNotifications = async () => {

    notificationsCount = 0;

    let listenerSetup = false;
    for (let i = 0; i < notifications.notifications.length; i++){
        if (!notifications.notifications[i]){
            continue;
        }

        document.getElementById(`notificationContainer${i}`).classList.add("animated", "zoomOut");

        if (!listenerSetup){
            document.getElementById(`notificationContainer${i}`).addEventListener("animationend", () => {
                const notificationContainer = document.getElementById("notificationContainer");
                // Clear notifications
                while (notificationContainer.firstChild){
                    notificationContainer.removeChild(notificationContainer.firstChild);
                }

                $(notificationContainer).append('<span class="dropdown-item-text"><i class="fas fa-eye-slash mr-2"></i>Nothing to see here.</span>');
            });
            // In order to set up just one listener
            listenerSetup = true;
        }
    }

    setNotificationCount(0);

    try {
        await $.ajax({
            type: "DELETE",
            url: "/resources/remove-all-notifications-from-user"
        });

    } catch (e) {
        console.log(e);
    }
};

// Update time stamps on notifications every minute
setInterval(updateNotificationTimes, 1000 * 60);

// Check for new notifications every 10s
// TODO Sockets for updating notification info
// setInterval(notificationUpdateQuickCheck, 1000 * 10);

socketInfo.on("notification", () => {
	notificationUpdateQuickCheck();
});

getNotificationList();
