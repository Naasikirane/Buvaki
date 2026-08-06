import React, { useState } from 'react';
import { SubBuvaki, Post } from '../types';
import { X, FileText, Image as ImageIcon, Link2, BarChart2, Sparkles, Plus, Trash2 } from 'lucide-react';

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
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [flair, setFlair] = useState('Discussion');
  const [tagsInput, setTagsInput] = useState('tech, privacy');

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['Option 1', 'Option 2']);

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
      postData.imageUrl = imageUrl.trim() || 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-violet-900/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-violet-900/30 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-400" />
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
            <label className="text-xs font-bold text-violet-300">Choose Community</label>
            <select
              value={subId}
              onChange={(e) => setSubId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-violet-900/40 text-xs font-semibold text-slate-200 focus:outline-none focus:border-violet-500"
            >
              {subBuvakis.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.icon} {sub.displayName} — {sub.description.slice(0, 45)}...
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
              <ImageIcon className="w-3.5 h-3.5" /> Image
            </button>
            <button
              type="button"
              onClick={() => setPostType('link')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                postType === 'link' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" /> Link
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
              placeholder="An interesting title for the vortex..."
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
                placeholder="Share your thoughts, analysis or code..."
                rows={5}
                className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          )}

          {postType === 'image' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-violet-300">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <span className="text-[10px] text-slate-400">
                Leave empty for default high-res cyberpunk vortex asset preview.
              </span>
            </div>
          )}

          {postType === 'link' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-violet-300">Link URL</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full p-3 rounded-xl bg-slate-900 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          )}

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
                  className="self-start text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
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
                <option value="Analysis">Analysis</option>
                <option value="Showcase">Showcase</option>
                <option value="Question">Question</option>
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
                placeholder="tech, encryption, privacy"
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
              disabled={!title.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-emerald-500 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-violet-600/20"
            >
              Publish Post
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
