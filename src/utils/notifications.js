const Notification = require("../models/notification");

const createANotification = async (channel, title, body, loc) => {
    if (!channel || !title || !body || !loc){
        return false;
    }

    // TODO Check if the channel is correct with the JSON file

    try {
        const notification = new Notification({
            channel,
            title,
            body,
            loc
        });

        await notification.save();
    } catch (e) {
        console.log(e);
        return false;
    }
};

module.exports = createANotification;