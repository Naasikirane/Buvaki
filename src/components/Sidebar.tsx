import React from 'react';
import { SubBuvaki, ChatChannel, FilterSort, ViewMode, SupportedLanguage } from '../types';
import { getTranslation } from '../lib/translations';
import { CommunityIcon } from './CommunityIcon';
import { 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Bookmark, 
  PlusCircle, 
  Compass, 
  Hash, 
  Volume2, 
  Globe, 
  ShieldCheck, 
  Radio,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  subBuvakis: SubBuvaki[];
  activeSubBuvakiId: string | null;
  onSelectSubBuvaki: (id: string | null) => void;
  activeFilter: FilterSort;
  onChangeFilter: (filter: FilterSort) => void;
  showSavedOnly: boolean;
  onToggleSavedOnly: (saved: boolean) => void;
  channels: ChatChannel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  onOpenCreateSub: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedLanguage: SupportedLanguage;
}

export const Sidebar: React.FC<SidebarProps> = ({
  subBuvakis,
  activeSubBuvakiId,
  onSelectSubBuvaki,
  activeFilter,
  onChangeFilter,
  showSavedOnly,
  onToggleSavedOnly,
  channels,
  activeChannelId,
  onSelectChannel,
  onOpenCreateSub,
  viewMode,
  setViewMode,
  selectedLanguage,
}) => {
  const t = getTranslation(selectedLanguage.code);

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-5 py-2 sm:py-3 pr-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
      
      {/* Feeds Section */}
      <div className="flex flex-col gap-1">
        <div className="px-3 text-[11px] font-bold text-violet-400 uppercase tracking-wider mb-1">
          {t.feedsAndDiscover}
        </div>

        <button
          onClick={() => {
            onSelectSubBuvaki(null);
            onToggleSavedOnly(false);
            if (viewMode === 'chat') setViewMode('feed');
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubBuvakiId === null && !showSavedOnly
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
            if (viewMode === 'chat') setViewMode('feed');
          }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeFilter === 'hot' && !showSavedOnly && activeSubBuvakiId === null
              ? 'bg-violet-950/80 border border-violet-800/50 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          {t.popularHotFeeds}
        </button>

        <button
          onClick={() => {
            onToggleSavedOnly(true);
            if (viewMode === 'chat') setViewMode('feed');
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
          const isActive = activeSubBuvakiId === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                onSelectSubBuvaki(sub.id);
                onToggleSavedOnly(false);
                if (viewMode === 'chat') setViewMode('feed');
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

      {/* Live Chat & Voice Rooms Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-3 mb-1">
          <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
            {t.liveChatChannels}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-pink-400 font-mono">
            <Radio className="w-3 h-3 animate-pulse" /> Live
          </span>
        </div>

        {channels.map((chan) => {
          const isActive = activeChannelId === chan.id && (viewMode === 'chat' || viewMode === 'split');
          const cleanChanName = chan.name.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '').trim();

          return (
            <button
              key={chan.id}
              onClick={() => {
                onSelectChannel(chan.id);
                if (viewMode === 'feed') setViewMode('chat');
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-violet-900/80 border border-violet-700/60 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {chan.type === 'voice' ? (
                  <Volume2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                ) : (
                  <Hash className="w-4 h-4 text-violet-400 flex-shrink-0" />
                )}
                <span className="truncate">{cleanChanName || chan.name}</span>
              </div>
              {chan.unreadCount && chan.unreadCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-pink-600 text-[9px] font-bold text-white">
                  {chan.unreadCount}
                </span>
              ) : null}
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
          Modern social media for community discussions, threaded stories & real-time channels.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-violet-900/20 font-mono">
          <span>v2.4 Social</span>
          <span className="text-pink-400">● Active Feeds</span>
        </div>
      </div>

    </aside>
  );
};
