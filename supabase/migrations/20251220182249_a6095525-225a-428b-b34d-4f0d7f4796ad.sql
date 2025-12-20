-- Allow anyone to view sold/rented listings (for market transparency)
CREATE POLICY "Sold and rented listings are viewable by everyone"
ON public.listings
FOR SELECT
USING (
  status IN ('sold', 'rented') 
  AND is_draft = false
);