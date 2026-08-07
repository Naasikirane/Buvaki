import React from 'react';
import { Logo } from './Logo';
import { FlagIcon } from './FlagIcon';
import { ViewMode, Theme, User, NotificationItem, SupportedLanguage } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Search, 
  Plus, 
  Bell, 
  MessageSquare, 
  Layers, 
  Eye, 
  Sun, 
  Moon, 
  ShieldAlert, 
  SlidersHorizontal,
  Flame,
  Radio,
  Globe,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: User;
  selectedLanguage: SupportedLanguage;
  onOpenCreatePost: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenLanguage: () => void;
  onOpenAuth: () => void;
  notifications: NotificationItem[];
  activeSubBuvakiName?: string;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  theme,
  setTheme,
  searchQuery,
  setSearchQuery,
  currentUser,
  selectedLanguage,
  onOpenCreatePost,
  onOpenNotifications,
  onOpenProfile,
  onOpenLanguage,
  onOpenAuth,
  notifications,
  activeSubBuvakiName,
  onToggleMobileSidebar,
}) => {
  const t = getTranslation(selectedLanguage.code);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('stealth');
    else if (theme === 'stealth') setTheme('light');
    else setTheme('dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-violet-900/30 bg-slate-950/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Mobile Sidebar Trigger + Logo + Sub Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Open menu"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          <button 
            onClick={() => {
              setViewMode('feed');
            }}
            className="flex items-center group text-left"
          >
            <Logo size="md" />
          </button>

          {activeSubBuvakiName && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-950/60 border border-violet-800/40 text-xs font-semibold text-violet-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {activeSubBuvakiName}
            </div>
          )}
        </div>

        {/* Center: Real-time Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400/70 group-focus-within:text-violet-300 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full bg-slate-900/90 border border-violet-900/40 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Actions & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* View Mode Switcher (Feed vs Chat vs Split) */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-900 border border-violet-900/40">
            <button
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'feed'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {t.feedView}
            </button>
            <button
              onClick={() => setViewMode('chat')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'chat'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {t.chatView}
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {t.splitView}
            </button>
          </div>

          {/* Language Selector Pill */}
          <button
            onClick={onOpenLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-violet-900/40 hover:border-violet-500/50 text-slate-200 text-xs font-medium transition-all"
            title={`Selected Language: ${selectedLanguage.name} (${selectedLanguage.nativeName})`}
          >
            <FlagIcon code={selectedLanguage.code} size="sm" />
            <span className="hidden md:inline text-xs font-semibold">{selectedLanguage.code.toUpperCase()}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900/80 border border-violet-900/40 text-violet-300 hover:text-white hover:border-violet-500/50 transition-all relative group"
            title={`Current Theme: ${theme.toUpperCase()} (Click to change)`}
          >
            {theme === 'dark' && <Moon className="w-4 h-4 text-violet-300" />}
            {theme === 'stealth' && <ShieldAlert className="w-4 h-4 text-emerald-400 animate-pulse" />}
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Create Post Button */}
          <button
            onClick={onOpenCreatePost}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-emerald-500 hover:from-violet-500 hover:to-emerald-400 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-violet-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t.createPost}</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-900/80 border border-violet-900/40 text-slate-300 hover:text-white hover:border-violet-500/50 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-fuchsia-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-violet-900/40 hover:border-violet-500/50 transition-all"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-violet-500/50"
              referrerPolicy="no-referrer"
            />
            <div className="hidden xl:flex flex-col text-left pr-1">
              <span className="text-xs font-bold text-slate-100 leading-none">
                {currentUser.username}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium leading-none mt-0.5">
                {currentUser.karma} 🌪️
              </span>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
