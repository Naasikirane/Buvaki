import React from 'react';
import { SubBuvaki, ChatChannel, FilterSort, ViewMode, SupportedLanguage, Theme } from '../types';
import { getTranslation } from '../lib/translations';
import { FlagIcon } from './FlagIcon';
import { CommunityIcon } from './CommunityIcon';
import { 
  Flame, 
  Sparkles, 
  Bookmark, 
  PlusCircle, 
  Compass, 
  Globe, 
  Moon, 
  Eye, 
  Sun,
  Clapperboard,
  Tv
} from 'lucide-react';

interface SidebarProps {
  subBuvakis: SubBuvaki[];
  activeSubBuvakiId: string | null;
  onSelectSubBuvaki: (id: string | null) => void;
  activeFilter: FilterSort;
  onChangeFilter: (filter: FilterSort) => void;
  showSavedOnly: boolean;
  onToggleSavedOnly: (saved: boolean) => void;
  channels?: ChatChannel[];
  activeChannelId?: string;
  onSelectChannel?: (id: string) => void;
  onOpenCreateSub: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedLanguage: SupportedLanguage;
  onOpenLanguage: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  subBuvakis,
  activeSubBuvakiId,
  onSelectSubBuvaki,
  activeFilter,
  onChangeFilter,
  showSavedOnly,
  onToggleSavedOnly,
  onOpenCreateSub,
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
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-5 py-2 sm:py-3 pr-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
      
      {/* Navigation Section with Language and Theme */}
      <div className="flex flex-col gap-2">
        <div className="px-3 text-[11px] font-bold text-violet-400 uppercase tracking-wider">
          Navigation
        </div>

        {/* Translation Flag and Dark/Light Mode Switcher - Lined Horizontally */}
        <div className="flex items-center gap-2 px-3">
          {/* Language Selector Pill */}
          <button
            onClick={onOpenLanguage}
            className="flex-1 flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/90 border border-violet-900/40 hover:border-violet-500/60 text-slate-200 text-xs font-semibold transition-all hover:bg-slate-800/80 shadow-sm"
            title={`Selected Language: ${selectedLanguage.name} (${selectedLanguage.nativeName})`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <FlagIcon code={selectedLanguage.code} size="sm" />
              <span className="text-xs font-bold">{selectedLanguage.code.toUpperCase()}</span>
            </div>
            <Globe className="w-3.5 h-3.5 text-violet-400 opacity-70" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/90 border border-violet-900/40 hover:border-violet-500/60 text-slate-200 text-xs font-semibold transition-all hover:bg-slate-800/80 shadow-sm"
            title={`Current Theme: ${theme.toUpperCase()} (Click to toggle)`}
          >
            {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-violet-300" />}
            {theme === 'stealth' && <Eye className="w-3.5 h-3.5 text-pink-400" />}
            {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="capitalize text-xs">{theme}</span>
          </button>
        </div>
      </div>

      {/* Feeds Section */}
      <div className="flex flex-col gap-1">
        <div className="px-3 text-[11px] font-bold text-violet-400 uppercase tracking-wider mb-1">
          {t.feedsAndDiscover}
        </div>

        <button
          onClick={() => {
            onSelectSubBuvaki(null);
            onToggleSavedOnly(false);
            setViewMode('feed');
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubBuvakiId === null && !showSavedOnly && viewMode === 'feed'
              ? 'bg-violet-950/80 border border-violet-800/50 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Compass className="w-4 h-4 text-violet-400" />
          {t.allSubBuvakis}
        </button>

        <button
          onClick={() => {
            onSelectSubBuvaki(null);
            onChangeFilter('hot');
            onToggleSavedOnly(false);
            setViewMode('feed');
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'hot' && !showSavedOnly && activeSubBuvakiId === null && viewMode === 'feed'
              ? 'bg-violet-950/80 border border-violet-800/50 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          {t.popularHotFeeds}
        </button>

        {/* Shorts (Short Videos) */}
        <button
          onClick={() => {
            setViewMode('shorts');
            onToggleSavedOnly(false);
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            viewMode === 'shorts'
              ? 'bg-violet-950/80 border border-violet-800/50 text-pink-300 shadow-sm font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Clapperboard className="w-4 h-4 text-pink-400" />
          <span>Shorts (Short Videos)</span>
        </button>

        {/* Longs (Long Videos) */}
        <button
          onClick={() => {
            setViewMode('longs');
            onToggleSavedOnly(false);
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            viewMode === 'longs'
              ? 'bg-violet-950/80 border border-violet-800/50 text-violet-300 shadow-sm font-bold'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Tv className="w-4 h-4 text-violet-400" />
          <span>Longs (Long Videos)</span>
        </button>

        <button
          onClick={() => {
            onToggleSavedOnly(true);
            setViewMode('feed');
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            showSavedOnly
              ? 'bg-violet-950/80 border border-violet-800/50 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Bookmark className="w-4 h-4 text-emerald-400" />
          {t.savedBookmarks}
        </button>
      </div>

      {/* Sub-Buvakis Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-3 mb-1">
          <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
            {t.subBuvakisHeader}
          </span>
          <button
            onClick={onOpenCreateSub}
            className="p-1 text-violet-400 hover:text-emerald-400 transition-colors"
            title={t.createSubBuvaki}
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>

        {subBuvakis.map((sub) => {
          const isActive = activeSubBuvakiId === sub.id && viewMode === 'feed';
          return (
            <button
              key={sub.id}
              onClick={() => {
                onSelectSubBuvaki(sub.id);
                onToggleSavedOnly(false);
                setViewMode('feed');
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-violet-900/80 border border-violet-700/60 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CommunityIcon 
                  sub={sub}
                  size="xs" 
                />
                <span className="truncate">{sub.displayName}</span>
              </div>
              <span className="text-[10px] text-slate-500 group-hover:text-violet-300">
                {(sub.memberCount / 1000).toFixed(1)}k
              </span>
            </button>
          );
        })}
      </div>

      {/* Buvaki Platform Footer Card */}
      <div className="mt-auto p-4 rounded-2xl bg-slate-900/90 border border-violet-900/30 text-slate-300 text-xs flex flex-col gap-2">
        <div className="flex items-center gap-2 font-bold text-violet-300">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Buvaki Community</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Modern social media for community stories, shorts reels, long videos & vibrant discussions.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-violet-900/20 font-mono">
          <span>v2.5 Social</span>
          <span className="text-pink-400">● Active Feeds</span>
        </div>
      </div>

    </aside>
  );
};
