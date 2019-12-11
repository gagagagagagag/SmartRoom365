const fs = require("fs");
const path = require("path");

const modulesListPath = path.join(__dirname, "/../../config/modules_list.json");

const showPermittedModules = (req, res, next) => {
    const modulesListAll = JSON.parse(fs.readFileSync(modulesListPath).toString());
    const modulesToShow = {};

    // Owner or Moderator can access
    if (req.user.owner || req.user.canEditPermissions){
        for (let module of modulesListAll.modules){
            if (module.show_up_in_search){
                addModuleAndParentToObject(module, modulesToShow);
            }
        }

        req.modulesToShow = modulesToShow;
        return next();
    }

    // Normal user
    for (let module of req.user.permissions){
        // Find the module in the list
        const moduleListObject = modulesListAll.modules.filter(moduleListObject => {
            return module.name === moduleListObject.name;
        });

        // Permission not found error
        if (moduleListObject.length === 0){
            return res.status(400).send("Permission does not match modules.");
        }

        // Add the module and parent
        addModuleAndParentToObject(moduleListObject[0], modulesToShow);
    }
    // Modules with no permission
    for (let module of modulesListAll.modules){
        if (!module.permission_required){
            addModuleAndParentToObject(module, modulesToShow);
        }
    }

    req.modulesToShow = modulesToShow;
    next();
};

const addModuleAndParentToObject = (module, object) => {
    let key = `moduleViewController${module.name.replace(/\s+/g, '')}`;
    object[key] = "list-item";

    // Check if the module has a parent
    if (module.parent){
        key = `moduleViewController${module.parent.replace(/\s+/g, '')}`;
        object[key] = "list-item";
    }
};

module.exports = showPermittedModules;