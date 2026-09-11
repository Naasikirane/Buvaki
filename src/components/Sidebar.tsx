import React from 'react';
import { FilterSort, ViewMode, SupportedLanguage, Theme } from '../types';
import { getTranslation } from '../lib/translations';
import { FlagIcon } from './FlagIcon';
import { 
  Home,
  Globe, 
  Moon, 
  Eye, 
  Sun,
  Clapperboard,
  Tv,
  Users,
  User,
  BarChart2,
  TrendingUp,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  activeFilter: FilterSort;
  onChangeFilter: (filter: FilterSort) => void;
  showSavedOnly: boolean;
  onToggleSavedOnly: (saved: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedLanguage: SupportedLanguage;
  onOpenLanguage: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeFilter,
  onChangeFilter,
  showSavedOnly,
  onToggleSavedOnly,
  viewMode,
  setViewMode,
  selectedLanguage,
  onOpenLanguage,
  theme,
  setTheme,
  isCollapsed = true,
  onToggleCollapse,
}) => {
  const t = getTranslation(selectedLanguage.code);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('stealth');
    else if (theme === 'stealth') setTheme('light');
    else setTheme('dark');
  };

  // YouTube-style Auto-Collapsed Left Mini Guide Rail (Persistent base rail) + Full Guide Drawer (When uncollapsed)
  return (
    <>
      <aside 
        className="w-[72px] flex-shrink-0 hidden lg:flex flex-col items-center gap-1.5 py-3 px-1 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto no-scrollbar select-none z-20"
        aria-label="Collapsed sidebar navigation"
      >
        {/* Home */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('feed');
          }}
          className={`w-full py-3.5 px-1 flex flex-col items-center justify-center rounded-xl transition-all ${
            viewMode === 'feed' && !showSavedOnly && activeFilter !== 'hot' && activeFilter !== 'discussed'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
          title="Home"
        >
          <Home className={`w-5 h-5 mb-1.5 ${viewMode === 'feed' && !showSavedOnly ? 'text-white stroke-[2.5]' : 'text-neutral-300'}`} />
          <span className="text-[10px] leading-tight font-medium tracking-tight text-center truncate max-w-full">
            Home
          </span>
        </button>

        {/* Shorts */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('shorts');
          }}
          className={`w-full py-3.5 px-1 flex flex-col items-center justify-center rounded-xl transition-all ${
            viewMode === 'shorts'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
          title="Shorts"
        >
          <Clapperboard className={`w-5 h-5 mb-1.5 ${viewMode === 'shorts' ? 'text-pink-400 stroke-[2.5]' : 'text-neutral-300'}`} />
          <span className="text-[10px] leading-tight font-medium tracking-tight text-center truncate max-w-full">
            Shorts
          </span>
        </button>

        {/* Videos / Longs */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('longs');
          }}
          className={`w-full py-3.5 px-1 flex flex-col items-center justify-center rounded-xl transition-all ${
            viewMode === 'longs'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
          title="Longs"
        >
          <Tv className={`w-5 h-5 mb-1.5 ${viewMode === 'longs' ? 'text-violet-400 stroke-[2.5]' : 'text-neutral-300'}`} />
          <span className="text-[10px] leading-tight font-medium tracking-tight text-center truncate max-w-full">
            Longs
          </span>
        </button>

        {/* You */}
        <button
          onClick={() => {
            onToggleSavedOnly(true);
            setViewMode('feed');
          }}
          className={`w-full py-3.5 px-1 flex flex-col items-center justify-center rounded-xl transition-all group ${
            showSavedOnly
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
          title="You"
        >
          {/* Circle with photo/graphic of the thumbs-up logo */}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1.5 overflow-hidden transition-all duration-200 group-hover:scale-105 shadow-sm bg-white ${
            showSavedOnly
              ? 'ring-2 ring-sky-400'
              : 'ring-1 ring-white/40'
          }`}>
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 transform -translate-y-[0.5px]"
            >
              <defs>
                <linearGradient id="you_thumbs_circle" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
              {/* Left cuff vertical pill */}
              <rect 
                x="2" 
                y="9.5" 
                width="4.5" 
                height="12" 
                rx="1.8" 
                fill="url(#you_thumbs_circle)" 
              />
              {/* Main thumb & hand body */}
              <path 
                d="M7.5 10.2L11 2.8C11.8 1.4 13.8 1.8 14 3.5L14 9.2H19.5C21.2 9.2 22.5 10.8 22.1 12.5L20.6 18.5C20.2 20 18.8 21.2 17.2 21.2H7.5V10.2Z" 
                fill="url(#you_thumbs_circle)" 
              />
            </svg>
          </div>
          <span className="text-[10px] leading-tight font-medium tracking-tight text-center truncate max-w-full">
            You
          </span>
        </button>

        {/* Bottom utility icons */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-white/10 w-full">
          <button
            onClick={onOpenLanguage}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-all"
            title={`Language: ${selectedLanguage.name} (${selectedLanguage.code.toUpperCase()})`}
          >
            <FlagIcon code={selectedLanguage.code} size="sm" />
          </button>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-all"
            title={`Theme: ${theme}`}
          >
            {theme === 'dark' && <Moon className="w-4 h-4 text-violet-300" />}
            {theme === 'stealth' && <Eye className="w-4 h-4 text-emerald-400" />}
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </aside>

      {/* Background backdrop when expanded in shorts mode or overlay */}
      {!isCollapsed && (
        <div 
          onClick={onToggleCollapse}
          className="fixed inset-0 top-14 bg-black/60 z-40 lg:block transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Expanded YouTube Sidebar */}
      <aside 
        className={`fixed top-14 left-0 bottom-0 w-60 bg-[#0f0f0f] border-r border-white/10 z-50 flex flex-col py-3 px-3 overflow-y-auto custom-scrollbar text-left select-none transition-transform duration-200 ease-out shadow-2xl ${
          isCollapsed ? '-translate-x-full pointer-events-none' : 'translate-x-0'
        }`}
        aria-label="Expanded sidebar navigation"
      >
        {/* Main Navigation (YouTube Style) */}
        <div className="flex flex-col gap-1 border-b border-white/10 pb-3">
          
          {/* Home */}
          <button
            onClick={() => {
              onToggleSavedOnly(false);
              setViewMode('feed');
              if (onToggleCollapse) onToggleCollapse();
            }}
            className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              viewMode === 'feed' && !showSavedOnly
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Home className={`w-5 h-5 ${viewMode === 'feed' && !showSavedOnly ? 'text-white stroke-[2.5]' : 'text-neutral-300'}`} />
            <span>Home</span>
          </button>

          {/* Shorts */}
          <button
            onClick={() => {
              onToggleSavedOnly(false);
              setViewMode('shorts');
              if (onToggleCollapse) onToggleCollapse();
            }}
            className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              viewMode === 'shorts'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clapperboard className={`w-5 h-5 ${viewMode === 'shorts' ? 'text-pink-400 stroke-[2.5]' : 'text-neutral-300'}`} />
            <span>Shorts</span>
          </button>

          {/* Longs */}
          <button
            onClick={() => {
              onToggleSavedOnly(false);
              setViewMode('longs');
              if (onToggleCollapse) onToggleCollapse();
            }}
            className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              viewMode === 'longs'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-200 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Tv className={`w-5 h-5 ${viewMode === 'longs' ? 'text-violet-400 stroke-[2.5]' : 'text-neutral-300'}`} />
            <span>Longs</span>
          </button>

        </div>

        {/* Subscriptions Section (Matching YouTube Screenshot) */}
        <div className="flex flex-col gap-1 border-b border-white/10 py-3">
          <div className="flex items-center justify-between px-3.5 py-1 text-sm font-bold text-white group cursor-pointer">
            <span>Subscriptions</span>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
          </div>
          
          {[
            { name: 'SmugAlana', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', hasDot: true },
            { name: 'AniQuickRecaps', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', hasDot: true },
            { name: 'Susu Recap', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', hasDot: false },
            { name: '7clouds', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', hasDot: false },
            { name: 'Two Minute Papers', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', hasDot: true },
            { name: 'Thomas Mulligan', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', hasDot: true },
            { name: 'Shania Yan', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', hasDot: false },
          ].map((sub) => (
            <button
              key={sub.name}
              onClick={() => {
                onToggleSavedOnly(false);
                setViewMode('feed');
                if (onToggleCollapse) onToggleCollapse();
              }}
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-sm text-neutral-200 hover:text-white hover:bg-white/10 transition-colors w-full text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={sub.avatar}
                  alt={sub.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                  referrerPolicy="no-referrer"
                />
                <span className="truncate text-sm font-medium">{sub.name}</span>
              </div>
              {sub.hasDot && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              )}
            </button>
          ))}

          {/* Show more button */}
          <button className="flex items-center gap-3.5 px-3.5 py-2 rounded-xl text-sm text-neutral-300 hover:text-white hover:bg-white/10 transition-colors w-full text-left">
            <ChevronDown className="w-4 h-4 text-neutral-400" />
            <span>Show more</span>
          </button>
        </div>

        {/* You Section */}
        <div className="flex flex-col gap-1 border-b border-white/10 py-3">
          <button
            onClick={() => {
              onToggleSavedOnly(true);
              setViewMode('feed');
              if (onToggleCollapse) onToggleCollapse();
            }}
            className={`flex items-center gap-4 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              showSavedOnly
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-white shadow-sm ${
              showSavedOnly ? 'ring-2 ring-sky-400' : 'ring-1 ring-white/40'
            }`}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5">
                <defs>
                  <linearGradient id="you_thumbs_expanded" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
                <rect x="2" y="9.5" width="4.5" height="12" rx="1.8" fill="url(#you_thumbs_expanded)" />
                <path d="M7.5 10.2L11 2.8C11.8 1.4 13.8 1.8 14 3.5L14 9.2H19.5C21.2 9.2 22.5 10.8 22.1 12.5L20.6 18.5C20.2 20 18.8 21.2 17.2 21.2H7.5V10.2Z" fill="url(#you_thumbs_expanded)" />
              </svg>
            </div>
            <span>You</span>
          </button>
        </div>

        {/* Preferences & Settings */}
        <div className="flex flex-col gap-2 pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLanguage}
              className="flex-1 flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/20 text-neutral-200 text-xs font-semibold transition-all hover:bg-neutral-800"
              title={`Language: ${selectedLanguage.name}`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <FlagIcon code={selectedLanguage.code} size="sm" />
                <span className="text-xs font-bold uppercase">{selectedLanguage.code}</span>
              </div>
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/20 text-neutral-200 text-xs font-semibold transition-all hover:bg-neutral-800"
              title={`Theme: ${theme}`}
            >
              {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-violet-300" />}
              {theme === 'stealth' && <Eye className="w-3.5 h-3.5 text-emerald-400" />}
              {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span className="capitalize text-xs">{theme}</span>
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};
