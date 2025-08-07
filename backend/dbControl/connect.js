const mongoose = require("mongoose");

function set(){
    const uri = process.env.MONGO_URI ;
    mongoose.connect(uri,{
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(()=>{
        console.log("connected Database");
      }).catch(()=>{
        console.log("Database error");
      });
}

module.exports.set = set;