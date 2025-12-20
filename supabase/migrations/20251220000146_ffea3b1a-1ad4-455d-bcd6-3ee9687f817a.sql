-- Add DELETE policy on conversations table
-- Only participants can delete their conversations
CREATE POLICY "Participants can delete their conversations"
ON public.conversations
FOR DELETE
USING ((auth.uid() = renter_id) OR (auth.uid() = landlord_id));

-- Add ON DELETE CASCADE to messages table for conversation_id foreign key
-- First drop the existing constraint and recreate with CASCADE
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE public.messages 
ADD CONSTRAINT messages_conversation_id_fkey 
FOREIGN KEY (conversation_id) 
REFERENCES public.conversations(id) 
ON DELETE CASCADE;

-- Add ON DELETE CASCADE to message_attachments for message_id foreign key
ALTER TABLE public.message_attachments DROP CONSTRAINT IF EXISTS message_attachments_message_id_fkey;
ALTER TABLE public.message_attachments 
ADD CONSTRAINT message_attachments_message_id_fkey 
FOREIGN KEY (message_id) 
REFERENCES public.messages(id) 
ON DELETE CASCADE;