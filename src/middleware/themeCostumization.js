const jwt = require("jsonwebtoken");

const userCostumizedTheme = (req, res, next) => {
    try {
        const preferences = jwt.decode(req.cookies.themeOptions, process.env.JWT_SECRET);

        delete preferences.iat;

        req.userThemePreferences = preferences;

        next();
    } catch (e) {
        next();
    }
};

module.exports = userCostumizedTheme;