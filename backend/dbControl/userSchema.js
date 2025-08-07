const mongoose = require('mongoose');

const friendsSchema = new mongoose.Schema({
  friendId : String,
  friendName : String,
  friendImage : String,
  roomId : String,
},{_id:false})

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  username: String,
  email: { type: String, required: true, unique: true },
  image: String,
  isGoogleVerified: { type: Boolean, default: false },
  friends:[friendsSchema],
  createdAt: Number,
});

module.exports = mongoose.model('users', userSchema);
