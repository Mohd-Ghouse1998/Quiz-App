import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

function Gameplay() {
  const { roomId, userId } = useParams();
  const [socket, setSocket] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    // Create a socket connection when the component mounts
    const newSocket = io.connect('http://localhost:5000'); // Replace with your server URL
    setSocket(newSocket);

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      // Join the room using the socket when roomId changes
      socket.emit('join-room', roomId);

      // Listen for events from the server
      socket.on('next-question', (question) => {
        // Handle the next question event
        setQuestions((prevQuestions) => [...prevQuestions, question]);
        setTimer(10); // Reset the timer for the new question
      });

      socket.on('game-over', (scores) => {
        // Handle the game over event
        setIsLastQuestion(true);
      });
    }
  }, [socket, roomId]);

  useEffect(() => {
    // Fetch questions for the room when the component mounts and when the currentQuestionIndex changes
    if (currentQuestionIndex < 5 && currentQuestionIndex < questions.length) {
      // Replace with your API endpoint for fetching questions
      axios
        .get(`http://localhost:5000/api/get-questions`)
        .then((response) => {
          console.log(response)
          setQuestions(response.data.questions.slice(0, 5)); // Get the first 5 questions
        })
        .catch((error) => {
          console.error('Error fetching questions:', error);
        });
    }
  }, [roomId, currentQuestionIndex, questions]);

  useEffect(() => {
    // Start a timer for each question
    if (currentQuestionIndex < 5) {
      const interval = setInterval(() => {
        if (timer > 0) {
          setTimer(timer - 1);
        } else {
          // Handle time's up, move to the next question
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setUserAnswer('');
          clearInterval(interval);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [currentQuestionIndex, timer]);

  const handleAnswerSubmit = () => {
    // Check if the user's answer is correct and questions are defined
    if (
      questions[currentQuestionIndex] &&
      userAnswer === questions[currentQuestionIndex].correctAnswer
    ) {
      // Award 10 points for a correct answer
      setScore(score + 10);
    }

    // Move to the next question if questions are defined
    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
    } else {
      // If it's the last question, set isLastQuestion to true
      setIsLastQuestion(true);
    }
  };

  return (
    <div>
      <h2>Gameplay</h2>
      {currentQuestionIndex < 5 ? (
        <div>
          <h3>Question {currentQuestionIndex + 1}</h3>
          {questions[currentQuestionIndex] ? (
            <div>
              <p>{questions[currentQuestionIndex].question}</p>
              <p>Time Remaining: {timer} seconds</p>
              <input
                type="text"
                placeholder="Your answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              />
              <button onClick={handleAnswerSubmit}>Submit Answer</button>
            </div>
          ) : (
            <p>Loading question...</p>
          )}
        </div>
      ) : isLastQuestion ? (
        <div>
          <h3>Game Over</h3>
          <p>Your Score: {score}</p>
        </div>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
}

export default Gameplay;
