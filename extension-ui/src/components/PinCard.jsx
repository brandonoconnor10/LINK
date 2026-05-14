/* eslint-disable */
import React from 'react';
import { MoreVertical, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function PinCard({ pin, onDelete }) {
  const favicon = pin.favicon || `https://www.google.com/s2/favicons?domain=${pin.url}&sz=64`;

  const handleOpen = () => {
    chrome.tabs.create({ url: pin.url.startsWith('http') ? pin.url : `https://${pin.url}` });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass-panel p-3.5 rounded-xl hover:border-sky-blue/30 transition-all duration-300 group cursor-pointer relative overflow-hidden active:scale-95"
      onClick={handleOpen}
    >
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-lg bg-slate-950/80 flex items-center justify-center border border-white/5 overflow-hidden shrink-0">
          <img
            src={favicon}
            alt=""
            referrerPolicy="no-referrer"
            onError={e => { e.target.style.display = 'none'; }}
            className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-['Fredoka_One'] text-sm text-sky-400 leading-none mb-1.5">{pin.title}</h3>
          <p className="text-[10px] font-medium text-slate-500 truncate">{pin.url}</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {pin.tags?.map(tag => (
              <span
                key={tag}
                className="text-[8px] font-extrabold bg-sky-blue/5 text-sky-400/80 px-2 py-0.5 rounded-full border border-sky-400/10 tracking-widest"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(pin._id); }}
          className="text-slate-600 hover:text-red-400 transition-colors self-start"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}