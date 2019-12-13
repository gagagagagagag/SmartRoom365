const express = require("express");
const { auth } = require("../../middleware/auth");
const { userLogIn, sitePermissionCheck } = require("../../middleware/userManagement");
const showPermittedModules = require("../../middleware/showPermittedModules");
const userCostumizedTheme = require("../../middleware/themeCostumization");

const router = new express.Router();

router.get("/", (req, res) => {
	return res.redirect("/home");
    res.render("login", {
        userLocation: req.query.loc,
        userSignedOut: req.query.signOut ? "userSignedOut" : ""
    });
});

router.get("/home", auth, userLogIn, sitePermissionCheck, showPermittedModules, userCostumizedTheme, (req, res) => {
    res.render("dashboard", {
        dashboard_active: "mm-active",
        // Logged user info
        userName: req.authUserData.name,
        userEmail: req.authUserData.email,
        userPicture: req.authUserData.picture,
        // Notification info
        notificationIndex: "{{notificationIndex}}",
        notificationHeader: "{{notificationHeader}}",
        notificationNewBadge: "{{notificationNewBadge}}",
        notificationBody: "{{notificationBody}}",
        notificationTimeStamp: "{{notificationTimeStamp}}",
        notificationLocation: "{{notificationLocation}}",
        notificationViewButtonDisplay: "{{notificationViewButtonDisplay}}",
        // Side menu modules the user is permitted to show
        ...req.modulesToShow,
        // User costumized theme
        ...req.userThemePreferences
    });
});

router.get("/settings", auth, userLogIn, sitePermissionCheck, showPermittedModules, userCostumizedTheme, (req, res) => {
    res.render("settings", {
        // Logged user info
        userName: req.authUserData.name,
        userEmail: req.authUserData.email,
        userPicture: req.authUserData.picture,
        // Notification info
        notificationIndex: "{{notificationIndex}}",
        notificationHeader: "{{notificationHeader}}",
        notificationNewBadge: "{{notificationNewBadge}}",
        notificationBody: "{{notificationBody}}",
        notificationTimeStamp: "{{notificationTimeStamp}}",
        notificationLocation: "{{notificationLocation}}",
        notificationViewButtonDisplay: "{{notificationViewButtonDisplay}}",
        // User info
        isOwner: req.user.owner,
        isModerator: req.user.canEditPermissions,
        // Allow handlebars client to work
        userPhotoLink: "{{userPhotoLink}}",
        userNameList: "{{userNameList}}",
        userEmailList: "{{userEmailList}}",
        userCredsBadge: "{{userCredsBadge}}",
        userCredsName: "{{userCredsName}}",
        userIndex: "{{userIndex}}",
        userManagePermissionsDisabled: "{{userManagePermissionsDisabled}}",
        moduleName: "{{moduleName}}",
        moduleStatusClass: "{{moduleStatusClass}}",
        userModeratorDisplay: "{{userModeratorDisplay}}",
        userModeratorButtonClass: "{{userModeratorButtonClass}}",
        userModeratorTooltipTitle: "{{userModeratorTooltipTitle}}",
        userModeratorIconClassDirection: "{{userModeratorIconClassDirection}}",
        notificationChannelName: "{{notificationChannelName}}",
        notificationChannelIndex: "{{notificationChannelIndex}}",
        // Side menu modules the user is permitted to show
        ...req.modulesToShow,
        // User costumized theme
        ...req.userThemePreferences
    });
});

router.get("/profile", auth, userLogIn, sitePermissionCheck, showPermittedModules, userCostumizedTheme, (req, res) => {
    res.render("profile", {
        // Logged user info
        userName: req.authUserData.name,
        userEmail: req.authUserData.email,
        userPicture: req.authUserData.picture,
        // Notification info
        notificationIndex: "{{notificationIndex}}",
        notificationHeader: "{{notificationHeader}}",
        notificationNewBadge: "{{notificationNewBadge}}",
        notificationBody: "{{notificationBody}}",
        notificationTimeStamp: "{{notificationTimeStamp}}",
        notificationLocation: "{{notificationLocation}}",
        notificationViewButtonDisplay: "{{notificationViewButtonDisplay}}",
        // Side menu modules the user is permitted to show
        ...req.modulesToShow,
        // User costumized theme
        ...req.userThemePreferences,
        // Allow Frontend Handlebars to work
        additionalFieldIndex: "{{additionalFieldIndex}}",
        additionalFieldLabel: "{{additionalFieldLabel}}",
        additionalFieldType: "{{additionalFieldType}}",
        additionalFieldRequiredLabel: "{{additionalFieldRequiredLabel}}"
    })
});

router.get("/contract-draft", auth, userLogIn, sitePermissionCheck, showPermittedModules, userCostumizedTheme, (req, res) => {
    res.render("draftContract", {
        contracts_active: "mm-active",
        // Logged user info
        userName: req.authUserData.name,
        userEmail: req.authUserData.email,
        userPicture: req.authUserData.picture,
        // Notification info
        notificationIndex: "{{notificationIndex}}",
        notificationHeader: "{{notificationHeader}}",
        notificationNewBadge: "{{notificationNewBadge}}",
        notificationBody: "{{notificationBody}}",
        notificationTimeStamp: "{{notificationTimeStamp}}",
        notificationLocation: "{{notificationLocation}}",
        notificationViewButtonDisplay: "{{notificationViewButtonDisplay}}",
        // Side menu modules the user is permitted to show
        ...req.modulesToShow,
        // User costumized theme
        ...req.userThemePreferences
    });
});

router.get("/broadcast-message", auth, userLogIn, sitePermissionCheck, showPermittedModules, userCostumizedTheme, (req, res) => {
    res.render("broadcastMessage", {
        broadcastmessage_active: "mm-active",
        // Logged user info
        userName: req.authUserData.name,
        userEmail: req.authUserData.email,
        userPicture: req.authUserData.picture,
        // Notification info
        notificationIndex: "{{notificationIndex}}",
        notificationHeader: "{{notificationHeader}}",
        notificationNewBadge: "{{notificationNewBadge}}",
        notificationBody: "{{notificationBody}}",
        notificationTimeStamp: "{{notificationTimeStamp}}",
        notificationLocation: "{{notificationLocation}}",
        notificationViewButtonDisplay: "{{notificationViewButtonDisplay}}",
        // Side menu modules the user is permitted to show
        ...req.modulesToShow,
        // User costumized theme
        ...req.userThemePreferences
    });
});

router.get("/alarm", auth, userLogIn, sitePermissionCheck, showPermittedModules, userCostumizedTheme, (req, res) => {
    res.render("alarm", {
        alarm_active: "mm-active",
        // Logged user info
        userName: req.authUserData.name,
        userEmail: req.authUserData.email,
        userPicture: req.authUserData.picture,
        // Notification info
        notificationIndex: "{{notificationIndex}}",
        notificationHeader: "{{notificationHeader}}",
        notificationNewBadge: "{{notificationNewBadge}}",
        notificationBody: "{{notificationBody}}",
        notificationTimeStamp: "{{notificationTimeStamp}}",
        notificationLocation: "{{notificationLocation}}",
        notificationViewButtonDisplay: "{{notificationViewButtonDisplay}}",
        // Side menu modules the user is permitted to show
        ...req.modulesToShow,
        // User costumized theme
        ...req.userThemePreferences,
        // Allow handlebars client to work
        alarmListIndex: "{{alarmListIndex}}",
        alarmListName: "{{alarmListName}}",
        alarmListHour: "{{alarmListHour}}",
        alarmListRepeatClass: "{{alarmListRepeatClass}}",
        alarmListRepeatText: "{{alarmListRepeatText}}",
        alarmListID: "{{alarmListID}}"
    });
});

module.exports = router;
