/* eslint-disable */
import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function PinCard({ pin, onDelete, onEdit }) {
  const [showActions, setShowActions] = useState(false);
  const favicon = pin.favicon || `https://www.google.com/s2/favicons?domain=${pin.url}&sz=64`;

  const handleOpen = () => {
    if (!showActions) {
      chrome.tabs.create({ url: pin.url.startsWith('http') ? pin.url : `https://${pin.url}` });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass-panel p-3.5 rounded-xl hover:border-sky-400/30 transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={handleOpen}
    >
      <div className="flex gap-3 items-center">

        {/* Favicon — always visible */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden shrink-0"
          style={{ background: 'rgba(15,23,42,0.8)' }}>
          <img
            src={favicon}
            alt=""
            referrerPolicy="no-referrer"
            onError={e => { e.target.style.display = 'none'; }}
            className="w-6 h-6 object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-['Fredoka_One'] text-sm text-sky-400 leading-none mb-1">{pin.title}</h3>
          <p className="text-[10px] font-medium text-slate-400 truncate">{pin.url}</p>
          {pin.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {pin.tags.map(tag => (
                <span key={tag}
                  className="text-[8px] font-extrabold px-2 py-0.5 rounded-full border border-sky-400/20 tracking-widest"
                  style={{ background: 'rgba(56,189,248,0.08)', color: 'rgba(56,189,248,0.8)' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onEdit(pin)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 transition-all"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(pin._id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}