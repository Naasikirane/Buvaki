import React, { useState } from 'react';
import { Post, User, SupportedLanguage } from '../types';
import { getTranslation } from '../lib/translations';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  Award,
  Pin,
  Sparkles,
  Languages,
  RotateCcw,
  Youtube,
  Play
} from 'lucide-react';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '../lib/mediaUtils';
import { CommunityIcon } from './CommunityIcon';

interface PostCardProps {
  post: Post;
  currentUser: User;
  selectedLanguage?: SupportedLanguage;
  onVote: (postId: string, direction: 'up' | 'down') => void;
  onSelectPost: (post: Post) => void;
  onToggleSave: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  selectedLanguage,
  onVote,
  onSelectPost,
  onToggleSave,
  onVotePoll,
}) => {
  const t = getTranslation(selectedLanguage?.code || 'en');
  const [copied, setCopied] = useState(false);
  const [awarded, setAwarded] = useState(false);

  // AI Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [translatedLang, setTranslatedLang] = useState('');

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isTranslated) {
      // Toggle back to original
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
      console.error('Translation error:', err);
      // Fallback
      setTranslatedTitle(`[${targetLang}] ${post.title}`);
      setTranslatedContent(post.content ? `[${targetLang}] ${post.content}` : '');
      setTranslatedLang(targetLang);
      setIsTranslated(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAward = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAwarded(true);
    setTimeout(() => setAwarded(false), 2500);
  };

  return (
    <article 
      onClick={() => onSelectPost(post)}
      className="group relative rounded-2xl bg-slate-900/80 border border-violet-900/30 hover:border-violet-600/50 p-4 sm:p-5 transition-all duration-200 hover:shadow-xl hover:shadow-violet-950/20 cursor-pointer overflow-hidden"
    >
      {/* Pinned Indicator */}
      {post.isPinned && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-400 mb-2">
          <Pin className="w-3.5 h-3.5 fill-pink-400" />
          <span>Pinned Post</span>
        </div>
      )}

      <div className="flex gap-3 sm:gap-4">
        
        {/* Voting Pillar (Desktop/Tablet) */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="flex flex-col items-center justify-start gap-1 p-1 rounded-xl bg-slate-950/60 border border-violet-900/30 w-9 sm:w-10 h-fit"
        >
          <button
            onClick={() => onVote(post.id, 'up')}
            className={`p-1 rounded-lg transition-colors ${
              post.userVote === 'up'
                ? 'text-pink-400 bg-pink-950/60'
                : 'text-slate-400 hover:text-pink-400 hover:bg-slate-800/50'
            }`}
            aria-label="Upvote"
          >
            <ArrowBigUp className={`w-5 h-5 ${post.userVote === 'up' ? 'fill-pink-400' : ''}`} />
          </button>

          <span className={`text-xs font-black font-mono ${
            post.userVote === 'up' 
              ? 'text-pink-400' 
              : post.userVote === 'down' 
              ? 'text-rose-400' 
              : 'text-slate-200'
          }`}>
            {post.score}
          </span>

          <button
            onClick={() => onVote(post.id, 'down')}
            className={`p-1 rounded-lg transition-colors ${
              post.userVote === 'down'
                ? 'text-rose-400 bg-rose-950/60'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/50'
            }`}
            aria-label="Downvote"
          >
            <ArrowBigDown className={`w-5 h-5 ${post.userVote === 'down' ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

        {/* Post Main Body */}
        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
          
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-violet-300 hover:underline px-2 py-0.5 rounded-md bg-violet-950/80 border border-violet-800/40 flex items-center gap-1.5">
              <CommunityIcon subId={post.subBuvakiId} name={post.subBuvakiName} size="xs" containerClassName="w-4 h-4 rounded-sm border-none bg-transparent" />
              <span>{post.subBuvakiName}</span>
            </span>
            <span className="text-slate-500">•</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="w-4 h-4 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="font-medium hover:text-violet-300 transition-colors">
                {post.author.handle}
              </span>
            </div>
            <span className="text-slate-500">•</span>
            <span className="text-slate-500 text-[11px]">{post.timestamp}</span>

            {/* Flair Badge */}
            {post.flair && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-700/50 text-pink-300 text-[10px] font-semibold">
                {post.flair}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1">
            {isTranslated && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[10px] font-semibold mb-1">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                <span>AI Translated ({translatedLang})</span>
              </div>
            )}

            <h2 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-violet-200 transition-colors leading-snug">
              {isTranslated ? translatedTitle : post.title}
            </h2>
          </div>

          {/* Body Content */}
          {post.content && (
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
              {isTranslated ? translatedContent : post.content}
            </p>
          )}

          {/* Image Type Attachment */}
          {post.type === 'image' && post.imageUrl && (
            <div 
              onClick={(e) => {
                // If user clicks image, let it open detail modal
              }}
              className="mt-1 rounded-2xl overflow-hidden border border-violet-900/40 bg-slate-950 max-h-[440px] flex items-center justify-center"
            >
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full max-h-[440px] object-contain group-hover:scale-[1.01] transition-transform duration-300 bg-slate-950"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          )}

          {/* Link Type Attachment - Handles both YouTube Embeds & External URLs */}
          {post.type === 'link' && post.linkUrl && (
            isYouTubeUrl(post.linkUrl) && getYouTubeEmbedUrl(post.linkUrl) ? (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="mt-2 rounded-2xl overflow-hidden border border-violet-900/50 bg-slate-950 shadow-md"
              >
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(post.linkUrl)!}
                    title={post.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-2.5 bg-slate-900/80 border-t border-violet-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-pink-400 font-bold">
                    <Youtube className="w-4 h-4 text-rose-500" />
                    <span>YouTube Video</span>
                  </div>
                  <a
                    href={post.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-violet-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-1 flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-violet-900/40 hover:border-violet-500/60 group/link transition-colors"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-semibold text-violet-300 truncate">
                    {post.linkUrl}
                  </span>
                  <span className="text-[10px] text-slate-400">External Web Resource / Article</span>
                </div>
                <ExternalLink className="w-4 h-4 text-violet-400 group-hover/link:text-pink-400 transition-colors flex-shrink-0" />
              </a>
            )
          )}

          {/* Poll Type Attachment */}
          {post.type === 'poll' && post.poll && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="mt-2 p-3 sm:p-4 rounded-xl bg-slate-950/90 border border-violet-900/40 flex flex-col gap-2.5"
            >
              <span className="text-xs font-bold text-violet-200">
                {post.poll.question}
              </span>
              <div className="flex flex-col gap-2">
                {post.poll.options.map((option) => {
                  const isVoted = post.poll?.userVotedOptionId === option.id;
                  const total = post.poll?.totalVotes || 1;
                  const pct = Math.round((option.votes / total) * 100);

                  return (
                    <button
                      key={option.id}
                      onClick={() => onVotePoll(post.id, option.id)}
                      className={`relative w-full text-left p-2.5 rounded-lg border transition-all overflow-hidden flex items-center justify-between ${
                        isVoted
                          ? 'border-emerald-500 bg-emerald-950/30'
                          : 'border-violet-900/40 hover:border-violet-600/60 bg-slate-900/60'
                      }`}
                    >
                      {/* Percentage fill bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-violet-600/20 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      
                      <div className="relative z-10 flex items-center gap-2">
                        {isVoted && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                        <span className="text-xs font-medium text-slate-200">
                          {option.text}
                        </span>
                      </div>

                      <span className="relative z-10 text-[11px] font-bold font-mono text-violet-300">
                        {pct}% ({option.votes})
                      </span>
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-500 self-end font-mono">
                {post.poll.totalVotes} total votes
              </span>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {post.tags.map((tag) => (
                <span key={tag} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-violet-900/20 text-xs text-slate-400">
            
            {/* Comments trigger */}
            <div className="flex items-center gap-1.5 hover:text-violet-300 font-medium">
              <MessageSquare className="w-4 h-4" />
              <span>{post.commentCount} {t.comments}</span>
            </div>

            <div className="flex items-center gap-3">
              
              {/* AI Translate Button */}
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className={`flex items-center gap-1.5 transition-all text-xs font-medium px-2 py-0.5 rounded-lg border ${
                  isTranslated
                    ? 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-indigo-300 hover:border-indigo-800/60'
                }`}
                title="Translate post"
              >
                {isTranslating ? (
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                ) : isTranslated ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.originalText}</span>
                  </>
                ) : (
                  <>
                    <Languages className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.translatePost}</span>
                  </>
                )}
              </button>

              {/* Award button */}
              <button
                onClick={handleAward}
                className="flex items-center gap-1 hover:text-amber-400 transition-colors relative"
                title="Award post"
              >
                <Award className={`w-4 h-4 ${awarded ? 'text-amber-400 animate-bounce' : ''}`} />
                {awarded && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold shadow">
                    {t.awarded}!
                  </span>
                )}
              </button>

              {/* Bookmark Save */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(post.id);
                }}
                className={`flex items-center gap-1 transition-colors ${
                  post.isSaved ? 'text-emerald-400' : 'hover:text-emerald-300'
                }`}
                title="Save Post"
              >
                <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-emerald-400' : ''}`} />
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1 hover:text-violet-300 transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
                {copied && <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>}
              </button>

            </div>

          </div>

        </div>

      </div>
    </article>
  );
};
