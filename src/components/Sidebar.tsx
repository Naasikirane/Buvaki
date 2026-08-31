import React from 'react';
import { FilterSort, ViewMode, SupportedLanguage, Theme } from '../types';
import { getTranslation } from '../lib/translations';
import { FlagIcon } from './FlagIcon';
import { 
  Home,
  Flame, 
  Sparkles, 
  Bookmark, 
  Globe, 
  Moon, 
  Eye, 
  Sun,
  Clapperboard,
  Tv,
  Users,
  BarChart2,
  TrendingUp,
  MessageSquare
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
}) => {
  const t = getTranslation(selectedLanguage.code);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('stealth');
    else if (theme === 'stealth') setTheme('light');
    else setTheme('dark');
  };

  return (
    <aside className="w-60 flex-shrink-0 hidden lg:flex flex-col gap-5 py-3 pr-3 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar text-left select-none">
      
      {/* Navigation Section with Language and Theme */}
      <div className="flex flex-col gap-2">
        {/* Translation Flag and Dark/Light Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <button
            onClick={onOpenLanguage}
            className="flex-1 flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/30 text-neutral-200 text-xs font-semibold transition-all hover:bg-neutral-800"
            title={`Selected Language: ${selectedLanguage.name} (${selectedLanguage.nativeName})`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <FlagIcon code={selectedLanguage.code} size="sm" />
              <span className="text-xs font-bold">{selectedLanguage.code.toUpperCase()}</span>
            </div>
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 hover:border-white/30 text-neutral-200 text-xs font-semibold transition-all hover:bg-neutral-800"
            title={`Current Theme: ${theme.toUpperCase()}`}
          >
            {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-violet-300" />}
            {theme === 'stealth' && <Eye className="w-3.5 h-3.5 text-emerald-400" />}
            {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="capitalize text-xs">{theme}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation (YouTube Style) */}
      <div className="flex flex-col gap-1 border-b border-white/10 pb-4">
        
        {/* Home / Community Posts Feed */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('feed');
          }}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'feed' && !showSavedOnly
              ? 'bg-neutral-800 text-white font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Home className={`w-5 h-5 ${viewMode === 'feed' && !showSavedOnly ? 'text-white stroke-[2.5]' : 'text-neutral-400'}`} />
          <span>Home</span>
        </button>

        {/* Shorts */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('shorts');
          }}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'shorts'
              ? 'bg-neutral-800 text-white font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Clapperboard className={`w-5 h-5 ${viewMode === 'shorts' ? 'text-pink-400 stroke-[2.5]' : 'text-neutral-400'}`} />
          <span>Shorts</span>
        </button>

        {/* Longs */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('longs');
          }}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            viewMode === 'longs'
              ? 'bg-neutral-800 text-white font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Tv className={`w-5 h-5 ${viewMode === 'longs' ? 'text-violet-400 stroke-[2.5]' : 'text-neutral-400'}`} />
          <span>Longs</span>
        </button>

      </div>

      {/* Explore & Filters Section */}
      <div className="flex flex-col gap-1 border-b border-white/10 pb-4">
        <span className="px-3.5 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
          Explore
        </span>

        {/* Trending */}
        <button
          onClick={() => {
            onChangeFilter('hot');
            onToggleSavedOnly(false);
            setViewMode('feed');
          }}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeFilter === 'hot' && !showSavedOnly && viewMode === 'feed'
              ? 'bg-neutral-800 text-white font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Flame className="w-5 h-5 text-orange-400" />
          <span>Trending</span>
        </button>

        {/* Newest */}
        <button
          onClick={() => {
            onChangeFilter('new');
            onToggleSavedOnly(false);
            setViewMode('feed');
          }}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeFilter === 'new' && !showSavedOnly && viewMode === 'feed'
              ? 'bg-neutral-800 text-white font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>Newest</span>
        </button>

        {/* Top Discussions */}
        <button
          onClick={() => {
            onChangeFilter('discussed');
            onToggleSavedOnly(false);
            setViewMode('feed');
          }}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeFilter === 'discussed' && !showSavedOnly && viewMode === 'feed'
              ? 'bg-neutral-800 text-white font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <MessageSquare className="w-5 h-5 text-sky-400" />
          <span>Discussions</span>
        </button>

        {/* Saved / Bookmarks */}
        <button
          onClick={() => {
            onToggleSavedOnly(true);
            setViewMode('feed');
          }}
          className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showSavedOnly
              ? 'bg-neutral-800 text-white font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${showSavedOnly ? 'text-emerald-400 fill-emerald-400' : 'text-neutral-400'}`} />
          <span>Saved</span>
        </button>

      </div>

      {/* Channels / Creators Sample Highlights */}
      <div className="flex flex-col gap-1">
        <span className="px-3.5 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">
          Subscriptions
        </span>
        
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-neutral-300 hover:bg-neutral-900 transition-colors cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Anidong_Manhwa"
            className="w-6 h-6 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="truncate font-medium">Anidong_Manhwa</span>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-neutral-300 hover:bg-neutral-900 transition-colors cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
            alt="TechChronicles"
            className="w-6 h-6 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="truncate font-medium">TechChronicles</span>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-neutral-300 hover:bg-neutral-900 transition-colors cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
            alt="VisualStudio"
            className="w-6 h-6 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="truncate font-medium">VisualStories</span>
        </div>
      </div>

      {/* Buvaki Footer */}
      <div className="mt-auto p-3.5 rounded-2xl bg-neutral-900 border border-white/10 text-neutral-400 text-xs flex flex-col gap-1.5">
        <div className="flex items-center gap-2 font-bold text-white">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>Buvaki Community</span>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Community posts, photos, polls, shorts reels, and long videos.
        </p>
      </div>

    </aside>
  );
};
