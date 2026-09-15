import React, { useState, useEffect, useRef } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage, User } from '../types';
import { getTranslation, isRTL } from '../lib/translations';
import { Logo } from './Logo';
import { FlagIcon } from './FlagIcon';
import { 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  User as UserIcon, 
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
  Upload
} from 'lucide-react';
import { 
  dbLoginWithGoogle, 
  dbSaveUserProfile
} from '../lib/firebase';

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
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Clear errors on step change
  useEffect(() => {
    setAuthError('');
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
      {/* SCREEN 3 & 4: GOOGLE SIGN IN / SIGN UP               */}
      {/* ---------------------------------------------------- */}
      {(currentStep === 'signin' || currentStep === 'signup') && (
        <div className="relative z-10 max-w-[420px] w-full px-4 animate-fadeIn flex flex-col items-center">
          
          {/* Main Card Container with Left Curved Gradient Accent & Wireframe Watermark */}
          <div className="relative w-full bg-white rounded-[26px] shadow-2xl border border-neutral-100/90 p-7 sm:p-8 overflow-hidden">
            
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

            {/* Content Body */}
            <div className="relative z-10 pl-2 sm:pl-3 space-y-6">
              
              {/* Row 1: [logo] buvaki */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Logo size="sm" showText={false} />
                  <span className="font-bold text-neutral-900 text-xl tracking-tight lowercase font-sans">
                    buvaki
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('language')}
                  className="px-2.5 py-1 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Change language"
                >
                  <FlagIcon code={selectedLanguage.code} size="sm" />
                  <span className="font-semibold">{selectedLanguage.code.toUpperCase()}</span>
                </button>
              </div>

              {/* Row 2: Title */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
                  Sign in
                </h2>
              </div>

              {/* Error banner if any */}
              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed animate-shake">
                  {authError}
                </div>
              )}

              {/* Row 4: [Continue with Google] */}
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
                currentStep === 'signin' ? 'w-8 bg-[#22c55e]' : 'w-5 bg-neutral-300'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep === 'signup' ? 'w-8 bg-[#22c55e]' : 'w-5 bg-neutral-300'
              }`}
            />
          </div>

          {/* Subtle Guest / Skip Option */}
          <div className="mt-4 text-center">
            <button
              onClick={onSkipToApp}
              className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors cursor-pointer"
            >
              {t.continueWithoutSigningIn}
            </button>
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
