const express = require("express");
const Notification = require("../../models/notification");
const { notificationPermissionCheck, readNotificationChannelList } = require("../../utils/notificationPermissionCheck");

const { auth } = require("../../middleware/auth");
const { userLogIn, endpointPermissionCheck } = require("../../middleware/userManagement");

const router = new express.Router();

router.post("/resources/create-a-notification", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        const notification = new Notification({
            channel: req.body.channel,
            title: req.body.title,
            body: req.body.body,
            loc: req.body.loc
        });

        await notification.save();

        res.send("Success!");
    } catch (e) {
        console.log(e);
    }
});

router.post("/resources/add-a-notification-channel", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        if (notificationPermissionCheck(req.body.channel, req.user)){
            await user.addNotificationChannel(req.body.channel);

            res.status(200).send("Success!");
        } else {
            res.status(400).send();
        }
    } catch (e) {
        res.status(400).send();
    }
});

router.post("/resources/change-notification-channels", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
   try {
       // Clear the channels
       req.user.notificationChannels = [];

       for (let channel of Object.keys(req.body.notificationChannels)){
           if (req.body.notificationChannels[channel]){
               if (notificationPermissionCheck(channel, req.user)){
                   req.user.notificationChannels.push(channel);
               }
           }
       }

       await req.user.save();

       res.send({
           message: "Success!"
       });
   } catch (e) {
       console.log(e);
       res.status(400).send();
   }
});

router.post("/resources/quick-check-if-notifications-up-to-date", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        let notificationRefresh = req.body.notificationsCount !== req.user.notifications.length;

        res.send({
            notificationRefresh
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.get("/resources/get-all-my-notifications", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {

        await req.user.getAllNotifications();

        res.send({
            notifications: req.user.notifications,
            notificationStates: req.user.notificationStates
        });

    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
});

router.post("/resources/all-notifications-seen", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        req.user.notificationStates.forEach(notification => {
            notification.notificationState = "Seen";
        });

        await req.user.save();

        res.send({
            message: "Success!"
        });
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
});

router.post("/resources/set-notification-as-seen", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        const notificationToUpdate = req.user.notificationStates.forEach(notification => {
            if(notification.notificationId == req.body.id){
                notification.notificationState = "Seen";
            }
        });

        await req.user.save();

        res.send();
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
});

router.delete("/resources/remove-a-notification-from-user", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {

        await req.user.removeANotification(req.body.id);

        res.send({
            message: "Success!"
        });
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
});

router.delete("/resources/remove-all-notifications-from-user", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        req.user.notifications = [];
        req.user.notificationStates = [];

        await req.user.save();

        res.send({
            message: "Success!"
        });
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
});

router.get("/resources/get-user-notification-channel-list", auth, userLogIn, endpointPermissionCheck, (req, res) => {
    try {
        const channels = readNotificationChannelList(req.user);

        res.send(channels);
    } catch(e){
        console.log(e);
        res.status(400).send();
    }
});

module.exports = router;

