import React, { useState, useEffect, useRef } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage, User, COUNTRY_CODES } from '../types';
import { getTranslation, isRTL } from '../lib/translations';
import { Logo } from './Logo';
import { FlagIcon } from './FlagIcon';
import { 
  Globe, 
  Mail, 
  Phone,
  ArrowRight, 
  CheckCircle2, 
  User as UserIcon, 
  Lock,
  Camera,
  Sparkles,
  Calendar,
  GraduationCap,
  Briefcase,
  Palette,
  Dog,
  Tag,
  Plus,
  ChevronRight,
  Upload,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { 
  dbRegisterWithEmail, 
  dbLoginWithEmail, 
  dbLoginWithGoogle, 
  dbSaveUserProfile,
  dbSetupRecaptcha,
  dbSendPhoneVerificationCode,
  dbVerifyPhoneCode
} from '../lib/firebase';
import type { ConfirmationResult } from 'firebase/auth';

export type OnboardingStep = 'splash' | 'language' | 'signin' | 'signup' | 'profile';

export const GENERIC_AVATARS: Record<string, { name: string; url: string }> = {
  male: {
    name: 'Generic Male Placeholder',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none"><rect width="200" height="200" fill="%23d1d5db"/><path d="M100 40 C80 40 68 55 68 78 C68 98 80 112 100 112 C120 112 132 98 132 78 C132 55 120 40 100 40 Z" fill="%239ca3af"/><path d="M100 120 C62 120 40 148 35 200 L165 200 C160 148 138 120 100 120 Z" fill="%239ca3af"/></svg>'
  },
  female: {
    name: 'Generic Female Placeholder',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none"><rect width="200" height="200" fill="%23e5e7eb"/><path d="M100 28 C70 28 55 52 55 88 C55 115 68 126 68 126 C68 126 80 130 100 130 C120 130 132 126 132 126 C132 126 145 115 145 88 C145 52 130 28 100 28 Z" fill="%239ca3af"/><circle cx="100" cy="78" r="36" fill="%23e5e7eb"/><path d="M100 125 C62 125 40 150 35 200 L165 200 C160 150 138 125 100 125 Z" fill="%239ca3af"/></svg>'
  },
  prefer_not_to_say: {
    name: 'Generic Placeholder',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none"><rect width="200" height="200" fill="%23e2e8f0"/><circle cx="100" cy="75" r="38" fill="%2394a3b8"/><path d="M100 125 C60 125 35 152 30 200 L170 200 C165 152 142 125 100 125 Z" fill="%2394a3b8"/></svg>'
  }
};

export const getGenericAvatarByGender = (gender?: string): string => {
  if (gender === 'male') return GENERIC_AVATARS.male.url;
  if (gender === 'female') return GENERIC_AVATARS.female.url;
  return GENERIC_AVATARS.prefer_not_to_say.url;
};

export const PRESET_INTERESTS = [
  'Photography & Visuals',
  'AI & Tech Innovations',
  'Design & Creative Arts',
  'Gaming & Esports',
  'Music & Audio',
  'Travel & Lifestyle',
  'Film & Entertainment',
  'Fitness & Wellness',
  'Science & Nature',
  'Coding & Development'
];

export const PRESET_COLORS = [
  { name: 'Vibrant Violet', hex: '#8b5cf6' },
  { name: 'Rose Pink', hex: '#ec4899' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Deep Purple', hex: '#7c3aed' },
  { name: 'Sunset Coral', hex: '#f43f5e' },
  { name: 'Neon Amber', hex: '#f59e0b' },
  { name: 'Electric Sky', hex: '#3b82f6' },
];

interface OnboardingFlowProps {
  currentStep: OnboardingStep;
  setStep: (step: OnboardingStep) => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onCompleteAuth: (user: User) => void;
  onSkipToApp: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  currentStep,
  setStep,
  selectedLanguage,
  onSelectLanguage,
  onCompleteAuth,
  onSkipToApp,
}) => {
  // Track if language has been explicitly selected in this session
  const [hasChosenLang, setHasChosenLang] = useState<boolean>(false);

  // Pending user during profile creation step
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  // Profile Form states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>('');
  const [customAvatarInput, setCustomAvatarInput] = useState<string>('');
  const [genderInput, setGenderInput] = useState<'male' | 'female' | 'prefer_not_to_say'>('prefer_not_to_say');
  const [bioInput, setBioInput] = useState<string>('');
  const [dobInput, setDobInput] = useState<string>('');
  const [schoolingInput, setSchoolingInput] = useState<string>('');
  const [occupationInput, setOccupationInput] = useState<string>('');
  const [nicheInput, setNicheInput] = useState<string>('');
  const [bestColor, setBestColor] = useState<string>('#9333ea');
  const [petNameInput, setPetNameInput] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterestInput, setCustomInterestInput] = useState<string>('');

  // Auth Form states
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneConfirmation, setPhoneConfirmation] = useState<ConfirmationResult | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifyingPhoneCode, setIsVerifyingPhoneCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Clear errors and temporary codes on step change
  useEffect(() => {
    setAuthError('');
    setIsVerifyingPhoneCode(false);
    setVerificationCode('');
    setPhoneConfirmation(null);
  }, [currentStep]);

  // Auto-proceed from splash screen after 3 seconds (3000ms)
  useEffect(() => {
    if (currentStep !== 'splash') return;
    const timer = setTimeout(() => {
      setStep('language');
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentStep, setStep]);

  const handleLanguagePick = (lang: SupportedLanguage) => {
    onSelectLanguage(lang);
    setHasChosenLang(true);
  };

  // Launch Profile step after Auth success
  const startProfileStep = (user: User) => {
    setPendingUser(user);
    setGenderInput((user.gender as any) || 'prefer_not_to_say');
    setSelectedAvatarUrl(
      user.avatar && !user.avatar.includes('unsplash.com') && !user.avatar.startsWith('data:image/svg') 
        ? user.avatar 
        : ''
    );
    setBioInput(user.bio || '');
    setDobInput(user.dob || '');
    setSchoolingInput(user.schooling || '');
    setOccupationInput(user.occupation || '');
    setNicheInput(user.niche || '');
    setBestColor(user.bestColor || '#9333ea');
    setPetNameInput(user.petName || '');
    setSelectedInterests(user.interests || []);
    setStep('profile');
  };

  // Complete profile saving
  const handleFinishProfile = async (isSkip: boolean = false) => {
    if (!pendingUser) {
      onSkipToApp();
      return;
    }
    setIsLoading(true);

    try {
      let finalAvatar = selectedAvatarUrl || customAvatarInput.trim();

      // If no picture selected/uploaded or skipping, auto-assign gender-matched generic avatar!
      if (!finalAvatar || isSkip) {
        if (!pendingUser.avatar || pendingUser.avatar.includes('unsplash.com') || pendingUser.avatar.startsWith('data:image/svg')) {
          finalAvatar = getGenericAvatarByGender(genderInput);
        } else {
          finalAvatar = pendingUser.avatar;
        }
      }

      const updatedUser: User = {
        ...pendingUser,
        avatar: finalAvatar,
        gender: genderInput,
        bio: (!isSkip && bioInput.trim()) ? bioInput.trim() : (pendingUser.bio || `Buvaki member (${selectedLanguage.name})`),
        dob: (!isSkip && dobInput) ? dobInput : pendingUser.dob,
        schooling: (!isSkip && schoolingInput.trim()) ? schoolingInput.trim() : pendingUser.schooling,
        occupation: (!isSkip && occupationInput.trim()) ? occupationInput.trim() : pendingUser.occupation,
        niche: (!isSkip && nicheInput.trim()) ? nicheInput.trim() : pendingUser.niche,
        bestColor: (!isSkip && bestColor) ? bestColor : pendingUser.bestColor,
        petName: (!isSkip && petNameInput.trim()) ? petNameInput.trim() : pendingUser.petName,
        interests: (!isSkip && selectedInterests.length > 0) ? selectedInterests : pendingUser.interests,
      };

      await dbSaveUserProfile(updatedUser);
      onCompleteAuth(updatedUser);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      onCompleteAuth(pendingUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle uploading avatar photo directly from phone storage / gallery
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAuthError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400; // Crisp 400x400 avatar
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedAvatarUrl(dataUrl);
          setCustomAvatarInput('');
          setAuthError('');
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => 
      prev.includes(interest) 
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAddCustomInterest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customInterestInput.trim()) return;
    const tag = customInterestInput.trim();
    if (!selectedInterests.includes(tag)) {
      setSelectedInterests((prev) => [...prev, tag]);
    }
    setCustomInterestInput('');
  };

  // Direct Email/Password Auth (Sign In or Sign Up)
  const handleDirectAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      if (currentStep === 'signup') {
        const u = await dbRegisterWithEmail(emailInput, passwordInput, usernameInput || emailInput.split('@')[0], selectedLanguage.name);
        startProfileStep(u);
      } else {
        const u = await dbLoginWithEmail(emailInput, passwordInput);
        startProfileStep(u);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid credentials. Please verify your email and password, or continue with Google.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Real Google OAuth Login
  const handleGoogleAuth = async () => {
    setAuthError('');
    setIsLoading(true);
    try {
      const user = await dbLoginWithGoogle(selectedLanguage.name);
      if (user) {
        startProfileStep(user);
      }
    } catch (err: any) {
      if (
        err?.code !== 'auth/popup-closed-by-user' &&
        err?.code !== 'auth/cancelled-popup-request' &&
        !err?.message?.includes('Pending promise was never set')
      ) {
        console.warn("Google Auth note:", err?.message || err);
        setAuthError(err?.message || 'Google sign-in could not be completed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Official Firebase Phone Sign In/Up: Send SMS Code
  const handleSendPhoneCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    const cleanNumber = phoneInput.replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber.length < 5) {
      setAuthError('Please enter a valid phone number.');
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanNumber}`;
    setIsLoading(true);

    try {
      const verifier = dbSetupRecaptcha('recaptcha-onboarding-container', () => {
        setAuthError('Security verification expired. Please request the code again.');
      });
      const confirmation = await dbSendPhoneVerificationCode(fullPhoneNumber, verifier);
      setPhoneConfirmation(confirmation);
      setIsVerifyingPhoneCode(true);
      setResendCooldown(60);
    } catch (err: any) {
      console.error('Phone sign-in send error:', err);
      setAuthError(err.message || 'Failed to send SMS verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Official Firebase Phone Sign In/Up: Confirm SMS Code
  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneConfirmation) {
      setAuthError('No active phone verification. Please request a new code.');
      return;
    }
    if (!verificationCode || verificationCode.trim().length < 6) {
      setAuthError('Please enter the 6-digit SMS verification code.');
      return;
    }

    setAuthError('');
    setIsLoading(true);

    try {
      const user = await dbVerifyPhoneCode(
        phoneConfirmation, 
        verificationCode.trim(), 
        usernameInput || undefined, 
        selectedLanguage.name
      );
      startProfileStep(user);
    } catch (err: any) {
      console.error('Phone verification error:', err);
      setAuthError(err.message || 'SMS code verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const t = getTranslation(selectedLanguage.code);
  const rtl = isRTL(selectedLanguage.code);

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      
      {/* FLOATING AMBIENT BACKGROUND (NON-GRID, DRIFTING SHAPES) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-900/20 rounded-full blur-3xl animate-pulse duration-7000" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-violet-900/15 rounded-full blur-3xl" />
      </div>

      {/* ---------------------------------------------------- */}
      {/* SCREEN 1: SPLASH SCREEN (ONLY FLOATING LOGO)          */}
      {/* ---------------------------------------------------- */}
      {currentStep === 'splash' && (
        <div 
          onClick={() => setStep('language')}
          className="relative z-10 w-full h-full min-h-screen flex flex-col items-center justify-center cursor-pointer select-none animate-fadeIn"
        >
          {/* FLOATING LOGO ONLY IN CENTER */}
          <div className="relative flex flex-col items-center justify-center transition-all duration-700 transform hover:scale-105">
            <div className="absolute -inset-8 rounded-full bg-violet-600/25 blur-3xl animate-pulse" />
            <div className="relative p-8 bg-slate-900/40 backdrop-blur-2xl border border-violet-500/25 rounded-3xl shadow-2xl flex items-center justify-center">
              <Logo size="xl" showText={true} />
            </div>

            {/* 3-Second Loading Bar with Solid Violet */}
            <div className="mt-8 w-36 h-1 bg-slate-800/80 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full animate-splash-loader" />
            </div>
          </div>

          {/* BOTTOM CREATOR SIGNATURE */}
          <div className="absolute bottom-8 flex items-center gap-2 text-slate-500 text-xs font-medium tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>made by buvaki</span>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SCREEN 2: LANGUAGE SELECTION                          */}
      {/* ---------------------------------------------------- */}
      {currentStep === 'language' && (
        <div className="relative z-10 max-w-3xl w-full flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fadeIn p-4 sm:p-6">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">Select Language</h2>
            <p className="text-xs sm:text-sm text-slate-400">Choose your preferred language to continue</p>
          </div>

          {/* Clean Grid of Uniform Language Containers */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguagePick(lang)}
                  className={`relative w-full h-20 px-3.5 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 flex items-center gap-3 shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-left overflow-hidden ${
                    isSelected
                      ? 'bg-purple-600/90 border-purple-400 text-white shadow-purple-600/40 ring-2 ring-purple-400/50 scale-[1.02]'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <FlagIcon code={lang.code} size="md" />
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="text-xs sm:text-sm font-bold leading-tight truncate">{lang.name}</div>
                    <div className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">{lang.nativeName}</div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* NEXT BUTTON APPEARS UPON CHOOSING LANGUAGE */}
          {hasChosenLang && (
            <div className="pt-2 animate-fadeIn">
              <button
                type="button"
                onClick={() => setStep('signin')}
                className="py-3.5 px-10 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-xl shadow-purple-600/30 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SCREEN 3 & 4: REAL SIGN IN / SIGN UP                  */}
      {/* ---------------------------------------------------- */}
      {(currentStep === 'signin' || currentStep === 'signup') && (
        <div className="relative z-10 max-w-md w-full animate-fadeIn">
          
          <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo size="sm" showText={true} />
              </div>
              <button
                type="button"
                onClick={() => setStep('language')}
                className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-all"
                title="Change language"
              >
                <FlagIcon code={selectedLanguage.code} size="sm" />
                <span className="font-semibold">{selectedLanguage.code.toUpperCase()}</span>
              </button>
            </div>

            {/* Mode Switcher & Title */}
            <div className="space-y-3">
              <div className="flex bg-slate-950/90 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep('signin')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentStep === 'signin'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.signIn || 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('signup')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentStep === 'signup'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.signUp || 'Sign Up'}
                </button>
              </div>

              <div className="text-center space-y-0.5">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {currentStep === 'signup' ? (t.createAccount || 'Create Your Account') : (t.signIn || 'Sign In to Buvaki')}
                </h2>
                <p className="text-xs text-slate-400">
                  {currentStep === 'signup'
                    ? 'Join community discussions & live channels'
                    : 'Welcome back! Sign in to continue'}
                </p>
              </div>
            </div>

            {/* Error banner */}
            {authError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-300 text-xs leading-relaxed animate-shake">
                {authError}
              </div>
            )}

            {/* Main Auth Body */}
            <div className="space-y-4">
              {/* 1. Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                    <span>{t.continueWithGoogle || 'Continue with Google'}</span>
                  </>
                )}
              </button>

              {/* Modern Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                  or sign in with
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Method Switcher: Email vs Phone */}
              <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('email');
                    setAuthError('');
                    setIsVerifyingPhoneCode(false);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'email'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{t.email || 'Email'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('phone');
                    setAuthError('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'phone'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.phone || 'Phone'}</span>
                </button>
              </div>

              {/* 2A. Email / Password Form */}
              {authMode === 'email' && (
                <form onSubmit={handleDirectAuth} className="space-y-3">
                  {currentStep === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">{t.username || 'Username'}</label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="yourname"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{t.emailAddress || 'Email'}</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{t.password || 'Password'}</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !emailInput || !passwordInput}
                    className="w-full mt-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{currentStep === 'signup' ? (t.createAccount || 'Create Account') : (t.signIn || 'Sign In')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 2B. Official Firebase Phone Sign In / Up */}
              {authMode === 'phone' && (
                <div>
                  {!isVerifyingPhoneCode ? (
                    /* Step 1: Input Phone Number & Country Code */
                    <form onSubmit={handleSendPhoneCode} className="space-y-3">
                      {currentStep === 'signup' && (
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">{t.username || 'Username'}</label>
                          <div className="relative">
                            <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <input
                              type="text"
                              placeholder="yourname"
                              value={usernameInput}
                              onChange={(e) => setUsernameInput(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">{t.phoneNumber || 'Phone Number'}</label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 px-2.5 py-2.5 focus:outline-none focus:border-purple-500 shrink-0"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code} className="bg-slate-900 text-slate-200">
                                {c.flag} {c.code}
                              </option>
                            ))}
                          </select>

                          <div className="relative flex-1">
                            <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <input
                              type="tel"
                              required
                              placeholder="555-0199"
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors font-mono"
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Official Firebase SMS verification code will be sent to your phone.
                        </p>
                      </div>

                      {/* Invisible Firebase reCAPTCHA container */}
                      <div id="recaptcha-onboarding-container"></div>

                      <button
                        type="submit"
                        disabled={isLoading || !phoneInput.trim()}
                        className="w-full mt-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>{t.sendVerificationCode || 'Send SMS Code'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Verify 6-digit SMS code */
                    <form onSubmit={handleVerifyPhoneCode} className="space-y-4">
                      <div className="text-center space-y-1">
                        <div className="inline-flex p-2.5 rounded-full bg-purple-950/80 border border-purple-600/40 text-purple-300 mb-1">
                          <KeyRound className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-white">{t.enterVerificationCode || 'Enter Verification Code'}</h4>
                        <p className="text-xs text-slate-400">
                          Code sent to <span className="font-semibold text-purple-300">{countryCode} {phoneInput}</span>
                        </p>
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          autoFocus
                          placeholder="••••••"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-slate-950/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 placeholder-slate-600"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                        <span>Didn't get code?</span>
                        <button
                          type="button"
                          onClick={handleSendPhoneCode}
                          disabled={resendCooldown > 0 || isLoading}
                          className="text-purple-400 hover:text-purple-300 font-semibold disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                          <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend SMS'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsVerifyingPhoneCode(false);
                            setVerificationCode('');
                            setAuthError('');
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-all cursor-pointer"
                        >
                          {t.back || 'Back'}
                        </button>

                        <button
                          type="submit"
                          disabled={isLoading || verificationCode.length < 6}
                          className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>{currentStep === 'signup' ? (t.createAccount || 'Create Account') : (t.verifyAndSignIn || 'Verify & Sign In')}</span>
                              <CheckCircle2 className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Toggle between Sign In and Sign Up */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              {currentStep === 'signin' ? (
                <>
                  <span>{t.dontHaveAccount || "Don't have an account?"}</span>
                  <button
                    type="button"
                    onClick={() => setStep('signup')}
                    className="text-purple-400 hover:text-purple-300 font-bold px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 transition-all text-xs"
                  >
                    {t.signUp || 'Sign Up'}
                  </button>
                </>
              ) : (
                <>
                  <span>{t.alreadyHaveAccount || 'Already have an account?'}</span>
                  <button
                    type="button"
                    onClick={() => setStep('signin')}
                    className="text-purple-400 hover:text-purple-300 font-bold px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 transition-all text-xs"
                  >
                    {t.signIn || 'Sign In'}
                  </button>
                </>
              )}
            </div>

            {/* Skip Option */}
            <div className="text-center">
              <button
                onClick={onSkipToApp}
                className="text-xs text-slate-500 hover:text-slate-400 underline transition-colors"
              >
                {t.continueWithoutSigningIn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 5: PROFILE CREATION (OPTIONAL SETUP)            */}
      {/* ---------------------------------------------------- */}
      {currentStep === 'profile' && (
        <div className="z-10 w-full max-w-xl mx-auto animate-fade-in my-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                Profile
              </h2>

              <button
                type="button"
                onClick={() => handleFinishProfile(true)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1 shrink-0"
              >
                <span>Skip for now</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hidden file input for phone / device storage upload */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleDeviceFileUpload} 
              className="hidden" 
            />

            {/* Profile Picture / Avatar Section */}
            <div className="space-y-3">
              {/* Selected Avatar Preview & Phone Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-900 border-2 border-purple-500/60 shrink-0 shadow-lg flex items-center justify-center cursor-pointer group hover:border-purple-400 transition-all"
                  title="Click to upload profile photo from phone storage"
                >
                  <img 
                    src={selectedAvatarUrl || customAvatarInput || getGenericAvatarByGender(genderInput)} 
                    alt="Avatar Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getGenericAvatarByGender(genderInput);
                    }}
                  />

                  {/* Camera Hover Badge */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-semibold transition-opacity">
                    <Camera className="w-5 h-5 mb-0.5 text-purple-400" />
                    <span>Upload</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {selectedAvatarUrl || customAvatarInput 
                        ? 'Profile Picture Uploaded' 
                        : 'Default Generic Silhouette'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      {(selectedAvatarUrl || customAvatarInput) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAvatarUrl('');
                            setCustomAvatarInput('');
                          }}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="url"
                    value={customAvatarInput || ''}
                    onChange={(e) => {
                      setCustomAvatarInput(e.target.value);
                      setSelectedAvatarUrl('');
                    }}
                    placeholder="Or paste custom image URL (https://...)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Gender Selection Field */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Gender</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'male', label: 'Male', Icon: UserIcon },
                  { id: 'female', label: 'Female', Icon: UserIcon },
                  { id: 'prefer_not_to_say', label: 'Prefer not to say', Icon: Sparkles },
                ].map((g) => {
                  const isSelected = genderInput === g.id;
                  const GIcon = g.Icon;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGenderInput(g.id as any)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-purple-600/90 border-purple-400 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <GIcon className="w-3.5 h-3.5" />
                      <span className="truncate">{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Date of Birth</span>
                </label>
                <input
                  type="date"
                  value={dobInput || ''}
                  onChange={(e) => setDobInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/60 transition-all"
                />
              </div>

              {/* Schooling / Education */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                  <span>Schooling / Education</span>
                </label>
                <input
                  type="text"
                  value={schoolingInput || ''}
                  onChange={(e) => setSchoolingInput(e.target.value)}
                  placeholder="e.g. Stanford University / High School"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-all"
                />
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>Occupation</span>
                </label>
                <input
                  type="text"
                  value={occupationInput || ''}
                  onChange={(e) => setOccupationInput(e.target.value)}
                  placeholder="e.g. Software Engineer / Student / Designer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-all"
                />
              </div>

              {/* Specific Niche */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>Specific Niche</span>
                </label>
                <input
                  type="text"
                  value={nicheInput || ''}
                  onChange={(e) => setNicheInput(e.target.value)}
                  placeholder="e.g. Quantum Computing, Cybersecurity"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-all"
                />
              </div>

              {/* Pet Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Dog className="w-3.5 h-3.5 text-purple-400" />
                  <span>Name of Pet</span>
                </label>
                <input
                  type="text"
                  value={petNameInput || ''}
                  onChange={(e) => setPetNameInput(e.target.value)}
                  placeholder="e.g. Milo, Luna, Buddy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-all"
                />
              </div>

              {/* Best Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>Favorite Color</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-1 overflow-x-auto">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setBestColor(col.hex)}
                        className={`w-6 h-6 rounded-full shrink-0 transition-transform ${
                          bestColor === col.hex ? 'scale-110 ring-2 ring-white shadow-md' : 'hover:scale-105 opacity-80'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={bestColor || '#9333ea'}
                    onChange={(e) => setBestColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0 p-0"
                    title="Choose custom color"
                  />
                </div>
              </div>

            </div>

            {/* Biography */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Biography</span>
              </label>
              <textarea
                value={bioInput || ''}
                onChange={(e) => setBioInput(e.target.value)}
                rows={2}
                placeholder="Tell the Buvaki community a little about yourself..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-all resize-none"
              />
            </div>

            {/* Interests & Tags */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Interests & Passions</span>
                </span>
                <span className="text-[11px] text-slate-500 font-normal">
                  {selectedInterests.length} selected
                </span>
              </label>

              {/* Selected / Preset Interest Tags */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected 
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {interest}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Interest Tag */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customInterestInput || ''}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomInterest();
                    }
                  }}
                  placeholder="Add custom interest tag..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomInterest()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleFinishProfile(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Skip for Now
              </button>

              <button
                type="button"
                onClick={() => handleFinishProfile(false)}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Save & Continue to Buvaki</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
