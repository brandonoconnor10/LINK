/* eslint-disable */
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AddLinkPage from './pages/AddLinkPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState('home'); // 'home' | 'addLink'
  const [sectionNames, setSectionNames] = useState([]);

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
    ]).then(() => setTimeout(() => setReady(true), 50));
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
      setPage('home');
    });
  };

  const handleAddLink = (sections) => {
    setSectionNames(sections.length > 0 ? sections : ['General']);
    setPage('addLink');
  };

  const handleLinkSaved = (newLink) => {
    setPage('home');
  };

  return (
    <div style={{ width: '380px', height: '560px', position: 'relative', background: '#0a0f12' }}>

      {/* Glass overlay until ready */}
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 9999,
          backdropFilter: 'blur(16px)',
          background: 'rgba(10,15,18,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 28, height: 28,
            border: '2px solid rgba(56,189,248,0.15)',
            borderTop: '2px solid #38bdf8',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!checking && (
        !user ? (
          <LoginPage onLogin={handleLogin} />
        ) : page === 'addLink' ? (
          <AddLinkPage
            jwt={jwt}
            sections={sectionNames}
            onBack={() => setPage('home')}
            onSaved={handleLinkSaved}
          />
        ) : (
          <HomePage
            user={user}
            jwt={jwt}
            onLogout={handleLogout}
            onAddLink={handleAddLink}
          />
        )
      )}
    </div>
  );
}