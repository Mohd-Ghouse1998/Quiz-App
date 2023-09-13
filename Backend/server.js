const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDb = require("./config/db");
const route = require("./routes/route");
let createRoom = require("./controllers/createRoom");
const roomModel = require("./models/roomModel");
const userModel = require("./models/userModel");
const http = require("http");
const socketIo = require("socket.io");
connectDb();
const app = express();
app.use(cors());
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use("/api", route);

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   // When a user joins a room
//   socket.on('join-room', async (roomId, userId) => {
//     socket.join(roomId);

//     io.emit('new-user-joined', userId);

//     //--------------------------------------------------------------------------
//     const room = await roomModel.findById(roomId);

//     if (!room) {

//       socket.emit('game-error', { message: 'Room not found' });
//     }

//     if (room.users.length >= 2) {

//       socket.emit('game-error', { message: 'Room is full' });
//     }

//     const user = await userModel.findById(userId);

//     if (!user) {

//       socket.emit('game-error', { message: 'User not found' });
//     }

//     if (user.currentRoom) {

//       socket.emit('game-error', { message: 'User is already in a room' });
//     }

//     // Add the user to the room (update your database logic)
//     room.users.push(userId);
//     await room.save();

//     // Update the user's currentRoom field
//     user.currentRoom = roomId;
//     await user.save();

//     if (room.gameInProgress) {
//       return res.status(400).json({ error: "Game is already in progress" });
//     }
//     //Check if there are at least 2 users in the room
//     if (room.users.length < 2) {
//       socket.emit('game-error', { message: 'At least 2 users are required to start the game' });
//     }
//     if (room.users.length === 2) {
//       // Notify all users in the room to start the game
//       io.to(roomId).emit('start-game');
//     }else{
//       socket.emit('game-error', { message: 'At least 2 users are required to start the game' });
//       return
//     }

//     //-------------------------------------------------------------------------------------
//     io.emit('game-started', (roomId, currentQuestionIndex) => {

//       const questions = createRoom.selectRandomQuestions(createRoom.sampleQuestions);
//       io.to(roomId).emit('game-started', questions[currentQuestionIndex + 1]);

//     })

//     socket.on('submit-answer', (roomId, currentQuestionIndex) => {
//       console.log(`submit answer comming from client ${currentQuestionIndex}`)
//       if (currentQuestionIndex <= 4) {
//         // Calculate the index of the next question
//         const nextQuestionIndex = currentQuestionIndex + 1;

//         // Emit the next question to all clients in the room
//         const questions = createRoom.selectRandomQuestions(createRoom.sampleQuestions);

//         io.to(roomId).emit('game-started', questions[nextQuestionIndex]);
//       } else {
//         // If it's the last question, emit 'game-over' event
//         socket.to(roomId).emit('game-over');
//       }
//     })

//     console.log(`User joined room: ${roomId}`);
//   });
//   socket.on('answer-question', (data) => {
//     // Handle the answer and emit a response to the room
//     io.to(data.roomId).emit('question-result', { correct: true });
//   });
//   // Handle other socket events here

//   // When a user disconnects
//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//     // Handle user disconnection, leave rooms, and cleanup as needed
//   });

// });

io.on("connection", (socket) => {
  console.log("A user connected");

  // Store game start status for each room
  const roomGameStarted = {};

  // When a user joins a room
  socket.on("join-room", async (roomId, userId) => {
    socket.join(roomId);
    io.emit("new-user-joined", userId);

    // Check if the room exists
    const room = await roomModel.findById(roomId);
    if (!room) {
      socket.emit("game-error", { message: "Room not found" });
      return;
    }

    // Check if the room is full
    if (room.users.length >= 2) {
      socket.emit("game-error", { message: "Room is full" });
      return;
    }

    // Check if the user exists
    const user = await userModel.findById(userId);
    if (!user) {
      socket.emit("game-error", { message: "User not found" });
      return;
    }

    // Check if the user is already in a room
    if (user.currentRoom) {
      socket.emit("game-error", { message: "User is already in a room" });
      return;
    }

    // Add the user to the room and update user's currentRoom field
    room.users.push(userId);
    await room.save();
    user.currentRoom = roomId;
    await user.save();

    // Emit 'game-started' event with the first question
    const questions = createRoom.selectRandomQuestions(
      createRoom.sampleQuestions
    );
    io.to(roomId).emit("game-started", questions[0]);

    // Check if the game is already in progress
    if (room.gameInProgress) {
      return res.status(400).json({ error: "Game is already in progress" });
    }

    // Check if there are at least 2 users in the room to start the game
    if (room.users.length === 2 && !roomGameStarted[roomId]) {
      // Notify all users in the room to start the game
      io.to(roomId).emit("start-game");
      roomGameStarted[roomId] = true; // Mark the game as started for this room
    } else if (room.users.length < 2) {
      socket.emit("game-error", {
        message: "At least 2 users are required to start the game",
      });
      return;
    }
  });

  io.emit("game-started", (roomId, currentQuestionIndex) => {
    const questions = createRoom.selectRandomQuestions(
      createRoom.sampleQuestions
    );
    io.to(roomId).emit("game-started", questions[currentQuestionIndex + 1]);
  });

  socket.on("submit-answer", (roomId, currentQuestionIndex) => {
    console.log(`Submit answer coming from client ${currentQuestionIndex}`);
    if (currentQuestionIndex <= 3) {
      // Calculate the index of the next question
      const nextQuestionIndex = currentQuestionIndex + 1;

      // Emit the next question to all clients in the room
      const questions = createRoom.selectRandomQuestions(
        createRoom.sampleQuestions
      );
      io.to(roomId).emit("game-started", questions[nextQuestionIndex]);
    } else {
      // If it's the last question, emit 'game-over' event
      io.to(roomId).emit("game-over");
    }
  });

  socket.on("answer-question", (data) => {
    // Handle the answer and emit a response to the room
    io.to(data.roomId).emit("question-result", { correct: true });
  });

  // Handle other socket events here

  // When a user disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    // Handle user disconnection, leave rooms, and cleanup as needed
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Express is running on port ${process.env.PORT || 5000}`);
});
