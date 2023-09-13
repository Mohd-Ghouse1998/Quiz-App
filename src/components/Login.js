import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './Login.css'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
        },
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/login',
        formData,
        config
      );
let id=data.data.userId
      history.push(`/lobby/${id}`);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="login-container"> {/* Apply the CSS class to the container */}
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
