import React, { useState } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types';
import { X, Globe, Check, Search } from 'lucide-react';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  selectedLanguage,
  onSelectLanguage,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const q = searchQuery.toLowerCase();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-slate-950 border border-violet-900/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-violet-900/40 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-950 border border-violet-700/60 text-purple-300">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select Language</h3>
              <p className="text-xs text-slate-400">
                Choose your preferred interface language
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-violet-900/30 bg-slate-950">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language or country..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Languages Grid */}
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredLanguages.map((lang) => {
            const isSelected = lang.code === selectedLanguage.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                  isSelected
                    ? 'bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                    : 'bg-slate-900/70 border-violet-900/30 text-slate-300 hover:border-purple-700/60 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
                      {lang.name}
                      <span className="text-[10px] font-mono text-slate-500 uppercase">({lang.code})</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{lang.nativeName}</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="p-1 rounded-full bg-purple-600 text-white">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-3.5 bg-slate-900/80 border-t border-violet-900/30 text-[11px] text-slate-400 text-center font-medium">
          Language changes apply instantly without affecting your logged-in session.
        </div>
      </div>
    </div>
  );
};
