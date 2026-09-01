import React, { useState } from 'react';
import { ViewMode, User, NotificationItem, SupportedLanguage } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Search, 
  Plus, 
  Bell, 
  MoreVertical,
  X, 
  LogIn,
  Moon,
  Sun,
  Globe,
  MessageSquare
} from 'lucide-react';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: User | null;
  selectedLanguage: SupportedLanguage;
  onOpenCreatePost: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  notifications: NotificationItem[];
  onToggleMobileSidebar?: () => void;
  onOpenLanguage?: () => void;
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
  onOpenLanguage,
}) => {
  const t = getTranslation(selectedLanguage.code);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 w-full border-b border-white/10 bg-[#0f0f0f] backdrop-blur-xl">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
        
        {/* Left: Thumbs-Up Icon & Brand Title "buvaki" */}
        <div className="flex items-center min-w-0">
          <button
            onClick={() => {
              if (viewMode !== 'feed') {
                setViewMode('feed');
              } else if (searchQuery) {
                setSearchQuery('');
                setIsSearchExpanded(false);
              }
            }}
            className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity focus:outline-none py-1 -ml-1 group"
            aria-label="buvaki home"
          >
            {/* Custom Thumbs-Up Icon with ocean blue fill */}
            <div className="relative flex items-center justify-center shrink-0 w-7 h-7">
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 transform transition-transform duration-200 group-hover:scale-105"
              >
                <defs>
                  <linearGradient id="ocean_blue_thumbs" x1="0%" y1="0%" x2="100%" y2="100%">
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
                  fill="url(#ocean_blue_thumbs)" 
                />
                {/* Main thumb & hand body */}
                <path 
                  d="M7.5 10.2L11 2.8C11.8 1.4 13.8 1.8 14 3.5L14 9.2H19.5C21.2 9.2 22.5 10.8 22.1 12.5L20.6 18.5C20.2 20 18.8 21.2 17.2 21.2H7.5V10.2Z" 
                  fill="url(#ocean_blue_thumbs)"
                />
              </svg>
            </div>

            <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans lowercase">
              buvaki
            </span>
          </button>
        </div>

        {/* Right: Search, Create, 3 Dots Menu (Matching Screenshots: "🔍  ⋮") */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Collapsible / Expanding Search Bar */}
          <div className="relative flex items-center">
            {isSearchExpanded || searchQuery ? (
              <div className="flex items-center gap-2 bg-neutral-900 border border-white/20 rounded-full px-3 py-1.5 shadow-lg w-44 sm:w-60 transition-all duration-200">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchExpanded(false);
                  }}
                  className="text-neutral-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
                  title="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-all"
                title="Search"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 3-Dots Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-all"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-neutral-900 border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                {currentUser ? (
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-white hover:bg-white/10 flex items-center gap-2.5"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-6 h-6 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{currentUser.username}</span>
                      <span className="text-[10px] text-neutral-400">View profile</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-white hover:bg-white/10 flex items-center gap-2.5"
                  >
                    <LogIn className="w-4 h-4 text-sky-400" />
                    <span>Sign in / Register</span>
                  </button>
                )}

                <div className="my-1 border-t border-white/10" />

                <button
                  onClick={() => {
                    onOpenNotifications();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-neutral-400" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {onOpenLanguage && (
                  <button
                    onClick={() => {
                      onOpenLanguage();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-white/10 flex items-center gap-2.5"
                  >
                    <Globe className="w-4 h-4 text-neutral-400" />
                    <span>Language ({selectedLanguage.name})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenCreatePost();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-neutral-200 hover:bg-white/10 flex items-center gap-2.5"
                >
                  <Plus className="w-4 h-4 text-neutral-400" />
                  <span>Create a post</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
    {/* Permanent spacer matching fixed navbar height */}
    <div className="h-14 w-full shrink-0" aria-hidden="true" />
  </>
  );
};
