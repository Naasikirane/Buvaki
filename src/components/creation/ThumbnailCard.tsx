import React, { useRef } from 'react';
import { 
  X, 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  Image as ImageIcon, 
  ArrowRight,
  Eye,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';

interface ThumbnailCardProps {
  autoThumbnailUrl: string | null;
  customThumbnailUrl: string | null;
  selectedThumbnailUrl: string | null;
  onSelectThumbnail: (url: string) => void;
  onUploadCustomThumbnail: (file: File) => void;
  onBack: () => void;
  onClose: () => void;
  onProceed: () => void;
}

export const ThumbnailCard: React.FC<ThumbnailCardProps> = ({
  autoThumbnailUrl,
  customThumbnailUrl,
  selectedThumbnailUrl,
  onSelectThumbnail,
  onUploadCustomThumbnail,
  onBack,
  onClose,
  onProceed,
}) => {
  const customFileInputRef = useRef<HTMLInputElement>(null);

  const activeThumbnail =
    selectedThumbnailUrl ||
    customThumbnailUrl ||
    autoThumbnailUrl ||
    '/sample-videos/landscape.mp4';

  const isAutoSelected = selectedThumbnailUrl === autoThumbnailUrl || (!selectedThumbnailUrl && !customThumbnailUrl);
  const isCustomSelected = selectedThumbnailUrl === customThumbnailUrl && !!customThumbnailUrl;

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
            id="btn-back-to-upload"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">Choose Thumbnail</h3>
            <p className="text-xs text-slate-500">Select the auto-captured frame or upload a custom image</p>
          </div>
        </div>

        <button
          type="button"
          id="btn-close-thumbnail"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hidden file input for custom thumbnail */}
      <input
        ref={customFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUploadCustomThumbnail(file);
        }}
      />

      {/* Main Options Grid */}
      <div className="relative z-10 pl-8 sm:pl-10 pr-6 py-5 max-h-[480px] overflow-y-auto no-scrollbar flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. AUTO-CAPTURED THUMBNAIL */}
          <div
            onClick={() => autoThumbnailUrl && onSelectThumbnail(autoThumbnailUrl)}
            className={`relative rounded-2xl p-2.5 border-2 transition-all cursor-pointer flex flex-col gap-2 ${
              isAutoSelected
                ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200/60">
              {autoThumbnailUrl ? (
                <img
                  src={autoThumbnailUrl}
                  alt="Auto-captured frame"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Generating frame...
                </div>
              )}

              {/* Selection Checkmark */}
              {isAutoSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Auto-Captured Frame
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isAutoSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {isAutoSelected ? 'Selected' : 'Use Frame'}
              </span>
            </div>
          </div>

          {/* 2. CUSTOM THUMBNAIL */}
          <div
            onClick={() => {
              if (customThumbnailUrl) {
                onSelectThumbnail(customThumbnailUrl);
              } else {
                customFileInputRef.current?.click();
              }
            }}
            className={`relative rounded-2xl p-2.5 border-2 transition-all cursor-pointer flex flex-col gap-2 ${
              isCustomSelected
                ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
            }`}
          >
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 flex flex-col items-center justify-center border border-slate-200/60">
              {customThumbnailUrl ? (
                <>
                  <img
                    src={customThumbnailUrl}
                    alt="Custom thumbnail"
                    className="w-full h-full object-cover"
                  />
                  {isCustomSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 mb-1">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">Upload Custom</span>
                  <span className="text-[10px] text-slate-400">16:9 Image</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                Custom Thumbnail
              </span>
              {customThumbnailUrl ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    customFileInputRef.current?.click();
                  }}
                  className="text-[10px] font-semibold text-emerald-700 hover:underline"
                >
                  Change
                </button>
              ) : (
                <span className="text-[10px] font-semibold text-slate-500">From Device</span>
              )}
            </div>
          </div>
        </div>

        {/* Live Card Preview Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Feed Card Thumbnail Preview</span>
          </div>

          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
            <img
              src={activeThumbnail}
              alt="Feed Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[11px] font-semibold text-white">
              HD Video
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between pl-8 sm:pl-10 pr-6 py-4 border-t border-slate-100 bg-slate-50/50">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          Back to Video
        </button>

        <button
          type="button"
          id="btn-thumbnail-proceed"
          onClick={onProceed}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer"
        >
          <span>Next: Post Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
