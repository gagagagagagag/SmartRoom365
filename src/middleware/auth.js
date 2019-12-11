const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_SECRET_GOOGLE_AUTH);
const jwt = require("jsonwebtoken");

// Authenticate a user and get his info
const auth = async (req, res, next) => {
    try {
        let token = req.cookies.authToken;

        const ticket = await client.verifyIdToken({
           idToken: token,
           audience: process.env.CLIENTID_GOOGLE_AUTH
        });

        req.authUserData = ticket.getPayload();

        next();
    } catch (e) {
        // Checking if the request is for an endpoint
        if (req.route.path.split("/")[1] !== "resources") {
            res.redirect(`/?loc=${req.route.path}`);
        } else {
            res.status(403).send();
        }
    }
};

const externalServerAuth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        next();
    } catch (e) {
        console.log(e);
        res.status(401).send();
    }
};

// const createToken = async () => {
//     try {
//         const jwt_secret = "34243y5b234b5jh34v5g34v5";
//
//         const token = jwt.sign({body: "GoogleAppsScript"}, jwt_secret, { expiresIn: 60 * 60 * 24 * 365 * 10 }); // 10 years
//
//         console.log(token);
//     } catch(e) {
//         console.log(e);
//     }
// };

module.exports = {
    auth,
    externalServerAuth
};