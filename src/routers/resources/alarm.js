const express = require("express");
const fs = require("fs");
const path = require("path");
const Alarm = require("../../models/alarm");

const { auth } = require("../../middleware/auth");
const { userLogIn, endpointPermissionCheck } = require("../../middleware/userManagement");

const { getActiveAlarm, stopTheAlarm, changeTheLightStatus, getTheLightStatus } = require("../../utils/systemControlls");

const router = new express.Router();

router.post("/resources/set-a-new-alarm", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        console.log(req.body);

        const newAlarm = new Alarm(req.body);

        await newAlarm.save();

        res.send();
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.get("/resources/get-all-alarms", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
   try {
       const allAlarms = await Alarm.find({}).sort({date: "ascending"});

       res.send(allAlarms);
   } catch (e) {
       console.log(e);
       res.status(500).send();
   }
});

// in req body: id and new status
router.post("/resources/change-alarm-active-status", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        const alarm = await Alarm.findOne({_id: req.body.id});

        alarm.active = !alarm.active;

        await alarm.save();

        res.send(201);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.get("/resources/get-ringing-alarm", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        res.send(getActiveAlarm());
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.post("/resources/stop-ringing-alarm", auth, userLogIn, endpointPermissionCheck, (req, res) => {
    if (stopTheAlarm() === -1) {
        res.send(false);
    } else {
        res.send(true);
    }
});

router.post("/resources/change-the-light-status", auth, userLogIn, endpointPermissionCheck, (req, res) => {
    changeTheLightStatus(req.body.newStatus);

    res.send();
});

router.get("/resources/get-the-light-status", auth, userLogIn, endpointPermissionCheck, (req, res) => {
    res.send(getTheLightStatus());
});

module.exports = router;
