// gameplayController.js
const roomModel = require("../models/roomModel");
const userModel = require("../models/userModel");
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

// Function to handle gameplay
const handleGameplay = async (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.params.userId;
  try {
    // Get the room and user information
    const room = await roomModel.findById(roomId);
    const user = await userModel.findById(userId); // Assuming you have user authentication

    if (!room || !user) {
      return res.status(404).json({ error: "Room or user not found" });
    }

    // Check if the game is already in progress
    if (room.gameInProgress) {
      return res.status(400).json({ error: "Game is already in progress" });
    }

    // Check if there are at least 2 users in the room
    //   if (room.users.length < 3) {
    //     return res.status(400).json({ error: 'At least 2 users are required to start the game' });
    //   }

    // Get all questions from your question pool
    // const allQuestions = await Question.find();
    console.log("start......................");
    // Start the game by selecting 5 random questions
    const questions = selectRandomQuestions(sampleQuestions);
    console.log("end......................");
    // Update the room's game state
    room.gameInProgress = true;
    room.questions = questions;
    room.currentQuestionIndex = 0;
    room.scores = {}; // Initialize scores

    // Emit the first question to all users in the room
    req.io.to(roomId).emit("next-question", questions[0]);

    // Save the room's updated game state
    await room.save();

    res.status(200).json({ message: "Game started successfully" });
  } catch (error) {
    console.error("Error handling gameplay:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ... (rest of the code remains the same)

// Function to handle user's answers
const answerQuestion = async (req, res) => {
  const { roomId, userId } = req.params;
  const { answer } = req.body;

  try {
    // Get the room and user information
    const room = await roomModel.findById(roomId);
    const user = await userModel.findById(userId);

    if (!room || !user) {
      return res.status(404).json({ error: "Room or user not found" });
    }

    // Check if the game is in progress
    if (!room.gameInProgress) {
      return res.status(400).json({ error: "Game is not in progress" });
    }

    // Get the current question
    const currentQuestion = room.questions[room.currentQuestionIndex];

    if (!currentQuestion) {
      // All questions have been answered
      return res.status(400).json({ error: "No more questions" });
    }

    // Check if the answer is correct (customize this logic based on your data structure)
    const isCorrect = currentQuestion.correctAnswer === answer;

    // Update the user's score
    if (!room.scores[userId]) {
      room.scores[userId] = 0;
    }

    if (isCorrect) {
      room.scores[userId] += 10; // Award 10 points for a correct answer
    }

    // Move to the next question
    room.currentQuestionIndex++;

    if (room.currentQuestionIndex < room.questions.length) {
      // Emit the next question
      req.io
        .to(roomId)
        .emit("next-question", room.questions[room.currentQuestionIndex]);
    } else {
      // End of the game, emit the final scores
      req.io.to(roomId).emit("game-over", room.scores);

      // Update room game state and save it
      room.gameInProgress = false;
      await room.save();
    }

    res
      .status(200)
      .json({ message: isCorrect ? "Correct answer" : "Incorrect answer" });
  } catch (error) {
    console.error("Error answering question:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const sampleQuestions1 = () => {
  let sample = [
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

  res.send({ status: true, error: false, data: sample });
};

module.exports = {
  handleGameplay,
  answerQuestion,
  sampleQuestions1,
};
