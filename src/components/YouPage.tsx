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
  SlidersHorizontal
} from 'lucide-react';
import { Post, User } from '../types';

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
}) => {
  // 'overview' corresponds to You_expectations.png
  // 'channel' corresponds to You_expectations2.png
  const [subView, setSubView] = useState<'overview' | 'channel'>('overview');
  const [channelTab, setChannelTab] = useState<'videos' | 'shorts' | 'playlists' | 'posts'>('videos');
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [channelSearchOpen, setChannelSearchOpen] = useState(false);
  const [channelSearchQuery, setChannelSearchQuery] = useState('');

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
      title: 'The older I get @buvaki',
      views: '1.4K views',
      timeAgo: '3 weeks ago',
      duration: '1:42',
      thumbnail: '',
      thumbnailType: 'pagoda',
    },
    {
      id: 'chan_2',
      title: 'Love Dragon @buvaki',
      views: '2.8K views',
      timeAgo: '1 month ago',
      duration: '3:15',
      thumbnail: loveDragonThumb,
      thumbnailType: 'dragon',
    },
    {
      id: 'chan_3',
      title: 'Fragments of Fantasy: Chapter I @buvaki',
      views: '4.5K views',
      timeAgo: '2 months ago',
      duration: '5:20',
      thumbnail: '',
      thumbnailType: 'fantasy',
    },
    {
      id: 'chan_4',
      title: 'Whispering Winds: The Origin Story',
      views: '920 views',
      timeAgo: '3 months ago',
      duration: '4:08',
      thumbnail: '',
      thumbnailType: 'chapter',
    },
  ];

  // Helper to trigger video player
  const handleOpenVideo = (title: string, author: string, thumbUrl: string) => {
    if (onSelectPost) {
      const mockPost: Post = {
        id: 'post_' + Math.random().toString(36).substring(2, 8),
        title,
        content: `Now playing: ${title} by ${author}`,
        author: {
          id: 'u_' + author.toLowerCase().replace(/\s+/g, '_'),
          username: author,
          handle: '@' + author.toLowerCase().replace(/\s+/g, '_'),
          avatar: thumbUrl || buvakiAvatar,
          bio: 'Creator on Buvaki',
          karma: 100,
          badges: ['Creator'],
          joinedDate: '2026',
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
              @buvaki
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
              @buvaki
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
          <span className="text-slate-300 text-xs mt-0.5">@buvaki</span>
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

  return (
    <div className="w-full min-h-screen bg-white text-[#0f0f0f] pb-24 select-none">
      
      {/* =========================================================================
          VIEW 1: YOU OVERVIEW (Matches You_expectations.png)
         ========================================================================= */}
      {subView === 'overview' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          
          {/* Top Profile Header: Pressing anywhere here opens You_expectations2.png */}
          <div 
            onClick={() => setSubView('channel')}
            className="group cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 p-3 sm:p-4 -mx-3 sm:-mx-4 rounded-2xl transition-all duration-150 hover:bg-[#00000008]"
            title="Press anywhere to view Buvaki story channel"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSubView('channel');
              }
            }}
          >
            {/* Big Circular Avatar with winged emblem */}
            <div className="relative shrink-0">
              <img
                src={buvakiAvatar}
                alt="Buvaki story"
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover ring-2 ring-black/10 shadow-sm group-hover:ring-black/25 transition-all"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Name, Handle & Action Buttons */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#0f0f0f] leading-tight flex items-center gap-2">
                <span>Buvaki story</span>
              </h1>

              {/* Sub-line: @buvaki • View channel */}
              <div className="flex items-center gap-2 mt-1 text-sm text-[#606060]">
                <span className="font-normal">@buvaki</span>
                <span>•</span>
                <span className="font-medium text-[#0f0f0f] group-hover:underline flex items-center gap-0.5">
                  View channel
                  <ChevronRight className="w-4 h-4 text-[#606060]" />
                </span>
              </div>

              {/* Action Buttons: Switch account & Google Account */}
              <div 
                className="flex items-center flex-wrap gap-2.5 mt-3.5"
                onClick={(e) => {
                  // Prevent outer click if clicking buttons directly
                  e.stopPropagation();
                  setSubView('channel');
                }}
              >
                {/* Switch Account */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRequireAuth) onRequireAuth('Switch or manage accounts on Buvaki');
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0000001a] bg-white hover:bg-[#f2f2f2] text-xs font-semibold text-[#0f0f0f] transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#0f0f0f] stroke-[2]" />
                  <span>Switch account</span>
                </button>

                {/* Google Account */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRequireAuth) onRequireAuth('Connect with your Google Account');
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0000001a] bg-white hover:bg-[#f2f2f2] text-xs font-semibold text-[#0f0f0f] transition-colors"
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
                  <span>Google Account</span>
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
                  onClick={() => alert('Viewing full watch history')}
                  className="px-3.5 py-1.5 rounded-full border border-[#0000001a] text-xs font-semibold text-[#0f0f0f] hover:bg-[#f2f2f2] transition-colors"
                >
                  View all
                </button>

                {/* Left/Right scroll arrows */}
                <button
                  onClick={() => scrollContainer(historyScrollRef, 'left')}
                  className="w-9 h-9 rounded-full border border-[#0000001a] flex items-center justify-center hover:bg-[#f2f2f2] text-[#0f0f0f] transition-colors"
                  aria-label="Scroll history left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollContainer(historyScrollRef, 'right')}
                  className="w-9 h-9 rounded-full border border-[#0000001a] flex items-center justify-center hover:bg-[#f2f2f2] text-[#0f0f0f] transition-colors"
                  aria-label="Scroll history right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Video Scroll Container */}
            <div 
              ref={historyScrollRef}
              className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 scroll-smooth"
            >
              {historyVideos.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleOpenVideo(item.title, item.channel, item.thumbnail)}
                  className="group flex-shrink-0 w-[260px] sm:w-[280px] md:w-[295px] cursor-pointer"
                >
                  {/* Thumbnail 16:9 */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/5 ring-1 ring-black/5">
                    {renderThumbnail(item)}

                    {/* Bottom Right Duration Badge */}
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[11px] font-medium tracking-tight flex items-center gap-1">
                      {item.isAudio && (
                        <span className="text-[10px]">♫</span>
                      )}
                      <span>{item.duration}</span>
                    </div>

                    {/* Hover Play Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex items-start justify-between gap-2 mt-3 px-0.5">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#0f0f0f] leading-snug line-clamp-2 group-hover:text-black">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#606060]">
                        <span className="truncate">{item.channel}</span>
                        {item.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#606060] fill-black/10 shrink-0" />
                        )}
                      </div>

                      <div className="text-xs text-[#606060] mt-0.5">
                        <span>{item.views}</span>
                        <span className="mx-1">•</span>
                        <span>{item.timeAgo}</span>
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
                  onClick={() => alert('Create new playlist')}
                  className="p-2 rounded-full hover:bg-[#f2f2f2] text-[#0f0f0f] transition-colors"
                  title="Create playlist"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* View all button */}
                <button 
                  onClick={() => alert('Viewing all playlists')}
                  className="px-3.5 py-1.5 rounded-full border border-[#0000001a] text-xs font-semibold text-[#0f0f0f] hover:bg-[#f2f2f2] transition-colors"
                >
                  View all
                </button>

                {/* Left/Right scroll arrows */}
                <button
                  onClick={() => scrollContainer(playlistScrollRef, 'left')}
                  className="w-9 h-9 rounded-full border border-[#0000001a] flex items-center justify-center hover:bg-[#f2f2f2] text-[#0f0f0f] transition-colors"
                  aria-label="Scroll playlists left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollContainer(playlistScrollRef, 'right')}
                  className="w-9 h-9 rounded-full border border-[#0000001a] flex items-center justify-center hover:bg-[#f2f2f2] text-[#0f0f0f] transition-colors"
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
                  onClick={() => handleOpenVideo(pl.title, 'Buvaki story', pl.thumbnail)}
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
          VIEW 2: BUVAKI STORY CHANNEL (Matches You_expectations2.png)
         ========================================================================= */}
      {subView === 'channel' && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-3 sm:py-6">
          
          {/* Back Navigation Bar */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSubView('overview')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-[#f2f2f2] text-sm font-medium text-[#0f0f0f] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to You</span>
            </button>
          </div>

          {/* Panoramic Channel Banner (Matches Screenshot 2) */}
          <div className="relative w-full h-36 sm:h-48 md:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
            <img
              src={buvakiBanner}
              alt="Buvaki Story Channel Banner"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Bottom Right "Edit" Button on Banner */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
              <button
                onClick={() => alert('Edit channel banner image')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-sm shadow-md transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* Channel Header Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-6 px-1">
            
            {/* Big Channel Avatar */}
            <div className="relative shrink-0">
              <img
                src={buvakiAvatar}
                alt="Buvaki story"
                className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover ring-4 ring-white shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Channel Info & Bio */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f0f0f] tracking-tight">
                Buvaki story
              </h1>

              {/* Stats & Handle */}
              <div className="flex items-center flex-wrap gap-2 text-sm text-[#606060] mt-1 font-normal">
                <span className="font-semibold text-[#0f0f0f]">@buvaki</span>
                <span>•</span>
                <span>1 subscriber</span>
                <span>•</span>
                <span>64 videos</span>
              </div>

              {/* Bio description */}
              <div className="text-sm text-[#606060] mt-2 max-w-3xl leading-relaxed">
                <span>
                  Welcome to Buvaki Story! Here, we bring you just fragments of most things. The main are anime, fantasy tales, manga adaptations, and original universe lore.
                </span>
                {!isBioExpanded ? (
                  <button
                    onClick={() => setIsBioExpanded(true)}
                    className="font-semibold text-[#0f0f0f] hover:underline ml-1 cursor-pointer"
                  >
                    ...more
                  </button>
                ) : (
                  <button
                    onClick={() => setIsBioExpanded(false)}
                    className="font-semibold text-[#0f0f0f] hover:underline ml-1 cursor-pointer"
                  >
                    Show less
                  </button>
                )}
              </div>

              {/* Action Buttons: Customize channel & Manage videos */}
              <div className="flex items-center flex-wrap gap-3 mt-4">
                <button
                  onClick={() => alert('Customizing channel layout')}
                  className="px-4 py-2 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] text-sm font-semibold text-[#0f0f0f] transition-colors"
                >
                  Customize channel
                </button>

                <button
                  onClick={() => alert('Managing videos & analytics')}
                  className="px-4 py-2 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] text-sm font-semibold text-[#0f0f0f] transition-colors"
                >
                  Manage videos
                </button>
              </div>

            </div>

          </div>

          {/* Channel Tabs Bar */}
          <div className="flex items-center justify-between border-b border-[#0000001a] mt-8">
            <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
              {(['videos', 'shorts', 'playlists', 'posts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChannelTab(tab)}
                  className={`pb-3 text-sm font-semibold capitalize relative transition-colors whitespace-nowrap ${
                    channelTab === tab
                      ? 'text-[#0f0f0f]'
                      : 'text-[#606060] hover:text-[#0f0f0f]'
                  }`}
                >
                  {tab}
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
                    className="p-1 text-[#606060] hover:text-[#0f0f0f]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setChannelSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-[#f2f2f2] text-[#606060] hover:text-[#0f0f0f] transition-colors"
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
                      onClick={() => handleOpenVideo(video.title, 'Buvaki story', video.thumbnail)}
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
                    onClick={() => handleOpenVideo(`Buvaki Story Short #${idx}`, 'Buvaki story', buvakiAvatar)}
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
                          {idx === 1 ? 'When the dragon awakened... 🐉' : `Epic anime scene #${idx}`}
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
                  onClick={() => handleOpenVideo(pl.title, 'Buvaki story', pl.thumbnail)}
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

          {/* Tab Content: Posts */}
          {channelTab === 'posts' && (
            <div className="mt-6 max-w-2xl flex flex-col gap-4">
              <div className="p-4 rounded-2xl border border-[#0000001a] bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <img src={buvakiAvatar} alt="Buvaki story" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <span className="text-sm font-semibold text-[#0f0f0f] block">Buvaki story</span>
                    <span className="text-xs text-[#606060]">2 days ago</span>
                  </div>
                </div>
                <p className="text-sm text-[#0f0f0f] leading-relaxed">
                  Thank you all for the love on the dragon video! Chapter 2 is currently in production and will drop this weekend. Stay tuned! ✨
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-[#606060]">
                  <button className="flex items-center gap-1.5 hover:text-[#0f0f0f]">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>84</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-[#0f0f0f]">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
