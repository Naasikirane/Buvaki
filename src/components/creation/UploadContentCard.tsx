import React, { useRef, useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Upload, 
  Video, 
  Image as ImageIcon, 
  Link2, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Youtube, 
  ArrowRight,
  FileVideo,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { PostFormatType } from './PostFormatCard';
import { formatFileSize, isYouTubeUrl } from '../../lib/mediaUtils';

interface UploadContentCardProps {
  format: PostFormatType;
  onBack: () => void;
  onClose: () => void;
  onProceed: () => void;

  // Video state & handlers
  videoFile: File | null;
  videoPreviewUrl: string | null;
  videoFileName: string;
  videoFileSize: string;
  videoUrlInput: string;
  setVideoUrlInput: (url: string) => void;
  onVideoFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
  uploadStatusText: string;

  // Photo state & handlers
  imagePreviews: string[];
  onImageFilesSelect: (files: FileList | File[]) => void;
  onRemoveImage: (index: number) => void;
  imageUrlInput: string;
  setImageUrlInput: (url: string) => void;

  // Text state
  textContent: string;
  setTextContent: (text: string) => void;

  // Link state
  linkUrl: string;
  setLinkUrl: (url: string) => void;

  // Poll state
  pollQuestion: string;
  setPollQuestion: (q: string) => void;
  pollOptions: string[];
  setPollOptions: React.Dispatch<React.SetStateAction<string[]>>;
}

export const UploadContentCard: React.FC<UploadContentCardProps> = ({
  format,
  onBack,
  onClose,
  onProceed,
  videoFile,
  videoPreviewUrl,
  videoFileName,
  videoFileSize,
  videoUrlInput,
  setVideoUrlInput,
  onVideoFileSelect,
  isUploading,
  uploadProgress,
  uploadStatusText,
  imagePreviews,
  onImageFilesSelect,
  onRemoveImage,
  imageUrlInput,
  setImageUrlInput,
  textContent,
  setTextContent,
  linkUrl,
  setLinkUrl,
  pollQuestion,
  setPollQuestion,
  pollOptions,
  setPollOptions,
}) => {
  const [videoMode, setVideoMode] = useState<'device' | 'url'>('device');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const canProceed = () => {
    switch (format) {
      case 'video':
        return !!(videoFile || videoPreviewUrl || videoUrlInput.trim());
      case 'image':
        return imagePreviews.length > 0 || !!imageUrlInput.trim();
      case 'text':
        return textContent.trim().length > 0;
      case 'link':
        return linkUrl.trim().length > 0;
      case 'poll':
        return (
          pollQuestion.trim().length > 0 &&
          pollOptions.filter((opt) => opt.trim().length > 0).length >= 2
        );
      default:
        return false;
    }
  };

  const getTitle = () => {
    switch (format) {
      case 'video':
        return 'Upload Video';
      case 'image':
        return 'Upload Photos';
      case 'text':
        return 'Write Content';
      case 'link':
        return 'Attach Link';
      case 'poll':
        return 'Create Poll';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (format === 'video' && e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onVideoFileSelect(file);
      }
    } else if (format === 'image' && e.dataTransfer.files) {
      onImageFilesSelect(e.dataTransfer.files);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.96, x: -20 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="relative w-full max-w-[580px] bg-white rounded-[32px] shadow-2xl shadow-slate-900/15 border border-slate-200/80 overflow-hidden select-none"
    >
      {/* Left Gradient Strip Accent */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#22c55e] via-[#10b981] to-[#06b6d4]" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pl-8 sm:pl-10 pr-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-back-to-formats"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">{getTitle()}</h3>
            <p className="text-xs text-slate-500">
              {format === 'video' ? 'Select or drop your video to generate thumbnail' : 'Add media or content to your post'}
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-close-upload"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 pl-8 sm:pl-10 pr-6 py-5 max-h-[480px] overflow-y-auto no-scrollbar">
        {/* ======================= VIDEO UPLOAD ======================= */}
        {format === 'video' && (
          <div className="flex flex-col gap-4">
            {/* Mode Tabs: Device File vs Web URL */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setVideoMode('device')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  videoMode === 'device' ? 'bg-white text-emerald-700 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Upload from Device
              </button>
              <button
                type="button"
                onClick={() => setVideoMode('url')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  videoMode === 'url' ? 'bg-white text-emerald-700 shadow-sm' : 'hover:text-slate-900'
                }`}
              >
                Web / YouTube URL
              </button>
            </div>

            {videoMode === 'device' ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onVideoFileSelect(file);
                  }}
                />

                {/* Dropzone or Uploaded File Card */}
                {!videoFile && !videoPreviewUrl ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                        : 'border-slate-200 hover:border-emerald-500/70 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5 shadow-sm">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div className="text-base font-semibold text-slate-800 mb-1">
                      Choose video file or drag & drop here
                    </div>
                    <p className="text-xs text-slate-500 mb-3 max-w-xs">
                      Supports MP4, WebM, MOV, MKV up to 500MB
                    </p>
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors">
                      Browse Device
                    </span>
                  </div>
                ) : (
                  <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <FileVideo className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 line-clamp-1">
                            {videoFileName || videoFile?.name || 'Selected Video'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {videoFileSize || (videoFile ? formatFileSize(videoFile.size) : 'Ready')}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>

                    {/* Upload progress if in flight */}
                    {isUploading && (
                      <div className="flex flex-col gap-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-600">
                          <span>{uploadStatusText || 'Saving to Firebase Cloud Storage...'}</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Video loaded. Frame auto-captured for thumbnail!</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* URL Mode */
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-700">Video or YouTube URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or direct .mp4 link"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                {isYouTubeUrl(videoUrlInput) && (
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid YouTube video detected
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================= PHOTO UPLOAD ======================= */}
        {format === 'image' && (
          <div className="flex flex-col gap-4">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) onImageFilesSelect(e.target.files);
              }}
            />

            {/* Photos Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-amber-500/70 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50/60 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-slate-800 mb-0.5">
                Upload photos from device
              </div>
              <p className="text-xs text-slate-500 mb-2">Supports single photo or multi-image gallery</p>
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white shadow-sm">
                Select Images
              </span>
            </div>

            {/* Gallery Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {imagePreviews.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveImage(idx);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= TEXT CONTENT ======================= */}
        {format === 'text' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700">Write your discussion or story</label>
            <textarea
              rows={8}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="What do you want to share with the Buvaki community? Markdown supported..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
        )}

        {/* ======================= LINK CONTENT ======================= */}
        {format === 'link' && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-700">Paste URL link</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            {linkUrl && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{linkUrl}</span>
              </div>
            )}
          </div>
        )}

        {/* ======================= POLL CONTENT ======================= */}
        {format === 'poll' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Poll Question</label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask your question..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm mt-1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700">Voting Choices</label>
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-slate-400 font-semibold text-center">{i + 1}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...pollOptions];
                      updated[i] = e.target.value;
                      setPollOptions(updated);
                    }}
                    placeholder={`Choice ${i + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPollOptions(pollOptions.filter((_, idx) => idx !== i));
                      }}
                      className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {pollOptions.length < 6 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 py-1.5 px-2 rounded-lg hover:bg-purple-50 w-fit transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Choice
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Next Action */}
      <div className="relative z-10 flex items-center justify-between pl-8 sm:pl-10 pr-6 py-4 border-t border-slate-100 bg-slate-50/50">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          id="btn-upload-proceed"
          disabled={!canProceed()}
          onClick={onProceed}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
            canProceed()
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>{format === 'video' ? 'Next: Thumbnail' : 'Next: Post Details'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
