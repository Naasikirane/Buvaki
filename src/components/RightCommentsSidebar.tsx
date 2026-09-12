import React, { useState } from 'react';
import { Post, Comment, User, SupportedLanguage, Theme } from '../types';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Send, 
  CornerDownRight, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  User as UserIcon,
  SlidersHorizontal
} from 'lucide-react';
import { formatRealTimestamp } from '../lib/timeUtils';

interface RightCommentsSidebarProps {
  activePost: Post | null;
  comments: Comment[];
  currentUser: User | null;
  selectedLanguage?: SupportedLanguage;
  onVoteComment: (commentId: string, direction: 'up' | 'down') => void;
  onAddComment: (postId: string, content: string, parentId?: string) => void;
  onRequireAuth: (message: string) => void;
  theme?: Theme;
}

export const RightCommentsSidebar: React.FC<RightCommentsSidebarProps> = ({
  activePost,
  comments,
  currentUser,
  selectedLanguage,
  onVoteComment,
  onAddComment,
  onRequireAuth,
  theme = 'dark',
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');

  const isDark = theme === 'dark' || theme === 'stealth';

  // Flatten & count total comments including nested replies
  const countAllComments = (list: Comment[]): number => {
    let count = 0;
    for (const c of list) {
      count += 1;
      if (c.replies && c.replies.length > 0) {
        count += countAllComments(c.replies);
      }
    }
    return count;
  };

  const totalCount = activePost?.commentCount || countAllComments(comments);

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handlePostMainComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activePost) return;
    if (!currentUser) {
      onRequireAuth('Sign in or create an account to comment on this post.');
      return;
    }
    onAddComment(activePost.id, commentText.trim());
    setCommentText('');
  };

  const handlePostReply = (parentId: string) => {
    if (!replyText.trim() || !activePost) return;
    if (!currentUser) {
      onRequireAuth('Sign in or create an account to reply to comments.');
      return;
    }
    onAddComment(activePost.id, replyText.trim(), parentId);
    setReplyText('');
    setReplyingToId(null);
    setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
  };

  // Sort comments
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') {
      return (b.createdAtEpoch || 0) - (a.createdAtEpoch || 0);
    }
    return b.score - a.score;
  });

  return (
    <aside 
      className={`w-80 xl:w-96 shrink-0 hidden lg:flex flex-col sticky top-14 self-start h-[calc(100vh-3.5rem)] z-20 transition-colors border rounded-xl overflow-hidden shadow-xs ${
        isDark 
          ? 'bg-[#0f0f0f] border-white/10 text-white' 
          : 'bg-white border-[#0000001a] text-[#0f0f0f]'
      }`}
      aria-label="Active post comments sidebar"
    >
      {/* Header with Active Post Context */}
      <div className={`p-3.5 border-b shrink-0 flex flex-col gap-2 ${
        isDark ? 'border-white/10 bg-[#121212]' : 'border-[#0000000d] bg-[#f9f9f9]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#0f0f0f]'}`}>
              Comments
            </h2>
            <span className={`text-xs sm:text-sm font-normal ${
              isDark ? 'text-neutral-400' : 'text-[#606060]'
            }`}>
              {totalCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSortBy(sortBy === 'top' ? 'newest' : 'top')}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                isDark 
                  ? 'text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10' 
                  : 'text-[#0f0f0f] hover:bg-[#0000000d]'
              }`}
              title="Change comment sorting"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>{sortBy === 'top' ? 'Top comments' : 'Newest'}</span>
            </button>
          </div>
        </div>

        {/* Active Post author & preview badge */}
        {activePost ? (
          <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
            isDark 
              ? 'bg-[#181818] border-white/5 text-neutral-300' 
              : 'bg-white border-[#00000014] text-[#0f0f0f] shadow-2xs'
          }`}>
            <img 
              src={activePost.author.avatar} 
              alt={activePost.author.username} 
              className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-black/10"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium truncate">
                {activePost.author.username}
                <span className={`ml-1 font-normal ${isDark ? 'text-neutral-400' : 'text-[#606060]'}`}>
                  • {activePost.timestamp}
                </span>
              </p>
              {activePost.content && (
                <p className={`text-[10px] truncate ${isDark ? 'text-neutral-400' : 'text-[#606060]'}`}>
                  {activePost.content}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-[#606060]'}`}>
            Scroll to a post to view comments
          </p>
        )}
      </div>

      {/* Comments Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 custom-scrollbar">
        {sortedComments.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center px-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              isDark ? 'bg-white/5 text-neutral-500' : 'bg-slate-100 text-slate-400'
            }`}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className={`text-xs font-semibold ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              No comments yet
            </p>
            <p className={`text-[11px] mt-1 max-w-[200px] leading-relaxed ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>
              Say something nice to start the discussion for this post!
            </p>
          </div>
        ) : (
          sortedComments.map((comment) => {
            const isReplying = replyingToId === comment.id;
            const hasReplies = comment.replies && comment.replies.length > 0;
            const repliesOpen = expandedReplies[comment.id];

            return (
              <div key={comment.id} className="space-y-2 group">
                <div className="flex items-start gap-2.5">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-[#0f0f0f]'}`}>
                        {comment.author.username}
                      </span>
                      <span className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-[#606060]'}`}>
                        {formatRealTimestamp(comment.createdAt || comment.timestamp)}
                      </span>
                    </div>

                    <p className={`text-xs sm:text-sm leading-relaxed mt-0.5 whitespace-pre-wrap break-words font-normal ${
                      isDark ? 'text-neutral-200' : 'text-[#0f0f0f]'
                    }`}>
                      {comment.content}
                    </p>

                    {/* Actions: ThumbsUp, ThumbsDown, Reply */}
                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        onClick={() => onVoteComment(comment.id, 'up')}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          comment.userVote === 'up'
                            ? 'text-[#065fd4] font-medium'
                            : isDark ? 'text-neutral-400 hover:text-white' : 'text-[#606060] hover:text-[#0f0f0f]'
                        }`}
                        title="Like comment"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 stroke-[1.75] ${comment.userVote === 'up' ? 'fill-[#065fd4]' : ''}`} />
                        {comment.score > 0 && <span>{comment.score}</span>}
                      </button>

                      <button
                        onClick={() => onVoteComment(comment.id, 'down')}
                        className={`text-xs transition-colors ${
                          comment.userVote === 'down'
                            ? 'text-[#065fd4] font-medium'
                            : isDark ? 'text-neutral-400 hover:text-white' : 'text-[#606060] hover:text-[#0f0f0f]'
                        }`}
                        title="Dislike comment"
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 stroke-[1.75] ${comment.userVote === 'down' ? 'fill-[#065fd4]' : ''}`} />
                      </button>

                      <button
                        onClick={() => {
                          if (!currentUser) {
                            onRequireAuth('Sign in or create an account to reply.');
                            return;
                          }
                          setReplyingToId(isReplying ? null : comment.id);
                        }}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                          isDark ? 'text-neutral-300 hover:bg-white/10' : 'text-[#0f0f0f] hover:bg-[#0000000d]'
                        }`}
                      >
                        Reply
                      </button>
                    </div>

                    {/* Inline Reply Form */}
                    {isReplying && (
                      <div className="mt-2.5 flex items-center gap-2 animate-in fade-in">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.author.username}...`}
                          className={`flex-1 text-xs px-3 py-1.5 rounded-full border outline-none ${
                            isDark 
                              ? 'bg-[#181818] border-white/10 text-white placeholder-neutral-500 focus:border-sky-500' 
                              : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                          }`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handlePostReply(comment.id);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handlePostReply(comment.id)}
                          disabled={!replyText.trim()}
                          className="p-1.5 rounded-full bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyingToId(null)}
                          className={`text-[10px] px-2 py-1 rounded-full ${
                            isDark ? 'text-neutral-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Nested Replies Toggle */}
                    {hasReplies && (
                      <div className="mt-1.5">
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#065fd4] hover:bg-[#065fd4]/10 px-2 py-0.5 rounded-full transition-colors"
                        >
                          <CornerDownRight className="w-3 h-3 stroke-[1.75]" />
                          <span>{repliesOpen ? 'Hide replies' : `View ${comment.replies!.length} replies`}</span>
                          {repliesOpen ? <ChevronUp className="w-3 h-3 stroke-[1.75]" /> : <ChevronDown className="w-3 h-3 stroke-[1.75]" />}
                        </button>

                        {repliesOpen && (
                          <div className="mt-2 space-y-2 pl-3 border-l-2 border-[#065fd4]/30">
                            {comment.replies!.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <img
                                  src={reply.author.avatar}
                                  alt={reply.author.username}
                                  className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className={`text-[11px] font-medium ${isDark ? 'text-white' : 'text-[#0f0f0f]'}`}>
                                      {reply.author.username}
                                    </span>
                                    <span className={`text-[9px] ${isDark ? 'text-neutral-400' : 'text-[#606060]'}`}>
                                      {formatRealTimestamp(reply.createdAt || reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className={`text-xs mt-0.5 leading-relaxed font-normal ${
                                    isDark ? 'text-neutral-300' : 'text-[#0f0f0f]'
                                  }`}>
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Comment Input */}
      <form 
        onSubmit={handlePostMainComment}
        className={`p-3 sm:p-3.5 border-t shrink-0 flex items-center gap-2.5 ${
          isDark ? 'border-white/10 bg-[#121212]' : 'border-[#0000000d] bg-white'
        }`}
      >
        {currentUser ? (
          <img 
            src={currentUser.avatar} 
            alt={currentUser.username} 
            className="w-7 h-7 rounded-full object-cover shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
            isDark ? 'bg-white/10 text-neutral-400' : 'bg-[#f2f2f2] text-[#606060]'
          }`}>
            <UserIcon className="w-4 h-4 stroke-[1.75]" />
          </div>
        )}

        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={currentUser ? "Add a comment..." : "Sign in to add a comment..."}
          className={`flex-1 text-xs px-3.5 py-2 rounded-full border outline-none transition-all ${
            isDark 
              ? 'bg-[#1c1c1c] border-white/10 text-white placeholder-neutral-500 focus:border-[#3ea6ff]' 
              : 'bg-[#f2f2f2] border-transparent text-[#0f0f0f] placeholder-[#606060] focus:bg-white focus:border-[#065fd4]'
          }`}
          onFocus={() => {
            if (!currentUser) {
              onRequireAuth('Sign in or create an account to comment.');
            }
          }}
        />

        <button
          type="submit"
          disabled={!commentText.trim() || !activePost}
          className="p-2 rounded-full bg-[#065fd4] hover:bg-[#065fd4]/90 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-xs"
          title="Send comment"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};
