const express = require('express');
const roomController = require('./controllers/room-controller.js');
const userController = require('./controllers/user-controller.js');
const authController = require('./controllers/auth-controller.js');
const fileController = require('./controllers/file-controller.js');

const ioSetup = require('./ioSetup');

function apiRouter(io) {

    const router = express.Router();

    //  Socket.io setup
    ioSetup(io);
    
    // AUTH MIDDLEWARE
    router.use(
        // LOCAL JWT IMPLEMENTATION    
        authController.checkToken()
        // COOKIE JWT IMPLEMENTATION
        // authController.checkCookieToken()
    );
    router.use(async (err, req, res, next) => {
        await authController.checkExpiredJwt(err, req, res);
    });

    // AUTH CONTROLLER ROUTES
    router.post('/register', authController.registerUser);
    router.post('/authenticate', authController.loginUser);
    router.get('/checkSession', authController.checkSession);
    router.get('/logout', authController.logoutUser);

    // ROOM CONTROLLER ROUTES
    router.get('/rooms', roomController.getRooms) // eventually will be public or have a public view?
    router.get('/room/:id', roomController.roomMessages);
    router.get('/roomExists/:id', roomController.roomExists);
    router.post('/createroom', roomController.createRoom);
    router.post('/checkRoomPassword', roomController.checkRoomPassword);
    router.post('/addMessage/:roomID', roomController.addRoomMessage);
    
    // USER & FRIEND CONTROLLER ROUTES
    router.get('/me', userController.userProfile);
    router.get('/publicprofile/:user', userController.publicProfile)
    router.get('/userExists/:id', userController.userExists);
    router.get('/togglePreference/:preference/:newStatus', userController.togglePreference);
    router.get('/friendInfo', userController.getFriendInfo);
    router.get('/acceptFriend/:friend', userController.acceptFriend);
    router.get('/profileimage/:id', userController.profileImage);
    router.get('/notifications', userController.getNotifications);
    router.post('/notifications', userController.updateNotifications);
    router.get('/clearNotifications', userController.clearNotifications);
    router.get('/removeNotification/:id', userController.removeNotification);
    router.post('/sendFriendReq', userController.sendFriendReq);

    // FILE CONTROLLER ROUTES
    router.post('/upload/:path/:id', fileController.uploadMedia);
    router.get('/images/:path*', fileController.retrieveMedia);

    return router;
}

module.exports = apiRouter;