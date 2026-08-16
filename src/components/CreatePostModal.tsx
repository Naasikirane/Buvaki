import React, { useState, useRef } from 'react';
import { SubBuvaki, Post } from '../types';
import { 
  X, 
  FileText, 
  Image as ImageIcon, 
  Link2, 
  BarChart2, 
  Sparkles, 
  Plus, 
  Trash2, 
  Upload, 
  Smartphone, 
  Globe, 
  Youtube, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { getYouTubeEmbedUrl, isYouTubeUrl, processImageFile } from '../lib/mediaUtils';
import { CommunityIcon } from './CommunityIcon';

interface CreatePostModalProps {
  subBuvakis: SubBuvaki[];
  selectedSubId?: string | null;
  onClose: () => void;
  onSubmitPost: (newPostData: Partial<Post>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  subBuvakis,
  selectedSubId,
  onClose,
  onSubmitPost,
}) => {
  const [subId, setSubId] = useState(selectedSubId || subBuvakis[0]?.id || 'general');
  const [postType, setPostType] = useState<'text' | 'image' | 'link' | 'poll'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Image state
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSize, setImageFileSize] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link state
  const [linkUrl, setLinkUrl] = useState('');
  const [flair, setFlair] = useState('Discussion');
  const [tagsInput, setTagsInput] = useState('creative, tech, social');

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);

  const handleFileSelect = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPEG, PNG, WEBP, GIF, SVG)');
      return;
    }

    setImageError(null);
    setIsProcessingImage(true);
    setImageFileName(file.name);
    setImageFileSize((file.size / 1024).toFixed(1) + ' KB');

    try {
      const processedBase64 = await processImageFile(file);
      setImagePreview(processedBase64);
      setImageUrl(processedBase64);
    } catch (err) {
      console.error('Image upload failed:', err);
      setImageError('Failed to load image from device. Please try another image.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setImageUrl('');
    setImageFileName('');
    setImageFileSize('');
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`]);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenSub = subBuvakis.find((s) => s.id === subId);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const postData: Partial<Post> = {
      subBuvakiId: subId,
      subBuvakiName: chosenSub?.displayName || 'b/general',
      title: title.trim(),
      content: content.trim(),
      type: postType,
      flair,
      tags,
    };

    if (postType === 'image') {
      postData.imageUrl = (imagePreview || imageUrl).trim() || 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80';
    } else if (postType === 'link') {
      postData.linkUrl = linkUrl.trim() || 'https://buvaki.net';
    } else if (postType === 'poll') {
      postData.poll = {
        question: pollQuestion.trim() || title.trim(),
        options: pollOptions.map((opt, i) => ({
          id: `opt_${Date.now()}_${i}`,
          text: opt.trim() || `Choice ${i + 1}`,
          votes: 0,
        })),
        totalVotes: 0,
      };
    }

    onSubmitPost(postData);
    onClose();
  };

  const isYouTube = isYouTubeUrl(linkUrl);
  const ytEmbedUrl = getYouTubeEmbedUrl(linkUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-violet-900/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-900/30 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h2 className="text-base font-bold text-slate-100">Create Buvaki Post</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
          
          {/* Sub-Buvaki Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-violet-300">Choose Community</label>
              {subBuvakis.find(s => s.id === subId) && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <CommunityIcon sub={subBuvakis.find(s => s.id === subId)} size="xs" />
                  <span className="font-semibold text-violet-300">
                    {subBuvakis.find(s => s.id === subId)?.displayName}
                  </span>
                </div>
              )}
            </div>
            <select
              value={subId}
              onChange={(e) => setSubId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs font-semibold text-slate-200 focus:outline-none focus:border-violet-500"
            >
              {subBuvakis.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.displayName} — {sub.description.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          {/* Type Selector Tabs */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-violet-900/40">
            <button
              type="button"
              onClick={() => setPostType('text')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                postType === 'text' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Text
            </button>
            <button
              type="button"
              onClick={() => setPostType('image')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                postType === 'image' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Photo / Media
            </button>
            <button
              type="button"
              onClick={() => setPostType('link')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                postType === 'link' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" /> Link / YouTube
            </button>
            <button
              type="button"
              onClick={() => setPostType('poll')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                postType === 'poll' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Poll
            </button>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-violet-300">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a descriptive title..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Dynamic Content depending on postType */}
          {postType === 'text' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-violet-300">Body Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, story, tips, or discussion topic..."
                rows={5}
                className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          )}

          {/* Image / Media Uploading (Device storage upload + web URL) */}
          {postType === 'image' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-violet-400" />
                  <span>Choose Image Source</span>
                </label>
                
                <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-violet-900/40">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      imageMode === 'upload'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>From Phone / Device</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      imageMode === 'url'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>Image URL</span>
                  </button>
                </div>
              </div>

              {/* OPTION 1: Upload directly from Device / Phone Storage */}
              {imageMode === 'upload' && (
                <div className="flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    className="hidden"
                  />

                  {!imagePreview ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 text-center ${
                        isDragging
                          ? 'border-violet-400 bg-violet-950/40 scale-[1.01]'
                          : 'border-violet-900/60 hover:border-violet-500 bg-slate-900/40 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-violet-950 border border-violet-700/60 flex items-center justify-center text-violet-400 shadow-md">
                        <Upload className="w-6 h-6" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-200">
                          {isDragging ? 'Drop photo here to upload' : 'Click to choose image from your phone or device'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Supports PNG, JPG, WEBP, GIF, SVG or live camera capture
                        </p>
                      </div>

                      <button
                        type="button"
                        className="mt-1 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Browse Device Storage</span>
                      </button>
                    </div>
                  ) : (
                    /* Image preview once selected from phone */
                    <div className="relative rounded-2xl overflow-hidden border border-violet-800/60 bg-slate-950 group">
                      <img
                        src={imagePreview}
                        alt="Upload preview"
                        className="w-full max-h-72 object-contain bg-slate-950/80"
                      />

                      {/* Overlay Bar */}
                      <div className="p-3 bg-slate-900/90 border-t border-violet-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {imageFileName || 'Uploaded Photo'}
                          </span>
                          {imageFileSize && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({imageFileSize})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1 rounded-lg text-xs font-medium text-violet-300 hover:text-white bg-slate-800 hover:bg-violet-900 transition-colors"
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={handleClearImage}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isProcessingImage && (
                    <div className="flex items-center gap-2 text-xs text-violet-300">
                      <div className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                      <span>Optimizing photo for fast upload...</span>
                    </div>
                  )}

                  {imageError && (
                    <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{imageError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* OPTION 2: Enter Web URL */}
              {imageMode === 'url' && (
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value.trim() ? e.target.value.trim() : null);
                    }}
                    placeholder="https://images.unsplash.com/photo-... or any image URL"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                  
                  {imageUrl.trim() && (
                    <div className="rounded-xl overflow-hidden border border-violet-900/40 max-h-48 bg-slate-950 mt-1">
                      <img
                        src={imageUrl}
                        alt="URL Preview"
                        className="w-full h-48 object-cover"
                        onError={() => setImageError('Could not load image from this URL. Please check the link.')}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Optional Caption */}
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-xs font-bold text-violet-300">Photo Caption / Story (Optional)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a caption or tell the story behind this shot..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}

          {/* Link / YouTube Posting */}
          {postType === 'link' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-violet-400" />
                  <span>Web Link or YouTube Video URL</span>
                </label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... or https://example.com/article"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* YouTube Detection & Live Embed Preview */}
              {isYouTube && ytEmbedUrl && (
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-violet-800/60 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
                    <Youtube className="w-4 h-4 text-rose-500" />
                    <span>YouTube Video Detected (Live Player Embed)</span>
                  </div>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-violet-900/40 shadow-inner">
                    <iframe
                      src={ytEmbedUrl}
                      title="YouTube video preview"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-violet-300">Link Description / Summary</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Why is this link interesting? Add your commentary..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}

          {/* Poll Component */}
          {postType === 'poll' && (
            <div className="flex flex-col gap-3 p-3 rounded-xl bg-slate-900 border border-violet-900/40">
              <label className="text-xs font-bold text-violet-300">Poll Question</label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Question (defaults to post title)"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-violet-900/30 text-xs text-slate-100"
              />

              <label className="text-xs font-bold text-violet-300 mt-1">Options</label>
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[idx] = e.target.value;
                      setPollOptions(updated);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 p-2 rounded-lg bg-slate-950 border border-violet-900/30 text-xs text-slate-100"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePollOption(idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="self-start text-xs text-violet-400 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Choice
                </button>
              )}
            </div>
          )}

          {/* Flair & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-violet-300">Flair</label>
              <select
                value={flair}
                onChange={(e) => setFlair(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-200"
              >
                <option value="Discussion">Discussion</option>
                <option value="Photography">Photography</option>
                <option value="Video / Media">Video / Media</option>
                <option value="Showcase">Showcase</option>
                <option value="Tech & AI">Tech & AI</option>
                <option value="Community Poll">Community Poll</option>
                <option value="Announcement">Announcement</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-violet-300">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="photography, youtube, tech"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-violet-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isProcessingImage}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-violet-600/20 active:scale-95 transition-all"
            >
              Publish Post
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

