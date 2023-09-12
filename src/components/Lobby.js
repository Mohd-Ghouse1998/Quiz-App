import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';
import io from 'socket.io-client'; // Import Socket.io client library

function Lobby() {
  const [user, setUser] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [socket, setSocket] = useState(null); // Initialize socket state

  const history = useHistory();
  const { userId ,roomId} = useParams();

  const fetchUser = async (userId) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/user/${userId}`);
      setUser(data.data[0].name);
    } catch (error) {
      console.error('Error fetching user data:', error);
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
    let fetchData = async () => {
      try {
        let { data } = await axios.get('http://localhost:5000/api/get-room');
        setRooms(data.data);
      } catch (error) {
        console.error('Error fetching room data:', error);
      }
    };

    fetchUser(userId);
    fetchData();
  }, [userId]);

  const createRoom = () => {
    // Send a POST request to your backend to create a new room
    axios
      .post('http://localhost:5000/api/create-room', {})
      .then((response) => {
        // Handle room creation success
      })
      .catch((error) => {
        // Handle room creation error
        console.error('Error creating room:', error);
      });
  };

  const joinRoom = async (roomId) => {
    // Send a POST request to your backend to join a room
    try {
      const { data } = await axios.post(`http://localhost:5000/api/join-room/${roomId}/${userId}`);

      // No need to emit here since it's now handled in the socket useEffect
      history.push(`/gameplay/${roomId}/${userId}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  return (
    <div>
      <h2>Lobby</h2>
      <p style={{ fontSize: '18px', marginTop: '10px' }}>{user}</p>
      <button onClick={createRoom}>Create Room</button>
      <ul>
        {rooms.map((room) => (
          <li
            key={room._id}
            style={{
              backgroundColor: '#f4f4f4',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '10px',
              margin: '10px',
              width: '200px', // Adjust the width as needed
              textAlign: 'center',
            }}
          >
            {room.name} ({room.gameInProgress})
            <button
              style={{
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                padding: '5px 10px',
                marginTop: '5px',
                cursor: 'pointer',
              }}
              onClick={() => joinRoom(room._id)}
            >
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Lobby;
