import React, { useState } from 'react';
import { User, SupportedLanguage } from '../types';
import { Logo } from './Logo';
import { X } from 'lucide-react';
import { dbLoginWithGoogle } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteAuth: (user: User) => void;
  promptReason?: string;
  selectedLanguage: SupportedLanguage;
  defaultTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onCompleteAuth,
  promptReason,
  selectedLanguage,
  defaultTab = 'signin',
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Google 1-Click Sign In / Sign Up
  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const user = await dbLoginWithGoogle(selectedLanguage?.name || 'English');
      if (user) {
        onCompleteAuth(user);
        onClose();
      }
    } catch (err: any) {
      if (
        err?.code !== 'auth/popup-closed-by-user' &&
        err?.code !== 'auth/cancelled-popup-request' &&
        !err?.message?.includes('Pending promise was never set')
      ) {
        console.warn('Google sign-in exception:', err);
        setError(err?.message || 'Google sign-in could not be completed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex flex-col items-center w-full max-w-[420px]">
        {/* Main Card Container with Left Curved Gradient Accent & Wireframe Watermark */}
        <div 
          className="relative w-full bg-white rounded-[26px] shadow-2xl border border-neutral-100/90 p-7 sm:p-8 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Distinctive left curved gradient border accent matching the reference image */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#22c55e] via-[#10b981] to-[#06b6d4] rounded-l-[26px]" />

          {/* Subtle geometric wireframe background lines like in reference image */}
          <svg
            className="absolute right-0 top-0 bottom-0 w-3/5 h-full opacity-[0.16] pointer-events-none stroke-[#22c55e]"
            viewBox="0 0 300 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M50 0L120 70L220 20L300 80L300 0Z" strokeWidth="1" />
            <path d="M120 70L160 140L260 120L300 80" strokeWidth="1" />
            <path d="M50 0L80 120L160 140" strokeWidth="1" />
            <path d="M80 120L130 200L220 200L260 120" strokeWidth="1" />
            <path d="M160 140L220 200" strokeWidth="1" />
            <path d="M220 20L260 120L300 200" strokeWidth="1" />
            <path d="M0 60L50 0L80 120L0 150Z" strokeWidth="1" />
          </svg>

          {/* Card Content */}
          <div className="relative z-10 pl-2 sm:pl-3 space-y-6">
            {/* Header: [logo] buvaki and Close button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo size="sm" showText={false} />
                <span className="font-bold text-neutral-900 text-xl tracking-tight lowercase font-sans">
                  buvaki
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt reason if present */}
            {promptReason && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium text-center">
                {promptReason}
              </div>
            )}

            {/* Titles & Switcher */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
                {activeTab === 'signin' ? 'Sign in' : 'Sign up'}
              </h2>

              <p className="text-sm text-neutral-600">
                {activeTab === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setActiveTab('signup');
                      }}
                      className="text-[#22c55e] hover:text-[#16a34a] font-semibold hover:underline cursor-pointer transition-colors"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setActiveTab('signin');
                      }}
                      className="text-[#22c55e] hover:text-[#16a34a] font-semibold hover:underline cursor-pointer transition-colors"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Error banner if any */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed animate-shake">
                {error}
              </div>
            )}

            {/* Continue with Google button matching image outline style */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#22c55e] hover:border-[#16a34a] bg-white hover:bg-[#22c55e]/5 text-[#16a34a] hover:text-[#15803d] font-semibold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xs active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#22c55e]/30 border-t-[#22c55e] rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Indicator dots below the card matching reference image */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeTab === 'signin' ? 'w-8 bg-[#22c55e]' : 'w-5 bg-neutral-300'
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeTab === 'signup' ? 'w-8 bg-[#22c55e]' : 'w-5 bg-neutral-300'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
