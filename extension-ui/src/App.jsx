/* eslint-disable */
import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getAuthToken(interactive) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve(token);
    });
  });
}

function removeCachedToken(token) {
  return new Promise((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, resolve);
  });
}

function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      try {
        const cached = await getAuthToken(false);
        if (cached) await removeCachedToken(cached);
      } catch (_) {}

      const token = await getAuthToken(true);

      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!data.token) throw new Error('No JWT returned');

      chrome.storage.local.set({ jwt: data.token, user: data.user }, () => {
        onLogin(data.user);
      });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#0f1418] font-['Montserrat'] text-[#dee3e8]"
      style={{ width: '380px', height: '560px' }}>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top center, rgba(142,213,255,0.15) 0%, transparent 70%)' }} />

      <header className="w-full flex justify-between items-center px-4 py-3 border-b border-white/10 shrink-0"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(15,20,24,0.5)' }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#8ed5ff]">link</span>
          <span className="font-['Fredoka_One'] text-lg tracking-tighter text-[#8ed5ff]">LINK</span>
        </div>
        <button className="hover:text-[#8ed5ff] transition-colors">
          <span className="material-symbols-outlined text-[#87929a]">settings</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-20">
          <div className="w-[400px] h-[400px] rounded-full blur-[120px]"
            style={{ background: 'rgba(56,189,248,0.2)' }} />
        </div>

        <div className="w-full">
          <div className="rounded-[2rem] p-8 space-y-6 shadow-2xl"
            style={{
              background: 'rgba(30,41,59,0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>

            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: '#252b2e', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="material-symbols-outlined text-[#8ed5ff] text-2xl">link</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h1 className="font-['Fredoka_One'] text-4xl text-[#dee3e8] tracking-tighter">LINK</h1>
              <h2 className="text-lg font-['Fredoka_One'] text-[#dee3e8] tracking-tight">Sign in to continue</h2>
              <p className="text-xs text-[#bdc8d1] leading-relaxed font-medium">
                Manage your links, data, and teams together. For free.
              </p>
            </div>

            {error && (
              <div className="text-xs text-[#ffb4ab] text-center font-semibold bg-[#93000a]/30 rounded-xl py-2 px-3">
                {error}
              </div>
            )}

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-dashed border-white/5" />
              <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-[#87929a]/60">
                Sign in with
              </span>
              <div className="flex-grow border-t border-dashed border-white/5" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl transition-all border border-white/5 font-semibold text-sm disabled:opacity-50"
              style={{ background: '#1b2024' }}
              onMouseEnter={e => e.currentTarget.style.background = '#252b2e'}
              onMouseLeave={e => e.currentTarget.style.background = '#1b2024'}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[#8ed5ff]">progress_activity</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-[#87929a] font-medium">
              By continuing, you agree to our{' '}
              <a href="#" className="text-[#8ed5ff] hover:underline">Terms</a>{' '}
              and{' '}
              <a href="#" className="text-[#8ed5ff] hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full flex justify-between items-center px-4 py-2 border-t border-white/10 shrink-0"
        style={{ backdropFilter: 'blur(12px)', background: 'rgba(15,20,24,0.8)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#8ed5ff]"
              style={{ boxShadow: '0 0 8px rgba(142,213,255,0.5)' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#bdc8d1]/70">Network Active</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#bdc8d1]/50">v2.4.0</span>
        </div>
        <a href="#" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#bdc8d1] hover:text-[#8ed5ff] transition-colors">
          Web App
          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
        </a>
      </footer>
    </div>
  );
}

function DashboardPage({ user, onLogout }) {
  return (
    <div className="flex flex-col bg-[#0f1418] font-['Montserrat'] text-[#dee3e8] items-center justify-center gap-4"
      style={{ width: '380px', height: '560px' }}>
      <p className="text-lg font-['Fredoka_One']">Welcome, {user?.name || 'User'} ✓</p>
      <button
        onClick={onLogout}
        className="px-6 py-2 rounded-xl text-sm font-bold uppercase tracking-wider border border-white/10 hover:bg-white/5 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      new Promise(resolve => {
        chrome.storage.local.get(['jwt', 'user'], ({ jwt, user }) => {
          if (jwt && user) setUser(user);
          setChecking(false);
          resolve();
        });
      }),
      document.fonts.ready,
    ]).then(() => {
      setTimeout(() => setReady(true), 50);
    });
  }, []);

  const handleLogout = () => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`).catch(() => {});
        });
      }
    });
    chrome.storage.local.remove(['jwt', 'user'], () => setUser(null));
  };

  return (
    <div style={{ width: '380px', height: '560px', position: 'relative', background: '#0f1418' }}>
      {!ready && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 9999,
          backdropFilter: 'blur(16px)',
          background: 'rgba(15,20,24,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 28,
            height: 28,
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
          ? <DashboardPage user={user} onLogout={handleLogout} />
          : <LoginPage onLogin={setUser} />
      )}
    </div>
  );
}