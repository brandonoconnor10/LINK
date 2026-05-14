/* eslint-disable */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Link as LinkIcon,
  Lock,
  X,
  PlusCircle,
  FolderPlus,
  ChevronDown,
  Info,
  ArrowLeft
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AddLinkPage({ jwt, sections, onBack, onSaved }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [notes, setNotes] = useState('');
  const [section, setSection] = useState(sections[0] || 'General');
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const favicon = url
    ? `https://www.google.com/s2/favicons?domain=${url}&sz=64`
    : null;

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const handleTagKey = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleSave = async () => {
    if (!url || !title) { setError('URL and title are required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/saveLink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({ url, title, favicon, tags, section, notes, originClient: 'extension' })
      });
      const data = await res.json();
      if (!data.link) throw new Error('Failed to save');
      onSaved(data.link);
    } catch (err) {
      setError(err.message || 'Failed to save link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ width: '380px', height: '560px', background: '#0a0f12' }}>

      {/* Header */}
      <header className="w-full h-14 border-b border-white/10 flex items-center px-4 gap-3 shrink-0"
        style={{ backdropFilter: 'blur(20px)', background: 'rgba(10,15,18,0.8)' }}>
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-sky-400 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-sky-400" />
          <span className="font-['Fredoka_One'] text-xl tracking-wider text-sky-400 select-none">LINK</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5"
        style={{ background: 'linear-gradient(to bottom, rgba(15,20,24,0.5), #0a0f12)' }}>

        <h1 className="font-['Fredoka_One'] text-2xl text-sky-400 leading-none">Add New Link</h1>

        {/* Live Preview */}
        <div className="glass-panel p-4 rounded-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-bl-lg border-l border-b border-sky-400/20"
            style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
            Live Preview
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden shrink-0"
              style={{ background: '#252b2e' }}>
              {favicon && url ? (
                <img src={favicon} alt="" className="w-8 h-8 object-contain"
                  onError={e => e.target.style.display = 'none'} />
              ) : (
                <LinkIcon className="w-5 h-5 text-slate-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-slate-200 truncate">{title || 'Untitled Page'}</h3>
              <p className="text-xs text-slate-500 truncate">{url || 'Enter a URL below'}</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl py-2 px-3 text-center font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">

          {/* URL */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-1">URL</label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm text-slate-300 font-medium outline-none border border-white/5 focus:border-sky-400/50 transition-all"
                style={{ background: '#171c20' }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-1">Title</label>
            <input
              type="text"
              placeholder="Enter page title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm text-slate-300 font-medium outline-none border border-white/5 focus:border-sky-400/50 transition-all"
              style={{ background: '#171c20' }}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-1">Tags</label>
            <div className="w-full rounded-lg p-2 flex flex-wrap gap-2 border border-white/5"
              style={{ background: '#171c20' }}>
              <AnimatePresence>
                {tags.map(tag => (
                  <motion.span
                    key={tag}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 border border-sky-400/20"
                    style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}
                  >
                    {tag}
                    <X className="w-3 h-3 cursor-pointer hover:text-white transition-colors"
                      onClick={() => removeTag(tag)} />
                  </motion.span>
                ))}
              </AnimatePresence>
              <input
                type="text"
                placeholder="Add tag..."
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={handleTagKey}
                className="bg-transparent border-none outline-none text-sm py-1 px-1 flex-1 min-w-16 text-slate-300 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-1 flex items-center gap-1">
              Notes <Info className="w-3 h-3 opacity-50" />
            </label>
            <textarea
              placeholder="Add personal notes or context..."
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm text-slate-300 font-medium outline-none border border-white/5 focus:border-sky-400/50 transition-all resize-none"
              style={{ background: '#171c20' }}
            />
          </div>

          {/* Section */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold ml-1">Section</label>
            <button
              onClick={() => setIsSectionOpen(!isSectionOpen)}
              className="w-full text-left px-4 py-3 rounded-lg flex items-center justify-between border border-white/5 hover:border-sky-400/40 transition-all"
              style={{ background: 'rgba(37,43,46,0.5)' }}
            >
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-semibold text-slate-300">{section}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isSectionOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isSectionOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute z-50 w-full mt-1 glass-panel rounded-xl shadow-2xl overflow-hidden"
                >
                  {sections.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSection(s); setIsSectionOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-sky-400/10 ${section === s ? 'text-sky-400 font-bold' : 'text-slate-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onBack}
            className="flex-1 border border-white/10 hover:bg-white/5 text-slate-400 font-bold py-3.5 rounded-xl transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg text-xs uppercase tracking-widest disabled:opacity-50"
            style={{ background: '#38bdf8', color: '#0a0f12', boxShadow: '0 0 20px rgba(56,189,248,0.3)' }}
          >
            {loading ? (
              <div style={{
                width: 18, height: 18,
                border: '2px solid rgba(10,15,18,0.3)',
                borderTop: '2px solid #0a0f12',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite'
              }} />
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Add Link
              </>
            )}
          </button>
        </div>
      </main>

      <footer className="h-4 border-t border-white/5 shrink-0" style={{ background: '#0a0f12' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}