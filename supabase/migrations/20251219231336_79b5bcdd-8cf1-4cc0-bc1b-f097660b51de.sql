-- Add read_at timestamp to messages if not exists
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;