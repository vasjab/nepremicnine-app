'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateApplicationStatus, useUpdateApplicationNotes } from '@/hooks/useApplications';
import { APPLICATION_STATUS_CONFIG, APPLICATION_STATUSES } from '@/types/application';
import type { Application, ApplicationStatus } from '@/types/application';
import { cn } from '@/lib/utils';
import {
  Loader2, FileText, Briefcase, Users, PawPrint, Cigarette, Clock, Mail, Phone, User,
  CalendarDays, StickyNote, ChevronDown,
} from 'lucide-react';

interface Props {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationDetailModal({ application, isOpen, onClose }: Props) {
  const updateStatus = useUpdateApplicationStatus();
  const updateNotes = useUpdateApplicationNotes();
  const [notes, setNotes] = useState('');
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [viewingDate, setViewingDate] = useState('');

  // Sync notes from application when opened
  if (application && !notesLoaded) {
    setNotes(application.landlord_notes || '');
    setViewingDate(application.viewing_date ? new Date(application.viewing_date).toISOString().slice(0, 16) : '');
    setNotesLoaded(true);
  }

  const handleClose = () => {
    setNotesLoaded(false);
    onClose();
  };

  if (!application) return null;

  const snap = application.renter_snapshot;

  const handleStatusChange = async (status: ApplicationStatus) => {
    await updateStatus.mutateAsync({
      applicationId: application.id,
      status,
      viewingDate: status === 'viewing_scheduled' && viewingDate ? viewingDate : undefined,
    });
  };

  const handleSaveNotes = async () => {
    await updateNotes.mutateAsync({ applicationId: application.id, notes });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Listing info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            {application.listing?.images?.[0] && (
              <img src={application.listing.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{application.listing?.title || 'Listing'}</p>
              <p className="text-xs text-muted-foreground">{application.listing?.city} &middot; {application.listing?.price} {application.listing?.currency}/mo</p>
            </div>
          </div>

          {/* Renter info */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Applicant Profile</p>
            <div className="rounded-xl border border-gray-100 p-3 space-y-2">
              <div className="flex items-center gap-3">
                {application.renter?.avatar_url ? (
                  <img src={application.renter.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{snap?.full_name || application.renter?.full_name || 'Unknown'}</p>
                  {snap?.email && <p className="text-xs text-muted-foreground">{snap.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                {snap?.phone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-3 w-3" /> {snap.phone}
                  </div>
                )}
                {snap?.employment_status && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    <span className="capitalize">{snap.employment_status.replace('_', '-')}</span>
                  </div>
                )}
                {snap?.monthly_income_range && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="text-[10px]">EUR</span> {snap.monthly_income_range}/mo
                  </div>
                )}
                {snap?.household_size && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3 w-3" /> {snap.household_size} {snap.household_size === 1 ? 'person' : 'people'}
                  </div>
                )}
                {snap?.move_in_timeline && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="capitalize">{snap.move_in_timeline.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {snap?.has_pets && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <PawPrint className="h-3 w-3" /> Has pets
                  </div>
                )}
                {snap?.is_smoker && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Cigarette className="h-3 w-3" /> Smoker
                  </div>
                )}
              </div>

              {snap?.bio && (
                <p className="text-xs text-muted-foreground pt-1 border-t border-gray-50">{snap.bio}</p>
              )}
            </div>
          </div>

          {/* Cover letter */}
          {application.cover_letter && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Cover Letter</p>
              <p className="text-sm text-foreground bg-gray-50 rounded-xl p-3 border border-gray-100 whitespace-pre-wrap">
                {application.cover_letter}
              </p>
            </div>
          )}

          {/* Status control */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Status</p>
            <div className="flex items-center gap-2">
              <Select
                value={application.status}
                onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}
                disabled={updateStatus.isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => {
                    const cfg = APPLICATION_STATUS_CONFIG[s];
                    return (
                      <SelectItem key={s} value={s}>
                        <span className={cn('inline-flex items-center gap-1.5')}>
                          <span className={cn('w-2 h-2 rounded-full', cfg.bgColor)} />
                          {cfg.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {updateStatus.isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </div>

          {/* Viewing date (show if viewing_scheduled) */}
          {application.status === 'viewing_scheduled' && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Viewing Date</p>
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={viewingDate}
                  onChange={(e) => setViewingDate(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('viewing_scheduled')}
                  disabled={!viewingDate || updateStatus.isPending}
                >
                  {updateStatus.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CalendarDays className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          )}

          {/* Landlord notes */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Private Notes</p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes about this applicant..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveNotes}
                disabled={updateNotes.isPending || notes === (application.landlord_notes || '')}
              >
                {updateNotes.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <StickyNote className="h-3 w-3 mr-1" />}
                Save Notes
              </Button>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-2 border-t border-gray-100">
            <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
            <span>Updated: {new Date(application.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
