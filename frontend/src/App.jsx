import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [tokenData, setTokenData] = useState(() => {
    const saved = localStorage.getItem('pr2_tokenData');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const handleLogin = (data) => {
    console.log("Login successful!", data);
    setTokenData(data); // { token, user: { id, name } }
    localStorage.setItem('pr2_tokenData', JSON.stringify(data));
  };

  const handleLogout = () => {
    console.log("Logout clicked!");
    setTokenData(null);
    localStorage.removeItem('pr2_tokenData');
  };

  return (
    <>
      {tokenData ? (
        <Dashboard onLogout={handleLogout} tokenData={tokenData} />
      ) : (
        <HomePage onLogin={handleLogin} />
      )}
    </>
  );
}