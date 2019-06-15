const redis = require('redis');
const config = require('./config');
const log = config.log();

if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const client = redis.createClient(config.redis.port , config.redis.host);
client.flushall();

module.exports = ioSetup;

userCurrentRooms = {};

function ioSetup(io){
    io.on('connection', (socket) => {
        
        log.info('SOCKETIO: User is connecting and authenticating to the Socket.io server..');
        socket.on("friendinfo", () => {
            // Get friend list and friend requests from Mongo
            // maybe csreate an HTTP post request for getting initial info
        });
        socket.on("friendstatus", () => {
        });

        socket.on("friendAccepted", user => {
            let newFriend = socket.client.user
            emitToUser(io, user, "newFriendUpdate", newFriend);
        });
        socket.on("authenticated", () => {

            client.mget(['userSockets', 'roomUsersList'], function(err, result){
                // let users = JSON.parse(result);
                // let roomUsersList= JSON.parse

                var userSockets, roomUsersList, onlineUsers;

                if(result[0]){
                    userSockets = JSON.parse(result[0]);
                    onlineUsers = getOnlineUsers(userSockets)
                }else{
                    userSockets = [];
                }
                if(result[1]){
                    roomUsersList = JSON.parse(result[1]);
                }else{
                    roomUsersList = [];
                }

                log.info("SOCKETIO: Emitting username, onlineusers, and roomlistusers to client:");

                socket.emit("serverData", {
                    username: socket.client.user,
                    onlineUsers: onlineUsers,
                    roomUsersList: roomUsersList,
                });
            });
        })
        socket.on("joinRoom", (rmID) => {

            log.info("SOCKETIO: joinRoom event from client with roomID: " + rmID);
            client.get('roomUsersList', function(err, result){
                log.info("SOCKETIO: Redis result from roomUsersList on joinRoom event:" + result);

                var roomUsersList;
                var foundRoom = false;
                var duplicate = false;
                var roomIndex;

                if(!result){
                    log.info("SOCKETIO: No result from redis roomUsersList get. Setting roomUsersList to []")
                    roomUsersList = [{
                        roomID: rmID,
                        users: []
                    }]
                    foundRoom = true;
                    roomIndex=0;
                }else{
                    log.info("SOCKETIO: Received non-null result from roomUsersList get. Setting roomUsersList to:" + result);
                    roomUsersList = JSON.parse(result);
                }
                if (rmID) {
                    log.info("SOCKETIO: Checking if user is already in room: " + rmID);
                    for(let i=0; i<roomUsersList.length;i++){
                        if(roomUsersList[i].roomID == rmID){
                            foundRoom = true;
                            roomIndex = i;
                            log.info("SOCKETIO: Found room.. now checking users list")
                            for(let j=0;j<roomUsersList[i].users.length;j++){
                                log.info(roomUsersList[i].users[j].user)
                                if (roomUsersList[i].users[j].user == socket.client.user) {
                                    log.info("SOCKETIO: Found duplicate user.");
                                    duplicate = true;
                                    io.to(`${roomUsersList[i].users[j].socket}`).emit('duplicate', "You may not join the same room twice");
                                    roomUsersList[i].users.splice(j, 1);
                                    roomUsersList[i].users.push({user:socket.client.user, socket: socket.id});
                                    break;
                                }
                            }
                        }
                    }

                    if(!foundRoom){
                        roomUsersList.push({
                            roomID: rmID, 
                            users: [{user:socket.client.user, socket:socket.id }]
                        })
                        if(!userCurrentRooms[socket.client.user]){
                            userCurrentRooms[socket.client.user] = [`${rmID}`];
                        }else{
                            userCurrentRooms[socket.client.user].push(rmID);
                        }
                        roomIndex = roomUsersList.length-1;
                    }else{
                        if(!duplicate){
                            roomUsersList[roomIndex].users.push({user:socket.client.user, socket: socket.id});

                            if(!userCurrentRooms[socket.client.user]){
                                userCurrentRooms[socket.client.user] = [`${rmID}`];
                            }else{
                                userCurrentRooms[socket.client.user].push(rmID);
                            }
                        }else{

                        }
                    }

                    log.info("SOCKETIO: userCurrentRooms on joinRoom: ");
                    log.info(userCurrentRooms);

                    log.info("SOCKETIO: roomUsersList before setting in redis: " + JSON.stringify(roomUsersList));
                    log.info("SOCKETIO: Setting roomUsersList in redis in joinRoom event to:" + JSON.stringify(roomUsersList));

                    client.set("roomUsersList", JSON.stringify(roomUsersList), redis.print);

                    log.info("SOCKETIO: ROOM USERS FROM JOINROOM: ");
                    log.info(roomUsersList);
    
                    roomUsers = [];
                    
                    for(let i=0;i<roomUsersList[roomIndex].users.length;i++){
                        let element = roomUsersList[roomIndex].users[i];
                        roomUsers.push(element.user);
                    }
                    log.info("SOCKETIO: RoomIndex: " + roomIndex);
                    log.info("SOCKETIO: Resulting roomUsers array from joined event: ");
                    log.info(roomUsers);
                    
    
                    socket.join(rmID);

                    socket.emit("currentRooms", userCurrentRooms[socket.client.user]);
                    log.info("SOCKETIO: Emitting roomUsersUpdate from CONNECT")
                    //io.sockets.in(rmID).emit('message', { online: roomUsers });
                    io.sockets.in(rmID).emit('roomUsersUpdate', { online: roomUsers, joined: socket.client.user });
                    io.emit('roomListUsersUpdate', { online: roomUsersList });
                };
            });
        });
        socket.on('leaveRoom', roomID => {

            client.get("roomUsersList", function(err, result){
                log.info("SOCKETIO: Redis result from roomUsersList on leaveRoom event:");
                log.info(result);
                let roomUsersList = JSON.parse(result);
                var roomIndex;
                if(roomUsersList){
                    for(let i=0; i<roomUsersList.length;i++){
                        if(roomUsersList[i].roomID == roomID){
                            roomIndex = i;
                            for(let j=0;j<roomUsersList[i].users.length;j++){
                                let element = roomUsersList[i].users[j];
                                if(element.socket == socket.id){
                                    roomUsersList[i].users.splice(j, 1);
                                    break;
                                }
                            }
                        }
                    }
                }else{
                    log.warn("SOCKETIO: WARNING: roomUsersList is empty on socket leaveRoom")
                    return;
                }
                
                
                if(userCurrentRooms[socket.client.user]){
                    for(let k=0;k<userCurrentRooms[socket.client.user].length;k++){
                        let room = userCurrentRooms[socket.client.user][k];
                        if(room === roomID){
                            userCurrentRooms[socket.client.user].splice(k,1);
                            break;
                        }
                    }
                }
                
                log.info("SOCKETIO: userCurrentRooms on leaveRoom: ");
                log.info(userCurrentRooms);
                let roomUsers = [];
                if (roomUsersList[roomIndex]) {
                    roomUsersList[roomIndex].users.forEach(element => {
                        roomUsers.push(element.user);
                    });
                }

                //log.info("Setting roomUsersList in redis in leaveRoom event to :" + JSON.stringify(roomUsersList));
                client.set("roomUsersList", JSON.stringify(roomUsersList), redis.print);
    
                log.info(`SOCKETIO: Users in room: ${roomID}: ` + JSON.stringify(roomUsers));
    
                log.info("SOCKETIO: RoomID from leaveRoom: " + roomID);
                if (roomID) {
                    io.sockets.in(roomID).emit('roomUsersUpdate', { online: roomUsers, left: socket.client.user });
                    log.info("SOCKETIO: roomUsersList: ");
                    log.info(roomUsersList);
                    socket.leave(roomID);
                    log.info("SOCKETIO: RoomUsersList from leaveRoom: " + JSON.stringify(roomUsersList));
                    io.emit('roomListUsersUpdate', { online: roomUsersList });
                }
            });
        });
        socket.on('disconnect', function () {

            // Since we can't determing room
            // find socketids in roomUsersList and disconnect that way


            if(!socket.client.user){
                log.info("SOCKETIO: Returning nil due to no client.user value");
                return;
            }

            log.info( "SOCKETIO: " + socket.client.user + " is disconnecting from socket.io server.");


            client.get("roomUsersList", function(err, result){
                log.info("SOCKETIO: Redis result from roomUsersList on disconnect event:" + result);
                let roomUsersList = JSON.parse(result);
                

                if(!result || !socket.client.user){
                    log.info("SOCKETIO: Returning nil due to no result or socket.client.user")
                    return;
                }
                log.info("SOCKETIO: roomUsersList before disconnecting: ");
                log.info(roomUsersList);
                // Removing user from all rooms
                var roomIndex;
                var roomID;
                for(let i=0;i<roomUsersList.length;i++){
                    for(let j=0;j<roomUsersList[i].users.length;j++){
                        let element = roomUsersList[i].users[j];
                        log.info("SOCKETIO: Element: " + JSON.stringify(element));
                        log.info("SOCKETIO: Socket id: " + socket.id);
                        if(element.socket == socket.id){
                            roomIndex=i;
                            roomUsersList[i].users.splice(j,1);
                            log.info("SOCKETIO: Deleted " + socket.client.user + "'s socket from roomUserWithIDs by matching socketid: " + element.socket)
                            roomID = roomUsersList[i].roomID;
                            log.info("SOCKETIO: RoomID: " + roomID);
                            // USE THIS TO DELETE ARRAY IN ROOM IF EMPTY OR IF A HOST CLOSES THE GAME
                            // log.info(roomUsersWithIds[key].length);
                            // if(roomUsersWithIds[key].length == 0){
                            //     // Delete object 
                            // }

                            for(let k=0;k<userCurrentRooms[socket.client.user].length;k++){
                                let room = userCurrentRooms[socket.client.user][k];
                                if(room === roomID){
                                    userCurrentRooms[socket.client.user].splice(k,1);
                                    break;
                                }
                            }
                        }
                    }
                }

                log.info("SOCKETIO: Setting roomUsersList in redis in disconnect event to: " + JSON.stringify(roomUsersList));
                client.set("roomUsersList", JSON.stringify(roomUsersList), redis.print)

                log.info("SOCKETIO: userCurrentRooms on disconnected: ");
                log.info(userCurrentRooms);

                let roomUsers = [];
                if (roomUsersList[roomIndex]) {
                    for(let i=0;i<roomUsersList[roomIndex].users.length;i++){
                        let element = roomUsersList[roomIndex].users[i];
                        roomUsers.push(element.user);
                    }
                }
                
                if (roomID) {
                    io.sockets.in(roomID).emit('roomUsersUpdate', { online: roomUsers, left: socket.client.user });
                    //io.sockets.in(roomID).emit('message', { online: roomUsers });
    
                }

                
                log.info("SOCKETIO: roomUsersList after disconnecting: ");
                log.info(roomUsersList);
                io.emit('roomListUsersUpdate', { online: roomUsersList });
            });

            client.get("userSockets", function(err,result){
                log.info("SOCKETIO: Redis result from userSockets on disconnect event:" + result);

                if(!result){
                    return;
                }
                let userSockets = JSON.parse(result);
                // Removing user and socket from userSockets array
                for (let i = 0; i < userSockets.length; i++) {
                    if (userSockets[i].user == socket.client.user) {
                        userSockets[i].sockets.forEach((element, index) => {
                            if (socket.id === element) {
                                userSockets[i].sockets.splice(index, 1);
                                userSockets[i].connCounter--;
                                if (userSockets[i].connCounter === 0) {
                                    userSockets.splice(i, 1);
                                    // log.info("Decrementing connected users");
                                    // onlineUsers--;
                                    // convert to regular for loop to break;
                                }
                            }
                        });
                    }
                }

                log.info("SOCKETIO: Updating userSockets in redis");
                client.set("userSockets", JSON.stringify(userSockets), redis.print)

                onlineUsers = [];
                if (userSockets) {
                    userSockets.forEach(element => {
                        onlineUsers.push(element.user);
                    });
                }

                log.info("SOCKETIO: Emitting OnlineUsersUpdate from DISCONNECT");
                // EVERY 1 MINUTE CHECK IF ONLINE USERS HAS CHANGED IF SO SEND EMITT OTHERWISE WAIT ANOTHER 1 MINUTE
                io.emit('onlineUsersUpdate', onlineUsers);
                log.info("SOCKETIO: DISCONNECTION: Current online users (userSockets): ");
                log.info(userSockets);
            });
                log.info(socket.client.user + ' has disconnected');
        });
        socket.on("connected", () => {

            let currentUser = socket.client.user;
            let foundUser = false;

            log.info( "SOCKETIO: " + currentUser + " is connecting to socket server.");

            client.get("userSockets", function(err, result){

                log.info("SOCKETIO: Result from userSockets get on connected event: ");
                log.info(result);
                
                let userSockets;
                if(!result){
                    userSockets = [];
                }else{
                    userSockets = JSON.parse(result);
                }

                if (userSockets) {
                    for (let i = 0; i < userSockets.length; i++) {
                        if (userSockets[i].user === currentUser) {
                            userSockets[i].sockets.push(socket.id);
                            userSockets[i].connCounter++;
                            foundUser = true;
                            break;
                        }
                    }
                    // Create new array element for user
                    if (!foundUser) {
                        userSockets.push({
                            user: currentUser,
                            sockets: [socket.id],
                            connCounter: 1,
                        })
                    }
                }
                else {
                    log.info("SOCKETIO: First connection ever. Pushing first user to array")
                    userSockets.push({
                        user: currentUser,
                        sockets: [socket.id],
                        connCounter: 1,
                    });
                }
    
                log.info("SOCKETIO: CONNECTION: Current online connections/users (userSockets): ");
                log.info(userSockets);
                log.info("SOCKETIO: Updating userSockets in redis");
                client.set("userSockets", JSON.stringify(userSockets), redis.print)
    
                let onlineUsers = [];
                if (userSockets) {
                    userSockets.forEach(element => {
                        onlineUsers.push(element.user);
                    });
                }
                log.info("SOCKETIO: Emitting onlineUsersUpdate from CONNECT")
                io.emit('onlineUsersUpdate', onlineUsers);
            });
        });
        socket.on('message', (message) => {
            log.info("SOCKETIO: Message received from client: " + JSON.stringify(message));
            log.info("SOCKETIO: Emitting chat message from backend to room: " + message.roomID);
            io.sockets.in(message.roomID).emit('message', message);
        });
        socket.on('friendReqFromClient', (user) => {
            // Find sockets for user being friends

            data = {
                from: socket.client.user,
                time: Date.now()
            }
            emitToUser(io, user, 'reqNotification', data);
        })

        socket.on('roomInviteFromClient', (info) => {

            log.info("SOCKETIO: Info payload from roomInviteFromClient: " + JSON.stringify(info));
            // Find sockets for user being friends
            data = {
                from: socket.client.user,
                roomID: info.roomID,
                time: Date.now()
                
            }
            emitToUser(io, info.friend, 'roomInvite', data);
        })
    });
}

function emitToUser(io, user, event, data) {

    client.get("userSockets", function(err, result){
        userSockets = JSON.parse(result);
        for (let i = 0; i < userSockets.length; i++) {
            if (userSockets[i].user === user) {
                userSockets[i].sockets.forEach(element => {
                    io.sockets.in(element).emit(event, data);
                });
            }
        }
    });
}

function getOnlineUsers(sockets){
    let onlineUsers = [];
            if (sockets) {
                sockets.forEach(element => {
                    onlineUsers.push(element.user);
                });
            }
    return onlineUsers;
}

