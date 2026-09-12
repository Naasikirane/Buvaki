import React, { useState } from 'react';
import { Post, User } from '../types';
import { 
  X, 
  Copy, 
  Share2, 
  Edit3, 
  Check, 
  MessageCircle, 
  Send,
  Mail
} from 'lucide-react';

interface ShareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  currentUser: User | null;
  onRepost?: (post: Post) => void;
}

export const ShareDrawer: React.FC<ShareDrawerProps> = ({
  isOpen,
  onClose,
  post,
  currentUser,
  onRepost,
}) => {
  const [copied, setCopied] = useState(false);
  const [repostedToast, setRepostedToast] = useState(false);

  if (!isOpen || !post) return null;

  const postUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/post/${post.id}` 
    : `https://buvaki.com/post/${post.id}`;
  
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(post.title || 'Check out this post on Buvaki');

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(postUrl);
      } else {
        const input = document.createElement('input');
        input.value = postUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleQuickShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content ? post.content.slice(0, 100) : post.title,
          url: postUrl,
        });
        onClose();
      } catch (err) {
        console.warn('Native share cancelled or failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleRepost = () => {
    if (onRepost) {
      onRepost(post);
    }
    setRepostedToast(true);
    setTimeout(() => {
      setRepostedToast(false);
      onClose();
    }, 1500);
  };

  const socialApps = [
    {
      name: 'Messages',
      iconBg: 'bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600',
      icon: (
        <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.18-1.31C8.61 21.49 10.26 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/>
        </svg>
      ),
      url: `sms:?&body=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'News Feed',
      iconBg: 'bg-[#1877F2]',
      icon: (
        <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Gmail',
      iconBg: 'bg-white',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.279 24 3.434 24 5.457z"/>
        </svg>
      ),
      url: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      iconBg: 'bg-[#25D366]',
      icon: (
        <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.201.3-.777.978-.953 1.179-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.424-1.496-.895-.798-1.5-1.784-1.675-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.3.301-.501.101-.2.05-.376-.025-.526-.075-.15-.677-1.631-.928-2.232-.244-.585-.492-.506-.677-.515l-.577-.01c-.201 0-.527.075-.802.376s-1.054 1.029-1.054 2.509 1.079 2.909 1.229 3.11c.15.2 2.124 3.243 5.145 4.548.719.311 1.28.497 1.718.636.723.23 1.381.197 1.901.12.579-.087 1.78-.728 2.03-1.431.251-.703.251-1.306.176-1.431-.076-.125-.276-.2-.577-.35zM12.004 21.996h-.002c-1.796 0-3.558-.484-5.101-1.398l-.366-.217-3.791.995 1.012-3.696-.238-.379c-1.006-1.6-1.537-3.46-1.537-5.367 0-5.514 4.486-10 10-10 2.671 0 5.182 1.04 7.071 2.929 1.889 1.889 2.929 4.4 2.929 7.071 0 5.514-4.486 10-10 10z"/>
        </svg>
      ),
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Messages',
      iconBg: 'bg-[#0084FF]',
      icon: (
        <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.745 6.616 4.472 8.652V24l4.088-2.244c1.09.301 2.247.464 3.44.464 6.627 0 12-4.975 12-11.109C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z"/>
        </svg>
      ),
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'X',
      iconBg: 'bg-black border border-white/20',
      icon: (
        <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-Up Bottom Sheet */}
      <div className="relative w-full max-w-md bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Drag Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Share</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal App Icons Row (Matching Screenshot 3) */}
        <div className="px-4 py-4 overflow-x-auto custom-scrollbar flex items-center gap-4 border-b border-slate-200">
          {socialApps.map((app, idx) => (
            <a
              key={idx}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setTimeout(onClose, 500)}
              className="flex flex-col items-center gap-1.5 min-w-[64px] group"
            >
              <div className={`w-13 h-13 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105 group-active:scale-95 ${app.iconBg}`}>
                {app.icon}
              </div>
              <span className="text-[11px] text-slate-700 group-hover:text-slate-900 truncate max-w-[68px]">
                {app.name}
              </span>
            </a>
          ))}
        </div>

        {/* Vertical Actions List (Matching Screenshot 3) */}
        <div className="py-2 flex flex-col">
          
          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="w-full px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-200 transition-colors">
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                {copied ? 'Link copied!' : 'Copy link'}
              </span>
              <span className="text-xs text-slate-500 truncate max-w-xs font-mono">
                {postUrl}
              </span>
            </div>
          </button>

          {/* Quick Share */}
          <button
            onClick={handleQuickShare}
            className="w-full px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-200 transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Quick Share</span>
              <span className="text-xs text-slate-500">Share to nearby devices or installed apps</span>
            </div>
          </button>

          {/* Repost on Buvaki */}
          <button
            onClick={handleRepost}
            className="w-full px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-200 transition-colors">
              <Edit3 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                {repostedToast ? 'Reposted to your feed!' : 'Repost on Buvaki'}
              </span>
              <span className="text-xs text-slate-500">Share with your followers on Buvaki</span>
            </div>
          </button>

        </div>

        {/* Toast confirmation */}
        {copied && (
          <div className="m-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center animate-in fade-in">
            ✓ Post link copied to clipboard!
          </div>
        )}

      </div>
    </div>
  );
};
