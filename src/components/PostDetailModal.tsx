import React, { useState } from 'react';
import { Post, Comment, User, SupportedLanguage } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  X, 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Send, 
  Bookmark, 
  Share2, 
  Award, 
  CornerDownRight, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Languages, 
  RotateCcw,
  Youtube,
  ExternalLink,
  Maximize2,
  Film,
  Trash2,
  Clock
} from 'lucide-react';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../lib/mediaUtils';
import { BuvakiVideoPlayer } from './BuvakiVideoPlayer';
import { CommunityIcon } from './CommunityIcon';
import { DeletePostConfirmModal } from './DeletePostConfirmModal';
import { formatRealTimestamp, formatFullExactDateTime } from '../lib/timeUtils';

interface PostDetailModalProps {
  post: Post | null;
  comments: Comment[];
  currentUser: User | null;
  selectedLanguage?: SupportedLanguage;
  onClose: () => void;
  onVotePost: (postId: string, direction: 'up' | 'down') => void;
  onVoteComment: (commentId: string, direction: 'up' | 'down') => void;
  onAddComment: (postId: string, content: string, parentId?: string) => void;
  onToggleSave: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onDeletePost?: (postId: string) => Promise<void> | void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  comments,
  currentUser,
  selectedLanguage,
  onClose,
  onVotePost,
  onVoteComment,
  onAddComment,
  onToggleSave,
  onVotePoll,
  onDeletePost,
}) => {
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  if (!post) return null;

  const isAuthor = currentUser && (currentUser.id === post.author.id || currentUser.handle === post.author.handle);
  const t = getTranslation(selectedLanguage?.code || 'en');
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // AI Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [translatedLang, setTranslatedLang] = useState('');

  const handleTranslate = async () => {
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
      setTranslatedLang(targetLang);
      setIsTranslated(true);
    } catch (err) {
      console.error('Modal Translation error:', err);
      setTranslatedTitle(`[${targetLang}] ${post.title}`);
      setTranslatedContent(post.content ? `[${targetLang}] ${post.content}` : '');
      setTranslatedLang(targetLang);
      setIsTranslated(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleMainCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(post.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleReplySubmit = (parentId: string) => {
    if (!replyText.trim()) return;
    onAddComment(post.id, replyText.trim(), parentId);
    setReplyText('');
    setReplyingToId(null);
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isReplying = replyingToId === comment.id;

    return (
      <div key={comment.id} className={`flex flex-col gap-2 ${depth > 0 ? 'ml-4 sm:ml-6 pl-3 border-l-2 border-violet-900/30' : ''}`}>
        
        {/* Comment Header & Content */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-violet-900/20 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <img
                src={comment.author.avatar}
                alt={comment.author.username}
                className="w-5 h-5 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-violet-200">{comment.author.handle}</span>
              <span className="text-slate-500">•</span>
              <span 
                className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors cursor-help inline-flex items-center gap-1"
                title={formatFullExactDateTime(comment.createdAt || comment.timestamp)}
              >
                <Clock className="w-2.5 h-2.5 text-slate-500" />
                {formatRealTimestamp(comment.createdAt || comment.timestamp)}
              </span>
            </div>

            {/* Comment Voting */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-violet-900/30">
              <button
                onClick={() => onVoteComment(comment.id, 'up')}
                className={`p-0.5 hover:text-fuchsia-400 ${comment.userVote === 'up' ? 'text-fuchsia-400 font-bold' : 'text-slate-400'}`}
              >
                ▲
              </button>
              <span className="text-[11px] font-mono text-slate-200 font-bold px-1">{comment.score}</span>
              <button
                onClick={() => onVoteComment(comment.id, 'down')}
                className={`p-0.5 hover:text-rose-400 ${comment.userVote === 'down' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}
              >
                ▼
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
            {comment.content}
          </p>

          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
            <button
              onClick={() => setReplyingToId(isReplying ? null : comment.id)}
              className="flex items-center gap-1 hover:text-violet-300 font-medium"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        </div>

        {/* Reply Input Box */}
        {isReplying && (
          <div className="ml-4 p-3 rounded-xl bg-slate-950 border border-violet-700/50 flex flex-col gap-2">
            <textarea
              value={replyText || ''}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Replying to ${comment.author.handle}...`}
              rows={2}
              className="w-full p-2 text-xs rounded-lg bg-slate-900 text-slate-100 border border-slate-800 focus:outline-none focus:border-violet-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setReplyingToId(null)}
                className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReplySubmit(comment.id)}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Post Reply
              </button>
            </div>
          </div>
        )}

        {/* Nested Child Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-screen bg-slate-950 flex flex-col overflow-hidden m-0 p-0 rounded-none border-none">
      {/* Full-width Header Bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-violet-900/40 bg-slate-950/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-violet-300 text-xs sm:text-sm px-2.5 py-1 rounded-xl bg-violet-950 border border-violet-800/40 flex items-center gap-2">
            <CommunityIcon subId={post.subBuvakiId} name={post.subBuvakiName} size="xs" containerClassName="w-4 h-4 rounded-sm border-none bg-transparent" />
            <span>{post.subBuvakiName}</span>
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">Thread Discussion</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Body Content Scrollable Canvas */}
      <main className="flex-1 w-full overflow-y-auto custom-scrollbar bg-slate-950">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          
          {/* Main Post Section */}
          <div className="flex gap-4">
            {/* Voting */}
            <div className="flex flex-col items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-violet-900/30 h-fit">
              <button
                onClick={() => onVotePost(post.id, 'up')}
                className={`p-1.5 rounded-lg ${post.userVote === 'up' ? 'text-fuchsia-400 bg-fuchsia-950/60' : 'text-slate-400'}`}
              >
                <ArrowBigUp className="w-6 h-6" />
              </button>
              <span className="text-sm font-bold font-mono text-slate-100">{post.score}</span>
              <button
                onClick={() => onVotePost(post.id, 'down')}
                className={`p-1.5 rounded-lg ${post.userVote === 'down' ? 'text-rose-400 bg-rose-950/60' : 'text-slate-400'}`}
              >
                <ArrowBigDown className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-bold text-violet-200">{post.author.handle}</span>
                  <span>•</span>
                  <span 
                    className="hover:text-slate-200 transition-colors cursor-help inline-flex items-center gap-1"
                    title={formatFullExactDateTime(post.createdAt || post.timestamp)}
                  >
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatRealTimestamp(post.createdAt || post.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className={`flex items-center gap-1.5 transition-all text-xs font-medium px-2.5 py-1 rounded-xl border ${
                      isTranslated
                        ? 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-300'
                    }`}
                  >
                    {isTranslating ? (
                      <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                    ) : isTranslated ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Original Text</span>
                      </>
                    ) : (
                      <>
                        <Languages className="w-3.5 h-3.5 text-indigo-400" />
                        <span>AI Translate</span>
                      </>
                    )}
                  </button>

                  {/* Dustbin Delete Button for Author */}
                  {isAuthor && onDeletePost && (
                    <button
                      onClick={() => setIsConfirmDeleteOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 hover:text-rose-100 text-xs font-bold transition-all"
                      title="Delete this post"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {isTranslated && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>AI Translated to {translatedLang}</span>
                </div>
              )}

              <h1 className="text-xl font-black text-slate-100 leading-snug">
                {isTranslated ? translatedTitle : post.title}
              </h1>

              {post.content && (
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {isTranslated ? translatedContent : post.content}
                </p>
              )}

              {/* Image Rendering */}
              {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-violet-900/40 bg-slate-950 flex flex-col">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full max-h-[600px] object-contain bg-slate-950"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-2.5 bg-slate-900/60 border-t border-violet-900/30 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px] font-medium text-violet-300">Image Attachment</span>
                    <a
                      href={post.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-violet-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <span>Open Full Size</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Video Player Rendering for Feed Video Posts */}
              {post.type === 'video' && post.videoUrl && (
                <div className="rounded-2xl overflow-hidden border border-violet-900/40 bg-black flex flex-col shadow-lg">
                  {isYouTubeUrl(post.videoUrl) && getYouTubeEmbedUrl(post.videoUrl) ? (
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={getYouTubeEmbedUrl(post.videoUrl)!}
                        title={post.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="relative w-full bg-black flex items-center justify-center max-h-[640px]">
                      <BuvakiVideoPlayer
                        src={post.videoUrl}
                        poster={post.imageUrl}
                        className="max-h-[640px] rounded-2xl"
                        title={post.title}
                      />
                    </div>
                  )}
                  <div className="p-2.5 bg-slate-900/60 border-t border-violet-900/30 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px] font-medium text-pink-300 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Video Post
                    </span>
                    {post.videoUrl && (
                      <a
                        href={post.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-violet-400 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <span>Open Source Media</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* YouTube Embed Player & Link Rendering */}
              {post.linkUrl && (
                isYouTubeUrl(post.linkUrl) && getYouTubeEmbedUrl(post.linkUrl) ? (
                  <div className="rounded-2xl overflow-hidden border border-violet-900/50 bg-slate-950 shadow-lg">
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={getYouTubeEmbedUrl(post.linkUrl)!}
                        title={post.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-3 bg-slate-900/90 border-t border-violet-900/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-pink-400 font-bold">
                        <Youtube className="w-4 h-4 text-rose-500" />
                        <span>Embedded YouTube Player</span>
                      </div>
                      <a
                        href={post.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-violet-300 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <span>Watch on YouTube</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-violet-900/40 hover:border-violet-500/60 group/link transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-xs font-semibold text-violet-300 truncate">
                        {post.linkUrl}
                      </span>
                      <span className="text-[11px] text-slate-400">External Web Resource / Article</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-violet-400 group-hover/link:text-pink-400 transition-colors flex-shrink-0" />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Add Comment Input Form */}
          <form onSubmit={handleMainCommentSubmit} className="p-4 rounded-2xl bg-slate-900/90 border border-violet-900/40 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-violet-300 font-semibold">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>{t.writeComment} {currentUser ? <span className="text-emerald-400">{currentUser.handle}</span> : <span className="text-pink-400 font-bold">(Sign in to post)</span>}</span>
              </div>
            </div>
            <textarea
              value={newCommentText || ''}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={currentUser ? t.writeComment : 'Sign in to join the conversation and post a comment...'}
              rows={3}
              className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-950 border border-violet-900/40 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-violet-600/20"
              >
                <Send className="w-3.5 h-3.5" /> {currentUser ? t.submitComment : 'Sign In & Post'}
              </button>
            </div>
          </form>

          {/* Comments Tree */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-violet-300 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> {t.comments} ({comments.length})
            </h3>

            {comments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No comments yet. Be the first to start the vortex conversation!
              </div>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </div>

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {isAuthor && isConfirmDeleteOpen && (
        <DeletePostConfirmModal
          post={post}
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirmDelete={async (postId) => {
            if (onDeletePost) {
              await onDeletePost(postId);
            }
            setIsConfirmDeleteOpen(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};
