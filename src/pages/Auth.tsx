import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { z } from 'zod';
import { HoneypotField, isHoneypotTriggered } from '@/components/HoneypotField';
import { useRateLimit, AUTH_RATE_LIMIT } from '@/hooks/useRateLimit';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

// Generate a simple fingerprint for rate limiting
function getClientFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('fingerprint', 10, 10);
  const canvasData = canvas.toDataURL();
  
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    canvasData.slice(0, 50),
  ].join('|');
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  
  // Bot protection
  const [honeypot, setHoneypot] = useState('');
  const { checkRateLimit, isLimited, remainingTime } = useRateLimit(AUTH_RATE_LIMIT);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (isSignUp && !fullName.trim()) {
      newErrors.fullName = 'Please enter your name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkServerRateLimit = async (action: 'signup' | 'login'): Promise<boolean> => {
    try {
      const fingerprint = getClientFingerprint();
      const { data, error } = await supabase.functions.invoke('check-rate-limit', {
        body: { identifier: fingerprint, action },
      });
      
      if (error) {
        // Fail open if rate limit check fails
        return true;
      }
      
      return data?.allowed !== false;
    } catch {
      // Fail open on network errors
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check honeypot
    if (isHoneypotTriggered(honeypot)) {
      // Silently fail for bots
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      return;
    }
    
    // Check client-side rate limit first
    if (!checkRateLimit()) {
      toast({
        variant: 'destructive',
        title: t('auth.tooManyAttempts'),
        description: t('auth.pleaseWaitSeconds').replace('{seconds}', remainingTime.toString()),
      });
      return;
    }
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check server-side rate limit
      const action = isSignUp ? 'signup' : 'login';
      const serverAllowed = await checkServerRateLimit(action);
      
      if (!serverAllowed) {
        toast({
          variant: 'destructive',
          title: t('auth.tooManyAttempts'),
          description: t('auth.pleaseWaitSeconds').replace('{seconds}', '60'),
        });
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              variant: 'destructive',
              title: t('auth.accountExists'),
              description: t('auth.accountExistsDesc'),
            });
          } else {
            toast({
              variant: 'destructive',
              title: t('auth.signUpFailed'),
              description: error.message,
            });
          }
        } else {
          toast({
            title: t('auth.welcome'),
            description: t('auth.accountCreated'),
          });
          navigate('/');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: 'destructive',
            title: t('auth.loginFailed'),
            description: t('auth.invalidCredentials'),
          });
        } else {
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp 
                ? t('auth.joinToFind')
                : t('auth.signInToContinue')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field for bot detection */}
            <HoneypotField value={honeypot} onChange={setHoneypot} />
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isLoading || isLimited}
            >
              {isLoading ? t('common.pleaseWait') : (isSignUp ? t('auth.createAccountBtn') : t('common.signIn'))}
            </Button>
            
            {isLimited && (
              <p className="text-sm text-destructive text-center">
                {t('auth.tooManyAttempts')}. {t('auth.pleaseWaitSeconds').replace('{seconds}', remainingTime.toString())}
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-accent hover:underline font-medium"
              >
                {isSignUp ? t('common.signIn') : t('common.signUp')}
              </button>
            </p>
          </div>

          <div className="mt-8">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/')}
            >
              ← {t('common.backToHome')}
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-secondary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            {t('auth.findPerfectHome')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('auth.findPerfectHomeDesc')}
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            <div className="bg-card p-4 rounded-xl">
              <span className="text-2xl mb-2 block">🏠</span>
              <h3 className="font-semibold text-foreground">{t('auth.browseListings')}</h3>
              <p className="text-sm text-muted-foreground">{t('auth.browseListingsDesc')}</p>
            </div>
            <div className="bg-card p-4 rounded-xl">
              <span className="text-2xl mb-2 block">❤️</span>
              <h3 className="font-semibold text-foreground">{t('auth.saveFavorites')}</h3>
              <p className="text-sm text-muted-foreground">{t('auth.saveFavoritesDesc')}</p>
            </div>
            <div className="bg-card p-4 rounded-xl">
              <span className="text-2xl mb-2 block">📝</span>
              <h3 className="font-semibold text-foreground">{t('auth.listYourHome')}</h3>
              <p className="text-sm text-muted-foreground">{t('auth.listYourHomeDesc')}</p>
            </div>
            <div className="bg-card p-4 rounded-xl">
              <span className="text-2xl mb-2 block">🔒</span>
              <h3 className="font-semibold text-foreground">{t('auth.secureAndTrusted')}</h3>
              <p className="text-sm text-muted-foreground">{t('auth.secureAndTrustedDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
