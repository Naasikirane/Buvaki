import React, { useState } from 'react';
import { SubBuvaki } from '../types';
import { X, Sparkles, PlusCircle } from 'lucide-react';

interface CreateSubModalProps {
  onClose: () => void;
  onCreateSub: (newSub: SubBuvaki) => void;
}

export const CreateSubModal: React.FC<CreateSubModalProps> = ({
  onClose,
  onCreateSub,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🌀');
  const [category, setCategory] = useState<'tech' | 'privacy' | 'gaming' | 'general' | 'creative'>('tech');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    const newSub: SubBuvaki = {
      id: cleanName || `sub_${Date.now()}`,
      name: cleanName,
      displayName: `b/${cleanName}`,
      description: description.trim() || 'A fresh community sub-buvaki in the onion vortex.',
      memberCount: 1,
      icon,
      bannerColor: 'from-violet-900 to-indigo-950',
      category,
      isJoined: true,
    };

    onCreateSub(newSub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-950 border border-violet-900/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-900/30 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Create Sub-Buvaki</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-violet-300">Name (e.g. cybersec)</label>
            <div className="flex items-center rounded-xl bg-slate-900 border border-violet-900/40 px-3 py-2 text-xs text-slate-100 font-mono">
              <span className="text-violet-400 font-bold mr-1">b/</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="community_name"
                className="bg-transparent border-none focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 w-24">
              <label className="text-xs font-bold text-violet-300">Emoji Icon</label>
              <input
                type="text"
                maxLength={2}
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-center text-lg"
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-bold text-violet-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-200"
              >
                <option value="tech font-medium">Tech</option>
                <option value="privacy">Privacy</option>
                <option value="gaming">Gaming</option>
                <option value="general">General</option>
                <option value="creative">Creative</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-violet-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this sub-buvaki about?"
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

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
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs"
            >
              Launch Sub-Buvaki
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
