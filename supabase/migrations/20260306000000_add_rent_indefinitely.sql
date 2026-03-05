-- Add rent_indefinitely column for listings where rent has no fixed end date
ALTER TABLE listings ADD COLUMN IF NOT EXISTS rent_indefinitely boolean DEFAULT false;
