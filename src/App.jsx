import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import LogIn from './components/LogIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

export default function App() {
  const [view, setView] = useState('home');

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <div style={{ flex: 1 }}>
        {view === 'home' && (
          <HomePage onLogin={() => setView('login')} onSignUp={() => setView('signup')} onDashboard={() => setView('dashboard')} />
        )}

        {view === 'login' && (
          <LogIn
            onLoginSuccess={() => setView('dashboard')}
            onNavigateToSignUp={() => setView('signup')}
          />
        )}

        {view === 'signup' && (
          <SignUp
            onSignUpSuccess={() => setView('dashboard')}
            onNavigateToLogin={() => setView('login')}
          />
        )}

        {view === 'dashboard' && (
          <Dashboard onLogout={() => setView('home')} />
        )}
      </div>

      {/* Footer only on home and dashboard, not on login/signup */}
      {view !== 'login' && view !== 'signup' && (
        <Footer />
      )}

    </div>
  );
}