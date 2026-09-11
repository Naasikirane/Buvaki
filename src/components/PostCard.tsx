import React, { useState, useRef } from 'react';
import { Post, User, SupportedLanguage, Comment } from '../types';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  MessageSquare, 
  MoreVertical, 
  Sparkles, 
  Bookmark, 
  Trash2, 
  Pin,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { formatRealTimestamp } from '../lib/timeUtils';
import { DeletePostConfirmModal } from './DeletePostConfirmModal';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  selectedLanguage?: SupportedLanguage;
  topComment?: Comment | null;
  onVote: (postId: string, direction: 'up' | 'down') => void;
  onSelectPost: (post: Post) => void;
  onToggleSave: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onDeletePost?: (postId: string) => Promise<void> | void;
  onOpenComments?: (post: Post) => void;
  onOpenShare?: (post: Post) => void;
  onSubscribeToggle?: (authorId: string) => void;
  isSubscribed?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  selectedLanguage,
  topComment,
  onVote,
  onSelectPost,
  onToggleSave,
  onVotePoll,
  onDeletePost,
  onOpenComments,
  onOpenShare,
}) => {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Mouse Drag to Scroll State for Desktop/Touch
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startXRef.current);
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent) => {
    if (isDraggingRef.current && hasMovedRef.current) {
      e.stopPropagation();
    }
    isDraggingRef.current = false;
  };

  // Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');

  const isAuthor = currentUser && (currentUser.id === post.author.id || currentUser.handle === post.author.handle);

  // Normalize images array
  const postImages: string[] = post.images && post.images.length > 0 
    ? post.images 
    : post.imageUrl 
    ? [post.imageUrl] 
    : [];

  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryScrollRef.current) {
      const scrollAmount = galleryScrollRef.current.clientWidth * 0.8;
      galleryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    const targetLang = selectedLanguage ? selectedLanguage.name : 'Spanish';
    const targetCode = selectedLanguage ? selectedLanguage.code : 'es';
    setIsTranslating(true);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: post.title, 
          content: post.content || '', 
          targetLanguage: targetLang,
          targetCode: targetCode
        }),
      });
      const data = await res.json();
      setTranslatedTitle(data.translatedTitle || data.translatedText || post.title);
      setTranslatedContent(data.translatedContent || post.content || '');
      setIsTranslated(true);
    } catch (err) {
      console.error('Translation error:', err);
      setTranslatedTitle(`[${targetLang}] ${post.title}`);
      setTranslatedContent(post.content ? `[${targetLang}] ${post.content}` : '');
      setIsTranslated(true);
    } finally {
      setIsTranslating(false);
    }
  };

  // Format vote count e.g. 1k, 274, 48, 13
  const formatScore = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) {
      const val = (num / 1000);
      return val % 1 === 0 ? val.toFixed(0) + 'k' : val.toFixed(1) + 'k';
    }
    return num > 0 ? num.toString() : '0';
  };

  // Fallback top comment preview text if not provided in props
  const resolvedTopComment = topComment || (post.id === 'post_ojisan_brothers' ? {
    id: 'c_council',
    postId: post.id,
    author: {
      id: 'u_gojo_fan',
      username: 'ShadowNinja',
      handle: '@ShadowNinja',
      avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=80',
      bio: '',
      karma: 0,
      badges: [],
      joinedDate: '',
      status: 'online' as const
    },
    content: 'NARUTO WILL TALK NO JUTSU YOU A COUNCIL MEMBER',
    timestamp: '7 hours ago',
    score: 15,
    replies: []
  } : post.id === 'post_nothing_wrestler' ? {
    id: 'c_ryan',
    postId: post.id,
    author: {
      id: 'u_ryan',
      username: 'Ryan_G',
      handle: '@Ryan_G',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      bio: '',
      karma: 0,
      badges: [],
      joinedDate: '',
      status: 'online' as const
    },
    content: 'Holy comeback',
    timestamp: '3 hours ago',
    score: 48,
    replies: []
  } : post.id === 'post_yuji_fight' ? {
    id: 'c_mojang',
    postId: post.id,
    author: {
      id: 'u_mojang',
      username: 'BedrockGamer',
      handle: '@BedrockGamer',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
      bio: '',
      karma: 0,
      badges: [],
      joinedDate: '',
      status: 'online' as const
    },
    content: 'FIX MOJANG BEDROCK',
    timestamp: '16 hours ago',
    score: 19,
    replies: []
  } : null);

  const displayContent = post.content || post.title;

  return (
    <article 
      onClick={() => {
        if (onOpenComments) onOpenComments(post);
        else onSelectPost(post);
      }}
      className="group w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-[#0f0f0f] pb-5 transition-all duration-200 cursor-pointer text-left"
    >
      {/* Pinned Badge if any */}
      {post.isPinned && (
        <div className="px-4 pt-2 flex items-center gap-1.5 text-xs font-bold text-sky-400">
          <Pin className="w-3.5 h-3.5 fill-sky-400" />
          <span>Pinned community post</span>
        </div>
      )}

      {/* Main Row: Left Avatar + Right Indented Content Column (Identical to Green Line Indentation) */}
      <div className="px-4 pt-3.5 flex items-start gap-3 sm:gap-3.5">
        
        {/* Left Column: Creator Avatar */}
        <div className="shrink-0 pt-0.5">
          <img
            src={post.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={post.author.username}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Right Column: ALL items indented and vertically aligned together */}
        <div className="flex-1 min-w-0">
          
          {/* 1. Header Row: Author Username Pill & Timestamp + 3-dots Menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors w-fit">
                <span className="text-xs font-semibold text-white truncate">
                  {post.author.username || post.author.handle.replace(/^@/, '')}
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-neutral-400 mt-1">
                {formatRealTimestamp(post.createdAt || post.timestamp)}
              </span>
            </div>

            {/* 3 dots menu button */}
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showOptionsMenu && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl bg-neutral-900 border border-white/10 shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95">
                  <button
                    onClick={(e) => {
                      handleTranslate(e);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-neutral-200 hover:bg-white/10 flex items-center gap-2.5 font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span>{isTranslated ? 'Show Original' : 'Translate post'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleSave(post.id);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-neutral-200 hover:bg-white/10 flex items-center gap-2.5 font-medium"
                  >
                    <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                    <span>{post.isSaved ? 'Remove from saved' : 'Save post'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenShare) onOpenShare(post);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-neutral-200 hover:bg-white/10 flex items-center gap-2.5 font-medium"
                  >
                    <Share2 className="w-4 h-4 text-neutral-300" />
                    <span>Share post</span>
                  </button>

                  {isAuthor && onDeletePost && (
                    <button
                      onClick={() => {
                        setIsConfirmDeleteOpen(true);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2.5 font-medium border-t border-white/10"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete post</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. Text / Caption: Statement + ...more occupying exactly two lines */}
          {displayContent && (
            <div className="mt-2">
              {isTranslated && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-950/80 border border-violet-700/60 text-violet-300 text-[10px] font-semibold mb-1">
                  <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
                  <span>AI Translated</span>
                </div>
              )}
              {(() => {
                const fullText = isTranslated ? (translatedContent || translatedTitle) : displayContent;
                
                if (isExpanded) {
                  return (
                    <p className="text-sm text-neutral-100 whitespace-pre-wrap leading-relaxed">
                      <span>{fullText}</span>{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(false);
                        }}
                        className="text-neutral-400 hover:text-white font-medium text-xs ml-1 inline-block transition-colors"
                      >
                        Show less
                      </button>
                    </p>
                  );
                }

                // Check if text exceeds two lines
                const lines = fullText.split('\n').filter(l => l.trim().length > 0);
                const isMultiLine = lines.length > 2;
                const isLong = fullText.length > 75;
                const shouldTruncate = isMultiLine || isLong;

                if (!shouldTruncate) {
                  return (
                    <p className="text-sm text-neutral-100 whitespace-pre-wrap leading-relaxed">
                      {fullText}
                    </p>
                  );
                }

                // Truncate to word boundary around ~74 characters to fit exactly in 2 lines with ...more
                let snippet = fullText;
                if (isMultiLine) {
                  snippet = lines.slice(0, 2).join(' ');
                }
                if (snippet.length > 74) {
                  const lastSpace = snippet.lastIndexOf(' ', 74);
                  snippet = snippet.slice(0, lastSpace > 35 ? lastSpace : 74).trim();
                }

                return (
                  <p className="text-sm text-neutral-100 leading-relaxed">
                    <span>{snippet}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                      }}
                      className="text-neutral-400 hover:text-white font-medium text-xs ml-0.5 inline-flex items-center transition-colors"
                    >
                      ...more
                    </button>
                  </p>
                );
              })()}
            </div>
          )}

          {/* 3. Media Content: Small, Square Images of Uniform Size with Independent Expanding MORE Icon */}
          {postImages.length > 0 && (
            <div className="mt-2.5 relative group/gallery" onClick={(e) => e.stopPropagation()}>
              {!isGalleryExpanded ? (
                /* Standard Compact Mode: Small square photos of identical size in a horizontal row */
                <div className="relative">
                  {/* Left Scroll Arrow (shown if overflowing) */}
                  {postImages.length > 2 && (
                    <button
                      type="button"
                      onClick={() => scrollGallery('left')}
                      className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity shadow-lg cursor-pointer hidden sm:flex items-center justify-center"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  {/* Horizontal row of small square photos with independent MORE icon next to the last photo */}
                  <div 
                    ref={galleryScrollRef}
                    className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 pr-4"
                  >
                    {postImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="relative shrink-0 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[240px] md:h-[240px] aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-md cursor-zoom-in group/img"
                      >
                        <img
                          src={imgUrl}
                          alt={`Post media ${idx + 1}`}
                          className="w-full h-full object-cover select-none transition-transform duration-300 group-hover/img:scale-[1.03]"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        {/* Image Counter badge in top-right (when multiple photos) */}
                        {postImages.length > 1 && (
                          <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[11px] font-semibold text-white/95 border border-white/10 select-none shadow-sm">
                            {idx + 1}/{postImages.length}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Independent Expanding MORE Icon: placed next to the last photo */}
                    <button
                      type="button"
                      onClick={() => setIsGalleryExpanded(true)}
                      className="shrink-0 flex flex-col items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl bg-black/90 hover:bg-black border border-white/20 text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer select-none self-center"
                      title="Expand photos"
                    >
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                        MORE
                      </span>
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Right Scroll Arrow (shown if overflowing) */}
                  {postImages.length > 2 && (
                    <button
                      type="button"
                      onClick={() => scrollGallery('right')}
                      className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/75 hover:bg-black border border-white/20 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity shadow-lg cursor-pointer hidden sm:flex items-center justify-center"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                /* Expanded Mode: Large view with independent LESS button to collapse back */
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-neutral-400">
                      {postImages.length} {postImages.length === 1 ? 'Photo' : 'Photos'} (Expanded View)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsGalleryExpanded(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/90 hover:bg-black border border-white/20 text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title="Collapse to small square photos"
                    >
                      <span>LESS</span>
                      <Minimize2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>

                  {postImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className="relative w-full max-w-2xl aspect-video sm:aspect-[16/10] max-h-[500px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 shadow-md cursor-zoom-in group/img"
                    >
                      <img
                        src={imgUrl}
                        alt={`Post media ${idx + 1}`}
                        className="w-full h-full object-cover select-none transition-transform duration-300 group-hover/img:scale-[1.02]"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      {postImages.length > 1 && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-white/90 border border-white/10">
                          {idx + 1} / {postImages.length}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Poll Type Post Support */}
          {post.type === 'poll' && post.poll && (
            <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-white">{post.poll.question}</h4>
                <div className="space-y-1.5">
                  {post.poll.options.map((opt) => {
                    const total = post.poll?.totalVotes || 1;
                    const percentage = Math.round((opt.votes / (total || 1)) * 100);
                    const isSelected = post.poll?.userVotedOptionId === opt.id;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => onVotePoll(post.id, opt.id)}
                        className={`w-full relative overflow-hidden p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-950/40 text-white'
                            : 'border-white/10 bg-neutral-800/80 text-neutral-200 hover:bg-neutral-800'
                        }`}
                      >
                        <div 
                          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                            isSelected ? 'bg-sky-600/30' : 'bg-white/10'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="truncate">{opt.text}</span>
                          <span className="font-mono text-[11px] text-neutral-400 font-bold ml-2">
                            {percentage}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. Action Row (Aligned with the green indentation line: 👍 [count]  👎  💬 [count]  ↪️) */}
          <div 
            className="mt-3 flex items-center gap-6 sm:gap-7 text-neutral-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Like / Upvote */}
            <button
              onClick={() => onVote(post.id, 'up')}
              className={`flex items-center gap-2 py-1 hover:text-white transition-colors ${
                post.userVote === 'up' ? 'text-white font-bold' : 'text-neutral-300'
              }`}
              aria-label="Like"
            >
              <ThumbsUp className={`w-5 h-5 ${post.userVote === 'up' ? 'fill-white text-white' : ''}`} />
              <span className="text-xs sm:text-sm font-semibold">
                {formatScore(post.score)}
              </span>
            </button>

            {/* Dislike / Downvote */}
            <button
              onClick={() => onVote(post.id, 'down')}
              className={`flex items-center py-1 hover:text-white transition-colors ${
                post.userVote === 'down' ? 'text-white font-bold' : 'text-neutral-300'
              }`}
              aria-label="Dislike"
            >
              <ThumbsDown className={`w-5 h-5 ${post.userVote === 'down' ? 'fill-white text-white' : ''}`} />
            </button>

            {/* Comments Count */}
            <button
              onClick={() => {
                if (onOpenComments) onOpenComments(post);
                else onSelectPost(post);
              }}
              className="flex items-center gap-2 py-1 text-neutral-300 hover:text-white transition-colors"
              aria-label="Comments"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-semibold">
                {post.commentCount || 0}
              </span>
            </button>

            {/* Share Arrow (Matching Screenshot) */}
            <button
              onClick={() => {
                if (onOpenShare) onOpenShare(post);
              }}
              className="flex items-center py-1 text-neutral-300 hover:text-white transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* 5. Highlighted Comments Box (Aligned with the green indentation line) */}
          <div 
            className="mt-3"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenComments) onOpenComments(post);
              else onSelectPost(post);
            }}
          >
            <div className="p-3 rounded-2xl bg-[#212121] hover:bg-[#282828] transition-colors cursor-pointer border border-white/5">
              <div className="text-xs font-semibold text-neutral-300 mb-1.5">
                Comments
              </div>
              <div className="flex items-center gap-2.5">
                <img
                  src={resolvedTopComment?.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt="Commenter"
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <p className="text-xs text-neutral-200 truncate font-normal">
                  {resolvedTopComment?.content || 'Add a comment...'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && onDeletePost && (
        <DeletePostConfirmModal
          isOpen={isConfirmDeleteOpen}
          postTitle={post.title || post.content}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={async () => {
            await onDeletePost(post.id);
            setIsConfirmDeleteOpen(false);
          }}
        />
      )}

      {/* Lightbox Fullscreen Viewer */}
      {lightboxIndex !== null && postImages[lightboxIndex] && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxIndex(null);
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close image viewer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation - Prev */}
          {postImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : postImages.length - 1));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main Image */}
          <div className="relative max-w-5xl max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={postImages[lightboxIndex]}
              alt={`Full preview ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            {postImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-xs font-semibold text-white">
                {lightboxIndex + 1} / {postImages.length}
              </div>
            )}
          </div>

          {/* Navigation - Next */}
          {postImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null && prev < postImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

    </article>
  );
};
