import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import MainDashboard from '../src/pages/MainDashboard';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const onLogin = (username) => {
    setIsLoggedIn(true);
    setUsername(username);
  };

  const onSignup = (username) => {
    setIsLoggedIn(true); // Set user as logged in after signup
    setUsername(username);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={onLogin} />} 
        />
        <Route 
          path="/signup" 
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup onSignup={onSignup} />} 
        />
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <MainDashboard username={username} /> : <Navigate to="/login" />} 
        />
        {/* Redirect from root to either login, signup, or dashboard */}
        <Route 
          path="/" 
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
};

export default App;