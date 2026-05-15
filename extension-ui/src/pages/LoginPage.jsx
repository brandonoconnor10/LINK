/* eslint-disable */
import React, { useState } from 'react';
import { Link as LinkIcon } from 'lucide-react';

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
  return new Promise(resolve => chrome.identity.removeCachedAuthToken({ token }, resolve));
}

export default function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [hovering, setHovering] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Always clear cached token so it always asks which account
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

      onLogin(data.user, data.token, rememberMe);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ width: '380px', height: '560px', background: '#0a0f12' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 40%, rgba(56,189,248,0.12) 0%, transparent 65%)'
      }} />

      {/* Header */}
      <header className="w-full flex justify-between items-center px-4 py-3 border-b border-white/10 shrink-0"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(10,15,18,0.8)' }}>
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-sky-400" />
          <span className="font-['Fredoka_One'] text-xl tracking-wider text-sky-400 select-none">LINK</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full opacity-10"
            style={{ background: '#38bdf8', filter: 'blur(80px)' }} />
        </div>

        <div className="w-full relative z-10">
          <div className="rounded-2xl p-8 space-y-5 shadow-2xl glass-panel">

            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
                <LinkIcon className="w-6 h-6 text-sky-400" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-1">
              <h1 className="font-['Fredoka_One'] text-4xl text-sky-400 tracking-wider">LINK</h1>
              <h2 className="text-sm font-['Fredoka_One'] text-slate-300 tracking-wide">Sign in to continue</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Manage your links, data, and teams together. For free.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="text-xs text-red-400 text-center font-semibold bg-red-950/30 rounded-xl py-2 px-3 border border-red-500/20">
                {error}
              </div>
            )}

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="grow border-t border-dashed border-white/5" />
              <span className="shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                Sign in with
              </span>
              <div className="grow border-t border-dashed border-white/5" />
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl transition-all duration-200 font-semibold text-sm disabled:opacity-50"
              style={{
                background: hovering ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)',
                border: hovering ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: hovering ? '0 0 20px rgba(56,189,248,0.15)' : 'none',
              }}
            >
              {loading ? (
                <div style={{
                  width: 20, height: 20,
                  border: '2px solid rgba(56,189,248,0.2)',
                  borderTop: '2px solid #38bdf8',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite'
                }} />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-slate-300">Continue with Google</span>
                </>
              )}
            </button>

            {/* Remember Me */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded border flex items-center justify-center transition-all"
                style={{
                  background: rememberMe ? '#38bdf8' : 'transparent',
                  border: rememberMe ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {rememberMe && (
                  <svg className="w-2.5 h-2.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-[11px] text-slate-500 font-medium">Remember me on this device</span>
            </div>

            {/* Terms */}
            <p className="text-center text-[10px] text-slate-600 font-medium">
              By continuing, you agree to our{' '}
              <a href="#" className="text-sky-400/70 hover:text-sky-400 transition-colors">Terms</a>{' '}
              and{' '}
              <a href="#" className="text-sky-400/70 hover:text-sky-400 transition-colors">Privacy Policy</a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex justify-between items-center px-6 py-3 border-t border-white/10 shrink-0"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(10,15,18,0.8)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
            style={{ boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Network Active</span>
        </div>
        <a href="#" className="flex items-center gap-1.5 group">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-sky-400 transition-colors">Web App</span>
        </a>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}