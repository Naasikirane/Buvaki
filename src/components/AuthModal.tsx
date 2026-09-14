import React, { useState, useEffect } from 'react';
import { User, SupportedLanguage, COUNTRY_CODES } from '../types';
import { Logo } from './Logo';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Phone,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { 
  dbLoginWithEmail, 
  dbRegisterWithEmail, 
  dbLoginWithGoogle,
  dbResetPassword,
  dbSetupRecaptcha,
  dbSendPhoneVerificationCode,
  dbVerifyPhoneCode
} from '../lib/firebase';
import { GENERIC_AVATARS } from './OnboardingFlow';
import type { ConfirmationResult } from 'firebase/auth';

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
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isResetMode, setIsResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields (Standard Email & Password)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say'>('prefer_not_to_say');

  // Phone Auth Fields
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneConfirmation, setPhoneConfirmation] = useState<ConfirmationResult | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const resetState = () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(false);
    setIsVerifyingPhone(false);
    setVerificationCode('');
    setPhoneConfirmation(null);
  };

  const handleTabSwitch = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setIsResetMode(false);
    resetState();
  };

  // Google 1-Click Sign In
  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const user = await dbLoginWithGoogle(selectedLanguage?.name || 'English');
      if (user) {
        onCompleteAuth(user);
        onClose();
      }
      // If user closed the popup voluntarily, user is null - do nothing
    } catch (err: any) {
      console.warn('Google sign-in exception:', err);
      const msg = err?.message || '';
      setError(msg || 'Google sign-in could not be completed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email & Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const user = await dbLoginWithEmail(email.trim(), password);
      onCompleteAuth(user);
      onClose();
    } catch (err: any) {
      console.error('Sign In error:', err);
      setError(err?.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email & Password Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

    if (!cleanEmail || !password || !cleanUsername) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const avatarUrl = GENERIC_AVATARS[gender]?.url;
      const user = await dbRegisterWithEmail(
        cleanEmail,
        password,
        cleanUsername,
        selectedLanguage?.name || 'English',
        avatarUrl
      );
      const finalUser: User = {
        ...user,
        gender,
        avatar: avatarUrl || user.avatar,
      };
      onCompleteAuth(finalUser);
      onClose();
    } catch (err: any) {
      console.error('Sign Up error:', err);
      setError(err?.message || 'Failed to create account. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address to receive password reset instructions.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      await dbResetPassword(email.trim());
      setSuccessMsg(`A password reset link has been sent to ${email.trim()}. Check your inbox.`);
    } catch (err: any) {
      setError(err?.message || 'Could not send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Official Firebase Phone Auth: Send SMS Code
  const handleSendPhoneCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber.length < 5) {
      setError('Please enter a valid phone number.');
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanNumber}`;
    setIsLoading(true);

    try {
      const verifier = dbSetupRecaptcha('recaptcha-modal-container', () => {
        setError('Security verification expired. Please request the code again.');
      });
      const confirmation = await dbSendPhoneVerificationCode(fullPhoneNumber, verifier);
      setPhoneConfirmation(confirmation);
      setIsVerifyingPhone(true);
      setResendCooldown(60);
      setSuccessMsg(`Verification code sent via SMS to ${fullPhoneNumber}`);
    } catch (err: any) {
      console.error('Phone sign-in send error:', err);
      setError(err?.message || 'Failed to send SMS verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Official Firebase Phone Auth: Confirm SMS Code
  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneConfirmation) {
      setError('No active phone verification session found.');
      return;
    }
    if (!verificationCode || verificationCode.trim().length < 6) {
      setError('Please enter the 6-digit SMS verification code.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const user = await dbVerifyPhoneCode(
        phoneConfirmation,
        verificationCode.trim(),
        username.trim() || undefined,
        selectedLanguage?.name || 'English'
      );
      onCompleteAuth(user);
      onClose();
    } catch (err: any) {
      console.error('Phone verification error:', err);
      setError(err?.message || 'SMS code verification failed. Please check the code and try again.');
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
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="font-bold text-[#0f0f0f] text-base tracking-tight lowercase">
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

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          
          {/* Prompt Reason Badge (if opened because an action required auth) */}
          {promptReason && (
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs font-medium text-center">
              {promptReason}
            </div>
          )}

          {/* Heading & Subtitle */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#0f0f0f] tracking-tight">
              {isResetMode
                ? 'Reset your password'
                : activeTab === 'signin'
                ? 'Sign in to Buvaki'
                : 'Create your Buvaki account'}
            </h2>
            <p className="text-xs text-[#606060] mt-1">
              {isResetMode
                ? 'Enter your email to receive recovery instructions'
                : 'Sign in to like videos, leave comments, and subscribe to creators'}
            </p>
          </div>

          {/* 1. Continue with Google Button */}
          {!isResetMode && (
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-[#0f0f0f] text-sm font-semibold shadow-xs active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {/* Official Google 4-Color 'G' Logo */}
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
                <span>Continue with Google</span>
              </button>

              {/* Modern Divider */}
              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-neutral-200"></div>
                <span className="flex-shrink mx-3 text-xs uppercase tracking-wider text-neutral-400 font-medium">
                  or continue with
                </span>
                <div className="flex-grow border-t border-neutral-200"></div>
              </div>

              {/* Email vs Phone method toggle */}
              <div className="flex items-center rounded-xl bg-neutral-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    resetState();
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMethod === 'email'
                      ? 'bg-white text-[#0f0f0f] shadow-xs'
                      : 'text-neutral-500 hover:text-[#0f0f0f]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone');
                    resetState();
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMethod === 'phone'
                      ? 'bg-white text-[#0f0f0f] shadow-xs'
                      : 'text-neutral-500 hover:text-[#0f0f0f]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Number</span>
                </button>
              </div>
            </div>
          )}

          {/* 2-Tab Selector: Sign In | Create Account */}
          {!isResetMode && (
            <div className="flex items-center rounded-xl bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => handleTabSwitch('signin')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-white text-[#0f0f0f] shadow-xs'
                    : 'text-neutral-500 hover:text-[#0f0f0f]'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => handleTabSwitch('signup')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-white text-[#0f0f0f] shadow-xs'
                    : 'text-neutral-500 hover:text-[#0f0f0f]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="leading-snug">{successMsg}</span>
            </div>
          )}

          {/* FORM VIEWS */}
          {isResetMode ? (
            /* Password Reset Form */
            <form onSubmit={handlePasswordReset} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-[#065fd4] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#065fd4] hover:bg-[#065fd4]/90 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  resetState();
                }}
                className="text-xs text-[#065fd4] hover:underline font-medium text-center mt-1"
              >
                Back to Sign In
              </button>
            </form>
          ) : authMethod === 'phone' ? (
            /* Official Firebase Phone Authentication */
            <div>
              {!isVerifyingPhone ? (
                /* Step 1: Input Phone Number & Country Code */
                <form onSubmit={handleSendPhoneCode} className="flex flex-col gap-3">
                  {activeTab === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Your Name / Username
                      </label>
                      <div className="relative flex items-center">
                        <UserIcon className="absolute left-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. Alex Chen"
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-[#065fd4] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800 px-2.5 py-2 focus:outline-none focus:border-[#065fd4] shrink-0"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1 flex items-center">
                        <Phone className="absolute left-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="555-0199"
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-[#065fd4] font-mono transition-colors"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Official Firebase SMS verification code will be sent to your phone.
                    </p>
                  </div>

                  {/* Firebase reCAPTCHA target container */}
                  <div id="recaptcha-modal-container"></div>

                  <button
                    type="submit"
                    disabled={isLoading || !phoneNumber.trim()}
                    className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#065fd4] hover:bg-[#065fd4]/90 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {isLoading ? 'Sending SMS Code...' : 'Send Verification Code'}
                  </button>
                </form>
              ) : (
                /* Step 2: 6-digit Code Entry */
                <form onSubmit={handleVerifyPhoneCode} className="flex flex-col gap-3.5">
                  <div className="text-center">
                    <div className="inline-flex p-2 rounded-full bg-blue-50 text-[#065fd4] mb-1">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-neutral-900">Enter Verification Code</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      SMS code sent to <span className="font-semibold text-[#065fd4]">{countryCode} {phoneNumber}</span>
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
                      className="w-full text-center tracking-[0.5em] font-mono text-xl py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:border-[#065fd4]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
                    <span>Didn't get code?</span>
                    <button
                      type="button"
                      onClick={handleSendPhoneCode}
                      disabled={resendCooldown > 0 || isLoading}
                      className="text-[#065fd4] hover:underline font-medium disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend SMS'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVerifyingPhone(false);
                        setVerificationCode('');
                        setError(null);
                      }}
                      className="flex-1 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading || verificationCode.length < 6}
                      className="flex-1 py-2 rounded-xl bg-[#065fd4] hover:bg-[#065fd4]/90 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {isLoading ? 'Verifying...' : activeTab === 'signup' ? 'Create Account' : 'Verify & Sign In'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : activeTab === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-[#065fd4] transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      resetState();
                    }}
                    className="text-[11px] text-[#065fd4] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-[#065fd4] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#065fd4] hover:bg-[#065fd4]/90 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Your Name / Username
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="absolute left-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-[#065fd4] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-[#065fd4] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Password (minimum 6 characters)
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:border-[#065fd4] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-600 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Avatar Type Selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Choose Profile Avatar
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { key: 'female', label: 'Female' },
                    { key: 'male', label: 'Male' },
                    { key: 'prefer_not_to_say', label: 'Neutral' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setGender(item.key as any)}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        gender === item.key
                          ? 'border-[#065fd4] bg-[#def1ff]/50 text-[#065fd4] font-semibold'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <img
                        src={GENERIC_AVATARS[item.key]?.url}
                        alt=""
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#065fd4] hover:bg-[#065fd4]/90 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Bottom Guest Mode Link */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col items-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-neutral-500 hover:text-neutral-800 transition-colors py-1 cursor-pointer"
            >
              Continue browsing as guest (read-only)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
