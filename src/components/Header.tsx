import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, PlusCircle, User, Menu, X, MessageCircle, BarChart3, History, Globe, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnreadCount } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { InternationalSettings } from '@/components/InternationalSettings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount(user?.id);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="font-display text-2xl font-bold text-foreground">
              hemma
            </span>
          </Link>

          {/* Mobile: Always visible nav icons - Find Home & Saved */}
          <div className="flex md:hidden items-center gap-1 flex-1 justify-center">
            <Link
              to="/"
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full transition-colors touch-safe-button',
                isActive('/') 
                  ? 'bg-secondary text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Home className="h-5 w-5" />
            </Link>
            {user && (
              <Link
                to="/saved"
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-colors touch-safe-button',
                  isActive('/saved') 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                isActive('/') 
                  ? 'text-foreground bg-secondary/60' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )}
            >
              {t('nav.findHome')}
              {isActive('/') && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </Link>
            <Link
              to="/sold-rented"
              className={cn(
                'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                isActive('/sold-rented') 
                  ? 'text-foreground bg-secondary/60' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )}
            >
              {t('soldRented.recentlySold')}
              {isActive('/sold-rented') && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </Link>
            {user && (
              <>
                <Link
                  to="/saved"
                  className={cn(
                    'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive('/saved') 
                      ? 'text-foreground bg-secondary/60' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  {t('nav.saved')}
                  {isActive('/saved') && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </Link>
                <Link
                  to="/my-listings"
                  className={cn(
                    'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive('/my-listings') 
                      ? 'text-foreground bg-secondary/60' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  {t('nav.myListings')}
                  {isActive('/my-listings') && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* International Settings - hidden on mobile, in burger menu */}
            <div className="hidden md:block">
              <InternationalSettings />
            </div>

            {user ? (
              <>
                {/* Messages button with badge */}
                <Link to="/messages" className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full touch-safe-button"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <MessageCircle className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/create-listing" className="hidden sm:block">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 rounded-full"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {t('common.createListing')}
                  </Button>
                </Link>
                {/* Desktop user menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full"
                      >
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          {t('common.profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          {t('nav.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/saved" className="cursor-pointer">
                          <Heart className="mr-2 h-4 w-4" />
                          {t('common.savedListings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/my-listings" className="cursor-pointer">
                          <Home className="mr-2 h-4 w-4" />
                          {t('common.myListings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                        {t('common.signOut')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    {t('common.logIn')}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button 
                    variant="accent"
                    size="sm" 
                    className="rounded-full px-4"
                  >
                    {t('common.signUp')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full touch-safe-button min-w-[44px] min-h-[44px]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - redesigned with localization and other items inside */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-slide-down">
            <div className="flex flex-col gap-1">
              {/* Sold/Rented - not in always-visible icons */}
              <Link
                to="/sold-rented"
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all touch-safe-button min-h-[44px]',
                  isActive('/sold-rented') 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
                onClick={() => setMobileMenuOpen(false)}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <History className="h-5 w-5" />
                {t('soldRented.recentlySold')}
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/my-listings"
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all touch-safe-button min-h-[44px]',
                      isActive('/my-listings') 
                        ? 'bg-secondary text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Home className="h-5 w-5" />
                    {t('nav.myListings')}
                  </Link>
                  <Link
                    to="/profile"
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all touch-safe-button min-h-[44px]',
                      isActive('/profile') 
                        ? 'bg-secondary text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <User className="h-5 w-5" />
                    {t('common.profile')}
                  </Link>
                  <Link
                    to="/dashboard"
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all touch-safe-button min-h-[44px]',
                      isActive('/dashboard') 
                        ? 'bg-secondary text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <BarChart3 className="h-5 w-5" />
                    {t('nav.dashboard')}
                  </Link>
                  
                  {/* Localization inside menu */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <InternationalSettings />
                  </div>
                  
                  <Link
                    to="/create-listing"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-accent text-accent-foreground mt-2 touch-safe-button min-h-[44px]"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <PlusCircle className="h-5 w-5" />
                    {t('common.createListing')}
                  </Link>
                  
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 mt-2 touch-safe-button min-h-[44px] w-full text-left"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {t('common.signOut')}
                  </button>
                </>
              ) : (
                <>
                  {/* Localization for non-logged in users */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <InternationalSettings />
                  </div>
                  
                  <Link
                    to="/auth"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all touch-safe-button min-h-[44px] text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <User className="h-5 w-5" />
                    {t('common.logIn')}
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-accent text-accent-foreground mt-2 touch-safe-button min-h-[44px]"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <PlusCircle className="h-5 w-5" />
                    {t('common.signUp')}
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}