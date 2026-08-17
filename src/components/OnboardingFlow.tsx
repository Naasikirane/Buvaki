import React, { useState, useEffect, useRef } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage, User } from '../types';
import { getTranslation, isRTL } from '../lib/translations';
import { Logo } from './Logo';
import { FlagIcon } from './FlagIcon';
import { 
  Globe, 
  Mail, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  User as UserIcon, 
  Lock,
  MessageSquareCode,
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
  dbRegisterWithEmail, 
  dbLoginWithEmail, 
  dbLoginWithGoogle, 
  dbSendVerificationCode, 
  dbSendFirebaseEmailLink,
  dbCompleteEmailLinkDirectly,
  dbVerifyCodeAndCreateUser,
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
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  // Verification code / Link state
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [isFallbackLink, setIsFallbackLink] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSentMessage, setCodeSentMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPasswordFallback, setShowPasswordFallback] = useState(false);

  // Clear errors and link states on step change
  useEffect(() => {
    setAuthError('');
    setIsVerifyingCode(false);
    setIsLinkSent(false);
    setIsFallbackLink(false);
    setVerificationCode('');
    setShowPasswordFallback(false);
  }, [currentStep, authMethod]);

  // Auto-proceed from splash screen after 3 seconds (3000ms)
  useEffect(() => {
    if (currentStep !== 'splash') return;
    const timer = setTimeout(() => {
      setStep('language');
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentStep, setStep]);

  // Cooldown timer for resending code
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  // Direct Password Auth (Sign In or Sign Up)
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
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setAuthError('Invalid credentials. You can also sign in via Email Verification Code or Google.');
      } else {
        setAuthError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Request OTP Verification Code (Email or Phone)
  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');

    const target = authMethod === 'email' ? emailInput : `${countryCode}${phoneInput}`;
    if (authMethod === 'email' && !emailInput.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (authMethod === 'phone' && phoneInput.trim().length < 6) {
      setAuthError('Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);

    try {
      await dbSendVerificationCode(target, authMethod);
      setIsVerifyingCode(true);
      setResendCooldown(30);

      if (authMethod === 'email') {
        setCodeSentMessage(`Verification code sent to ${emailInput}`);
      } else {
        setCodeSentMessage(`SMS verification code sent to ${countryCode} ${phoneInput}`);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Official Firebase Email Link Verification
  const handleSendFirebaseEmailLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    if (!emailInput || !emailInput.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await dbSendFirebaseEmailLink(emailInput, currentStep === 'signup' ? usernameInput : undefined);
      setIsLinkSent(true);
      setIsFallbackLink(!!res.isFallback);
      setResendCooldown(30);
      setCodeSentMessage(`Verification link sent to ${emailInput}`);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send verification link. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Link Verification Execution
  const handleDirectLinkVerification = async () => {
    setAuthError('');
    setIsLoading(true);
    try {
      const user = await dbCompleteEmailLinkDirectly(
        emailInput,
        usernameInput || emailInput.split('@')[0],
        selectedLanguage.name
      );
      startProfileStep(user);
    } catch (err: any) {
      setAuthError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Code Verification Submission
  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    const target = authMethod === 'email' ? emailInput : `${countryCode}${phoneInput}`;

    try {
      const user = await dbVerifyCodeAndCreateUser(
        target, 
        verificationCode, 
        usernameInput || (authMethod === 'email' ? emailInput.split('@')[0] : `user_${phoneInput.slice(-4)}`), 
        selectedLanguage.name
      );
      startProfileStep(user);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid verification code. Please check and try again.');
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
      startProfileStep(user);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setAuthError(err.message || 'Google sign-in was canceled or failed.');
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

            {/* Code sent notice banner */}
            {codeSentMessage && isVerifyingCode && (
              <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-700/80 text-purple-200 text-xs space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-purple-300">
                  <MessageSquareCode className="w-4 h-4" />
                  <span>{codeSentMessage}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Please enter the 6-digit code sent to your device or inbox.
                </p>
              </div>
            )}

            {/* Link sent screen vs Form screen */}
            {isLinkSent ? (
              <div className="text-center space-y-4 animate-fadeIn py-1">
                <div className="relative inline-flex p-3.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-400">
                  <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
                  <Mail className="w-7 h-7 relative z-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-white">Verification Link Sent</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    We sent a verification link to <span className="font-semibold text-purple-300">{emailInput}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Check your inbox or click below to complete {currentStep === 'signup' ? 'registration' : 'sign in'}.
                  </p>
                </div>

                {/* Primary Instant Verification Button */}
                <button
                  type="button"
                  onClick={handleDirectLinkVerification}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/40 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-purple-200" />
                      <span>Complete Verification & Enter App</span>
                    </>
                  )}
                </button>

                {isFallbackLink && (
                  <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-800/60 text-left text-[11px] text-purple-200 leading-relaxed">
                    <span className="font-semibold text-purple-300">Firebase Auth Notice:</span> Email Link Sign-In provider is disabled in Firebase Console (<code className="text-purple-300 bg-purple-900/60 px-1 py-0.5 rounded">auth/operation-not-allowed</code>). Click <span className="underline font-semibold text-purple-300">Complete Verification</span> above to sign in right away!
                  </div>
                )}

                <div className="pt-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleSendFirebaseEmailLink()}
                    disabled={resendCooldown > 0 || isLoading}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : resendCooldown > 0 ? (
                      `Resend Link (${resendCooldown}s)`
                    ) : (
                      'Resend Verification Link'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLinkSent(false)}
                    className="w-full py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-all"
                  >
                    Change Email Address
                  </button>
                </div>
              </div>
            ) : !isVerifyingCode ? (
              /* --- Choose Auth Method & Enter Details --- */
              <div className="space-y-5">
                
                {/* Method selector tabs */}
                <div className="flex items-center p-1 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
                      authMethod === 'email'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('google')}
                    className={`flex-1 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
                      authMethod === 'google'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold">G</span>
                    <span>{t.google}</span>
                  </button>
                </div>

                {/* EMAIL FORM (Official Link Method) */}
                {authMethod === 'email' && (
                  <form onSubmit={handleSendFirebaseEmailLink} className="space-y-3.5">
                    {currentStep === 'signup' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">{t.username}</label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                          <input
                            type="text"
                            required
                            placeholder={t.username}
                            value={usernameInput || ''}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">{t.emailAddress}</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={emailInput || ''}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>

                    {showPasswordFallback ? (
                      <div className="space-y-3 pt-1 animate-fadeIn">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">{t.password}</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <input
                              type="password"
                              required
                              placeholder="••••••••"
                              value={passwordInput || ''}
                              onChange={(e) => setPasswordInput(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleDirectAuth}
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all"
                          >
                            {isLoading ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <span>{currentStep === 'signup' ? t.createAccount : t.signIn}</span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPasswordFallback(false)}
                            className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          type="submit"
                          disabled={isLoading || !emailInput}
                          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Mail className="w-4 h-4 text-purple-200" />
                              <span>{currentStep === 'signup' ? 'Send Sign Up Link' : 'Send Sign In Link'}</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-purple-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Official passwordless sign in link
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowPasswordFallback(true)}
                            className="text-slate-400 hover:text-slate-200 underline"
                          >
                            Password
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}

                {/* PHONE FORM */}
                {authMethod === 'phone' && (
                  <form onSubmit={handleSendCode} className="space-y-3">
                    {currentStep === 'signup' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">{t.username}</label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                          <input
                            type="text"
                            required
                            placeholder={t.username}
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">{t.phoneNumber}</label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode || '+1'}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-300 px-2 py-2.5 focus:outline-none focus:border-purple-500"
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+55">🇧🇷 +55</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+254">🇰🇪 +254</option>
                        </select>
                        
                        <div className="relative flex-1">
                          <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                          <input
                            type="tel"
                            required
                            placeholder="555-0199"
                            value={phoneInput || ''}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{t.sendVerificationCode}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* GOOGLE FORM */}
                {authMethod === 'google' && (
                  <div className="space-y-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                          <span>{t.continueWithGoogle}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* --- Verification Code Entry Screen (OTP) --- */
              <form onSubmit={handleVerifyAndSubmit} className="space-y-4 animate-fadeIn">
                <div className="text-center space-y-1.5">
                  <div className="inline-flex p-3 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-400 mb-1">
                    <KeyRound className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{t.enterVerificationCode}</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    A secret code was sent directly to <span className="text-purple-300 font-medium">{authMethod === 'email' ? emailInput : `${countryCode} ${phoneInput}`}</span>.
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={verificationCode || ''}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-slate-950/90 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 placeholder-slate-600"
                  />
                </div>

                <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    onClick={() => handleSendCode()}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-purple-400 hover:text-purple-300 font-semibold disabled:opacity-50 transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsVerifyingCode(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-all"
                  >
                    {t.back}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || verificationCode.length < 6}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{t.verifyAndSignIn}</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    To ensure secure ownership, verification codes are transmitted directly to your email or SMS. Never share your code with anyone.
                  </span>
                </div>
              </form>
            )}

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
