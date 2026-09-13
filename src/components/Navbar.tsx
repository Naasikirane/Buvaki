import React, { useState, useRef, useEffect } from 'react';
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
  MessageSquare,
  Menu,
  Mic,
  Clock,
  User as UserIcon
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
  onToggleSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
  onOpenLanguage?: () => void;
  theme?: string;
}

const SEARCH_SUGGESTIONS = [
  { text: 'chinese recap', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80' },
  { text: 'anime recap', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80' },
  { text: 'chinese drama', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { text: 'pretty little baby song', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80' },
  { text: "let's kiss forever", image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
  { text: 'blue', image: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=100&auto=format&fit=crop&q=80' },
  { text: 'songs', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80' },
  { text: 'startups', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80' },
  { text: 'elon musk beef with chess game', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80' },
  { text: 'elon musk beef with chase', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80' }
];

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
  onToggleSidebar,
  onOpenLanguage,
  theme = 'light'
}) => {
  const t = getTranslation(selectedLanguage.code);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 w-full border-b transition-colors ${
        theme === 'dark' ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-white'
      }`}>
        <div className="w-full h-14 flex items-center justify-between pr-3 sm:pr-4 lg:pr-6 gap-2 sm:gap-4">
          
          {/* Left: Hamburger Menu & YouTube-Style Brand Logo */}
          <div className="flex items-center min-w-0 shrink-0">
            {onToggleSidebar && (
              <div className="w-12 lg:w-[72px] flex items-center justify-center shrink-0">
                <button
                  onClick={onToggleSidebar}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors focus:outline-none ${
                    theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-[#0f0f0f]'
                  }`}
                  title="Guide"
                  aria-label="Toggle navigation guide"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (viewMode !== 'feed') {
                  setViewMode('feed');
                } else if (searchQuery) {
                  setSearchQuery('');
                  setIsSearchExpanded(false);
                }
              }}
              className="flex items-end gap-1.5 focus:outline-none h-14 pb-[22px] group"
              aria-label="Buvaki home"
            >
              {/* Thumbs Up Icon: Filled with Deep Sky Blue, aligned to base */}
              <div className="relative flex items-end justify-center shrink-0 w-[22px] h-[21px] group-hover:opacity-90 transition-opacity">
                <svg
                  viewBox="1 1.25 21.75 21.5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  {/* Hand & Thumb Body filled with Deep Sky Blue */}
                  <path
                    d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
                    fill="#00BFFF"
                    stroke="#00BFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Wrist Cuff divider matching the screenshot */}
                  <path
                    d="M7 10v12"
                    stroke={theme === 'dark' ? '#0f0f0f' : '#ffffff'}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* YouTube Typography Brand Title & KE superscript badge aligned on base */}
              <div className="relative inline-flex items-end">
                <span className={`text-[19px] font-bold tracking-tighter lowercase leading-none ${
                  theme === 'dark' ? 'text-white' : 'text-[#0f0f0f]'
                }`}>
                  buvaki
                </span>
                <sup className="text-[8.5px] font-normal text-[#606060] dark:text-[#aaaaaa] ml-0.5 self-start -mt-1.5 select-none leading-none tracking-normal">
                  KE
                </sup>
              </div>
            </button>
          </div>

          {/* Center: Desktop Search Bar (Exact YouTube Search Box & Voice Mic) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-auto items-center justify-center px-4">
            <div ref={searchBoxRef} className="relative flex items-center w-full max-w-[540px] lg:max-w-[580px] h-10">
              <div className={`flex-1 flex items-center h-full border rounded-l-full px-4 transition-all ${
                theme === 'dark'
                  ? 'border-white/20 focus-within:border-[#3ea6ff] bg-[#121212]'
                  : 'border-[#cccccc] focus-within:border-[#1c62b9] focus-within:shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] bg-white'
              }`}>
                <input
                  type="text"
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search"
                  className={`w-full bg-transparent text-sm focus:outline-none ${
                    theme === 'dark' ? 'text-white placeholder-[#aaaaaa]' : 'text-[#0f0f0f] placeholder-[#606060]'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-[#606060] hover:text-[#0f0f0f] transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                className={`h-full px-6 border border-l-0 rounded-r-full flex items-center justify-center transition-colors ${
                  theme === 'dark'
                    ? 'bg-[#222222] hover:bg-[#272727] border-white/20 text-white'
                    : 'bg-[#f8f8f8] hover:bg-[#f0f0f0] border-[#cccccc] text-[#0f0f0f]'
                }`}
                title="Search"
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>

              {/* YouTube Autocomplete / History Dropdown (Matching Longs_expectations.png) */}
              {isSearchFocused && (
                <div className="absolute top-11 left-0 w-full bg-white border border-[#0000001a] rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 text-left select-none">
                  {SEARCH_SUGGESTIONS
                    .filter(s => !searchQuery || s.text.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item, idx) => (
                      <div
                        key={idx}
                        onMouseDown={() => {
                          setSearchQuery(item.text);
                          setIsSearchFocused(false);
                        }}
                        className="flex items-center justify-between px-4 py-2 hover:bg-[#f2f2f2] cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Clock className="w-4 h-4 text-[#606060] shrink-0" />
                          <span className="text-sm font-medium text-[#0f0f0f] truncate group-hover:text-black">
                            {item.text}
                          </span>
                        </div>
                        <img
                          src={item.image}
                          alt={item.text}
                          className="w-8 h-6 rounded object-cover shrink-0 ml-3 ring-1 ring-black/5"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            {/* YouTube Microphone Button */}
            <button
              onClick={() => {
                if (searchQuery) setSearchQuery('');
              }}
              className={`w-10 h-10 ml-3 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                theme === 'dark'
                  ? 'bg-[#222222] hover:bg-[#272727] text-white'
                  : 'bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#0f0f0f]'
              }`}
              title="Search with your voice"
            >
              <Mic className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>

          {/* Right: Quick Actions (Create, Notifications, Profile/Auth, and More) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Mobile-only Collapsible Search */}
            <div className="md:hidden relative flex items-center">
              {isSearchExpanded || searchQuery ? (
                <div className="flex items-center gap-2 bg-[#f2f2f2] border border-[#cccccc] rounded-full px-3 py-1.5 shadow-md w-44 sm:w-56 transition-all duration-200">
                  <Search className="w-4 h-4 text-[#606060] shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery || ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-transparent text-xs text-[#0f0f0f] placeholder-[#606060] focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchExpanded(false);
                    }}
                    className="text-[#606060] hover:text-[#0f0f0f] p-0.5 rounded-full hover:bg-black/5 transition-colors"
                    title="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="p-2 rounded-full hover:bg-black/5 text-[#0f0f0f] transition-all"
                  title="Search"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 stroke-[1.75]" />
                </button>
              )}
            </div>

            {/* Desktop Quick Action: "+ Create" YouTube Pill Button */}
            <button
              onClick={onOpenCreatePost}
              className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-[#272727] hover:bg-[#3f3f3f] text-white'
                  : 'bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#0f0f0f]'
              }`}
              title="Create a post"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span>Create</span>
            </button>

            {/* Desktop & Mobile: Notifications Bell Icon with YouTube 9+ Badge */}
            <button
              onClick={onOpenNotifications}
              className={`relative p-2.5 rounded-full transition-colors ${
                theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-[#0f0f0f] hover:bg-black/5'
              }`}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[1.75]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 rounded-full bg-[#cc0000] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Desktop User Profile or YouTube Sign In Pill */}
            {currentUser ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-0.5 rounded-full focus:outline-none"
                title={currentUser.username}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-black/10"
                  referrerPolicy="no-referrer"
                />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#065fd4] hover:bg-[#def1ff] text-[#065fd4] font-medium text-sm transition-colors"
              >
                <UserIcon className="w-4 h-4 stroke-[2]" />
                <span>Sign in</span>
              </button>
            )}

            {/* 3-Dots Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2.5 rounded-full transition-colors ${
                  theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-[#0f0f0f] hover:bg-black/5'
                }`}
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5 stroke-[1.75]" />
              </button>

              {isMenuOpen && (
                <>
                  {/* Backdrop for closing dropdown */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMenuOpen(false)} 
                    aria-hidden="true"
                  />

                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                    {currentUser ? (
                      <button
                        onClick={() => {
                          onOpenProfile();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-900 hover:bg-slate-100 flex items-center gap-2.5"
                      >
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.username}
                          className="w-6 h-6 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{currentUser.username}</span>
                          <span className="text-[10px] text-slate-500">View profile</span>
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onOpenAuth();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-900 hover:bg-slate-100 flex items-center gap-2.5"
                      >
                        <LogIn className="w-4 h-4 text-sky-600" />
                        <span>Sign in / Register</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        onOpenNotifications();
                        setIsMenuOpen(false);
                      }}
                      className="sm:hidden w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bell className="w-4 h-4 text-slate-400" />
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
                        className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span>Language</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold px-1.5 py-0.5 rounded bg-slate-100 uppercase">
                          {selectedLanguage.code}
                        </span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenCreatePost();
                        setIsMenuOpen(false);
                      }}
                      className="sm:hidden w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5"
                    >
                      <Plus className="w-4 h-4 text-slate-400" />
                      <span>Create a post</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </header>
    </>
  );
};
