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
  AlertCircle,
  Clapperboard,
  Tv,
  Music,
  Video,
  Play,
  Clock,
  Layers,
  Camera,
  Film
} from 'lucide-react';
import { getYouTubeEmbedUrl, isYouTubeUrl, processImageFile, captureVideoFrame, formatFileSize, formatDuration } from '../lib/mediaUtils';
import { saveLocalMediaBlob } from '../lib/mediaStorage';
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
  const [mainTab, setMainTab] = useState<'posts' | 'shorts' | 'longs'>('posts');
  const [subId, setSubId] = useState(selectedSubId || subBuvakis[0]?.id || 'general');
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'link' | 'poll'>('text');
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

  // Feed Post Video state (Videos published under Posts appear in Feed view)
  const [postVideoMode, setPostVideoMode] = useState<'upload' | 'url'>('upload');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [postVideoPreview, setPostVideoPreview] = useState<string | null>(null);
  const [postVideoFileName, setPostVideoFileName] = useState<string>('');
  const [postVideoFileSize, setPostVideoFileSize] = useState<string>('');
  const [isProcessingPostVideo, setIsProcessingPostVideo] = useState<boolean>(false);
  const [postVideoError, setPostVideoError] = useState<string | null>(null);
  const [isDraggingPostVideo, setIsDraggingPostVideo] = useState<boolean>(false);
  const [postThumbnailPreview, setPostThumbnailPreview] = useState<string | null>(null);
  const postFileInputRef = useRef<HTMLInputElement>(null);

  // Shorts state
  const [shortVideoMode, setShortVideoMode] = useState<'upload' | 'url'>('upload');
  const [shortVideoUrl, setShortVideoUrl] = useState('');
  const [shortVideoPreview, setShortVideoPreview] = useState<string | null>(null);
  const [shortVideoFileName, setShortVideoFileName] = useState<string>('');
  const [shortMusicTitle, setShortMusicTitle] = useState('Original Audio - Buvaki Sound');
  const shortFileInputRef = useRef<HTMLInputElement>(null);

  // Longs state - default to device upload for first-class local file support
  const [longVideoMode, setLongVideoMode] = useState<'upload' | 'url'>('upload');
  const [longVideoUrl, setLongVideoUrl] = useState('');
  const [longVideoPreview, setLongVideoPreview] = useState<string | null>(null);
  const [longVideoFileName, setLongVideoFileName] = useState<string>('');
  const [longVideoFileSize, setLongVideoFileSize] = useState<string>('');
  const [isProcessingLongVideo, setIsProcessingLongVideo] = useState<boolean>(false);
  const [longVideoError, setLongVideoError] = useState<string | null>(null);
  const [isDraggingLongVideo, setIsDraggingLongVideo] = useState<boolean>(false);
  const longFileInputRef = useRef<HTMLInputElement>(null);
  const longVideoElementRef = useRef<HTMLVideoElement>(null);

  // Longs Thumbnail state - full device upload support
  const [longThumbnailMode, setLongThumbnailMode] = useState<'upload' | 'url'>('upload');
  const [longThumbnailUrl, setLongThumbnailUrl] = useState('');
  const [longThumbnailPreview, setLongThumbnailPreview] = useState<string | null>(null);
  const [longThumbnailFileName, setLongThumbnailFileName] = useState<string>('');
  const [longThumbnailFileSize, setLongThumbnailFileSize] = useState<string>('');
  const [isProcessingLongThumbnail, setIsProcessingLongThumbnail] = useState<boolean>(false);
  const [longThumbnailError, setLongThumbnailError] = useState<string | null>(null);
  const [isDraggingLongThumbnail, setIsDraggingLongThumbnail] = useState<boolean>(false);
  const longThumbnailFileInputRef = useRef<HTMLInputElement>(null);

  const [longDuration, setLongDuration] = useState('18:45');
  const [longQuality, setLongQuality] = useState('1080p 60fps');
  const [longCategory, setLongCategory] = useState('tech');

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

  const handleShortVideoFileSelect = async (file?: File | null) => {
    if (!file) return;
    const key = `short_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await saveLocalMediaBlob(key, file).catch(e => console.warn('Cache error:', e));
    const url = URL.createObjectURL(file);
    setShortVideoPreview(url);
    setShortVideoUrl(`local-media:${key}`);
    setShortVideoFileName(file.name);
  };

  // Feed Post Video Device Upload Handler
  const handlePostVideoFileSelect = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setPostVideoError('Please select a valid video file (MP4, WebM, MOV, MKV, AVI)');
      return;
    }

    setPostVideoError(null);
    setIsProcessingPostVideo(true);
    setPostVideoFileName(file.name);
    setPostVideoFileSize(formatFileSize(file.size));

    try {
      const key = `feed_vid_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await saveLocalMediaBlob(key, file).catch(e => console.warn('Cache error:', e));
      const url = URL.createObjectURL(file);
      setPostVideoPreview(url);
      setPostVideoUrl(`local-media:${key}`);

      const frameInfo = await captureVideoFrame(file, 1.0);
      if (frameInfo.thumbnailDataUrl) {
        setPostThumbnailPreview(frameInfo.thumbnailDataUrl);
      }
    } catch (err) {
      console.error('Post video processing note:', err);
      const url = URL.createObjectURL(file);
      setPostVideoPreview(url);
      setPostVideoUrl(url);
    } finally {
      setIsProcessingPostVideo(false);
    }
  };

  // Long Video Device Upload Handler
  const handleLongVideoFileSelect = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setLongVideoError('Please select a valid video file (MP4, WebM, MOV, MKV, AVI)');
      return;
    }

    setLongVideoError(null);
    setIsProcessingLongVideo(true);
    setLongVideoFileName(file.name);
    setLongVideoFileSize(formatFileSize(file.size));

    try {
      const key = `long_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await saveLocalMediaBlob(key, file).catch(e => console.warn('Cache error:', e));
      const url = URL.createObjectURL(file);
      setLongVideoPreview(url);
      setLongVideoUrl(`local-media:${key}`);

      // Auto-extract video duration and auto-generate video thumbnail frame
      const frameInfo = await captureVideoFrame(file, 1.5);
      if (frameInfo.durationFormatted && frameInfo.durationFormatted !== '00:00') {
        setLongDuration(frameInfo.durationFormatted);
      }
      
      // Auto-detect resolution quality
      if (frameInfo.width >= 3840 || frameInfo.height >= 2160) {
        setLongQuality('4K Ultra HD');
      } else if (frameInfo.width >= 1920 || frameInfo.height >= 1080) {
        setLongQuality('1080p 60fps');
      } else if (frameInfo.width >= 1280 || frameInfo.height >= 720) {
        setLongQuality('720p HD');
      }

      // If user hasn't manually picked a custom device thumbnail yet, set the auto-captured thumbnail
      if (!longThumbnailPreview && frameInfo.thumbnailDataUrl) {
        setLongThumbnailPreview(frameInfo.thumbnailDataUrl);
        setLongThumbnailFileName(`Frame from ${file.name}`);
        setLongThumbnailFileSize('Auto-captured frame');
      }
    } catch (err) {
      console.error('Long video processing note:', err);
      const url = URL.createObjectURL(file);
      setLongVideoPreview(url);
      setLongVideoUrl(url);
    } finally {
      setIsProcessingLongVideo(false);
    }
  };

  // Long Thumbnail Device Upload Handler
  const handleLongThumbnailFileSelect = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLongThumbnailError('Please select a valid image file (JPEG, PNG, WEBP, GIF, SVG)');
      return;
    }

    setLongThumbnailError(null);
    setIsProcessingLongThumbnail(true);
    setLongThumbnailFileName(file.name);
    setLongThumbnailFileSize((file.size / 1024).toFixed(1) + ' KB');

    try {
      const processedBase64 = await processImageFile(file);
      setLongThumbnailPreview(processedBase64);
      setLongThumbnailUrl(processedBase64);
    } catch (err) {
      console.error('Thumbnail upload failed:', err);
      setLongThumbnailError('Failed to load thumbnail from device. Please try another image.');
    } finally {
      setIsProcessingLongThumbnail(false);
    }
  };

  // Capture thumbnail from the currently playing/paused frame in preview
  const handleCaptureCurrentFrame = () => {
    if (!longVideoElementRef.current) return;
    const video = longVideoElementRef.current;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setLongThumbnailPreview(dataUrl);
        setLongThumbnailFileName(`Captured at ${formatDuration(video.currentTime || 0)}`);
        setLongThumbnailFileSize('Live frame capture');
        setLongThumbnailError(null);
      }
    } catch (err) {
      console.warn('Frame capture error:', err);
    }
  };

  const handleClearLongVideo = () => {
    setLongVideoPreview(null);
    setLongVideoUrl('');
    setLongVideoFileName('');
    setLongVideoFileSize('');
    setLongVideoError(null);
    if (longFileInputRef.current) longFileInputRef.current.value = '';
  };

  const handleClearLongThumbnail = () => {
    setLongThumbnailPreview(null);
    setLongThumbnailUrl('');
    setLongThumbnailFileName('');
    setLongThumbnailFileSize('');
    setLongThumbnailError(null);
    if (longThumbnailFileInputRef.current) longThumbnailFileInputRef.current.value = '';
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
      flair: mainTab === 'shorts' ? 'Short Video' : mainTab === 'longs' ? 'Long Video' : flair,
      tags: mainTab === 'shorts' ? ['#Shorts', ...tags] : mainTab === 'longs' ? ['#LongVideo', ...tags] : tags,
    };

    if (mainTab === 'shorts') {
      postData.type = 'short';
      postData.isShort = true;
      postData.isLong = false;
      postData.videoUrl = (shortVideoUrl || shortVideoPreview).trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      postData.imageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';
    } else if (mainTab === 'longs') {
      postData.type = 'long';
      postData.isLong = true;
      postData.isShort = false;
      postData.videoUrl = (longVideoUrl || longVideoPreview).trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      postData.imageUrl = (longThumbnailUrl || longThumbnailPreview).trim() || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80';
      postData.duration = longDuration || '15:30';
    } else {
      postData.type = postType;
      postData.isShort = false;
      postData.isLong = false;
      if (postType === 'image') {
        postData.imageUrl = (imageUrl || imagePreview).trim() || 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80';
      } else if (postType === 'video') {
        postData.type = 'video';
        postData.videoUrl = (postVideoUrl || postVideoPreview).trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        postData.imageUrl = postThumbnailPreview || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80';
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
    }

    onSubmitPost(postData);
    onClose();
  };

  const isYouTube = isYouTubeUrl(linkUrl);
  const ytEmbedUrl = getYouTubeEmbedUrl(linkUrl);
  const isLongYouTube = isYouTubeUrl(longVideoUrl);
  const longYtEmbedUrl = getYouTubeEmbedUrl(longVideoUrl);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col w-full h-full min-h-screen overflow-hidden">
      {/* Full-width Top Creator Bar */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-violet-900/40 bg-slate-950/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-pink-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 leading-tight">Create on Buvaki</h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">Publish threads, vertical shorts, or 16:9 widescreen videos</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || isProcessingImage || isProcessingLongVideo}
            className="px-4 sm:px-5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-violet-600/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>{mainTab === 'shorts' ? 'Publish Short' : mainTab === 'longs' ? 'Publish Video' : 'Publish Post'}</span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Full-width Scrollable Creator Canvas */}
      <main className="flex-1 w-full overflow-y-auto custom-scrollbar bg-slate-950">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* 1. Sub-Buvaki Selector */}
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
              value={subId || ''}
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

          {/* 2. NEW ROW OF PRIMARY TABS: Posts, Shorts, Longs */}
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-900 border border-violet-900/40 shadow-inner">
              <button
                type="button"
                onClick={() => setMainTab('posts')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mainTab === 'posts'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Posts</span>
              </button>

              <button
                type="button"
                onClick={() => setMainTab('shorts')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mainTab === 'shorts'
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Clapperboard className="w-4 h-4" />
                <span>Shorts</span>
              </button>

              <button
                type="button"
                onClick={() => setMainTab('longs')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mainTab === 'longs'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Longs</span>
              </button>
            </div>
          </div>

          {/* 3. Sub-tabs (Text | Photo | Video | Link | Poll) - shown when in Posts mode */}
          {mainTab === 'posts' && (
            <div className="flex flex-wrap sm:flex-nowrap rounded-xl bg-slate-900 p-1 border border-violet-900/40 gap-1">
              <button
                type="button"
                onClick={() => setPostType('text')}
                className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  postType === 'text' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Text
              </button>
              <button
                type="button"
                onClick={() => setPostType('image')}
                className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  postType === 'image' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Photo
              </button>
              <button
                type="button"
                onClick={() => setPostType('video')}
                className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  postType === 'video' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-pink-400" /> Video
              </button>
              <button
                type="button"
                onClick={() => setPostType('link')}
                className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  postType === 'link' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" /> Link
              </button>
              <button
                type="button"
                onClick={() => setPostType('poll')}
                className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  postType === 'poll' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" /> Poll
              </button>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-violet-300">
              {mainTab === 'shorts' ? 'Short Video Title' : mainTab === 'longs' ? 'Video Title' : 'Title'}
            </label>
            <input
              type="text"
              required
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                mainTab === 'shorts'
                  ? "Catchy title for your Short reel..."
                  : mainTab === 'longs'
                  ? "Detailed title for your Long video..."
                  : "Give your post a descriptive title..."
              }
              className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* TAB MODE: SHORTS */}
          {mainTab === 'shorts' && (
            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-900/60 border border-pink-900/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-pink-400" />
                  <span>Short Video Source (9:16 Vertical Reel)</span>
                </label>

                <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-violet-900/40">
                  <button
                    type="button"
                    onClick={() => setShortVideoMode('upload')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      shortVideoMode === 'upload'
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Upload Reel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShortVideoMode('url')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      shortVideoMode === 'url'
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>Video URL</span>
                  </button>
                </div>
              </div>

              {shortVideoMode === 'upload' ? (
                <div className="flex flex-col gap-3">
                  <input
                    ref={shortFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={(e) => handleShortVideoFileSelect(e.target.files?.[0])}
                    className="hidden"
                  />

                  {!shortVideoPreview ? (
                    <div
                      onClick={() => shortFileInputRef.current?.click()}
                      className="cursor-pointer p-6 rounded-2xl border-2 border-dashed border-pink-900/60 hover:border-pink-500 bg-slate-900/40 hover:bg-slate-900/80 transition-all flex flex-col items-center justify-center gap-2.5 text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-pink-950/80 border border-pink-700/60 flex items-center justify-center text-pink-400 shadow-md">
                        <Clapperboard className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-200">
                        Click to upload vertical video (MP4, WEBM, MOV)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Max duration: 60 seconds • 9:16 vertical ratio recommended
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-pink-800/60 bg-slate-950 p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-slate-200 truncate">{shortVideoFileName || 'Selected Video Reel'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShortVideoPreview(null);
                          setShortVideoUrl('');
                          if (shortFileInputRef.current) shortFileInputRef.current.value = '';
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs text-rose-400 bg-rose-950/50 hover:bg-rose-900/80"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="url"
                  value={shortVideoUrl || ''}
                  onChange={(e) => {
                    setShortVideoUrl(e.target.value);
                    setShortVideoPreview(e.target.value.trim() ? e.target.value.trim() : null);
                  }}
                  placeholder="https://assets.mixkit.co/... or any direct MP4 / WebM video link"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              )}

              {/* Music / Audio Tag */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-pink-400" />
                  <span>Audio / Background Sound</span>
                </label>
                <input
                  type="text"
                  value={shortMusicTitle || ''}
                  onChange={(e) => setShortMusicTitle(e.target.value)}
                  placeholder="e.g. Original Audio - Lo-Fi Chill Beats"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100"
                />
              </div>

              {/* Caption */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Reel Caption & Description</label>
                <textarea
                  value={content || ''}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add a snappy caption, mention tags, or describe the clip..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>
          )}

          {/* TAB MODE: LONGS */}
          {mainTab === 'longs' && (
            <div className="flex flex-col gap-5 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-violet-900/40">
              
              {/* 1. Video File Source Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-violet-400" />
                    <span>Long Video File (16:9 Cinema / Masterclass)</span>
                  </label>

                  <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-violet-900/40">
                    <button
                      type="button"
                      onClick={() => setLongVideoMode('upload')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        longVideoMode === 'upload'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>From Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLongVideoMode('url')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        longVideoMode === 'url'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Youtube className="w-3 h-3 text-rose-400" />
                      <span>YouTube / Web URL</span>
                    </button>
                  </div>
                </div>

                {/* OPTION 1: Upload Video from Device */}
                {longVideoMode === 'upload' ? (
                  <div className="flex flex-col gap-3">
                    <input
                      ref={longFileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleLongVideoFileSelect(e.target.files?.[0])}
                      className="hidden"
                    />

                    {!longVideoPreview ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingLongVideo(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDraggingLongVideo(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingLongVideo(false);
                          const file = e.dataTransfer.files?.[0];
                          handleLongVideoFileSelect(file);
                        }}
                        onClick={() => longFileInputRef.current?.click()}
                        className={`cursor-pointer p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 text-center ${
                          isDraggingLongVideo
                            ? 'border-violet-400 bg-violet-950/40 scale-[1.01]'
                            : 'border-violet-900/60 hover:border-violet-500 bg-slate-900/40 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-violet-950 border border-violet-700/60 flex items-center justify-center text-violet-400 shadow-md">
                          <Tv className="w-6 h-6" />
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-200">
                            {isDraggingLongVideo ? 'Drop video file here to upload' : 'Click to select video file from your phone or device'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Supports MP4, WebM, MOV, MKV, AVI • 16:9 Landscape recommended
                          </p>
                        </div>

                        <button
                          type="button"
                          className="mt-1 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Browse Device Videos</span>
                        </button>
                      </div>
                    ) : (
                      /* Live Video Player Preview */
                      <div className="relative rounded-2xl overflow-hidden border border-violet-800/60 bg-slate-950 flex flex-col">
                        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                          <video
                            ref={longVideoElementRef}
                            src={longVideoPreview}
                            controls
                            playsInline
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Video Info Bar */}
                        <div className="p-3 bg-slate-900/90 border-t border-violet-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-200 truncate">
                              {longVideoFileName || 'Device Video Loaded'}
                            </span>
                            {longVideoFileSize && (
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                ({longVideoFileSize})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={handleCaptureCurrentFrame}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-pink-300 hover:text-white bg-pink-950/60 hover:bg-pink-900 border border-pink-700/50 transition-colors flex items-center gap-1"
                              title="Capture current paused frame as video thumbnail"
                            >
                              <Camera className="w-3 h-3" />
                              <span>Capture Frame as Thumbnail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => longFileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-violet-300 hover:text-white bg-slate-800 hover:bg-violet-900 transition-colors"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={handleClearLongVideo}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                              title="Remove Video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isProcessingLongVideo && (
                      <div className="flex items-center gap-2 text-xs text-violet-300">
                        <div className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                        <span>Analyzing video metadata & extracting preview frame...</span>
                      </div>
                    )}

                    {longVideoError && (
                      <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{longVideoError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* OPTION 2: Enter YouTube or direct video URL */
                  <div className="flex flex-col gap-2">
                    <input
                      type="url"
                      value={longVideoUrl || ''}
                      onChange={(e) => {
                        setLongVideoUrl(e.target.value);
                        setLongVideoPreview(e.target.value.trim() ? e.target.value.trim() : null);
                      }}
                      placeholder="https://youtube.com/watch?v=... or direct 16:9 MP4 video URL"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                    {isLongYouTube && longYtEmbedUrl && (
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-violet-900/40 mt-1">
                        <iframe
                          src={longYtEmbedUrl}
                          title="YouTube Preview"
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Video Thumbnail Source Section (Device Upload + Web URL + Auto Frame) */}
              <div className="flex flex-col gap-3 pt-3 border-t border-violet-900/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-violet-400" />
                    <span>Video Thumbnail Cover</span>
                  </label>

                  <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-violet-900/40">
                    <button
                      type="button"
                      onClick={() => setLongThumbnailMode('upload')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        longThumbnailMode === 'upload'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLongThumbnailMode('url')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        longThumbnailMode === 'url'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {/* THUMBNAIL OPTION 1: Upload from Device */}
                {longThumbnailMode === 'upload' ? (
                  <div className="flex flex-col gap-3">
                    <input
                      ref={longThumbnailFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLongThumbnailFileSelect(e.target.files?.[0])}
                      className="hidden"
                    />

                    {!longThumbnailPreview ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingLongThumbnail(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDraggingLongThumbnail(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingLongThumbnail(false);
                          const file = e.dataTransfer.files?.[0];
                          handleLongThumbnailFileSelect(file);
                        }}
                        onClick={() => longThumbnailFileInputRef.current?.click()}
                        className={`cursor-pointer p-5 sm:p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 text-center ${
                          isDraggingLongThumbnail
                            ? 'border-violet-400 bg-violet-950/40 scale-[1.01]'
                            : 'border-violet-900/60 hover:border-violet-500 bg-slate-900/40 hover:bg-slate-900/80'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-700/60 flex items-center justify-center text-violet-400 shadow-md">
                          <Upload className="w-5 h-5" />
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs font-bold text-slate-200">
                            {isDraggingLongThumbnail ? 'Drop thumbnail image here' : 'Click to select custom thumbnail from your device'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Supports JPG, PNG, WEBP • 1280x720 (16:9) recommended
                          </p>
                        </div>

                        <button
                          type="button"
                          className="mt-0.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1"
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>Browse Device Images</span>
                        </button>
                      </div>
                    ) : (
                      /* Thumbnail Image Preview */
                      <div className="relative rounded-2xl overflow-hidden border border-violet-800/60 bg-slate-950 flex flex-col">
                        <div className="relative aspect-video max-h-56 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                          <img
                            src={longThumbnailPreview}
                            alt="Custom video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-pink-400 font-bold border border-pink-500/30">
                            {longDuration || '15:30'}
                          </div>
                        </div>

                        {/* Thumbnail Overlay Bar */}
                        <div className="p-2.5 bg-slate-900/90 border-t border-violet-900/40 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-200 truncate">
                              {longThumbnailFileName || 'Custom Thumbnail Selected'}
                            </span>
                            {longThumbnailFileSize && (
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                ({longThumbnailFileSize})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => longThumbnailFileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-violet-300 hover:text-white bg-slate-800 hover:bg-violet-900 transition-colors"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={handleClearLongThumbnail}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                              title="Remove Thumbnail"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isProcessingLongThumbnail && (
                      <div className="flex items-center gap-2 text-xs text-violet-300">
                        <div className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                        <span>Optimizing custom thumbnail image...</span>
                      </div>
                    )}

                    {longThumbnailError && (
                      <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{longThumbnailError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* THUMBNAIL OPTION 2: Web Image URL */
                  <div className="flex flex-col gap-2">
                    <input
                      type="url"
                      value={longThumbnailUrl || ''}
                      onChange={(e) => {
                        setLongThumbnailUrl(e.target.value);
                        setLongThumbnailPreview(e.target.value.trim() ? e.target.value.trim() : null);
                      }}
                      placeholder="https://images.unsplash.com/... or any web image link for video cover"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                    />
                    {longThumbnailUrl.trim() && (
                      <div className="aspect-video max-h-48 rounded-xl overflow-hidden border border-violet-900/40 bg-slate-950 mt-1">
                        <img
                          src={longThumbnailUrl}
                          alt="Thumbnail Preview"
                          className="w-full h-full object-cover"
                          onError={() => setLongThumbnailError('Could not load image from this URL.')}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Video Attributes Grid: Duration, Quality, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-violet-900/30">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-pink-400" /> Duration
                  </label>
                  <input
                    type="text"
                    value={longDuration || ''}
                    onChange={(e) => setLongDuration(e.target.value)}
                    placeholder="e.g. 34:20"
                    className="w-full p-2 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400">Quality</label>
                  <select
                    value={longQuality || '1080p 60fps'}
                    onChange={(e) => setLongQuality(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-200"
                  >
                    <option value="4K Ultra HD">4K Ultra HD</option>
                    <option value="1080p 60fps">1080p 60fps</option>
                    <option value="1080p HD">1080p HD</option>
                    <option value="720p HD">720p HD</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-400">Category</label>
                  <select
                    value={longCategory || 'tech'}
                    onChange={(e) => setLongCategory(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-200 capitalize"
                  >
                    <option value="tech">Tech & AI</option>
                    <option value="creative">Creative & Design</option>
                    <option value="gaming">Gaming</option>
                    <option value="photography">Photography</option>
                  </select>
                </div>
              </div>

              {/* 4. Description & Show Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Video Description & Show Notes</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed summary of the topics discussed in this video..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}

          {/* Dynamic Content depending on postType (only in Posts mode) */}
          {mainTab === 'posts' && postType === 'text' && (
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
          {mainTab === 'posts' && postType === 'image' && (
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
                    value={imageUrl || ''}
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

          {/* Feed Post Video Uploading (Upload portrait or landscape videos to appear in the Feed view) */}
          {mainTab === 'posts' && postType === 'video' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-pink-400" />
                  <span>Feed Video Source (Portrait or Landscape)</span>
                </label>
                
                <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-violet-900/40">
                  <button
                    type="button"
                    onClick={() => setPostVideoMode('upload')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      postVideoMode === 'upload'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Device Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostVideoMode('url')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      postVideoMode === 'url'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>Video URL</span>
                  </button>
                </div>
              </div>

              {/* Feed Destination Info Banner */}
              <div className="px-3 py-2 rounded-xl bg-violet-950/40 border border-violet-800/40 text-[11px] text-violet-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                <span>
                  This video will publish directly to the <strong>Feed View</strong>. Both vertical and landscape formats are supported in feed cards.
                </span>
              </div>

              {/* Option 1: Upload from Device */}
              {postVideoMode === 'upload' && (
                <div className="flex flex-col gap-3">
                  <input
                    ref={postFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={(e) => handlePostVideoFileSelect(e.target.files?.[0])}
                    className="hidden"
                  />

                  {!postVideoPreview ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingPostVideo(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDraggingPostVideo(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingPostVideo(false);
                        handlePostVideoFileSelect(e.dataTransfer.files?.[0]);
                      }}
                      onClick={() => postFileInputRef.current?.click()}
                      className={`cursor-pointer p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 text-center ${
                        isDraggingPostVideo
                          ? 'border-pink-400 bg-pink-950/40 scale-[1.01]'
                          : 'border-violet-900/60 hover:border-pink-500 bg-slate-900/40 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-violet-950 border border-pink-700/60 flex items-center justify-center text-pink-400 shadow-md">
                        <Film className="w-6 h-6" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-200">
                          {isDraggingPostVideo ? 'Drop video here' : 'Click to select video from your phone or computer'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Supports MP4, WebM, MOV • Portrait or Landscape formats
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
                    <div className="relative rounded-2xl overflow-hidden border border-violet-800/60 bg-slate-950 p-3 flex flex-col gap-3">
                      <div className="relative max-h-56 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                        <video
                          src={postVideoPreview}
                          controls
                          className="max-h-56 w-full object-contain"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-200">
                        <div className="flex items-center gap-2 truncate">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate font-semibold">{postVideoFileName || 'Video Selected'}</span>
                          {postVideoFileSize && (
                            <span className="text-[10px] text-slate-400 font-mono">({postVideoFileSize})</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => postFileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-violet-300 hover:text-white bg-slate-800 hover:bg-violet-900 transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPostVideoPreview(null);
                              setPostVideoUrl('');
                              setPostVideoFileName('');
                              setPostThumbnailPreview(null);
                            }}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isProcessingPostVideo && (
                    <div className="flex items-center gap-2 text-xs text-violet-300">
                      <div className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                      <span>Processing video & extracting frame...</span>
                    </div>
                  )}

                  {postVideoError && (
                    <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{postVideoError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Option 2: Video URL */}
              {postVideoMode === 'url' && (
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    value={postVideoUrl || ''}
                    onChange={(e) => {
                      setPostVideoUrl(e.target.value);
                      setPostVideoPreview(e.target.value.trim() ? e.target.value.trim() : null);
                    }}
                    placeholder="https://assets.mixkit.co/... or direct video URL"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />

                  {postVideoUrl.trim() && (
                    <div className="rounded-xl overflow-hidden border border-violet-900/40 max-h-48 bg-black flex items-center justify-center mt-1">
                      <video
                        src={postVideoUrl}
                        controls
                        className="max-h-48 w-full object-contain"
                        onError={() => setPostVideoError('Could not load video from this URL. Please check the link.')}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Video Description / Context */}
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-xs font-bold text-violet-300">Video Description / Post Text (Optional)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add context, commentary, or a description for your feed video..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          )}

          {/* Link / YouTube Posting */}
          {mainTab === 'posts' && postType === 'link' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-violet-400" />
                  <span>Web Link or YouTube Video URL</span>
                </label>
                <input
                  type="url"
                  required
                  value={linkUrl || ''}
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
          {mainTab === 'posts' && postType === 'poll' && (
            <div className="flex flex-col gap-3 p-3 rounded-xl bg-slate-900 border border-violet-900/40">
              <label className="text-xs font-bold text-violet-300">Poll Question</label>
              <input
                type="text"
                value={pollQuestion || ''}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Question (defaults to post title)"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-violet-900/30 text-xs text-slate-100"
              />

              <label className="text-xs font-bold text-violet-300 mt-1">Options</label>
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt || ''}
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
                value={flair || 'Discussion'}
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
                value={tagsInput || ''}
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
              {mainTab === 'shorts' ? 'Publish Short' : mainTab === 'longs' ? 'Publish Video' : 'Publish Post'}
            </button>
          </div>

        </form>
        </div>
      </main>
    </div>
  );
};


