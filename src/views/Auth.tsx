'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, Loader2, Home, Heart, FileText, Shield } from 'lucide-react';
import { z } from 'zod';
import { HoneypotField, isHoneypotTriggered } from '@/components/HoneypotField';
import { useRateLimit, AUTH_RATE_LIMIT } from '@/hooks/useRateLimit';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const emailSchema = z.string().email('Please enter a valid email address');
type AuthFlow = 'signin' | 'signup' | null;

export default function Auth() {
  const router = useRouter();
  const { user, sendOtp, verifyOtp, signInWithPassword } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [authFlow, setAuthFlow] = useState<AuthFlow>(null);
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isVerifyingRef = useRef(false);
  const [honeypot, setHoneypot] = useState('');
  const { checkRateLimit, isLimited, remainingTime } = useRateLimit(AUTH_RATE_LIMIT);

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const persistRememberMe = () => {
    if (rememberMe) {
      localStorage.setItem('hemma_remember_me', 'true');
      sessionStorage.removeItem('hemma_session_active');
    } else {
      localStorage.removeItem('hemma_remember_me');
      sessionStorage.setItem('hemma_session_active', 'true');
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (isHoneypotTriggered(honeypot)) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      return;
    }

    if (!checkRateLimit()) {
      toast({
        variant: 'destructive',
        title: 'Too many attempts',
        description: `Please wait ${remainingTime} seconds`,
      });
      return;
    }

    setEmailError('');
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setEmailError(e.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    try {
      const startResponse = await fetch('/api/auth/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const startPayload = await startResponse.json() as { flow?: AuthFlow; error?: string };

      if (!startResponse.ok || !startPayload.flow) {
        toast({
          variant: 'destructive',
          title: 'Could not start authentication',
          description: startPayload.error || 'Please try again.',
        });
        return;
      }

      if (startPayload.flow === 'signin') {
        const { error } = await sendOtp(email, { shouldCreateUser: false });
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Could not send code',
            description: error.message,
          });
          return;
        }
      }

      setAuthFlow(startPayload.flow);
      setStep('otp');
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;
    setOtpError('');
    setIsLoading(true);
    try {
      if (authFlow === 'signup') {
        const response = await fetch('/api/auth/complete-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, code }),
        });
        const payload = await response.json() as { error?: string; email?: string; temporaryPassword?: string };

        if (!response.ok || !payload.email || !payload.temporaryPassword) {
          setOtpError(payload.error || 'Invalid or expired code. Please try again.');
          setOtpValues(['', '', '', '', '', '']);
          setTimeout(() => otpRefs.current[0]?.focus(), 50);
          return;
        }

        const { error } = await signInWithPassword(payload.email, payload.temporaryPassword);
        if (error) {
          setOtpError(error.message || 'Unable to sign you in after verification.');
          setOtpValues(['', '', '', '', '', '']);
          setTimeout(() => otpRefs.current[0]?.focus(), 50);
          return;
        }
      } else {
        const { error } = await verifyOtp(email, code);
        if (error) {
          setOtpError('Invalid or expired code. Please try again.');
          setOtpValues(['', '', '', '', '', '']);
          setTimeout(() => otpRefs.current[0]?.focus(), 50);
          return;
        }
      }

      persistRememberMe();
      router.push('/');
    } finally {
      setIsLoading(false);
      isVerifyingRef.current = false;
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 1) value = value.slice(-1);

    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);
    setOtpError('');

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newValues.every(v => v !== '')) {
      handleVerifyOtp(newValues.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const newValues = [...otpValues];
      newValues[index - 1] = '';
      setOtpValues(newValues);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newValues = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setOtpValues(newValues);

    if (newValues.every(v => v !== '')) {
      handleVerifyOtp(newValues.join(''));
    } else {
      const nextEmpty = newValues.findIndex(v => !v);
      otpRefs.current[nextEmpty]?.focus();
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    handleSendOtp();
  };

  const handleBackToEmail = () => {
    setStep('email');
    setAuthFlow(null);
    setOtpValues(['', '', '', '', '', '']);
    setOtpError('');
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-400/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-[15%] left-[12%] h-6 w-6 rotate-45 rounded-sm border-2 border-blue-300/20" />

      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {step === 'email' ? (
            <div className="animate-slide-up" key="email-step">
              <div className="text-center mb-10">
                {/* Logo icon */}
                <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-xl" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
                  Welcome to hemma
                </h1>
                <p className="text-gray-500 text-sm sm:text-base">
                  Enter your email to sign in or create an account
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <HoneypotField value={honeypot} onChange={setHoneypot} />

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      className="pl-10 h-12 text-base rounded-xl border-black/[0.08] bg-white/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>

                <div className="flex items-center justify-between py-1">
                  <label htmlFor="remember-me" className="text-sm text-gray-500 cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                  <Switch
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  disabled={isLoading || isLimited}
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending code...</>
                  ) : (
                    'Continue with email'
                  )}
                </Button>

                {isLimited && (
                  <p className="text-sm text-destructive text-center">
                    Too many attempts. Please wait {remainingTime}s
                  </p>
                )}
              </form>

              <div className="mt-8">
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in" key="otp-step">
              <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">✉️</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
                  Verify your email
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <p
                  data-testid="auth-intent-copy"
                  className="text-xs sm:text-sm text-muted-foreground mt-3 max-w-sm mx-auto"
                >
                  {authFlow === 'signup'
                    ? 'We verify your email before creating your account.'
                    : 'Enter the code to sign in with your verified email.'}
                </p>
              </div>

              <div className="space-y-6">
                {/* OTP inputs */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpValues.map((value, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className={cn(
                        "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl",
                        "border-2 bg-background text-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent",
                        "transition-all duration-200",
                        otpError
                          ? "border-destructive"
                          : value
                            ? "border-accent"
                            : "border-border"
                      )}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-sm text-destructive text-center">{otpError}</p>
                )}

                {isLoading && (
                  <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  </div>
                )}

                {/* Resend */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive the code?{' '}
                    {resendCooldown > 0 ? (
                      <span className="text-muted-foreground/60">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-accent font-medium hover:underline underline-offset-4"
                        disabled={isLoading}
                      >
                        Resend code
                      </button>
                    )}
                  </p>
                </div>

                {/* Back to email */}
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleBackToEmail}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Use a different email
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 items-center justify-center p-12 relative overflow-hidden">
        <div className="pointer-events-none absolute top-20 right-20 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 left-20 h-40 w-40 rounded-full bg-indigo-400/8 blur-3xl" />
        <div className="max-w-md text-center relative z-10">
          <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            {t('auth.findPerfectHome')}
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            {t('auth.findPerfectHomeDesc')}
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 mb-3">
                <Home className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{t('auth.browseListings')}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t('auth.browseListingsDesc')}</p>
            </div>
            <div className="rounded-2xl border border-rose-200/60 bg-rose-50/40 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 mb-3">
                <Heart className="h-4 w-4 text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{t('auth.saveFavorites')}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t('auth.saveFavoritesDesc')}</p>
            </div>
            <div className="rounded-2xl border border-violet-200/60 bg-violet-50/40 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 mb-3">
                <FileText className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{t('auth.listYourHome')}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t('auth.listYourHomeDesc')}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 mb-3">
                <Shield className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{t('auth.secureAndTrusted')}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t('auth.secureAndTrustedDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
