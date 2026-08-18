import React, { useState, useMemo } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { CommunityIcon } from './CommunityIcon';
import { isYouTubeUrl, getYouTubeEmbedUrl } from '../lib/mediaUtils';

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

const SAMPLE_LONGS: LongVideoItem[] = [
  {
    id: 'long_music_1',
    title: 'Electronic Music Production: From Modular Synthesis to Analog Master Tape (Full Masterclass)',
    description: 'Learn how modern electronic records are mixed and produced. We explore analog filters, polyphonic chord voicings, sidechain compression, and tape saturation.',
    creator: {
      name: 'Sarah Styles',
      handle: 'u/sarahstyles',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      subscribers: '142K',
      isSubscribed: true,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sound-control-console-41484-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
    duration: '38:12',
    viewsCount: 198000,
    likesCount: 16400,
    uploadedTime: '1 day ago',
    category: 'creative',
    subBuvaki: 'b/music',
    subBuvakiId: 'music',
    quality: '4K Ultra HD'
  },
  {
    id: 'long_music_2',
    title: 'Acoustic Guitar Recording Secrets: Stereo Mic Placement, Preamp Warmth & Room Acoustics',
    description: 'A deep studio workshop on capturing rich acoustic guitar tones using XY pair condenser mics, tube preamps, and dynamic EQ shaping.',
    creator: {
      name: 'Alex Rivera',
      handle: 'u/alexrivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      subscribers: '92K',
      isSubscribed: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-the-guitar-42751-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1200&auto=format&fit=crop&q=80',
    duration: '29:45',
    viewsCount: 84000,
    likesCount: 7100,
    uploadedTime: '3 days ago',
    category: 'creative',
    subBuvaki: 'b/music',
    subBuvakiId: 'music',
    quality: '1080p 60fps'
  },
  {
    id: 'long_tech_1',
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
    subBuvakiId: 'tech',
    quality: '4K Ultra HD'
  },
  {
    id: 'long_tech_2',
    title: 'The Evolution of AI Robotics: Autonomous Quadruped Engineering & Neural Navigation',
    description: 'Exploring modern robotics breakthroughs, sensor fusion with LiDAR, deep reinforcement learning, and the future of human-robot collaboration.',
    creator: {
      name: 'Cyber Nova',
      handle: 'u/cybernova',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      subscribers: '310K',
      isSubscribed: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-looking-around-42768-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    duration: '35:10',
    viewsCount: 389000,
    likesCount: 31200,
    uploadedTime: '1 week ago',
    category: 'tech',
    subBuvaki: 'b/tech',
    subBuvakiId: 'tech',
    quality: '1080p 60fps'
  },
  {
    id: 'long_photography_1',
    title: 'Cinematic Visual Storytelling: Lighting, Color Grading & Lens Selection Guide',
    description: 'A deep dive into professional cinematography techniques using mirrorless rigs, anamorphic lenses, and DaVinci Resolve color pipelines.',
    creator: {
      name: 'Alex Rivera',
      handle: 'u/alexrivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      subscribers: '92K',
      isSubscribed: true,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-urban-street-fashion-shoot-41824-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
    duration: '28:40',
    viewsCount: 112000,
    likesCount: 9200,
    uploadedTime: '5 days ago',
    category: 'creative',
    subBuvaki: 'b/photography',
    subBuvakiId: 'photography',
    quality: '4K 60fps'
  },
  {
    id: 'long_gaming_1',
    title: 'Ultimate Pro Gaming Tier List & Competitive Esports Meta Breakdown (Season 12)',
    description: 'Analyzing tournament champions, mechanics optimization, DPI benchmarks, and game sense strategies that dominate top leaderboard brackets.',
    creator: {
      name: 'Liam Novak',
      handle: 'u/liamnovak',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      subscribers: '520K',
      isSubscribed: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-playing-a-video-game-with-a-controller-42861-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    duration: '51:04',
    viewsCount: 620000,
    likesCount: 48900,
    uploadedTime: '2 weeks ago',
    category: 'gaming',
    subBuvaki: 'b/gaming',
    subBuvakiId: 'gaming',
    quality: '1440p 120fps'
  },
  {
    id: 'long_design_1',
    title: 'Modern Design Systems: Typography, Layout Grids & Motion Physics in 2026',
    description: 'Masterclass on architecting multi-platform design systems with mathematical spacing scales, accessible contrast ratios, and buttery smooth animations.',
    creator: {
      name: 'Sarah Styles',
      handle: 'u/sarahstyles',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      subscribers: '142K',
      isSubscribed: true,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-42761-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
    duration: '32:18',
    viewsCount: 145000,
    likesCount: 12100,
    uploadedTime: '1 week ago',
    category: 'creative',
    subBuvaki: 'b/design',
    subBuvakiId: 'design',
    quality: '4K Ultra HD'
  },
  {
    id: 'long_general_1',
    title: 'The Future of Online Creator Communities & Digital Social Lounges',
    description: 'How modern digital spaces are evolving to support real-time audio rooms, community sub-spaces, shorts, and creator monetization.',
    creator: {
      name: 'Maya Lin',
      handle: 'u/mayalin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      subscribers: '78K',
      isSubscribed: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-recording-herself-with-a-smartphone-camera-42858-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
    duration: '24:50',
    viewsCount: 96000,
    likesCount: 8400,
    uploadedTime: '4 days ago',
    category: 'general',
    subBuvaki: 'b/general',
    subBuvakiId: 'general',
    quality: '1080p HD'
  }
];

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

  // Merge sample long videos with any user posts of type 'video' or 'long'
  const allLongs: LongVideoItem[] = useMemo(() => {
    const userLongs: LongVideoItem[] = posts
      .filter((p) => p.type === 'video' && p.videoUrl)
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
          thumbnailUrl: p.imageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
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

    return [...userLongs, ...SAMPLE_LONGS];
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

      {/* Video Player Modal when clicking on any video */}
      {activePlayingVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in"
          onClick={() => setActivePlayingVideo(null)}
        >
          <div 
            className="relative w-full max-w-3xl rounded-3xl bg-slate-950 border border-violet-800/50 shadow-2xl overflow-hidden my-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setActivePlayingVideo(null)}
              className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Video Player Frame */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              {isYouTubeUrl(activePlayingVideo.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activePlayingVideo.videoUrl) || activePlayingVideo.videoUrl}
                  title={activePlayingVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activePlayingVideo.videoUrl}
                  poster={activePlayingVideo.thumbnailUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              )}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-pink-400 border border-pink-500/30">
                  {activePlayingVideo.quality}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-violet-300 border border-violet-500/30">
                  {activePlayingVideo.subBuvaki}
                </span>
              </div>
            </div>

            {/* Video Metadata & Controls */}
            <div className="p-4 sm:p-6 flex flex-col gap-4">
              <h2 className="text-sm sm:text-lg font-bold text-slate-100 leading-snug">
                {activePlayingVideo.title}
              </h2>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-900/30">
                {/* Creator Channel Bar */}
                <div className="flex items-center gap-3">
                  <img
                    src={activePlayingVideo.creator.avatar}
                    alt={activePlayingVideo.creator.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/50"
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      likedMap[activePlayingVideo.id]
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-slate-900 border border-violet-900/40 text-slate-300 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedMap[activePlayingVideo.id] ? 'fill-white' : ''}`} />
                    <span>{(activePlayingVideo.likesCount + (likedMap[activePlayingVideo.id] ? 1 : 0)).toLocaleString()}</span>
                  </button>

                  <button
                    onClick={() => toggleSave(activePlayingVideo.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      savedMap[activePlayingVideo.id]
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900 border border-violet-900/40 text-slate-300 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${savedMap[activePlayingVideo.id] ? 'fill-white' : ''}`} />
                    <span>{savedMap[activePlayingVideo.id] ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: activePlayingVideo.title,
                          url: window.location.href
                        }).catch(() => {});
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-violet-900/40 text-slate-300 hover:text-white hover:bg-slate-850 text-xs font-bold transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Description Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-violet-900/30 text-xs text-slate-300 flex flex-col gap-2">
                <div className="flex items-center gap-3 font-semibold text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-violet-400" />
                    {activePlayingVideo.viewsCount.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-pink-400" />
                    {activePlayingVideo.uploadedTime}
                  </span>
                </div>
                <p className="leading-relaxed text-slate-200">
                  {activePlayingVideo.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
