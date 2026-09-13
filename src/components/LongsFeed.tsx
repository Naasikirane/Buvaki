import React, { useState, useMemo, useRef } from 'react';
import { User, SupportedLanguage, Post } from '../types';
import { 
  Play, 
  ThumbsUp, 
  ThumbsDown,
  Share2, 
  Bookmark, 
  Clock, 
  CheckCircle2,
  X,
  ArrowLeft,
  MoreVertical,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Flame,
  SlidersHorizontal,
  Send,
  User as UserIcon,
  Check,
  Download,
  Scissors,
  Bell,
  Menu,
  Search,
  Mic,
  Plus
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
    isVerified?: boolean;
    isMusicBadge?: boolean;
  };
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  viewsCount: number;
  viewsDisplay: string;
  likesCount: number;
  uploadedTime: string;
  category: string;
  quality?: string;
  isSponsored?: boolean;
  sponsorName?: string;
  sponsorActionUrl?: string;
}

export interface ShortsShelfItem {
  id: string;
  title: string;
  views: string;
  thumbnailUrl: string;
  videoUrl: string;
  badge?: string;
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
  onSelectShort?: (short: any) => void;
}

// Curated data exactly reflecting the YouTube screenshot and expectations
const SAMPLE_LONGS: LongVideoItem[] = [
  {
    id: 'yt_rec_toradora',
    title: 'The ENTIRE Story Of ToraDora! In 51 Minutes',
    description: 'Complete story recap of the beloved romantic comedy anime series Toradora! in 51 minutes. Follow Ryuuji Takasu and Taiga Aisaka as they navigate high school life, unexpected love triangles, and finding true feelings.\n\n#anime #recap #toradora #romance #animerecap',
    creator: {
      name: 'AniSpot Recapped',
      handle: '@AniSpotRecapped',
      avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
      subscribers: '1.2M',
      isSubscribed: false,
      isVerified: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80',
    duration: '51:24',
    viewsCount: 1420000,
    viewsDisplay: '1.4M views',
    likesCount: 140000,
    uploadedTime: '2 weeks ago',
    category: 'anime',
    quality: '1080p HD'
  },
  {
    id: 'yt_rec_brocode_system',
    title: 'The System Promised Him a New Life After 8000 Years...',
    description: 'Complete season recap of the epic fantasy reincarnation adventure with full cinematic narration and remastered sound.',
    creator: {
      name: 'BroCode Cinema',
      handle: '@BroCodeCinema',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      subscribers: '540K',
      isSubscribed: false,
      isVerified: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
    duration: '1:52:17',
    viewsCount: 140000,
    viewsDisplay: '140K views',
    likesCount: 12000,
    uploadedTime: '3 weeks ago',
    category: 'anime',
    quality: '1080p HD'
  },
  {
    id: 'yt_rec_soldier_territory',
    title: 'Retired Soldier Takes Over a Forgotten Territory and Modernizes It',
    description: 'When an elite veteran commander is banished to an abandoned frontier village, he turns it into an impregnable modern empire.',
    creator: {
      name: 'AniSpot Recapped',
      handle: '@AniSpotRecapped',
      avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
      subscribers: '1.2M',
      isSubscribed: false,
      isVerified: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=1000&auto=format&fit=crop&q=80',
    duration: '2:06:55',
    viewsCount: 16000,
    viewsDisplay: '16K views',
    likesCount: 1900,
    uploadedTime: '8 hours ago',
    category: 'anime',
    quality: '4K 60fps'
  },
  {
    id: 'yt_rec_ceo_wife',
    title: 'He Quit to Escape His New CEO—But She Was His Secret Billionaire Wife',
    description: 'Urban romance drama full season recap. A humble designer resigns to live peacefully, only to discover his new company chairwoman is his contracted wife.',
    creator: {
      name: 'Urban Hero Film',
      handle: '@UrbanHeroFilm',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      subscribers: '320K',
      isSubscribed: false,
      isVerified: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop&q=80',
    duration: '2:24:18',
    viewsCount: 48000,
    viewsDisplay: '48K views',
    likesCount: 3800,
    uploadedTime: '1 month ago',
    category: 'entertainment',
    quality: '1080p HD'
  },
  {
    id: 'yt_rec_sponsored_1',
    title: 'Reliable cloud infrastructure that scales with your business. Try it free for 30 days',
    description: 'Deploy enterprise-grade cloud compute nodes with sub-second latency, redundant storage, and global edge network points of presence.',
    creator: {
      name: 'Kamatera',
      handle: '@KamateraCloud',
      avatar: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150&auto=format&fit=crop&q=80',
      subscribers: '65K',
      isVerified: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    duration: '0:45',
    viewsCount: 95000,
    viewsDisplay: 'Sponsored',
    likesCount: 1200,
    uploadedTime: 'Kamatera',
    category: 'tech',
    isSponsored: true,
    sponsorName: 'Kamatera',
    sponsorActionUrl: 'https://www.kamatera.com'
  },
  {
    id: 'yt_rec_billionaires',
    title: 'Finally a Country Is Taxing Its Billionaires',
    description: 'A deep dive into progressive wealth taxation, capital gains reforms, and economic reactions across global markets.',
    creator: {
      name: 'Economics Explained',
      handle: '@EconomicsExplained',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      subscribers: '2.4M',
      isSubscribed: false,
      isVerified: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1000&auto=format&fit=crop&q=80',
    duration: '13:30',
    viewsCount: 636000,
    viewsDisplay: '636K views',
    likesCount: 41200,
    uploadedTime: '2 days ago',
    category: 'history',
    quality: '1080p HD'
  },
  {
    id: 'yt_rec_waifu',
    title: 'I Turned ChatGPT Astra Into An AI Waifu',
    description: 'Hooking up voice models, real-time emotion vision, and dynamic animated 2D rigs using modern generative AI pipelines.',
    creator: {
      name: 'Just Rayen',
      handle: '@JustRayen',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      subscribers: '380K',
      isSubscribed: true,
      isVerified: false
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80',
    duration: '23:03',
    viewsCount: 10200,
    viewsDisplay: '10K views',
    likesCount: 1800,
    uploadedTime: '6 hours ago',
    category: 'ai',
    quality: '4K 60fps'
  },
  {
    id: 'yt_rec_alone',
    title: 'Alan Walker - Alone',
    description: 'Official music video for Alone by Alan Walker. Stream and download the single on all digital music platforms.',
    creator: {
      name: 'Alan Walker',
      handle: '@AlanWalker',
      avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
      subscribers: '45.8M',
      isSubscribed: true,
      isVerified: true,
      isMusicBadge: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
    duration: '3:40',
    viewsCount: 1520000000,
    viewsDisplay: '1.5B views',
    likesCount: 9800000,
    uploadedTime: '9 years ago',
    category: 'music',
    quality: '4K Ultra HD'
  },
  {
    id: 'yt_rec_delivery_guy',
    title: '💥 The Delivery Guy Dumped by His Girlfriend Gets a Mind-Reading System ...',
    description: 'Complete season recap of the hit urban fantasy drama with English Dubbed audio and full cinematic quality.',
    creator: {
      name: 'LegendVerse Urban Drama',
      handle: '@LegendVerseDrama',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      subscribers: '185K',
      isSubscribed: false,
      isVerified: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
    duration: '1:59:50',
    viewsCount: 8700,
    viewsDisplay: '8.7K views',
    likesCount: 940,
    uploadedTime: '7 hours ago',
    category: 'entertainment',
    quality: '1080p HD'
  },
  {
    id: 'yt_rec_fullstack',
    title: 'Building Modern Full-Stack Web Applications with React 19 & Tailwind CSS',
    description: 'A comprehensive walkthrough building modern reactive interfaces, responsive drawer interactions, and high performance video feeds.',
    creator: {
      name: 'TechChronicles',
      handle: '@TechChronicles',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      subscribers: '142K',
      isSubscribed: true,
      isVerified: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
    duration: '24:18',
    viewsCount: 452000,
    viewsDisplay: '452K views',
    likesCount: 38200,
    uploadedTime: '3 days ago',
    category: 'tech',
    quality: '4K 60fps'
  },
  {
    id: 'yt_rec_kyoto',
    title: 'Solo Hiking & Cinematic Kyoto Landscapes — 4K Visual Journey',
    description: 'Documenting quiet morning walks through ancient shrines, bamboo forests, and evening rain in Japan.',
    creator: {
      name: 'VisualStories',
      handle: '@VisualStories',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      subscribers: '89K',
      isSubscribed: false,
      isVerified: true
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&auto=format&fit=crop&q=80',
    duration: '18:42',
    viewsCount: 189000,
    viewsDisplay: '189K views',
    likesCount: 15400,
    uploadedTime: '5 days ago',
    category: 'creative',
    quality: '4K Ultra HD'
  },
  {
    id: 'yt_rec_manhwa',
    title: 'Top 10 Action Manhwa with Overpowered Protagonists You Must Read',
    description: 'Breaking down the best art, pacing, and storylines in modern action manhwa and webcomics.',
    creator: {
      name: 'Anidong_Manhwa',
      handle: '@Anidong_Manhwa',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
      subscribers: '210K',
      isSubscribed: true,
      isVerified: false
    },
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
    duration: '15:20',
    viewsCount: 312000,
    viewsDisplay: '312K views',
    likesCount: 29400,
    uploadedTime: '1 week ago',
    category: 'animated',
    quality: '1080p HD'
  }
];

// Curated Shorts shelf data matching the YouTube screenshot
const SAMPLE_SHORTS_SHELF: ShortsShelfItem[] = [
  {
    id: 'short_1',
    title: "I Just Remembered We're Communists 😂",
    views: '1.4M views',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    badge: 'New'
  },
  {
    id: 'short_2',
    title: 'When the AI model writes better code than you',
    views: '850K views',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'short_3',
    title: 'Insane Manhwa Transformation Scene 🔥',
    views: '2.1M views',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    badge: 'New'
  },
  {
    id: 'short_4',
    title: 'UAE Architecture from 10,000 Feet',
    views: '560K views',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    badge: 'New'
  },
  {
    id: 'short_5',
    title: 'POV: You deployed on Friday at 5:01 PM',
    views: '3.2M views',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
  }
];

const CATEGORIES = [
  'All',
  'Music',
  'Mixes',
  'Podcasts',
  'AI',
  'Gaming',
  'Indie pop music',
  'Live',
  'J-Pop',
  'History',
  'Dance-Pop',
  'Beats',
  'Gadgets',
  'Animated films',
  'Comedy'
];

export const LongsFeed: React.FC<LongsFeedProps> = ({
  posts = [],
  currentUser,
  onVote,
  onToggleSave,
  onOpenCreatePost,
  onRequireAuth,
  onSelectShort
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activePlayingVideo, setActivePlayingVideo] = useState<LongVideoItem | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [dislikedMap, setDislikedMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [subscribedMap, setSubscribedMap] = useState<Record<string, boolean>>({});
  const [activeMenuVideoId, setActiveMenuVideoId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [watchSearchInput, setWatchSearchInput] = useState<string>('anime recap');
  const [selectedWatchChip, setSelectedWatchChip] = useState<string>('All');
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [commentsList, setCommentsList] = useState<Array<{
    id: string;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
    likes: number;
    userLiked?: boolean;
  }>>([
    {
      id: 'c1',
      author: 'AlexRivera',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: 'The explanation on wealth velocity and capital flight around 08:30 was genuinely eye-opening. Best breakdown so far.',
      timestamp: '1 day ago',
      likes: 342
    },
    {
      id: 'c2',
      author: 'DevNinja_99',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      text: 'Great editing and pacing. Love the graphics and animations used throughout!',
      timestamp: '18 hours ago',
      likes: 89
    }
  ]);

  const chipsContainerRef = useRef<HTMLDivElement>(null);
  const watchPageRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const scrollChips = (direction: 'left' | 'right') => {
    if (chipsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      chipsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Merge sample long videos with user posts
  const allLongs: LongVideoItem[] = useMemo(() => {
    const userLongs: LongVideoItem[] = posts
      .filter((p) => (
        p.isLong === true || 
        p.type === 'long' || 
        p.flair === 'Long Video' || 
        p.tags?.some(t => t.toLowerCase().includes('longvideo'))
      ) && !p.isShort && p.type !== 'short' && p.videoUrl)
      .map((p) => {
        const viewsCount = (p.score || 100) * 45;
        const viewsDisplay = viewsCount >= 1000000 
          ? `${(viewsCount / 1000000).toFixed(1)}M views`
          : `${(viewsCount / 1000).toFixed(0)}K views`;

        return {
          id: p.id,
          title: p.title,
          description: p.content || '',
          creator: {
            name: p.author.username,
            handle: p.author.handle,
            avatar: p.author.avatar,
            subscribers: '14.2K',
            isSubscribed: false,
            isVerified: true
          },
          videoUrl: p.videoUrl!,
          thumbnailUrl: p.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
          duration: p.duration || '15:30',
          viewsCount,
          viewsDisplay,
          likesCount: p.score || 0,
          uploadedTime: 'Recent',
          category: 'tech',
          quality: '1080p HD'
        };
      });

    return [...SAMPLE_LONGS, ...userLongs];
  }, [posts]);

  // Filter longs strictly by category
  const filteredVideos = useMemo(() => {
    if (activeCategory === 'All') return allLongs;
    const catLower = activeCategory.toLowerCase();
    return allLongs.filter((v) => {
      const vCat = v.category.toLowerCase();
      const vTitle = v.title.toLowerCase();
      return vCat.includes(catLower) || vTitle.includes(catLower) || catLower.includes(vCat);
    });
  }, [allLongs, activeCategory]);

  // Split into row 1 (first 3 videos) and row 2+ for Shorts shelf placement exactly matching YouTube
  const firstRowVideos = useMemo(() => filteredVideos.slice(0, 3), [filteredVideos]);
  const subsequentVideos = useMemo(() => filteredVideos.slice(3), [filteredVideos]);

  const toggleLike = (id: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to like this video');
      return;
    }
    const isCurrentlyLiked = !!likedMap[id];
    setLikedMap(prev => ({ ...prev, [id]: !isCurrentlyLiked }));
    if (dislikedMap[id]) {
      setDislikedMap(prev => ({ ...prev, [id]: false }));
    }
    if (onVote) onVote(id, isCurrentlyLiked ? 'down' : 'up');
  };

  const toggleDislike = (id: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to dislike this video');
      return;
    }
    setDislikedMap(prev => ({ ...prev, [id]: !prev[id] }));
    if (likedMap[id]) {
      setLikedMap(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleSave = (id: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to save this video to your library');
      return;
    }
    setSavedMap(prev => {
      const next = !prev[id];
      showToast(next ? 'Saved to Watch Later' : 'Removed from Watch Later');
      return { ...prev, [id]: next };
    });
    if (onToggleSave) onToggleSave(id);
  };

  const toggleSubscribe = (handle: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to subscribe to this channel');
      return;
    }
    setSubscribedMap(prev => {
      const next = !prev[handle];
      showToast(next ? 'Subscribed to channel' : 'Subscription removed');
      return { ...prev, [handle]: next };
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to post a comment');
      return;
    }
    const comment = {
      id: `c_${Date.now()}`,
      author: currentUser.username,
      avatar: currentUser.avatar,
      text: newCommentText.trim(),
      timestamp: 'Just now',
      likes: 0
    };
    setCommentsList(prev => [comment, ...prev]);
    setNewCommentText('');
    showToast('Comment added');
  };

  return (
    <div className="flex flex-col w-full bg-white text-[#0f0f0f] min-h-screen">
      
      {/* 1. TOP CATEGORY PILLS BAR (Exact YouTube chips placement & styling) */}
      <div className="sticky top-14 z-20 bg-white/95 backdrop-blur-xs py-2 px-1 border-b border-transparent flex items-center justify-between">
        <div className="relative flex items-center w-full overflow-hidden">
          
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollChips('left')}
            className="hidden sm:flex absolute left-0 z-10 w-9 h-9 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md text-[#0f0f0f] border border-[#0000001a] transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Chips container */}
          <div
            ref={chipsContainerRef}
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth px-1 sm:px-6 w-full"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors select-none ${
                    isActive
                      ? 'bg-[#0f0f0f] text-white'
                      : 'bg-[#0000000d] hover:bg-[#00000014] text-[#0f0f0f]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollChips('right')}
            className="hidden sm:flex absolute right-0 z-10 w-9 h-9 items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md text-[#0f0f0f] border border-[#0000001a] transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#0f0f0f] text-white px-4 py-2.5 rounded-lg text-sm shadow-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#3ea6ff]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Feed Container */}
      <div className="w-full py-4 sm:py-6 px-2 sm:px-4 lg:px-6 flex flex-col gap-8">

        {/* 2. FIRST ROW OF VIDEOS (3 Columns on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-10">
          {firstRowVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={() => setActivePlayingVideo(video)}
              isMenuOpen={activeMenuVideoId === video.id}
              onToggleMenu={() => setActiveMenuVideoId(activeMenuVideoId === video.id ? null : video.id)}
              onSave={() => toggleSave(video.id)}
              isSaved={!!savedMap[video.id]}
              onShare={() => {
                if (navigator.share) {
                  navigator.share({ title: video.title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast('Link copied to clipboard');
                }
              }}
            />
          ))}
        </div>

        {/* 3. SHORTS SHELF SECTION (Inserted directly between video rows matching Screenshot 1) */}
        {activeCategory === 'All' && (
          <div className="flex flex-col gap-4 py-2 border-t border-b border-[#00000014]">
            
            {/* Shelf Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                {/* Red YouTube Shorts Play Logo */}
                <div className="w-6 h-6 rounded-md bg-[#ff0000] flex items-center justify-center shrink-0 shadow-xs">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 8.64c1.1-.6 1.5-1.99.9-3.09a2.3 2.3 0 0 0-3.09-.9l-7.2 3.9a2.29 2.29 0 0 0-1.2 2c0 .88.49 1.68 1.27 2.05.77.32 1.2.5 1.2.5L8.4 14.36a2.29 2.29 0 0 0 .9 3.09c.38.21.8.31 1.22.31.7 0 1.39-.3 1.87-.9l7.2-3.9a2.29 2.29 0 0 0 1.2-2.05c0-.88-.49-1.68-1.27-2.05z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0f0f0f]">
                  Shorts
                </h2>
              </div>

              <button
                className="p-1 text-[#606060] hover:text-[#0f0f0f] rounded-full hover:bg-black/5"
                title="Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Shorts Horizontal Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {SAMPLE_SHORTS_SHELF.map((short) => (
                <div
                  key={short.id}
                  onClick={() => {
                    if (onSelectShort) onSelectShort(short);
                    else showToast(`Opening Short: ${short.title}`);
                  }}
                  className="group flex flex-col gap-2 cursor-pointer"
                >
                  {/* Vertical 9:16 Video Thumbnail */}
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 shadow-2xs">
                    <img
                      src={short.thumbnailUrl}
                      alt={short.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Optional "New" Tag in Top Left */}
                    {short.badge && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-[3px] bg-black/75 text-[10px] font-bold text-white uppercase tracking-wider">
                        {short.badge}
                      </span>
                    )}

                    {/* Top Right 3-dots */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/60 rounded-full text-white">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </div>

                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-0.5">
                      <h3 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 leading-snug">
                        {short.title}
                      </h3>
                      <span className="text-[11px] text-white/80 font-normal">
                        {short.views}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SUBSEQUENT ROWS OF VIDEOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-10">
          {subsequentVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={() => setActivePlayingVideo(video)}
              isMenuOpen={activeMenuVideoId === video.id}
              onToggleMenu={() => setActiveMenuVideoId(activeMenuVideoId === video.id ? null : video.id)}
              onSave={() => toggleSave(video.id)}
              isSaved={!!savedMap[video.id]}
              onShare={() => {
                if (navigator.share) {
                  navigator.share({ title: video.title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast('Link copied to clipboard');
                }
              }}
            />
          ))}
        </div>

      </div>

      {/* 5. AUTHENTIC YOUTUBE WATCH PAGE */}
      {activePlayingVideo && (
        <div 
          ref={watchPageRef}
          className="fixed inset-0 z-[70] bg-white text-[#0f0f0f] w-full h-full min-h-screen flex flex-col animate-in fade-in duration-200 overflow-y-auto"
        >
          {/* Top YouTube Navigation Header */}
          <header className="sticky top-0 h-14 border-b border-[#00000014] bg-white px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-50">
            {/* Left: Hamburger & Brand Logo */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <button
                onClick={() => setActivePlayingVideo(null)}
                className="p-2 rounded-full hover:bg-[#0000000d] text-[#0f0f0f] transition-colors cursor-pointer"
                title="Back to feed"
                aria-label="Back to feed"
              >
                <Menu className="w-5 h-5 stroke-[1.75]" />
              </button>

              <button
                onClick={() => setActivePlayingVideo(null)}
                className="flex items-center gap-1 cursor-pointer focus:outline-none"
                title="Return to feed"
              >
                {/* Brand icon matching Navbar.tsx */}
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 transform -rotate-12 transition-transform duration-200 hover:scale-105"
                  >
                    <path
                      d="M7 10v12"
                      stroke="#00BFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
                      fill="#00BFFF"
                      stroke="#00BFFF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 10v12"
                      stroke="#ffffff"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Brand Typography & KE superscript badge */}
                <div className="relative inline-flex items-end">
                  <span className="text-[19px] font-bold tracking-tighter lowercase leading-none text-[#0f0f0f]">
                    buvaki
                  </span>
                  <sup className="text-[8.5px] font-normal text-[#606060] ml-0.5 self-start -mt-1.5 select-none leading-none tracking-normal">
                    KE
                  </sup>
                </div>
              </button>
            </div>

            {/* Center: Search Box & Voice Mic */}
            <div className="hidden sm:flex flex-1 max-w-2xl mx-auto items-center justify-center px-2">
              <div className="flex items-center w-full max-w-[540px] h-10">
                <div className="flex-1 flex items-center h-full border border-[#cccccc] focus-within:border-[#1c62b9] focus-within:shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] bg-white rounded-l-full px-4 transition-all">
                  <input
                    type="text"
                    value={watchSearchInput}
                    onChange={(e) => setWatchSearchInput(e.target.value)}
                    placeholder="Search"
                    className="w-full bg-transparent text-sm focus:outline-none text-[#0f0f0f] placeholder-[#606060]"
                  />
                  {watchSearchInput && (
                    <button
                      onClick={() => setWatchSearchInput('')}
                      className="p-1 text-[#606060] hover:text-[#0f0f0f] transition-colors"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  className="h-full px-6 border border-l-0 border-[#cccccc] rounded-r-full flex items-center justify-center bg-[#f8f8f8] hover:bg-[#f0f0f0] text-[#0f0f0f] transition-colors"
                  title="Search"
                >
                  <Search className="w-4 h-4 stroke-[2]" />
                </button>
              </div>

              {/* Voice mic button */}
              <button
                onClick={() => showToast('Voice search listening...')}
                className="ml-3 w-10 h-10 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] flex items-center justify-center text-[#0f0f0f] transition-colors shrink-0"
                title="Search with your voice"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Right: + Create, Bell, User Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => {
                  if (onOpenCreatePost) onOpenCreatePost();
                  else if (onRequireAuth) onRequireAuth('Sign in to create a post');
                }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0000000d] hover:bg-[#00000014] text-[#0f0f0f] text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
                <span>Create</span>
              </button>

              <button
                onClick={() => showToast('9+ new notifications')}
                className="relative p-2 rounded-full hover:bg-[#0000000d] text-[#0f0f0f] transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5 stroke-[1.75]" />
                <span className="absolute top-1.5 right-1.5 px-1 py-0.2 bg-[#cc0000] text-white text-[9px] font-bold rounded-full leading-none">
                  9+
                </span>
              </button>

              {currentUser ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-black/10 cursor-pointer"
                  referrerPolicy="no-referrer"
                  onClick={() => showToast(`Signed in as ${currentUser.username}`)}
                />
              ) : (
                <button
                  onClick={() => onRequireAuth && onRequireAuth('Sign in to access your channel')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#065fd4] text-[#065fd4] hover:bg-[#065fd4]/10 text-xs font-semibold transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign in</span>
                </button>
              )}
            </div>
          </header>

          {/* Watch Layout: Main Player + Info Column & Right Up-Next Column */}
          <div className="w-full max-w-[1720px] mx-auto p-3 sm:p-6 lg:p-7 flex flex-col lg:flex-row gap-6">
            
            {/* Main Stage (Left / Center) */}
            <div className="flex-1 min-w-0 flex flex-col">
              
              {/* 16:9 Video Player */}
              <div className="w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-md">
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

              {/* Title */}
              <h1 className="text-lg sm:text-xl font-bold text-[#0f0f0f] leading-snug tracking-tight mt-3">
                {activePlayingVideo.title}
              </h1>

              {/* Channel Row & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 py-2 mt-1 border-b border-[#0000000d]">
                
                {/* Channel avatar & Subscribe Button */}
                <div className="flex items-center gap-3">
                  <img
                    src={activePlayingVideo.creator.avatar}
                    alt={activePlayingVideo.creator.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-black/10 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#0f0f0f]">
                        {activePlayingVideo.creator.name}
                      </span>
                      {activePlayingVideo.creator.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#606060]" />
                      )}
                    </div>
                    <span className="text-xs text-[#606060]">
                      {activePlayingVideo.creator.subscribers} subscribers
                    </span>
                  </div>

                  <button
                    onClick={() => toggleSubscribe(activePlayingVideo.creator.handle)}
                    className={`ml-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      (subscribedMap[activePlayingVideo.creator.handle] ?? activePlayingVideo.creator.isSubscribed)
                        ? 'bg-[#0000000d] hover:bg-[#00000014] text-[#0f0f0f] flex items-center gap-1.5'
                        : 'bg-[#0f0f0f] hover:bg-neutral-800 text-white'
                    }`}
                  >
                    {(subscribedMap[activePlayingVideo.creator.handle] ?? activePlayingVideo.creator.isSubscribed) ? (
                      <>
                        <Bell className="w-3.5 h-3.5 fill-[#0f0f0f]" />
                        <span>Subscribed</span>
                      </>
                    ) : (
                      <span>Subscribe</span>
                    )}
                  </button>
                </div>

                {/* Actions: Segmented Like/Dislike, Share, Download, Clip, Save, More */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  
                  {/* Segmented Like / Dislike Pill */}
                  <div className="flex items-center bg-[#0000000d] hover:bg-[#00000014] rounded-full text-sm font-medium text-[#0f0f0f] transition-colors">
                    <button
                      onClick={() => toggleLike(activePlayingVideo.id)}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-black/5 rounded-l-full"
                      title="I like this"
                    >
                      <ThumbsUp className={`w-4 h-4 stroke-[1.75] ${likedMap[activePlayingVideo.id] ? 'fill-[#0f0f0f]' : ''}`} />
                      <span>
                        {(activePlayingVideo.likesCount + (likedMap[activePlayingVideo.id] ? 1 : 0)).toLocaleString()}
                      </span>
                    </button>
                    <div className="w-[1px] h-5 bg-[#0000001a]" />
                    <button
                      onClick={() => toggleDislike(activePlayingVideo.id)}
                      className="px-3 py-2 hover:bg-black/5 rounded-r-full"
                      title="I dislike this"
                    >
                      <ThumbsDown className={`w-4 h-4 stroke-[1.75] ${dislikedMap[activePlayingVideo.id] ? 'fill-[#0f0f0f]' : ''}`} />
                    </button>
                  </div>

                  {/* Share Pill */}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: activePlayingVideo.title, url: window.location.href }).catch(() => {});
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                        showToast('Link copied to clipboard');
                      }
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0000000d] hover:bg-[#00000014] text-[#0f0f0f] text-sm font-medium transition-all"
                  >
                    <Share2 className="w-4 h-4 stroke-[1.75]" />
                    <span>Share</span>
                  </button>

                  {/* Download Pill */}
                  <button
                    onClick={() => showToast('Download started for offline viewing')}
                    className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0000000d] hover:bg-[#00000014] text-[#0f0f0f] text-sm font-medium transition-all"
                  >
                    <Download className="w-4 h-4 stroke-[1.75]" />
                    <span>Download</span>
                  </button>

                  {/* Clip Pill */}
                  <button
                    onClick={() => showToast('Create clip feature ready')}
                    className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0000000d] hover:bg-[#00000014] text-[#0f0f0f] text-sm font-medium transition-all"
                  >
                    <Scissors className="w-4 h-4 stroke-[1.75]" />
                    <span>Clip</span>
                  </button>

                  {/* Save Pill */}
                  <button
                    onClick={() => toggleSave(activePlayingVideo.id)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0000000d] hover:bg-[#00000014] text-[#0f0f0f] text-sm font-medium transition-all"
                  >
                    <Bookmark className={`w-4 h-4 stroke-[1.75] ${savedMap[activePlayingVideo.id] ? 'fill-[#0f0f0f]' : ''}`} />
                    <span>{savedMap[activePlayingVideo.id] ? 'Saved' : 'Save'}</span>
                  </button>

                  {/* More Pill */}
                  <button
                    onClick={() => showToast('More options')}
                    className="p-2 rounded-full bg-[#0000000d] hover:bg-[#00000014] text-[#0f0f0f] transition-all"
                    title="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4 stroke-[1.75]" />
                  </button>
                </div>

              </div>

              {/* YouTube Expandable Description Box */}
              <div 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="p-3.5 rounded-xl bg-[#0000000d] hover:bg-[#00000014] text-sm text-[#0f0f0f] flex flex-col gap-2 transition-colors cursor-pointer mt-3"
              >
                <div className="flex flex-wrap items-center gap-2 font-bold text-xs sm:text-sm text-[#0f0f0f]">
                  <span>{activePlayingVideo.viewsCount.toLocaleString()} views</span>
                  <span>•</span>
                  <span>{activePlayingVideo.uploadedTime}</span>
                  <span className="text-[#065fd4] font-medium ml-1">#anime #recap #trending</span>
                </div>
                <p className={`whitespace-pre-wrap text-sm leading-relaxed text-[#0f0f0f] ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
                  {activePlayingVideo.description}
                </p>
                <button className="text-xs font-bold text-[#0f0f0f] self-start mt-0.5">
                  {isDescriptionExpanded ? 'Show less' : '...more'}
                </button>
              </div>

              {/* Comments Section */}
              <div className="flex flex-col gap-4 mt-5">
                <div className="flex items-center gap-6">
                  <h2 className="text-base sm:text-lg font-bold text-[#0f0f0f]">
                    {commentsList.length + 840} Comments
                  </h2>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-[#0f0f0f] hover:bg-[#0000000d] px-2.5 py-1.5 rounded-lg">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Sort by</span>
                  </button>
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="flex items-start gap-3 mt-1">
                  {currentUser ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-8 h-8 rounded-full object-cover mt-0.5 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#f2f2f2] text-[#606060] flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={currentUser ? "Add a comment..." : "Sign in to add a comment..."}
                      className="w-full text-sm border-b border-[#0000001a] focus:border-[#0f0f0f] pb-1.5 outline-none bg-transparent placeholder-[#606060] text-[#0f0f0f] transition-colors"
                      onFocus={() => {
                        if (!currentUser && onRequireAuth) {
                          onRequireAuth('Sign in to leave a comment');
                        }
                      }}
                    />
                    {newCommentText.trim() && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setNewCommentText('')}
                          className="px-3 py-1.5 text-xs font-semibold text-[#0f0f0f] hover:bg-[#0000000d] rounded-full"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 text-xs font-semibold bg-[#065fd4] hover:bg-[#065fd4]/90 text-white rounded-full shadow-xs"
                        >
                          Comment
                        </button>
                      </div>
                    )}
                  </div>
                </form>

                {/* Existing Comments List */}
                <div className="flex flex-col gap-4 mt-2">
                  {commentsList.map((comm) => (
                    <div key={comm.id} className="flex items-start gap-3">
                      <img
                        src={comm.avatar}
                        alt={comm.author}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 flex flex-col gap-0.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-bold text-[#0f0f0f]">
                            {comm.author}
                          </span>
                          <span className="text-[11px] text-[#606060]">
                            {comm.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-[#0f0f0f] leading-snug">
                          {comm.text}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#606060]">
                          <button 
                            onClick={() => {
                              if (!currentUser && onRequireAuth) {
                                onRequireAuth('Sign in to like comments');
                                return;
                              }
                              setCommentsList(prev => prev.map(c => c.id === comm.id ? { ...c, userLiked: !c.userLiked, likes: c.likes + (c.userLiked ? -1 : 1) } : c));
                            }}
                            className="flex items-center gap-1 hover:text-[#0f0f0f]"
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${comm.userLiked ? 'fill-[#0f0f0f] text-[#0f0f0f]' : ''}`} />
                            {comm.likes > 0 && <span>{comm.likes}</span>}
                          </button>
                          <button 
                            onClick={() => {
                              if (!currentUser && onRequireAuth) {
                                onRequireAuth('Sign in to dislike comments');
                                return;
                              }
                            }}
                            className="hover:text-[#0f0f0f]"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              if (!currentUser && onRequireAuth) {
                                onRequireAuth('Sign in to reply to comments');
                                return;
                              }
                            }}
                            className="font-semibold hover:text-[#0f0f0f] text-[11px] px-2 py-0.5 rounded-full hover:bg-[#0000000d]"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Up Next / Suggested Videos Sidebar with YouTube Chips Bar */}
            <div className="w-full lg:w-[400px] xl:w-[420px] flex flex-col gap-3 shrink-0">
              {/* YouTube Filter Chips Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar">
                  {['All', 'From your search', `From ${activePlayingVideo.creator.name.split(' ')[0]}`, 'Related', 'Recently uploaded'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setSelectedWatchChip(chip)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedWatchChip === chip
                          ? 'bg-[#0f0f0f] text-white shadow-2xs'
                          : 'bg-[#0000000d] hover:bg-[#00000014] text-[#0f0f0f]'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => showToast('More filters')}
                  className="w-8 h-8 rounded-full hover:bg-[#0000000d] flex items-center justify-center shrink-0 text-[#0f0f0f]"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Video List */}
              <div className="flex flex-col gap-2.5">
                {allLongs.filter(v => v.id !== activePlayingVideo.id).map((video) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      setActivePlayingVideo(video);
                      watchPageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex gap-2.5 cursor-pointer group hover:bg-[#00000005] p-1 rounded-xl transition-colors relative"
                  >
                    {/* Compact 16:9 Thumbnail */}
                    <div className="relative w-[168px] aspect-video rounded-xl overflow-hidden bg-[#e5e5e5] shrink-0 shadow-2xs">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[11px] font-semibold text-white font-mono tracking-tight">
                        {video.duration}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col min-w-0 flex-1 pr-6">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#0f0f0f] line-clamp-2 leading-snug group-hover:text-black">
                        {video.title}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-[#606060] truncate">
                          {video.creator.name}
                        </span>
                        {video.creator.isVerified && (
                          <CheckCircle2 className="w-3 h-3 text-[#606060] shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#606060] mt-0.5">
                        <span>{video.viewsDisplay}</span>
                        <span>•</span>
                        <span>{video.uploadedTime}</span>
                      </div>
                      {video.uploadedTime.includes('hour') && (
                        <span className="self-start mt-1 px-1.5 py-0.2 rounded bg-[#0000000d] text-[10px] font-semibold text-[#606060]">
                          New
                        </span>
                      )}
                    </div>

                    {/* 3-dots menu button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Options for ${video.title}`);
                      }}
                      className="absolute right-1 top-2 p-1 rounded-full text-transparent group-hover:text-[#0f0f0f] hover:bg-black/10 transition-colors"
                      title="Action menu"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Sub-Component: YouTube-Style Standard Video Card (with Sponsored Ad layout support)
interface VideoCardProps {
  video: LongVideoItem;
  onPlay: () => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onSave: () => void;
  isSaved: boolean;
  onShare: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  isMenuOpen,
  onToggleMenu,
  onSave,
  isSaved,
  onShare
}) => {
  return (
    <div className="group flex flex-col gap-3 relative select-none">
      
      {/* 16:9 Thumbnail Container */}
      <div 
        onClick={onPlay}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#e5e5e5] cursor-pointer shadow-2xs group-hover:shadow-xs transition-all"
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Diagonal External Link arrow on Sponsored cards (matching Screenshot 1) */}
        {video.isSponsored && (
          <div className="absolute bottom-2 right-2 w-7 h-7 rounded-md bg-black/70 text-white flex items-center justify-center">
            <ExternalLink className="w-4 h-4" />
          </div>
        )}

        {/* Timestamp duration badge (bottom-right) */}
        {!video.isSponsored && (
          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-[4px] bg-black/80 text-[12px] font-medium text-white font-sans tracking-tight">
            {video.duration}
          </span>
        )}
      </div>

      {/* Video Details Below Thumbnail */}
      <div className="flex items-start gap-3 px-0.5">
        
        {/* Channel Avatar Circle */}
        <img
          src={video.creator.avatar}
          alt={video.creator.name}
          onClick={onPlay}
          className="w-9 h-9 rounded-full object-cover shrink-0 cursor-pointer mt-0.5 ring-1 ring-black/5"
          referrerPolicy="no-referrer"
        />

        {/* Video Title, Channel Name, Views & Upload Time */}
        <div className="flex flex-col min-w-0 flex-1">
          
          <h3 
            onClick={onPlay}
            className="text-[15px] sm:text-[16px] font-semibold text-[#0f0f0f] line-clamp-2 leading-[1.3] tracking-tight group-hover:text-black cursor-pointer mb-1"
          >
            {video.title}
          </h3>

          {/* Channel Name Line */}
          <div className="flex items-center gap-1 text-[13px] sm:text-[14px] text-[#606060] hover:text-[#0f0f0f] cursor-pointer truncate">
            {video.isSponsored ? (
              <span className="font-semibold text-[#0f0f0f]">Sponsored • {video.sponsorName}</span>
            ) : (
              <>
                <span className="truncate">{video.creator.name}</span>
                {video.creator.isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#606060] shrink-0" />
                )}
                {video.creator.isMusicBadge && (
                  <span className="text-[10px] bg-black/5 px-1 rounded-sm text-[#606060] font-sans">♪</span>
                )}
              </>
            )}
          </div>

          {/* Views and Time ago */}
          {!video.isSponsored && (
            <div className="flex items-center gap-1 text-[13px] sm:text-[14px] text-[#606060] mt-0.5 leading-tight">
              <span>{video.viewsDisplay}</span>
              <span>•</span>
              <span>{video.uploadedTime}</span>
            </div>
          )}

          {/* Sponsored Ad Action Buttons (matching Kamatera in Screenshot 1!) */}
          {video.isSponsored && (
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={onPlay}
                className="px-5 py-2 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#0f0f0f] text-sm font-medium transition-colors"
              >
                Watch
              </button>
              <a
                href={video.sponsorActionUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-full bg-[#0f0f0f] hover:bg-neutral-800 text-white text-sm font-medium transition-colors"
              >
                Learn more
              </a>
            </div>
          )}

        </div>

        {/* 3-Dots Vertical Options Menu Button */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#0f0f0f] hover:bg-black/10 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer -mr-2"
            title="Action menu"
          >
            <MoreVertical className="w-4 h-4 stroke-[1.75]" />
          </button>

          {/* Popup Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-9 w-48 bg-white border border-[#0000001a] rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95 text-xs text-[#0f0f0f]">
              <button
                onClick={() => {
                  onSave();
                  onToggleMenu();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#f2f2f2] flex items-center gap-2.5 font-medium"
              >
                <Bookmark className="w-4 h-4" />
                <span>{isSaved ? 'Remove from Watch later' : 'Save to Watch later'}</span>
              </button>
              <button
                onClick={() => {
                  onShare();
                  onToggleMenu();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-[#f2f2f2] flex items-center gap-2.5 font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={onToggleMenu}
                className="w-full text-left px-3.5 py-2 hover:bg-[#f2f2f2] flex items-center gap-2.5 font-medium"
              >
                <Clock className="w-4 h-4" />
                <span>Save to playlist</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
