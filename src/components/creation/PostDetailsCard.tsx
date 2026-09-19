import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Tag, 
  Sparkles, 
  Check, 
  Plus, 
  AlertCircle, 
  Film, 
  Save, 
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { PostFormatType } from './PostFormatCard';

interface PostDetailsCardProps {
  isShort?: boolean;
  isLong?: boolean;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  flair: string;
  setFlair: (flair: string) => void;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  postFormat: PostFormatType;
  thumbnailPreview: string | null;
  isSaving: boolean;
  uploadProgress: number;
  uploadStatusText: string;
  onBack: () => void;
  onClose: () => void;
  onSave: () => void;
}

const DEFAULT_FLAIRS = [
  'Discussion',
  'Gaming',
  'Anime',
  'Tutorial',
  'Creative',
  'News',
  'Meme',
  'General',
];

const SHORTS_FLAIRS = [
  'Shorts',
  'Trending',
  'Comedy',
  'Music',
  'Gaming',
  'Anime',
  'Dance',
  'Tutorial',
];

const LONGS_FLAIRS = [
  'Long Video',
  'Series',
  'Documentary',
  'Tutorial',
  'Gaming',
  'Podcast',
  'Anime',
  'Review',
  'Deep Dive',
  'Discussion',
];

export const PostDetailsCard: React.FC<PostDetailsCardProps> = ({
  isShort,
  isLong,
  title,
  setTitle,
  content,
  setContent,
  flair,
  setFlair,
  tags,
  setTags,
  postFormat,
  thumbnailPreview,
  isSaving,
  uploadProgress,
  uploadStatusText,
  onBack,
  onClose,
  onSave,
}) => {
  const [tagInput, setTagInput] = useState('');
  const [customFlairMode, setCustomFlairMode] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(`#${trimmed}`)) {
      setTags([...tags, `#${trimmed}`]);
      setTagInput('');
    }
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const isFormValid = title.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.96, x: -20 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="relative w-full max-w-[620px] bg-white rounded-[32px] shadow-2xl shadow-slate-900/15 border border-slate-200/80 overflow-hidden select-none"
    >
      {/* Left Gradient Strip Accent */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#22c55e] via-[#10b981] to-[#06b6d4]" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pl-8 sm:pl-10 pr-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-back-to-thumbnail"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {isShort ? 'Short Details' : isLong ? 'Long Video Details' : 'Post Details'}
            </h3>
            <p className="text-xs text-slate-500">
              {isShort
                ? "Provide title, body content, flair and tags for your Short"
                : isLong
                ? "Provide title, description, chapters, flair and tags for your Long Video"
                : 'Provide title, content, flair, and tags'}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-close-details"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Form Fields */}
      <div className="relative z-10 pl-8 sm:pl-10 pr-6 py-5 max-h-[500px] overflow-y-auto no-scrollbar flex flex-col gap-4">
        {/* 1. Title Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              {isShort
                ? 'Title of the Short *'
                : isLong
                ? 'Title of the Long Video *'
                : postFormat === 'video'
                ? 'Title of the Video *'
                : 'Title of the Post *'}
            </label>
            <span className={`text-[11px] ${title.length > 140 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
              {title.length}/150
            </span>
          </div>
          <input
            type="text"
            id="input-post-title"
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              isShort
                ? 'Give your Short a catchy title...'
                : isLong
                ? 'Give your long video an engaging title...'
                : postFormat === 'video'
                ? 'Give your video an engaging title...'
                : 'What is your post about?...'
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
          />
        </div>

        {/* 2. Body Content Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">
            {isShort
              ? 'Body Content (Optional)'
              : isLong
              ? 'Description & Chapters (Optional)'
              : 'Body Content (Optional)'}
          </label>
          <textarea
            rows={4}
            id="input-post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isShort
                ? 'Add short caption, description, sound info, or credits...'
                : isLong
                ? 'Add description, chapter timestamps (00:00 Intro), notes, or links...'
                : 'Add description, notes, context, or links (markdown supported)...'
            }
            className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
          />
        </div>

        {/* 4. Flair Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Flair</label>
            <button
              type="button"
              onClick={() => setCustomFlairMode(!customFlairMode)}
              className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              {customFlairMode ? 'Choose from list' : '+ Custom flair'}
            </button>
          </div>

          {customFlairMode ? (
            <input
              type="text"
              value={flair}
              onChange={(e) => setFlair(e.target.value)}
              placeholder="Type custom flair..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
            />
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {(isShort ? SHORTS_FLAIRS : isLong ? LONGS_FLAIRS : DEFAULT_FLAIRS).map((f) => {
                const isSelected = flair === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFlair(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Tags Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Tags</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                placeholder="Type tag and press Enter (e.g. video, anime, tutorial)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Active Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200/80"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Upload Progress notice if file is still uploading in background */}
        {isSaving && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col gap-1.5 text-xs text-emerald-800">
            <div className="flex justify-between font-bold">
              <span>{uploadStatusText || 'Saving to Firebase Cloud Storage...'}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer with "Save Video" / "Publish Post" Button */}
      <div className="relative z-10 flex items-center justify-between pl-8 sm:pl-10 pr-6 py-4 border-t border-slate-100 bg-slate-50/50">
        <button
          type="button"
          onClick={onBack}
          disabled={isSaving}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer disabled:opacity-50"
        >
          Back
        </button>

        <button
          type="button"
          id={isShort ? "btn-save-short" : isLong ? "btn-save-long" : "btn-save-video"}
          disabled={!isFormValid || isSaving}
          onClick={onSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
            isFormValid && !isSaving
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>
            {isSaving
              ? 'Saving...'
              : isShort
              ? 'Save Short'
              : isLong
              ? 'Save Long Video'
              : postFormat === 'video'
              ? 'Save Video'
              : 'Publish Post'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};
