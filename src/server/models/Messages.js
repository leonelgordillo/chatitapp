const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessagesSchema = new Schema({
    roomRef: {type: String, required: true, index: { unique: true }},
    messageList: [{
        user: { type: String, required: true },
        text: { type: String, required: true },
        mediaType: { type: String, required: true },
        mediaRef: { type: String},
        time: { type : Date, required: true }
    }],
})

module.exports = mongoose.model('Messages', MessagesSchema);