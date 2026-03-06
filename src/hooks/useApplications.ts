import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Application, ApplicationStatus, RenterSnapshot } from '@/types/application';

// Fetch renter's own applications
export function useMyApplications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async (): Promise<Application[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          listing:listings(id, title, images, address, city, price, currency)
        `)
        .eq('renter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Application[];
    },
    enabled: !!user,
  });
}

// Fetch landlord's received applications (optionally filtered by listing)
export function useLandlordApplications(listingId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['landlord-applications', user?.id, listingId],
    queryFn: async (): Promise<Application[]> => {
      if (!user) return [];

      let query = supabase
        .from('applications')
        .select(`
          *,
          listing:listings(id, title, images, address, city, price, currency),
          renter:profiles!applications_renter_id_fkey(full_name, avatar_url)
        `)
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (listingId) {
        query = query.eq('listing_id', listingId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as Application[];
    },
    enabled: !!user,
  });
}

// Check if user already applied to a listing
export function useHasApplied(listingId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['has-applied', user?.id, listingId],
    queryFn: async () => {
      if (!user) return false;
      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('listing_id', listingId)
        .eq('renter_id', user.id);
      return (count || 0) > 0;
    },
    enabled: !!user,
  });
}

// Count pending applications for landlord (for badge)
export function useApplicationCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['application-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('landlord_id', user.id)
        .in('status', ['applied', 'viewing_scheduled', 'under_review']);
      return count || 0;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });
}

// Create application
export function useCreateApplication() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      landlordId,
      coverLetter,
      renterSnapshot,
    }: {
      listingId: string;
      landlordId: string;
      coverLetter?: string;
      renterSnapshot: RenterSnapshot;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('applications')
        .insert({
          listing_id: listingId,
          renter_id: user.id,
          landlord_id: landlordId,
          cover_letter: coverLetter || null,
          renter_snapshot: renterSnapshot as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['has-applied'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-count'] });
    },
  });
}

// Update application status (landlord)
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
      viewingDate,
    }: {
      applicationId: string;
      status: ApplicationStatus;
      viewingDate?: string;
    }) => {
      const update: any = { status };
      if (viewingDate !== undefined) update.viewing_date = viewingDate;

      const { error } = await supabase
        .from('applications')
        .update(update)
        .eq('id', applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-applications'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-count'] });
    },
  });
}

// Update landlord notes
export function useUpdateApplicationNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      notes,
    }: {
      applicationId: string;
      notes: string;
    }) => {
      const { error } = await supabase
        .from('applications')
        .update({ landlord_notes: notes })
        .eq('id', applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-applications'] });
    },
  });
}

// Withdraw application (renter)
export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['has-applied'] });
      queryClient.invalidateQueries({ queryKey: ['application-count'] });
    },
  });
}
