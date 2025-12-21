-- Add columns for pinning and marking conversations as unread per user
ALTER TABLE public.conversations 
  ADD COLUMN IF NOT EXISTS is_pinned_by_renter BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_pinned_by_landlord BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_marked_unread_by_renter BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_marked_unread_by_landlord BOOLEAN DEFAULT FALSE;