import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, PlusCircle, User, Menu, X, MessageCircle, BarChart3, History } from 'lucide-react';
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
      <div className="container mx-auto px-4">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                isActive('/') 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('nav.findHome')}
              {isActive('/') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </Link>
            <Link
              to="/sold-rented"
              className={cn(
                'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                isActive('/sold-rented') 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('soldRented.recentlySold')}
              {isActive('/sold-rented') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </Link>
            {user && (
              <>
                <Link
                  to="/saved"
                  className={cn(
                    'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive('/saved') 
                      ? 'text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('nav.saved')}
                  {isActive('/saved') && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </Link>
                <Link
                  to="/my-listings"
                  className={cn(
                    'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive('/my-listings') 
                      ? 'text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t('nav.myListings')}
                  {isActive('/my-listings') && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* International Settings */}
            <InternationalSettings />

            {user ? (
              <>
                {/* Messages button with badge */}
                <Link to="/messages" className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-secondary"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link to="/create-listing">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden sm:flex gap-2 rounded-full border-border/50 hover:border-border hover:bg-secondary/50"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {t('common.createListing')}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-secondary"
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
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    {t('common.logIn')}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button 
                    size="sm" 
                    className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-4"
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
              className="md:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-slide-down">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive('/') 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                {t('nav.findHome')}
              </Link>
              {user && (
                <>
                  <Link
                    to="/saved"
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive('/saved') 
                        ? 'bg-secondary text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5" />
                    {t('nav.saved')}
                  </Link>
                  <Link
                    to="/my-listings"
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive('/my-listings') 
                        ? 'bg-secondary text-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    {t('nav.myListings')}
                  </Link>
                  <Link
                    to="/create-listing"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-accent text-accent-foreground mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlusCircle className="h-5 w-5" />
                    {t('common.createListing')}
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
