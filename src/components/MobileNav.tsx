import React from 'react';
import { ViewMode, SupportedLanguage, Theme, User } from '../types';
import { getTranslation } from '../lib/translations';
import { FlagIcon } from './FlagIcon';
import { 
  Home,
  Plus, 
  X, 
  Bookmark, 
  Flame, 
  Sparkles,
  Moon, 
  Eye, 
  Sun, 
  Globe, 
  Clapperboard, 
  Tv, 
  LogIn,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';

interface MobileNavProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentUser?: User | null;
  onOpenCreatePost: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  isMobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
  showSavedOnly: boolean;
  onToggleSavedOnly: (saved: boolean) => void;
  selectedLanguage: SupportedLanguage;
  onOpenLanguage: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  viewMode,
  setViewMode,
  currentUser,
  onOpenCreatePost,
  onOpenProfile,
  isMobileSidebarOpen,
  onCloseMobileSidebar,
  showSavedOnly,
  onToggleSavedOnly,
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
    <>
      {/* Bottom Navigation Bar (Matching Screenshot 1) */}
      <nav className={`${viewMode === 'shorts' ? 'flex' : 'lg:hidden flex'} fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f0f]/95 border-t border-white/10 backdrop-blur-lg px-2 py-1.5 items-center justify-around shadow-2xl max-w-md mx-auto`}>
        
        {/* Home / Feed Tab */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('feed');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            viewMode === 'feed' && !showSavedOnly ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Shorts Tab */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('shorts');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            viewMode === 'shorts' ? 'text-pink-400 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Clapperboard className="w-5 h-5" />
          <span className="text-[10px]">Shorts</span>
        </button>

        {/* Center Floating (+) Post Button */}
        <button
          onClick={onOpenCreatePost}
          className="flex items-center justify-center w-11 h-11 -mt-4 rounded-full bg-white hover:bg-neutral-200 text-black shadow-lg active:scale-95 transition-all border-2 border-black"
          aria-label={t.createPost}
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Longs Tab */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('longs');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            viewMode === 'longs' ? 'text-violet-400 font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px]">Longs</span>
        </button>

        {/* You / Profile Tab */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-neutral-400 hover:text-white transition-all"
        >
          {currentUser ? (
            <>
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20"
                referrerPolicy="no-referrer"
              />
              <span className="text-[10px] truncate max-w-[60px]">You</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 text-neutral-400" />
              <span className="text-[10px]">Sign In</span>
            </>
          )}
        </button>

      </nav>

      {/* Slide-over Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobileSidebar}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-[#0f0f0f] border-r border-white/10 p-5 flex flex-col gap-5 overflow-y-auto z-10 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-bold text-white text-sm">
                Navigation
              </span>
              <button
                onClick={onCloseMobileSidebar}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white bg-neutral-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Translation Flag and Theme Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onOpenLanguage();
                  onCloseMobileSidebar();
                }}
                className="flex-1 flex items-center justify-between gap-1 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-200 text-xs font-semibold hover:border-white/30 transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <FlagIcon code={selectedLanguage.code} size="sm" />
                  <span>{selectedLanguage.code.toUpperCase()}</span>
                </div>
                <Globe className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-200 text-xs font-semibold hover:border-white/30 transition-all"
              >
                {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-violet-300" />}
                {theme === 'stealth' && <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span className="capitalize">{theme}</span>
              </button>
            </div>

            {/* Navigation items */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Explore
              </span>
              
              <button
                onClick={() => {
                  onToggleSavedOnly(false);
                  setViewMode('feed');
                  onCloseMobileSidebar();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 bg-neutral-900"
              >
                <Home className="w-4 h-4 text-white" /> Home
              </button>
              
              <button
                onClick={() => {
                  setViewMode('shorts');
                  onCloseMobileSidebar();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-pink-300 bg-neutral-900"
              >
                <Clapperboard className="w-4 h-4 text-pink-400" /> Shorts
              </button>

              <button
                onClick={() => {
                  setViewMode('longs');
                  onCloseMobileSidebar();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-violet-300 bg-neutral-900"
              >
                <Tv className="w-4 h-4 text-violet-400" /> Longs
              </button>

              <button
                onClick={() => {
                  onToggleSavedOnly(true);
                  setViewMode('feed');
                  onCloseMobileSidebar();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 bg-neutral-900"
              >
                <Bookmark className="w-4 h-4 text-emerald-400" /> Saved Posts
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
