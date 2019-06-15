//const express = require('express');
//const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const createExpressApp = require('./create-express-app');
const config = require('./config');
const log = config.log();

if(process.env.NODE_ENV !== "production"){
}

mongoose.Promise = global.Promise;
mongoose.connect(config.db.connectionString, { useNewUrlParser: true } ,function(err){

    let port = config.app.port || 3000;

    if(err){
        log.fatal('Error connecting');
        log.fatal('Error: ' + err);
    }else{
        log.info('Connected to DB and creating App');
        createExpressApp().listen(port, () => {
            log.info('Express+Socketio server listening on port: ' + port)
        });
    }
});
