'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users, Home, Eye, MessageSquare, FileText, CheckCircle, Clock,
  LogOut, Shield, Search, ChevronDown, ChevronUp, ExternalLink,
  TrendingUp, Flame, BarChart3, ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Profile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  created_at: string;
  listing_count: number;
  active_listing_count: number;
}

interface AdminListing {
  id: string;
  title: string;
  user_id: string;
  price: number;
  currency: string;
  city: string | null;
  country: string | null;
  property_type: string;
  listing_type: string;
  status: string | null;
  is_active: boolean;
  is_draft: boolean;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  images: string[] | null;
  area_sqm: number | null;
  bedrooms: number | null;
  view_count: number;
  inquiry_count: number;
}

interface Summary {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  draftListings: number;
  soldListings: number;
  rentedListings: number;
  totalViews: number;
  totalInquiries: number;
}

type SortField = 'created_at' | 'view_count' | 'inquiry_count' | 'price' | 'title';
type SortDir = 'asc' | 'desc';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [data, setData] = useState<{ users: Profile[]; listings: AdminListing[]; summary: Summary } | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [listingSort, setListingSort] = useState<{ field: SortField; dir: SortDir }>({ field: 'created_at', dir: 'desc' });
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => {
        setIsAuthenticated(res.ok);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    setDataLoading(true);
    fetch('/api/admin/data')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setDataLoading(false);
      })
      .catch(() => setDataLoading(false));
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Connection error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    setData(null);
  };

  const toggleListingSort = (field: SortField) => {
    setListingSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { field, dir: 'desc' }
    );
  };

  // Filtered and sorted listings
  const filteredListings = useMemo(() => {
    if (!data) return [];
    let result = data.listings;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q) ||
          l.id.includes(q)
      );
    }

    return result.sort((a, b) => {
      const dir = listingSort.dir === 'desc' ? -1 : 1;
      switch (listingSort.field) {
        case 'view_count':
          return (a.view_count - b.view_count) * dir;
        case 'inquiry_count':
          return (a.inquiry_count - b.inquiry_count) * dir;
        case 'price':
          return (a.price - b.price) * dir;
        case 'title':
          return (a.title || '').localeCompare(b.title || '') * dir;
        case 'created_at':
        default:
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      }
    });
  }, [data, searchQuery, listingSort]);

  // User map for name lookups
  const userMap = useMemo(() => {
    if (!data) return new Map<string, Profile>();
    const m = new Map<string, Profile>();
    data.users.forEach((u) => m.set(u.user_id, u));
    return m;
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">hemma admin</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                autoComplete="username"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoggingIn || !username || !password}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition-all"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  const s = data?.summary;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">hemma admin</span>
          </div>

          <div className="flex items-center gap-1">
            {(['overview', 'users', 'listings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-gray-500">Failed to load data</div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={Users} label="Users" value={s?.totalUsers || 0} />
                  <StatCard icon={Home} label="Listings" value={s?.totalListings || 0} />
                  <StatCard icon={Eye} label="Total Views" value={s?.totalViews || 0} />
                  <StatCard icon={MessageSquare} label="Inquiries" value={s?.totalInquiries || 0} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={CheckCircle} label="Active" value={s?.activeListings || 0} color="emerald" />
                  <StatCard icon={FileText} label="Drafts" value={s?.draftListings || 0} color="amber" />
                  <StatCard icon={TrendingUp} label="Sold" value={s?.soldListings || 0} color="blue" />
                  <StatCard icon={Clock} label="Rented" value={s?.rentedListings || 0} color="violet" />
                </div>

                {/* Top Listings by Views */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <h2 className="text-sm font-semibold">Top Listings by Views</h2>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {data.listings
                      .sort((a, b) => b.view_count - a.view_count)
                      .slice(0, 10)
                      .map((listing, i) => (
                        <div key={listing.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                          <span className="text-xs font-mono text-gray-600 w-5">{i + 1}</span>
                          {listing.images?.[0] ? (
                            <img src={listing.images[0]} alt="" className="h-9 w-9 rounded-lg object-cover bg-gray-800" />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-gray-800 flex items-center justify-center">
                              <Home className="h-4 w-4 text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">{listing.title || 'Untitled'}</p>
                            <p className="text-xs text-gray-500">{listing.city}{listing.country ? `, ${listing.country}` : ''}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-gray-200">{listing.view_count.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">views</p>
                          </div>
                          <Link
                            href={`/listing/${listing.id}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-300 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Users */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <h2 className="text-sm font-semibold">Recent Users</h2>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {data.users.slice(0, 10).map((user) => (
                      <div key={user.user_id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-400">
                          {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">{user.full_name || 'No name'}</p>
                          <p className="text-xs text-gray-500">
                            {user.listing_count} listing{user.listing_count !== 1 ? 's' : ''}
                            {user.active_listing_count > 0 && ` (${user.active_listing_count} active)`}
                          </p>
                        </div>
                        <span className="text-xs text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <span className="text-xs text-gray-500">{data.users.length} users</span>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.04]">
                  {data.users
                    .filter((u) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        u.full_name?.toLowerCase().includes(q) ||
                        u.user_id.includes(q) ||
                        u.phone?.includes(q)
                      );
                    })
                    .map((user) => {
                      const userListings = data.listings.filter((l) => l.user_id === user.user_id);
                      const isExpanded = expandedUser === user.user_id;

                      return (
                        <div key={user.user_id}>
                          <button
                            onClick={() => setExpandedUser(isExpanded ? null : user.user_id)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors text-left"
                          >
                            <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-400 shrink-0">
                              {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-200 truncate">
                                {user.full_name || 'No name'}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.phone || 'No phone'} &middot; Joined {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-300">{user.listing_count}</p>
                                <p className="text-[10px] text-gray-500">listings</p>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </button>

                          {isExpanded && userListings.length > 0 && (
                            <div className="border-t border-white/[0.04] bg-white/[0.01]">
                              {userListings.map((listing) => (
                                <div key={listing.id} className="flex items-center gap-3 px-4 pl-16 py-2.5">
                                  {listing.images?.[0] ? (
                                    <img src={listing.images[0]} alt="" className="h-8 w-8 rounded-lg object-cover bg-gray-800" />
                                  ) : (
                                    <div className="h-8 w-8 rounded-lg bg-gray-800 flex items-center justify-center">
                                      <Home className="h-3.5 w-3.5 text-gray-600" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-300 truncate">{listing.title || 'Untitled'}</p>
                                    <div className="flex items-center gap-2">
                                      <StatusBadge listing={listing} />
                                      <span className="text-[10px] text-gray-500">
                                        {listing.view_count} views &middot; {listing.inquiry_count} inquiries
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-xs font-medium text-gray-400">
                                    {formatPrice(listing.price, listing.currency)}
                                  </span>
                                  <Link
                                    href={`/listing/${listing.id}`}
                                    target="_blank"
                                    className="text-gray-600 hover:text-gray-300 transition-colors"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Link>
                                </div>
                              ))}
                            </div>
                          )}

                          {isExpanded && userListings.length === 0 && (
                            <div className="px-4 pl-16 py-3 text-xs text-gray-600">
                              No listings
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Listings Tab */}
            {activeTab === 'listings' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search listings..."
                      className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <span className="text-xs text-gray-500">{filteredListings.length} listings</span>
                </div>

                {/* Sort headers */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[1fr_100px_80px_80px_80px_28px] gap-2 px-4 py-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-white/[0.04]">
                    <SortHeader label="Listing" field="title" current={listingSort} onSort={toggleListingSort} />
                    <SortHeader label="Price" field="price" current={listingSort} onSort={toggleListingSort} className="text-right" />
                    <SortHeader label="Views" field="view_count" current={listingSort} onSort={toggleListingSort} className="text-right" />
                    <SortHeader label="Inquiries" field="inquiry_count" current={listingSort} onSort={toggleListingSort} className="text-right" />
                    <SortHeader label="Date" field="created_at" current={listingSort} onSort={toggleListingSort} className="text-right" />
                    <div />
                  </div>

                  <div className="divide-y divide-white/[0.04]">
                    {filteredListings.map((listing) => {
                      const owner = userMap.get(listing.user_id);
                      return (
                        <div key={listing.id} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_80px_80px_80px_28px] gap-2 items-center px-4 py-3 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            {listing.images?.[0] ? (
                              <img src={listing.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover bg-gray-800 shrink-0" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                                <Home className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-200 truncate">{listing.title || 'Untitled'}</p>
                              <div className="flex items-center gap-1.5">
                                <StatusBadge listing={listing} />
                                <span className="text-[10px] text-gray-500 truncate">
                                  {owner?.full_name || 'Unknown'} &middot; {listing.city || 'No city'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-300 sm:text-right">
                            {formatPrice(listing.price, listing.currency)}
                          </p>
                          <p className="text-sm text-gray-400 sm:text-right">{listing.view_count.toLocaleString()}</p>
                          <p className="text-sm text-gray-400 sm:text-right">{listing.inquiry_count}</p>
                          <p className="text-xs text-gray-500 sm:text-right">
                            {new Date(listing.created_at).toLocaleDateString()}
                          </p>
                          <Link
                            href={`/listing/${listing.id}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-300 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// --- Helper Components ---

function StatCard({
  icon: Icon,
  label,
  value,
  color = 'gray',
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color?: 'gray' | 'emerald' | 'amber' | 'blue' | 'violet';
}) {
  const colorClasses = {
    gray: 'bg-white/[0.03] border-white/[0.06]',
    emerald: 'bg-emerald-500/[0.06] border-emerald-500/[0.1]',
    amber: 'bg-amber-500/[0.06] border-amber-500/[0.1]',
    blue: 'bg-blue-500/[0.06] border-blue-500/[0.1]',
    violet: 'bg-violet-500/[0.06] border-violet-500/[0.1]',
  };
  const iconColors = {
    gray: 'text-gray-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    violet: 'text-violet-400',
  };

  return (
    <div className={cn('rounded-xl border p-4', colorClasses[color])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', iconColors[color])} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value.toLocaleString()}</p>
    </div>
  );
}

function StatusBadge({ listing }: { listing: AdminListing }) {
  if (listing.is_draft) {
    return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">Draft</span>;
  }
  if (listing.status === 'sold') {
    return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">Sold</span>;
  }
  if (listing.status === 'rented') {
    return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">Rented</span>;
  }
  if (listing.is_active) {
    return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">Active</span>;
  }
  return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20">Inactive</span>;
}

function SortHeader({
  label,
  field,
  current,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  current: { field: SortField; dir: SortDir };
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = current.field === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={cn('flex items-center gap-1 hover:text-gray-300 transition-colors', className, isActive && 'text-gray-300')}
    >
      {label}
      {isActive && (
        <ArrowUpDown className="h-2.5 w-2.5" />
      )}
    </button>
  );
}

function formatPrice(price: number, currency: string): string {
  const symbol = currency === 'EUR' ? '\u20AC' : currency === 'USD' ? '$' : currency === 'GBP' ? '\u00A3' : currency;
  if (price >= 1000000) return `${symbol}${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${symbol}${(price / 1000).toFixed(0)}k`;
  return `${symbol}${price}`;
}
