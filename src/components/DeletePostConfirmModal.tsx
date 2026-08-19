import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, AlertTriangle, RefreshCw, X, Check, ShieldAlert } from 'lucide-react';
import { Post } from '../types';

interface DeletePostConfirmModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (postId: string) => Promise<void> | void;
}

// Generate a random mix of letters, numbers, and symbols (e.g., 6 characters)
function generateVerificationCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*?';
  
  const pool = letters + numbers + symbols;
  let code = '';
  
  // Guarantee at least 1 letter, 1 number, 1 symbol
  code += letters.charAt(Math.floor(Math.random() * letters.length));
  code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  code += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  // Add 3 more random characters from combined pool
  for (let i = 0; i < 3; i++) {
    code += pool.charAt(Math.floor(Math.random() * pool.length));
  }
  
  // Shuffle code characters
  return code
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

export const DeletePostConfirmModal: React.FC<DeletePostConfirmModalProps> = ({
  post,
  isOpen,
  onClose,
  onConfirmDelete
}) => {
  const [challengeCode, setChallengeCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const resetChallenge = useCallback(() => {
    setChallengeCode(generateVerificationCode());
    setUserInput('');
    setErrorMessage(null);
    setIsDeleting(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetChallenge();
    }
  }, [isOpen, resetChallenge]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (userInput.trim() !== challengeCode.trim()) {
      setErrorMessage('Incorrect confirmation code. Please type the exact letters, numbers, and symbols shown above.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    try {
      setIsDeleting(true);
      await onConfirmDelete(post.id);
      onClose();
    } catch (err) {
      console.error('Deletion error:', err);
      setErrorMessage('Failed to delete post. Please check your network connection and try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div 
      id="delete-post-dialog-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="delete-post-dialog"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-slate-950 border border-rose-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-150 ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-950 border-b border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                <span>Delete Post</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-400 text-[10px] font-mono border border-rose-800/60">
                  Irreversible
                </span>
              </h3>
              <p className="text-xs text-slate-400">Confirm post removal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Post Information Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-violet-900/30 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                {post.subBuvakiName}
              </span>
              <span className="text-[10px] text-slate-500">
                {post.type.toUpperCase()}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-relaxed">
              "{post.title}"
            </h4>
          </div>

          {/* Security Challenge Instructions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Type this code to confirm deletion:</span>
              </label>
              <button
                type="button"
                onClick={resetChallenge}
                className="text-[11px] text-violet-400 hover:text-violet-200 flex items-center gap-1 font-medium transition-colors"
                title="Generate a new random code"
              >
                <RefreshCw className="w-3 h-3" />
                <span>New code</span>
              </button>
            </div>

            {/* Random Verification Code Display */}
            <div className="p-4 rounded-2xl bg-slate-900 border-2 border-dashed border-rose-700/50 flex items-center justify-center shadow-inner select-all">
              <span className="text-2xl font-mono font-black tracking-widest text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                {challengeCode}
              </span>
            </div>
          </div>

          {/* User Confirmation Input */}
          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter the exact code shown above..."
              autoFocus
              className={`w-full px-4 py-3 rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 text-sm font-mono text-center tracking-widest border transition-all focus:outline-none ${
                errorMessage
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-950/20'
                  : userInput === challengeCode
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-950/10'
                  : 'border-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              }`}
            />

            {/* Error or Success feedback message */}
            {errorMessage ? (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : userInput === challengeCode && challengeCode.length > 0 ? (
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Code verified. Ready to delete.</span>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || !userInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-black text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              {isDeleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm & Delete</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
