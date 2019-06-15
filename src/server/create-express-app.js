const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const apiRouter = require('./api-router');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const redis = require('socket.io-redis');
const config = require('./config');
const log = config.log();
const expressRequestId = require('express-request-id')();

const morgan = require('morgan')

// add :requestId if necessary
const format = ':method|:url|:status|:response-time ms"'

morgan.token('requestId', request => request.id);

const options = {
    stream: {
        write: message => log.info((message.trim())),
    },
}

function createExpressApp(){
    const app = express();

    app.use(expressRequestId);

    if(process.env.NODE_ENV === "production"){
        log.info("Creating HTTPS server");
        server = require('https').createServer({
            key: fs.readFileSync('privkey.pem'),
            cert: fs.readFileSync('cert.pem'),
            ca: fs.readFileSync('fullchain.pem'),
            requestCert: false,
            rejectUnauthorized: false
            },app);
    }else{
        log.info("Creating HTTP server");
        server = require('http').createServer(app);
    }
    
    const io = require('socket.io')(server);
    require('socketio-auth')(io, {
    authenticate: authenticate,
        postAuthenticate: postAuthenticate,
    });
    //ioSetup(io);

    // PROD
    if(process.env.NODE_ENV === "production"){
        io.adapter(redis({host: config.redis.host, port: config.redis.port}));
    }
    app.use((req, res, next)=>{
        res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Header");
        res.header("Access-Control-Allow-Credentials", true);
        next();
    })
    app.use(morgan(format, options))
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));  
    app.use(cookieParser());  
    app.use('/api', apiRouter(io)) 

    // app.use(express.static(path.join(__dirname, 'public'))); 
    // app.use('*', (req,res)=>{
    //     return res.sendFile(path.join(__dirname, 'public/index.html'));
    // });

    return server;
}

function authenticate (socket, token, callback) {
    try {
        var decoded = jwt.verify(token.token, process.env.JWT_SECRET);
    } catch (err) {
        log.warn(err.message);
        return callback(err.message, false);
    }
    if (decoded){
        log.info("SOCKETIO: Successfully authenticated Socket.io connection and assigning username to socket client");
        socket.client.user = decoded.username;
        return callback(null, true);
    }
  }

  function postAuthenticate(socket, data) {
    log.info("SOCKETIO: " + socket.client.user + "'s socket connection has been authenticated!")
    //console.log("Printing socket.client from post auth: ");
    //console.log(socket.client);
    //socket.client.user = decoded.username;
  }

module.exports = createExpressApp;