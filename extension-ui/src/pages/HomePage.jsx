/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Search, Settings, Plus, ExternalLink, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PinCard from '../components/PinCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function HomePage({ user, onLogout, jwt, onAddLink }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchLinks(); }, []);

  const fetchLinks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/getLinks`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/deleteLink/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setLinks(prev => prev.filter(l => l._id !== id));
    } catch {
      alert('Error deleting link');
    }
  };

  const sections = links.reduce((acc, link) => {
    const s = link.section || 'General';
    if (!acc[s]) acc[s] = [];
    acc[s].push(link);
    return acc;
  }, {});

  const sectionNames = Object.keys(sections);

  const filteredSections = Object.entries(sections).map(([title, pins]) => ({
    title,
    pins: pins.filter(pin =>
      pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(s => s.pins.length > 0 || searchQuery === '');

  return (
    <div className="flex flex-col relative" style={{ width: '380px', height: '560px', background: '#0a0f12' }}>

      {/* Header */}
      <header className="w-full h-14 border-b border-white/10 flex justify-between items-center px-4 shrink-0"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(10,15,18,0.8)' }}>
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-sky-400" />
          <h1 className="font-['Fredoka_One'] text-sky-400 text-xl tracking-wider select-none">LINK</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search pins..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white/5 border-none rounded-full py-1.5 pl-8 pr-4 text-[10px] font-semibold text-slate-300 focus:ring-1 focus:ring-sky-400/50 w-36 outline-none placeholder:text-slate-600"
            />
          </div>
          <button className="p-1.5 rounded-full hover:bg-white/5 text-slate-600 transition-all cursor-not-allowed" title="Coming soon">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6"
        style={{ background: 'linear-gradient(to bottom, #0d1117, #0a0f12)' }}>

        {/* Add Section — pinned at top */}
        {searchQuery === '' && (
          <button className="glass-panel w-full group flex items-center justify-center gap-2 p-3 rounded-xl border-dashed hover:border-sky-400/40 hover:bg-sky-400/5 transition-all duration-300">
            <FolderPlus className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 group-hover:text-sky-400 transition-colors">
              Add Section
            </span>
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div style={{
              width: 24, height: 24,
              border: '2px solid rgba(56,189,248,0.15)',
              borderTop: '2px solid #38bdf8',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite'
            }} />
          </div>
        )}

        {error && <div className="text-xs text-red-400 text-center py-4">{error}</div>}

        {!loading && links.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <LinkIcon className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-xs font-bold tracking-widest uppercase opacity-50">No links saved yet</p>
            <p className="text-[10px] text-slate-600 mt-1">Tap + to add your first link</p>
          </div>
        )}

        {filteredSections.map((section, idx) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="font-['Fredoka_One'] text-sky-400 text-xs tracking-widest uppercase">
                {section.title}
              </h2>
              <span className="text-[9px] font-bold text-slate-500 tracking-widest">
                {section.pins.length} {section.pins.length === 1 ? 'PIN' : 'PINS'}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {section.pins.map(pin => (
                  <PinCard key={pin._id} pin={pin} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        ))}

        {filteredSections.length === 0 && searchQuery !== '' && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Search className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-xs font-bold tracking-widest uppercase opacity-50">No pins found</p>
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="absolute bottom-16 right-4 z-50">
        <button
          onClick={() => onAddLink(sectionNames)}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 hover:scale-105"
          style={{ background: '#38bdf8', boxShadow: '0 0 20px rgba(56,189,248,0.4)' }}
        >
          <Plus className="w-5 h-5 text-slate-900" />
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full flex justify-between items-center px-6 py-3 border-t border-white/10 shrink-0"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(10,15,18,0.8)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
            style={{ boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Sync Active</span>
        </div>
        <a href="#" className="flex items-center gap-1.5 group">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">Web App</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </a>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}