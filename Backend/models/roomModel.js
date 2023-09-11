const mongoose =require('mongoose')

const roomSchema = new mongoose.Schema({
    name: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    gameInProgress: Boolean,
  },{timestamps:true});


  module.exports=mongoose.model('Room',roomSchema)