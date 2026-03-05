import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/integrations/supabase/server';
import { Listing } from '@/types/listing';
import { ListingDetailClient } from './ListingDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerSupabaseClient();

  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, price, currency, city, address, images, property_type, bedrooms, bathrooms, area_sqm, listing_type')
    .eq('id', id)
    .single();

  if (!listing) {
    return { title: 'Listing not found - hemma' };
  }

  const priceFormatted = new Intl.NumberFormat('en', { style: 'currency', currency: listing.currency || 'EUR', maximumFractionDigits: 0 }).format(listing.price);
  const suffix = listing.listing_type === 'rent' ? '/mo' : '';
  const title = `${listing.title} - ${priceFormatted}${suffix}`;
  const description = [
    listing.property_type,
    listing.bedrooms ? `${listing.bedrooms} bed` : null,
    listing.bathrooms ? `${listing.bathrooms} bath` : null,
    listing.area_sqm ? `${listing.area_sqm} m²` : null,
    listing.city,
  ].filter(Boolean).join(' · ');

  const image = listing.images?.[0] || undefined;

  return {
    title: `${title} | hemma`,
    description: listing.description || description,
    openGraph: {
      title,
      description: listing.description || description,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: listing.description || description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  return <ListingDetailClient listing={data as Listing | null} id={id} />;
}
