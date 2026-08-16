import React, { useState } from 'react';
import { Logo } from './Logo';
import { ViewMode, User, NotificationItem, SupportedLanguage } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Search, 
  Plus, 
  Bell, 
  MessageSquare, 
  Layers, 
  SlidersHorizontal,
  Radio,
  Sparkles,
  X
} from 'lucide-react';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: User;
  selectedLanguage: SupportedLanguage;
  onOpenCreatePost: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  notifications: NotificationItem[];
  activeSubBuvakiName?: string;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  currentUser,
  selectedLanguage,
  onOpenCreatePost,
  onOpenNotifications,
  onOpenProfile,
  onOpenAuth,
  notifications,
  activeSubBuvakiName,
  onToggleMobileSidebar,
}) => {
  const t = getTranslation(selectedLanguage.code);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-violet-900/30 bg-slate-950/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Mobile Sidebar Trigger + Logo + Sub Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
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

        {/* Right Actions & Controls (Search collapsed into icon on the right) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* View Mode Switcher (Feed vs Chat vs Split) */}
          <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-900 border border-violet-900/40">
            <button
              onClick={() => setViewMode('feed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'feed'
                  ? 'bg-violet-600 text-white shadow-sm'
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
                  ? 'bg-violet-600 text-white shadow-sm'
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
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {t.splitView}
            </button>
          </div>

          {/* Collapsible Search Bar pushed to the Right of Top Nav */}
          <div className="relative flex items-center">
            {isSearchExpanded || searchQuery ? (
              <div className="flex items-center gap-2 bg-slate-900/95 border border-violet-500/70 rounded-full px-3 py-1.5 shadow-lg w-48 sm:w-64 transition-all duration-200">
                <Search className="w-4 h-4 text-violet-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchExpanded(false);
                  }}
                  className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition-colors"
                  title="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="p-2 rounded-xl bg-slate-900/80 border border-violet-900/40 text-slate-300 hover:text-white hover:border-violet-500/50 hover:bg-slate-850 transition-all"
                title="Search Buvaki"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Create Post Button (Desktop only, as bottom bar handles mobile/tablet) */}
          <button
            onClick={onOpenCreatePost}
            className="hidden lg:flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-violet-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.createPost}</span>
          </button>

          {/* Notifications Bell (Desktop only, as bottom bar handles mobile/tablet) */}
          <button
            onClick={onOpenNotifications}
            className="hidden lg:flex relative p-2 rounded-xl bg-slate-900/80 border border-violet-900/40 text-slate-300 hover:text-white hover:border-violet-500/50 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar (Desktop only, as bottom bar handles mobile/tablet) */}
          <button
            onClick={onOpenProfile}
            className="hidden lg:flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-violet-900/40 hover:border-violet-500/50 transition-all"
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
              <span className="text-[10px] text-pink-400 font-medium leading-none mt-0.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-pink-400" />
                <span>{currentUser.karma}</span>
              </span>
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
