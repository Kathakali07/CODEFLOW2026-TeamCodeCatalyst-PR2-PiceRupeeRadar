import React from 'react';
import HomePage from './components/HomePage';

export default function App() {
  // Simple dummy login handler for now
  const handleLogin = () => {
    console.log("Login clicked! Backend integration pending.");
  };

  return (
    <HomePage onLogin={handleLogin} />
  );
}