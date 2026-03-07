'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, User, Menu, X, MessageCircle, FileText } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnreadCount } from '@/hooks/useMessaging';
import { useApplicationCount } from '@/hooks/useApplications';
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

interface HeaderProps {
  pageTitle?: string;
}

export function Header({ pageTitle }: HeaderProps = {}) {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount(user?.id);
  const { data: applicationCount = 0 } = useApplicationCount();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 relative">

          {/* Logo + Page title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80 shrink-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">
                hemma
              </span>
            </Link>
            {pageTitle && (
              <>
                <span className="text-gray-300 text-lg font-light">/</span>
                <span className="text-sm font-medium text-gray-500 truncate">{pageTitle}</span>
              </>
            )}
          </div>

          {/* Desktop Navigation — Airbnb-style centered tabs */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 h-full">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2 h-full px-4 text-[13px] font-medium transition-colors relative',
                isActive('/') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              <span className="text-base leading-none">🔍</span>
              <span>{t('nav.findHome')}</span>
              {isActive('/') && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gray-900 rounded-full" />
              )}
            </Link>
            <Link
              href="/sold-rented"
              className={cn(
                'flex items-center gap-2 h-full px-4 text-[13px] font-medium transition-colors relative',
                isActive('/sold-rented') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              <span className="text-base leading-none">🏷️</span>
              <span>{t('soldRented.recentlySold')}</span>
              {isActive('/sold-rented') && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gray-900 rounded-full" />
              )}
            </Link>
            {user && (
              <Link
                href="/saved"
                className={cn(
                  'flex items-center gap-2 h-full px-4 text-[13px] font-medium transition-colors relative',
                  isActive('/saved') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <span className="text-base leading-none">❤️</span>
                <span>{t('common.savedListings')}</span>
                {isActive('/saved') && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gray-900 rounded-full" />
                )}
              </Link>
            )}
          </nav>

          {/* Mobile: Center nav icons */}
          <div className="flex md:hidden items-center gap-1 flex-1 justify-center">
            {isActive('/') ? (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center justify-center w-10 h-10 rounded-full transition-colors bg-blue-50"
              >
                <span className="text-lg leading-none">🔍</span>
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-blue-50/60 grayscale hover:grayscale-0"
              >
                <span className="text-lg leading-none">🔍</span>
              </Link>
            )}
            {user && (
              <Link
                href="/saved"
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                  isActive('/saved')
                    ? 'bg-rose-50'
                    : 'grayscale hover:grayscale-0 hover:bg-rose-50/60'
                )}
              >
                <span className="text-lg leading-none">❤️</span>
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
                <Link href="/create-listing" className="hidden sm:block ml-0.5">
                  <Button
                    className="gap-2 rounded-full h-9 px-4 text-[13px] font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-colors"
                  >
                    <span className="text-sm leading-none">➕</span>
                    {t('common.createListing')}
                  </Button>
                </Link>
                {/* Desktop user menu */}
                <div className="hidden md:block ml-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        data-testid="user-menu-trigger"
                        className="relative flex items-center gap-2.5 h-10 pl-3 pr-1.5 rounded-full border border-gray-200 hover:shadow-md transition-shadow bg-white cursor-pointer"
                      >
                        <Menu className="h-4 w-4 text-gray-600" />
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-500 text-white">
                          <User className="h-4 w-4" />
                        </div>
                        {unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 py-1.5 rounded-2xl border-gray-200/60 bg-white">
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-sky-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/profile">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-sky-50 mr-3">
                            <span className="text-base leading-none">👤</span>
                          </div>
                          {t('common.profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-violet-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/messages">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-violet-50 mr-3">
                            <span className="text-base leading-none">💬</span>
                          </div>
                          Messages
                          {unreadCount > 0 && (
                            <span className="ml-auto min-w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold px-1">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-amber-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/applications">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-amber-50 mr-3">
                            <FileText className="h-4 w-4 text-amber-600" />
                          </div>
                          Applications
                          {applicationCount > 0 && (
                            <span className="ml-auto min-w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold px-1">
                              {applicationCount > 9 ? '9+' : applicationCount}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-rose-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/saved">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-rose-50 mr-3">
                            <span className="text-base leading-none">❤️</span>
                          </div>
                          {t('common.savedListings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-emerald-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/my-listings">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 mr-3">
                            <span className="text-base leading-none">🏠</span>
                          </div>
                          {t('common.myListings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-3.5 py-2.5 text-sm focus:bg-indigo-50 rounded-xl mx-1 cursor-pointer">
                        <Link href="/dashboard">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-indigo-50 mr-3">
                            <span className="text-base leading-none">📊</span>
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
                    size="sm"
                    className="rounded-full px-5 bg-rose-500 hover:bg-rose-600 text-white"
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
                  isActive('/sold-rented') ? 'bg-amber-100' : 'bg-amber-50'
                )}>
                  <span className="text-base leading-none">🏷️</span>
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
                      isActive('/messages') ? 'bg-violet-100' : 'bg-violet-50'
                    )}>
                      <span className="text-base leading-none">💬</span>
                    </div>
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-auto min-w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/applications"
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-[15px] font-medium transition-colors',
                      isActive('/applications') || isActive('/applications/landlord')
                        ? 'bg-amber-50 text-amber-900'
                        : 'text-gray-700 hover:bg-amber-50/60'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]',
                      isActive('/applications') ? 'bg-amber-100' : 'bg-amber-50'
                    )}>
                      <FileText className="h-4 w-4 text-amber-600" />
                    </div>
                    Applications
                    {applicationCount > 0 && (
                      <span className="ml-auto min-w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold px-1">
                        {applicationCount > 9 ? '9+' : applicationCount}
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
                      isActive('/saved') ? 'bg-rose-100' : 'bg-rose-50'
                    )}>
                      <span className="text-base leading-none">❤️</span>
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
                      isActive('/my-listings') ? 'bg-emerald-100' : 'bg-emerald-50'
                    )}>
                      <span className="text-base leading-none">🏠</span>
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
                      isActive('/profile') ? 'bg-sky-100' : 'bg-sky-50'
                    )}>
                      <span className="text-base leading-none">👤</span>
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
                      isActive('/dashboard') ? 'bg-indigo-100' : 'bg-indigo-50'
                    )}>
                      <span className="text-base leading-none">📊</span>
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
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-semibold text-white bg-rose-500 shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/20">
                      <span className="text-base leading-none">➕</span>
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
                    className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl mx-2 text-sm font-semibold text-white bg-rose-500 shadow-sm"
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
