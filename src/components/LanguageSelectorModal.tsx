import React, { useState } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types';
import { X, Globe, Check, Search } from 'lucide-react';
import { FlagIcon } from './FlagIcon';

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
    <div className="fixed inset-0 z-50 w-full h-full min-h-screen bg-white flex flex-col overflow-hidden m-0 p-0 rounded-none border-none animate-fadeIn">
      {/* Full-width Header */}
      <header className="p-4 sm:px-8 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
            <Globe className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">Select Language</h3>
            <p className="text-xs text-slate-500">
              Choose your preferred interface language
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Full-screen Content Body */}
      <main className="flex-1 w-full overflow-y-auto custom-scrollbar bg-white flex flex-col">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-6 flex-1 flex flex-col gap-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language or country..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FlagIcon code={lang.code} size="md" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold leading-tight flex items-center gap-1.5 text-slate-900">
                        {lang.name}
                        <span className="text-[10px] font-mono text-slate-400 uppercase">({lang.code})</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{lang.nativeName}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-1 rounded-full bg-indigo-600 text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 text-center font-medium mt-auto">
            Language changes apply instantly without affecting your logged-in session.
          </div>

        </div>
      </main>
    </div>
  );
};
