const Room = require('../models/Room');
const User = require('../models/User');

const Messages = require('../models/Messages')
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const log = require('../config.js').log();


module.exports = {
    getRooms,
    roomExists,
    roomMessages,
    createRoom,
    checkRoomPassword,
    addRoomMessage,
};

function roomExists(req, res) {
    log.info("Checking if room exists: " + req.params.id)

    Room.findOne({
        'roomID': req.params.id,
    },{
        "_id": 0,
        "isPublic": 1,
        "organizer":1
    }).exec(function( err, queriedRoomInfo){
        if(err){
            log.error("Error getting protected room info.")
        }else if(!queriedRoomInfo){
            log.warn("This room does not exist!");
        res.json({message:"Room doesn't exist!", exists:false});
        }else{
            if(queriedRoomInfo.organizer === req.user.username){
                res.json({message: "Room exists!", exists:true , isPublic:queriedRoomInfo.isPublic, access:true})
            }else{
                res.json({message: "Room exists!", exists:true , isPublic:queriedRoomInfo.isPublic})
            }
            
        }
    })
}

function roomMessages(req, res) {
    let msgList, messagesInfo;

    Messages.findOne({ roomRef: req.params.id }).exec(function (err, messages) {
        if (err) {
            log.error("Error: " + err);
        } else {
            log.info("Responding with messages for room " + req.params.id)
            if (messages) {
                msgList = messages.messageList;
                messagesInfo = `Received ${msgList.length} messages`
                Room.findOne({ roomID: req.params.id }).exec(function (err, room) {
                    if (err) {
                        log.error("Error: " + err);
                    } else {
                        log.info("Responding with room info for room " + req.params.id)
                        if (room) {
                            //console.log(messages.messageList);
                            res.json({
                                messagesInfo: messagesInfo,
                                roomInfo: room,
                                messages: msgList,
                                username: req.user.username
                            });
                        } else {
                            res.json({ message: "This room was not found in the server!" })
                        }
                    }
                })
                //console.log(messages.messageList);
                // res.json({message: "Retrieved messages", messages:messages.messageList});

            } else {
                messagesInfo = "This room doesn't have any messages yet!";
                //res.json({message:"This room doesn't have any messages yet!"})
            }
        }
    })
}
function createRoom(req, res) {

    var currentUser = req.user.username;
    var salt = bcrypt.genSaltSync(10);

    log.info(req.user.username + " is creating a new room: " + req.body.roomID)

    var newRoom = new Room();
    newRoom.roomID = req.body.roomID;
    newRoom.topic = req.body.topic;
    newRoom.type = req.body.type;
    switch (req.body.type) {
        case "general":
            newRoom.roomDesc = "General chatroom used to share images, GIFs, webms, and YouTube links";
            break;
        case "game":
            newRoom.roomDesc = "Game chatroom used to play games such as rock, paper, scissors and more!";
            newRoom.gameType = req.body.gameType;
            break;
        case "yt":
            newRoom.roomDesc = "Chatroom used to discuss a topic based on a YouTube video"
            newRoom.ytUrl = req.body.ytUrl;
            break;
        default:
            newRoom.roomDesc = "";
            break;
    }
    if (req.body.password !== "") {
        newRoom.password = bcrypt.hashSync(req.body.password, salt);
        newRoom.isPublic = false;
    } else {
        log.info("Creating public room with no password");
        newRoom.password = "";
        newRoom.isPublic = true;
    }

    newRoom.organizer = currentUser;
    newRoom.imageRef = "randomimage.jpg"
    newRoom.dateCreated = Date.now();
    log.info("Saving new room: " + newRoom);
    newRoom.save(function (err, room) {
        if (err) {
            log.error("Error creating room: " + err.message);
            res.status(400).json({error: "Unable to create room"})
        } else {
            log.info("Room created succesfully!")
            log.info("Room: " + room);

            User.findOneAndUpdate({
                '_id': req.user.uid
            },{
                $push: { 'roomsCreated': room.roomID }
            }).exec( function(err, queriedUser){
                if(err){
                    log.error("Error finding and updating createdRooms for user: " + req.user.username);
                }else if(!queriedUser){
                    log.warn("Issue finding and updating createdRooms for user: " + req.user.username);
                }else{
                    log.info("Successfully added room: " + room.roomID + " to " + req.user.username + "'s roomsCreated list");
                }
            })
            // Creating folder to contain room media
            // Production lines are commented

            // if (process.env.PROD === "true") {
            //     fs.mkdir(`/var/www/chatitapp.com/public/assets/uploads/rooms/${room.roomID}`, { recursive: true }, err => {
            //         if (err) {
            //             console.log(err);
            //         } else {
            //             fs.mkdirSync(`/var/www/chatitapp.com/public/assets/uploads/rooms/${room.roomID}/images`)
                        
            //         }
            //     });
            // } else {
            fs.mkdir(__dirname + `/../uploads/rooms/${room.roomID}`, { recursive: true }, err => {
                if (err) {
                    console.log(err);
                } else {
                    fs.mkdirSync(__dirname + `/../uploads/rooms/${room.roomID}/images`);
                    fs.mkdirSync(__dirname + `/../uploads/rooms/${room.roomID}/webms`);
                }
            })
            // }
        }
    });

    // Adding room to roomCreated array in user DB

    

    // Initializing messages collection
    newMessageList = new Messages();
    newMessageList._id = mongoose.Types.ObjectId();
    newMessageList.roomRef = newRoom.roomID;
    log.info("Saving new message list " + newMessageList);
    newMessageList.save(function (err, messageList) {
        if (err) {
            log.error("Error creating message list" + err.message);
        } else {
            log.info("Message list created succesfully!")
            log.info("Messagelist: " + messageList);
            res.json({
                message: "Successful Room and Messagelist Creation!"
            })
        }
    });
}
function getRooms(req, res) {
    log.info("Loading rooms for: " + req.user.username);;
    Room.find({}).exec(function (err, rooms) {
        if (err) {
            log.error("Error getting rooms: " + err.message)
        } else {
            res.json(rooms);
        }
    })
}

function checkRoomPassword(req, res){

    let input = req.body.rmPw;
    let rmID = req.body.roomID;

    if(!input || !rmID){
        info.warn(req.user.username + " entered and incorrect room password")
        res.json({message: "Invalid password/roomID", access:false});
        return;
    }

    log.info("Checking user entered password for room: " + rmID);

    Room.findOne({
        'roomID': rmID,
    },{
        "_id": 0,
        "password": 1,
        "isPublic": 1
    }).exec(function( err, queriedRoomInfo){
        if(err){
            console.log("Error getting protected room info.")
        }else if(!queriedRoomInfo){
            console.log("Unable to find room in checkRoomPassword request");
        }else{
            if(queriedRoomInfo.isPublic){
                res.json({message: "Room is public!", access:true})
            }else{
                let access = bcrypt.compareSync(input, queriedRoomInfo.password);
                res.json({access:access});
            }
        }
    })
}

function addRoomMessage(req, res){
    log.info( "Adding message to room: " + req.params.roomID);
    let roomID = req.params.roomID;

    let message = {
        'user': req.user.username,
        'text': req.body.text,
        'mediaType': req.body.mediaType,
        'mediaRef': req.body.mediaRef,
        'time': Date.now()
    }

    log.info("Message from /addMessage route: ");
    log.info(message);

    Messages.findOneAndUpdate({ 'roomRef': roomID },
        { $push: { messageList: message } }
    ).exec(err => {
        if (err) {
            log.error("Error updating messages: " + err);
        }
        else {
            log.info("Successfully added message to room " + roomID);
            res.json({
                message: "Successfully added message to DB!",
                chatmessage: message,
                roomID: roomID
            })
        }
    });
}

// function getRoomMedia(req, res){

//     log.info("Getting room media for room: " + req.params.roomID);
//     if (req.params.roomID === "rooms") {
//         res.sendFile(path.resolve(__dirname + `/../uploads/${req.params.name}`));
//     } else {
//         res.sendFile(path.resolve(__dirname + `/../uploads/rooms/${req.params.roomID}/images/${req.params.name}`));
//     }
// }