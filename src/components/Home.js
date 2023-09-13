// src/components/Home.js

import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import './Home.css';

function Home() {
  const [showLogin, setShowLogin] = useState(true);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="home-container">
      <h1 className="welcome-text">Welcome to My Quiz Game</h1>
      <div className="auth-container">
        {showLogin ? (
          <>
            <Login />
            <p>
              Don't have an account?{' '}
              <a href="#signup" onClick={toggleForm} className="toggle-link">
                Sign Up
              </a>
            </p>
          </>
        ) : (
          <>
            <Signup />
            <p>
              Already have an account?{' '}
              <a href="#login" onClick={toggleForm} className="toggle-link">
                Login
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
