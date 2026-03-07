import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { LocalSupabaseEnv, playwrightCacheDir } from './local-supabase';

export interface SeedUser {
  id: string;
  email: string;
  fullName: string;
}

export interface SeedListing {
  id: string;
  title: string;
  address: string;
  price: number;
  listingType: 'rent' | 'sale';
  propertyType: 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'summer_house' | 'other';
  city: string;
}

export interface E2ESeedData {
  listings: {
    rentalParking: SeedListing;
    rentalCompact: SeedListing;
    salePrimary: SeedListing;
  };
}

export const seedDataPath = path.join(playwrightCacheDir, 'e2e-seed.json');

const HERO_IMAGE = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop';
const HOUSE_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop';
const STUDIO_IMAGE = 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&h=800&fit=crop';

function isoDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

function createAdminClient(env: LocalSupabaseEnv) {
  return createClient(env.apiUrl, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function clearPublicData(client: ReturnType<typeof createAdminClient>) {
  await client.from('email_verification_challenges').delete().not('id', 'is', null);
  await client.from('applications').delete().not('id', 'is', null);
  await client.from('message_attachments').delete().not('id', 'is', null);
  await client.from('message_reactions').delete().not('id', 'is', null);
  await client.from('messages').delete().not('id', 'is', null);
  await client.from('conversations').delete().not('id', 'is', null);
  await client.from('listing_stats').delete().not('listing_id', 'is', null);
  await client.from('recently_viewed_listings').delete().not('id', 'is', null);
  await client.from('saved_listings').delete().not('id', 'is', null);
  await client.from('listings').delete().not('id', 'is', null);
  await client.from('profiles').delete().not('user_id', 'is', null);
  await client.from('rate_limits').delete().not('id', 'is', null);
}

export async function seedLocalSupabase(env: LocalSupabaseEnv): Promise<E2ESeedData> {
  const client = createAdminClient(env);
  await clearPublicData(client);

  const listings = [
    {
      user_id: null,
      title: 'E2E Rental With Parking',
      description: 'Bright apartment close to the water with parking and elevator.',
      listing_type: 'rent',
      property_type: 'apartment',
      price: 1500,
      currency: 'EUR',
      country: 'Sweden',
      address: 'E2E Strandvagen 10',
      city: 'Stockholm',
      postal_code: '114 56',
      latitude: 59.334591,
      longitude: 18.07888,
      bedrooms: 2,
      bathrooms: 1,
      area_sqm: 62,
      is_furnished: true,
      allows_pets: true,
      has_parking: true,
      has_elevator: true,
      has_storage: true,
      images: [HERO_IMAGE],
      is_active: true,
      is_draft: false,
      status: 'active',
      created_at: isoDaysAgo(3),
      updated_at: isoDaysAgo(1),
      available_from: isoDaysAgo(-7).slice(0, 10),
    },
    {
      user_id: null,
      title: 'E2E Compact Rental Studio',
      description: 'Compact studio for map and filter coverage.',
      listing_type: 'rent',
      property_type: 'studio',
      price: 980,
      currency: 'EUR',
      country: 'Sweden',
      address: 'E2E Odengatan 22',
      city: 'Stockholm',
      postal_code: '113 51',
      latitude: 59.34572,
      longitude: 18.04985,
      bedrooms: 1,
      bathrooms: 1,
      area_sqm: 31,
      is_furnished: false,
      allows_pets: false,
      has_parking: false,
      has_elevator: false,
      images: [STUDIO_IMAGE],
      is_active: true,
      is_draft: false,
      status: 'active',
      created_at: isoDaysAgo(6),
      updated_at: isoDaysAgo(2),
      available_from: isoDaysAgo(-3).slice(0, 10),
    },
    {
      user_id: null,
      title: 'E2E Sale Family Home',
      description: 'Sale listing used for sold-state coverage.',
      listing_type: 'sale',
      property_type: 'house',
      price: 425000,
      currency: 'EUR',
      country: 'Sweden',
      address: 'E2E Vastra Gatan 4',
      city: 'Gothenburg',
      postal_code: '411 17',
      latitude: 57.70887,
      longitude: 11.97456,
      bedrooms: 4,
      bathrooms: 2,
      area_sqm: 145,
      is_furnished: false,
      allows_pets: true,
      has_garden: true,
      has_garage: true,
      images: [HOUSE_IMAGE],
      is_active: true,
      is_draft: false,
      status: 'active',
      created_at: isoDaysAgo(9),
      updated_at: isoDaysAgo(2),
    },
  ];

  const { data: createdListings, error: listingError } = await client
    .from('listings')
    .insert(listings)
    .select('id, title, price, listing_type, property_type, city');

  if (listingError || !createdListings || createdListings.length !== listings.length) {
    throw listingError ?? new Error('Failed to seed listings');
  }

  const statsRows = createdListings.map((listing, index) => ({
    listing_id: listing.id,
    view_count: (index + 1) * 7,
  }));
  await client.from('listing_stats').insert(statsRows);

  const seedData: E2ESeedData = {
    listings: {
      rentalParking: {
        id: createdListings[0].id,
        title: createdListings[0].title,
        address: listings[0].address,
        price: createdListings[0].price,
        listingType: createdListings[0].listing_type,
        propertyType: createdListings[0].property_type,
        city: createdListings[0].city,
      },
      rentalCompact: {
        id: createdListings[1].id,
        title: createdListings[1].title,
        address: listings[1].address,
        price: createdListings[1].price,
        listingType: createdListings[1].listing_type,
        propertyType: createdListings[1].property_type,
        city: createdListings[1].city,
      },
      salePrimary: {
        id: createdListings[2].id,
        title: createdListings[2].title,
        address: listings[2].address,
        price: createdListings[2].price,
        listingType: createdListings[2].listing_type,
        propertyType: createdListings[2].property_type,
        city: createdListings[2].city,
      },
    },
  };

  fs.mkdirSync(playwrightCacheDir, { recursive: true });
  fs.writeFileSync(seedDataPath, JSON.stringify(seedData, null, 2));

  return seedData;
}

export function readSeedData(): E2ESeedData {
  return JSON.parse(fs.readFileSync(seedDataPath, 'utf8')) as E2ESeedData;
}
