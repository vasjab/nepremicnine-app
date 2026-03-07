'use client';

import { Mail, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AvatarUpload } from './AvatarUpload';
import type { ProfileFormData } from './types';

interface BasicInfoSectionProps {
  email: string;
  userId: string;
  data: ProfileFormData;
  onUpdate: (patch: Partial<ProfileFormData>) => void;
}

export function BasicInfoSection({ email, userId, data, onUpdate }: BasicInfoSectionProps) {
  return (
    <>
      {/* Avatar with upload + crop */}
      <AvatarUpload
        avatarUrl={data.avatar_url}
        fullName={data.full_name}
        email={email}
        userId={userId}
        onAvatarChange={(url) => onUpdate({ avatar_url: url })}
      />

      {/* Personal Information */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <Mail className="h-3.5 w-3.5 text-gray-500" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Personal Information</span>
        </div>
        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              value={data.full_name}
              onChange={(e) => onUpdate({ full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+46 70 123 4567"
              value={data.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-black/[0.06] dark:border-white/[0.06] px-5 py-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <FileText className="h-3.5 w-3.5 text-gray-500" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">About</span>
        </div>
        <div className="p-5">
          <Textarea
            placeholder="Tell us a bit about yourself..."
            rows={3}
            value={data.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}
