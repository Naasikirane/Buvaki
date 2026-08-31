import React, { useState, useMemo, useRef } from 'react';
import { User, SupportedLanguage, Post } from '../types';
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
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
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
  quality: string;
}

interface LongsFeedProps {
  posts?: Post[];
  currentUser: User | null;
  selectedLanguage: SupportedLanguage;
  activeSubBuvakiId?: string | null;
  subBuvakis?: any[];
  onSelectSubBuvaki?: (id: string | null) => void;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onToggleSave?: (postId: string) => void;
  onSelectPost?: (post: Post) => void;
  onOpenCreatePost?: () => void;
  onRequireAuth?: (promptReason?: string) => void;
}

const SAMPLE_LONGS: LongVideoItem[] = [
  {
    id: 'long_rec_1',
    title: 'Building Modern Full-Stack Web Applications with React 19 & Tailwind',
    description: 'A comprehensive walkthrough building modern reactive interfaces, responsive drawer interactions, and high performance video feeds.',
    creator: {
      name: 'TechChronicles',
      handle: '@TechChronicles',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      subscribers: '142K',
      isSubscribed: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
    duration: '24:18',
    viewsCount: 45200,
    likesCount: 3820,
    uploadedTime: '2 days ago',
    category: 'tech',
    quality: '4K 60fps'
  },
  {
    id: 'long_rec_2',
    title: 'Solo Hiking & Cinematic Kyoto Landscapes — 4K Visual Journey',
    description: 'Documenting quiet morning walks through ancient shrines, bamboo forests, and evening rain in Japan.',
    creator: {
      name: 'VisualStories',
      handle: '@VisualStories',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      subscribers: '89K',
      isSubscribed: false
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop&q=80',
    duration: '18:42',
    viewsCount: 68900,
    likesCount: 5410,
    uploadedTime: '4 days ago',
    category: 'creative',
    quality: '4K Ultra HD'
  },
  {
    id: 'long_rec_3',
    title: 'Top 10 Action Manhwa with Overpowered Protagonists You Must Read',
    description: 'Breaking down the best art, pacing, and storylines in modern action manhwa and webcomics.',
    creator: {
      name: 'Anidong_Manhwa',
      handle: '@Anidong_Manhwa',
      avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
      subscribers: '210K',
      isSubscribed: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80',
    duration: '15:20',
    viewsCount: 112000,
    likesCount: 9400,
    uploadedTime: '1 week ago',
    category: 'entertainment',
    quality: '1080p HD'
  }
];

export const LongsFeed: React.FC<LongsFeedProps> = ({
  posts = [],
  currentUser,
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
  const watchPageRef = useRef<HTMLDivElement>(null);

  // Merge sample long videos with user posts created for Longs
  const allLongs: LongVideoItem[] = useMemo(() => {
    const userLongs: LongVideoItem[] = posts
      .filter((p) => (
        p.isLong === true || 
        p.type === 'long' || 
        p.flair === 'Long Video' || 
        p.tags?.some(t => t.toLowerCase().includes('longvideo'))
      ) && !p.isShort && p.type !== 'short' && p.videoUrl)
      .map((p) => {
        const matchingCategory = (p.tags?.find(t => ['creative', 'tech', 'gaming', 'entertainment'].includes(t.replace('#', '').toLowerCase()))?.replace('#', '').toLowerCase()) || 'tech';
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
          quality: '1080p HD'
        };
      });

    return [...userLongs, ...SAMPLE_LONGS];
  }, [posts]);

  // Filter longs strictly by category and search query
  const filteredVideos = useMemo(() => {
    return allLongs.filter((v) => {
      const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.creator.name.toLowerCase().includes(q) ||
        v.creator.handle.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [allLongs, activeCategory, searchQuery]);

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
      {/* Category Pills Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2">
          {['all', 'tech', 'entertainment', 'creative', 'gaming'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all capitalize ${
                activeCategory === cat
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/10 text-neutral-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Videos' : cat}
            </button>
          ))}
        </div>

        {/* Search button */}
        <div className="relative shrink-0">
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-white/20 rounded-full px-2.5 py-1">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search longs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-32 sm:w-44"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-neutral-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Long Videos Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => setActivePlayingVideo(video)}
            className="group flex flex-col gap-2.5 cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-900">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                  <Play className="w-6 h-6 fill-white ml-1" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-bold text-white font-mono">
                {video.duration}
              </span>
            </div>

            {/* Video Meta */}
            <div className="flex gap-3 px-0.5">
              <img
                src={video.creator.avatar}
                alt={video.creator.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-white/10 mt-0.5"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-100 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-neutral-400 truncate">
                    {video.creator.name}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-neutral-400 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono mt-0.5">
                  <span>{(video.viewsCount / 1000).toFixed(0)}K views</span>
                  <span>•</span>
                  <span>{video.uploadedTime}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FIXED WATCH PAGE FOR LONGS: Video Player stays permanently fixed at the top while details & comments scroll underneath */}
      {activePlayingVideo && (
        <div 
          ref={watchPageRef}
          className="fixed inset-0 z-[70] bg-[#0f0f0f] text-white w-full h-full min-h-screen flex flex-col animate-in fade-in duration-200 overflow-hidden"
        >
          {/* Top Bar with Back Button */}
          <header className="h-12 border-b border-white/10 bg-[#0f0f0f]/95 px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-50">
            <button
              onClick={() => setActivePlayingVideo(null)}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <span className="text-xs font-bold text-neutral-300 truncate max-w-[60%]">
              {activePlayingVideo.title}
            </span>

            <button
              onClick={() => setActivePlayingVideo(null)}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Video Player + Scrollable Content Split */}
          <div className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto">
            
            {/* Left/Main Column: FIXED VIDEO AT TOP with scrollable info underneath */}
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
              
              {/* 1. FIXED VIDEO PLAYER AT THE VERY TOP OF WATCH PAGE */}
              <div className="sticky top-0 z-30 w-full bg-black shadow-2xl aspect-video max-h-[50vh] sm:max-h-[60vh] flex items-center justify-center shrink-0">
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

              {/* 2. Scrollable Video Details below the fixed video */}
              <div className="p-4 sm:p-6 flex flex-col gap-4">
                <h1 className="text-base sm:text-xl font-bold text-white leading-snug">
                  {activePlayingVideo.title}
                </h1>

                {/* Creator Channel Bar & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <img
                      src={activePlayingVideo.creator.avatar}
                      alt={activePlayingVideo.creator.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">
                          {activePlayingVideo.creator.name}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                      <span className="text-xs text-neutral-400">
                        {activePlayingVideo.creator.subscribers} subscribers
                      </span>
                    </div>

                    <button
                      onClick={() => toggleSubscribe(activePlayingVideo.creator.handle)}
                      className={`ml-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        (subscribedMap[activePlayingVideo.creator.handle] ?? activePlayingVideo.creator.isSubscribed)
                          ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                          : 'bg-white hover:bg-neutral-200 text-black shadow-sm'
                      }`}
                    >
                      {(subscribedMap[activePlayingVideo.creator.handle] ?? activePlayingVideo.creator.isSubscribed) ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>

                  {/* Actions: Like, Save, Share */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLike(activePlayingVideo.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        likedMap[activePlayingVideo.id]
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${likedMap[activePlayingVideo.id] ? 'fill-black' : ''}`} />
                      <span>{(activePlayingVideo.likesCount + (likedMap[activePlayingVideo.id] ? 1 : 0)).toLocaleString()}</span>
                    </button>

                    <button
                      onClick={() => toggleSave(activePlayingVideo.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        savedMap[activePlayingVideo.id]
                          ? 'bg-white text-black font-bold'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${savedMap[activePlayingVideo.id] ? 'fill-black' : ''}`} />
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Description Box */}
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 text-xs text-neutral-300 flex flex-col gap-2">
                  <div className="flex items-center gap-3 font-semibold text-neutral-400">
                    <span>{activePlayingVideo.viewsCount.toLocaleString()} views</span>
                    <span>{activePlayingVideo.uploadedTime}</span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {activePlayingVideo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Up Next / Suggestions Sidebar on Desktop */}
            <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 p-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar shrink-0 bg-[#0f0f0f]">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Up Next
              </span>
              {allLongs.filter(v => v.id !== activePlayingVideo.id).map((v) => (
                <div
                  key={v.id}
                  onClick={() => setActivePlayingVideo(v)}
                  className="flex gap-2.5 cursor-pointer group"
                >
                  <div className="relative w-36 aspect-video rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-bold text-white font-mono">
                      {v.duration}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-xs font-semibold text-white line-clamp-2 group-hover:text-neutral-300">
                      {v.title}
                    </h4>
                    <span className="text-[11px] text-neutral-400 mt-1 truncate">{v.creator.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{(v.viewsCount / 1000).toFixed(0)}K views</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
