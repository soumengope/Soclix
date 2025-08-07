const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    userName : {type:String, required:true},
    userId : {type:String, required:true},
    reply : {type:String, required:true},
    timeStamp : {type:Date,default:Date.now},
})

const commentSchema = new mongoose.Schema({
    userName : {type:String, required:true},
    userId : {type:String, required:true},
    comment : {type:String, required:true},
    replies : [replySchema],
    timeStamp : {type:Date,default:Date.now},
})

const postSchema = new mongoose.Schema({
    userName : {type:String, required:true},
    userId : {type:String, required:true},
    userImage : {type:String, required:true},
    description : {type:String, required:true},
    images : [{type:String}],
    likes :{type:Number, default:0},
    likedBy : [{type:String}],
    comments : [commentSchema],
    timeStamp : {type:Date,default:Date.now},
})
module.exports = mongoose.model('posts', postSchema);