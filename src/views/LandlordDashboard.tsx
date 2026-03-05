'use client';

import Link from 'next/link';
import { Eye, MessageSquare, Mail, Home, TrendingUp, ArrowLeft, ExternalLink, BarChart3 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useLandlordAnalytics } from '@/hooks/useLandlordAnalytics';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDistanceToNow } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  isLoading 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-accent" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LandlordDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const { data: analytics, isLoading } = useLandlordAnalytics(user?.id);

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <div className="h-16" />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-background">
        <Header />
        <div className="h-16" />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-slate-500/10 blur-xl" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-sm">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('dashboard.signInRequired')}</h1>
            <p className="text-muted-foreground mb-6">{t('dashboard.signInToView')}</p>
            <Link href="/auth">
              <Button>{t('common.signIn')}</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const chartData = analytics?.dailyMetrics.map(m => ({
    date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [t('dashboard.views')]: m.views,
    [t('dashboard.inquiries')]: m.inquiries,
  })) || [];

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <div className="h-16" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/my-listings">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-sm">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('dashboard.title')}</h1>
              <p className="text-muted-foreground text-sm">{t('dashboard.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title={t('dashboard.totalViews')}
            value={analytics?.totalViews || 0}
            icon={Eye}
            isLoading={isLoading}
          />
          <StatCard
            title={t('dashboard.totalInquiries')}
            value={analytics?.totalInquiries || 0}
            icon={MessageSquare}
            isLoading={isLoading}
          />
          <StatCard
            title={t('dashboard.totalMessages')}
            value={analytics?.totalMessages || 0}
            icon={Mail}
            isLoading={isLoading}
          />
          <StatCard
            title={t('dashboard.activeListings')}
            value={analytics?.activeListings || 0}
            icon={Home}
            isLoading={isLoading}
          />
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('dashboard.activityOverTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={t('dashboard.views')} 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={t('dashboard.inquiries')} 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                {t('dashboard.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Listing Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {t('dashboard.listingPerformance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : analytics?.listingAnalytics.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">{t('dashboard.noListings')}</p>
                <Link href="/create-listing">
                  <Button>{t('common.createListing')}</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">{t('dashboard.listing')}</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t('dashboard.status')}</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t('dashboard.views')}</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t('dashboard.inquiries')}</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">{t('dashboard.messages')}</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">{t('dashboard.lastActivity')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.listingAnalytics.map((listing) => (
                      <tr key={listing.listingId} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-2">
                          <Link 
                            href={`/listing/${listing.listingId}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                              {listing.images[0] ? (
                                <img 
                                  src={listing.images[0]} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Home className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                              {listing.title}
                            </span>
                            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            listing.isActive 
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {listing.isActive ? t('dashboard.active') : t('dashboard.inactive')}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-medium">{listing.viewCount}</td>
                        <td className="py-3 px-2 text-center font-medium">{listing.inquiryCount}</td>
                        <td className="py-3 px-2 text-center font-medium">{listing.messageCount}</td>
                        <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                          {listing.lastActivityAt 
                            ? formatDistanceToNow(new Date(listing.lastActivityAt), { addSuffix: true })
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
