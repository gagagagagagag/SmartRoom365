const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");

const { auth } = require("../../middleware/auth");
const { userLogIn, endpointPermissionCheck } = require("../../middleware/userManagement");

const router = new express.Router();

router.get("/resources/get-all-users", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        const userList = await User.find();

        // Sort the users

        // Add status weights to make the sorting easier
        for (let i = 0; i < userList.length; i++){
            if (userList[i].owner){
                userList[i].statusWeight = 1;
            } else if (userList[i].canEditPermissions){
                userList[i].statusWeight = 2;
            } else {
                userList[i].statusWeight = 3;
            }
        }

        // Insertion sort
        for (let i = 1; i < userList.length; i++){
            let j = i;
            while (j > 0 && userList[j - 1].statusWeight > userList[j].statusWeight){
                let temp = userList[j - 1];
                userList[j - 1] = userList[j];
                userList[j] = temp;
                j -= 1;
            }
        }

        // Remove the status weights
        for (let user of userList){
            delete user.statusWeight;
        }

        res.send(userList);
    } catch (e) {
        console.log(e);
        res.status(400).send("There was an error while getting the user list");
    }
});

router.post("/resources/get-email-from-user-id", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        const userEmail = await User.findOne({
            _id: req.body.id
        }, "email");

        res.send(userEmail);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.get("/resources/get-all-users-email-and-id", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        const allUsers = await User.find({}, "_id email");

        res.send(allUsers);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.patch("/resources/update-user-permissions", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.userEmail
        });

        if (user.admin || user.canEditPermissions){
            return res.status(400).send("Owner and moderators can not be modified.");
        }

        user.permissions = req.body.newPermissionsSet;

        await user.save();

        res.status(202).send({
            message: "Success!"
        });
    } catch (e) {
        console.log(e);
        res.status(400).send("Error!");
    }
});

router.patch("/resources/change-user-moderator-status", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.userEmail
        });

        if (user.admin){
            return res.status(400).send("The Owner can not be modified.");
        }

        user.canEditPermissions = !user.canEditPermissions;

        await user.save();

        res.status(202).send({
            message: "Success!"
        });
    } catch (e) {
        console.log(e);
        res.status(400).send("Error!");
    }
});

router.get("/resources/get-logged-in-users-status", auth, userLogIn, endpointPermissionCheck, (req, res) => {
    let userStatus;
    if (req.user.owner){
        userStatus = "Owner";
    } else if (req.user.canEditPermissions){
        userStatus = "Moderator";
    } else {
        userStatus = "User";
    }

    res.send({
        userStatus
    });
});

router.patch("/resources/update-jwt-with-theme-preferences", auth, userLogIn, endpointPermissionCheck, (req, res) => {

    try {
        // Get the previous cookie
        const prevToken = req.cookies.themeOptions;

        const oldPayload = jwt.decode(prevToken, process.env.JWT_SECRET);

        const payload = {
            fixedHeader: req.body.fixedHeader === undefined ? oldPayload.fixedHeader : req.body.fixedHeader,
            fixedSidebar: req.body.fixedSidebar === undefined ? oldPayload.fixedSidebar : req.body.fixedSidebar,
            fixedFooter: req.body.fixedFooter === undefined ? oldPayload.fixedFooter : req.body.fixedFooter,
            headerColorClass: req.body.headerColorClass === undefined ? oldPayload.headerColorClass : req.body.headerColorClass,
            sidebarColorClass: req.body.sidebarColorClass === undefined ? oldPayload.sidebarColorClass : req.body.sidebarColorClass
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.cookie('themeOptions', token, {maxAge: 1000 * 60 * 60 * 24 * 365 * 10, httpOnly: true});

        res.status(202).send({
            message: "Success!"
        });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

module.exports = router;