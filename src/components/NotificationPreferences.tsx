import { Bell, Mail, Newspaper } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationPreferences() {
  const { user } = useAuth();
  const { data: preferences, isLoading } = useNotificationPreferences(user?.id);
  const updatePreferences = useUpdateNotificationPreferences();

  const handleToggle = (key: 'email_on_new_message' | 'email_daily_digest', value: boolean) => {
    if (!user) return;
    updatePreferences.mutate({
      userId: user.id,
      preferences: { [key]: value },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified about new messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email on new message */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <Label htmlFor="email-messages" className="text-base font-medium cursor-pointer">
                Email notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive an email when you get a new message
              </p>
            </div>
          </div>
          <Switch
            id="email-messages"
            checked={preferences?.email_on_new_message ?? true}
            onCheckedChange={(checked) => handleToggle('email_on_new_message', checked)}
            disabled={updatePreferences.isPending}
          />
        </div>

        {/* Daily digest */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Newspaper className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-0.5">
              <Label htmlFor="email-digest" className="text-base font-medium cursor-pointer">
                Daily digest
              </Label>
              <p className="text-sm text-muted-foreground">
                Get a daily summary of unread messages
              </p>
            </div>
          </div>
          <Switch
            id="email-digest"
            checked={preferences?.email_daily_digest ?? false}
            onCheckedChange={(checked) => handleToggle('email_daily_digest', checked)}
            disabled={updatePreferences.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
