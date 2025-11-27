const express = require('express');
require('dotenv').config();
const passport = require('passport')
const session = require('express-session');
const { Strategy } = require('passport-google-oauth20');
const googleStrategy = require('passport-google-oauth20').Strategy
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser= require('cookie-parser');
const MongoStore = require('connect-mongo');
const conn = require('./dbControl/connect.js');
const User = require('./dbControl/userSchema.js'); 
const friendReqSchema = require('./dbControl/friendReqSchema.js');
const Message = require('./dbControl/chatsSchema.js');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Post = require('./dbControl/postSchema.js');
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");


// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

conn.set();

const app = express();

//socket.io setup
const http = require('http');
const {Server} = require('socket.io');
const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin : "http://localhost:5173",
    methods : ["GET","POST"],
  },
});

app.use(cors({
    origin:("http://localhost:5173"),
    credentials:true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'mysessions',
    ttl: 60 * 60 * 24 * 7 // 7 days
  }),
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Middleware to serve static images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config: store in memory (or use diskStorage if needed)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

passport.use(
  new googleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://soclix-backend.onrender.com/auth/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        return done(null, existingUser);
        console.log('user exited');
        
      }
      // Create new user
      const newUser = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails?.[0]?.value || '',
        image: profile.photos?.[0]?.value || '',
        isGoogleVerified: profile.emails?.[0]?.verified || false,
        friends:[],
        createdAt: Date.now(),
      });
      await newUser.save();
      console.log('Saving new user:', profile.displayName);
      return done(null, newUser);
    } catch (err) {
      console.error('Google Auth Error:', err);
      return done(err, null);
    }
  })
);
passport.serializeUser((user, done) => {
  done(null, user._id); // only store _id in session
});
passport.deserializeUser(async (id, done) => {
  //console.log('Deserialize ID:', id); 
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Error in deserializeUser:', err);
    done(err, null);
  }
});

app.get('/',(req,res)=>{
    res.send("<a href='/auth/google'>Login with google</a>")
})

app.get('/auth/google',passport.authenticate('google', {scope:['profile', 'email']}))

app.get('/auth/callback',passport.authenticate('google', {failureRedirect:'/'}), (req,res)=>{
    if(req.user){
        res.redirect('http://localhost:5173') // add another page in production
    }else{
        res.redirect('http://localhost:5173');
    }
})
app.get('/me',(req,res)=>{
    if(req.isAuthenticated()){
        res.json(req.user);
    }else{
        console.log('not authenticate');
        res.status(401).json({ message: 'Not authenticated' });
    }
})

app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);

    // Destroy session from MongoDB
    req.session.destroy(function(err) {
      if (err) return next(err);

      // Clear the cookie from the browser
      res.clearCookie('connect.sid', {
        path: '/', // important!
        httpOnly: true,
        sameSite: 'lax', // match your session setup
        secure: true // set true in production with HTTPS
      });

      res.redirect('http://localhost:5173'); // or send a JSON response
    });
  });
});

app.get('/allUsers',async(req,res)=>{
  try{
    const allUsers = await User.find();
    res.json(allUsers); 
  }catch(err){
    console.log(err);
     res.status(500).json({ message: 'Internal Server Error' });
  }
})

app.post('/addFriend',async (req,res)=>{
  try{
    const {senderId, senderName, senderImage, receiverId, receiverName} = req.body;
    const newRequest = new friendReqSchema({
      senderId, 
      senderName, 
      senderImage,
      receiverId, 
      receiverName,
      status:'pending'
    })
    const savedRequest = await newRequest.save();
    console.log('friend request sent successfully');

    //const meUpdate = await User.findById(senderId);

    res.status(201).json(savedRequest);
  }catch(err){
    console.log(err)
  }
})
app.get('/allFriendReq',async(req,res)=>{
  try{
    const allFriendReq = await friendReqSchema.find();
    res.json(allFriendReq); 
  }catch(err){
    console.log(err);
     res.status(500).json({ message: 'Internal Server Error' });
  }
})

//update my friend list and sender friend list
app.post('/acceptRequest',async(req,res)=>{
  const {myId, myName, myImage, senderId, senderName, senderImage} = req.body;
  const roomId = uuidv4();
  try{
    const myFriendUpdate = await User.findByIdAndUpdate(
      myId,
      {$push : { friends : {friendId:senderId, friendName:senderName, friendImage:senderImage, roomId:roomId}}},
      {new : true}
    )

    const senderFriendUpdate = await User.findByIdAndUpdate(
      senderId,
      {$push : { friends : {friendId:myId, friendName:myName, friendImage:myImage, roomId:roomId}}},
      {new : true}
    )

    if (!myFriendUpdate || !senderFriendUpdate){
      return res.status(404).json({ message: 'User not found' });
    }

    const deleteReq = await friendReqSchema.deleteOne({senderId:senderId, receiverId:myId});
    if(!deleteReq){
      console.log('problem deleting friend request');
    }else{
      console.log('friend request deleted');
    }

    const meUpdate = await User.findById(myId);
    return res.status(200).json({message: 'Friendship updated', meUpdate});
  }catch(err){
    console.log(err);
  }
})

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Fetch room messages from DB
    const history = await Message.find({ roomId }).sort({ timestamp: -1 }).limit(10).lean();
    socket.emit('room-history', history.reverse());
  });

  socket.on('send-message', async ({ roomId, message, image, sender, senderName}) => {
    console.log('roomId:',roomId, message,image,sender,senderName);

    let imageLink = "";
    if(image){
      imageLink = await cloudinary.uploader.upload(image, {
      folder: "chat_images"
      }).then(res => res.secure_url);
    }
    const msg = await Message.create({ roomId, message, image:imageLink, sender, senderName });

    // Emit to all in the room (including sender)
    io.to(roomId).emit('receive-message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "post_images" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

app.post("/uploadPost", upload.array("images", 4), async (req, res) => {
  const { userName, userId, userImage, description } = req.body;
  try {
    const imageLinks = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file))
    );
    const newPost = new Post({
      userId,
      userName,
      userImage,
      description,
      images: imageLinks,
      likes: 0,
      likedBy: [],
      comments: [],
    });

    await newPost.save();
    const allPosts = await Post.find().sort({ timeStamp: -1 }).limit(10).lean();

    res.send({
      status: 200,message: "Successfully uploaded",data: allPosts});
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ status: 500, message: "Upload failed" });
    }
});

app.get('/getPosts',async(req,res)=>{
  try{
    const allPosts = await Post.find().sort({ timeStamp: -1 }).limit(10).lean();
    res.json(allPosts);
  }catch(err){
    console.log(err);
  }
})
app.post('/likePost', async(req,res)=>{
  const {id, username, isLike} = req.body;
  console.log(id, username, isLike);
  try{
    const post = await Post.findById(id);
    const alreadyLiked = post.likedBy.includes(username);

    if(!isLike && !alreadyLiked){
      post.likes += 1;
      post.likedBy.push(username)
    }else if(isLike || alreadyLiked){
      post.likes = Math.max(0, post.likes-1);
      post.likedBy = post.likedBy.filter((elem)=> elem != username);
    }
    const updatedPost = await post.save();
    const allPost = await Post.find().sort({ timeStamp: -1 }).limit(10).lean();
    res.json({status:200, messages:'successfully updated post', data:allPost});
  }catch(err){
    console.log(err);
    res.json({status:500, message:'server error'})
  }
})

const port = process.env.PORT;
server.listen(port, ()=>{
    console.log(`connected to port ${port}`);
})
