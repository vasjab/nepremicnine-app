-- Add missing indexes for better query performance

-- Index on user_id for "My Listings" and landlord profile queries
CREATE INDEX idx_listings_user_id ON public.listings USING btree (user_id);

-- Index on created_at for sorting by newest/oldest
CREATE INDEX idx_listings_created_at ON public.listings USING btree (created_at DESC);

-- Index on is_draft for filtering draft listings
CREATE INDEX idx_listings_is_draft ON public.listings USING btree (is_draft) WHERE (is_draft = true);

-- Composite index for common filter combination: user's active non-draft listings
CREATE INDEX idx_listings_user_active ON public.listings USING btree (user_id, is_active, is_draft) WHERE (is_draft = false);

-- Index on message_attachments for faster attachment lookups
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments USING btree (message_id);

-- Index on messages for unread queries
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages USING btree (conversation_id, is_read, is_deleted) WHERE (is_read = false AND is_deleted = false);