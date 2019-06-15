const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username:  { type: String, 
                 required: true, 
                 index: { unique: true },
                 uniqueCaseInsensitive: true,
                 trim: true,
                 collation:{
                    locale:"en",
                    strength:2
                 }
                },
    email:  { type: String, 
              required: true,  
              unique: true,
              lowercase: true,
              trim: true,
            },
    emailVerified:{ type:Boolean,
                    required:true,
            },
    friends: {
        receivedRequests: [{
            from: { type: String },
            time: { type: Date },
        }],
        sentRequests: [{
            to: { type: String },
            time: { type: Date },
        }],
        friendList: [{
            username: { type: String } ,
        }]
    },
    notifications: [
        {
            title : { type: String },
            type : { type: String },
            message : { type: String },
            from : { type: String },
            options : [{ type: String }],
            status : { type: String },
            timestamp: { type: Date }
        }
    ],
    roomsCreated: [
        {type:String, required:false}
    ],

    bytesUploaded: { type: Number, required:true},
    preferences:
        {
            enableInvite: {type: Boolean, required: true},
            showCreatedRooms: {type:Boolean, required:true},
        }
    ,
    refreshToken: {type:String, required:false},
    password:  { type: String, required: true },
    access:  { type: String, required: true },
    profileImgRef: {type: String, required: true},
})

UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model('User', UserSchema);