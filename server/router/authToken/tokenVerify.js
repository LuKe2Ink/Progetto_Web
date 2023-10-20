const jwt = require("jsonwebtoken");
const moment = require("moment");
function isAuthenticated(req, res, next) {
    try {
        let token = req.get("Authorization");
        if (!token){
            return res.json({'status': 'ko', 'redirect': '/user/login'});
        }
        token = token.split(" ")[1];
        const decoded = jwt.verify(token, "accessSecret");
        req.username = decoded.username;
        next();
    } catch (error) {
        console.log(error)
        return res.json({'status': 'ko', 'redirect': '/user/login'});
    }
}

function createNewToken(username, refreshToken){
    return jwt.sign({ username: username,  refresh: refreshToken}, "accessSecret", {
        expiresIn: "1m",
      });
}

function isExpired(token){
    valid = true;
    try {
        const decoded = jwt.decode(token, "accessSecret");
        // console.log(decoded.exp, moment.now().valueOf(), decoded.exp < moment.now().valueOf())
        if(decoded.exp < moment.now().add(1, 'm').valueOf())
            valid = false
    } catch (error) {
        valid = false
    }

    return valid;
}

module.exports = { isAuthenticated, createNewToken, isExpired }