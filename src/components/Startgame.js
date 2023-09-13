import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import io from 'socket.io-client';

function StartGame() {
  const { roomId, userId } = useParams();
  const [socket, setSocket] = useState(null);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const history = useHistory();

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
      socket.emit('join-room', roomId, userId);

      socket.on('new-user-joined', (newUserId) => {
        setUsersInRoom((prevUsers) => [...prevUsers, newUserId]);

        // Check if there are now at least 2 users in the room
        if (usersInRoom.length >= 1) {
          // Notify all users in the room to start the game
          socket.emit('start-game');
        }
      });

      socket.on('start-game', () => {
        // Game has started, you can navigate to the Gameplay component
        history.push(`/gameplay/${roomId}/${userId}`);
        setGameStarted(true);
      });
    }
  }, [socket, roomId, userId, history]);

  return (
    <div>
      <h2>Start Game</h2>
      {usersInRoom.length < 2 ? (
        <p>Waiting for other users to join...</p>
      ) : (
        <p>Both users have joined. Starting the game...</p>
      )}
      <p>Users in the room:</p>
      <ul>
        {usersInRoom.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
      {gameStarted && (
        <p>The game has started! Redirecting to Gameplay...</p>
        // You can use a React Router <Redirect> component to navigate to Gameplay
      )}
    </div>
  );
}

export default StartGame;
