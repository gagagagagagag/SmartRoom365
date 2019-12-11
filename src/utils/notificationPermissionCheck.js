const path = require("path");
const fs = require("fs");

const notificationChannelsListPath = path.join(__dirname, "../../config/notification_channels.json");

const notificationPermissionCheck = (channel, user) => {
    // Check if the user is the owner
    if (user.owner){
        return true;
    }

    const notificationListFile = fs.readFileSync(notificationChannelsListPath);
    const notificationListJSON = JSON.parse(notificationListFile);

    const thisChannel = notificationListJSON[channel];

    // Check if the endpoint requires permission
    if (thisChannel.length === 0){
        return true;
    }

    // Check if the endpoint is available for the moderator
    if (thisChannel[0] !== "******" && user.canEditPermissions) {
        return true;
    }

    let canPass = false;

    loop1: for (let module of thisChannel){
        for (let permission of user.permissions){

            if (module.toLowerCase() === permission.name.toLowerCase()){
                canPass = true;
                break loop1;
            }

        }
    }

    return canPass;
};

const readNotificationChannelList = user => {
    // Read in the list
    const notificationListFile = fs.readFileSync(notificationChannelsListPath);
    const notificationListJSON = JSON.parse(notificationListFile);

    if (user.owner){
        for (let channel of Object.keys(notificationListJSON)) {
            // If the user has the channel set the channel to true, else set it to false
            notificationListJSON[channel] = user.notificationChannels.includes(channel);
        }

        return notificationListJSON;
    }

    loop1: for (let channel of Object.keys(notificationListJSON)) {
        // Check if the user is allowed to access this channel
        if (notificationListJSON[channel].length === 0){
            continue;
        }
        // Moderator can access
        if (channel[0] !== "******" && user.canEditPermissions) {
            continue;
        }
        // User can access
        for (let permission of user.permissions){
            if (permission.name === channel[0]){
                continue loop1;
            }
        }

        // Still in the loop, the channel is not permitted
        delete notificationListJSON[channel];
    }

    // List of permitted channels acquired, now check if subscribed
    for (let channel of Object.keys(notificationListJSON)) {
        // If the user has the channel set the channel to true, else set it to false
        notificationListJSON[channel] = user.notificationChannels.includes(channel);
    }

    return notificationListJSON;
};

module.exports = {
    notificationPermissionCheck,
    readNotificationChannelList
};