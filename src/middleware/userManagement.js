const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const User = require("../models/user");
const initialiseThemeCookie = require("../utils/themeCookie");

const modulesListPath = path.join(__dirname, "/../../config/modules_list.json");
const endpointsListPath = path.join(__dirname, "/../../config/endpoints_list.json");

const userLogIn = async (req, res, next) => {
    try {
        const match = {};

        // Set the match email to the users email
        match.email = req.authUserData.email;

        // Find the user in the db
        let user;
        user = await User.findOne(match);

        if (!user) {
            // New user
            user = new User({
                name: req.authUserData.name,
                email: req.authUserData.email,
                pictureUrl: req.authUserData.picture,
                owner: false,
                canEditPermissions: false,
                permissions: []
            });

            await user.save();
        }

        // Adding theme cookie
        if (!req.cookies.themeOptions) {
            const token = initialiseThemeCookie();
            res.cookie('themeOptions', token, {maxAge: 1000*60*60*24*365*10, httpOnly: true});
            req.cookies.themeOptions = token;
        }

        req.user = user;

        next();

    } catch (e) {
        console.log(e);
    }
};

const endpointPermissionCheck = (req, res, next) => {
    try {
        const user = req.user;

        // Check if the user is the owner
        if (user.owner) {
            return next();
        }

        // Get the endpoint data
        const endpointsListFile = fs.readFileSync(endpointsListPath);
        const endpointsListJSON = JSON.parse(endpointsListFile);

        const thisEndpoint = endpointsListJSON[req.route.path];

        // Check if the endpoint requires permission
        if (thisEndpoint.length === 0){
            return next();
        }

        // Check if the endpoint is available for the moderator
        if (thisEndpoint[0] !== "******" && user.canEditPermissions) {
            return next();
        }

        // Check if the user has the permission to use this endpoint
        let canPass = false;

        loop1: for (let module of thisEndpoint){
            for (let permission of user.permissions){

                if (module.toLowerCase() === permission.name.toLowerCase()){
                    canPass = true;
                    break loop1;
                }

            }
        }

        if (canPass){
            next();
        } else {
            res.status(401).send("You are not authorised to use this endpoint.");
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("Error");
    }
};

const sitePermissionCheck = (req, res, next) => {
    try {
        const user = req.user;

        // Check if the user is the owner or the moderator
        if (user.owner || user.canEditPermissions) {
            return next();
        }

        // Check if the site requires permission
        let modulesListFile = fs.readFileSync(modulesListPath).toString();
        const modulesListJSON = JSON.parse(modulesListFile);

        for (let module of modulesListJSON.modules){
            if (module.uri === req.route.path && !module.permission_required) {
                return next();
            }
        }

        // Check if the user is allowed access to this site
        const permissionsMatches = user.permissions.filter(permission => {
            return permission.uri === req.route.path;
        });

        // If matches array contains elements, the user has permission to access this site
        if (permissionsMatches.length < 1){
            return res.status(401).send("You are not authorised to access this site.");
        }

        // Pass the data along and allow the access
        next();
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    userLogIn,
    sitePermissionCheck,
    endpointPermissionCheck
};