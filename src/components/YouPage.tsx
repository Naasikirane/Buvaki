import React, { useState, useRef } from 'react';
import { 
  User as UserIcon, 
  ChevronRight, 
  ChevronLeft, 
  MoreVertical, 
  Plus, 
  Search, 
  Camera, 
  ListVideo, 
  Clock, 
  ThumbsUp, 
  Share2, 
  Bookmark, 
  Scissors, 
  History, 
  Settings, 
  Play, 
  CheckCircle2,
  ArrowLeft,
  Tv,
  Clapperboard,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  Edit,
  Upload,
  RotateCcw,
  X,
  Calendar,
  Tag,
  ShieldCheck,
  Award,
  LogOut,
  Info,
  MessageSquare,
  Smile,
  AtSign
} from 'lucide-react';
import { Post, User } from '../types';
import { dbSaveUserProfile } from '../lib/firebase';
import { PRESET_INTERESTS, getGenericAvatarByGender } from './OnboardingFlow';

// Asset paths
import buvakiAvatar from '../assets/images/buvaki_avatar_1789246881670.jpg';
import buvakiBanner from '../assets/images/buvaki_banner_1789246868173.jpg';
import empressNovelThumb from '../assets/images/empress_novel_1789246900234.jpg';
import loveDragonThumb from '../assets/images/love_dragon_1789246914440.jpg';

interface YouPageProps {
  currentUser: User | null;
  onSelectPost?: (post: Post) => void;
  onRequireAuth?: (promptReason?: string) => void;
  onNavigateToFeed?: () => void;
  onUpdateUser?: (user: User) => void;
  userPosts?: Post[];
  savedPosts?: Post[];
  onOpenCreatePost?: () => void;
  onLogout?: () => void;
}

interface HistoryItem {
  id: string;
  title: string;
  channel: string;
  verified?: boolean;
  views: string;
  timeAgo: string;
  duration: string;
  isAudio?: boolean;
  thumbnail: string;
  thumbnailType?: 'image' | 'svg_pink' | 'svg_moon' | 'svg_sunset';
}

interface ChannelVideo {
  id: string;
  title: string;
  views: string;
  timeAgo: string;
  duration: string;
  thumbnail: string;
  thumbnailType?: 'dragon' | 'pagoda' | 'fantasy' | 'chapter';
}

export const YouPage: React.FC<YouPageProps> = ({
  currentUser,
  onSelectPost,
  onRequireAuth,
  onNavigateToFeed,
  onUpdateUser,
  userPosts = [],
  savedPosts = [],
  onOpenCreatePost,
  onLogout,
}) => {
  // 'overview' corresponds to You_expectations.png
  // 'channel' corresponds to You_expectations2.png
  const [subView, setSubView] = useState<'overview' | 'channel'>('overview');
  const [channelTab, setChannelTab] = useState<'videos' | 'shorts' | 'playlists' | 'posts' | 'about'>('videos');
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [channelSearchOpen, setChannelSearchOpen] = useState(false);
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync profile details from currentUser
  const displayName = currentUser?.username || 'Buvaki story';
  const displayHandle = currentUser?.handle
    ? (currentUser.handle.startsWith('@') ? currentUser.handle : `@${currentUser.handle}`)
    : '@buvaki';
  const displayAvatar = currentUser?.avatar || buvakiAvatar;
  const displayBio = currentUser?.bio || 'Welcome to Buvaki Story! Here, we bring you just fragments of most things. The main are anime, fantasy tales, manga adaptations, and original universe lore.';
  const displayInterests = currentUser?.interests || [];
  const displayGender = currentUser?.gender;
  const displayDob = currentUser?.dob;
  const displayKarma = currentUser?.karma ?? 100;
  const displayJoined = currentUser?.joinedDate || 'Recently';
  const displayBadges = currentUser?.badges && currentUser.badges.length > 0
    ? currentUser.badges 
    : ['Verified Member'];

  // Edit profile customization state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'prefer_not_to_say'>('prefer_not_to_say');
  const [editDob, setEditDob] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => cur === msg ? null : cur);
    }, 2500);
  };

  const openEditModal = () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Sign in or create an account to customize your profile');
      return;
    }
    setEditUsername(currentUser.username || '');
    setEditHandle(currentUser.handle ? currentUser.handle.replace(/^@/, '') : '');
    setEditAvatar(currentUser.avatar || '');
    setEditBio(currentUser.bio || '');
    setEditGender((currentUser.gender as any) || 'prefer_not_to_say');
    setEditDob(currentUser.dob || '');
    setEditInterests(currentUser.interests || []);
    setIsEditModalOpen(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setEditAvatar(dataUrl);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!editUsername.trim()) {
      showToast('Username cannot be empty');
      return;
    }
    setIsSavingProfile(true);
    try {
      const sanitizedHandle = `@${editHandle.trim().replace(/^@/, '') || 'member'}`;
      const effectiveAvatar = editAvatar || currentUser.avatar || getGenericAvatarByGender(editGender);
      const updatedUser: User = {
        ...currentUser,
        username: editUsername.trim(),
        handle: sanitizedHandle,
        avatar: effectiveAvatar,
        bio: editBio.trim(),
        gender: editGender,
        dob: editDob || undefined,
        interests: editInterests,
        isProfileCompleted: true,
        isFirstTimeUser: false,
      };

      await dbSaveUserProfile(updatedUser);
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }
      setIsEditModalOpen(false);
      showToast('Profile updated successfully!');
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      showToast('Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const toggleInterest = (tag: string) => {
    setEditInterests((prev) =>
      prev.includes(tag) ? prev.filter((i) => i !== tag) : [...prev, tag]
    );
  };

  const historyScrollRef = useRef<HTMLDivElement>(null);
  const playlistScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = direction === 'left' ? -340 : 340;
    ref.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // History Items matching Screenshot 1 (You_expectations.png)
  const historyVideos: HistoryItem[] = [
    {
      id: 'hist_1',
      title: 'I Wrote a Secret Novel About the Empress... Then She Found Me ...',
      channel: 'Dynasty Tales',
      verified: false,
      views: '76K views',
      timeAgo: '5 days ago',
      duration: '3:38:09',
      thumbnail: empressNovelThumb,
      thumbnailType: 'image',
    },
    {
      id: 'hist_2',
      title: 'Connie Francis - Pretty Little Baby (Lyrics)',
      channel: 'Lost Panda',
      verified: true,
      views: '7.7M views',
      timeAgo: '1 year ago',
      duration: '2:26',
      isAudio: true,
      thumbnail: '',
      thumbnailType: 'svg_pink',
    },
    {
      id: 'hist_3',
      title: '(Lyrics) Ghost - Mary On A Cross',
      channel: 'LittleBaelish',
      verified: false,
      views: '115K views',
      timeAgo: '6 days ago',
      duration: '4:13',
      isAudio: true,
      thumbnail: '',
      thumbnailType: 'svg_moon',
    },
    {
      id: 'hist_4',
      title: 'Connie Francis - Pretty Little Baby (Lyrics)',
      channel: 'Vibely',
      verified: false,
      views: '696K views',
      timeAgo: '1 year ago',
      duration: '29:06',
      isAudio: true,
      thumbnail: '',
      thumbnailType: 'svg_sunset',
    },
    {
      id: 'hist_5',
      title: 'Top 10 Ancient Mysteries Science Still Cannot Explain',
      channel: 'Curiosity Stream',
      verified: true,
      views: '1.2M views',
      timeAgo: '2 weeks ago',
      duration: '18:45',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      thumbnailType: 'image',
    },
  ];

  // Playlists matching YouTube You page
  const playlists = [
    {
      id: 'pl_liked',
      title: 'Liked videos',
      videoCount: 124,
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      visibility: 'Private',
      updatedTime: 'Updated today',
    },
    {
      id: 'pl_later',
      title: 'Watch later',
      videoCount: 18,
      thumbnail: empressNovelThumb,
      visibility: 'Private',
      updatedTime: 'Updated 2 days ago',
    },
    {
      id: 'pl_lofi',
      title: 'Lo-Fi Chill & Beats',
      videoCount: 45,
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      visibility: 'Public',
      updatedTime: 'Updated last week',
    },
    {
      id: 'pl_anime',
      title: 'Anime OSTs & Edits',
      videoCount: 32,
      thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      visibility: 'Public',
      updatedTime: 'Updated 3 weeks ago',
    },
  ];

  // Channel Videos matching Screenshot 2 (You_expectations2.png)
  const channelVideos: ChannelVideo[] = [
    {
      id: 'chan_1',
      title: `The older I get ${displayHandle}`,
      views: '1.4K views',
      timeAgo: '3 weeks ago',
      duration: '3:20',
      thumbnail: '',
      thumbnailType: 'pagoda',
    },
    {
      id: 'chan_2',
      title: 'Love Dragon [Part 1: The Encounter]',
      views: '4.8K views',
      timeAgo: '1 month ago',
      duration: '12:45',
      thumbnail: loveDragonThumb,
      thumbnailType: 'dragon',
    },
    {
      id: 'chan_3',
      title: 'Fragments of Fantasy — World Exploration & Character Sketches',
      views: '890 views',
      timeAgo: '2 months ago',
      duration: '8:12',
      thumbnail: '',
      thumbnailType: 'fantasy',
    },
    {
      id: 'chan_4',
      title: 'The Empress Secret Manuscript [Chapter 1]',
      views: '15K views',
      timeAgo: '3 months ago',
      duration: '45:10',
      thumbnail: empressNovelThumb,
      thumbnailType: 'chapter',
    },
  ];

  // Handle opening video or media
  const handleOpenVideo = (title: string, author: string, thumbUrl: string) => {
    if (onSelectPost) {
      const mockPost: Post = {
        id: 'post_' + Math.random().toString(36).substr(2, 9),
        title,
        content: `Now playing: ${title} by ${author}`,
        author: {
          id: currentUser?.id || 'u_' + author.toLowerCase().replace(/\s+/g, '_'),
          username: currentUser?.username || author,
          handle: currentUser?.handle || '@' + author.toLowerCase().replace(/\s+/g, '_'),
          avatar: currentUser?.avatar || thumbUrl || buvakiAvatar,
          bio: currentUser?.bio || 'Creator on Buvaki',
          karma: currentUser?.karma || 100,
          badges: currentUser?.badges || ['Creator'],
          joinedDate: currentUser?.joinedDate || '2026',
          status: 'online',
        },
        subBuvakiId: 'music',
        subBuvakiName: 'b/music',
        type: 'video',
        videoUrl: 'https://commondatastream.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: '3:45',
        viewsCount: 15400,
        score: 142,
        commentCount: 28,
        timestamp: 'Just now',
        userVote: null,
        tags: ['video', 'media'],
      };
      onSelectPost(mockPost);
    }
  };

  // Render Special History Card Thumbnails
  const renderThumbnail = (item: HistoryItem) => {
    if (item.thumbnailType === 'svg_pink') {
      return (
        <div className="w-full h-full bg-[#f62681] flex flex-col items-center justify-center p-3 relative overflow-hidden select-none">
          <span className="text-white font-extrabold text-lg sm:text-xl md:text-2xl text-center leading-tight tracking-wide drop-shadow-sm font-sans">
            PRETTY<br />LITTLE BABY
          </span>
        </div>
      );
    }

    if (item.thumbnailType === 'svg_moon') {
      return (
        <div className="w-full h-full bg-[#1b1c2e] flex flex-col items-center justify-center p-3 relative overflow-hidden select-none">
          {/* Moon graphic */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-100 to-white shadow-[0_0_12px_rgba(255,255,255,0.7)] mb-1 relative">
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#1b1c2e]" />
          </div>
          <span className="text-white font-bold text-base sm:text-lg text-center leading-tight tracking-wide drop-shadow font-serif">
            Mary On A Cross
          </span>
          <span className="text-white/80 text-xs font-medium">Ghost</span>
        </div>
      );
    }

    if (item.thumbnailType === 'svg_sunset') {
      return (
        <div className="w-full h-full bg-gradient-to-tr from-[#9d4edd] via-[#f77f00] to-[#fcbf49] flex flex-col items-center justify-center p-3 relative overflow-hidden select-none">
          <span className="text-white font-black text-base sm:text-xl text-center leading-snug tracking-wide drop-shadow-md">
            Pretty Little Baby
          </span>
          <span className="text-white/90 text-xs font-semibold mt-1">Connie Francis</span>
        </div>
      );
    }

    return (
      <img
        src={item.thumbnail}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
        referrerPolicy="no-referrer"
      />
    );
  };

  // Render Channel Video Thumbnails
  const renderChannelThumbnail = (item: ChannelVideo) => {
    if (item.thumbnailType === 'pagoda') {
      return (
        <div className="w-full h-full bg-gradient-to-b from-[#ff8c42] via-[#d65a31] to-[#393e46] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Silhouette Pagoda / Sun */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,230,150,0.6)_0%,transparent_60%)]" />
          <div className="z-10 text-center drop-shadow-md">
            <span className="text-sky-300 font-extrabold text-lg sm:text-xl block tracking-wide">
              The older I get
            </span>
            <span className="text-sky-200 text-sm font-semibold block mt-0.5">
              {displayHandle}
            </span>
          </div>
        </div>
      );
    }

    if (item.thumbnailType === 'dragon') {
      return (
        <div className="w-full h-full relative overflow-hidden">
          <img
            src={loveDragonThumb}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-3">
            <span className="text-rose-500 font-black text-lg sm:text-xl tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Love Dragon
            </span>
            <span className="text-rose-300 text-sm font-bold drop-shadow">
              {displayHandle}
            </span>
          </div>
        </div>
      );
    }

    if (item.thumbnailType === 'fantasy') {
      return (
        <div className="w-full h-full bg-gradient-to-tr from-[#14213d] via-[#4a4e69] to-[#9a8c98] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <Sparkles className="w-7 h-7 text-amber-300 mb-1 animate-pulse" />
          <span className="text-white font-extrabold text-base sm:text-lg text-center drop-shadow">
            Fragments of Fantasy
          </span>
          <span className="text-slate-300 text-xs mt-0.5">{displayHandle}</span>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <span className="text-white font-bold text-base text-center">
          {item.title}
        </span>
      </div>
    );
  };

  // If visitor is unauthenticated, show YouTube-style guest welcome screen
  if (!currentUser) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center select-none bg-white">
        <div className="w-24 h-24 rounded-full bg-[#f2f2f2] flex items-center justify-center mb-6 text-[#606060]">
          <UserIcon className="w-12 h-12 stroke-[1.5]" />
        </div>
        <h2 className="text-2xl font-bold text-[#0f0f0f] mb-2">
          Enjoy your favorite videos
        </h2>
        <p className="text-sm text-[#606060] max-w-md mb-6 leading-relaxed">
          Sign in to access videos you’ve liked or saved, view your channel, watch history, subscriptions, and playlists.
        </p>
        <button
          onClick={() => {
            if (onRequireAuth) {
              onRequireAuth('Sign in or create an account to view your channel, library, and watch history');
            }
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#065fd4] hover:bg-[#065fd4]/90 text-white font-medium text-sm transition-all shadow-sm cursor-pointer active:scale-95"
        >
          <UserIcon className="w-4 h-4 stroke-[2]" />
          <span>Sign in</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-[#0f0f0f] pb-24 select-none">
      
      {/* =========================================================================
          VIEW 1: YOU OVERVIEW (Matches You_expectations.png with Synced Profile Details)
         ========================================================================= */}
      {subView === 'overview' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          
          {/* Top Profile Header: Pressing anywhere here opens You_expectations2.png */}
          <div 
            onClick={() => setSubView('channel')}
            className="group cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 p-3 sm:p-4 -mx-3 sm:-mx-4 rounded-2xl transition-all duration-150 hover:bg-[#00000008]"
            title={`View channel for ${displayName}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSubView('channel');
              }
            }}
          >
            {/* Big Circular Avatar with synced photo and hover edit shortcut */}
            <div className="relative shrink-0 group/avatar">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover ring-2 ring-black/10 shadow-sm group-hover:ring-black/25 transition-all"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal();
                }}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-white border border-neutral-200 shadow-md text-neutral-700 hover:text-black hover:bg-neutral-50 transition-all cursor-pointer opacity-90 group-hover/avatar:opacity-100"
                title="Change profile picture"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Name, Handle, Badges, Interests & Action Buttons */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#0f0f0f] leading-tight">
                  {displayName}
                </h1>
                {displayBadges.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{displayBadges[0]}</span>
                  </span>
                )}
              </div>

              {/* Sub-line: @handle • View channel • stats */}
              <div className="flex items-center flex-wrap gap-2 mt-1 text-sm text-[#606060]">
                <span className="font-semibold text-neutral-800">{displayHandle}</span>
                <span>•</span>
                <span className="font-medium text-[#0f0f0f] group-hover:underline flex items-center gap-0.5">
                  View channel
                  <ChevronRight className="w-4 h-4 text-[#606060]" />
                </span>
                <span>•</span>
                <span>{displayKarma} karma</span>
                <span>•</span>
                <span>Joined {displayJoined}</span>
              </div>

              {/* Bio Snippet preview */}
              {displayBio && (
                <p className="text-xs sm:text-sm text-[#606060] mt-1.5 line-clamp-1 max-w-2xl leading-relaxed">
                  {displayBio}
                </p>
              )}

              {/* Synced Topics of Interest from Created Profile */}
              {displayInterests.length > 0 && (
                <div className="flex items-center flex-wrap gap-1.5 mt-2.5">
                  {displayInterests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium"
                    >
                      #{interest}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons: Customize channel, Switch account & Google Account */}
              <div 
                className="flex items-center flex-wrap gap-2.5 mt-3.5"
                onClick={(e) => {
                  // Prevent outer click if clicking buttons directly
                  e.stopPropagation();
                }}
              >
                {/* Customize Channel / Edit Profile */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#0000001a] bg-white hover:bg-[#f2f2f2] text-xs font-semibold text-[#0f0f0f] transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#0f0f0f]" />
                  <span>Customize channel</span>
                </button>

                {/* Switch Account */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRequireAuth) onRequireAuth('Switch or manage accounts on Buvaki');
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0000001a] bg-white hover:bg-[#f2f2f2] text-xs font-semibold text-[#0f0f0f] transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#0f0f0f] stroke-[2]" />
                  <span>Switch account</span>
                </button>

                {/* Google Account */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentUser.authProvider === 'google') {
                      showToast('Signed in with Google Account');
                    } else if (onRequireAuth) {
                      onRequireAuth('Connect with your Google Account');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0000001a] bg-white hover:bg-[#f2f2f2] text-xs font-semibold text-[#0f0f0f] transition-colors cursor-pointer"
                >
                  {/* Google 'G' Icon */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{currentUser.authProvider === 'google' ? 'Google Account Connected' : 'Google Account'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#0000001a] my-6" />

          {/* =========================================================================
              SECTION: HISTORY (Exact match to You_expectations.png)
             ========================================================================= */}
          <div className="mt-4">
            
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0f0f0f]">History</h2>

              <div className="flex items-center gap-2">
                {/* View all button */}
                <button 
                  onClick={() => showToast('Viewing full watch history')}
                  className="px-3.5 py-1.5 rounded-full border border-[#0000001a] text-xs font-semibold text-[#0f0f0f] hover:bg-[#f2f2f2] transition-colors cursor-pointer"
                >
                  View all
                </button>

                {/* Left/Right scroll arrows */}
                <button
                  onClick={() => scrollContainer(historyScrollRef, 'left')}
                  className="w-9 h-9 rounded-full border border-[#0000001a] flex items-center justify-center hover:bg-[#f2f2f2] text-[#0f0f0f] transition-colors cursor-pointer"
                  aria-label="Scroll history left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollContainer(historyScrollRef, 'right')}
                  className="w-9 h-9 rounded-full border border-[#0000001a] flex items-center justify-center hover:bg-[#f2f2f2] text-[#0f0f0f] transition-colors cursor-pointer"
                  aria-label="Scroll history right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Video History Scroll */}
            <div 
              ref={historyScrollRef}
              className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 scroll-smooth"
            >
              {historyVideos.map((video) => (
                <div 
                  key={video.id}
                  onClick={() => handleOpenVideo(video.title, video.channel, video.thumbnail)}
                  className="group flex-shrink-0 w-[230px] sm:w-[250px] cursor-pointer"
                >
                  {/* Thumbnail container */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/5 ring-1 ring-black/5">
                    {renderThumbnail(video)}

                    {/* Duration badge */}
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[11px] font-medium tracking-tight">
                      {video.duration}
                    </div>

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Video Meta Info */}
                  <div className="flex items-start justify-between gap-2 mt-2.5 px-0.5">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#0f0f0f] leading-snug line-clamp-2 group-hover:text-black">
                        {video.title}
                      </h3>
                      
                      {/* Channel Name with optional badge */}
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#606060]">
                        <span className="truncate">{video.channel}</span>
                        {video.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#606060] shrink-0" />
                        )}
                      </div>

                      {/* Views and Time */}
                      <div className="text-xs text-[#606060] mt-0.5">
                        <span>{video.views}</span>
                        <span className="mx-1">•</span>
                        <span>{video.timeAgo}</span>
                      </div>
                    </div>

                    {/* 3-dots Menu */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1.5 rounded-full hover:bg-black/10 text-[#0f0f0f] opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Action menu"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Divider */}
          <div className="h-px bg-[#0000001a] my-6" />

          {/* =========================================================================
              SECTION: PLAYLISTS (Matches You_expectations.png)
             ========================================================================= */}
          <div className="mt-4">
            
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0f0f0f]">Playlists</h2>

              <div className="flex items-center gap-2">
                {/* Create playlist button */}
                <button
                  onClick={() => showToast('Create new playlist')}
                  className="p-2 rounded-full hover:bg-[#f2f2f2] text-[#0f0f0f] transition-colors cursor-pointer"
                  title="Create playlist"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* View all button */}
                <button 
                  onClick={() => showToast('Viewing all playlists')}
                  className="px-3.5 py-1.5 rounded-full border border-[#0000001a] text-xs font-semibold text-[#0f0f0f] hover:bg-[#f2f2f2] transition-colors cursor-pointer"
                >
                  View all
                </button>

                {/* Left/Right scroll arrows */}
                <button
                  onClick={() => scrollContainer(playlistScrollRef, 'left')}
                  className="w-9 h-9 rounded-full border border-[#0000001a] flex items-center justify-center hover:bg-[#f2f2f2] text-[#0f0f0f] transition-colors cursor-pointer"
                  aria-label="Scroll playlists left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollContainer(playlistScrollRef, 'right')}
                  className="w-9 h-9 rounded-full border border-[#0000001a] flex items-center justify-center hover:bg-[#f2f2f2] text-[#0f0f0f] transition-colors cursor-pointer"
                  aria-label="Scroll playlists right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Playlists Scroll */}
            <div 
              ref={playlistScrollRef}
              className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 scroll-smooth"
            >
              {playlists.map((pl) => (
                <div 
                  key={pl.id}
                  onClick={() => handleOpenVideo(pl.title, displayName, pl.thumbnail)}
                  className="group flex-shrink-0 w-[240px] sm:w-[260px] cursor-pointer"
                >
                  {/* Playlist Thumbnail with Overlay */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/5 ring-1 ring-black/5">
                    <img
                      src={pl.thumbnail}
                      alt={pl.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      referrerPolicy="no-referrer"
                    />

                    {/* Right side playlist dark badge bar */}
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-1 text-white">
                      <ListVideo className="w-5 h-5" />
                      <span className="text-xs font-semibold">{pl.videoCount}</span>
                    </div>

                    {/* Hover Play All */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                      <Play className="w-4 h-4 fill-white" />
                      <span>PLAY ALL</span>
                    </div>
                  </div>

                  {/* Playlist Title & Meta */}
                  <div className="mt-3 px-0.5">
                    <h3 className="text-sm font-semibold text-[#0f0f0f] leading-snug line-clamp-1 group-hover:text-black">
                      {pl.title}
                    </h3>
                    <div className="text-xs text-[#606060] mt-1 flex items-center gap-1.5">
                      <span>{pl.visibility}</span>
                      <span>•</span>
                      <span>Playlist</span>
                    </div>
                    <button className="text-xs text-[#065fd4] font-medium hover:underline mt-1 block">
                      View full playlist
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: BUVAKI STORY CHANNEL (Matches You_expectations2.png with Synced Profile Details)
         ========================================================================= */}
      {subView === 'channel' && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-3 sm:py-6">
          
          {/* Back Navigation Bar */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSubView('overview')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[#f2f2f2] text-sm font-medium text-[#0f0f0f] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to You</span>
            </button>
          </div>

          {/* Panoramic Channel Banner (Matches Screenshot 2) */}
          <div className="relative w-full h-36 sm:h-48 md:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
            <img
              src={buvakiBanner}
              alt="Channel Banner"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Bottom Right "Edit" Button on Banner */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
              <button
                onClick={() => showToast('Edit channel banner image')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-sm shadow-md transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* Channel Header Details Synced with Created Profile */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6 px-1">
            
            {/* Big Channel Avatar */}
            <div className="relative shrink-0 group/avatar">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover ring-4 ring-white shadow-md"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={openEditModal}
                className="absolute bottom-1 right-1 p-2 rounded-full bg-white border border-neutral-200 shadow-md text-neutral-700 hover:text-black hover:bg-neutral-50 transition-all cursor-pointer"
                title="Change profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Channel Info & Bio */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f0f0f] tracking-tight">
                  {displayName}
                </h1>
                {displayBadges.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{displayBadges[0]}</span>
                  </span>
                )}
              </div>

              {/* Stats & Handle */}
              <div className="flex items-center flex-wrap gap-2 text-sm text-[#606060] mt-1 font-normal">
                <span className="font-semibold text-[#0f0f0f]">{displayHandle}</span>
                <span>•</span>
                <span>{displayKarma} karma</span>
                <span>•</span>
                <span>{(userPosts?.length || 0) + 64} total uploads</span>
                <span>•</span>
                <span>Joined {displayJoined}</span>
              </div>

              {/* Bio description */}
              <div className="text-sm text-[#606060] mt-2 max-w-3xl leading-relaxed">
                <span>
                  {isBioExpanded || displayBio.length <= 160
                    ? displayBio
                    : `${displayBio.slice(0, 160)}...`}
                </span>
                {displayBio.length > 160 && (
                  <button
                    onClick={() => setIsBioExpanded(!isBioExpanded)}
                    className="font-semibold text-[#0f0f0f] hover:underline ml-1 cursor-pointer"
                  >
                    {isBioExpanded ? 'Show less' : '...more'}
                  </button>
                )}
              </div>

              {/* Interests Chips from Created Profile */}
              {displayInterests.length > 0 && (
                <div className="flex items-center flex-wrap gap-1.5 mt-3">
                  {displayInterests.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Demographics Details (Gender & DOB) */}
              {(displayGender || displayDob) && (
                <div className="flex items-center flex-wrap gap-2 mt-2.5 text-xs text-[#606060]">
                  {displayGender && displayGender !== 'prefer_not_to_say' && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#f2f2f2] text-neutral-700 capitalize font-medium">
                      {displayGender}
                    </span>
                  )}
                  {displayDob && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#f2f2f2] text-neutral-700 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span>Born {displayDob}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons: Customize channel & Manage posts */}
              <div className="flex items-center flex-wrap gap-3 mt-4">
                <button
                  type="button"
                  onClick={openEditModal}
                  className="px-4 py-2 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] text-sm font-semibold text-[#0f0f0f] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Customize channel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannelTab('posts')}
                  className="px-4 py-2 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] text-sm font-semibold text-[#0f0f0f] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Manage posts</span>
                </button>
              </div>

            </div>

          </div>

          {/* Channel Tabs Bar: videos, shorts, playlists, posts, about */}
          <div className="flex items-center justify-between border-b border-[#0000001a] mt-8">
            <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
              {(['videos', 'shorts', 'playlists', 'posts', 'about'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChannelTab(tab)}
                  className={`pb-3 text-sm font-semibold capitalize relative transition-colors whitespace-nowrap cursor-pointer ${
                    channelTab === tab
                      ? 'text-[#0f0f0f]'
                      : 'text-[#606060] hover:text-[#0f0f0f]'
                  }`}
                >
                  {tab === 'about' ? 'About Profile' : tab}
                  {channelTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f0f0f] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Channel Search Icon */}
            <div className="relative shrink-0 pb-2">
              {channelSearchOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search channel"
                    value={channelSearchQuery}
                    onChange={(e) => setChannelSearchQuery(e.target.value)}
                    className="px-3 py-1.5 rounded-full bg-[#f2f2f2] text-xs text-[#0f0f0f] outline-none w-36 sm:w-48"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setChannelSearchOpen(false);
                      setChannelSearchQuery('');
                    }}
                    className="p-1 text-[#606060] hover:text-[#0f0f0f] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setChannelSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-[#f2f2f2] text-[#606060] hover:text-[#0f0f0f] transition-colors cursor-pointer"
                  aria-label="Search channel"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Content: Videos Grid */}
          {channelTab === 'videos' && (
            <div className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
                {channelVideos
                  .filter(v => channelSearchQuery ? v.title.toLowerCase().includes(channelSearchQuery.toLowerCase()) : true)
                  .map((video) => (
                    <div
                      key={video.id}
                      onClick={() => handleOpenVideo(video.title, displayName, video.thumbnail)}
                      className="group cursor-pointer flex flex-col"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/5 ring-1 ring-black/5">
                        {renderChannelThumbnail(video)}

                        {/* Duration Badge */}
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[11px] font-medium">
                          {video.duration}
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="flex items-start justify-between gap-2 mt-3 px-0.5">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-[#0f0f0f] leading-snug line-clamp-2 group-hover:text-black">
                            {video.title}
                          </h3>
                          <div className="text-xs text-[#606060] mt-1">
                            <span>{video.views}</span>
                            <span className="mx-1">•</span>
                            <span>{video.timeAgo}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-full hover:bg-black/10 text-[#0f0f0f] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tab Content: Shorts */}
          {channelTab === 'shorts' && (
            <div className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleOpenVideo(`Story Short #${idx}`, displayName, displayAvatar)}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[9/16] w-full rounded-xl overflow-hidden bg-slate-900">
                      <img
                        src={`https://images.unsplash.com/photo-${1578632767115 + idx * 1000}?w=400&auto=format&fit=crop&q=80`}
                        alt={`Short ${idx}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <p className="text-xs font-semibold line-clamp-2 drop-shadow">
                          {idx === 1 ? 'When the dragon awakened... 🐉' : `Epic animated scene #${idx}`}
                        </p>
                        <span className="text-[10px] text-white/80 font-medium">
                          {idx * 12}K views
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Playlists */}
          {channelTab === 'playlists' && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => handleOpenVideo(pl.title, displayName, pl.thumbnail)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5 ring-1 ring-black/5">
                    <img src={pl.thumbnail} alt={pl.title} className="w-full h-full object-cover" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-black/60 flex flex-col items-center justify-center gap-1 text-white">
                      <ListVideo className="w-5 h-5" />
                      <span className="text-xs font-semibold">{pl.videoCount}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-[#0f0f0f] mt-2">{pl.title}</h3>
                  <span className="text-xs text-[#606060]">View full playlist</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content: Posts (Synced with Real User Authored Posts) */}
          {channelTab === 'posts' && (
            <div className="mt-6 max-w-3xl flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <div>
                  <h3 className="text-base font-bold text-[#0f0f0f]">
                    Community Posts ({userPosts.length})
                  </h3>
                  <p className="text-xs text-[#606060]">Posts and discussions created by {displayName}</p>
                </div>
                {onOpenCreatePost && (
                  <button
                    onClick={onOpenCreatePost}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Create post</span>
                  </button>
                )}
              </div>

              {userPosts && userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => onSelectPost && onSelectPost(post)}
                    className="p-4 sm:p-5 rounded-2xl border border-[#0000001a] bg-white hover:border-black/20 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={post.author.avatar || displayAvatar}
                        alt={post.author.username || displayName}
                        className="w-10 h-10 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#0f0f0f] block">
                          {post.author.username || displayName}
                        </span>
                        <span className="text-xs text-[#606060]">{post.timestamp}</span>
                      </div>
                    </div>
                    <h4 className="text-base font-bold text-[#0f0f0f] mb-1.5 leading-snug">
                      {post.title}
                    </h4>
                    <p className="text-sm text-[#0f0f0f] leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                    {post.imageUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden max-h-72 border border-neutral-100">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#606060]">
                      <span className="flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.score}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentCount} comments</span>
                      </span>
                      <span className="flex items-center gap-1.5 ml-auto text-emerald-600 font-medium">
                        {post.subBuvakiName}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-2xl border border-dashed border-neutral-300 text-center bg-neutral-50/50">
                  <MessageSquare className="w-10 h-10 text-neutral-400 mx-auto mb-2.5" />
                  <h4 className="text-sm font-bold text-neutral-800">No posts shared yet</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                    Share your thoughts, articles, media, and stories with the Buvaki community.
                  </p>
                  {onOpenCreatePost && (
                    <button
                      onClick={onOpenCreatePost}
                      className="px-4 py-2 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Publish your first post
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: About Profile (Full Synced Profile Details) */}
          {channelTab === 'about' && (
            <div className="mt-6 max-w-3xl space-y-6">
              {/* Profile Details Card */}
              <div className="p-6 rounded-2xl border border-[#0000001a] bg-white shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <Info className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-[#0f0f0f]">Profile Information</h3>
                  </div>
                  <button
                    onClick={openEditModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Edit details</span>
                  </button>
                </div>

                {/* Bio section */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Bio & Description</span>
                  <p className="text-sm text-neutral-800 leading-relaxed">
                    {displayBio}
                  </p>
                </div>

                {/* Grid of Demographics & Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-xs text-neutral-500 block mb-1">Display Name</span>
                    <span className="text-sm font-semibold text-neutral-900">{displayName}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-xs text-neutral-500 block mb-1">User Handle</span>
                    <span className="text-sm font-semibold text-neutral-900">{displayHandle}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-xs text-neutral-500 block mb-1">Gender</span>
                    <span className="text-sm font-semibold text-neutral-900 capitalize">
                      {displayGender === 'prefer_not_to_say' ? 'Prefer not to say' : (displayGender || 'Not specified')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-xs text-neutral-500 block mb-1">Date of Birth</span>
                    <span className="text-sm font-semibold text-neutral-900">
                      {displayDob || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-xs text-neutral-500 block mb-1">Joined Buvaki</span>
                    <span className="text-sm font-semibold text-neutral-900">{displayJoined}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-xs text-neutral-500 block mb-1">Karma Points</span>
                    <span className="text-sm font-semibold text-neutral-900">{displayKarma} points</span>
                  </div>
                </div>

                {/* Interests & Topics */}
                {displayInterests.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Topics of Interest</span>
                    <div className="flex flex-wrap gap-2">
                      {displayInterests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-medium"
                        >
                          #{interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          CUSTOMIZE CHANNEL / EDIT PROFILE MODAL
         ========================================================================= */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSavingProfile) setIsEditModalOpen(false);
          }}
        >
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-100 p-6 sm:p-7 overflow-hidden animate-scaleIn my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Gradient Border */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#22c55e] via-[#10b981] to-[#06b6d4]" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-neutral-900">Customize Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSavingProfile}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
              
              {/* Avatar upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={editAvatar || displayAvatar}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAvatar(getGenericAvatarByGender(editGender))}
                    className="text-[11px] text-neutral-500 hover:text-neutral-800 underline block cursor-pointer"
                  >
                    Use default avatar
                  </button>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Display Name</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Your display name"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Handle */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">User Handle</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold">@</span>
                  <input
                    type="text"
                    value={editHandle}
                    onChange={(e) => setEditHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="handle"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700">Bio Description</label>
                  <span className="text-[11px] text-neutral-400">{editBio.length} / 250</span>
                </div>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value.slice(0, 250))}
                  rows={3}
                  placeholder="Share a short bio about yourself..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Gender & DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Date of Birth</label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Topics of Interest */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
                  <span>Topics of Interest</span>
                  <span className="text-[11px] text-neutral-400">{editInterests.length} selected</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto no-scrollbar p-1">
                  {PRESET_INTERESTS.map((tag) => {
                    const isSelected = editInterests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#0f0f0f] text-white text-xs font-semibold rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}

    </div>
  );
};
