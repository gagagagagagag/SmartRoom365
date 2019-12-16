const express = require("express");
const http = require("http");

const { auth } = require("../../middleware/auth");
const { userLogIn, endpointPermissionCheck } = require("../../middleware/userManagement");

const { changeTheLightStatus, getTheLightStatus } = require("../../utils/systemControlls");

const router = new express.Router();

router.post("/resources/change-the-light-status", auth, userLogIn, endpointPermissionCheck, (req, res) => {
    if (req.body.lightID === 0 || req.body.lightID === 1 || req.body.lightID === 2) {
        const flag = req.body.lightID === 0 ? "f" : (req.body.lightID === 1 ? "s" : "t");
        let firstPacket = true;
        http.get(`http://192.168.8.3?lights=${flag}`, resp => {
            resp.on("data", chunk => {
                if (firstPacket) {
                    firstPacket = false;
					
					req.io.sockets.emit("lights");

                    return res.send();
                }
            });
        });
    } else if (req.body.lightID === 3) {
        changeTheLightStatus();

		req.io.sockets.emit("lights");

        return res.send();
    } else {
        return res.status(400).send();
    }
});

router.get("/resources/get-the-light-status", auth, userLogIn, endpointPermissionCheck, async (req, res) => {
    try {
        let firstResp = true;
        let secondResp = false;
        http.get("http://192.168.8.3?lights=r", resp => {
            resp.on("data", chunk => {
                if (firstResp) {
                    firstResp = false;
                    secondResp = true;
                }
                if (secondResp) {
                    secondResp = false;
                    return res.send(`${chunk.toString().slice(0, 3)}${getTheLightStatus() ? "1" : "0"}`);
                }
            });
        }).on("error", err => {
            return res.status(500).send();
        });

    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

module.exports = router;
