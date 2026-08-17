import React, { useState, useMemo } from 'react';
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
  X
} from 'lucide-react';

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
  quality: string;
}

const SAMPLE_LONGS: LongVideoItem[] = [
  {
    id: 'long_1',
    title: 'Complete Masterclass: Modern Full-Stack Web Architecture & Design Systems (2026)',
    description: 'Learn how modern high-scale apps are built from ground zero. We cover TypeScript, reactive UI frameworks, real-time sync, state optimization, and clean typography layouts.',
    creator: {
      name: 'Elena Tech',
      handle: 'u/elenatech',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      subscribers: '184K',
      isSubscribed: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-42456-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    duration: '42:15',
    viewsCount: 248000,
    likesCount: 18400,
    uploadedTime: '2 days ago',
    category: 'tech',
    subBuvaki: 'b/tech',
    quality: '4K Ultra HD'
  },
  {
    id: 'long_2',
    title: 'Shooting in Low-Light: Full Street Photography Guide & Lens Shootout',
    description: 'A deep dive into aperture selection, ISO noise reduction, and composition tricks when shooting neon-lit cityscapes after midnight. In-depth gear breakdown included.',
    creator: {
      name: 'Alex Rivera',
      handle: 'u/alexrivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      subscribers: '92K',
      isSubscribed: true,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-urban-street-fashion-shoot-41824-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80',
    duration: '28:40',
    viewsCount: 115000,
    likesCount: 9200,
    uploadedTime: '5 days ago',
    category: 'creative',
    subBuvaki: 'b/photography',
    quality: '1080p 60fps'
  },
  {
    id: 'long_3',
    title: 'Inside Next-Gen Game Engines: Real-Time Lumen Lighting & Physics Exploration',
    description: 'We test out massive procedural landscapes, ray-traced reflections, and fluid dynamics in modern game development software. Check out the live benchmark comparisons.',
    creator: {
      name: 'Liam Novak',
      handle: 'u/liamnovak',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      subscribers: '310K',
      isSubscribed: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-playing-a-video-game-with-a-controller-42861-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    duration: '51:10',
    viewsCount: 412000,
    likesCount: 33100,
    uploadedTime: '1 week ago',
    category: 'gaming',
    subBuvaki: 'b/gaming',
    quality: '4K 60fps'
  },
  {
    id: 'long_4',
    title: 'Brand Identity Design from Scratch: Moodboards, Vector Craft & Typography Hierarchies',
    description: 'Watch the complete process of creating an iconic visual identity. From napkin sketches to vector bezier curves and color psychology palettes.',
    creator: {
      name: 'Sarah Styles',
      handle: 'u/sarahstyles',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      subscribers: '145K',
      isSubscribed: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-42761-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    duration: '34:02',
    viewsCount: 178000,
    likesCount: 14600,
    uploadedTime: '2 weeks ago',
    category: 'creative',
    subBuvaki: 'b/design',
    quality: '1080p HD'
  }
];

interface LongsFeedProps {
  posts?: Post[];
  currentUser: User;
  selectedLanguage: SupportedLanguage;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onToggleSave?: (postId: string) => void;
  onSelectPost?: (post: Post) => void;
  onOpenCreatePost?: () => void;
}

export const LongsFeed: React.FC<LongsFeedProps> = ({
  posts = [],
  currentUser: _currentUser,
  onVote,
  onToggleSave
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [subscribedMap, setSubscribedMap] = useState<Record<string, boolean>>({});

  // Merge sample long videos with any user posts of type 'video' or 'long'
  const allLongs: LongVideoItem[] = useMemo(() => {
    const userLongs: LongVideoItem[] = posts
      .filter((p) => p.type === 'video' && p.videoUrl)
      .map((p) => ({
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
        thumbnailUrl: p.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        duration: '15:30',
        viewsCount: p.score * 12 || 1200,
        likesCount: p.score || 0,
        uploadedTime: 'Recent',
        category: 'tech',
        subBuvaki: p.subBuvakiName || 'b/general',
        quality: '1080p HD'
      }));

    return [...userLongs, ...SAMPLE_LONGS];
  }, [posts]);

  const [selectedVideo, setSelectedVideo] = useState<LongVideoItem>(SAMPLE_LONGS[0]);

  const filteredVideos = useMemo(() => {
    return allLongs.filter((v) => {
      const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.creator.name.toLowerCase().includes(q) ||
        v.creator.handle.toLowerCase().includes(q) ||
        v.subBuvaki.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [allLongs, activeCategory, searchQuery]);

  const isLiked = likedMap[selectedVideo.id] || false;
  const isSaved = savedMap[selectedVideo.id] || false;
  const isSubscribed = subscribedMap[selectedVideo.creator.handle] ?? selectedVideo.creator.isSubscribed;

  const toggleLike = (id: string) => {
    setLikedMap(prev => ({ ...prev, [id]: !prev[id] }));
    if (onVote) onVote(id, isLiked ? 'down' : 'up');
  };

  const toggleSave = (id: string) => {
    setSavedMap(prev => ({ ...prev, [id]: !prev[id] }));
    if (onToggleSave) onToggleSave(id);
  };

  const toggleSubscribe = (handle: string) => {
    setSubscribedMap(prev => ({ ...prev, [handle]: !prev[handle] }));
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Category Tags Bar & Search Bubble */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/60 border border-violet-900/40">
        
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0">
          {['all', 'tech', 'creative', 'gaming'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Long Videos' : cat}
            </button>
          ))}
        </div>

        {/* Search Pink Bubble & Inline Search Field */}
        <div className="flex items-center gap-2 shrink-0">
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-slate-950 border border-pink-500/50 rounded-xl px-2.5 py-1 shadow-lg transition-all animate-in fade-in zoom-in-95">
              <Search className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, creators..."
                className="w-36 sm:w-56 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
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

      {/* Main Theater / Featured Video Player */}
      <div className="flex flex-col rounded-3xl bg-slate-950 border border-violet-900/40 overflow-hidden shadow-2xl">
        {/* Video Cinema Viewport */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center group">
          <video
            key={selectedVideo.id}
            src={selectedVideo.videoUrl}
            poster={selectedVideo.thumbnailUrl}
            controls
            autoPlay={isPlaying}
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Top Info overlay tag */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-pink-400 border border-pink-500/30">
              {selectedVideo.quality}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-violet-300 border border-violet-500/30">
              {selectedVideo.subBuvaki}
            </span>
          </div>
        </div>

        {/* Video Metadata & Controls */}
        <div className="p-4 sm:p-6 flex flex-col gap-4">
          <h2 className="text-base sm:text-xl font-bold text-slate-100 leading-snug">
            {selectedVideo.title}
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-900/30">
            {/* Creator Channel Bar */}
            <div className="flex items-center gap-3">
              <img
                src={selectedVideo.creator.avatar}
                alt={selectedVideo.creator.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-500/50"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-100">
                    {selectedVideo.creator.name}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                </div>
                <span className="text-xs text-slate-400">
                  {selectedVideo.creator.subscribers} subscribers
                </span>
              </div>

              <button
                onClick={() => toggleSubscribe(selectedVideo.creator.handle)}
                className={`ml-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSubscribed
                    ? 'bg-slate-900 text-slate-300 border border-violet-800/60 hover:border-rose-500 hover:text-rose-400'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 active:scale-95'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Actions: Like, Save, Share */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => toggleLike(selectedVideo.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isLiked
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-slate-900 border border-violet-900/40 text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                <span>{(selectedVideo.likesCount + (isLiked ? 1 : 0)).toLocaleString()}</span>
              </button>

              <button
                onClick={() => toggleSave(selectedVideo.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSaved
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 border border-violet-900/40 text-slate-300 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-violet-900/40 text-slate-300 hover:text-white hover:bg-slate-850 text-xs font-bold transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Description Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-violet-900/30 text-xs text-slate-300 flex flex-col gap-2">
            <div className="flex items-center gap-3 font-semibold text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-violet-400" />
                {selectedVideo.viewsCount.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                {selectedVideo.uploadedTime}
              </span>
            </div>
            <p className="leading-relaxed text-slate-200">
              {selectedVideo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Long Videos Catalog */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
            <Tv className="w-4 h-4 text-pink-400" /> More Long Videos on Buvaki
          </span>
          <span className="text-xs text-slate-400">
            {filteredVideos.length} episodes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVideos.map((video) => {
            const isCurrent = video.id === selectedVideo.id;
            return (
              <div
                key={video.id}
                onClick={() => {
                  setSelectedVideo(video);
                  setIsPlaying(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group flex flex-col gap-2.5 p-3 rounded-2xl bg-slate-900/70 border transition-all cursor-pointer ${
                  isCurrent 
                    ? 'border-violet-500/80 bg-violet-950/30 shadow-lg shadow-violet-950/50' 
                    : 'border-violet-900/30 hover:border-violet-500/50 hover:bg-slate-900'
                }`}
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
                    <div className="w-10 h-10 rounded-full bg-violet-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform group-hover:scale-110">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Duration Badge */}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-white font-mono shadow">
                    {video.duration}
                  </span>
                  {/* Quality Badge */}
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-pink-300">
                    {video.quality}
                  </span>
                </div>

                {/* Video Details */}
                <div className="flex gap-2.5">
                  <img
                    src={video.creator.avatar}
                    alt={video.creator.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-violet-500/40 mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-xs font-bold text-slate-100 line-clamp-2 leading-tight group-hover:text-violet-300 transition-colors">
                      {video.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 mt-1">
                      {video.creator.name}
                    </span>
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
      </div>
    </div>
  );
};
