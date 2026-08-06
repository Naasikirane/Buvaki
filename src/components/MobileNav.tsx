import React from 'react';
import { ViewMode, SubBuvaki, ChatChannel, FilterSort, NotificationItem, SupportedLanguage } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  Layers, 
  MessageSquare, 
  Plus, 
  Bell, 
  User as UserIcon, 
  X, 
  Compass, 
  Bookmark, 
  Flame, 
  PlusCircle, 
  Hash, 
  Volume2, 
  ShieldCheck,
  Radio
} from 'lucide-react';

interface MobileNavProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenCreatePost: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  notifications: NotificationItem[];
  isMobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
  subBuvakis: SubBuvaki[];
  activeSubBuvakiId: string | null;
  onSelectSubBuvaki: (id: string | null) => void;
  channels: ChatChannel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  onOpenCreateSub: () => void;
  showSavedOnly: boolean;
  onToggleSavedOnly: (saved: boolean) => void;
  selectedLanguage?: SupportedLanguage;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  viewMode,
  setViewMode,
  onOpenCreatePost,
  onOpenNotifications,
  onOpenProfile,
  notifications,
  isMobileSidebarOpen,
  onCloseMobileSidebar,
  subBuvakis,
  activeSubBuvakiId,
  onSelectSubBuvaki,
  channels,
  activeChannelId,
  onSelectChannel,
  onOpenCreateSub,
  showSavedOnly,
  onToggleSavedOnly,
  selectedLanguage,
}) => {
  const t = getTranslation(selectedLanguage?.code || 'en');
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-violet-900/40 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around shadow-2xl">
        
        {/* Feed Tab */}
        <button
          onClick={() => setViewMode('feed')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            viewMode === 'feed' ? 'text-violet-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">{t.feedView}</span>
        </button>

        {/* Chat Tab */}
        <button
          onClick={() => setViewMode('chat')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            viewMode === 'chat' ? 'text-violet-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">{t.chatView}</span>
        </button>

        {/* Center Floating (+) Post Button */}
        <button
          onClick={onOpenCreatePost}
          className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-emerald-500 text-white shadow-lg shadow-violet-600/30 active:scale-90 transition-all border-2 border-slate-950"
          aria-label={t.createPost}
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Notifications Tab */}
        <button
          onClick={onOpenNotifications}
          className="relative flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">{t.notifications}</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-fuchsia-500 animate-ping" />
          )}
        </button>

        {/* Profile Tab */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px]">{t.myProfile}</span>
        </button>

      </nav>

      {/* Slide-over Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobileSidebar}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-slate-950 border-r border-violet-900/40 p-5 flex flex-col gap-6 overflow-y-auto z-10">
            <div className="flex items-center justify-between border-b border-violet-900/30 pb-3">
              <span className="font-bold text-violet-300 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Navigation
              </span>
              <button
                onClick={onCloseMobileSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feeds */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                Feeds
              </span>
              <button
                onClick={() => {
                  onSelectSubBuvaki(null);
                  onToggleSavedOnly(false);
                  setViewMode('feed');
                  onCloseMobileSidebar();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-900/80"
              >
                <Compass className="w-4 h-4 text-violet-400" /> {t.allSubBuvakis}
              </button>
              <button
                onClick={() => {
                  onToggleSavedOnly(true);
                  setViewMode('feed');
                  onCloseMobileSidebar();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-900/80"
              >
                <Bookmark className="w-4 h-4 text-emerald-400" /> {t.savedPosts}
              </button>
            </div>

            {/* Sub-buvakis */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                  {t.subBuvakisHeader}
                </span>
                <button
                  onClick={() => {
                    onOpenCreateSub();
                    onCloseMobileSidebar();
                  }}
                  className="text-xs text-emerald-400 font-medium"
                >
                  {t.createCommunity}
                </button>
              </div>
              {subBuvakis.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    onSelectSubBuvaki(sub.id);
                    onToggleSavedOnly(false);
                    setViewMode('feed');
                    onCloseMobileSidebar();
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeSubBuvakiId === sub.id
                      ? 'bg-violet-900/80 text-white font-bold'
                      : 'text-slate-300 bg-slate-900/40'
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.displayName}</span>
                </button>
              ))}
            </div>

            {/* Channels */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> {t.liveChatChannels}
              </span>
              {channels.map((chan) => (
                <button
                  key={chan.id}
                  onClick={() => {
                    onSelectChannel(chan.id);
                    setViewMode('chat');
                    onCloseMobileSidebar();
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeChannelId === chan.id
                      ? 'bg-emerald-950/80 text-white font-bold'
                      : 'text-slate-300 bg-slate-900/40'
                  }`}
                >
                  {chan.type === 'voice' ? (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Hash className="w-3.5 h-3.5 text-violet-400" />
                  )}
                  <span>{chan.name}</span>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
