const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const log = require('../config.js').log();

module.exports = {
    userExists,
    userProfile,
    publicProfile,
    getFriendInfo,
    sendFriendReq,
    acceptFriend,
    togglePreference,
    profileImage,
    getNotifications,
    updateNotifications,
    clearNotifications,
    removeNotification
}



function getNotifications(req, res) {
    userID = req.user.uid;

    User.findOne({
        "_id": userID
    }, {
            "_id": 0,
            "notifications": 1,
        }).exec(function (err, queriedNotifications) {
            if (err) {
                log.error("Error finding the users friend info: " + err.message);
                res.status(402).json({ error: "Unable to get notification information." })
            } else {
                if (!queriedNotifications) {
                    log.warn(`Unable to find user with userID: ${userID}`);
                    res.status(402).json({ error: "Unable to get notification information." })
                } else {
                    res.json({ message: "Successfully retrieved notifications! ", notifications: queriedNotifications.notifications })
                }
            }
        });
}

function updateNotifications(req, res){

    let userID = req.user.uid;
    let username = req.user.username
    let notification = req.body.notification

    User.findOneAndUpdate({
        '_id': userID,
        },
        {
            $push: {
                'notifications': notification
        }},
        {
            new: true ,
        },
        ).exec((err, queriedUser) => {
            if (err) {
                log.error("Error sending notification: " + err);
                res.status(402).json({ error: "Unable to find user." })
            }
            else if (!queriedUser) {
                res.status(402).json({ error: "Unable to find user." })
            } else {
                let notification = queriedUser.notifications[queriedUser.notifications.length-1];
                log.info(`Successfully updated ${username}'s notifications`);
                res.json({message: `Successfully updated ${username}'s notifications`, notification: notification, notificationCount: queriedUser.notifications.length}); 
            }
        });
}

function clearNotifications(req, res) {
    userID = req.user.uid;

    User.findOneAndUpdate({
        "_id": userID
    }, {
        $set: {
            'notifications': new Array()
    }}).exec(function (err, queriedNotifications) {
            if (err) {
                log.error("Error finding the users notification info: " + err.message);
                res.status(402).json({ error: "Unable to get notification information." })
            } else {
                if (!queriedNotifications) {
                    log.warn(`Unable to find user with userID: ${userID}`);
                    res.status(402).json({ error: "Unable to get notification information." })
                } else {
                    res.json({ message: "Successfully removed notifications?"})
                }
            }
        });
}

function removeNotification(req, res) {
//            $pull: { 'friends.receivedRequests': { from: friend } },

    let userID = req.user.uid
    let notificationID = req.params.id;

    User.findOneAndUpdate({
        "_id": userID,
        
    }, {
        $pull: {
            'notifications': {_id: notificationID},
    }},
    {
        new: true,
    }).exec(function (err, queriedNotifications) {
            if (err) {
                log.error("Error finding the users notification info: " + err.message);
                res.status(402).json({ error: "Unable to get notification information." })
            } else {
                if (!queriedNotifications) {
                    log.warn(`Unable to find user with userID: ${userID}`);
                    res.status(402).json({ error: "Unable to get notification information." })
                } else {
                    log.info("Removed notification.");
                    log.info(queriedNotifications);
                    res.json({ message: "Successfully removed notification"})
                }
            }
        });

}

function userProfile(req, res) {
    // PRIVATE PROFILE HERE
    log.info("Responding to /me request with username: " + req.user.username);

    let userID = req.user.uid

    User.findOne({
        "_id": userID
    },
        {
            "_id": 0,
            "username": 1,
            "email": 1,
            "access": 1,
            "profileImgRef": 1,
            "emailVerified": 1,
            "preferences":1

        }).exec(function (err, queriedUser) {
            if (err) {
                log.error("Error finding user with UID: " + userID);
                res.status(402).json({ error: "Unable to get user information." });
            } else if (!queriedUser) {
                log.warn("Error finding the user info: " + err.message);
                res.status(402).json({ error: "Unable to get user information." });
            } else {
                log.info("Responding with user information.");
                res.status(200).json({ message: "Successfully retrieved user info.", userInfo: queriedUser });
            }
        });
}

function publicProfile(req, res) {
    // PUBLIC USER PROFILE HERE.
    log.info("Responding to /publicprofile request with username: " + req.params.user);

    let username = req.params.user

    User.findOne({
        "username": username
    },
        {
            "_id": 0,
            "username": 1,
            "profileImgRef": 1
        }).exec(function (err, queriedUser) {

            if (err) {
                log.error("Error finding user with UID: " + userID);
            } else if (!queriedUser) {
                log.warn("Error finding the user info: " + err.message);
                res.status(402).json({ error: "Unable to get friend information." });
            } else {
                log.info("Responding with user information.");
                res.status(200).json({ message: "Successfully retrieved user info.", userInfo: queriedUser });
            }
        });

}


function userExists(req, res) {
    log.info("Checking if User exists:" +  req.params.id)
    User.countDocuments({ username: req.params.id }, function (err, count) {
        if (count > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    });
}

function getFriendInfo(req, res) {
    userID = req.user.uid;

    User.findOne({
        "_id": userID
    }, {
            "_id": 0,
            "friends": 1,
        }).exec(function (err, queriedFriends) {
            if (err) {
                log.error("Error finding the users friend info: " + err.message);
                res.status(402).json({ error: "Unable to get friend information." })
            } else {
                if (!queriedFriends) {
                    log.warn(`Unable to find user with userID: ${userID}`);
                } else {
                    res.json({ message: "Successfully retrieved friend info! ", friends: queriedFriends.friends })
                }
            }
        });
}

function sendFriendReq(req, res){

    let thisUser = req.user.username;
    let reqUser = req.body.user;

    if (reqUser == thisUser) {
        res.json({ message: "You cannot add yourself!" })
    } else {
        let time = Date.now();

        let sentRequest = {
            to: reqUser,
            time: time,
        }

        let receivedRequest = {
            from: thisUser,
            time: time,
        }

        // Finding requested friend user
        User.findOneAndUpdate({
            'username': reqUser,
            "friends.receivedRequests.from": { $nin: [thisUser] },
            "friends.friendList.username": { $nin: [thisUser] },
        },
            {
                $push: {
                    'friends.receivedRequests': receivedRequest
                }
            }).exec((err, queriedReqUser) => {
                if (err) {
                    log.error("Error sending friend request: " + err);
                }
                else if (!queriedReqUser) {
                    log.warn("reqUser not. Most likely user is already in receivedRequests");
                    res.json({ error: "Friend request has already been sent!" })
                } else {
                    User.findOneAndUpdate({ 'username': thisUser },
                        { $push: { 'friends.sentRequests': sentRequest } }
                    ).exec(err => {
                        if (err) {
                            log.error("Error updating messages: " + err);
                            res.status(402).json({error: "Error updating messages"})
                        }
                        else {
                            log.info("queriedReqUser: " + JSON.stringify(queriedReqUser));
                            log.info(`Successfully updated ${thisUser} sentRequests`);
                        }
                    });
                    log.info("Successfully sent friend request to " + reqUser);
                    res.json({ message: `Successfully sent friend request to ${reqUser}`, user: reqUser })
                }
            });
    }
}

function acceptFriend (req, res){
    let userID = req.user.uid;
    let friend = req.params.friend;

    User.findOneAndUpdate({
        "_id": userID,
        "friends.friendList.username": { $nin: [friend] }
    }, {
            //'friends.friendList': { '$ne': friend }, 
            $addToSet: { 'friends.friendList': { username: friend } },
            $pull: { 'friends.receivedRequests': { from: friend } },
        }, {
            projection: {
                "_id": 0,
                "friends.friendList": 1,
                "friends.receivedRequests": 1
            },
            new: true
        }).exec(function (err, friends) {
            if (err) {
                log.error("Error finding the username: " + err.message);
                if (err.message.includes("conflict")) {
                    res.status(200).json({ success: false, message: "This user is already in your friend list!" })
                }
            } else {
                if (!friends) {
                    // UPDATE RESPONSE MESSAGE
                    //console.log(`Unable to find friends of user with userID: ${userID}`);
                    res.status(200).json({ success: false, message: "Unable to retrieve friend's list" })
                } else {
                    User.findOneAndUpdate({
                        "username": friend
                    },
                        {
                            $addToSet: { 'friends.friendList': { username: req.user.username } },
                            $pull: { 'friends.sentRequests': { to: req.user.username } },
                        },
                        {
                            projection: {
                                "_id": 0,
                                "friends.friendList": 1,
                                "friends.receivedRequests": 1
                            },
                            new: true
                        }
                    ).exec(function (err) {
                        if (err) {
                            log.error("Error updating friend info for requested user on acceptFriend" + err);
                        } else {
                            log.info("Friend info: " + friends);
                            res.json({ success: true, message: "Successfully updated friend list! ", friendList: friends.friends.friendList, receivedRequests: friends.friends.receivedRequests })
                        }
                    })
                }
            }
        });
}

function togglePreference(req,res){
    let uid = req.user.uid;
    let preference = req.params.preference;
    let newStatus = (req.params.newStatus == 'true');

    if(!preference){
        res.json({message: "Preference/status not found"});
    }else{

        switch (preference) {
            case "allowInv":
                log.info("Toggling allowInv");
                User.findOneAndUpdate({
                    '_id': uid
                },
                {
                    $set: {'preferences.enableInvite': newStatus} 
                }).exec(err =>{
                    if(err){
                        log.error("Error updating preference: " + preference);
                        res.json({message:"failure"});
                    }else{
                        log.info("Successfully update preference: " + preference + " to: " + newStatus);
                        res.json({message:"success"});
                    }
                });
                break;
            case "showCreatedRooms":
                log.info("Toggling showCreatedRooms");
                User.findOneAndUpdate({
                    '_id': uid
                },
                {
                    $set: {'preferences.showCreatedRooms': newStatus} 
                }).exec(err =>{
                    if(err){
                        log.error("Error updating preference: " + preference);
                        res.json({message:"failure"});
                    }else{
                        log.info("Successfully update preference: " + preference + " to: " + newStatus);
                        res.json({message:"success"});
                    }
                });
                break;
            default:
                break;
        }
    }
}

function profileImage(req, res){
        // console.log("Params: " + req.params.path);
        // console.log("Params[0]" + req.params[0]);
        let imagePath = __dirname + `/../uploads/profiles/${req.params.id}/profile-image.png`;
        if (fs.existsSync(imagePath)) {
            res.sendFile(path.resolve(imagePath))
        }
        // if (req.params.roomID === "rooms") {
        // }
        // else {
        //     res.sendFile(__dirname + `/uploads/rooms/${req.params.roomID}/images/${req.params.name}`)
        // }  
}

