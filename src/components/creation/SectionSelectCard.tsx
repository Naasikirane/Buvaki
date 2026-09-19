import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface SectionSelectCardProps {
  onSelectSection: (section: 'posts' | 'shorts' | 'longs') => void;
  onClose: () => void;
}

export const SectionSelectCard: React.FC<SectionSelectCardProps> = ({
  onSelectSection,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -10 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="relative w-full max-w-[560px] bg-white rounded-[32px] shadow-2xl shadow-slate-900/15 border border-slate-200/80 overflow-hidden select-none"
    >
      {/* Left Gradient Strip Accent - Exact green-to-cyan transition from design */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#22c55e] via-[#10b981] to-[#06b6d4]" />

      {/* Subtle Geometric Facet Background Pattern on the right */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
        <svg
          viewBox="0 0 600 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -right-10 top-0 w-[420px] h-full"
        >
          <path d="M280 40 L390 110 L310 190 Z" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M390 110 L520 70 L480 220 Z" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M310 190 L390 110 L480 220 L400 310 Z" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M480 220 L580 260 L490 360 L400 310 Z" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M310 190 L400 310 L270 340 Z" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M400 310 L490 360 L380 410 Z" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M520 70 L610 140 L480 220 Z" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M280 40 L410 0 L520 70 Z" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M210 140 L310 190 L280 40 Z" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M210 140 L270 340 L310 190 Z" stroke="#cbd5e1" strokeWidth="1.2" />
        </svg>
      </div>

      {/* Close Button */}
      <button
        type="button"
        id="btn-close-section-select"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        title="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Card Content */}
      <div className="relative z-10 pl-10 sm:pl-14 pr-8 pt-9 pb-8 flex flex-col justify-between min-h-[320px]">
        {/* Three Primary Sections */}
        <div className="flex flex-col gap-6 sm:gap-7 my-auto">
          {/* 1. POSTS */}
          <button
            type="button"
            id="btn-select-posts"
            onClick={() => onSelectSection('posts')}
            className="group flex items-center gap-5 sm:gap-6 text-left w-full py-1.5 px-2 -mx-2 rounded-2xl hover:bg-slate-50/80 active:bg-slate-100/90 transition-all cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 text-slate-700 group-hover:text-emerald-600 transition-colors">
              <svg viewBox="0 0 40 40" className="w-9 h-9 sm:w-10 sm:h-10">
                <rect
                  x="6"
                  y="6"
                  width="28"
                  height="22"
                  rx="4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 28L9 34L16 28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line x1="12" y1="13" x2="28" y2="13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="12" y1="18" x2="23" y2="18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="12" y1="23" x2="19" y2="23" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform">
              Posts
            </span>
          </button>

          {/* 2. SHORTS */}
          <button
            type="button"
            id="btn-select-shorts"
            onClick={() => onSelectSection('shorts')}
            className="group flex items-center gap-5 sm:gap-6 text-left w-full py-1.5 px-2 -mx-2 rounded-2xl hover:bg-slate-50/80 active:bg-slate-100/90 transition-all cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 text-slate-700 group-hover:text-emerald-600 transition-colors">
              <svg viewBox="0 0 40 40" className="w-9 h-9 sm:w-10 sm:h-10">
                <rect
                  x="11"
                  y="5"
                  width="18"
                  height="30"
                  rx="5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon points="17,15 25,20 17,25" fill="#16a34a" stroke="#16a34a" strokeWidth="1" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform">
              Shorts
            </span>
          </button>

          {/* 3. LONGS */}
          <button
            type="button"
            id="btn-select-longs"
            onClick={() => onSelectSection('longs')}
            className="group flex items-center gap-5 sm:gap-6 text-left w-full py-1.5 px-2 -mx-2 rounded-2xl hover:bg-slate-50/80 active:bg-slate-100/90 transition-all cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 text-slate-700 group-hover:text-emerald-600 transition-colors">
              <svg viewBox="0 0 40 40" className="w-9 h-9 sm:w-10 sm:h-10">
                <rect
                  x="5"
                  y="9"
                  width="30"
                  height="22"
                  rx="4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="7" y="12" width="3" height="3" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <rect x="7" y="18" width="3" height="3" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <rect x="7" y="24" width="3" height="3" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <rect x="30" y="12" width="3" height="3" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <rect x="30" y="18" width="3" height="3" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <rect x="30" y="24" width="3" height="3" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <polygon points="18,15 25,20 18,25" fill="#16a34a" stroke="#16a34a" strokeWidth="1" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl sm:text-3xl font-medium text-slate-900 tracking-tight group-hover:translate-x-1 transition-transform">
              Longs
            </span>
          </button>
        </div>

        {/* Bottom Pagination Dots Indicator (matches design) */}
        <div className="flex items-center justify-center gap-2.5 pt-4">
          <div className="w-6 h-1.5 sm:w-7 sm:h-2 rounded-full bg-slate-300/80" />
          <div className="w-8 h-1.5 sm:w-10 sm:h-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </motion.div>
  );
};
