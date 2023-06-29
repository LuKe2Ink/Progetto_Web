const jwt = require("jsonwebtoken");
function isAuthenticated(req, res, next) {
    try {
    let token = req.get("authorization");
    if (!token){
        return res.json({'status': 'ko', 'redirect': '/user/login'});
    }
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, "accessSecret");
    req.username = decoded.username;
    next();
    } catch (error) {
        return res.json({'status': 'ko', 'redirect': '/user/login'});
    // console.error(error);
    }
}
module.exports = { isAuthenticated }