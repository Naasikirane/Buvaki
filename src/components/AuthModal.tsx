import React, { useState } from 'react';
import { User, SupportedLanguage } from '../types';
import { getTranslation, isRTL } from '../lib/translations';
import { Logo } from './Logo';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { 
  dbLoginWithEmail, 
  dbRegisterWithEmail, 
  dbLoginWithGoogle, 
  dbSendFirebaseEmailLink,
  dbVerifyCodeAndCreateUser,
  dbSendVerificationCode
} from '../lib/firebase';
import { CURRENT_USER } from '../data/mockData';
import { GENERIC_AVATARS } from './OnboardingFlow';

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
  const [authMethod, setAuthMethod] = useState<'password' | 'code'>('password');
  
  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up fields
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpGender, setSignUpGender] = useState<'male' | 'female' | 'prefer_not_to_say'>('prefer_not_to_say');

  // Verification Code flow fields
  const [codeTarget, setCodeTarget] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = getTranslation(selectedLanguage.code);

  const resetState = () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(false);
  };

  const handleTabSwitch = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    resetState();
  };

  // 1. Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      setError('Please enter both your email and password.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const user = await dbLoginWithEmail(signInEmail.trim(), signInPassword);
      onCompleteAuth(user);
      onClose();
    } catch (err: any) {
      console.error('Sign In error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Incorrect email or password. Please try again or create an account.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Password Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpEmail.trim() || !signUpPassword || !signUpUsername.trim()) {
      setError('Please provide your username, email, and a secure password.');
      return;
    }
    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const user = await dbRegisterWithEmail(
        signUpEmail.trim(), 
        signUpPassword, 
        signUpUsername.trim(), 
        selectedLanguage.name
      );
      // Attach gender avatar
      const avatarUrl = GENERIC_AVATARS[signUpGender]?.url || user.avatar;
      const finalUser: User = {
        ...user,
        gender: signUpGender,
        avatar: avatarUrl,
      };
      onCompleteAuth(finalUser);
      onClose();
    } catch (err: any) {
      console.error('Sign Up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please switch to Sign In.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Failed to register account.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Google Sign In
  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const user = await dbLoginWithGoogle(selectedLanguage.name);
      if (user) {
        onCompleteAuth(user);
        onClose();
      }
      // If user is null, user voluntarily cancelled/closed the popup without completing sign in
    } catch (err: any) {
      if (
        err?.code !== 'auth/popup-closed-by-user' &&
        err?.code !== 'auth/cancelled-popup-request' &&
        !err?.message?.includes('Pending promise was never set')
      ) {
        console.warn('Google Auth note:', err?.message || err);
        setError(err.message || 'Google sign-in was interrupted. You can also sign in using Email or Demo Creator mode.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Send Verification Code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeTarget.trim()) {
      setError('Please enter your email to receive a verification code.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await dbSendVerificationCode(codeTarget.trim(), 'email');
      setCodeSent(true);
      setSuccessMsg(`A 6-digit verification code was sent to ${codeTarget.trim()}`);
    } catch (err: any) {
      console.error('Send code error:', err);
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Verify Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const user = await dbVerifyCodeAndCreateUser(
        codeTarget.trim(), 
        verificationCode.trim(), 
        codeTarget.split('@')[0], 
        selectedLanguage.name
      );
      onCompleteAuth(user);
      onClose();
    } catch (err: any) {
      console.error('Verify code error:', err);
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Fast Demo Creator Login
  const handleDemoLogin = () => {
    onCompleteAuth(CURRENT_USER);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        dir={isRTL(selectedLanguage.code) ? 'rtl' : 'ltr'}
        className="relative w-full max-w-md bg-slate-950 border border-violet-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] custom-scrollbar"
      >
        {/* Header Ribbon with Brand & Close Button */}
        <div className="relative p-5 pb-3 flex items-center justify-between border-b border-violet-900/40 bg-gradient-to-r from-violet-950/80 via-slate-900/60 to-pink-950/40">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900/60 border border-violet-700/50 text-violet-300 font-semibold">
              Free Access
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Prompt Reason Banner if triggered by an interaction */}
          {promptReason && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-pink-950/40 border border-pink-500/40 text-pink-200 text-xs">
              <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-pink-300">Sign in required</span>
                <span>{promptReason}</span>
              </div>
            </div>
          )}

          {/* Tab Switcher (Sign In vs Sign Up) */}
          <div className="flex p-1 rounded-2xl bg-slate-900/90 border border-violet-900/50">
            <button
              onClick={() => handleTabSwitch('signin')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'signin'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'signup'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Login */}
          <button
            onClick={handleDemoLogin}
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 hover:from-amber-500/30 hover:to-pink-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>⚡ 1-Click Instant Demo Login (MayaLin)</span>
          </button>

          {/* Google 1-Tap Auth */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-violet-800/40 text-slate-100 text-xs font-bold transition-all hover:border-violet-500/60 disabled:opacity-50 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">or with email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Username</label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    placeholder="e.g. MayaLin"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-300">Password (6+ chars)</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-violet-900/40 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {/* Gender Avatar Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Avatar Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'female', label: 'Female', img: GENERIC_AVATARS.female.url },
                    { key: 'male', label: 'Male', img: GENERIC_AVATARS.male.url },
                    { key: 'prefer_not_to_say', label: 'Neutral', img: GENERIC_AVATARS.prefer_not_to_say.url },
                  ].map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setSignUpGender(g.key as any)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
                        signUpGender === g.key
                          ? 'border-pink-500 bg-pink-950/40 text-white ring-1 ring-pink-500'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <img src={g.img} alt={g.label} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-[10px] font-medium">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Guest browsing notice */}
          <div className="text-center pt-2 border-t border-slate-900">
            <button
              onClick={onClose}
              type="button"
              className="text-xs text-slate-400 hover:text-slate-200 underline decoration-slate-600 underline-offset-4"
            >
              Continue browsing for free as guest
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
