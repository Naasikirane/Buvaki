import React from 'react';
import { FilterSort, ViewMode, SupportedLanguage, Theme, User } from '../types';
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
  User as UserIcon,
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
  currentUser?: User | null;
  onOpenAuth?: () => void;
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
  currentUser,
  onOpenAuth,
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
        className="w-[72px] flex-shrink-0 hidden lg:flex flex-col items-center gap-1.5 py-3 px-1 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto no-scrollbar select-none z-20 bg-white border-r border-white dark:border-white/10"
        aria-label="Collapsed sidebar navigation"
      >
        {/* Home */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('feed');
          }}
          className={`w-full py-4 px-1 flex flex-col items-center justify-center rounded-xl transition-all ${
            viewMode === 'feed' && !showSavedOnly && activeFilter !== 'hot' && activeFilter !== 'discussed'
              ? 'bg-[#f2f2f2] text-[#0f0f0f] font-medium'
              : 'text-[#0f0f0f] hover:bg-[#f2f2f2]'
          }`}
          title="Home"
        >
          <Home className={`w-5 h-5 mb-1.5 ${viewMode === 'feed' && !showSavedOnly ? 'text-[#0f0f0f] stroke-[2.25] fill-[#0f0f0f]' : 'text-[#0f0f0f] stroke-[1.75]'}`} />
          <span className="text-[10px] leading-tight font-normal text-center truncate max-w-full">
            Home
          </span>
        </button>

        {/* Shorts */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('shorts');
          }}
          className={`w-full py-4 px-1 flex flex-col items-center justify-center rounded-xl transition-all ${
            viewMode === 'shorts'
              ? 'bg-[#f2f2f2] text-[#0f0f0f] font-medium'
              : 'text-[#0f0f0f] hover:bg-[#f2f2f2]'
          }`}
          title="Shorts"
        >
          <Clapperboard className={`w-5 h-5 mb-1.5 ${viewMode === 'shorts' ? 'text-[#ff0000] stroke-[2.25] fill-[#ff0000]/20' : 'text-[#0f0f0f] stroke-[1.75]'}`} />
          <span className="text-[10px] leading-tight font-normal text-center truncate max-w-full">
            Shorts
          </span>
        </button>

        {/* Videos / Longs */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('longs');
          }}
          className={`w-full py-4 px-1 flex flex-col items-center justify-center rounded-xl transition-all ${
            viewMode === 'longs'
              ? 'bg-[#f2f2f2] text-[#0f0f0f] font-medium'
              : 'text-[#0f0f0f] hover:bg-[#f2f2f2]'
          }`}
          title="Longs"
        >
          <Tv className={`w-5 h-5 mb-1.5 ${viewMode === 'longs' ? 'text-[#0f0f0f] stroke-[2.25]' : 'text-[#0f0f0f] stroke-[1.75]'}`} />
          <span className="text-[10px] leading-tight font-normal text-center truncate max-w-full">
            Longs
          </span>
        </button>

        {/* Subscriptions */}
        <button
          onClick={() => {
            if (onToggleCollapse) {
              onToggleCollapse();
            }
          }}
          className="w-full py-4 px-1 flex flex-col items-center justify-center rounded-xl transition-all text-[#0f0f0f] hover:bg-[#f2f2f2]"
          title="Subscriptions"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 mb-1.5 text-[#0f0f0f]"
          >
            <path d="M4 6h16" />
            <path d="M7 3h10" />
            <rect x="2" y="9" width="20" height="12" rx="2" />
            <polygon points="10 12 15 15 10 18" fill="currentColor" stroke="none" />
          </svg>
          <span className="text-[10px] leading-tight font-normal text-center truncate max-w-full">
            Subscriptions
          </span>
        </button>

        {/* You */}
        <button
          onClick={() => {
            if (!currentUser && onOpenAuth) {
              onOpenAuth();
              return;
            }
            onToggleSavedOnly(false);
            setViewMode('you');
          }}
          className={`w-full py-4 px-1 flex flex-col items-center justify-center rounded-xl transition-all group ${
            viewMode === 'you'
              ? 'bg-[#f2f2f2] text-[#0f0f0f] font-medium'
              : 'text-[#0f0f0f] hover:bg-[#f2f2f2]'
          }`}
          title="You"
        >
          <UserIcon className={`w-5 h-5 mb-1.5 ${viewMode === 'you' ? 'text-[#0f0f0f] stroke-[2.25] fill-[#0f0f0f]' : 'text-[#0f0f0f] stroke-[1.75]'}`} />
          <span className="text-[10px] leading-tight font-normal text-center truncate max-w-full">
            You
          </span>
        </button>

        {/* Bottom utility icons */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-2 border-t border-transparent w-full">
          <button
            onClick={onOpenLanguage}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#f2f2f2] text-[#606060] hover:text-[#0f0f0f] transition-all"
            title={`Language: ${selectedLanguage.name} (${selectedLanguage.code.toUpperCase()})`}
          >
            <FlagIcon code={selectedLanguage.code} size="sm" />
          </button>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#f2f2f2] text-[#606060] hover:text-[#0f0f0f] transition-all"
            title={`Theme: ${theme}`}
          >
            {theme === 'dark' && <Moon className="w-4 h-4 text-[#0f0f0f]" />}
            {theme === 'stealth' && <Eye className="w-4 h-4 text-[#0f0f0f]" />}
            {theme === 'light' && <Sun className="w-4 h-4 text-[#0f0f0f]" />}
          </button>
        </div>
      </aside>

      {/* Background backdrop when expanded in shorts mode or overlay */}
      {!isCollapsed && (
        <div 
          onClick={onToggleCollapse}
          className="fixed inset-0 top-14 bg-black/40 z-40 lg:block transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Expanded YouTube Sidebar */}
      <aside 
        className={`fixed top-14 left-0 bottom-0 w-60 bg-white border-r border-white dark:border-white/10 z-50 flex flex-col py-3 px-3 overflow-y-auto custom-scrollbar text-left select-none transition-transform duration-200 ease-out shadow-2xl ${
          isCollapsed ? '-translate-x-full pointer-events-none' : 'translate-x-0'
        }`}
        aria-label="Expanded sidebar navigation"
      >
        {/* Main Navigation (YouTube Style) */}
        <div className="flex flex-col gap-0.5 border-b border-[#0000001a] pb-3">
          
          {/* Home */}
          <button
            onClick={() => {
              onToggleSavedOnly(false);
              setViewMode('feed');
              if (onToggleCollapse) onToggleCollapse();
            }}
            className={`flex items-center gap-6 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              viewMode === 'feed' && !showSavedOnly
                ? 'bg-[#f2f2f2] text-[#0f0f0f] font-medium'
                : 'text-[#0f0f0f] hover:bg-[#f2f2f2] font-normal'
            }`}
          >
            <Home className={`w-5 h-5 ${viewMode === 'feed' && !showSavedOnly ? 'text-[#0f0f0f] stroke-[2.25] fill-[#0f0f0f]' : 'text-[#0f0f0f] stroke-[1.75]'}`} />
            <span>Home</span>
          </button>

          {/* Shorts */}
          <button
            onClick={() => {
              onToggleSavedOnly(false);
              setViewMode('shorts');
              if (onToggleCollapse) onToggleCollapse();
            }}
            className={`flex items-center gap-6 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              viewMode === 'shorts'
                ? 'bg-[#f2f2f2] text-[#0f0f0f] font-medium'
                : 'text-[#0f0f0f] hover:bg-[#f2f2f2] font-normal'
            }`}
          >
            <Clapperboard className={`w-5 h-5 ${viewMode === 'shorts' ? 'text-[#ff0000] stroke-[2.25] fill-[#ff0000]/20' : 'text-[#0f0f0f] stroke-[1.75]'}`} />
            <span>Shorts</span>
          </button>

          {/* Longs */}
          <button
            onClick={() => {
              onToggleSavedOnly(false);
              setViewMode('longs');
              if (onToggleCollapse) onToggleCollapse();
            }}
            className={`flex items-center gap-6 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              viewMode === 'longs'
                ? 'bg-[#f2f2f2] text-[#0f0f0f] font-medium'
                : 'text-[#0f0f0f] hover:bg-[#f2f2f2] font-normal'
            }`}
          >
            <Tv className={`w-5 h-5 ${viewMode === 'longs' ? 'text-[#0f0f0f] stroke-[2.25]' : 'text-[#0f0f0f] stroke-[1.75]'}`} />
            <span>Longs</span>
          </button>

          {/* Subscriptions */}
          <button
            onClick={() => {
              if (onToggleCollapse) onToggleCollapse();
            }}
            className="flex items-center gap-6 px-3 py-2.5 rounded-xl text-sm transition-colors text-[#0f0f0f] hover:bg-[#f2f2f2] font-normal"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-[#0f0f0f]"
            >
              <path d="M4 6h16" />
              <path d="M7 3h10" />
              <rect x="2" y="9" width="20" height="12" rx="2" />
              <polygon points="10 12 15 15 10 18" fill="currentColor" stroke="none" />
            </svg>
            <span>Subscriptions</span>
          </button>

        </div>

        {/* Guest Sign-in prompt matching YouTube */}
        {!currentUser && (
          <div className="px-3 py-4 border-b border-[#0000001a] flex flex-col items-start gap-2.5">
            <p className="text-sm text-[#0f0f0f] leading-snug">
              Sign in to like videos, comment, and subscribe.
            </p>
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
                if (onToggleCollapse) onToggleCollapse();
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#065fd4] hover:bg-[#def1ff] text-[#065fd4] font-medium text-sm transition-colors cursor-pointer"
            >
              <UserIcon className="w-4 h-4 stroke-[2]" />
              <span>Sign in</span>
            </button>
          </div>
        )}

        {/* Subscriptions Section (Matching YouTube Screenshot) */}
        <div className="flex flex-col gap-0.5 border-b border-[#0000001a] py-3">
          <div className="flex items-center justify-between px-3 py-1 text-base font-bold text-[#0f0f0f] group cursor-pointer">
            <span>Subscriptions</span>
            <ChevronRight className="w-4 h-4 text-[#606060] group-hover:text-[#0f0f0f] transition-colors" />
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
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-[#0f0f0f] hover:bg-[#f2f2f2] transition-colors w-full text-left"
            >
              <div className="flex items-center gap-6 min-w-0">
                <img
                  src={sub.avatar}
                  alt={sub.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-black/10"
                  referrerPolicy="no-referrer"
                />
                <span className="truncate text-sm font-normal text-[#0f0f0f]">{sub.name}</span>
              </div>
              {sub.hasDot && (
                <span className="w-1 h-1 rounded-full bg-[#065fd4] shrink-0" />
              )}
            </button>
          ))}

          {/* Show more button */}
          <button className="flex items-center gap-6 px-3 py-2 rounded-xl text-sm text-[#0f0f0f] hover:bg-[#f2f2f2] transition-colors w-full text-left">
            <ChevronDown className="w-4 h-4 text-[#606060]" />
            <span>Show more</span>
          </button>
        </div>

        {/* You Section */}
        <div className="flex flex-col gap-0.5 border-b border-[#0000001a] py-3">
          <button
            onClick={() => {
              if (!currentUser && onOpenAuth) {
                onOpenAuth();
                if (onToggleCollapse) onToggleCollapse();
                return;
              }
              onToggleSavedOnly(false);
              setViewMode('you');
              if (onToggleCollapse) onToggleCollapse();
            }}
            className={`flex items-center gap-6 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              viewMode === 'you'
                ? 'bg-[#f2f2f2] text-[#0f0f0f] font-medium'
                : 'text-[#0f0f0f] hover:bg-[#f2f2f2] font-normal'
            }`}
          >
            <UserIcon className={`w-5 h-5 ${viewMode === 'you' ? 'text-[#0f0f0f] stroke-[2.25] fill-[#0f0f0f]' : 'text-[#0f0f0f] stroke-[1.75]'}`} />
            <span>You</span>
          </button>
        </div>

        {/* Preferences & Settings */}
        <div className="flex flex-col gap-2 pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLanguage}
              className="flex-1 flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#0f0f0f] text-xs font-medium transition-colors"
              title={`Language: ${selectedLanguage.name}`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <FlagIcon code={selectedLanguage.code} size="sm" />
                <span className="text-xs font-bold uppercase">{selectedLanguage.code}</span>
              </div>
              <Globe className="w-3.5 h-3.5 text-[#606060]" />
            </button>

            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#0f0f0f] text-xs font-medium transition-colors"
              title={`Theme: ${theme}`}
            >
              {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-[#0f0f0f]" />}
              {theme === 'stealth' && <Eye className="w-3.5 h-3.5 text-[#0f0f0f]" />}
              {theme === 'light' && <Sun className="w-3.5 h-3.5 text-[#0f0f0f]" />}
              <span className="capitalize text-xs">{theme}</span>
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};
