const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const checkJwt = require('express-jwt');
const fs = require('fs');
const log = require('../config.js').log();

module.exports = {
    registerUser,
    loginUser,
    checkSession,
    logoutUser,
    checkExpiredJwt,
    checkToken,
    checkCookieToken
}


function registerUser(req, res){
    var salt = bcrypt.genSaltSync(10);
    log.info('Registering new user..');
    var newUser = new User();
    newUser.username = req.body.username;
    newUser.email = req.body.email.toLowerCase();
    newUser.password = bcrypt.hashSync(req.body.password, salt);
    newUser.access = "Unverified";
    newUser.emailVerified = false;
    newUser.preferences.enableInvite = true;
    newUser.preferences.showCreatedRooms = true;
    newUser.bytesUploaded = 0;
    newUser.profileImgRef = "profile-image.png";
    newUser.save(function (err, user) {
        if (err) {
            log.error('Error inserting user: ' + err.message);
            sendAuthError(res, 409, "Username/email already exists");
        } else {
            log.info("Attempting to authenticate: " + user.username);
            // if (process.env.PROD === "true") {
            //     fs.mkdir(`/var/www/chatitapp.com/public/assets/profiles/${user.username}`, { recursive: true }, err => {
            //         if (err) {
            //             log.info(err);
            //         }else{

            //         }
            //     });
            // } else {
            fs.mkdir(__dirname + `/../uploads/profiles/${user.username}`, { recursive: true }, err => {
                if (err) {
                    log.error(err);
                }else{
                    fs.readFile(__dirname + '/../uploads/profiles/default-1.png', function (err, data) {
                        if (err) throw err;
                        fs.writeFile(__dirname + `/../uploads/profiles/${user.username}/profile-image.png`, data, function (err) {
                            if (err) throw err;
                            log.info('Successfully saved profile image');
                        });
                    });
                }
                })
            // }
            authenticateUser(user, res)
        }
    });
}

function checkSession(req, res){
    log.info("Checking Auth session for: " + req.user.username);
    res.status(200).json({ isLoggedIn: true, username: req.user.username });
}

function loginUser(req, res) {
    // VALIDATE MORE HERE!!!!
    var username = req.body.username;
    log.info("Attempting to login user: " + username);
    User.findOne({
        username: username
    })
        .exec(function (err, queriedUser) {
            if (err) {
                log.error("Error finding the username: " + err.message);
                sendAuthError(res, 404, "Error finding username");
            } else {
                if (!queriedUser) {
                    log.error(`Unable to find user with username: ${username}`);
                    sendAuthError(res, 404, "Username/password is incorrect");
                } else if (bcrypt.compareSync(req.body.password, queriedUser.password)) {
                    authenticateUser(queriedUser, res);
                    log.info(`Successful login attempt by ${queriedUser.username}`);
                } else {
                    sendAuthError(res, 404, "Username/password is incorrect");
                }
            }
        });
}

function logoutUser(req, res) {
    removeRefreshToken(req.user.uid);
    log.info("Logging out: " + req.user.username);
    res.status(200).json({ message: "Successfully logged out!" })
}

function authenticateUser(user, res) {

    var jwtToken = jwt.sign({ uid: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP });
    var refreshToken = jwt.sign({ uid: user._id }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_EXP })

    // COOKIE AUTH IMPLEMENTATION?????
    //res.cookie("SESSIONID", jwtToken, {httpOnly:true /*, secure:false*/}).json({message:"JWT cookie sent!"});
    //res.json({message: "Cookie sent!"}, {username: u});

    user.refreshToken = refreshToken;

    user.save(function (err, user) {
        if (err) {
            log.error(err);
            return;
        } else {
            log.info("Successfully added refresh token to: " + user.username);
        }
    });

    res.json({
        token: jwtToken,
        refreshToken: refreshToken,
        uid: user._id,
        message: "Successfully authenticated."
    });
    log.info("Applied token to " + user.username);
}

function sendAuthError(res, status, message) {
    return res.status(status).json({ success: false, error: message });
}

function removeRefreshToken(uid) {
    User.findOneAndUpdate({ '_id': uid },
        {
            refreshToken: null,
        }).exec((err) => {
            if (err) {
                log.error("Error logging user out: " + err)
            } else {
                log.info("Succesfully removed user refresh token")
            }
        });
}

async function checkExpiredJwt(err, req, res) {
    if (err.name === 'UnauthorizedError') {
        if (err.message === 'jwt expired') {
            log.warn(err.message + ": checking refresh token status and creating new auth token for user");
            const oldToken = getTokenFromReq(req);
            const decodedJwt = jwt.decode(oldToken, process.env.JWT_SECRET);
            const refTokenFromClient = req.headers['x-auth-header'];
            const userQueryResults = await User.findOne({ '_id': decodedJwt.uid }, 'refreshToken username')

            if (userQueryResults) {
                if (refTokenFromClient === userQueryResults.refreshToken) {
                    newToken = jwt.sign({ uid: userQueryResults._id, username: userQueryResults.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP });
                    log.info("New token being sent back to client.");
                    res.status(403).json({ message: "refreshed token", token: newToken, isLoggedIn: true, username: userQueryResults.username })
                }
                else {
                    res.status(401).send({ error: err.message });
                }
            } else {
                res.status(401).send({ error: err.message });
            }
        } else {
            res.status(401).send({ error: err.message });
        }
    }
}

function getTokenFromReq(req) {
    let token = req.headers['authorization'];
    // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length).trimLeft();
        return token
    } else {
        return null;
    }
}

// LOCAL JWT IMPLEMENTATION    
function checkToken(){
    return checkJwt({ secret: process.env.JWT_SECRET })
    .unless({ path: ['/api/authenticate', '/api/register'] })
}

function checkCookieToken(){
    return checkJwt({
        secret: process.env.JWT_SECRET,
        credentialsRequired: false,
        getToken: function fromCookie (req) {
        if (req.cookies) {
            log.info("Cookies: " + req.cookies.SESSIONID);
            return req.cookies.SESSIONID;
        }
        return null;
        }
    }).unless({path: ['/api/authenticate', '/api/register']})

}


    /* COOKIE JWT IMPLEMENTATION
    router.use(checkJwt({
        secret: process.env.JWT_SECRET,
        credentialsRequired: false,
        getToken: function fromCookie (req) {
        if (req.cookies) {
            console.log("Cookies: " + req.cookies.SESSIONID);
            return req.cookies.SESSIONID;
        }
        return null;
        }
    }).unless({path: ['/api/authenticate', '/api/register']}));
    */