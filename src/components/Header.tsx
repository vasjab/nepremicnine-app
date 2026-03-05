'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount(user?.id);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              hemma
            </span>
          </Link>

          {/* Desktop Navigation - DESIGN.md pill tab bar */}
          <nav className="hidden md:flex items-center">
            <div className="flex gap-0.5 rounded-xl border border-gray-200/70 bg-gray-50/80 p-1">
              <Link
                href="/"
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 border',
                  isActive('/')
                    ? 'bg-white shadow-sm text-gray-900 border-gray-200/60'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60'
                )}
              >
                <Search className="h-3.5 w-3.5" />
                {t('nav.findHome')}
              </Link>
              <Link
                href="/sold-rented"
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 border',
                  isActive('/sold-rented')
                    ? 'bg-white shadow-sm text-gray-900 border-gray-200/60'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60'
                )}
              >
                <History className="h-3.5 w-3.5" />
                {t('soldRented.recentlySold')}
              </Link>
              {user && (
                <>
                  <Link
                    href="/saved"
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 border',
                      isActive('/saved')
                        ? 'bg-white shadow-sm text-gray-900 border-gray-200/60'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60'
                    )}
                  >
                    <Heart className="h-3.5 w-3.5" />
                    {t('common.savedListings')}
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile: Center nav icons */}
          <div className="flex md:hidden items-center gap-1 flex-1 justify-center">
            <Link
              href="/"
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                isActive('/')
                  ? 'bg-slate-100 text-slate-700'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Search className="h-5 w-5" />
            </Link>
            {user && (
              <Link
                href="/saved"
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                  isActive('/saved')
                    ? 'bg-slate-100 text-slate-700'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Messages button with badge */}
                <Link href="/messages" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold px-1 shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/create-listing" className="hidden sm:block">
                  <Button
                    variant="gradient"
                    size="sm"
                    className="gap-2 rounded-xl"
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
                        className="relative rounded-full h-10 w-10 border border-black/[0.08]"
                      >
                        <User className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 py-2 rounded-2xl shadow-2xl border-gray-200/60 bg-white">
                      <DropdownMenuItem asChild className="px-4 py-3 text-sm focus:bg-gray-50 rounded-none cursor-pointer">
                        <Link href="/profile">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-slate-100 text-slate-600 mr-3">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          {t('common.profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-4 py-3 text-sm focus:bg-gray-50 rounded-none cursor-pointer">
                        <Link href="/messages">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-gray-100 text-gray-500 mr-3">
                            <MessageCircle className="h-3.5 w-3.5" />
                          </div>
                          Messages
                          {unreadCount > 0 && (
                            <span className="ml-auto min-w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold px-1">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1.5" />
                      <DropdownMenuItem asChild className="px-4 py-3 text-sm focus:bg-gray-50 rounded-none cursor-pointer">
                        <Link href="/saved">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-gray-100 text-gray-500 mr-3">
                            <Heart className="h-3.5 w-3.5" />
                          </div>
                          {t('common.savedListings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-4 py-3 text-sm focus:bg-gray-50 rounded-none cursor-pointer">
                        <Link href="/my-listings">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-gray-100 text-gray-500 mr-3">
                            <Home className="h-3.5 w-3.5" />
                          </div>
                          {t('common.myListings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-4 py-3 text-sm focus:bg-gray-50 rounded-none cursor-pointer">
                        <Link href="/dashboard">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-gray-100 text-gray-500 mr-3">
                            <BarChart3 className="h-3.5 w-3.5" />
                          </div>
                          {t('nav.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1.5" />
                      {/* Language & Region */}
                      <div className="px-0 py-0">
                        <InternationalSettings trigger="menu-item" />
                      </div>
                      <DropdownMenuSeparator className="my-1.5" />
                      <DropdownMenuItem onClick={signOut} className="cursor-pointer px-4 py-3 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 rounded-none">
                        {t('common.signOut')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                {/* Language & Region for non-logged in users */}
                <InternationalSettings trigger="icon" />
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="rounded-xl text-gray-600 hover:text-gray-900">
                    {t('common.logIn')}
                  </Button>
                </Link>
                <Link href="/auth?mode=signup">
                  <Button
                    variant="gradient"
                    size="sm"
                    className="rounded-xl px-5"
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
              className="md:hidden rounded-full h-10 w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-2 border-t border-black/[0.06] animate-slide-down">
            <div className="flex flex-col py-2">
              {/* Sold/Rented */}
              <Link
                href="/sold-rented"
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-medium transition-colors',
                  isActive('/sold-rented')
                    ? 'bg-slate-50 text-slate-800'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                  isActive('/sold-rented') ? 'bg-slate-100 text-slate-600' : 'bg-gray-100 text-gray-500'
                )}>
                  <History className="h-4 w-4" />
                </div>
                {t('soldRented.recentlySold')}
              </Link>

              {user ? (
                <>
                  <Link
                    href="/saved"
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-medium transition-colors',
                      isActive('/saved')
                        ? 'bg-slate-50 text-slate-800'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                      isActive('/saved') ? 'bg-slate-100 text-slate-600' : 'bg-gray-100 text-gray-500'
                    )}>
                      <Heart className="h-4 w-4" />
                    </div>
                    {t('common.savedListings')}
                  </Link>
                  <Link
                    href="/my-listings"
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-medium transition-colors',
                      isActive('/my-listings')
                        ? 'bg-slate-50 text-slate-800'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                      isActive('/my-listings') ? 'bg-slate-100 text-slate-600' : 'bg-gray-100 text-gray-500'
                    )}>
                      <Home className="h-4 w-4" />
                    </div>
                    {t('nav.myListings')}
                  </Link>
                  <Link
                    href="/profile"
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-medium transition-colors',
                      isActive('/profile')
                        ? 'bg-slate-50 text-slate-800'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                      isActive('/profile') ? 'bg-slate-100 text-slate-600' : 'bg-gray-100 text-gray-500'
                    )}>
                      <User className="h-4 w-4" />
                    </div>
                    {t('common.profile')}
                  </Link>
                  <Link
                    href="/dashboard"
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-medium transition-colors',
                      isActive('/dashboard')
                        ? 'bg-slate-50 text-slate-800'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                      isActive('/dashboard') ? 'bg-slate-100 text-slate-600' : 'bg-gray-100 text-gray-500'
                    )}>
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    {t('nav.dashboard')}
                  </Link>

                  {/* Divider */}
                  <div className="mx-6 my-2 border-t border-black/[0.06]" />

                  {/* Language & Region */}
                  <div className="mx-2">
                    <InternationalSettings trigger="menu-item" onOpenChange={() => setMobileMenuOpen(false)} />
                  </div>

                  {/* Divider */}
                  <div className="mx-6 my-2 border-t border-black/[0.06]" />

                  <Link
                    href="/create-listing"
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-semibold text-white bg-gradient-to-r from-slate-700 to-slate-900 shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                      <PlusCircle className="h-4 w-4" />
                    </div>
                    {t('common.createListing')}
                  </Link>

                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 mt-1 text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    {t('common.signOut')}
                  </button>
                </>
              ) : (
                <>
                  {/* Divider */}
                  <div className="mx-6 my-2 border-t border-black/[0.06]" />

                  {/* Language & Region for non-logged in users */}
                  <div className="mx-2">
                    <InternationalSettings trigger="menu-item" onOpenChange={() => setMobileMenuOpen(false)} />
                  </div>

                  {/* Divider */}
                  <div className="mx-6 my-2 border-t border-black/[0.06]" />

                  <Link
                    href="/auth"
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                      <User className="h-4 w-4" />
                    </div>
                    {t('common.logIn')}
                  </Link>
                  <Link
                    href="/auth?mode=signup"
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-semibold text-white bg-gradient-to-r from-slate-700 to-slate-900 shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20">
                      <PlusCircle className="h-4 w-4" />
                    </div>
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
