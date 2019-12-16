const http = require("http");
const https = require("https");
const fs = require("fs");
const socketio = require("socket.io");
const express = require("express");
const chalk = require("chalk");
const path = require("path");
const hbs = require("hbs");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const userCostumizedTheme = require("./middleware/themeCostumization");

// Frontend routers
const frontendRouter = require("./routers/general/frontend");

// Endpoint routers
const notificationRouter = require("./routers/resources/notifications");
const configDataRouter = require("./routers/resources/config-data");
const usersRouter = require("./routers/resources/users");
const alarmRouter = require("./routers/resources/alarm");
const lightsRouter = require("./routers/resources/lights");

require("./db/mongoose");

const publicDirPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

const app = express();

const httpServer = http.createServer(app);
const httpsServer = https.createServer({
	key: fs.readFileSync(path.join(__dirname, "./smartroom.key")),
	cert: fs.readFileSync(path.join(__dirname, "./smartroom.crt"))
}, app);

const io = socketio(httpsServer);

app.use(logger(process.env.ENVIRONMENT === "dev" ? "dev" : "tiny"));
app.use(express.json());
app.use(cookieParser());
app.use(function(request, response, next){
	if(!request.secure){
		console.log("https://" + request.headers.host + request.url);
    	response.redirect("https://" + request.headers.host + request.url);
  	} else {
		next();
	}
});
app.use(function(req, res, next) {
    req.io = io;
    next();
})

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
app.use(lightsRouter);

app.get("/*", userCostumizedTheme, (req, res) => {
    res.render("404", {
        // User costumized theme
        ...req.userThemePreferences
    });
});

httpServer.listen(80, process.env.SERVER_IP, () => {
	
});

httpsServer.listen(process.env.PORT, process.env.SERVER_IP, () => {
    console.log();
    console.log(chalk.green("The server is listening on port: " + process.env.PORT));
    console.log();
});
