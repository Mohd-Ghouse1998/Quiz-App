// src/components/Home.js

import React from 'react';
import Login from './Login';
import Signup from './Signup';

function Home() {
  return (
    <div>
      <h1>Welcome to My Quiz Game</h1>
      <div className="auth-container">
        <Login />
        <Signup />
      </div>
    </div>
  );
}

export default Home;
