import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage, User } from '../types';
import { getTranslation, isRTL } from '../lib/translations';
import { Logo } from './Logo';
import { 
  Globe, 
  Mail, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  User as UserIcon, 
  Lock,
  MessageSquareCode
} from 'lucide-react';
import { 
  dbRegisterWithEmail, 
  dbLoginWithEmail, 
  dbLoginWithGoogle, 
  dbSendVerificationCode, 
  dbSendFirebaseEmailLink,
  dbVerifyCodeAndCreateUser 
} from '../lib/firebase';

export type OnboardingStep = 'splash' | 'language' | 'signin' | 'signup';

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

  // Auth Form states
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  // Verification code / OTP step
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSentMessage, setCodeSentMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Clear errors on step change
  useEffect(() => {
    setAuthError('');
    setIsVerifyingCode(false);
    setVerificationCode('');
  }, [currentStep, authMethod]);

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

  // Direct Password Auth (Sign In or Sign Up)
  const handleDirectAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      if (currentStep === 'signup') {
        const u = await dbRegisterWithEmail(emailInput, passwordInput, usernameInput || emailInput.split('@')[0], selectedLanguage.name);
        onCompleteAuth(u);
      } else {
        const u = await dbLoginWithEmail(emailInput, passwordInput);
        onCompleteAuth(u);
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

  // Handle Cost-Free Native Firebase Email Link Verification
  const handleSendFirebaseEmailLink = async () => {
    setAuthError('');
    if (!emailInput.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    try {
      await dbSendFirebaseEmailLink(emailInput);
      setCodeSentMessage(`Cost-free Firebase Sign-in Link sent to ${emailInput}! Check your inbox and click the verification link.`);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send Firebase sign-in link.');
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
      onCompleteAuth(user);
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
      onCompleteAuth(user);
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
          <div className="relative flex flex-col items-center justify-center transition-all duration-700 transform hover:scale-110">
            <div className="absolute -inset-8 rounded-full bg-purple-600/20 blur-2xl animate-pulse" />
            <div className="relative p-8 bg-slate-900/40 backdrop-blur-2xl border border-purple-500/20 rounded-3xl shadow-2xl flex items-center justify-center">
              <Logo size="xl" showText={true} />
            </div>
          </div>

          {/* BOTTOM CREATOR SIGNATURE: [TOR onion network logo in grey] made by buvaki */}
          <div className="absolute bottom-8 flex items-center gap-2 text-slate-500 text-xs font-medium tracking-wider uppercase">
            {/* TOR onion network logo in grey */}
            <svg className="w-4 h-4 fill-slate-500" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-8c0-2.76 2.24-5 5-5s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5z" />
            </svg>
            <span>made by buvaki</span>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SCREEN 2: LANGUAGE SELECTION (CLEAN LIST, NO TEXT)   */}
      {/* ---------------------------------------------------- */}
      {currentStep === 'language' && (
        <div className="relative z-10 max-w-xl w-full flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-fadeIn p-4">
          
          {/* Clean Floating List of Languages */}
          <div className="w-full flex flex-wrap justify-center items-center gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguagePick(lang)}
                  className={`relative px-6 py-3.5 rounded-2xl backdrop-blur-xl border transition-all duration-300 flex items-center gap-3 shadow-lg transform hover:-translate-y-1 active:translate-y-0 ${
                    isSelected
                      ? 'bg-purple-600/90 border-purple-400 text-white shadow-purple-600/40 ring-2 ring-purple-400/50 scale-105'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <div className="text-sm font-bold leading-tight">{lang.name}</div>
                    <div className="text-xs text-slate-400">{lang.nativeName}</div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-white ml-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* NEXT BUTTON APPEARS UPON CHOOSING LANGUAGE */}
          {hasChosenLang && (
            <div className="pt-4 animate-fadeIn">
              <button
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
                onClick={() => setStep('language')}
                className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-all"
                title="Change language"
              >
                <span>{selectedLanguage.flag}</span>
                <span className="font-semibold">{selectedLanguage.code.toUpperCase()}</span>
              </button>
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

            {!isVerifyingCode ? (
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
                    <span>{t.emailTab}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('phone')}
                    className={`flex-1 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
                      authMethod === 'phone'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{t.phoneTab}</span>
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
                    <span>{t.googleTab}</span>
                  </button>
                </div>

                {/* EMAIL FORM */}
                {authMethod === 'email' && (
                  <form onSubmit={handleDirectAuth} className="space-y-3">
                    {currentStep === 'signup' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">{t.usernameLabel}</label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                          <input
                            type="text"
                            required
                            placeholder={t.usernamePlaceholder}
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">{t.emailLabel}</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">{t.passwordLabel}</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span>{currentStep === 'signup' ? t.createAccountBtn : t.signInBtn}</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={isLoading || !emailInput}
                        className="py-3 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-all"
                        title="Send 6-digit Verification Code"
                      >
                        {t.sendOtpBtn}
                      </button>

                      <button
                        type="button"
                        onClick={handleSendFirebaseEmailLink}
                        disabled={isLoading || !emailInput}
                        className="py-3 px-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 border border-purple-700/50 text-purple-200 text-[11px] font-medium transition-all flex items-center gap-1"
                        title="Send Cost-Free Firebase Verification Email Link"
                      >
                        <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>Link</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* PHONE FORM */}
                {authMethod === 'phone' && (
                  <form onSubmit={handleSendCode} className="space-y-3">
                    {currentStep === 'signup' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">{t.usernameLabel}</label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                          <input
                            type="text"
                            required
                            placeholder={t.usernamePlaceholder}
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">{t.phoneLabel}</label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
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
                            value={phoneInput}
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
                          <span>{t.sendVerificationCodeBtn}</span>
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
                    value={verificationCode}
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
                    {t.backBtn}
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
                        <span>{t.verifyAndSignInBtn}</span>
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
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              {currentStep === 'signin' ? (
                <>
                  <span>{t.dontHaveAccount}</span>
                  <button
                    onClick={() => setStep('signup')}
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    {t.signUpToggle}
                  </button>
                </>
              ) : (
                <>
                  <span>{t.alreadyHaveAccount}</span>
                  <button
                    onClick={() => setStep('signin')}
                    className="text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    {t.signInToggle}
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
                {t.continueWithoutSignin}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
