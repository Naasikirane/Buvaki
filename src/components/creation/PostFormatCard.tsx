import React from 'react';
import { 
  X, 
  ArrowLeft, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Link2, 
  BarChart2, 
  ChevronRight 
} from 'lucide-react';
import { motion } from 'motion/react';

export type PostFormatType = 'text' | 'image' | 'video' | 'link' | 'poll';

interface PostFormatCardProps {
  onSelectFormat: (format: PostFormatType) => void;
  onBack: () => void;
  onClose: () => void;
}

interface FormatOption {
  type: PostFormatType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgLight: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    type: 'text',
    title: 'Text',
    description: 'Share your thoughts, story, or discussion topic',
    icon: FileText,
    accentColor: 'text-blue-600',
    bgLight: 'bg-blue-50 group-hover:bg-blue-100/80',
  },
  {
    type: 'image',
    title: 'Photo',
    description: 'Upload images, artwork, or a multi-photo gallery',
    icon: ImageIcon,
    accentColor: 'text-amber-600',
    bgLight: 'bg-amber-50 group-hover:bg-amber-100/80',
  },
  {
    type: 'video',
    title: 'Video',
    description: 'Upload a video clip with auto-captured thumbnail',
    icon: Video,
    accentColor: 'text-emerald-600',
    bgLight: 'bg-emerald-50 group-hover:bg-emerald-100/80',
  },
  {
    type: 'link',
    title: 'Link',
    description: 'Share an external website, article, or resource',
    icon: Link2,
    accentColor: 'text-indigo-600',
    bgLight: 'bg-indigo-50 group-hover:bg-indigo-100/80',
  },
  {
    type: 'poll',
    title: 'Poll',
    description: 'Create an interactive poll with custom voting choices',
    icon: BarChart2,
    accentColor: 'text-purple-600',
    bgLight: 'bg-purple-50 group-hover:bg-purple-100/80',
  },
];

export const PostFormatCard: React.FC<PostFormatCardProps> = ({
  onSelectFormat,
  onBack,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.96, x: -20 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="relative w-full max-w-[560px] bg-white rounded-[32px] shadow-2xl shadow-slate-900/15 border border-slate-200/80 overflow-hidden select-none"
    >
      {/* Left Gradient Strip Accent */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-[#22c55e] via-[#10b981] to-[#06b6d4]" />

      {/* Header with Back and Close */}
      <div className="relative z-10 flex items-center justify-between pl-8 sm:pl-10 pr-6 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-back-to-sections"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">Create a Post</h3>
            <p className="text-xs text-slate-500">Choose the format you want to share</p>
          </div>
        </div>

        <button
          type="button"
          id="btn-close-post-format"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Format List */}
      <div className="relative z-10 pl-8 sm:pl-10 pr-6 py-4 flex flex-col gap-2 max-h-[460px] overflow-y-auto no-scrollbar">
        {FORMAT_OPTIONS.map((opt) => {
          const IconComp = opt.icon;
          return (
            <button
              key={opt.type}
              type="button"
              id={`btn-format-${opt.type}`}
              onClick={() => onSelectFormat(opt.type)}
              className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200/90 bg-white hover:bg-slate-50/90 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${opt.bgLight} ${opt.accentColor} flex items-center justify-center shrink-0 transition-colors`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {opt.title}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {opt.description}
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Step Indicator */}
      <div className="relative z-10 flex items-center justify-center gap-2 pt-2 pb-5 border-t border-slate-100 mt-2">
        <div className="w-3 h-1.5 rounded-full bg-slate-300" />
        <div className="w-8 h-1.5 rounded-full bg-emerald-500" />
        <div className="w-3 h-1.5 rounded-full bg-slate-300" />
      </div>
    </motion.div>
  );
};
