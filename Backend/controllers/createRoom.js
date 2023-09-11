const roomModel = require("../models/roomModel");
const userModel=require('../models/userModel')
const play=require('../controllers/gameplayController')


let createRoom = async (req,res) => {
  try {
    const newRoom = {
      name: req.body.name,
      users: [],
      gameInProgress: false,
    }
    let roomData=await roomModel.create(newRoom)
    //io.emit('room-created', roomData);

    res.status(201).send({
        status: true,
        message: "Room successfully created",
        data: roomData,
      });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

let getRooms = async (req,res) => {
  try {
    const rooms = await roomModel.find({
      $or: [{ users: { $size: 0 } }, { users: { $size: 1 } }]
    });
    res.send({status:true,error:false,data:rooms})
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


let getRoomById = async (req,res) => {
  try {
    let _id=req.params.roomId
    const rooms = await roomModel.find({_id});
    res.send({status:true,error:false,data:rooms})
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const enterRoom = async (req, res) => {
    const { roomId, userId } = req.params;
  
    try {
      const room = await roomModel.findById(roomId);
  
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
  
      if (room.users.length >= 2) {
        return res.status(400).json({ error: 'Room is full' });
      }
  
      const user = await userModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (user.currentRoom) {
        return res.status(400).json({ error: 'User is already in a room' });
      }
  
      // Add the user to the room (update your database logic)
      room.users.push(userId);
      await room.save();
  
      // Update the user's currentRoom field
      user.currentRoom = roomId;
      await user.save();
      if (room.users.length === 2) {
       play.handleGameplay(roomId, req.io); // Assuming you have access to req.io
      }
      // Emit a Socket.io event to notify clients in the room about the new user
      //io.to(roomId).emit('user-joined', userId);
  
      res.json({ message: 'User entered the room successfully' });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
  };
  


module.exports={createRoom,getRooms,getRoomById,enterRoom}