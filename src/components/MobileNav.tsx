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
  onRequireAuth?: (promptReason?: string) => void;
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
  onRequireAuth,
}) => {
  const t = getTranslation(selectedLanguage.code);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('stealth');
    else if (theme === 'stealth') setTheme('light');
    else setTheme('dark');
  };

  return (
    <>
      {/* Bottom Navigation Bar (Mobile only) */}
      <nav className="lg:hidden flex fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-lg px-2 py-1.5 items-center justify-around shadow-2xl max-w-md mx-auto">
        
        {/* Home / Feed Tab */}
        <button
          onClick={() => {
            onToggleSavedOnly(false);
            setViewMode('feed');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            viewMode === 'feed' && !showSavedOnly ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
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
            viewMode === 'shorts' ? 'text-pink-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clapperboard className="w-5 h-5" />
          <span className="text-[10px]">Shorts</span>
        </button>

        {/* Center Floating (+) Post Button */}
        <button
          onClick={() => {
            if (!currentUser && onRequireAuth) {
              onRequireAuth('Sign in or create an account to create a post');
              return;
            }
            onOpenCreatePost();
          }}
          className="flex items-center justify-center w-11 h-11 -mt-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg active:scale-95 transition-all border-2 border-white"
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
            viewMode === 'longs' ? 'text-violet-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px]">Longs</span>
        </button>

        {/* You / Profile Tab */}
        <button
          onClick={() => {
            if (!currentUser && onRequireAuth) {
              onRequireAuth('Sign in to access your channel and saved library');
              return;
            }
            onOpenProfile();
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            viewMode === 'you' ? 'text-[#0f0f0f] font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {currentUser ? (
            <>
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className={`w-5 h-5 rounded-full object-cover ring-1 ${
                  viewMode === 'you' ? 'ring-2 ring-black' : 'ring-slate-300'
                }`}
                referrerPolicy="no-referrer"
              />
              <span className="text-[10px] truncate max-w-[60px]">You</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 text-slate-500" />
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
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white border-r border-slate-200 p-5 flex flex-col gap-5 overflow-y-auto z-10 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-bold text-slate-900 text-sm">
                Navigation
              </span>
              <button
                onClick={onCloseMobileSidebar}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 bg-slate-100"
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
                className="flex-1 flex items-center justify-between gap-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <FlagIcon code={selectedLanguage.code} size="sm" />
                  <span>{selectedLanguage.code.toUpperCase()}</span>
                </div>
                <Globe className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold hover:border-slate-300 transition-all"
              >
                {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-violet-600" />}
                {theme === 'stealth' && <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span className="capitalize">{theme}</span>
              </button>
            </div>

            {/* Navigation items */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Explore
              </span>
              
              <button
                onClick={() => {
                  onToggleSavedOnly(false);
                  setViewMode('feed');
                  onCloseMobileSidebar();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                <Home className="w-4 h-4 text-slate-900" /> Home
              </button>
              
              <button
                onClick={() => {
                  setViewMode('shorts');
                  onCloseMobileSidebar();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-pink-700 bg-pink-50 hover:bg-pink-100"
              >
                <Clapperboard className="w-4 h-4 text-pink-600" /> Shorts
              </button>

              <button
                onClick={() => {
                  setViewMode('longs');
                  onCloseMobileSidebar();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100"
              >
                <Tv className="w-4 h-4 text-violet-600" /> Longs
              </button>

              <button
                onClick={() => {
                  onToggleSavedOnly(true);
                  setViewMode('feed');
                  onCloseMobileSidebar();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                <Bookmark className="w-4 h-4 text-emerald-600" /> Saved Posts
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
