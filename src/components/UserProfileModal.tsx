import React, { useState, useRef } from 'react';
import { User, Post } from '../types';
import { X, Award, Flame, Calendar, Edit3, Bookmark, ShieldCheck, Sparkles, Check, LogOut, Camera, Upload, Trash2, Clock } from 'lucide-react';
import { DeletePostConfirmModal } from './DeletePostConfirmModal';
import { formatRealTimestamp, formatFullExactDateTime } from '../lib/timeUtils';

interface UserProfileModalProps {
  user: User;
  savedPosts: Post[];
  userPosts: Post[];
  onClose: () => void;
  onUpdateBio: (newBio: string) => void;
  onUpdateAvatar?: (newAvatar: string) => void;
  onSelectPost: (post: Post) => void;
  onDeletePost?: (postId: string) => Promise<void> | void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  savedPosts,
  userPosts,
  onClose,
  onUpdateBio,
  onUpdateAvatar,
  onSelectPost,
  onDeletePost,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'badges'>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const handleSaveBio = () => {
    onUpdateBio(bioText);
    setIsEditingBio(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateAvatar) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
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
          onUpdateAvatar(dataUrl);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-screen bg-slate-950 flex flex-col overflow-hidden m-0 p-0 rounded-none border-none">
      {/* Hidden File Input for Phone / Storage Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* Full-width Top Bar */}
      <header className="px-4 sm:px-8 py-3.5 border-b border-violet-900/40 bg-slate-950/95 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-sm sm:text-base font-bold text-slate-100">User Profile</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-900/60 border border-violet-700/50 text-violet-300 font-semibold">
            {user.username}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Full-screen Scrollable Content */}
      <main className="flex-1 w-full overflow-y-auto custom-scrollbar bg-slate-950">
        <div className="w-full max-w-2xl mx-auto flex flex-col pb-8">
          
          {/* Banner backdrop */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-violet-950 via-purple-950 to-pink-950 border-b border-violet-900/40 relative p-4 flex items-end">
          </div>

          {/* Profile Card Header */}
          <div className="px-4 sm:px-8 pb-4 relative flex flex-col gap-3 -mt-14">
          <div className="flex items-end justify-between">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
              title="Click to change profile picture from phone storage"
            >
              <img
                src={user.avatar}
                alt={user.username}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-950 border-2 border-violet-500 shadow-xl group-hover:opacity-80 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity">
                <Camera className="w-5 h-5 text-violet-300 mb-0.5" />
                <span>Upload</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white p-1 rounded-lg border border-slate-950 shadow-md">
                <Camera className="w-3 h-3" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded-full bg-violet-950/90 hover:bg-violet-900 border border-violet-700/60 text-violet-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Change Photo</span>
              </button>
              <span className="px-3 py-1 rounded-full bg-violet-950/80 border border-violet-700/60 text-pink-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>{user.karma} Karma</span>
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-3 py-1 rounded-full bg-rose-950/90 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                  title="Log out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-100">{user.username}</h2>
              {user.gender && user.gender !== 'prefer_not_to_say' && (
                <span className="capitalize px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[10px] font-semibold">
                  {user.gender}
                </span>
              )}
            </div>
            <span className="text-xs text-violet-400 font-mono">{user.handle}</span>
          </div>

          {/* Bio Box */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-violet-900/30 text-xs text-slate-300 relative group">
            {isEditingBio ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={bioText || ''}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-slate-950 text-slate-100 border border-violet-700/50 focus:outline-none"
                  rows={2}
                />
                <button
                  onClick={handleSaveBio}
                  className="self-end px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Save Bio
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <p className="leading-relaxed">{user.bio}</p>
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="p-1 text-slate-400 hover:text-violet-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Joined date */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-violet-400" />
            <span>Member since {user.joinedDate}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-violet-900/30 px-6 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'posts'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            My Posts ({userPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'saved'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Saved Items ({savedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'badges'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Badges ({user.badges.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3">
          {activeTab === 'posts' && (
            userPosts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                You haven't published any posts yet.
              </div>
            ) : (
              userPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    onSelectPost(post);
                    onClose();
                  }}
                  className="group/item p-3.5 rounded-xl bg-slate-900/80 border border-violet-900/30 hover:border-violet-600/50 cursor-pointer flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-violet-400 font-bold">{post.subBuvakiName}</span>
                      {post.flair && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-violet-950/80 text-violet-300 border border-violet-800/40">
                          {post.flair}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 truncate group-hover/item:text-violet-200 transition-colors">
                      {post.title}
                    </h4>
                    <span 
                      className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors cursor-help inline-flex items-center gap-1"
                      title={formatFullExactDateTime(post.createdAt || post.timestamp)}
                    >
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      {post.score} upvotes • {formatRealTimestamp(post.createdAt || post.timestamp)}
                    </span>
                  </div>

                  {/* Dustbin Delete Button (Matching User's Pink Marker Diagram) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPostToDelete(post);
                    }}
                    className="w-9 h-9 rounded-xl bg-rose-950/40 hover:bg-rose-900/80 border border-rose-800/40 hover:border-rose-500 text-rose-400 hover:text-rose-200 flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
                    title="Delete this post"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              ))
            )
          )}

          {activeTab === 'saved' && (
            savedPosts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No saved posts. Click the bookmark icon on any post to save it here!
              </div>
            ) : (
              savedPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    onSelectPost(post);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-slate-900/80 border border-violet-900/30 hover:border-violet-600/50 cursor-pointer flex flex-col gap-1"
                >
                  <span className="text-[10px] text-emerald-400 font-bold">{post.subBuvakiName}</span>
                  <h4 className="text-xs font-bold text-slate-200">{post.title}</h4>
                  <span 
                    className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors cursor-help inline-flex items-center gap-1"
                    title={formatFullExactDateTime(post.createdAt || post.timestamp)}
                  >
                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                    {post.score} upvotes • {formatRealTimestamp(post.createdAt || post.timestamp)}
                  </span>
                </div>
              ))
            )
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 gap-3">
              {user.badges.map((badge) => (
                <div key={badge} className="p-3 rounded-2xl bg-slate-900 border border-violet-900/40 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-violet-950 border border-violet-700/50 text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-100">{badge}</span>
                    <span className="text-[10px] text-slate-400">Verified Buvaki Distinction</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

          {/* Modal Footer with Logout */}
          {onLogout && (
            <div className="p-4 bg-slate-900/90 border border-violet-900/40 rounded-2xl flex items-center justify-between gap-3 mt-4">
              <span className="text-[11px] text-slate-400">
                Logged in as <strong className="text-slate-200">{user.username}</strong>
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-rose-950/90 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Post Delete Confirmation Modal */}
      {postToDelete && (
        <DeletePostConfirmModal
          post={postToDelete}
          isOpen={!!postToDelete}
          onClose={() => setPostToDelete(null)}
          onConfirmDelete={async (postId) => {
            if (onDeletePost) {
              await onDeletePost(postId);
            }
            setPostToDelete(null);
          }}
        />
      )}
    </div>
  );
};
