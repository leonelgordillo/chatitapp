require ('dotenv').config();

const users = require('./users');
const contacts = require('./contacts');
const rooms = require('./rooms');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt-nodejs');

function seedCollection(collectionName, initialRecords){
    var salt = bcrypt.genSaltSync(10);

    MongoClient.connect(process.env.DB_CONN, (err,client) =>{
        console.log('connected to mongodb.......');
        
        const db = client.db('securedb');
        const collection = db.collection(collectionName);

        collection.remove();

        initialRecords.forEach((item) =>{
            if(item.password){
                item.password = bcrypt.hashSync(item.password, salt);
            }
        });
        
        collection.insertMany(initialRecords, (err, results)=>{
            console.log(`${results.insertedCount} records inserted.`);
            console.log('Closing connection..');
            client.close();
            console.log('Done closing.');

        });
    });
}

seedCollection('users', users);
seedCollection('contacts', contacts);
seedCollection('rooms', rooms)