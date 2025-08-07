const mongoose = require('mongoose')

const friendReqSchema = new mongoose.Schema({
    senderId : { type: String, required: true},
    senderName : { type: String, required: true},
    senderImage : {type:String, required: true},
    receiverId : { type: String, required: true},
    receiverName : { type: String, required: true },
    status : { type: String, required: true },
})
module.exports = mongoose.model('friendRequests',friendReqSchema);