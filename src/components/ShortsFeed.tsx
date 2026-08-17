import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, SupportedLanguage, Post } from '../types';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Play, 
  Music,
  Plus,
  Check,
  X,
  Send
} from 'lucide-react';

export interface ShortVideoItem {
  id: string;
  title: string;
  creator: {
    name: string;
    handle: string;
    avatar: string;
    isFollowing?: boolean;
  };
  videoUrl: string;
  thumbnailUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  tags: string[];
  musicTitle: string;
  subBuvaki: string;
}

const SAMPLE_SHORTS: ShortVideoItem[] = [
  {
    id: 'short_1',
    title: 'Cinematic Golden Hour lighting setup for urban street photography ✨📸',
    creator: {
      name: 'Alex Rivera',
      handle: 'u/alexrivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isFollowing: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-urban-street-fashion-shoot-41824-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    likesCount: 14200,
    commentsCount: 842,
    sharesCount: 1240,
    tags: ['#Photography', '#Urban', '#GoldenHour', '#Buvaki'],
    musicTitle: 'Original Audio - Ambient Lo-Fi Beats',
    subBuvaki: 'b/photography'
  },
  {
    id: 'short_2',
    title: 'Building a fluid glassmorphism UI in React & Tailwind in 30 seconds ⚡️💻',
    creator: {
      name: 'Elena Tech',
      handle: 'u/elenatech',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-42456-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    likesCount: 29400,
    commentsCount: 1890,
    sharesCount: 4520,
    tags: ['#Coding', '#WebDev', '#ReactJS', '#TailwindCSS'],
    musicTitle: 'CyberSynth Wave - High Velocity',
    subBuvaki: 'b/tech'
  },
  {
    id: 'short_3',
    title: 'Futuristic Cyberpunk Neon Palette Breakdown 🎨 How colors tell stories',
    creator: {
      name: 'Sarah Styles',
      handle: 'u/sarahstyles',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      isFollowing: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-42761-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    likesCount: 18700,
    commentsCount: 920,
    sharesCount: 2130,
    tags: ['#DesignTrends', '#ColorPalette', '#Cyberpunk', '#Art'],
    musicTitle: 'Neon Reverie - Retro Wave',
    subBuvaki: 'b/design'
  },
  {
    id: 'short_4',
    title: 'Speedrunning this hidden boss arena without taking any damage 🎮🔥',
    creator: {
      name: 'Liam Novak',
      handle: 'u/liamnovak',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      isFollowing: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-playing-a-video-game-with-a-controller-42861-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    likesCount: 35100,
    commentsCount: 2410,
    sharesCount: 6890,
    tags: ['#Gaming', '#Speedrun', '#NoDamage', '#ProGamer'],
    musicTitle: 'Electro Pulse Arena - Battle Mix',
    subBuvaki: 'b/gaming'
  },
  {
    id: 'short_5',
    title: 'Autonomous AI robots inspecting smart grid hardware in real-time 🤖⚡',
    creator: {
      name: 'Cyber Nova',
      handle: 'u/cybernova',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isFollowing: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-robot-looking-around-42768-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
    likesCount: 21800,
    commentsCount: 1140,
    sharesCount: 3410,
    tags: ['#Robotics', '#AI', '#FutureTech', '#Engineering'],
    musicTitle: 'Synthetic Pulse - Cyberpunk Lab',
    subBuvaki: 'b/tech'
  },
  {
    id: 'short_6',
    title: 'Behind the scenes: Vlog setup with mobile studio lights and mic 🎙️📱',
    creator: {
      name: 'Mia Content',
      handle: 'u/miacreates',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isFollowing: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-recording-herself-with-a-smartphone-camera-42858-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    likesCount: 42300,
    commentsCount: 3120,
    sharesCount: 8900,
    tags: ['#ContentCreator', '#BehindTheScenes', '#VlogLife'],
    musicTitle: 'Upbeat Chill Hop - Summer Groove',
    subBuvaki: 'b/creative'
  }
];

interface ShortsFeedProps {
  posts?: Post[];
  currentUser: User;
  selectedLanguage: SupportedLanguage;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onToggleSave?: (postId: string) => void;
  onSelectPost?: (post: Post) => void;
  onOpenCreatePost?: () => void;
}

export const ShortsFeed: React.FC<ShortsFeedProps> = ({
  posts = [],
  currentUser,
  onVote,
  onToggleSave
}) => {
  // Combine sample shorts with any created short video posts
  const allShorts: ShortVideoItem[] = React.useMemo(() => {
    const userShorts: ShortVideoItem[] = posts
      .filter((p) => (p.type === 'short' || p.type === 'video') && p.videoUrl)
      .map((p) => ({
        id: p.id,
        title: p.title,
        creator: {
          name: p.author.username,
          handle: p.author.handle,
          avatar: p.author.avatar,
          isFollowing: false,
        },
        videoUrl: p.videoUrl!,
        thumbnailUrl: p.imageUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
        likesCount: p.score || 0,
        commentsCount: p.commentCount || 0,
        sharesCount: Math.floor((p.score || 0) * 0.3),
        tags: p.tags || ['#BuvakiShort'],
        musicTitle: 'Original Audio',
        subBuvaki: p.subBuvakiName || 'b/general'
      }));

    return [...userShorts, ...SAMPLE_SHORTS];
  }, [posts]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down'>('up');
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [heartAnim, setHeartAnim] = useState<{ x: number; y: number; id: number } | null>(null);
  
  // Comments modal sheet
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Record<string, { id: string; user: string; avatar: string; text: string; time: string }[]>>({
    short_1: [
      { id: 'c1', user: 'u/marcus_lens', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', text: 'The natural diffusion at 6pm is unbeatable! What lens are you rocking?', time: '2h ago' },
      { id: 'c2', user: 'u/sophia_art', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', text: 'Crisp tones! Buvaki video quality is looking incredible 🔥', time: '1h ago' }
    ],
    short_2: [
      { id: 'c3', user: 'u/dev_dan', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', text: 'Tailwind 4 with backdrop-blur is so clean! Loving this 🚀', time: '30m ago' }
    ]
  });

  const currentShort = allShorts[currentIndex] || SAMPLE_SHORTS[0];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isWheelingRef = useRef(false);
  const lastTapRef = useRef<number>(0);

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

  // Real trackpad / mouse wheel swipe handler with debouncing
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

  // Keyboard navigation for real desktop swipes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCommentsOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'm') {
        setIsMuted((m) => !m);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isCommentsOpen]);

  const toggleLike = (id: string) => {
    const isCurrentlyLiked = !!likedMap[id];
    setLikedMap((prev) => ({ ...prev, [id]: !isCurrentlyLiked }));
    if (onVote) {
      onVote(id, isCurrentlyLiked ? 'down' : 'up');
    }
  };

  const toggleSave = (id: string) => {
    setSavedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    if (onToggleSave) {
      onToggleSave(id);
    }
  };

  const toggleFollow = (creatorHandle: string) => {
    setFollowingMap((prev) => ({ ...prev, [creatorHandle]: !prev[creatorHandle] }));
  };

  // Double tap to like gesture
  const handleVideoTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (now - lastTapRef.current < 300) {
      // Double tap detected: Like & spawn heart
      if (!likedMap[currentShort.id]) {
        toggleLike(currentShort.id);
      }
      setHeartAnim({ x, y, id: Date.now() });
      setTimeout(() => setHeartAnim(null), 800);
    } else {
      // Single tap: toggle play/pause
      setIsPlaying((prev) => !prev);
    }
    lastTapRef.current = now;
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newC = {
      id: `comm_${Date.now()}`,
      user: currentUser.handle,
      avatar: currentUser.avatar,
      text: commentText.trim(),
      time: 'Just now'
    };
    setLocalComments((prev) => ({
      ...prev,
      [currentShort.id]: [...(prev[currentShort.id] || []), newC]
    }));
    setCommentText('');
  };

  const isLiked = likedMap[currentShort.id] || false;
  const isSaved = savedMap[currentShort.id] || false;
  const isFollowing = followingMap[currentShort.creator.handle] ?? currentShort.creator.isFollowing;
  const commentsList = localComments[currentShort.id] || [];

  return (
    <div 
      id="buvaki-shorts-feed-container"
      onWheel={handleWheel}
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black flex items-center justify-center overflow-hidden z-30 select-none touch-none"
    >
      {/* Immersive Vertical Video Reel with Real Swipe Gestures */}
      <div className="relative w-full h-full max-w-md mx-auto flex items-center justify-center overflow-hidden pb-16">
        <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
          <motion.div
            key={currentShort.id}
            custom={slideDirection}
            initial={{ y: slideDirection === 'up' ? '100%' : '-100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: slideDirection === 'up' ? '-100%' : '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.28}
            onDragEnd={(_, info) => {
              if (info.offset.y < -50 || info.velocity.y < -250) {
                handleNext();
              } else if (info.offset.y > 50 || info.velocity.y > 250) {
                handlePrev();
              }
            }}
            className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing pb-16"
          >
            {/* Main Video Element */}
            <div 
              onClick={handleVideoTap}
              className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden"
            >
              <video
                ref={videoRef}
                src={currentShort.videoUrl}
                poster={currentShort.thumbnailUrl}
                autoPlay={isPlaying}
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Pause Indicator overlay on pause */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] pointer-events-none z-10">
                  <motion.div 
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-full bg-slate-950/70 text-white flex items-center justify-center shadow-2xl border border-white/20"
                  >
                    <Play className="w-8 h-8 fill-white ml-1 text-white" />
                  </motion.div>
                </div>
              )}

              {/* Double-tap animated floating heart */}
              {heartAnim && (
                <motion.div
                  initial={{ scale: 0, opacity: 1, y: 0 }}
                  animate={{ scale: [0, 1.4, 1.1], opacity: [1, 1, 0], y: -40 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  style={{ left: heartAnim.x - 36, top: heartAnim.y - 36 }}
                  className="absolute pointer-events-none z-30"
                >
                  <Heart className="w-20 h-20 text-pink-500 fill-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
                </motion.div>
              )}

              {/* Sound Toggle (clean, low-profile in corner) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/60 text-white backdrop-blur-md border border-white/10 hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                title={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-pink-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>

              {/* Right Action Rail (TikTok / YouTube Shorts style) */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="absolute bottom-6 right-3 flex flex-col items-center gap-4 z-20"
              >
                {/* Creator avatar with follow button */}
                <div className="relative flex flex-col items-center">
                  <img
                    src={currentShort.creator.avatar}
                    alt={currentShort.creator.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-400 shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                  {!isFollowing ? (
                    <button
                      onClick={() => toggleFollow(currentShort.creator.handle)}
                      className="absolute -bottom-1.5 w-5 h-5 rounded-full bg-pink-500 hover:bg-pink-400 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                      title="Follow creator"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  ) : (
                    <div className="absolute -bottom-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Like Button */}
                <button
                  onClick={() => toggleLike(currentShort.id)}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                >
                  <div className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                    isLiked 
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/50 scale-110' 
                      : 'bg-black/60 text-white hover:bg-black/80'
                  }`}>
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {(currentShort.likesCount + (isLiked ? 1 : 0)).toLocaleString()}
                  </span>
                </button>

                {/* Comments Button */}
                <button 
                  onClick={() => setIsCommentsOpen(true)}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                >
                  <div className="p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {(currentShort.commentsCount + commentsList.length).toLocaleString()}
                  </span>
                </button>

                {/* Bookmark / Save Button */}
                <button
                  onClick={() => toggleSave(currentShort.id)}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                >
                  <div className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                    isSaved 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/50 scale-110' 
                      : 'bg-black/60 text-white hover:bg-black/80'
                  }`}>
                    <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    Save
                  </span>
                </button>

                {/* Share Button */}
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: currentShort.title,
                        url: window.location.href
                      }).catch(() => {});
                    }
                  }}
                  className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                >
                  <div className="p-2.5 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    Share
                  </span>
                </button>
              </div>

              {/* Bottom Details Overlay (seamless dark gradient) */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pb-6 z-10 flex flex-col gap-1.5 pointer-events-none"
              >
                {/* Sub-Buvaki & Creator tag */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span className="px-2 py-0.5 rounded-lg bg-violet-600/90 backdrop-blur-md text-[11px] font-bold text-white shadow">
                    {currentShort.subBuvaki}
                  </span>
                  <span className="text-xs font-bold text-white drop-shadow">
                    {currentShort.creator.name}
                  </span>
                  <span className="text-[11px] text-slate-300 drop-shadow">
                    {currentShort.creator.handle}
                  </span>
                </div>

                {/* Short Title & Tags */}
                <p className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2 pr-14 drop-shadow pointer-events-auto">
                  {currentShort.title}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-0.5 pointer-events-auto">
                  {currentShort.tags.map((tag, idx) => (
                    <span key={idx} className="text-[11px] text-pink-300 font-medium drop-shadow">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Sound track ticker */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-200 font-mono mt-0.5 pointer-events-auto">
                  <Music className="w-3.5 h-3.5 text-pink-400 animate-spin" />
                  <span className="truncate max-w-[220px] drop-shadow">{currentShort.musicTitle}</span>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Comments Slide-up Drawer */}
        <AnimatePresence>
          {isCommentsOpen && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute inset-x-0 bottom-0 h-3/5 bg-slate-950/98 backdrop-blur-xl border-t border-violet-900/50 rounded-t-3xl p-4 flex flex-col z-40 shadow-2xl pb-20"
            >
              <div className="flex items-center justify-between border-b border-violet-900/40 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-bold text-white">
                    Comments ({commentsList.length + currentShort.commentsCount})
                  </span>
                </div>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Feed */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                {commentsList.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Be the first to comment on this short!
                  </div>
                ) : (
                  commentsList.map((c) => (
                    <div key={c.id} className="flex items-start gap-2.5">
                      <img
                        src={c.avatar}
                        alt={c.user}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-violet-500/50 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-200">{c.user}</span>
                          <span className="text-[10px] text-slate-500">{c.time}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-2 pt-2 border-t border-violet-900/30">
                <input
                  type="text"
                  value={commentText || ''}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-slate-900 border border-violet-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
