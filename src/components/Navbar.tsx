import React, { useState, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const getScrollY = () => {
      return (
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      );
    };

    const handleScroll = () => {
      const currentScrollY = getScrollY();

      // Always show at top of page or when search/dropdown is active
      if (currentScrollY <= 15 || isSearchExpanded || isMenuOpen) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const diff = currentScrollY - lastScrollY.current;

      if (diff > 4 && currentScrollY > 40) {
        // Scrolling downwards -> hide
        setIsVisible(false);
      } else if (diff < -4) {
        // Scrolling upwards -> show
        setIsVisible(true);
      }

      lastScrollY.current = Math.max(0, currentScrollY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const currentTouchY = e.touches[0]?.clientY ?? 0;
      const deltaY = currentTouchY - touchStartY.current;
      const currentScrollY = getScrollY();

      if (currentScrollY <= 15 || isSearchExpanded || isMenuOpen) {
        setIsVisible(true);
        return;
      }

      if (deltaY < -8 && currentScrollY > 40) {
        // Swiping finger upwards = scrolling downwards -> hide
        setIsVisible(false);
      } else if (deltaY > 8) {
        // Swiping finger downwards = scrolling upwards -> show
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isSearchExpanded, isMenuOpen]);

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f0f0f] backdrop-blur-xl transition-all duration-300 ease-out will-change-transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
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
            {/* Custom Thumbs-Up Icon matching screenshot */}
            <div className="relative flex items-center justify-center shrink-0 w-7 h-7 text-neutral-200 group-hover:text-white transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 stroke-current"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Left cuff vertical pill */}
                <rect x="2.5" y="9.5" width="4" height="11.5" rx="1.8" />
                {/* Main thumb & hand contour */}
                <path d="M6.5 10.5L10.2 3.2C11 1.8 13.2 2.1 13.4 3.9L13.5 9.5H19C20.8 9.5 22.1 11.2 21.7 13L20.3 18.8C19.9 20.4 18.5 21.5 16.9 21.5H6.5" />
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
  );
};
