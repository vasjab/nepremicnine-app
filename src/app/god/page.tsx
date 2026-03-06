'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users, Home, Eye, MessageSquare, FileText, CheckCircle, Clock,
  LogOut, Lock, Search, ChevronDown, ChevronUp, ExternalLink,
  TrendingUp, Flame, BarChart3, ArrowUpDown, Power, Trash2, Ban,
  ShieldOff, Pencil, Loader2, Database, UserRoundCog, MoreHorizontal,
  ArrowLeft, MapPin, BedDouble, Bath, Ruler, Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Profile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  email: string | null;
  created_at: string;
  listing_count: number;
  active_listing_count: number;
  is_banned: boolean;
  last_sign_in: string | null;
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; label: string } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);

  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => {
        setIsAuthenticated(res.ok);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

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

  const handleSeed = async () => {
    if (!confirm('This will create mock landlords, tenants, applications, and messages. Continue?')) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || d.log?.join('\n') || 'Seed failed');
      const s = d.summary;
      alert(`Seeded successfully!\n\n${d.log?.join('\n') || ''}\n\nSummary:\n- ${s.landlords} landlords\n- ${s.tenants} tenants\n- ${s.listings_distributed} listings distributed\n- ${s.applications} applications\n- ${s.conversations} conversations\n- ${s.messages} messages`);
      refreshData();
    } catch (e: any) {
      alert('Seed failed: ' + e.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleAssignOwners = async () => {
    if (!confirm('This will create 5 landlord accounts and assign ALL listings to them. Continue?')) return;
    setAssigning(true);
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign_owners' }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      alert(`Done!\n\n${d.log?.join('\n') || ''}\n\nAssigned: ${d.assigned}/${d.total} listings`);
      refreshData();
    } catch (e: any) {
      alert('Failed: ' + e.message);
    } finally {
      setAssigning(false);
    }
  };

  const refreshData = () => {
    setDataLoading(true);
    fetch('/api/admin/data')
      .then((res) => res.json())
      .then((d) => { setData(d); setDataLoading(false); })
      .catch(() => setDataLoading(false));
  };

  const runAction = async (action: string, params: Record<string, any>) => {
    const key = `${action}_${params.listing_id || params.user_id}`;
    setActionLoading(key);
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error || 'Action failed'}`);
      } else {
        // For delete_listing, optimistically remove from local state
        if (action === 'delete_listing') {
          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              listings: prev.listings.filter((l) => l.id !== params.listing_id),
              summary: { ...prev.summary, totalListings: prev.summary.totalListings - 1 },
            };
          });
          if (selectedListing?.id === params.listing_id) {
            setSelectedListing(null);
          }
        } else {
          refreshData();
        }
      }
    } catch {
      alert('Network error');
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  // Optimistic toggle — no full reload
  const handleToggleListing = async (listing: AdminListing) => {
    const newActive = !listing.is_active;
    const revert = () => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          listings: prev.listings.map((l) => l.id === listing.id ? { ...l, is_active: !newActive } : l),
          summary: { ...prev.summary, activeListings: prev.summary.activeListings + (newActive ? -1 : 1) },
        };
      });
      if (selectedListing?.id === listing.id) {
        setSelectedListing((prev) => prev ? { ...prev, is_active: !newActive } : prev);
      }
    };

    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        listings: prev.listings.map((l) => l.id === listing.id ? { ...l, is_active: newActive } : l),
        summary: { ...prev.summary, activeListings: prev.summary.activeListings + (newActive ? 1 : -1) },
      };
    });
    if (selectedListing?.id === listing.id) {
      setSelectedListing((prev) => prev ? { ...prev, is_active: newActive } : prev);
    }

    setActionLoading(`toggle_listing_${listing.id}`);
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_listing', listing_id: listing.id, is_active: newActive }),
      });
      if (!res.ok) {
        revert();
        const err = await res.json();
        alert(`Error: ${err.error || 'Action failed'}`);
      }
    } catch {
      revert();
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleImpersonate = async (userId: string) => {
    setActionLoading(`impersonate_${userId}`);
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'impersonate_user', user_id: userId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      window.open(d.url, '_blank');
    } catch (e: any) {
      alert('Impersonate failed: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleListingSort = (field: SortField) => {
    setListingSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { field, dir: 'desc' }
    );
  };

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
        case 'view_count': return (a.view_count - b.view_count) * dir;
        case 'inquiry_count': return (a.inquiry_count - b.inquiry_count) * dir;
        case 'price': return (a.price - b.price) * dir;
        case 'title': return (a.title || '').localeCompare(b.title || '') * dir;
        case 'created_at':
        default: return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      }
    });
  }, [data, searchQuery, listingSort]);

  const userMap = useMemo(() => {
    if (!data) return new Map<string, Profile>();
    const m = new Map<string, Profile>();
    data.users.forEach((u) => m.set(u.user_id, u));
    return m;
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  // Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-[340px]">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm mb-4">
              <Home className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">hemma</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-foreground placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
              autoComplete="username"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-11 px-4 rounded-xl bg-white border border-gray-200 text-foreground placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
              autoComplete="current-password"
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoggingIn || !username || !password}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 text-white font-semibold text-sm disabled:opacity-50 transition-all hover:from-slate-800 hover:to-slate-950 active:scale-[0.98]"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Sign In
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  const s = data?.summary;

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900">
                <Home className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground tracking-tight">hemma <span className="text-muted-foreground font-medium">admin</span></span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAssignOwners}
                disabled={assigning}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {assigning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{assigning ? 'Assigning...' : 'Assign Owners'}</span>
              </button>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{seeding ? 'Seeding...' : 'Seed Data'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 -mb-px">
            {(['overview', 'users', 'listings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearchQuery(''); setSelectedListing(null); }}
                className={cn(
                  'px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px',
                  activeTab === tab
                    ? 'border-gray-900 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-5 w-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-muted-foreground">Failed to load data</div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={Users} label="Users" value={s?.totalUsers || 0} color="sky" />
                  <StatCard icon={Home} label="Listings" value={s?.totalListings || 0} color="slate" />
                  <StatCard icon={Eye} label="Total Views" value={s?.totalViews || 0} color="violet" />
                  <StatCard icon={MessageSquare} label="Inquiries" value={s?.totalInquiries || 0} color="emerald" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <MiniStat label="Active" value={s?.activeListings || 0} color="text-emerald-600" />
                  <MiniStat label="Drafts" value={s?.draftListings || 0} color="text-amber-600" />
                  <MiniStat label="Sold" value={s?.soldListings || 0} color="text-blue-600" />
                  <MiniStat label="Rented" value={s?.rentedListings || 0} color="text-violet-600" />
                </div>

                {/* Top Listings */}
                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
                  <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <h2 className="text-sm font-semibold text-foreground">Top Listings by Views</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {data.listings
                      .sort((a, b) => b.view_count - a.view_count)
                      .slice(0, 10)
                      .map((listing, i) => (
                        <div key={listing.id} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50/50 transition-colors">
                          <span className="text-xs font-mono text-gray-300 w-5 text-right shrink-0">{i + 1}</span>
                          {listing.images?.[0] ? (
                            <img src={listing.images[0]} alt="" className="h-9 w-9 rounded-lg object-cover bg-gray-100 shrink-0" />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <Home className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{listing.title || 'Untitled'}</p>
                            <p className="text-xs text-muted-foreground">{listing.city}{listing.country ? `, ${listing.country}` : ''} <span className="text-gray-300 font-mono text-[10px] ml-1">{listing.id.slice(0, 8)}</span></p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-foreground tabular-nums">{listing.view_count.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">views</p>
                          </div>
                          <button
                            onClick={() => { setActiveTab('listings'); setSelectedListing(listing); }}
                            className="text-gray-300 hover:text-gray-600 transition-colors shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Users */}
                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
                  <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <Users className="h-4 w-4 text-sky-500" />
                    <h2 className="text-sm font-semibold text-foreground">Recent Users</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {data.users.slice(0, 10).map((user) => (
                      <div key={user.user_id} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50/50 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
                          {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{user.full_name || 'No name'}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.listing_count} listing{user.listing_count !== 1 ? 's' : ''}
                            {user.active_listing_count > 0 && ` (${user.active_listing_count} active)`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-gray-200 text-foreground placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{data.users.length} users</span>
                </div>

                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white divide-y divide-gray-50">
                  {data.users
                    .filter((u) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return u.full_name?.toLowerCase().includes(q) || u.user_id.includes(q) || u.phone?.includes(q);
                    })
                    .map((user) => {
                      const userListings = data.listings.filter((l) => l.user_id === user.user_id);
                      const isExpanded = expandedUser === user.user_id;

                      return (
                        <div key={user.user_id}>
                          <button
                            onClick={() => setExpandedUser(isExpanded ? null : user.user_id)}
                            className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-gray-50/50 transition-colors text-left"
                          >
                            <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500 shrink-0">
                              {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground truncate">{user.full_name || 'No name'}</p>
                                {user.is_banned && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-red-50 text-red-600 ring-1 ring-red-200/60">Banned</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email || user.phone || 'No contact'} &middot; Joined {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <p className="text-sm font-semibold text-foreground">{user.listing_count}</p>
                                <p className="text-[10px] text-muted-foreground">listings</p>
                              </div>
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                            </div>
                          </button>

                          {/* User action buttons */}
                          {isExpanded && (
                            <div className="flex items-center gap-2 px-4 sm:px-5 pl-8 sm:pl-[68px] py-2.5 border-t border-gray-100 bg-gray-50/30">
                              <ActionBtn
                                icon={UserRoundCog}
                                label="Login as"
                                loading={actionLoading === `impersonate_${user.user_id}`}
                                onClick={() => handleImpersonate(user.user_id)}
                              />
                              {user.is_banned ? (
                                <ActionBtn
                                  icon={ShieldOff}
                                  label="Unban"
                                  loading={actionLoading === `unban_user_${user.user_id}`}
                                  onClick={() => runAction('unban_user', { user_id: user.user_id })}
                                  variant="green"
                                />
                              ) : (
                                <ActionBtn
                                  icon={Ban}
                                  label="Ban"
                                  loading={actionLoading === `ban_user_${user.user_id}`}
                                  onClick={() => setConfirmAction({ type: 'ban_user', id: user.user_id, label: `Ban ${user.full_name || 'this user'}? Their listings will be deactivated.` })}
                                  variant="amber"
                                />
                              )}
                              <ActionBtn
                                icon={Trash2}
                                label="Delete"
                                loading={actionLoading === `delete_user_${user.user_id}`}
                                onClick={() => setConfirmAction({ type: 'delete_user', id: user.user_id, label: `Permanently delete ${user.full_name || 'this user'} and all their data? This cannot be undone.` })}
                                variant="red"
                              />
                            </div>
                          )}

                          {isExpanded && userListings.length > 0 && (
                            <div className="border-t border-gray-100 bg-gray-50/30">
                              {userListings.map((listing) => (
                                <button
                                  key={listing.id}
                                  onClick={() => { setActiveTab('listings'); setSelectedListing(listing); }}
                                  className="w-full flex items-center gap-3 px-4 sm:px-5 pl-8 sm:pl-[68px] py-2.5 hover:bg-gray-100/50 transition-colors text-left"
                                >
                                  {listing.images?.[0] ? (
                                    <img src={listing.images[0]} alt="" className="h-8 w-8 rounded-lg object-cover bg-gray-100 shrink-0" />
                                  ) : (
                                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                      <Home className="h-3.5 w-3.5 text-gray-300" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">{listing.title || 'Untitled'}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <StatusBadge listing={listing} />
                                      <span className="text-[10px] text-muted-foreground">
                                        {listing.view_count} views &middot; {listing.inquiry_count} inquiries
                                      </span>
                                      <span className="text-gray-300 font-mono text-[10px]">{listing.id.slice(0, 8)}</span>
                                    </div>
                                  </div>
                                  <span className="text-xs font-medium text-foreground shrink-0 hidden sm:block">
                                    {formatPrice(listing.price, listing.currency)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {isExpanded && userListings.length === 0 && (
                            <div className="px-4 sm:px-5 pl-8 sm:pl-[68px] py-3 text-xs text-muted-foreground border-t border-gray-100 bg-gray-50/30">No listings</div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Listings Tab */}
            {activeTab === 'listings' && (
              selectedListing ? (
                <ListingDetail
                  listing={selectedListing}
                  owner={userMap.get(selectedListing.user_id)}
                  actionLoading={actionLoading}
                  onBack={() => setSelectedListing(null)}
                  onToggle={() => handleToggleListing(selectedListing)}
                  onDelete={() => setConfirmAction({ type: 'delete_listing', id: selectedListing.id, label: `Delete "${selectedListing.title || 'Untitled'}"? This cannot be undone.` })}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search listings..."
                        className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-gray-200 text-foreground placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{filteredListings.length} listings</span>
                  </div>

                  <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
                    {/* Desktop sort headers */}
                    <div className="hidden sm:grid grid-cols-[1fr_90px_70px_70px_80px_40px] gap-2 px-5 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                      <SortHeader label="Listing" field="title" current={listingSort} onSort={toggleListingSort} />
                      <SortHeader label="Price" field="price" current={listingSort} onSort={toggleListingSort} className="justify-end" />
                      <SortHeader label="Views" field="view_count" current={listingSort} onSort={toggleListingSort} className="justify-end" />
                      <SortHeader label="Msgs" field="inquiry_count" current={listingSort} onSort={toggleListingSort} className="justify-end" />
                      <SortHeader label="Date" field="created_at" current={listingSort} onSort={toggleListingSort} className="justify-end" />
                      <span />
                    </div>

                    {/* Mobile sort */}
                    <div className="sm:hidden flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
                      <span className="text-[10px] text-muted-foreground uppercase shrink-0">Sort:</span>
                      {(['created_at', 'view_count', 'price'] as SortField[]).map((field) => (
                        <button
                          key={field}
                          onClick={() => toggleListingSort(field)}
                          className={cn(
                            'text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors shrink-0',
                            listingSort.field === field ? 'bg-gray-900 text-white' : 'text-muted-foreground hover:bg-gray-100'
                          )}
                        >
                          {field === 'created_at' ? 'Date' : field === 'view_count' ? 'Views' : 'Price'}
                        </button>
                      ))}
                    </div>

                    <div className="divide-y divide-gray-50">
                      {filteredListings.map((listing) => {
                        const owner = userMap.get(listing.user_id);
                        return (
                          <div
                            key={listing.id}
                            className="px-4 sm:px-5 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedListing(listing)}
                          >
                            {/* Desktop */}
                            <div className="hidden sm:grid grid-cols-[1fr_90px_70px_70px_80px_40px] gap-2 items-center">
                              <div className="flex items-center gap-3 min-w-0">
                                {listing.images?.[0] ? (
                                  <img src={listing.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <Home className="h-4 w-4 text-gray-300" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{listing.title || 'Untitled'}</p>
                                  <div className="flex items-center gap-1.5">
                                    <StatusBadge listing={listing} />
                                    <span className="text-[10px] text-muted-foreground truncate">
                                      {owner?.full_name || 'Unknown'} &middot; {listing.city || ''} <span className="text-gray-300 font-mono">{listing.id.slice(0, 8)}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm font-medium text-foreground text-right tabular-nums">{formatPrice(listing.price, listing.currency)}</p>
                              <p className="text-sm text-muted-foreground text-right tabular-nums">{listing.view_count.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground text-right tabular-nums">{listing.inquiry_count}</p>
                              <p className="text-xs text-muted-foreground text-right">{new Date(listing.created_at).toLocaleDateString()}</p>
                              <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                                <ListingDropdown
                                  listing={listing}
                                  actionLoading={actionLoading}
                                  onToggle={() => handleToggleListing(listing)}
                                  onDelete={() => setConfirmAction({ type: 'delete_listing', id: listing.id, label: `Delete "${listing.title || 'Untitled'}"? This cannot be undone.` })}
                                />
                              </div>
                            </div>

                            {/* Mobile */}
                            <div className="sm:hidden">
                              <div className="flex items-center gap-3">
                                {listing.images?.[0] ? (
                                  <img src={listing.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                                ) : (
                                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <Home className="h-5 w-5 text-gray-300" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{listing.title || 'Untitled'}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <StatusBadge listing={listing} />
                                    <span className="text-[10px] text-muted-foreground">{formatPrice(listing.price, listing.currency)}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                    <span>{listing.view_count} views</span>
                                    <span>{listing.inquiry_count} msgs</span>
                                    <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                  <ListingDropdown
                                    listing={listing}
                                    actionLoading={actionLoading}
                                    onToggle={() => handleToggleListing(listing)}
                                    onDelete={() => setConfirmAction({ type: 'delete_listing', id: listing.id, label: `Delete "${listing.title || 'Untitled'}"?` })}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmAction(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-foreground font-medium">{confirmAction.label}</p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => runAction(confirmAction.type, confirmAction.type.includes('user') ? { user_id: confirmAction.id } : { listing_id: confirmAction.id })}
                disabled={!!actionLoading}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50',
                  confirmAction.type.includes('delete') ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
                )}
              >
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Components ---

function ListingDropdown({ listing, actionLoading, onToggle, onDelete }: {
  listing: AdminListing;
  actionLoading: string | null;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isToggling = actionLoading === `toggle_listing_${listing.id}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onToggle} disabled={isToggling}>
          {isToggling ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Power className={cn('h-3.5 w-3.5 mr-2', listing.is_active ? 'text-emerald-500' : 'text-gray-400')} />}
          {listing.is_active ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/edit-listing/${listing.id}`} target="_blank">
            <Pencil className="h-3.5 w-3.5 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/listing/${listing.id}`} target="_blank">
            <ExternalLink className="h-3.5 w-3.5 mr-2" />
            View on site
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ListingDetail({ listing, owner, actionLoading, onBack, onToggle, onDelete }: {
  listing: AdminListing;
  owner: Profile | undefined;
  actionLoading: string | null;
  onBack: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isToggling = actionLoading === `toggle_listing_${listing.id}`;
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </button>

      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
        <div className="flex flex-col sm:flex-row">
          {listing.images?.[0] && (
            <div className="sm:w-72 h-48 sm:h-auto shrink-0">
              <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 p-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge listing={listing} />
                <span className="text-xs text-muted-foreground font-mono">{listing.id.slice(0, 8)}</span>
                <span className="text-xs text-muted-foreground capitalize">{listing.listing_type}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{listing.title || 'Untitled'}</h2>
              {(listing.city || listing.country) && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {listing.city}{listing.country ? `, ${listing.country}` : ''}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <span className="font-semibold text-foreground text-lg">{formatPrice(listing.price, listing.currency)}{listing.listing_type === 'rent' ? '/mo' : ''}</span>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5" /> {listing.property_type}</span>
              {listing.bedrooms != null && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {listing.bedrooms} bed</span>}
              {listing.area_sqm != null && <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {listing.area_sqm} m&sup2;</span>}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {listing.view_count} views</span>
              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {listing.inquiry_count} inquiries</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(listing.created_at).toLocaleDateString()}</span>
            </div>

            {owner && (
              <div className="flex items-center gap-2 text-sm pt-1 border-t border-gray-100">
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500">
                  {owner.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="text-muted-foreground">Owner:</span>
                <span className="font-medium text-foreground">{owner.full_name || 'Unknown'}</span>
                {owner.email && <span className="text-xs text-muted-foreground">({owner.email})</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onToggle}
          disabled={isToggling}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50',
            listing.is_active
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          )}
        >
          {isToggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
          {listing.is_active ? 'Deactivate' : 'Activate'}
        </button>
        <Link
          href={`/edit-listing/${listing.id}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Link>
        <Link
          href={`/listing/${listing.id}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" /> View on site
        </Link>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>

      {/* Image gallery */}
      {listing.images && listing.images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {listing.images.map((img, i) => (
            <img key={i} src={img} alt="" className="rounded-xl aspect-[4/3] object-cover w-full bg-gray-100" />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number;
  color: 'sky' | 'slate' | 'violet' | 'emerald';
}) {
  const styles = {
    sky: { bg: 'bg-sky-50', icon: 'text-sky-500' },
    slate: { bg: 'bg-gray-50', icon: 'text-gray-500' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-500' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500' },
  };
  const s = styles[color];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className={cn('inline-flex items-center justify-center h-8 w-8 rounded-xl mb-3', s.bg)}>
        <Icon className={cn('h-4 w-4', s.icon)} />
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight tabular-nums">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-lg font-bold tracking-tight tabular-nums', color)}>{value}</span>
    </div>
  );
}

function StatusBadge({ listing }: { listing: AdminListing }) {
  if (listing.is_draft) return <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-amber-50 text-amber-600 ring-1 ring-amber-200/60">Draft</span>;
  if (listing.status === 'sold') return <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-blue-50 text-blue-600 ring-1 ring-blue-200/60">Sold</span>;
  if (listing.status === 'rented') return <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-violet-50 text-violet-600 ring-1 ring-violet-200/60">Rented</span>;
  if (listing.is_active) return <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60">Active</span>;
  return <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-gray-50 text-gray-500 ring-1 ring-gray-200/60">Inactive</span>;
}

function SortHeader({ label, field, current, onSort, className }: {
  label: string; field: SortField; current: { field: SortField; dir: SortDir }; onSort: (f: SortField) => void; className?: string;
}) {
  const isActive = current.field === field;
  return (
    <button onClick={() => onSort(field)} className={cn('flex items-center gap-1 hover:text-foreground transition-colors', className, isActive && 'text-foreground')}>
      {label}
      {isActive && <ArrowUpDown className="h-2.5 w-2.5" />}
    </button>
  );
}

function ActionBtn({ icon: Icon, label, loading, onClick, variant = 'default', small = false }: {
  icon: React.ElementType; label: string; loading: boolean; onClick: () => void;
  variant?: 'default' | 'red' | 'amber' | 'green'; small?: boolean;
}) {
  const styles = {
    default: 'text-muted-foreground hover:bg-gray-100',
    red: 'text-red-500 hover:bg-red-50',
    amber: 'text-amber-600 hover:bg-amber-50',
    green: 'text-emerald-600 hover:bg-emerald-50',
  };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg font-medium transition-colors disabled:opacity-50',
        small ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs',
        styles[variant]
      )}
    >
      {loading ? <Loader2 className={cn(small ? 'h-3 w-3' : 'h-3.5 w-3.5', 'animate-spin')} /> : <Icon className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      {label}
    </button>
  );
}

function formatPrice(price: number, currency: string): string {
  const symbol = currency === 'EUR' ? '\u20AC' : currency === 'USD' ? '$' : currency === 'GBP' ? '\u00A3' : currency;
  if (price >= 1000000) return `${symbol}${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${symbol}${(price / 1000).toFixed(0)}k`;
  return `${symbol}${price}`;
}
