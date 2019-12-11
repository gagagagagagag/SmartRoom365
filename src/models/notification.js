const mongoose = require("mongoose");
const User = require("./user");

const notificationSchema = new mongoose.Schema({
    channel: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    },
    loc: {
        type: String,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

notificationSchema.post("save", async function() {
    const notification = this;

    try {
        const usersListening = await User.find({
            notificationChannels: notification.channel
        });

        for (user of usersListening){
            user.notifications.push({
                _id: notification._id
            });

            user.notificationStates.push({
                notificationId: notification._id,
                notificationState: "Unseen"
            });

            await user.save();
        }
    } catch(e) {
        console.log(e);
    }
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;