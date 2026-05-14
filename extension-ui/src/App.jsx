/* eslint-disable */
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

export default function App() {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      new Promise(resolve => {
        chrome.storage.local.get(['jwt', 'user'], ({ jwt, user }) => {
          if (jwt && user) { setUser(user); setJwt(jwt); }
          setChecking(false);
          resolve();
        });
      }),
      document.fonts.ready,
    ]).then(() => {
      setTimeout(() => setReady(true), 50);
    });
  }, []);

  const handleLogin = (user, token) => {
    setUser(user);
    setJwt(token);
  };

  const handleLogout = () => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`).catch(() => {});
        });
      }
    });
    chrome.storage.local.remove(['jwt', 'user'], () => {
      setUser(null);
      setJwt(null);
    });
  };

  return (
    <div style={{ width: '380px', height: '560px', position: 'relative', background: '#0f1418' }}>
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 9999,
          backdropFilter: 'blur(16px)',
          background: 'rgba(15,20,24,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 28, height: 28,
            border: '2px solid rgba(142,213,255,0.15)',
            borderTop: '2px solid #8ed5ff',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!checking && (
        user
          ? <HomePage user={user} jwt={jwt} onLogout={handleLogout} />
          : <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}