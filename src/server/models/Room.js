const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    roomID: { type: String, required: true, index: { unique: true } },
    topic:{ type: String, required: true },
    roomDesc: { type: String, required: true },
    organizer: { type: String, require: true},
    type: { type: String, require: true},
    gameType: { type: String, require: false},
    ytUrl: { type: String, require: false},
    imageRef: { type: String, require:false },
    password: { type: String, required: false },
    isPublic: { type: Boolean, required: true },
    dateCreated: {type: Date, required: true}
})

module.exports = mongoose.model('Room', RoomSchema);