import React, { useState } from 'react';
import { Comment, User, SupportedLanguage } from '../types';
import { 
  X, 
  SlidersHorizontal, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Send, 
  CornerDownRight, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { formatRealTimestamp } from '../lib/timeUtils';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
  comments: Comment[];
  currentUser: User | null;
  selectedLanguage?: SupportedLanguage;
  onVoteComment: (commentId: string, direction: 'up' | 'down') => void;
  onAddComment: (postId: string, content: string, parentId?: string) => void;
  onRequireAuth: (message: string) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle,
  comments,
  currentUser,
  selectedLanguage,
  onVoteComment,
  onAddComment,
  onRequireAuth,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');
  const [showSortMenu, setShowSortMenu] = useState(false);

  if (!isOpen) return null;

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

  const totalCount = countAllComments(comments);

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handlePostMainComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!currentUser) {
      onRequireAuth('Sign in or create an account to comment.');
      return;
    }
    onAddComment(postId, commentText.trim());
    setCommentText('');
  };

  const handlePostReply = (parentId: string) => {
    if (!replyText.trim()) return;
    if (!currentUser) {
      onRequireAuth('Sign in or create an account to reply to comments.');
      return;
    }
    onAddComment(postId, replyText.trim(), parentId);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Dimmed Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-Up Bottom Sheet / Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] h-[85vh] bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Drag Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header Bar */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Post comments</h3>
            <span className="text-sm font-semibold text-slate-500 font-mono">
              {totalCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sort Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                title="Sort comments"
                aria-label="Sort comments"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-20">
                  <button
                    onClick={() => {
                      setSortBy('top');
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between ${
                      sortBy === 'top' ? 'text-slate-900 bg-slate-100 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Top comments</span>
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('newest');
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between ${
                      sortBy === 'newest' ? 'text-slate-900 bg-slate-100 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Newest first</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Close comments"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Comments Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 custom-scrollbar">
          {sortedComments.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center text-slate-400 gap-2">
              <MessageSquare className="w-10 h-10 text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700">No comments yet</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Be the first to share your thoughts on this post.
              </p>
            </div>
          ) : (
            sortedComments.map((comment) => (
              <div key={comment.id} className="flex gap-3 text-left">
                {/* User Avatar */}
                <img
                  src={comment.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={comment.author.username}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0 flex flex-col">
                  {/* Author Line */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700 hover:text-slate-900 transition-colors truncate">
                      {comment.author.handle.startsWith('@') ? comment.author.handle : `@${comment.author.handle.replace(/^u\//, '')}`}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-400 text-[11px]">
                      {formatRealTimestamp(comment.createdAt || comment.timestamp)}
                    </span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap leading-relaxed break-words">
                    {comment.content}
                  </p>

                  {/* Actions Row (Thumbs Up, Thumbs Down, Reply) */}
                  <div className="flex items-center gap-4 mt-2 text-slate-500 text-xs">
                    {/* Upvote */}
                    <button
                      onClick={() => onVoteComment(comment.id, 'up')}
                      className={`flex items-center gap-1.5 p-1 rounded-md transition-colors hover:text-slate-900 ${
                        comment.userVote === 'up' ? 'text-sky-600 font-bold' : ''
                      }`}
                      aria-label="Like comment"
                    >
                      <ThumbsUp className={`w-4 h-4 ${comment.userVote === 'up' ? 'fill-sky-600 text-sky-600' : ''}`} />
                      {comment.score > 0 && <span>{comment.score}</span>}
                    </button>

                    {/* Downvote */}
                    <button
                      onClick={() => onVoteComment(comment.id, 'down')}
                      className={`p-1 rounded-md transition-colors hover:text-slate-900 ${
                        comment.userVote === 'down' ? 'text-sky-600 font-bold' : ''
                      }`}
                      aria-label="Dislike comment"
                    >
                      <ThumbsDown className={`w-4 h-4 ${comment.userVote === 'down' ? 'fill-sky-600 text-sky-600' : ''}`} />
                    </button>

                    {/* Reply Button */}
                    <button
                      onClick={() => {
                        setReplyingToId(replyingToId === comment.id ? null : comment.id);
                        setReplyText('');
                      }}
                      className="p-1 rounded-md transition-colors hover:text-slate-900 font-medium"
                      aria-label="Reply to comment"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* In-line Reply Input Box */}
                  {replyingToId === comment.id && (
                    <div className="mt-3 flex gap-2 items-center">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.author.handle}...`}
                        className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handlePostReply(comment.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handlePostReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => setReplyingToId(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Nested Replies with Curved Branch (Matching Screenshot 2) */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors py-0.5"
                      >
                        <span>
                          {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                        {expandedReplies[comment.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedReplies[comment.id] && (
                        <div className="mt-2 pl-3 border-l-2 border-slate-200 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2.5 text-left">
                              <img
                                src={reply.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                alt={reply.author.username}
                                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-semibold text-slate-700">
                                    {reply.author.handle.startsWith('@') ? reply.author.handle : `@${reply.author.handle.replace(/^u\//, '')}`}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-400 text-[10px]">
                                    {formatRealTimestamp(reply.createdAt || reply.timestamp)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-800 mt-1 whitespace-pre-wrap leading-relaxed">
                                  {reply.content}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-slate-500 text-xs">
                                  <button
                                    onClick={() => {
                                      if (!currentUser) {
                                        onRequireAuth('Sign in or create an account to like comments.');
                                        return;
                                      }
                                      onVoteComment(reply.id, 'up');
                                    }}
                                    className={`flex items-center gap-1 p-0.5 hover:text-slate-900 ${
                                      reply.userVote === 'up' ? 'text-sky-600 font-bold' : ''
                                    }`}
                                  >
                                    <ThumbsUp className={`w-3.5 h-3.5 ${reply.userVote === 'up' ? 'fill-sky-600 text-sky-600' : ''}`} />
                                    {reply.score > 0 && <span className="text-[11px]">{reply.score}</span>}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!currentUser) {
                                        onRequireAuth('Sign in or create an account to vote on comments.');
                                        return;
                                      }
                                      onVoteComment(reply.id, 'down');
                                    }}
                                    className={`p-0.5 hover:text-slate-900 ${
                                      reply.userVote === 'down' ? 'text-sky-600 font-bold' : ''
                                    }`}
                                  >
                                    <ThumbsDown className={`w-3.5 h-3.5 ${reply.userVote === 'down' ? 'fill-sky-600 text-sky-600' : ''}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pinned Bottom Input Bar (Matching Screenshot 2) */}
        <form 
          onSubmit={handlePostMainComment}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-3"
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={currentUser?.username || 'User'}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />

          <div className="flex-1 flex items-center bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1.5 focus-within:border-sky-500 transition-colors">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Comment..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2 rounded-full bg-slate-900 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors flex-shrink-0"
            aria-label="Send comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
