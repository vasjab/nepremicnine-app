-- Add status column to track if listing is active, sold, or rented
ALTER TABLE public.listings ADD COLUMN status TEXT DEFAULT 'active';

-- Add final_price column to store the actual sale/rent price
ALTER TABLE public.listings ADD COLUMN final_price NUMERIC;

-- Add completed_at column to store when the listing was marked as sold/rented
ALTER TABLE public.listings ADD COLUMN completed_at TIMESTAMPTZ;

-- Create index for efficient filtering by status
CREATE INDEX idx_listings_status ON public.listings(status);

-- Add comment for documentation
COMMENT ON COLUMN public.listings.status IS 'Status of the listing: active, sold, or rented';
COMMENT ON COLUMN public.listings.final_price IS 'The actual price the property sold or rented for';
COMMENT ON COLUMN public.listings.completed_at IS 'Timestamp when the listing was marked as sold or rented';