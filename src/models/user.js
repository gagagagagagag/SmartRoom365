const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    pictureUrl: {
        type: String,
        trim: true
    },
    owner: {
        type: Boolean,
        required: true
    },
    canEditPermissions: {
        type: Boolean,
        required: true
    },
    permissions: [
        {
            name: {
                type: String,
                required: true,
                trim: true
            },
            uri: {
                type: String,
                required: true,
                trim: true
            }
        }
    ],
    notificationChannels: [String],
    notifications: [
        {

            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification"
        }
    ],
    notificationStates: [
        {
            notificationId: {
                type: mongoose.Schema.Types.ObjectId
            },
            notificationState: {
                type: String,
                required: true,
                trim: true
            }

        }
    ]
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    if (user.admin || user.canEditPermissions){
        user.permissions = [];
    }

    return userObject;
};

userSchema.methods.addNotificationChannel = async function(channel){
    try {
        const user = this;

        user.notificationChannels.push(channel);

        await user.save();
    } catch (e) {
        console.log(e);
    }
};

userSchema.methods.getAllNotifications = async function(){
    const user = this;

    try {

        await user.populate("notifications").execPopulate();

    } catch (e) {
        console.log(e);
    }
};

userSchema.methods.removeANotification = async function(id){
    const user = this;

    try {

        const updatedNotifications = user.notifications.filter(notificationId => {
            return notificationId != id;
        });

        const updatedNotificationStates = user.notificationStates.filter(notificationState => {
            return notificationState.notificationId != id;
        });

        user.notifications = updatedNotifications;
        user.notificationStates = updatedNotificationStates;


        await user.save();

    } catch (e) {
        console.log(e);
    }
};

const User = mongoose.model("User", userSchema);

module.exports = User;