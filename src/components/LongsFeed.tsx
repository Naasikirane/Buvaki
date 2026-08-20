import React, { useState, useMemo, useRef } from 'react';
import { User, SupportedLanguage, Post, SubBuvaki } from '../types';
import { 
  Play, 
  ThumbsUp, 
  Share2, 
  Bookmark, 
  Clock, 
  Eye, 
  Search, 
  Tv, 
  CheckCircle2,
  X,
  Layers,
  Music,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { CommunityIcon } from './CommunityIcon';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '../lib/mediaUtils';
import { BuvakiVideoPlayer } from './BuvakiVideoPlayer';

export interface LongVideoItem {
  id: string;
  title: string;
  description: string;
  creator: {
    name: string;
    handle: string;
    avatar: string;
    subscribers: string;
    isSubscribed?: boolean;
  };
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  viewsCount: number;
  likesCount: number;
  uploadedTime: string;
  category: string;
  subBuvaki: string;
  subBuvakiId: string;
  quality: string;
}

interface LongsFeedProps {
  posts?: Post[];
  currentUser: User | null;
  selectedLanguage: SupportedLanguage;
  activeSubBuvakiId?: string | null;
  subBuvakis?: SubBuvaki[];
  onSelectSubBuvaki?: (id: string | null) => void;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onToggleSave?: (postId: string) => void;
  onSelectPost?: (post: Post) => void;
  onOpenCreatePost?: () => void;
  onRequireAuth?: (promptReason?: string) => void;
}

export const LongsFeed: React.FC<LongsFeedProps> = ({
  posts = [],
  currentUser,
  activeSubBuvakiId,
  subBuvakis = [],
  onSelectSubBuvaki,
  onOpenCreatePost,
  onVote,
  onToggleSave,
  onRequireAuth
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activePlayingVideo, setActivePlayingVideo] = useState<LongVideoItem | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [subscribedMap, setSubscribedMap] = useState<Record<string, boolean>>({});
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);
  const watchPageRef = useRef<HTMLDivElement>(null);

  // Merge sample long videos with user posts created for Longs (strictly longs, never shorts or feed video posts)
  const allLongs: LongVideoItem[] = useMemo(() => {
    const userLongs: LongVideoItem[] = posts
      .filter((p) => (
        p.isLong === true || 
        p.type === 'long' || 
        p.flair === 'Long Video' || 
        p.tags?.some(t => t.toLowerCase().includes('longvideo'))
      ) && !p.isShort && p.type !== 'short' && p.videoUrl)
      .map((p) => {
        const matchingCategory = (p.tags?.find(t => ['creative', 'tech', 'gaming', 'photography'].includes(t.replace('#', '').toLowerCase()))?.replace('#', '').toLowerCase()) || 'tech';
        return {
          id: p.id,
          title: p.title,
          description: p.content || '',
          creator: {
            name: p.author.username,
            handle: p.author.handle,
            avatar: p.author.avatar,
            subscribers: '12K',
            isSubscribed: false
          },
          videoUrl: p.videoUrl!,
          thumbnailUrl: (p.imageUrl && !p.imageUrl.includes('images.unsplash.com')) ? p.imageUrl : '',
          duration: p.duration || '15:30',
          viewsCount: (p.score || 100) * 12,
          likesCount: p.score || 0,
          uploadedTime: 'Recent',
          category: matchingCategory,
          subBuvaki: p.subBuvakiName || 'b/general',
          subBuvakiId: p.subBuvakiId || 'general',
          quality: '1080p HD'
        };
      });

    return userLongs;
  }, [posts]);

  const activeSubObj = subBuvakis.find((s) => s.id === activeSubBuvakiId);

  // Filter longs strictly by active sub-buvaki, category, and search query
  const filteredVideos = useMemo(() => {
    return allLongs.filter((v) => {
      // Sub-Buvaki filter
      const matchesSub = !activeSubBuvakiId || activeSubBuvakiId === 'general' ||
        v.subBuvakiId === activeSubBuvakiId ||
        v.subBuvaki === `b/${activeSubBuvakiId}` ||
        v.subBuvaki.toLowerCase() === activeSubBuvakiId.toLowerCase();

      // Category filter
      const matchesCategory = activeCategory === 'all' || v.category === activeCategory;

      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.creator.name.toLowerCase().includes(q) ||
        v.creator.handle.toLowerCase().includes(q) ||
        v.subBuvaki.toLowerCase().includes(q);

      return matchesSub && matchesCategory && matchesSearch;
    });
  }, [allLongs, activeSubBuvakiId, activeCategory, searchQuery]);

  // Recommended longs in the specific active Sub-Buvaki of the playing video
  const sameSubLongs = useMemo(() => {
    if (!activePlayingVideo) return [];
    return allLongs.filter(
      (v) =>
        v.id !== activePlayingVideo.id &&
        (v.subBuvakiId === activePlayingVideo.subBuvakiId ||
          v.subBuvaki === activePlayingVideo.subBuvaki ||
          (activePlayingVideo.subBuvakiId && activePlayingVideo.subBuvakiId !== 'general' &&
            v.subBuvaki.toLowerCase() === activePlayingVideo.subBuvakiId.toLowerCase()))
    );
  }, [allLongs, activePlayingVideo]);

  // Other long videos across Buvaki
  const otherSubLongs = useMemo(() => {
    if (!activePlayingVideo) return [];
    const sameSubIds = new Set(sameSubLongs.map((s) => s.id));
    return allLongs.filter(
      (v) => v.id !== activePlayingVideo.id && !sameSubIds.has(v.id)
    );
  }, [allLongs, activePlayingVideo, sameSubLongs]);

  const toggleLike = (id: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to upvote and support video creators on Buvaki');
      return;
    }
    const isCurrentlyLiked = !!likedMap[id];
    setLikedMap(prev => ({ ...prev, [id]: !isCurrentlyLiked }));
    if (onVote) onVote(id, isCurrentlyLiked ? 'down' : 'up');
  };

  const toggleSave = (id: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to save videos to your library');
      return;
    }
    setSavedMap(prev => ({ ...prev, [id]: !prev[id] }));
    if (onToggleSave) onToggleSave(id);
  };

  const toggleSubscribe = (handle: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to subscribe to creators on Buvaki');
      return;
    }
    setSubscribedMap(prev => ({ ...prev, [handle]: !prev[handle] }));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Bar: Sub-Buvaki Switcher + Category Filters + Search Bubble */}
      <div className="flex flex-col gap-2.5 p-2 rounded-2xl bg-slate-900/60 border border-violet-900/40">
        
        {/* Top Row: Active Sub-Buvaki Quick Selector */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <button
              onClick={() => setIsSubDropdownOpen(!isSubDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-violet-700/50 text-white text-xs font-bold transition-all shrink-0"
            >
              {activeSubObj ? (
                <>
                  <CommunityIcon sub={activeSubObj} size="xs" />
                  <span>{activeSubObj.displayName}</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  <span>b/general (All Longs)</span>
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Sub-Buvaki Dropdown */}
            {isSubDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-slate-950/95 border border-violet-800/60 shadow-2xl backdrop-blur-xl p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                  Filter by Sub-Buvaki
                </div>

                <button
                  onClick={() => {
                    if (onSelectSubBuvaki) onSelectSubBuvaki(null);
                    setIsSubDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all ${
                    !activeSubBuvakiId || activeSubBuvakiId === 'general'
                      ? 'bg-violet-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  <span>b/general (All Videos)</span>
                </button>

                {subBuvakis.filter(s => s.id !== 'general').map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      if (onSelectSubBuvaki) onSelectSubBuvaki(sub.id);
                      setIsSubDropdownOpen(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all ${
                      activeSubBuvakiId === sub.id
                        ? 'bg-violet-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <CommunityIcon sub={sub} size="xs" />
                    <span>{sub.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter & Search Row: Filters on same line with Search Bubble pinned on the right (higher z-index) */}
        <div className="relative w-full flex items-center min-w-0">
          {/* Category Filter Pills (Scrolling underneath at z-10) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 pr-12 w-full min-w-0 z-10">
            {['all', 'creative', 'tech', 'gaming'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap shrink-0 ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat === 'all' ? 'All Genres' : cat}
              </button>
            ))}
          </div>

          {/* Search Pink Bubble & Inline Search Field pinned on the same line at z-20 */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center pl-3 bg-gradient-to-l from-slate-900/95 via-slate-900/90 to-transparent">
            {isSearchOpen ? (
              <div className="flex items-center gap-1.5 bg-slate-950 border border-pink-500/50 rounded-xl px-2.5 py-1 shadow-lg transition-all animate-in fade-in zoom-in-95">
                <Search className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-32 sm:w-56 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-white text-[11px] font-bold px-1"
                >
                  Close
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30 transition-all hover:scale-105 active:scale-95 shrink-0"
                title="Search Long Videos"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Long Videos Catalog Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-pink-400" /> 
            {activeSubObj ? `${activeSubObj.displayName} Videos` : 'Long Videos on Buvaki'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
          </span>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-14 rounded-3xl bg-slate-900/40 border border-violet-900/30 text-slate-400 text-xs flex flex-col items-center gap-3">
            <Tv className="w-8 h-8 text-violet-400 opacity-60" />
            <span className="font-bold text-slate-300">
              No long videos found in {activeSubObj?.displayName || 'this selection'}.
            </span>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => onSelectSubBuvaki && onSelectSubBuvaki(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-violet-800/40 text-xs font-bold text-slate-200"
              >
                View b/general (All)
              </button>
              {onOpenCreatePost && (
                <button
                  onClick={onOpenCreatePost}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-xs font-bold text-white shadow-lg shadow-pink-600/30"
                >
                  Upload Video
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => {
              return (
                <div
                  key={video.id}
                  onClick={() => setActivePlayingVideo(video)}
                  className="group flex flex-col gap-2.5 p-3 rounded-2xl bg-slate-900/70 border border-violet-900/30 hover:border-violet-500/50 hover:bg-slate-900 transition-all cursor-pointer shadow-lg hover:shadow-violet-950/40 hover:-translate-y-0.5"
                >
                  {/* Video Thumbnail */}
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-violet-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl transform group-hover:scale-110">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    {/* Duration Badge */}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/85 text-[10px] font-bold text-white font-mono shadow">
                      {video.duration}
                    </span>
                    {/* Sub-Buvaki & Quality Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-violet-950/90 backdrop-blur-xs text-[9px] font-bold text-violet-200 border border-violet-600/40">
                        {video.subBuvaki}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[9px] font-bold text-pink-300 border border-pink-500/20">
                        {video.quality}
                      </span>
                    </div>
                  </div>

                  {/* Video Details */}
                  <div className="flex gap-2.5">
                    <img
                      src={video.creator.avatar}
                      alt={video.creator.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-violet-500/40 mt-0.5"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-violet-300 transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] font-medium text-slate-300 truncate">
                          {video.creator.name}
                        </span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span>{(video.viewsCount / 1000).toFixed(0)}K views</span>
                        <span>•</span>
                        <span>{video.uploadedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL SCREEN WATCH PAGE (covers both top bar and bottom bar) */}
      {activePlayingVideo && (
        <div 
          ref={watchPageRef}
          className="fixed inset-0 z-[70] bg-slate-950 text-slate-100 w-full h-full min-h-screen overflow-y-auto flex flex-col animate-in fade-in duration-200"
        >
          {/* Top Bar for Watch Page */}
          <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-violet-900/40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => setActivePlayingVideo(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-violet-900/40 text-slate-200 hover:text-white transition-all text-xs font-semibold group active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-violet-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Longs</span>
            </button>

            <div className="flex items-center gap-2 max-w-[50%] truncate">
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg bg-pink-950/60 border border-pink-500/30 text-pink-400 text-[11px] font-bold">
                {activePlayingVideo.quality || '1080p HD'}
              </span>
              <button
                onClick={() => {
                  if (onSelectSubBuvaki) onSelectSubBuvaki(activePlayingVideo.subBuvakiId);
                  setActivePlayingVideo(null);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-violet-950/60 hover:bg-violet-900/80 border border-violet-700/50 text-violet-200 text-xs font-bold transition-colors truncate"
              >
                <CommunityIcon subId={activePlayingVideo.subBuvakiId} name={activePlayingVideo.subBuvaki} size="xs" containerClassName="w-4 h-4 rounded-sm border-none bg-transparent" />
                <span className="truncate">{activePlayingVideo.subBuvaki}</span>
              </button>
            </div>

            <button
              onClick={() => setActivePlayingVideo(null)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-950/80 border border-violet-900/40 hover:border-rose-700/50 text-slate-400 hover:text-rose-300 transition-all active:scale-95"
              aria-label="Close Watch Page"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Watch Page Body */}
          <div className="flex-1 w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-4 flex flex-col gap-6">
            
            {/* 1. Cinematic Video Player - Fixed / Sticky when scrolling */}
            <div className="sticky top-[47px] sm:top-[51px] z-30 w-full bg-black sm:rounded-3xl overflow-hidden border-b sm:border border-violet-900/40 shadow-2xl relative aspect-video max-h-[48vh] sm:max-h-[65vh] flex items-center justify-center">
              {isYouTubeUrl(activePlayingVideo.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activePlayingVideo.videoUrl) || activePlayingVideo.videoUrl}
                  title={activePlayingVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <BuvakiVideoPlayer
                  src={activePlayingVideo.videoUrl}
                  poster={activePlayingVideo.thumbnailUrl || undefined}
                  autoPlay={true}
                  controls={true}
                  playsInline={true}
                  isLong={true}
                  className="w-full h-full object-contain bg-black"
                  title={activePlayingVideo.title}
                />
              )}
            </div>

            {/* 2. Responsive 2-Column Grid (Main info on left / recommendations & up next on right) */}
            <div className="px-4 sm:px-0 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
              
              {/* Left Column: Video Metadata, Creator, Actions, Description */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                
                {/* Title */}
                <div className="flex flex-col gap-2">
                  <h1 className="text-base sm:text-xl font-bold text-slate-100 leading-snug">
                    {activePlayingVideo.title}
                  </h1>
                </div>

                {/* Creator Channel Bar & Primary Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-violet-900/40">
                  {/* Creator info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={activePlayingVideo.creator.avatar}
                      alt={activePlayingVideo.creator.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-500/50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-100">
                          {activePlayingVideo.creator.name}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                      </div>
                      <span className="text-xs text-slate-400">
                        {activePlayingVideo.creator.subscribers} subscribers
                      </span>
                    </div>

                    <button
                      onClick={() => toggleSubscribe(activePlayingVideo.creator.handle)}
                      className={`ml-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        (subscribedMap[activePlayingVideo.creator.handle] ?? activePlayingVideo.creator.isSubscribed)
                          ? 'bg-slate-900 text-slate-300 border border-violet-800/60 hover:border-rose-500 hover:text-rose-400'
                          : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 active:scale-95'
                      }`}
                    >
                      {(subscribedMap[activePlayingVideo.creator.handle] ?? activePlayingVideo.creator.isSubscribed) ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>

                  {/* Actions: Like, Save, Share */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleLike(activePlayingVideo.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        likedMap[activePlayingVideo.id]
                          ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                          : 'bg-slate-900 border border-violet-900/40 text-slate-300 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${likedMap[activePlayingVideo.id] ? 'fill-white' : ''}`} />
                      <span>{(activePlayingVideo.likesCount + (likedMap[activePlayingVideo.id] ? 1 : 0)).toLocaleString()}</span>
                    </button>

                    <button
                      onClick={() => toggleSave(activePlayingVideo.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        savedMap[activePlayingVideo.id]
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-900 border border-violet-900/40 text-slate-300 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${savedMap[activePlayingVideo.id] ? 'fill-white' : ''}`} />
                      <span>{savedMap[activePlayingVideo.id] ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: activePlayingVideo.title,
                            url: window.location.href
                          }).catch(() => {});
                        } else {
                          navigator.clipboard?.writeText(window.location.href);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-violet-900/40 text-slate-300 hover:text-white hover:bg-slate-850 text-xs font-bold transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Description Box */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-violet-900/30 text-xs text-slate-300 flex flex-col gap-2.5">
                  <div className="flex items-center gap-3 font-semibold text-slate-400 text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-violet-400" />
                      {activePlayingVideo.viewsCount.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-pink-400" />
                      {activePlayingVideo.uploadedTime}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-950 border border-violet-800/50 text-violet-300 text-[10px] font-bold">
                      {activePlayingVideo.subBuvaki}
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-200 text-sm whitespace-pre-line">
                    {activePlayingVideo.description || 'Enjoy this full-length presentation on Buvaki.'}
                  </p>
                </div>
              </div>

              {/* Right Column: Recommended Longs within the current Sub-Buvaki & Up Next */}
              <div className="flex flex-col gap-6">
                
                {/* 1. RECOMMENDED LONGS IN THIS SPECIFIC SUB-BUVAKI */}
                <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/60 border border-violet-900/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <CommunityIcon 
                        subId={activePlayingVideo.subBuvakiId} 
                        name={activePlayingVideo.subBuvaki} 
                        size="xs" 
                        containerClassName="w-5 h-5 rounded-md shadow-sm shrink-0" 
                      />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 truncate">
                        Recommended in {activePlayingVideo.subBuvaki}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-800/40 text-[10px] font-mono text-violet-300 shrink-0">
                      {sameSubLongs.length} {sameSubLongs.length === 1 ? 'video' : 'videos'}
                    </span>
                  </div>

                  {sameSubLongs.length > 0 ? (
                    <div className="flex flex-col gap-2.5 mt-1">
                      {sameSubLongs.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => {
                            setActivePlayingVideo(video);
                            if (watchPageRef.current) {
                              watchPageRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="flex gap-3 p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-violet-900/30 hover:border-violet-700/60 cursor-pointer transition-all group"
                        >
                          <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-violet-900/30">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-950">
                                <Play className="w-5 h-5 text-violet-400/70" />
                              </div>
                            )}
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold text-white">
                              {video.duration}
                            </span>
                          </div>

                          <div className="flex flex-col min-w-0 flex-1 justify-center">
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-violet-300 transition-colors">
                              {video.title}
                            </h4>
                            <span className="text-[11px] text-slate-400 mt-1 truncate">
                              {video.creator.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                              <span>{(video.viewsCount / 1000).toFixed(0)}K views</span>
                              <span>•</span>
                              <span>{video.uploadedTime}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-950/50 border border-violet-900/20 text-center flex flex-col items-center gap-1">
                      <p className="text-xs text-slate-400">
                        Currently viewing the featured long in <span className="font-semibold text-violet-300">{activePlayingVideo.subBuvaki}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. MORE LONGS ACROSS BUVAKI */}
                {otherSubLongs.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tv className="w-4 h-4 text-violet-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          More Longs on Buvaki
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {otherSubLongs.slice(0, 8).map((video) => (
                        <div
                          key={video.id}
                          onClick={() => {
                            setActivePlayingVideo(video);
                            if (watchPageRef.current) {
                              watchPageRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="flex gap-3 p-2 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-transparent hover:border-violet-900/40 cursor-pointer transition-all group"
                        >
                          <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-violet-900/30">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-950">
                                <Play className="w-6 h-6 text-violet-400/70" />
                              </div>
                            )}
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold text-white">
                              {video.duration}
                            </span>
                          </div>

                          <div className="flex flex-col min-w-0 flex-1 justify-center">
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-violet-300 transition-colors">
                              {video.title}
                            </h4>
                            <span className="text-[11px] text-slate-400 mt-1 truncate">
                              {video.creator.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                              <span>{(video.viewsCount / 1000).toFixed(0)}K views</span>
                              <span>•</span>
                              <span className="text-violet-400 font-medium">{video.subBuvaki}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
