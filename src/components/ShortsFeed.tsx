import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, SupportedLanguage, Post, SubBuvaki } from '../types';
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
  Send,
  ChevronDown,
  Layers
} from 'lucide-react';
import { CommunityIcon } from './CommunityIcon';

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
  subBuvakiId: string;
}

const SAMPLE_SHORTS: ShortVideoItem[] = [
  {
    id: 'short_music_1',
    title: 'Analog synth jam: crafting atmospheric ambient soundscapes & tape loops 🎹✨',
    creator: {
      name: 'Sarah Styles',
      handle: 'u/sarahstyles',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      isFollowing: true,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-sound-control-console-41484-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    likesCount: 18400,
    commentsCount: 920,
    sharesCount: 1640,
    tags: ['#Music', '#Synthesizer', '#LoFi', '#AnalogSound'],
    musicTitle: 'Sarah Styles - Tape Warmth Session #4',
    subBuvaki: 'b/music',
    subBuvakiId: 'music'
  },
  {
    id: 'short_music_2',
    title: 'Acoustic fingerstyle guitar layering with custom open tuning 🎸🎶',
    creator: {
      name: 'Alex Rivera',
      handle: 'u/alexrivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isFollowing: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-playing-the-guitar-42751-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
    likesCount: 22600,
    commentsCount: 1410,
    sharesCount: 3100,
    tags: ['#Acoustic', '#Fingerstyle', '#Guitar', '#MusicSession'],
    musicTitle: 'Original Audio - Rainy Morning Melody',
    subBuvaki: 'b/music',
    subBuvakiId: 'music'
  },
  {
    id: 'short_photography_1',
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
    subBuvaki: 'b/photography',
    subBuvakiId: 'photography'
  },
  {
    id: 'short_tech_1',
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
    subBuvaki: 'b/tech',
    subBuvakiId: 'tech'
  },
  {
    id: 'short_design_1',
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
    subBuvaki: 'b/design',
    subBuvakiId: 'design'
  },
  {
    id: 'short_gaming_1',
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
    subBuvaki: 'b/gaming',
    subBuvakiId: 'gaming'
  },
  {
    id: 'short_general_1',
    title: 'Welcome to Buvaki Lounge: creative collaboration, ideas & daily coffee vibes ☕️✨',
    creator: {
      name: 'Maya Lin',
      handle: 'u/mayalin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isFollowing: false,
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-recording-herself-with-a-smartphone-camera-42858-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    likesCount: 42300,
    commentsCount: 3120,
    sharesCount: 8900,
    tags: ['#Buvaki', '#CreatorHub', '#GeneralLounge'],
    musicTitle: 'Upbeat Chill Hop - Summer Groove',
    subBuvaki: 'b/general',
    subBuvakiId: 'general'
  }
];

interface ShortsFeedProps {
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

export const ShortsFeed: React.FC<ShortsFeedProps> = ({
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
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState(false);

  // Combine sample shorts with any created short video posts
  const allShorts: ShortVideoItem[] = useMemo(() => {
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
        subBuvaki: p.subBuvakiName || 'b/general',
        subBuvakiId: p.subBuvakiId || 'general'
      }));

    return [...userShorts, ...SAMPLE_SHORTS];
  }, [posts]);

  // Filter shorts strictly by active sub-buvaki
  const displayedShorts = useMemo(() => {
    if (!activeSubBuvakiId || activeSubBuvakiId === 'general') {
      return allShorts;
    }
    return allShorts.filter((s) => 
      s.subBuvakiId === activeSubBuvakiId || 
      s.subBuvaki === `b/${activeSubBuvakiId}` ||
      s.subBuvaki.toLowerCase() === activeSubBuvakiId.toLowerCase()
    );
  }, [allShorts, activeSubBuvakiId]);

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
    short_music_1: [
      { id: 'c1', user: 'u/marcus_lens', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', text: 'That Moog filter warmth is sublime! What reverb pedal are you running?', time: '2h ago' },
    ],
    short_photography_1: [
      { id: 'c2', user: 'u/sophia_art', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', text: 'Crisp tones! Buvaki video quality is looking incredible 🔥', time: '1h ago' }
    ]
  });

  // Reset index when sub-buvaki filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [activeSubBuvakiId]);

  const currentShort = displayedShorts[currentIndex] || displayedShorts[0];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isWheelingRef = useRef(false);
  const lastTapRef = useRef<number>(0);

  const handleNext = useCallback(() => {
    if (currentIndex < displayedShorts.length - 1) {
      setSlideDirection('up');
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  }, [currentIndex, displayedShorts.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSlideDirection('down');
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  }, [currentIndex]);

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
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to like and support creators on Buvaki');
      return;
    }
    const isCurrentlyLiked = !!likedMap[id];
    setLikedMap((prev) => ({ ...prev, [id]: !isCurrentlyLiked }));
    if (onVote) {
      onVote(id, isCurrentlyLiked ? 'down' : 'up');
    }
  };

  const toggleSave = (id: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to bookmark shorts to your profile');
      return;
    }
    setSavedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    if (onToggleSave) {
      onToggleSave(id);
    }
  };

  const toggleFollow = (creatorHandle: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to follow creators on Buvaki');
      return;
    }
    setFollowingMap((prev) => ({ ...prev, [creatorHandle]: !prev[creatorHandle] }));
  };

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
    }
    lastTapRef.current = now;
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentShort) return;
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in to comment on shorts');
      return;
    }
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

  const activeSubObj = subBuvakis.find((s) => s.id === activeSubBuvakiId);
  const isLiked = currentShort ? likedMap[currentShort.id] || false : false;
  const isSaved = currentShort ? savedMap[currentShort.id] || false : false;
  const isFollowing = currentShort ? followingMap[currentShort.creator.handle] ?? currentShort.creator.isFollowing : false;
  const commentsList = currentShort ? localComments[currentShort.id] || [] : [];

  return (
    <div 
      id="buvaki-shorts-feed-container"
      onWheel={handleWheel}
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black flex items-center justify-center overflow-hidden z-30 select-none touch-none"
    >
      {/* Sub-Buvaki Switcher Floating Pill Header */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsSubDropdownOpen(!isSubDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-violet-700/60 backdrop-blur-md text-white text-xs font-bold shadow-xl transition-all active:scale-95"
          >
            {activeSubObj ? (
              <>
                <CommunityIcon sub={activeSubObj} size="xs" />
                <span>{activeSubObj.displayName}</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-violet-400" />
                <span>b/general (All Sub-Buvakis)</span>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Sub-Buvaki Quick Select Dropdown */}
          {isSubDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-slate-950/95 border border-violet-800/60 shadow-2xl backdrop-blur-xl p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                Select Community
              </div>

              {/* General / All */}
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
                <span>b/general (All Shorts)</span>
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

      {/* If No Shorts Available in this Sub-Buvaki */}
      {displayedShorts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 p-6 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-violet-800/50 flex items-center justify-center">
            <Music className="w-8 h-8 text-pink-400" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-bold text-white">
              No shorts in {activeSubObj?.displayName || 'this community'} yet
            </h3>
            <p className="text-xs text-slate-400">
              Be the first to post a short in {activeSubObj?.displayName || 'b/general'} or explore other communities.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
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
                Create Short
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Immersive Vertical Video Reel */
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

                {/* Sound Toggle */}
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

                {/* Right Action Rail */}
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
                    <div className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${
                      isLiked 
                        ? 'bg-pink-600 text-white shadow-pink-600/40' 
                        : 'bg-slate-950/60 text-white hover:bg-slate-900/80 border border-white/10'
                    }`}>
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-white text-white' : ''}`} />
                    </div>
                    <span className="text-[11px] font-bold text-white drop-shadow font-mono">
                      {(currentShort.likesCount + (isLiked ? 1 : 0)).toLocaleString()}
                    </span>
                  </button>

                  {/* Comments Button */}
                  <button
                    onClick={() => setIsCommentsOpen(true)}
                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                  >
                    <div className="p-3 rounded-full bg-slate-950/60 text-white hover:bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-lg">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-white drop-shadow font-mono">
                      {(currentShort.commentsCount + commentsList.length).toLocaleString()}
                    </span>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleSave(currentShort.id)}
                    className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                  >
                    <div className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg ${
                      isSaved
                        ? 'bg-emerald-600 text-white shadow-emerald-600/40'
                        : 'bg-slate-950/60 text-white hover:bg-slate-900/80 border border-white/10'
                    }`}>
                      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white text-white' : ''}`} />
                    </div>
                    <span className="text-[11px] font-bold text-white drop-shadow">
                      {isSaved ? 'Saved' : 'Save'}
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
                    <div className="p-3 rounded-full bg-slate-950/60 text-white hover:bg-slate-900/80 border border-white/10 backdrop-blur-md shadow-lg">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-white drop-shadow">
                      Share
                    </span>
                  </button>
                </div>

                {/* Bottom Left Info & Caption Overlay */}
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className="absolute bottom-6 left-3 right-16 z-20 flex flex-col gap-2 pointer-events-auto"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white drop-shadow-md">
                      {currentShort.creator.name}
                    </span>
                    <span className="text-[11px] text-pink-300 font-semibold drop-shadow-md">
                      {currentShort.creator.handle}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-700/60 text-[10px] font-bold text-violet-200">
                      {currentShort.subBuvaki}
                    </span>
                  </div>

                  <p className="text-xs text-white/95 line-clamp-2 leading-relaxed drop-shadow-md font-medium">
                    {currentShort.title}
                  </p>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentShort.tags.map((tag) => (
                      <span key={tag} className="text-[11px] text-pink-400 font-semibold drop-shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Audio Reel Title */}
                  <div className="flex items-center gap-2 text-white/80 text-[11px] font-medium drop-shadow-md">
                    <Music className="w-3.5 h-3.5 text-pink-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="truncate max-w-[200px]">{currentShort.musicTitle}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Slide-Up Comments Drawer */}
      <AnimatePresence>
        {isCommentsOpen && currentShort && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="w-full max-w-md bg-slate-950 border-t border-violet-900/50 rounded-t-3xl p-4 flex flex-col max-h-[65vh] shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-violet-900/30">
                <span className="text-xs font-bold text-violet-300">
                  Comments ({commentsList.length})
                </span>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments list */}
              <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3">
                {commentsList.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <img src={c.avatar} alt={c.user} className="w-7 h-7 rounded-full object-cover mt-0.5" referrerPolicy="no-referrer" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-200">{c.user}</span>
                        <span className="text-[10px] text-slate-500">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 leading-snug">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-violet-900/30">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-violet-900/40 focus:outline-none focus:border-pink-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="p-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
