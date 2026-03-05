'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { HoneypotField, isHoneypotTriggered } from '@/components/HoneypotField';
import { useRateLimit, AUTH_RATE_LIMIT } from '@/hooks/useRateLimit';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const emailSchema = z.string().email('Please enter a valid email address');

export default function Auth() {
  const router = useRouter();
  const { user, sendOtp, verifyOtp } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [step, setStep] = useState<'email' | 'otp'>('email');
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
      const { error } = await sendOtp(email);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Could not send code',
          description: error.message,
        });
      } else {
        setStep('otp');
        setResendCooldown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      }
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
      const { error } = await verifyOtp(email, code);
      if (error) {
        setOtpError('Invalid or expired code. Please try again.');
        setOtpValues(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      } else {
        // Set remember me flags
        if (rememberMe) {
          localStorage.setItem('hemma_remember_me', 'true');
          sessionStorage.removeItem('hemma_session_active');
        } else {
          localStorage.removeItem('hemma_remember_me');
          sessionStorage.setItem('hemma_session_active', 'true');
        }
        router.push('/');
      }
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
    setOtpValues(['', '', '', '', '', '']);
    setOtpError('');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {step === 'email' ? (
            <div className="animate-fade-in" key="email-step">
              <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">🏠</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
                  Welcome to hemma
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Enter your email to sign in or create an account
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <HoneypotField value={honeypot} onChange={setHoneypot} />

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      className="pl-10 h-12 text-base"
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                </div>

                <div className="flex items-center justify-between py-1">
                  <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer select-none">
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
                  variant="accent"
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
                  Check your email
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  We sent a 6-digit code to{' '}
                  <span className="font-medium text-foreground">{email}</span>
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
      <div className="hidden lg:flex flex-1 bg-secondary/50 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10" />
        <div className="max-w-md text-center relative z-10">
          <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
            {t('auth.findPerfectHome')}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('auth.findPerfectHomeDesc')}
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            <div className="glass p-5 rounded-2xl">
              <span className="text-2xl mb-2 block">🏠</span>
              <h3 className="font-bold text-foreground">{t('auth.browseListings')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('auth.browseListingsDesc')}</p>
            </div>
            <div className="glass p-5 rounded-2xl">
              <span className="text-2xl mb-2 block">❤️</span>
              <h3 className="font-bold text-foreground">{t('auth.saveFavorites')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('auth.saveFavoritesDesc')}</p>
            </div>
            <div className="glass p-5 rounded-2xl">
              <span className="text-2xl mb-2 block">📝</span>
              <h3 className="font-bold text-foreground">{t('auth.listYourHome')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('auth.listYourHomeDesc')}</p>
            </div>
            <div className="glass p-5 rounded-2xl">
              <span className="text-2xl mb-2 block">🔒</span>
              <h3 className="font-bold text-foreground">{t('auth.secureAndTrusted')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('auth.secureAndTrustedDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
