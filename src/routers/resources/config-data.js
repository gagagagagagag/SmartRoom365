const express = require("express");
const fs = require("fs");
const path = require("path");

const { auth } = require("../../middleware/auth");
const { userLogIn, endpointPermissionCheck } = require("../../middleware/userManagement");

// Path to the modules_list.json file
const fileToConfig = path.join(__dirname, "../../../config/modules_list.json");

const router = new express.Router();

router.get("/resources/modules-list", auth, userLogIn, endpointPermissionCheck, (req, res) => {
    try {
        fs.readFile(fileToConfig, (err, data) => {
            if (err){
                throw err;
            }

            res.send(JSON.parse(data));
        });
    } catch(e) {
        console.log(e);
        res.status(400).send("There was an error while reading the config file.");
    }
});

// TODO Add to endpoint json file and documentation

router.get("/resources/modules-list-permitted", auth, userLogIn, endpointPermissionCheck, (req, res) => {
    try {
        const modulesListAll = JSON.parse(fs.readFileSync(fileToConfig).toString());

        if (req.user.owner || req.user.canEditPermissions){
            return res.send(modulesListAll);
        }

        let modulesListPermitted = {
            modules: []
        };

        for (let module of modulesListAll.modules){
            if (!module.permission_required){
                modulesListPermitted.modules.push(module);
                continue;
            }
            for (let userPermittedModule of req.user.permissions){
                if (module.name === userPermittedModule.name && module.uri === userPermittedModule.uri){
                    modulesListPermitted.modules.push(module);
                    break;
                }
            }
        }

        res.send(modulesListPermitted);
    } catch (e) {
        console.log(e);
        res.status(400).send("Error!");
    }
});

module.exports = router;