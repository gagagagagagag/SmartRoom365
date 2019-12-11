const express = require("express");
const chalk = require("chalk");
const path = require("path");
const hbs = require("hbs");
const logger = require('morgan');
const cookieParser = require("cookie-parser");
const userCostumizedTheme = require("./middleware/themeCostumization");

// Frontend routers
const frontendRouter = require("./routers/general/frontend");

// Endpoint routers
const notificationRouter = require("./routers/resources/notifications");
const configDataRouter = require("./routers/resources/config-data");
const usersRouter = require("./routers/resources/users");
const alarmRouter = require("./routers/resources/alarm");

require("./db/mongoose");

const publicDirPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicDirPath));

// Frontend Routers
app.use(frontendRouter);

// Endpoint Routers
app.use(notificationRouter);
app.use(configDataRouter);
app.use(usersRouter);
app.use(alarmRouter);

app.get("/*", userCostumizedTheme, (req, res) => {
    res.render("404", {
        // User costumized theme
        ...req.userThemePreferences
    });
});

app.listen(process.env.PORT, () => {
    console.log();
    console.log(chalk.green("The server is listening on port: " + process.env.PORT));
    console.log();
});