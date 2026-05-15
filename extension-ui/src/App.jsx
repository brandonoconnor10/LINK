/* eslint-disable */
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AddLinkPage from './pages/AddLinkPage';
import EditLinkPage from './pages/EditLinkPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState('home');
  const [editingLink, setEditingLink] = useState(null);
  const [currentSections, setCurrentSections] = useState(['General']);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    Promise.all([
      new Promise(resolve => {
        chrome.storage.local.get(['jwt', 'user', 'rememberMe'], (result) => {
          if (result.rememberMe === true && result.jwt && result.user) {
            setUser(result.user);
            setJwt(result.jwt);
          }
          setChecking(false);
          resolve();
        });
      }),
      document.fonts.ready,
    ]).then(() => setTimeout(() => setReady(true), 50));
  }, []);

  const handleLogin = (user, token, rememberMe) => {
    setUser(user);
    setJwt(token);
    if (rememberMe) {
      chrome.storage.local.set({ jwt: token, user, rememberMe: true });
    } else {
      chrome.storage.local.remove(['jwt', 'user', 'rememberMe']);
    }
  };

  const handleLogout = () => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`).catch(() => {});
        });
      }
    });
    chrome.storage.local.remove(['jwt', 'user', 'rememberMe'], () => {
      setUser(null);
      setJwt(null);
      setPage('home');
      setCurrentSections(['General']);
    });
  };

  const handleAddLink = (sections) => {
    setCurrentSections(sections);
    setPage('addLink');
  };

  const handleEditLink = (link, sections) => {
    setEditingLink(link);
    setCurrentSections(sections);
    setPage('editLink');
  };

  const handleLinkSaved = () => {
    setRefreshKey(k => k + 1);
    setPage('home');
  };

  const handleLinkUpdated = () => {
    setRefreshKey(k => k + 1);
    setPage('home');
    setEditingLink(null);
  };

  return (
    <div style={{ width: '380px', height: '560px', position: 'relative', background: '#0a0f12' }}>
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
            sections={currentSections}
            onBack={() => setPage('home')}
            onSaved={handleLinkSaved}
          />
        ) : page === 'editLink' ? (
          <EditLinkPage
            jwt={jwt}
            link={editingLink}
            sections={currentSections}
            onBack={() => { setPage('home'); setEditingLink(null); }}
            onUpdated={handleLinkUpdated}
          />
        ) : (
          <HomePage
            user={user}
            jwt={jwt}
            onLogout={handleLogout}
            onAddLink={handleAddLink}
            onEditLink={handleEditLink}
            refreshKey={refreshKey}
          />
        )
      )}
    </div>
  );
}