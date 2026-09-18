import React, { useState, useRef } from 'react';
import { User, SupportedLanguage } from '../types';
import { Logo } from './Logo';
import { 
  User as UserIcon, 
  Calendar, 
  Sparkles, 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AtSign, 
  Smile, 
  Camera, 
  RotateCcw
} from 'lucide-react';
import { dbSaveUserProfile } from '../lib/firebase';
import { getGenericAvatarByGender, PRESET_INTERESTS } from './OnboardingFlow';

export type ProfileSetupStep = 'identity' | 'demographics' | 'description' | 'success';

interface FirstTimeUserProfileSetupProps {
  initialUser: User;
  onComplete: (completedUser: User) => void;
  selectedLanguage: SupportedLanguage;
}

export const FirstTimeUserProfileSetup: React.FC<FirstTimeUserProfileSetupProps> = ({
  initialUser,
  onComplete,
  selectedLanguage,
}) => {
  const [currentSubStep, setCurrentSubStep] = useState<ProfileSetupStep>('identity');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1: Profile picture, username, user handle
  const [avatarUrl, setAvatarUrl] = useState<string>(initialUser.avatar || '');
  const [username, setUsername] = useState<string>(initialUser.username || '');
  const [handle, setHandle] = useState<string>(
    initialUser.handle ? initialUser.handle.replace(/^@/, '') : initialUser.username.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'member'
  );

  // Step 2: Date of birth, gender
  const [dob, setDob] = useState<string>(initialUser.dob || '');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say'>(
    (initialUser.gender as any) || 'prefer_not_to_say'
  );

  // Step 3: Profile description
  const [bio, setBio] = useState<string>(initialUser.bio || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialUser.interests || []);

  // Final saved user for Step 4 (success display)
  const [finalUser, setFinalUser] = useState<User>(initialUser);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload avatar from device gallery / camera
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
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
          setAvatarUrl(dataUrl);
          setErrorMessage('');
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Reset avatar to Google default or generic
  const handleResetAvatar = () => {
    setAvatarUrl(initialUser.avatar || getGenericAvatarByGender(gender));
  };

  // Format user handle as they type
  const handleHandleChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setHandle(clean);
  };

  // Step 1 validation & proceed
  const handleNextFromIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!username.trim()) {
      setErrorMessage('Please enter a username.');
      return;
    }
    if (!handle.trim()) {
      setErrorMessage('Please enter a user handle.');
      return;
    }
    if (handle.length < 3) {
      setErrorMessage('Handle must be at least 3 characters.');
      return;
    }
    setCurrentSubStep('demographics');
  };

  // Step 2 validation & proceed
  const handleNextFromDemographics = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setCurrentSubStep('description');
  };

  // Toggle quick tag in description
  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((i) => i !== tag) : [...prev, tag]
    );
  };

  // Step 3 submission & transition to Step 4 (Successfully made a profile)
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const sanitizedHandle = `@${handle.trim().replace(/^@/, '')}`;
      const effectiveAvatar = avatarUrl || getGenericAvatarByGender(gender);

      const updatedUserData: User = {
        ...initialUser,
        username: username.trim(),
        handle: sanitizedHandle,
        avatar: effectiveAvatar,
        gender,
        dob: dob || undefined,
        bio: bio.trim() || `Buvaki member • ${selectedLanguage.name}`,
        interests: selectedInterests,
        isProfileCompleted: true,
        isFirstTimeUser: false,
        status: 'online',
      };

      await dbSaveUserProfile(updatedUserData);
      setFinalUser(updatedUserData);
      // Advance to Step 4: Successfully made a profile
      setCurrentSubStep('success');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMessage(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Skip profile setup and enter immediately with completed status
  const handleSkipForNow = async () => {
    setIsLoading(true);
    try {
      const sanitizedHandle = handle.trim() ? `@${handle.trim().replace(/^@/, '')}` : (initialUser.handle || `@user_${Math.floor(Math.random() * 1000)}`);
      const effectiveAvatar = avatarUrl || initialUser.avatar || getGenericAvatarByGender(gender);
      const skippedUser: User = {
        ...initialUser,
        username: username.trim() || initialUser.username || 'Buvaki Member',
        handle: sanitizedHandle,
        avatar: effectiveAvatar,
        isProfileCompleted: true,
        isFirstTimeUser: false,
        status: 'online',
      };
      await dbSaveUserProfile(skippedUser);
      onComplete(skippedUser);
    } catch (err) {
      const fallbackUser: User = {
        ...initialUser,
        isProfileCompleted: true,
        isFirstTimeUser: false,
      };
      onComplete(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[460px] bg-white rounded-[26px] shadow-2xl border border-neutral-100/90 p-7 sm:p-8 overflow-hidden animate-fadeIn">
      {/* Curved left accent gradient border matching reference styling */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#22c55e] via-[#10b981] to-[#06b6d4] rounded-l-[26px]" />

      {/* Subtle geometric wireframe watermark lines */}
      <svg
        className="absolute right-0 top-0 bottom-0 w-3/5 h-full opacity-[0.12] pointer-events-none stroke-[#22c55e]"
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

      <div className="relative z-10 pl-2 sm:pl-3 space-y-6">
        {/* Top Header: [logo] buvaki and Step Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="font-bold text-neutral-900 text-xl tracking-tight lowercase font-sans">
              buvaki
            </span>
          </div>

          {currentSubStep !== 'success' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/80 text-emerald-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {currentSubStep === 'identity' && 'Step 1 of 3'}
                {currentSubStep === 'demographics' && 'Step 2 of 3'}
                {currentSubStep === 'description' && 'Step 3 of 3'}
              </span>
            </div>
          )}
        </div>

        {/* Error notice if present */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed animate-shake">
            {errorMessage}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: Profile picture, username, user handle enquiries           */}
        {/* ------------------------------------------------------------------ */}
        {currentSubStep === 'identity' && (
          <form onSubmit={handleNextFromIdentity} className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Profile Details
              </h2>
              <p className="text-xs text-neutral-500">
                Set up your photo, display name, and unique user handle.
              </p>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Profile Picture Upload & Preview */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-100">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-18 h-18 rounded-full overflow-hidden bg-neutral-200 border-2 border-[#22c55e] shrink-0 shadow-sm cursor-pointer group hover:opacity-90 transition-all"
                title="Click to choose a profile picture"
              >
                <img
                  src={avatarUrl || getGenericAvatarByGender(gender)}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getGenericAvatarByGender(gender);
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-semibold transition-opacity">
                  <Camera className="w-4 h-4 mb-0.5 text-emerald-300" />
                  <span>Change</span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  {avatarUrl !== initialUser.avatar && (
                    <button
                      type="button"
                      onClick={handleResetAvatar}
                      className="px-2.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                      title="Reset avatar"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400">
                  Recommended: Square JPG or PNG.
                </p>
              </div>
            </div>

            {/* Username Enquiry */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  // Auto-suggest handle if handle hasn't been edited or is default
                  if (!handle || handle === 'member' || handle === initialUser.username.toLowerCase().replace(/[^a-z0-9_]/g, '')) {
                    setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  }
                }}
                placeholder="e.g. Brian Afuta"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#22c55e] focus:bg-white transition-all font-medium"
                required
              />
            </div>

            {/* User Handle Enquiry */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>User Handle</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-neutral-400 font-semibold text-sm select-none">
                  @
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => handleHandleChange(e.target.value)}
                  placeholder="handle"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#22c55e] focus:bg-white transition-all font-mono"
                  required
                />
              </div>
              <p className="text-[11px] text-neutral-400">
                Your unique identity across Buvaki (@{handle || 'handle'}).
              </p>
            </div>

            {/* Next Button */}
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-2xl border-2 border-[#22c55e] hover:border-[#16a34a] bg-white hover:bg-[#22c55e]/5 text-[#16a34a] hover:text-[#15803d] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 2: Date of birth, gender                                      */}
        {/* ------------------------------------------------------------------ */}
        {currentSubStep === 'demographics' && (
          <form onSubmit={handleNextFromDemographics} className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Birthday & Gender
              </h2>
              <p className="text-xs text-neutral-500">
                Help us customize your content recommendations.
              </p>
            </div>

            {/* Date of Birth Enquiry */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Date of Birth</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#22c55e] focus:bg-white transition-all"
              />
              <p className="text-[11px] text-neutral-400">
                Used to ensure age-appropriate community content.
              </p>
            </div>

            {/* Gender Enquiry */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Gender</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'male', label: 'Male' },
                  { id: 'female', label: 'Female' },
                  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
                ].map((g) => {
                  const isSelected = gender === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id as any)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 ${
                        isSelected
                          ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#16a34a] shadow-xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      <span className="truncate">{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentSubStep('identity')}
                className="py-3 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3 px-6 rounded-2xl border-2 border-[#22c55e] hover:border-[#16a34a] bg-white hover:bg-[#22c55e]/5 text-[#16a34a] hover:text-[#15803d] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 3: Profile description                                        */}
        {/* ------------------------------------------------------------------ */}
        {currentSubStep === 'description' && (
          <form onSubmit={handleSubmitProfile} className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Profile Description
              </h2>
              <p className="text-xs text-neutral-500">
                Write a few words about what you love and what you share.
              </p>
            </div>

            {/* Bio / Description Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>Bio</span>
                </label>
                <span className="text-[11px] text-neutral-400">
                  {bio.length} / 250
                </span>
              </div>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 250))}
                rows={3}
                placeholder="e.g. Enthusiast of photography, open-source code, and creative media in Nairobi..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#22c55e] focus:bg-white transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Quick Interest Tags */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>Topics of Interest</span>
                </span>
                <span className="text-[11px] text-neutral-400">
                  {selectedInterests.length} selected
                </span>
              </label>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar py-0.5">
                {PRESET_INTERESTS.map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#22c55e] text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCurrentSubStep('demographics')}
                className="py-3 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-6 rounded-2xl border-2 border-[#22c55e] hover:border-[#16a34a] bg-white hover:bg-[#22c55e]/5 text-[#16a34a] hover:text-[#15803d] font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#22c55e]/30 border-t-[#22c55e] rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 4: Successfully made a profile                                */}
        {/* ------------------------------------------------------------------ */}
        {currentSubStep === 'success' && (
          <div className="space-y-6 text-center animate-fadeIn py-2">
            {/* Success icon & Celebration header */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-[#22c55e] flex items-center justify-center shadow-md animate-bounce">
                <CheckCircle2 className="w-9 h-9 text-[#22c55e]" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                Successfully made a profile
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                Welcome to the Buvaki community. Your profile is live!
              </p>
            </div>

            {/* Profile Preview Card */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-left space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={finalUser.avatar || getGenericAvatarByGender(finalUser.gender)}
                  alt={finalUser.username}
                  className="w-13 h-13 rounded-full object-cover border-2 border-[#22c55e] shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-neutral-900 text-sm truncate">
                      {finalUser.username}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold shrink-0">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-mono truncate">
                    {finalUser.handle}
                  </p>
                </div>
              </div>

              {finalUser.bio && (
                <p className="text-xs text-neutral-700 italic bg-white p-2.5 rounded-xl border border-neutral-100">
                  "{finalUser.bio}"
                </p>
              )}

              {finalUser.interests && finalUser.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {finalUser.interests.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action: Enter Buvaki */}
            <button
              type="button"
              onClick={() => onComplete(finalUser)}
              className="w-full py-3.5 px-6 rounded-2xl border-2 border-[#22c55e] hover:border-[#16a34a] bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>Explore Buvaki</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Subtle Skip for now button for first-time profile step */}
        {currentSubStep !== 'success' && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleSkipForNow}
              disabled={isLoading}
              className="text-xs text-neutral-400 hover:text-neutral-700 underline transition-colors cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>

      {/* Progress indicators at bottom matching reference style */}
      <div className="flex items-center justify-center gap-2 mt-5">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            currentSubStep === 'identity' ? 'w-8 bg-[#22c55e]' : 'w-5 bg-neutral-300'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            currentSubStep === 'demographics' ? 'w-8 bg-[#22c55e]' : 'w-5 bg-neutral-300'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            currentSubStep === 'description' ? 'w-8 bg-[#22c55e]' : 'w-5 bg-neutral-300'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            currentSubStep === 'success' ? 'w-8 bg-[#22c55e]' : 'w-5 bg-neutral-300'
          }`}
        />
      </div>
    </div>
  );
};
