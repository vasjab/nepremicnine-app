import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, PlusCircle, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { InternationalSettings } from '@/components/InternationalSettings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-foreground">
              hemma
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              {t('nav.findHome')}
            </Link>
            {user && (
              <>
                <Link
                  to="/saved"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive('/saved') 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {t('nav.saved')}
                </Link>
                <Link
                  to="/my-listings"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive('/my-listings') 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {t('nav.myListings')}
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
                <Link to="/create-listing">
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <PlusCircle className="h-4 w-4" />
                    {t('common.createListing')}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
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
                  <Button variant="ghost" size="sm">
                    {t('common.logIn')}
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {t('common.signUp')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="inline-block mr-2 h-4 w-4" />
                {t('nav.findHome')}
              </Link>
              {user && (
                <>
                  <Link
                    to="/saved"
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/saved') 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="inline-block mr-2 h-4 w-4" />
                    {t('nav.saved')}
                  </Link>
                  <Link
                    to="/my-listings"
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/my-listings') 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlusCircle className="inline-block mr-2 h-4 w-4" />
                    {t('nav.myListings')}
                  </Link>
                  <Link
                    to="/create-listing"
                    className="px-4 py-3 rounded-lg text-sm font-medium bg-accent text-accent-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlusCircle className="inline-block mr-2 h-4 w-4" />
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
