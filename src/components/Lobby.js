import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';
import io from 'socket.io-client'; // Import Socket.io client library
import './Lobby.css';

function Lobby() {
  const [user, setUser] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [socket, setSocket] = useState(null); // Initialize socket state
  const [roomName, setRoomName] = useState(''); // State variable to store the room name

  const history = useHistory();
  const { userId, roomId } = useParams();

  const fetchUser = async (userId) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/user/${userId}`);
      setUser(data.data[0].name);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch the list of available rooms
  const fetchRooms = async () => {
    try {
      let { data } = await axios.get('http://localhost:5000/api/get-room');
      setRooms(data.data);
    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  };

  // Establish the socket connection when the component mounts
  useEffect(() => {
    const newSocket = io.connect('http://localhost:5000'); // Replace with your server URL
    setSocket(newSocket);

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Listen for changes in the socket variable and emit the event when it becomes available
  useEffect(() => {
    if (socket) {
      socket.emit('user-joined-room', { roomId, userId }); // Emit the event here
    }
  }, [socket, userId]);

  useEffect(() => {
    // Fetch the list of available rooms when the component mounts
    fetchUser(userId);
    fetchRooms();
  }, [userId]);

  const createRoom = async () => {
    try {
      // Send a POST request to your backend to create a new room with the entered room name
      const response = await axios.post('http://localhost:5000/api/create-room', {
        name: roomName, // Use roomName state as the room name
      });

      // Handle room creation success
      console.log('Room created successfully:', response.data);
      setRoomName('');
      // After creating the room, fetch the updated list of rooms and set it in the state
      fetchRooms();
    } catch (error) {
      // Handle room creation error
      console.error('Error creating room:', error);
    }
  };

  const joinRoom = async (roomId) => {
    // Send a POST request to your backend to join a room
    try {
      const { data } = await axios.post(`http://localhost:5000/api/join-room/${roomId}/${userId}`);

      // No need to emit here since it's now handled in the socket useEffect

      history.push(`/startgame/${roomId}/${userId}`); //
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  return (
    <div className="lobby-container">
      <h2 className="lobby-header">Lobby</h2>
      <p className="user-name">{user}</p>
      <div>
        <input
          type="text"
          placeholder="Enter room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button className="create-room-button" onClick={createRoom}>
          Create Room
        </button>
      </div>
      <div className="room-container">
        {rooms.map((room) => (
          <div key={room._id} className="room-card">
            <div className="room-name">{room.name}</div>
            <button
              className="join-button"
              onClick={() => joinRoom(room._id)}
            >
              Join Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Lobby;
