import React, { useState } from 'react';
import './styles/signup.css';



const Signup = ({ onSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
  
      onSignup(username); // Pass the username to onSignup
  
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Sign Up</button>
        </form>
        <a href="/login" className="signup-link">Login</a>
      </div>
    </div>
  );
};

export default Signup;
