'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, PlusCircle, User, Menu, X, MessageCircle, BarChart3, History, Globe, Search } from 'lucide-react';
import { useState, useCallback } from 'react';
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                'nav-pill nav-blue group',
                isActive('/') && 'is-active'
              )}
            >
              <span className={cn(
                "flex h-6 w-6 items-center justify-center rounded-lg transition-colors duration-200",
                isActive('/') ? "bg-blue-100 text-blue-600" : "text-gray-400 group-hover:text-blue-500"
              )}>
                <Search className="h-3.5 w-3.5" />
              </span>
              <span>{t('nav.findHome')}</span>
            </Link>
            <Link
              href="/sold-rented"
              className={cn(
                'nav-pill nav-amber group',
                isActive('/sold-rented') && 'is-active'
              )}
            >
              <span className={cn(
                "flex h-6 w-6 items-center justify-center rounded-lg transition-colors duration-200",
                isActive('/sold-rented') ? "bg-amber-100 text-amber-600" : "text-gray-400 group-hover:text-amber-500"
              )}>
                <History className="h-3.5 w-3.5" />
              </span>
              <span>{t('soldRented.recentlySold')}</span>
            </Link>
            {user && (
              <Link
                href="/saved"
                className={cn(
                  'nav-pill nav-rose group',
                  isActive('/saved') && 'is-active'
                )}
              >
                <span className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-lg transition-colors duration-200",
                  isActive('/saved') ? "bg-rose-100 text-rose-500" : "text-gray-400 group-hover:text-rose-400"
                )}>
                  <Heart className="h-3.5 w-3.5" />
                </span>
                <span>{t('common.savedListings')}</span>
              </Link>
            )}
          </nav>

          {/* Mobile: Center nav icons */}
          <div className="flex md:hidden items-center gap-1 flex-1 justify-center">
            {isActive('/') ? (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center justify-center w-10 h-10 rounded-full transition-colors bg-blue-50 text-blue-600"
              >
                <Search className="h-5 w-5" />
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center justify-center w-10 h-10 rounded-full transition-colors text-gray-400 hover:text-blue-500 hover:bg-blue-50/60"
              >
                <Search className="h-5 w-5" />
              </Link>
            )}
            {user && (
              <Link
                href="/saved"
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                  isActive('/saved')
                    ? 'bg-rose-50 text-rose-500'
                    : 'text-gray-400 hover:text-rose-400 hover:bg-rose-50/60'
                )}
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                {/* Messages button with badge */}
                <Link href="/messages" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-gray-100/80"
                  >
                    <MessageCircle className="h-[22px] w-[22px] text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold px-1 shadow-sm ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/create-listing" className="hidden sm:block">
                  <Button
                    variant="gradient"
                    className="gap-2 rounded-xl h-10 px-5 text-[13px] font-semibold ml-0.5"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {t('common.createListing')}
                  </Button>
                </Link>
                {/* Desktop user menu */}
                <div className="hidden md:block ml-0.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full h-10 w-10 border border-black/[0.08] hover:bg-gray-100/80"
                      >
                        <User className="h-[22px] w-[22px] text-gray-600" />
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 py-1.5 rounded-2xl border-gray-200/60 bg-white">
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-sky-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/profile">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-sky-50 text-sky-500 mr-3">
                            <User className="h-4 w-4" />
                          </div>
                          {t('common.profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-violet-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/messages">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-violet-50 text-violet-500 mr-3">
                            <MessageCircle className="h-4 w-4" />
                          </div>
                          Messages
                          {unreadCount > 0 && (
                            <span className="ml-auto min-w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold px-1">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-rose-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/saved">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-rose-50 text-rose-400 mr-3">
                            <Heart className="h-4 w-4" />
                          </div>
                          {t('common.savedListings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-emerald-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/my-listings">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-500 mr-3">
                            <Home className="h-4 w-4" />
                          </div>
                          {t('common.myListings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-indigo-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/dashboard">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-500 mr-3">
                            <BarChart3 className="h-4 w-4" />
                          </div>
                          {t('nav.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      {/* Language & Region */}
                      <div className="px-0 py-0">
                        <InternationalSettings trigger="menu-item" />
                      </div>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem onClick={signOut} className="cursor-pointer px-3.5 py-2.5 text-sm text-red-600 focus:bg-red-50 focus:text-red-600 rounded-xl mx-1">
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
          <nav className="md:hidden py-2 border-t border-gray-100 animate-slide-down">
            <div className="flex flex-col py-2">
              {/* Sold/Rented */}
              <Link
                href="/sold-rented"
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-[15px] font-medium transition-colors',
                  isActive('/sold-rented')
                    ? 'bg-amber-50 text-amber-900'
                    : 'text-gray-700 hover:bg-amber-50/60'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
                  isActive('/sold-rented') ? 'bg-amber-100 text-amber-600' : 'bg-amber-50 text-amber-500'
                )}>
                  <History className="h-4 w-4" />
                </div>
                {t('soldRented.recentlySold')}
              </Link>

              {user ? (
                <>
                  <Link
                    href="/messages"
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-[15px] font-medium transition-colors',
                      isActive('/messages')
                        ? 'bg-violet-50 text-violet-900'
                        : 'text-gray-700 hover:bg-violet-50/60'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
                      isActive('/messages') ? 'bg-violet-100 text-violet-600' : 'bg-violet-50 text-violet-500'
                    )}>
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-auto min-w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/saved"
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-[15px] font-medium transition-colors',
                      isActive('/saved')
                        ? 'bg-rose-50 text-rose-900'
                        : 'text-gray-700 hover:bg-rose-50/60'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
                      isActive('/saved') ? 'bg-rose-100 text-rose-500' : 'bg-rose-50 text-rose-400'
                    )}>
                      <Heart className="h-4 w-4" />
                    </div>
                    {t('common.savedListings')}
                  </Link>
                  <Link
                    href="/my-listings"
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-[15px] font-medium transition-colors',
                      isActive('/my-listings')
                        ? 'bg-emerald-50 text-emerald-900'
                        : 'text-gray-700 hover:bg-emerald-50/60'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
                      isActive('/my-listings') ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-50 text-emerald-500'
                    )}>
                      <Home className="h-4 w-4" />
                    </div>
                    {t('nav.myListings')}
                  </Link>
                  <Link
                    href="/profile"
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-[15px] font-medium transition-colors',
                      isActive('/profile')
                        ? 'bg-sky-50 text-sky-900'
                        : 'text-gray-700 hover:bg-sky-50/60'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
                      isActive('/profile') ? 'bg-sky-100 text-sky-600' : 'bg-sky-50 text-sky-500'
                    )}>
                      <User className="h-4 w-4" />
                    </div>
                    {t('common.profile')}
                  </Link>
                  <Link
                    href="/dashboard"
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-[15px] font-medium transition-colors',
                      isActive('/dashboard')
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'text-gray-700 hover:bg-indigo-50/60'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
                      isActive('/dashboard') ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-50 text-indigo-500'
                    )}>
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    {t('nav.dashboard')}
                  </Link>

                  {/* Divider */}
                  <div className="mx-6 my-2 border-t border-black/[0.06]" />

                  {/* Language & Region */}
                  <div className="mx-2">
                    <InternationalSettings trigger="menu-item" onOpenChange={(open) => { if (!open) setMobileMenuOpen(false); }} />
                  </div>

                  {/* Divider */}
                  <div className="mx-6 my-2 border-t border-black/[0.06]" />

                  <Link
                    href="/create-listing"
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-semibold text-white bg-gradient-to-r from-slate-700 to-slate-900 shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/20">
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
                    <InternationalSettings trigger="menu-item" onOpenChange={(open) => { if (!open) setMobileMenuOpen(false); }} />
                  </div>

                  {/* Divider */}
                  <div className="mx-6 my-2 border-t border-black/[0.06]" />

                  <Link
                    href="/auth"
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-[15px] font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gray-100 text-gray-500">
                      <User className="h-4 w-4" />
                    </div>
                    {t('common.logIn')}
                  </Link>
                  <Link
                    href="/auth?mode=signup"
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-semibold text-white bg-gradient-to-r from-slate-700 to-slate-900 shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/20">
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
