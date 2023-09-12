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

// const enterRoom = async (req, res) => {
//     const { roomId, userId } = req.params;
  
//     try {
//       const room = await roomModel.findById(roomId);
  
//       if (!room) {
//         return res.status(404).json({ error: 'Room not found' });
//       }
  
//       if (room.users.length >= 2) {
//         return res.status(400).json({ error: 'Room is full' });
//       }
  
//       const user = await userModel.findById(userId);
  
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
  
//       if (user.currentRoom) {
//         return res.status(400).json({ error: 'User is already in a room' });
//       }
  
//       // Add the user to the room (update your database logic)
//       room.users.push(userId);
//       await room.save();
  
//       // Update the user's currentRoom field
//       user.currentRoom = roomId;
//       await user.save();
    
//        play.handleGameplay(roomId, userId,req.io); // Assuming you have access to req.io
      
//       // Emit a Socket.io event to notify clients in the room about the new user
//       //io.to(roomId).emit('user-joined', userId);
  
//       res.json({ message: 'User entered the room successfully' });
//     } catch (error) {
//         return res.status(500).send({ status: false, message: error.message });
//     }
//   };
  
const sampleQuestions = [
  {
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Venus", "Jupiter"],
    correctAnswer: "Mars",
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["Giraffe", "Elephant", "Blue Whale", "Hippopotamus"],
    correctAnswer: "Blue Whale",
  },
  {
    question: "Who painted the Mona Lisa?",
    options: [
      "Leonardo da Vinci",
      "Pablo Picasso",
      "Vincent van Gogh",
      "Michelangelo",
    ],
    correctAnswer: "Leonardo da Vinci",
  },
  {
    question: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correctAnswer: "Carbon Dioxide",
  },
  // Add more questions here
];

// Import any required modules or models

// Function to select random questions (replace with your logic)
function selectRandomQuestions(allQuestions) {
  // Shuffle the question pool (e.g., using Fisher-Yates shuffle)
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }

  // Select the first 5 questions (adjust as needed)
  return allQuestions.slice(0, 5);
}



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

    // Start the game by selecting random questions
    const questions = selectRandomQuestions(sampleQuestions);

    // Update the room's game state
    room.gameInProgress = true;
    room.questions = questions;
    room.currentQuestionIndex = 0;
    room.scores = {}; // Initialize scores

    // Emit the first question to all users in the room
    req.io.to(roomId).emit("next-question", questions[0]);

    // Save the room's updated game state
    await room.save();

    res.json({ message: 'User entered the room successfully' });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


module.exports={createRoom,getRooms,getRoomById,enterRoom}