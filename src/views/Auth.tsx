'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, Loader2, Home, Heart, FileText, Shield } from 'lucide-react';
import { z } from 'zod';
import { HoneypotField, isHoneypotTriggered } from '@/components/HoneypotField';
import { useRateLimit, AUTH_RATE_LIMIT } from '@/hooks/useRateLimit';
import { useTranslation } from '@/hooks/useTranslation';

const emailSchema = z.string().email('Please enter a valid email address');

export default function Auth() {
  const router = useRouter();
  const { user, sendMagicLink } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

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

  const handleSendLink = async (e?: React.FormEvent) => {
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
      const { error } = await sendMagicLink(email);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Could not send link',
          description: error.message,
        });
      } else {
        setStep('sent');
        setResendCooldown(60);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    handleSendLink();
  };

  const handleBackToEmail = () => {
    setStep('email');
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

              <form onSubmit={handleSendLink} className="space-y-5">
                <HoneypotField value={honeypot} onChange={setHoneypot} />

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      className="pl-10 h-12 text-base rounded-xl border-black/[0.08] bg-white/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  disabled={isLoading || isLimited}
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending link...</>
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
            <div className="animate-fade-in" key="sent-step">
              <div className="text-center mb-8">
                <span className="text-5xl mb-4 block">✉️</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
                  Check your email
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  We sent a sign-in link to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <div className="space-y-6">
                <div className="rounded-xl bg-blue-50/60 border border-blue-200/40 p-5 text-center">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Click the link in your email to sign in. The link will expire in 10 minutes.
                  </p>
                </div>

                {/* Resend */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive the email?{' '}
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
                        Resend link
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
