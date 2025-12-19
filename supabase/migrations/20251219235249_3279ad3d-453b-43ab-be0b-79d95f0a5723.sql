-- Add edit/delete columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_edited boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS original_content text;

-- Create message_attachments table
CREATE TABLE public.message_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL DEFAULT 'other',
  file_size integer NOT NULL DEFAULT 0,
  mime_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on message_attachments
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view attachments in their conversations
CREATE POLICY "Users can view attachments in their conversations"
ON public.message_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE m.id = message_attachments.message_id
    AND (c.renter_id = auth.uid() OR c.landlord_id = auth.uid())
  )
);

-- RLS: Users can create attachments for their own messages
CREATE POLICY "Users can create attachments for their messages"
ON public.message_attachments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    WHERE m.id = message_attachments.message_id
    AND m.sender_id = auth.uid()
    AND (c.renter_id = auth.uid() OR c.landlord_id = auth.uid())
  )
);

-- Create GIN index for full-text search on messages
CREATE INDEX IF NOT EXISTS idx_messages_content_search 
ON public.messages USING gin(to_tsvector('english', content));

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('message-attachments', 'message-attachments', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can upload to their conversation folders
CREATE POLICY "Users can upload message attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments' 
  AND auth.uid() IS NOT NULL
);

-- Storage RLS: Anyone can view message attachments (public bucket)
CREATE POLICY "Anyone can view message attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'message-attachments');

-- Storage RLS: Users can delete their own attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'message-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add UPDATE policy for messages (edit functionality)
CREATE POLICY "Senders can edit their own messages"
ON public.messages
FOR UPDATE
USING (
  sender_id = auth.uid()
  AND is_deleted = false
  AND created_at > now() - interval '15 minutes'
)
WITH CHECK (
  sender_id = auth.uid()
);

-- Enable realtime for messages table updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_attachments;