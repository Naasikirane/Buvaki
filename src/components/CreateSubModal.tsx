import React, { useState, useRef } from 'react';
import { SubBuvaki } from '../types';
import { 
  X, 
  PlusCircle, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Trash2, 
  Check, 
  Sparkles,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { processImageFile } from '../lib/mediaUtils';
import { CommunityIcon } from './CommunityIcon';

interface CreateSubModalProps {
  onClose: () => void;
  onCreateSub: (newSub: SubBuvaki) => void;
}

const BANNER_PRESETS = [
  { id: 'violet', name: 'Deep Violet', class: 'from-violet-950 to-violet-900' },
  { id: 'pink', name: 'Cyber Pink', class: 'from-pink-950 to-pink-900' },
  { id: 'cyan', name: 'Electric Cyan', class: 'from-cyan-950 to-cyan-900' },
  { id: 'emerald', name: 'Neon Emerald', class: 'from-emerald-950 to-emerald-900' },
  { id: 'amber', name: 'Amber Gold', class: 'from-amber-950 to-amber-900' },
  { id: 'rose', name: 'Ruby Rose', class: 'from-rose-950 to-rose-900' },
];

export const CreateSubModal: React.FC<CreateSubModalProps> = ({
  onClose,
  onCreateSub,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'tech' | 'gaming' | 'general' | 'creative' | 'privacy'>('creative');
  const [bannerColor, setBannerColor] = useState('from-violet-950 to-violet-900');

  // Custom Image Upload State
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [imageFileUrl, setImageFileUrl] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeImageUrl = imageMode === 'upload' ? imageFileUrl : customImageUrl.trim();

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPEG, PNG, WebP, GIF).');
      return;
    }

    try {
      setIsProcessingImage(true);
      setImageError(null);
      const dataUrl = await processImageFile(file, 800, 0.85);
      setImageFileUrl(dataUrl);
      setImageFileName(file.name);
    } catch (err) {
      console.error('Error processing community image:', err);
      setImageError('Failed to process image. Please try another photo.');
    } finally {
      setIsProcessingImage(false);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFileUrl('');
    setImageFileName('');
    setCustomImageUrl('');
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    const newSub: SubBuvaki = {
      id: cleanName || `sub_${Date.now()}`,
      name: cleanName,
      displayName: `b/${cleanName}`,
      description: description.trim() || 'A fresh community hub created on Buvaki.',
      memberCount: 1,
      icon: 'sparkles',
      imageUrl: activeImageUrl || undefined,
      isDefault: false,
      bannerColor,
      category,
      isJoined: true,
    };

    onCreateSub(newSub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-950 border border-violet-900/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-900/30 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-slate-100">Create Sub-Buvaki</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          
          {/* Community Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-violet-300">Community Name</label>
            <div className="flex items-center rounded-xl bg-slate-900 border border-violet-900/40 px-3 py-2 text-xs text-slate-100 font-mono focus-within:border-violet-500 transition-colors">
              <span className="text-violet-400 font-bold mr-1">b/</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. cyberart, anime, robotics"
                className="bg-transparent border-none focus:outline-none w-full text-white placeholder-slate-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Only letters, numbers, and underscores are allowed.
            </p>
          </div>

          {/* User Custom Community Image Upload Section */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-900/60 border border-violet-900/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-violet-400" />
                <span>Community Logo / Photo</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-violet-900/40 text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    imageMode === 'upload'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  From Device
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    imageMode === 'url'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Device Image Uploader */}
            {imageMode === 'upload' ? (
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />

                {imageFileUrl ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-violet-800/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-violet-600/40 shrink-0 bg-slate-900">
                        <img
                          src={imageFileUrl}
                          alt="Community preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-100 truncate">
                          {imageFileName || 'Custom Community Photo'}
                        </span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ready to publish
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-violet-300 transition-colors font-medium"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/50 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      isDragging
                        ? 'border-violet-400 bg-violet-950/40'
                        : 'border-violet-900/50 bg-slate-950/60 hover:bg-slate-900/70 hover:border-violet-600/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-900/40 border border-violet-700/50 flex items-center justify-center text-violet-400 mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                      Tap to select photo from Phone or Device
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      PNG, JPG, WebP or GIF (Auto-optimized)
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center rounded-xl bg-slate-950 border border-violet-900/40 px-3 py-2 text-xs focus-within:border-violet-500">
                  <LinkIcon className="w-4 h-4 text-violet-400 mr-2 shrink-0" />
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://example.com/community-avatar.jpg"
                    className="bg-transparent border-none focus:outline-none w-full text-white placeholder-slate-500"
                  />
                  {customImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomImageUrl('')}
                      className="text-slate-500 hover:text-slate-300 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {imageError && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{imageError}</span>
              </p>
            )}

            {/* Live Visual Preview of Community Card Header */}
            <div className="mt-2 pt-2.5 border-t border-violet-900/30 flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-medium shrink-0">Live Preview:</span>
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-violet-900/40 min-w-0">
                <CommunityIcon 
                  imageUrl={activeImageUrl}
                  name={name ? `b/${name}` : 'b/new_community'}
                  category={category}
                  size="sm"
                />
                <span className="text-xs font-bold text-violet-300 truncate">
                  {name ? `b/${name}` : 'b/community_preview'}
                </span>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-violet-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            >
              <option value="creative">Creative & Arts</option>
              <option value="tech">Tech & AI</option>
              <option value="gaming">Gaming & Esports</option>
              <option value="privacy">Privacy & Security</option>
              <option value="general">General & Lounge</option>
            </select>
          </div>

          {/* Banner Gradient Palette */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-violet-300">Header Banner Style</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {BANNER_PRESETS.map((preset) => {
                const isSelected = bannerColor === preset.class;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setBannerColor(preset.class)}
                    className={`h-8 rounded-xl bg-gradient-to-r ${preset.class} border transition-all flex items-center justify-center ${
                      isSelected
                        ? 'border-white ring-2 ring-violet-500 scale-105 shadow-md'
                        : 'border-violet-900/40 opacity-70 hover:opacity-100'
                    }`}
                    title={preset.name}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-violet-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is your sub-buvaki about? Share rules, guidelines, or discussion topics."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-violet-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isProcessingImage}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-violet-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Sub-Buvaki</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
