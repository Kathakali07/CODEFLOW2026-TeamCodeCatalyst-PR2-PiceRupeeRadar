import React, { useState } from 'react';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard'; // Make sure this path matches where you saved Dashboard.jsx

export default function App() {
  // State to track whether the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Triggered when "Open Dashboard" or "Initialize Dashboard" is clicked
  const handleLogin = () => {
    console.log("Login clicked! Transitioning to Dashboard.");
    setIsLoggedIn(true);
  };

  // Triggered when the "Logout" button inside the Dashboard is clicked
  const handleLogout = () => {
    console.log("Logout clicked! Returning to Home Page.");
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <HomePage onLogin={handleLogin} />
      )}
    </>
  );
}