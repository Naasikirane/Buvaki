import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, SupportedLanguage, Post } from '../types';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Share2, 
  Repeat2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  Music2, 
  Check, 
  X, 
  Send, 
  ChevronDown, 
  ChevronUp,
  Heart,
  MoreVertical
} from 'lucide-react';
import { resolvePlayableVideoUrl, FALLBACK_VIDEOS } from '../lib/mediaStorage';

export interface ShortVideoItem {
  id: string;
  title: string;
  creator: {
    id?: string;
    name: string;
    handle: string;
    avatar: string;
    isFollowing?: boolean;
  };
  videoUrl: string;
  thumbnailUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  musicTitle: string;
}

interface ShortsFeedProps {
  posts?: Post[];
  currentUser: User | null;
  selectedLanguage: SupportedLanguage;
  onOpenCreatePost?: () => void;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onToggleSave?: (postId: string) => void;
  onSelectPost?: (post: Post) => void;
  onRequireAuth?: (promptReason?: string) => void;
  onSubscribeToggle?: (creatorKey: string) => void;
  subscribedCreators?: Set<string>;
}

// YouTube-quality sample shorts
const DEFAULT_SHORTS: ShortVideoItem[] = [
  {
    id: 'short_robot_lifelike',
    title: "China's Lifelike Robot Face Will Make You Question Everything.",
    creator: {
      id: 'u_startup_vault',
      name: 'Startup Vault Clips',
      handle: '@Startup-Vault-Clips',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    },
    videoUrl: FALLBACK_VIDEOS.portrait,
    thumbnailUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&auto=format&fit=crop&q=80',
    likesCount: 1024,
    commentsCount: 445,
    sharesCount: 182,
    musicTitle: 'Original Audio - Startup Vault',
  },
  {
    id: 'short_novacine_marvel',
    title: "Marvel has always done a good job of hiding the plot of their movies in trailers vs actual movie",
    creator: {
      id: 'u_novacine',
      name: 'NovaCine',
      handle: '@NovaCine',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    videoUrl: FALLBACK_VIDEOS.creative,
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    likesCount: 31200,
    commentsCount: 1240,
    sharesCount: 4890,
    musicTitle: 'Epic Trailer Themes • Hans Zimmer Tribute',
  },
  {
    id: 'short_pink_sand',
    title: "A beach with pink sand at sunset ✨ Nothing compares to this view",
    creator: {
      id: 'u_clover',
      name: 'Clover',
      handle: '@clover',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    videoUrl: FALLBACK_VIDEOS.general,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    likesCount: 4890,
    commentsCount: 89,
    sharesCount: 320,
    musicTitle: 'Beach Breeze Lo-Fi • Sunset Vibes',
  },
  {
    id: 'short_gion_kyoto',
    title: "Spent the evening chasing the golden glow through Gion alleys. Captured on 35mm f/1.4",
    creator: {
      id: 'u_visualstories',
      name: 'Visual Stories',
      handle: '@visualstories',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    videoUrl: FALLBACK_VIDEOS.landscape,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    likesCount: 14500,
    commentsCount: 348,
    sharesCount: 910,
    musicTitle: 'Kyoto Memories • Acoustic Guitar',
  },
  {
    id: 'short_neon_cyberpunk',
    title: "Late night drive through Neo Tokyo neon rain 🏎️💨 cyberpunk aesthetic",
    creator: {
      id: 'u_tech',
      name: 'Tech Chronicles',
      handle: '@TechChronicles',
      avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    },
    videoUrl: FALLBACK_VIDEOS.tech,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    likesCount: 22800,
    commentsCount: 612,
    sharesCount: 3420,
    musicTitle: 'Synthwave Night Runner • 80s Retro',
  }
];

function formatCount(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export const ShortsFeed: React.FC<ShortsFeedProps> = ({
  posts = [],
  currentUser,
  onVote,
  onRequireAuth,
  onSubscribeToggle,
  subscribedCreators = new Set()
}) => {
  // Combine user-created short video posts with our seed shorts
  const allShorts: ShortVideoItem[] = useMemo(() => {
    const userShorts: ShortVideoItem[] = posts
      .filter((p) => (p.isShort === true || p.type === 'short') && p.videoUrl)
      .map((p) => ({
        id: p.id,
        title: p.title || p.content || 'Untitled Short',
        creator: {
          id: p.author.id,
          name: p.author.username,
          handle: p.author.handle,
          avatar: p.author.avatar,
        },
        videoUrl: p.videoUrl!,
        thumbnailUrl: p.imageUrl || undefined,
        likesCount: p.score || 0,
        commentsCount: p.commentCount || 0,
        sharesCount: Math.floor((p.score || 0) * 0.25),
        musicTitle: 'Original audio - ' + p.author.username,
      }));

    // Deduplicate against defaults
    const combined = [...userShorts, ...DEFAULT_SHORTS];
    const seen = new Set<string>();
    return combined.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [posts]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down'>('up');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  
  // Interaction states
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [dislikedMap, setDislikedMap] = useState<Record<string, boolean>>({});
  const [heartAnim, setHeartAnim] = useState<{ x: number; y: number; id: number } | null>(null);

  // Comments drawer / side panel
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, { id: string; user: string; avatar: string; text: string; time: string; likes: number }[]>>({
    short_robot_lifelike: [
      { id: 'c1', user: '@CyberFuture', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', text: 'The micro-expressions around the eye muscles are scary realistic...', time: '3h ago', likes: 142 },
      { id: 'c2', user: '@RoboTech', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', text: 'Uncanny valley is basically conquered at this point.', time: '1h ago', likes: 89 }
    ],
    short_novacine_marvel: [
      { id: 'c3', user: '@MarvelTheorist', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', text: 'Infinity War trailers literally edited out the Infinity Stones in Thanos gauntlet haha', time: '1d ago', likes: 512 }
    ]
  });

  const currentShort = allShorts[currentIndex] || allShorts[0];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isWheelingRef = useRef(false);
  const lastTapRef = useRef<number>(0);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    if (currentShort?.videoUrl) {
      resolvePlayableVideoUrl(currentShort.videoUrl, 'portrait').then((url) => {
        if (active) setResolvedVideoUrl(url);
      });
    }
    return () => { active = false; };
  }, [currentShort?.videoUrl]);

  // Video play/pause effect
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Playback waiting for user gesture or muted state:', err);
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, currentIndex, resolvedVideoUrl]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < allShorts.length - 1) {
      setSlideDirection('up');
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  }, [currentIndex, allShorts.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSlideDirection('down');
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  }, [currentIndex]);

  // Mouse wheel navigation
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (isWheelingRef.current || isCommentsOpen) return;
    if (Math.abs(e.deltaY) > 35) {
      isWheelingRef.current = true;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setTimeout(() => {
        isWheelingRef.current = false;
      }, 450);
    }
  }, [handleNext, handlePrev, isCommentsOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommentsOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
        setShowPlayIcon(true);
        setTimeout(() => setShowPlayIcon(false), 700);
      } else if (e.key === 'm') {
        setIsMuted((m) => !m);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isCommentsOpen]);

  // Like / Dislike
  const toggleLike = (id: string) => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth('Sign in to like this Short');
      return;
    }
    setLikedMap((prev) => {
      const next = !prev[id];
      if (next && onVote) onVote(id, 'up');
      return { ...prev, [id]: next };
    });
    if (dislikedMap[id]) {
      setDislikedMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleDislike = (id: string) => {
    if (!currentUser && onRequireAuth) {
      onRequireAuth('Sign in to dislike this Short');
      return;
    }
    setDislikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    if (likedMap[id]) {
      setLikedMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Video Tap (Single tap = play/pause, Double tap = like)
  const handleVideoTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (now - lastTapRef.current < 300) {
      if (currentShort && !likedMap[currentShort.id]) {
        toggleLike(currentShort.id);
      }
      setHeartAnim({ x, y, id: Date.now() });
      setTimeout(() => setHeartAnim(null), 800);
    } else {
      setIsPlaying((prev) => !prev);
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 700);
    }
    lastTapRef.current = now;
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentShort) return;
    if (!currentUser && onRequireAuth) {
      onRequireAuth('Sign in to comment on this Short');
      return;
    }

    const newComment = {
      id: `comm_${Date.now()}`,
      user: currentUser ? currentUser.handle : '@Guest',
      avatar: currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text: commentText.trim(),
      time: 'Just now',
      likes: 0
    };

    setCommentsMap((prev) => ({
      ...prev,
      [currentShort.id]: [newComment, ...(prev[currentShort.id] || [])]
    }));
    setCommentText('');
  };

  if (!currentShort) return null;

  const isLiked = !!likedMap[currentShort.id];
  const isDisliked = !!dislikedMap[currentShort.id];
  const isSubscribed = 
    subscribedCreators.has(currentShort.creator.handle) || 
    (currentShort.creator.id ? subscribedCreators.has(currentShort.creator.id) : false);

  const commentsList = commentsMap[currentShort.id] || [];

  return (
    <div 
      onWheel={handleWheel}
      className="relative w-full h-[calc(100vh-3.5rem)] flex items-center justify-start xl:justify-center pl-3 sm:pl-8 lg:pl-12 select-none overflow-hidden"
    >
      {/* Centered Shorts Card Container (Left Details + Center Video + Action Rail) */}
      <div className="relative flex items-end gap-3 sm:gap-4 lg:gap-6 h-full max-h-[calc(100vh-4rem)] py-2">
        
        {/* 1. LEFT SIDE: Channel Info, Title, Sound Track (Placed closely on the left like YouTube) */}
        <div className="hidden md:flex flex-col justify-end w-[280px] lg:w-[320px] xl:w-[350px] pb-4 text-left gap-3 shrink-0">
          {/* Channel Row: Avatar + Handle + Subscribe Button */}
          <div className="flex items-center gap-2.5">
            <img
              src={currentShort.creator.avatar}
              alt={currentShort.creator.name}
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 shadow-sm"
              referrerPolicy="no-referrer"
            />
            
            <span className="text-sm font-bold text-slate-900 truncate max-w-[130px] lg:max-w-[160px]">
              {currentShort.creator.handle}
            </span>

            {/* YouTube "Subscribe" Pill Button */}
            <button
              onClick={() => {
                if (!currentUser && onRequireAuth) {
                  onRequireAuth('Sign in or create an account to subscribe to creators');
                  return;
                }
                if (onSubscribeToggle) {
                  onSubscribeToggle(currentShort.creator.handle);
                }
              }}
              className={`ml-auto px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm flex items-center gap-1 shrink-0 ${
                isSubscribed
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {isSubscribed ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Subscribed</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </div>

          {/* Video Title / Headline */}
          <h1 className="text-base lg:text-lg font-bold text-slate-900 leading-snug line-clamp-3">
            {currentShort.title}
          </h1>

          {/* Audio Track / Tag Pill */}
          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-full w-fit max-w-full cursor-pointer transition-colors shadow-sm">
            <Music2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
            <span className="truncate max-w-[240px]">
              {currentShort.musicTitle}
            </span>
          </div>
        </div>

        {/* 2. The 9:16 Vertical Video Frame */}
        <div className="relative h-full aspect-[9/16] max-h-[720px] max-w-[405px] w-auto bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex items-center justify-center shrink-0">
          
          <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
            <motion.div
              key={currentShort.id}
              custom={slideDirection}
              initial={{ y: slideDirection === 'up' ? '100%' : '-100%', opacity: 0.95 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: slideDirection === 'up' ? '-100%' : '100%', opacity: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.y < -50 || info.velocity.y < -250) {
                  handleNext();
                } else if (info.offset.y > 50 || info.velocity.y > 250) {
                  handlePrev();
                }
              }}
              className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {/* Clickable Video Player Container */}
              <div 
                onClick={handleVideoTap}
                className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden cursor-pointer"
              >
                <video
                  ref={videoRef}
                  src={resolvedVideoUrl || currentShort.videoUrl}
                  poster={currentShort.thumbnailUrl}
                  autoPlay={isPlaying}
                  loop
                  muted={isMuted}
                  playsInline
                  onError={() => {
                    if (videoRef.current) {
                      videoRef.current.src = FALLBACK_VIDEOS.portrait;
                      videoRef.current.load();
                    }
                  }}
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* Top Subtle Gradient Overlay */}
                <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none z-10" />

                {/* Top Controls: Sound Toggle & Counter */}
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-auto"
                >
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-95 shadow-md"
                    title={isMuted ? 'Unmute' : 'Mute'}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                      {currentIndex + 1} / {allShorts.length}
                    </span>
                  </div>
                </div>

                {/* Play / Pause Animated Center Icon Overlay */}
                <AnimatePresence>
                  {showPlayIcon && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    >
                      <div className="w-16 h-16 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/10">
                        {isPlaying ? (
                          <Play className="w-7 h-7 text-white fill-white ml-1" />
                        ) : (
                          <Pause className="w-7 h-7 text-white fill-white" />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Double-tap Floating Heart Animation */}
                {heartAnim && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1, y: 0 }}
                    animate={{ scale: [0, 1.4, 1.1], opacity: [1, 1, 0], y: -50 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    style={{ left: heartAnim.x - 36, top: heartAnim.y - 36 }}
                    className="absolute pointer-events-none z-30"
                  >
                    <Heart className="w-20 h-20 text-red-500 fill-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.9)]" />
                  </motion.div>
                )}

                {/* Mobile-only bottom overlay (hidden on md and above screens) */}
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="md:hidden absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-2 text-left pointer-events-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={currentShort.creator.avatar}
                      alt={currentShort.creator.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-white/30 shrink-0 shadow"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs font-bold text-white truncate max-w-[130px]">
                      {currentShort.creator.handle}
                    </span>
                    <button
                      onClick={() => {
                        if (!currentUser && onRequireAuth) {
                          onRequireAuth('Sign in or create an account to subscribe to creators');
                          return;
                        }
                        if (onSubscribeToggle) {
                          onSubscribeToggle(currentShort.creator.handle);
                        }
                      }}
                      className={`ml-auto px-3 py-1 rounded-full text-[11px] font-bold ${
                        isSubscribed ? 'bg-neutral-800 text-white' : 'bg-white text-black'
                      }`}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>
                  <p className="text-xs text-white leading-snug line-clamp-2">{currentShort.title}</p>
                  <div className="flex items-center gap-1.5 text-white/80 text-[11px]">
                    <Music2 className="w-3 h-3 text-white" />
                    <span className="truncate">{currentShort.musicTitle}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

        </div>

        {/* 3. YouTube Desktop Right Action Rail (Thumbs Up, Thumbs Down, Comments, Share, Remix, Sound Art) */}
        <div className="flex flex-col items-center gap-3.5 pb-2 shrink-0 z-20">
          
          {/* 1. Like (Thumbs Up) Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => toggleLike(currentShort.id)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm border ${
                isLiked
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
              }`}
              title="I like this"
              aria-label="Like short"
            >
              <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </button>
            <span className="text-xs font-semibold text-slate-700 text-center">
              {formatCount(currentShort.likesCount + (isLiked ? 1 : 0))}
            </span>
          </div>

          {/* 2. Dislike (Thumbs Down) Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => toggleDislike(currentShort.id)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm border ${
                isDisliked
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
              }`}
              title="I dislike this"
              aria-label="Dislike short"
            >
              <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'fill-white' : ''}`} />
            </button>
            <span className="text-xs font-semibold text-slate-700 text-center">
              Dislike
            </span>
          </div>

          {/* 3. Comments Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all active:scale-90 shadow-sm"
              title="Comments"
              aria-label="View comments"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-slate-700 text-center">
              {formatCount(currentShort.commentsCount + commentsList.length)}
            </span>
          </div>

          {/* 4. Share Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: currentShort.title,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                }
              }}
              className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all active:scale-90 shadow-sm"
              title="Share"
              aria-label="Share short"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-slate-700 text-center">
              Share
            </span>
          </div>

          {/* 5. Remix Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                if (!currentUser && onRequireAuth) {
                  onRequireAuth('Sign in to remix with this audio');
                  return;
                }
              }}
              className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all active:scale-90 shadow-sm"
              title="Remix"
              aria-label="Remix"
            >
              <Repeat2 className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-slate-700 text-center">
              Remix
            </span>
          </div>

          {/* 6. Sound Track / Creator Art (Spinning Vinyl) */}
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm mt-1 relative flex items-center justify-center bg-slate-100">
            <img
              src={currentShort.creator.avatar}
              alt=""
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '6s' }}
              referrerPolicy="no-referrer"
            />
          </div>

        </div>

      </div>

      {/* 4. FAR RIGHT: YouTube Floating Navigation Arrow Buttons */}
      <div className="hidden sm:flex flex-col gap-3.5 absolute right-4 sm:right-8 lg:right-12 xl:right-16 top-1/2 -translate-y-1/2 z-30">
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shadow-md transition-all active:scale-90"
            title="Previous video (Up arrow)"
            aria-label="Previous video"
          >
            <ChevronUp className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {currentIndex < allShorts.length - 1 && (
          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center shadow-md transition-all active:scale-90"
            title="Next video (Down arrow)"
            aria-label="Next video"
          >
            <ChevronDown className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* YouTube-Style Comments Drawer / Side Panel */}
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="fixed inset-y-16 right-4 sm:right-6 lg:right-12 z-50 w-full max-w-sm sm:max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Comments Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">Comments</span>
                <span className="text-xs font-semibold text-slate-500">
                  {commentsList.length}
                </span>
              </div>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                aria-label="Close comments"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments Scrollable List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4 custom-scrollbar bg-white">
              {commentsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm font-medium text-slate-600">No comments yet</p>
                  <p className="text-xs text-slate-400">Be the first to share what you think!</p>
                </div>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <img
                      src={c.avatar}
                      alt={c.user}
                      className="w-8 h-8 rounded-full object-cover mt-0.5 shrink-0 ring-1 ring-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {c.user}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {c.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 mt-1 leading-relaxed">
                        {c.text}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-slate-500">
                        <button className="flex items-center gap-1 hover:text-slate-900 text-[11px] transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{c.likes || 0}</span>
                        </button>
                        <button className="hover:text-slate-900 text-[11px] transition-colors">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <button className="hover:text-slate-900 text-[11px] font-semibold transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <img
                src={currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt=""
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                referrerPolicy="no-referrer"
              />
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-slate-50 text-slate-900 text-xs px-3 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-slate-400 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white transition-all"
                aria-label="Send comment"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
