'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationPreferences } from '@/components/NotificationPreferences';

interface AccountSectionProps {
  onSignOut: () => void;
}

export function AccountSection({ onSignOut }: AccountSectionProps) {
  return (
    <>
      {/* Notification Preferences */}
      <div className="pt-2">
        <NotificationPreferences />
      </div>

      {/* Sign Out */}
      <Button
        variant="outline"
        onClick={onSignOut}
        className="text-destructive hover:text-destructive w-full"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </>
  );
}
