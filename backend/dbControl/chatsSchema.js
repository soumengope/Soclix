const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sender: { type: String, required: true },
  senderName : {type:String, required:true},
  message: { type: String },
  image:{type:String, default: "" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('chatLists', chatSchema);