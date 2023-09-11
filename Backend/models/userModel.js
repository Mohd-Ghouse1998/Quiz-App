let mongoose=require('mongoose')

let userSchema=new mongoose.Schema({
    name:{type:"String",required:true},
    email:{type:'String',required:true,unique:true},
    password:{type:'String',required:true},
    currentRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
},{timestamps:true})


module.exports=mongoose.model('Users',userSchema)