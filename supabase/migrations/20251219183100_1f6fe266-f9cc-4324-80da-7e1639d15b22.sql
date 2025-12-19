-- Drop the foreign key constraint on user_id to allow demo listings
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_user_id_fkey;

-- Make user_id nullable for demo listings
ALTER TABLE public.listings ALTER COLUMN user_id DROP NOT NULL;

-- Insert demo listings
INSERT INTO public.listings (user_id, title, description, listing_type, property_type, price, currency, address, city, postal_code, country, latitude, longitude, bedrooms, bathrooms, area_sqm, available_from, is_furnished, allows_pets, images, is_active)
VALUES
-- Apartments for rent
(NULL, 'Modern Studio in City Center', 'Bright and modern studio apartment in the heart of Ljubljana. Walking distance to Triple Bridge and Prešeren Square. Recently renovated with high-end finishes.', 'rent', 'studio', 650, 'EUR', 'Čopova ulica 14', 'Ljubljana', '1000', 'Slovenia', 46.0515, 14.5060, 1, 1, 32, '2025-02-01', true, false, ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], true),

(NULL, 'Cozy 2-Bedroom near Tivoli Park', 'Charming apartment overlooking Tivoli Park. Perfect for nature lovers who want city convenience. Features balcony with park views.', 'rent', 'apartment', 950, 'EUR', 'Tivolska cesta 50', 'Ljubljana', '1000', 'Slovenia', 46.0569, 14.4973, 2, 1, 58, '2025-01-15', true, true, ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'], true),

(NULL, 'Spacious Family Apartment Bežigrad', 'Large 3-bedroom apartment in quiet residential area. Close to schools and shopping centers. Underground parking included.', 'rent', 'apartment', 1200, 'EUR', 'Dunajska cesta 156', 'Ljubljana', '1000', 'Slovenia', 46.0753, 14.5127, 3, 2, 95, '2025-03-01', false, true, ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'], true),

(NULL, 'Luxury Penthouse Old Town', 'Exclusive penthouse with stunning views of Ljubljana Castle. Premium finishes, smart home system, and private terrace.', 'rent', 'apartment', 2500, 'EUR', 'Mestni trg 8', 'Ljubljana', '1000', 'Slovenia', 46.0498, 14.5058, 3, 2, 145, '2025-02-15', true, false, ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'], true),

(NULL, 'Student Room Rožna Dolina', 'Affordable furnished room perfect for students. Shared kitchen and bathroom. 10 min walk to University.', 'rent', 'room', 350, 'EUR', 'Cesta v Mestni log 47', 'Ljubljana', '1000', 'Slovenia', 46.0441, 14.4847, 1, 1, 18, '2025-01-20', true, false, ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'], true),

(NULL, 'Riverside Apartment Trnovo', 'Beautiful apartment along Ljubljanica river. Enjoy morning coffee with river views. Quiet neighborhood with local cafes.', 'rent', 'apartment', 850, 'EUR', 'Eipprova ulica 7', 'Ljubljana', '1000', 'Slovenia', 46.0421, 14.5019, 2, 1, 62, '2025-02-01', true, true, ARRAY['https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800'], true),

(NULL, 'Modern Loft Metelkova', 'Artistic loft in the vibrant Metelkova district. High ceilings, industrial design, open floor plan.', 'rent', 'studio', 780, 'EUR', 'Metelkova ulica 22', 'Ljubljana', '1000', 'Slovenia', 46.0567, 14.5172, 1, 1, 55, '2025-01-25', true, true, ARRAY['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'], true),

(NULL, 'Family House with Garden Šiška', 'Detached house with beautiful garden. 4 bedrooms, modern kitchen, garage for 2 cars. Perfect for families.', 'rent', 'house', 1800, 'EUR', 'Vodnikova cesta 89', 'Ljubljana', '1000', 'Slovenia', 46.0672, 14.4789, 4, 2, 180, '2025-03-15', false, true, ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'], true),

(NULL, 'Investment Apartment Center', 'Prime location apartment perfect for investment or personal use. High rental potential. Building recently renovated.', 'sale', 'apartment', 285000, 'EUR', 'Slovenska cesta 35', 'Ljubljana', '1000', 'Slovenia', 46.0553, 14.5064, 2, 1, 54, NULL, false, false, ARRAY['https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800'], true),

(NULL, 'New Build Apartment BTC', 'Brand new apartment in modern complex. Energy efficient, underground parking, storage room included.', 'sale', 'apartment', 320000, 'EUR', 'Šmartinska cesta 152', 'Ljubljana', '1000', 'Slovenia', 46.0621, 14.5432, 3, 2, 78, NULL, false, true, ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'], true),

(NULL, 'Charming Apartment Krakovo', 'Historic apartment in the Krakovo district. Original wood floors, high ceilings, cellar storage.', 'sale', 'apartment', 245000, 'EUR', 'Krakovska ulica 12', 'Ljubljana', '1000', 'Slovenia', 46.0452, 14.5021, 2, 1, 65, NULL, true, false, ARRAY['https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800'], true),

(NULL, 'Penthouse Vič', 'Top floor apartment with panoramic city views. Large terrace, 2 parking spots, premium location.', 'sale', 'apartment', 450000, 'EUR', 'Tržaška cesta 25', 'Ljubljana', '1000', 'Slovenia', 46.0478, 14.4912, 4, 2, 120, NULL, true, true, ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'], true),

(NULL, 'Modern Villa Rožnik', 'Stunning contemporary villa near Rožnik hill. Architect designed, pool, smart home, triple garage.', 'sale', 'villa', 890000, 'EUR', 'Cesta na Rožnik 15', 'Ljubljana', '1000', 'Slovenia', 46.0512, 14.4823, 5, 3, 280, NULL, true, true, ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], true),

(NULL, 'Traditional House Šentvid', 'Classic Slovenian house with modern updates. Large plot, fruit trees, separate guest house.', 'sale', 'house', 520000, 'EUR', 'Prušnikova ulica 45', 'Ljubljana', '1000', 'Slovenia', 46.0834, 14.4678, 4, 2, 195, NULL, false, true, ARRAY['https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800'], true),

(NULL, 'Townhouse Moste', 'Well-maintained townhouse in established neighborhood. Private garden, renovated interior, parking.', 'sale', 'house', 385000, 'EUR', 'Preglov trg 8', 'Ljubljana', '1000', 'Slovenia', 46.0523, 14.5378, 3, 2, 145, NULL, false, true, ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'], true),

(NULL, 'Budget Studio Fužine', 'Affordable studio in Fužine. Good public transport connections. Ideal for young professionals.', 'rent', 'studio', 480, 'EUR', 'Preglov trg 21', 'Ljubljana', '1000', 'Slovenia', 46.0489, 14.5412, 1, 1, 28, '2025-01-10', true, false, ARRAY['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'], true),

(NULL, 'Executive Apartment Brdo', 'High-end apartment in diplomatic district. Security, parking, premium finishes throughout.', 'rent', 'apartment', 1600, 'EUR', 'Brdo pri Kranju 1', 'Ljubljana', '1000', 'Slovenia', 46.0389, 14.4734, 3, 2, 110, '2025-02-28', true, false, ARRAY['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'], true);

-- Update the RLS policy to also show listings with NULL user_id (demo listings)
DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.listings;
CREATE POLICY "Active listings are viewable by everyone"
ON public.listings FOR SELECT
USING (is_active = true);