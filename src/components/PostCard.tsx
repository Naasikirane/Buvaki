import React, { useState, useRef } from 'react';
import { Post, User, SupportedLanguage, Comment, Theme } from '../types';
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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatRealTimestamp } from '../lib/timeUtils';
import { DeletePostConfirmModal } from './DeletePostConfirmModal';

interface PostCardProps {
  post: Post;
  currentUser: User | null;
  selectedLanguage?: SupportedLanguage;
  topComment?: Comment | null;
  comments?: Comment[];
  onAddComment?: (postId: string, content: string) => void;
  onVote: (postId: string, direction: 'up' | 'down') => void;
  onSelectPost: (post: Post) => void;
  onToggleSave: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onDeletePost?: (postId: string) => Promise<void> | void;
  onOpenComments?: (post: Post) => void;
  onOpenShare?: (post: Post) => void;
  onSubscribeToggle?: (authorId: string) => void;
  isSubscribed?: boolean;
  onRequireAuth?: (promptReason?: string) => void;
  theme?: Theme;
  isActiveCenter?: boolean;
  onFocusPost?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  selectedLanguage,
  topComment,
  comments,
  onAddComment,
  onVote,
  onSelectPost,
  onToggleSave,
  onVotePoll,
  onDeletePost,
  onOpenComments,
  onOpenShare,
  onSubscribeToggle,
  isSubscribed,
  onRequireAuth,
  theme = 'dark',
  isActiveCenter = false,
  onFocusPost,
}) => {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [inlineComment, setInlineComment] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  const commentsList = comments || (topComment ? [topComment] : []);

  const handleInlineCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineComment.trim()) return;
    if (!currentUser && onRequireAuth) {
      onRequireAuth('Sign in or create an account to comment');
      return;
    }
    if (onAddComment) {
      onAddComment(post.id, inlineComment.trim());
      setInlineComment('');
    }
  };

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

  const [isImagesExpanded, setIsImagesExpanded] = useState(false);

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
  const resolvedTopComment = topComment || commentsList[0] || (post.id === 'post_ojisan_brothers' ? {
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

  const isDark = theme === 'dark' || theme === 'stealth';
  const displayContent = post.content || post.title;

  return (
    <article 
      onClick={() => {
        if (onFocusPost) onFocusPost(post);
        else if (onOpenComments) onOpenComments(post);
        else onSelectPost(post);
      }}
      className={`group w-full max-w-full rounded-xl p-4 transition-all duration-150 cursor-pointer text-left border ${
        isDark 
          ? 'bg-[#0f0f0f] border-white/10 hover:border-white/20 text-white' 
          : 'bg-white border-[#0000001a] hover:border-[#00000033] text-[#0f0f0f]'
      } ${
        isActiveCenter 
          ? (isDark ? 'border-[#3ea6ff] shadow-xs' : 'border-[#065fd4] shadow-xs') 
          : ''
      }`}
    >
      {/* Pinned Badge if any */}
      {post.isPinned && (
        <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium text-[#606060]">
          <Pin className="w-3.5 h-3.5 fill-[#606060]" />
          <span>Pinned post</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex items-start gap-3 w-full">
        
        {/* Creator Avatar */}
        <div className="shrink-0 pt-0.5">
          <img
            src={post.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={post.author.username}
            className={`w-10 h-10 rounded-full object-cover ring-1 ${isDark ? 'ring-white/10' : 'ring-black/10'}`}
            referrerPolicy="no-referrer"
          />
        </div>

          {/* Content Column */}
          <div className="flex-1 min-w-0">
            
            {/* 1. Header Row: Author Channel Name & Timestamp + Subscribe + 3-dots Menu */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <span className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-[#0f0f0f]'}`}>
                  {post.author.username || post.author.handle.replace(/^@/, '')}
                </span>
                <span className="text-xs text-[#606060] font-normal shrink-0">
                  {formatRealTimestamp(post.createdAt || post.timestamp)}
                </span>

                {/* Creator Subscribe button */}
                {onSubscribeToggle && (!currentUser || (currentUser.id !== post.author.id && currentUser.handle !== post.author.handle)) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!currentUser && onRequireAuth) {
                        onRequireAuth('Sign in or create an account to subscribe to creators');
                        return;
                      }
                      onSubscribeToggle(post.author.handle || post.author.id);
                    }}
                    className={`ml-1 text-xs px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                      isSubscribed
                        ? isDark ? 'bg-white/10 text-neutral-300 hover:bg-white/20' : 'bg-black/5 text-[#0f0f0f] hover:bg-black/10'
                        : isDark ? 'bg-white text-black hover:bg-white/90 font-medium' : 'bg-[#0f0f0f] text-white hover:bg-black/80 font-medium'
                    }`}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                )}
              </div>

              {/* 3 dots menu button */}
              <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    isDark ? 'hover:bg-white/10 text-neutral-300' : 'hover:bg-black/5 text-[#0f0f0f]'
                  }`}
                  aria-label="More options"
                >
                  <MoreVertical className="w-4 h-4 stroke-[1.75]" />
                </button>

                {showOptionsMenu && (
                  <div className={`absolute right-0 mt-1 w-48 rounded-xl border shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 ${
                    isDark ? 'bg-[#212121] border-white/10 text-white' : 'bg-white border-[#0000001a] text-[#0f0f0f]'
                  }`}>
                    <button
                      onClick={(e) => {
                        handleTranslate(e);
                        setShowOptionsMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 font-normal ${
                        isDark ? 'hover:bg-white/10' : 'hover:bg-[#f2f2f2]'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-[#065fd4]" />
                      <span>{isTranslated ? 'Show Original' : 'Translate post'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!currentUser && onRequireAuth) {
                          onRequireAuth('Sign in or create an account to save posts to your library');
                          setShowOptionsMenu(false);
                          return;
                        }
                        onToggleSave(post.id);
                        setShowOptionsMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 font-normal ${
                        isDark ? 'hover:bg-white/10' : 'hover:bg-[#f2f2f2]'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-[#065fd4] text-[#065fd4]' : ''}`} />
                      <span>{post.isSaved ? 'Remove from saved' : 'Save post'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenShare) onOpenShare(post);
                        setShowOptionsMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2.5 font-normal ${
                        isDark ? 'hover:bg-white/10' : 'hover:bg-[#f2f2f2]'
                      }`}
                    >
                      <Share2 className="w-4 h-4 text-[#606060]" />
                      <span>Share post</span>
                    </button>

                    {isAuthor && onDeletePost && (
                      <button
                        onClick={() => {
                          setIsConfirmDeleteOpen(true);
                          setShowOptionsMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs text-[#cc0000] flex items-center gap-2.5 font-normal border-t ${
                          isDark ? 'border-white/10 hover:bg-white/10' : 'border-[#0000001a] hover:bg-[#fff0f0]'
                        }`}
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
            <div className="mt-1.5">
              {isTranslated && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#065fd4]/10 border border-[#065fd4]/20 text-[#065fd4] text-[10px] font-medium mb-1">
                  <Sparkles className="w-3 h-3 text-[#065fd4] animate-pulse" />
                  <span>AI Translated</span>
                </div>
              )}
              {(() => {
                const fullText = isTranslated ? (translatedContent || translatedTitle) : displayContent;
                
                if (isExpanded) {
                  return (
                    <p className={`text-sm whitespace-pre-wrap leading-[20px] font-normal ${isDark ? 'text-neutral-200' : 'text-[#0f0f0f]'}`}>
                      <span>{fullText}</span>{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(false);
                        }}
                        className="text-[#606060] hover:text-[#0f0f0f] font-medium text-xs ml-1 inline-block transition-colors"
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
                    <p className={`text-sm whitespace-pre-wrap leading-[20px] font-normal ${isDark ? 'text-neutral-200' : 'text-[#0f0f0f]'}`}>
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
                  <p className={`text-sm leading-[20px] font-normal ${isDark ? 'text-neutral-200' : 'text-[#0f0f0f]'}`}>
                    <span>{snippet}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                      }}
                      className="text-[#606060] hover:text-[#0f0f0f] font-medium text-xs ml-0.5 inline-flex items-center transition-colors"
                    >
                      ...more
                    </button>
                  </p>
                );
              })()}
            </div>
          )}

          {/* 3. Media Content: Limited to 3 in one row without horizontal scroll, with green (downward chevron)more and (upward chevron)less */}
          {postImages.length > 0 && (() => {
            const hasExtraImages = postImages.length > 3;
            const displayedImages = (!hasExtraImages || isImagesExpanded)
              ? postImages
              : postImages.slice(0, 3);

            // Container size so up to 3 images fit in one row without horizontal scrolling
            const getItemWidthClass = () => {
              if (postImages.length === 1) {
                return 'w-[240px] sm:w-[280px] h-[176px] sm:h-[206px]';
              }
              if (postImages.length === 2) {
                return 'w-[calc((100%-8px)/2)] sm:w-[195px] max-w-[210px] h-[160px] sm:h-[206px]';
              }
              return 'w-[calc((100%-16px)/3)] sm:w-[195px] max-w-[195px] h-[140px] min-[450px]:h-[160px] sm:h-[206px]';
            };

            const itemWidthClass = getItemWidthClass();

            return (
              <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
                {/* Images grid/row */}
                <div className="flex flex-wrap gap-2 sm:gap-2.5 w-full">
                  {displayedImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className={`relative shrink-0 ${itemWidthClass} rounded-xl overflow-hidden cursor-zoom-in group/img transition-transform duration-200 hover:scale-[1.01] shadow-xs ${
                        isDark ? 'bg-[#181818] border border-white/10' : 'bg-[#f2f2f2] border border-[#0000001a]'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Post media ${idx + 1}`}
                        className="w-full h-full object-cover select-none"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      {postImages.length > 1 && (
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-white select-none shadow-xs">
                          {idx + 1}/{postImages.length}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Green "(downward facing chevron)more" or "(upward facing chevron)less" button */}
                {hasExtraImages && (
                  <div className="mt-2 flex items-center">
                    {!isImagesExpanded ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsImagesExpanded(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f9d58] hover:text-[#0b8043] dark:text-[#2ba640] dark:hover:text-[#38c950] transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-green-500/10 active:scale-95 select-none"
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                        <span>more</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsImagesExpanded(false);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f9d58] hover:text-[#0b8043] dark:text-[#2ba640] dark:hover:text-[#38c950] transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-green-500/10 active:scale-95 select-none"
                      >
                        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                        <span>less</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Poll Type Post Support */}
          {post.type === 'poll' && post.poll && (
            <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
              <div className={`p-3.5 rounded-xl border space-y-2 ${
                isDark ? 'bg-[#181818] border-white/10' : 'bg-[#f9f9f9] border-[#0000001a]'
              }`}>
                <h4 className={`text-xs sm:text-sm font-medium ${isDark ? 'text-white' : 'text-[#0f0f0f]'}`}>{post.poll.question}</h4>
                <div className="space-y-1.5">
                  {post.poll.options.map((opt) => {
                    const total = post.poll?.totalVotes || 1;
                    const percentage = Math.round((opt.votes / (total || 1)) * 100);
                    const isSelected = post.poll?.userVotedOptionId === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (!currentUser && onRequireAuth) {
                            onRequireAuth('Sign in or create an account to vote in community polls');
                            return;
                          }
                          onVotePoll(post.id, opt.id);
                        }}
                        className={`w-full relative overflow-hidden p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? isDark ? 'border-[#3ea6ff] bg-[#3ea6ff]/10 text-[#3ea6ff]' : 'border-[#065fd4] bg-[#065fd4]/10 text-[#065fd4]'
                            : isDark ? 'border-white/5 bg-white/5 text-neutral-300 hover:bg-white/10' : 'border-[#0000001a] bg-white text-[#0f0f0f] hover:bg-[#f2f2f2]'
                        }`}
                      >
                        <div 
                          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                            isSelected 
                              ? isDark ? 'bg-[#3ea6ff]/20' : 'bg-[#065fd4]/20' 
                              : isDark ? 'bg-white/5' : 'bg-black/5'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="truncate">{opt.text}</span>
                          <span className={`font-mono text-[11px] font-bold ml-2 ${isDark ? 'text-neutral-400' : 'text-[#606060]'}`}>
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

          {/* 4. Action Row (Aligned: 👍 [count]  👎  💬 [count]  ↪️) */}
          <div 
            className={`mt-3 flex items-center gap-6 sm:gap-7 ${isDark ? 'text-neutral-400' : 'text-[#606060]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Like / Upvote */}
            <button
              onClick={() => {
                if (!currentUser && onRequireAuth) {
                  onRequireAuth('Sign in or create an account to like posts');
                  return;
                }
                onVote(post.id, 'up');
              }}
              className={`flex items-center gap-1.5 py-1 text-xs sm:text-sm font-normal transition-colors ${
                post.userVote === 'up' 
                  ? 'text-[#065fd4] font-medium' 
                  : isDark ? 'hover:text-white' : 'hover:text-[#0f0f0f]'
              }`}
              aria-label="Like"
            >
              <ThumbsUp className={`w-4 h-4 stroke-[1.75] ${post.userVote === 'up' ? 'fill-[#065fd4] text-[#065fd4]' : ''}`} />
              <span>
                {formatScore(post.score)}
              </span>
            </button>

            {/* Dislike / Downvote */}
            <button
              onClick={() => {
                if (!currentUser && onRequireAuth) {
                  onRequireAuth('Sign in or create an account to vote on posts');
                  return;
                }
                onVote(post.id, 'down');
              }}
              className={`flex items-center py-1 transition-colors ${
                post.userVote === 'down' 
                  ? 'text-[#065fd4] font-medium' 
                  : isDark ? 'hover:text-white' : 'hover:text-[#0f0f0f]'
              }`}
              aria-label="Dislike"
            >
              <ThumbsDown className={`w-4 h-4 stroke-[1.75] ${post.userVote === 'down' ? 'fill-[#065fd4] text-[#065fd4]' : ''}`} />
            </button>

            {/* Comments Count */}
            <button
              onClick={() => {
                if (onFocusPost) onFocusPost(post);
                else if (onOpenComments) onOpenComments(post);
                else onSelectPost(post);
              }}
              className={`flex items-center gap-1.5 py-1 text-xs sm:text-sm font-normal transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-[#0f0f0f]'
              }`}
              aria-label="Comments"
            >
              <MessageSquare className="w-4 h-4 stroke-[1.75]" />
              <span>
                {post.commentCount || commentsList.length}
              </span>
            </button>

            {/* Share Arrow */}
            <button
              onClick={() => {
                if (onOpenShare) onOpenShare(post);
              }}
              className={`flex items-center py-1 transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-[#0f0f0f]'
              }`}
              aria-label="Share"
            >
              <Share2 className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>

          {/* Comments Preview Box (Matches UI screenshot) */}
          <div 
            className="mt-3"
            onClick={(e) => {
              e.stopPropagation();
              if (onFocusPost) onFocusPost(post);
              else if (onOpenComments) onOpenComments(post);
              else onSelectPost(post);
            }}
          >
            <div className={`p-3 rounded-xl transition-colors cursor-pointer border ${
              isDark 
                ? 'bg-[#181818] hover:bg-[#202020] border-white/5 text-neutral-300' 
                : 'bg-[#f9f9f9] hover:bg-[#f2f2f2] border-[#0000000d] text-[#0f0f0f]'
            }`}>
              <div className={`text-xs font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-[#0f0f0f]'}`}>
                Comments
              </div>
              <div className="flex items-center gap-2.5">
                <img
                  src={resolvedTopComment?.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt="Commenter"
                  className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-black/10"
                  referrerPolicy="no-referrer"
                />
                <p className={`text-xs truncate font-normal ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
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
          post={post}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirmDelete={async () => {
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
