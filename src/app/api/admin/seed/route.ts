import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

// Slovenian cities with real coordinates
const SLOVENIAN_LOCATIONS = [
  { city: 'Ljubljana', lat: 46.0569, lng: 14.5058, postal: '1000' },
  { city: 'Maribor', lat: 46.5547, lng: 15.6459, postal: '2000' },
  { city: 'Celje', lat: 46.2364, lng: 15.2681, postal: '3000' },
  { city: 'Kranj', lat: 46.2389, lng: 14.3556, postal: '4000' },
  { city: 'Koper', lat: 45.5481, lng: 13.7302, postal: '6000' },
  { city: 'Novo Mesto', lat: 45.8019, lng: 15.1711, postal: '8000' },
  { city: 'Velenje', lat: 46.3597, lng: 15.1114, postal: '3320' },
  { city: 'Nova Gorica', lat: 45.9558, lng: 13.6382, postal: '5000' },
  { city: 'Ptuj', lat: 46.4200, lng: 15.8697, postal: '2250' },
  { city: 'Murska Sobota', lat: 46.6628, lng: 16.1661, postal: '9000' },
  { city: 'Kamnik', lat: 46.2256, lng: 14.6122, postal: '1241' },
  { city: 'Jesenice', lat: 46.4364, lng: 14.0528, postal: '4270' },
  { city: 'Domzale', lat: 46.1375, lng: 14.5936, postal: '1230' },
  { city: 'Skofja Loka', lat: 46.1664, lng: 14.3064, postal: '4220' },
  { city: 'Postojna', lat: 45.7747, lng: 14.2150, postal: '6230' },
  { city: 'Bled', lat: 46.3683, lng: 14.1147, postal: '4260' },
  { city: 'Piran', lat: 45.5283, lng: 13.5681, postal: '6330' },
  { city: 'Izola', lat: 45.5386, lng: 13.6603, postal: '6310' },
  { city: 'Portoroz', lat: 45.5097, lng: 13.5922, postal: '6320' },
  { city: 'Kranjska Gora', lat: 46.4844, lng: 13.7856, postal: '4280' },
  { city: 'Bovec', lat: 46.3381, lng: 13.5519, postal: '5230' },
  { city: 'Rogaska Slatina', lat: 46.2378, lng: 15.6386, postal: '3250' },
  { city: 'Slovenj Gradec', lat: 46.5094, lng: 15.0811, postal: '2380' },
  { city: 'Ravne na Koroskem', lat: 46.5431, lng: 14.9517, postal: '2390' },
  { city: 'Litija', lat: 46.0586, lng: 14.8308, postal: '1270' },
  { city: 'Trebnje', lat: 45.9081, lng: 15.0094, postal: '8210' },
  { city: 'Ajdovscina', lat: 45.8878, lng: 13.9094, postal: '5270' },
  { city: 'Sezana', lat: 45.7089, lng: 13.8722, postal: '6210' },
  { city: 'Radovljica', lat: 46.3447, lng: 14.1744, postal: '4240' },
  { city: 'Medvode', lat: 46.1392, lng: 14.4133, postal: '1215' },
];

const STREET_NAMES = [
  'Presernova ulica', 'Cankarjeva cesta', 'Trubarjeva ulica', 'Slovenska cesta',
  'Mestni trg', 'Dunajska cesta', 'Titova cesta', 'Kidriceva ulica',
  'Levstikova ulica', 'Vosnjakova ulica', 'Kolodvorska ulica', 'Gosposvetska cesta',
  'Celovska cesta', 'Smartinska cesta', 'Rozna dolina', 'Trzaska cesta',
  'Vojkova cesta', 'Litostrojska cesta', 'Linhartova cesta', 'Aljazeva ulica',
  'Pod lipami', 'Na hribu', 'Ob potoku', 'Soncna pot',
  'Cesta na grad', 'Stara cesta', 'Nova ulica', 'Vinogradniska pot',
  'Sadna ulica', 'Brezova ulica', 'Hrastova ulica', 'Lipova ulica',
];

// Unsplash real estate photos (free to use, deterministic by ID)
const PROPERTY_IMAGES = {
  apartment: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
  ],
  house: [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&h=600&fit=crop',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
  ],
  studio: [
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1489171078254-c3365d6e359f?w=800&h=600&fit=crop',
  ],
  room: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598928506311-c55ez89a2cc8?w=800&h=600&fit=crop',
  ],
  summer_house: [
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&h=600&fit=crop',
  ],
};

// Interior / detail shots to mix in
const INTERIOR_IMAGES = [
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop', // living room
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop', // kitchen
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop', // bedroom
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop', // bathroom
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop', // dining
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop', // bathroom 2
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&h=600&fit=crop', // kitchen 2
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop', // living 2
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop', // garden
  'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop', // pool
];

const PROPERTY_TYPES = ['apartment', 'house', 'room', 'studio', 'villa', 'summer_house', 'other'] as const;
const HOUSE_TYPES = ['detached', 'semi_detached', 'terraced', 'end_terrace', 'bungalow'] as const;
const LISTING_TYPES = ['rent', 'sale'] as const;
const PROPERTY_CONDITIONS = ['new', 'renovated', 'good', 'needs_work'] as const;
const ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
const HEATING_DISTRIBUTIONS = ['central', 'individual', 'both'] as const;
const HEATING_TYPES = ['district', 'gas', 'electric', 'heat_pump_air_to_air', 'heat_pump_air_to_water', 'heat_pump_ground_source', 'wood_pellet', 'oil'] as const;
const PARKING_TYPES = ['street', 'designated', 'underground', 'private'] as const;
const AC_TYPES = ['central', 'unit'] as const;
const EV_POWERS = ['3.7', '7.4', '11', '22'] as const;
const ELEVATOR_CONDITIONS = ['old', 'modern', 'renovated'] as const;
const VIEW_TYPES = ['mountain', 'city', 'sea', 'park', 'garden'] as const;
const WATERFRONT_DISTANCES = [0, 50, 100, 200, 500, 1000, 2000] as const;
const INTERNET_OPTIONS = ['included', 'available', 'not_available'] as const;
const UTILITIES_OPTIONS = ['yes', 'no', 'partial'] as const;
const MIN_LEASE_OPTIONS = [1, 3, 6, 12, 24] as const;
const ORIENTATIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
const INDIVIDUAL_HEATER_TYPES = ['electric_radiator', 'wall_mounted_heater', 'air_to_air_heat_pump', 'portable_heater', 'wood_stove', 'pellet_stove', 'infrared_heater'] as const;

// Seeded random
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function maybe(probability: number, rand: () => number): boolean {
  return rand() < probability;
}

function randInt(min: number, max: number, rand: () => number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function jitter(base: number, range: number, rand: () => number): number {
  return base + (rand() - 0.5) * range;
}

// Slovenian-style descriptions
const SALE_DESCRIPTIONS = [
  'Beautiful property in a quiet residential area with excellent access to public transport and local amenities. Recently renovated with high-quality materials and modern finishes throughout.',
  'Bright and spacious property with an open floor plan, perfect for families. Located in a sought-after neighborhood with schools, parks, and shops within walking distance.',
  'Charming property in the heart of the city, offering a perfect blend of urban living and comfort. Large windows provide abundant natural light throughout the day.',
  'Exceptional property with panoramic views and premium finishes. The property features a modern kitchen, spacious living areas, and a private outdoor space.',
  'Newly constructed property with energy-efficient systems and contemporary design. Smart home features include automated lighting, heating control, and security system.',
  'Elegant property set in a historic building that has been thoughtfully restored. Original architectural details complement modern amenities for comfortable living.',
  'Stunning property with high ceilings and hardwood floors throughout. The open kitchen connects seamlessly to the dining and living areas, ideal for entertaining.',
  'Well-maintained property in a family-friendly neighborhood. Features include a modern kitchen, built-in storage, and a private terrace with garden views.',
  'Unique property offering a rare combination of space, location, and character. The property has been lovingly maintained and is ready to move into.',
  'Investment opportunity in a prime location with strong rental potential. The property has been recently refurbished and is being sold with all furnishings included.',
  'Luxurious property with designer interiors and top-of-the-line appliances. Floor-to-ceiling windows frame spectacular views of the surrounding landscape.',
  'Modern property with a minimalist aesthetic, featuring clean lines and natural materials. The building includes shared amenities such as a gym and rooftop terrace.',
  'Cozy property perfect for first-time buyers or as a city pied-a-terre. Compact but efficiently designed with clever storage solutions throughout.',
  'Impressive property with a double-height living room and mezzanine level. The industrial-chic design includes exposed brick walls and polished concrete floors.',
  'Peaceful property surrounded by nature yet only minutes from the city center. A large garden provides the perfect setting for outdoor dining and relaxation.',
  'Architecturally significant property designed by a renowned local architect. Sustainable building practices and materials ensure minimal environmental impact.',
  'Perfectly positioned property with easy access to the motorway and Ljubljana International Airport. Ideal for professionals who travel frequently.',
  'Renovated property featuring a blend of traditional Slovenian craftsmanship and contemporary comfort. Underfloor heating and triple-glazed windows ensure year-round comfort.',
  'Spacious property with separate living and sleeping zones, providing excellent privacy. The master suite includes a walk-in wardrobe and en-suite bathroom.',
  'Attractive property with a south-facing orientation, maximizing sunlight throughout the year. Energy rating A confirms exceptional thermal performance.',
];

const RENT_DESCRIPTIONS = [
  'Fully furnished apartment available for long-term rental. All utilities included in the rent. Internet connection (fiber) already set up and ready to use.',
  'Bright and modern rental in an excellent location, just steps from public transport. The property comes equipped with all necessary appliances and furniture.',
  'Comfortable rental property ideal for students or young professionals. Shared laundry facilities in the building. Pets welcome with prior approval.',
  'Premium rental property with high-end furnishings and appliances. Secure building with concierge service and underground parking included.',
  'Affordable rental in a well-maintained building. Basic furnishing provided, tenant welcome to add their own touches. Available for immediate move-in.',
  'Charming rental with character in a vibrant neighborhood. Walking distance to cafes, restaurants, and cultural attractions. Flexible lease terms available.',
  'Spacious rental perfect for a small family. Includes a dedicated parking spot and storage unit in the basement. Child-friendly building with playground.',
  'Quiet rental in a residential area, ideal for remote workers. Fast internet connection included. The property features a dedicated home office space.',
  'Newly refurbished rental with brand-new kitchen and bathroom. Energy-efficient heating system keeps utility costs low. No deposit required for longer leases.',
  'Modern rental in a new development with shared rooftop terrace and BBQ area. Short-term and long-term leases considered. Viewing highly recommended.',
  'Cozy rental with mountain views from the balcony. Partially furnished - bed, wardrobe, and kitchen appliances included. Tenant pays for electricity and internet.',
  'Centrally located rental with excellent public transport connections. Walking distance to the university and main shopping district. Available from next month.',
  'Luxurious rental in a historic building with modern amenities. High ceilings, original parquet floors, and a marble bathroom. Unfurnished, allowing personal customization.',
  'Budget-friendly rental perfect for a single occupant. Compact but well-designed space with everything you need. All bills included in the monthly rent.',
  'Garden-level rental with private outdoor space. Direct access to a small private garden, ideal for gardening enthusiasts. Pets allowed. Quiet neighborhood.',
];

const FURNISHED_DETAILS_OPTIONS = [
  'Fully equipped kitchen with dishwasher, oven, and microwave. Living room with sofa, TV, and coffee table. Bedroom with queen bed and wardrobe.',
  'All rooms furnished with modern Scandinavian-style furniture. Kitchen includes all appliances. High-speed wifi router included.',
  'Basic furnishing: beds, wardrobes, dining table and chairs, sofa. Kitchen equipped with stove, fridge, and washing machine.',
  'Premium furnishing throughout. Designer kitchen with island, integrated appliances. Bathroom with rain shower and heated towel rails.',
  'Partially furnished - kitchen equipped, bedrooms have beds and storage. Living room unfurnished, allowing tenant flexibility.',
  'Turn-key ready. Everything included down to cutlery and bed linens. Just bring your suitcase.',
];

const PETS_DETAILS_OPTIONS = [
  'Small dogs and cats welcome. No aggressive breeds.',
  'All pets welcome, including dogs up to 25kg.',
  'Cats and small pets only. No dogs.',
  'Pets allowed with refundable pet deposit of 200 EUR.',
  'One pet allowed with landlord approval.',
];

function generateListings(count: number) {
  const rand = seededRandom(42);
  const listings: any[] = [];

  for (let i = 0; i < count; i++) {
    const listingType = i < 60 ? pick(LISTING_TYPES, rand) : (i < 80 ? 'sale' : 'rent');
    const propertyType = PROPERTY_TYPES[i % PROPERTY_TYPES.length] === 'other'
      ? (i < 90 ? pick(PROPERTY_TYPES.filter(t => t !== 'other'), rand) : 'other')
      : PROPERTY_TYPES[i % PROPERTY_TYPES.length];

    const isHouse = propertyType === 'house' || propertyType === 'summer_house';
    const isApartment = propertyType === 'apartment';
    const isRoom = propertyType === 'room';
    const isStudio = propertyType === 'studio';
    const isVilla = propertyType === 'villa';
    const isSale = listingType === 'sale';

    const location = pick(SLOVENIAN_LOCATIONS, rand);
    const street = pick(STREET_NAMES, rand);
    const streetNum = randInt(1, 120, rand);
    const address = `${street} ${streetNum}`;

    // Pricing
    let price: number;
    if (isSale) {
      if (isRoom) price = randInt(30000, 80000, rand);
      else if (isStudio) price = randInt(60000, 160000, rand);
      else if (isApartment) price = randInt(80000, 450000, rand);
      else if (isHouse) price = randInt(120000, 800000, rand);
      else if (isVilla) price = randInt(350000, 1800000, rand);
      else price = randInt(50000, 300000, rand);
    } else {
      if (isRoom) price = randInt(200, 500, rand);
      else if (isStudio) price = randInt(350, 700, rand);
      else if (isApartment) price = randInt(400, 1800, rand);
      else if (isHouse) price = randInt(600, 2500, rand);
      else if (isVilla) price = randInt(1500, 5000, rand);
      else price = randInt(300, 1500, rand);
    }
    price = Math.round(price / (isSale ? 1000 : 10)) * (isSale ? 1000 : 10);

    // Area
    let areaSqm: number;
    if (isRoom) areaSqm = randInt(12, 30, rand);
    else if (isStudio) areaSqm = randInt(25, 50, rand);
    else if (isApartment) areaSqm = randInt(35, 180, rand);
    else if (isHouse) areaSqm = randInt(80, 350, rand);
    else if (isVilla) areaSqm = randInt(150, 500, rand);
    else areaSqm = randInt(30, 200, rand);

    // Rooms
    let bedrooms: number, bathrooms: number, livingRooms: number;
    if (isRoom) { bedrooms = 1; bathrooms = 1; livingRooms = 0; }
    else if (isStudio) { bedrooms = 0; bathrooms = 1; livingRooms = 1; }
    else if (isApartment) {
      bedrooms = randInt(1, 4, rand);
      bathrooms = randInt(1, Math.min(3, bedrooms + 1), rand);
      livingRooms = randInt(1, 2, rand);
    } else if (isVilla) {
      bedrooms = randInt(3, 7, rand);
      bathrooms = randInt(2, 5, rand);
      livingRooms = randInt(1, 3, rand);
    } else {
      bedrooms = randInt(2, 5, rand);
      bathrooms = randInt(1, 3, rand);
      livingRooms = randInt(1, 2, rand);
    }

    // Title generation
    const sizeAdj = areaSqm > 120 ? 'Spacious' : areaSqm > 80 ? 'Comfortable' : areaSqm > 50 ? 'Cozy' : 'Charming';
    const condAdj = pick(['Modern', 'Bright', 'Beautiful', 'Renovated', 'Elegant', 'Lovely', 'Well-maintained', 'Stunning'], rand);
    const typeLabel = propertyType === 'apartment' ? `${bedrooms}-bedroom apartment`
      : propertyType === 'house' ? `${bedrooms}-bedroom house`
      : propertyType === 'villa' ? 'luxury villa'
      : propertyType === 'studio' ? 'studio apartment'
      : propertyType === 'room' ? 'room'
      : propertyType === 'summer_house' ? 'summer house'
      : `${bedrooms}-bedroom property`;
    const locLabel = pick([`in ${location.city}`, `near ${location.city} center`, `in the heart of ${location.city}`, `- ${location.city}`], rand);
    const title = `${pick([sizeAdj, condAdj], rand)} ${typeLabel} ${locLabel}`;

    // Description
    const descriptions = isSale ? SALE_DESCRIPTIONS : RENT_DESCRIPTIONS;
    const description = pick(descriptions, rand);

    // Images
    const imgKey = (propertyType === 'other' ? 'apartment' : propertyType) as keyof typeof PROPERTY_IMAGES;
    const mainImages = PROPERTY_IMAGES[imgKey] || PROPERTY_IMAGES.apartment;
    const numImages = randInt(3, 8, rand);
    const selectedMain = pickN(mainImages, Math.min(3, numImages), rand);
    const selectedInterior = pickN(INTERIOR_IMAGES, numImages - selectedMain.length, rand);
    const images = [...selectedMain, ...selectedInterior];

    // House type
    const houseType = isHouse ? pick(HOUSE_TYPES, rand) : null;

    // Furnished
    const isFurnished = maybe(isSale ? 0.3 : 0.7, rand);
    const furnishedDetails = isFurnished ? pick(FURNISHED_DETAILS_OPTIONS, rand) : null;

    // Building info
    const yearBuilt = randInt(1920, 2025, rand);
    const propertyCondition = pick(PROPERTY_CONDITIONS, rand);
    const energyRating = pick(ENERGY_RATINGS, rand);
    const heatingDist = pick(HEATING_DISTRIBUTIONS, rand);
    const heatingType = pick(HEATING_TYPES, rand);

    // Floors
    const floorNumber = isApartment ? randInt(0, 12, rand) : null;
    const totalFloorsBuilding = isApartment ? Math.max((floorNumber || 0) + 1, randInt(3, 15, rand)) : null;
    const propertyFloors = isHouse || isVilla ? randInt(1, 3, rand) : null;

    // Features (vary by listing index to ensure coverage)
    const hasBalcony = maybe(isApartment ? 0.6 : 0.3, rand);
    const hasTermace = maybe(isHouse || isVilla ? 0.7 : 0.2, rand);
    const hasRooftopTerrace = maybe(0.1, rand);
    const hasGarden = maybe(isHouse || isVilla ? 0.8 : 0.05, rand);
    const hasBbqArea = hasGarden && maybe(0.5, rand);
    const hasPlayground = maybe(0.15, rand);
    const hasWaterfront = maybe(0.08, rand);
    const hasView = maybe(0.4, rand);
    const hasParking = maybe(0.6, rand);
    const hasGarage = maybe(isHouse || isVilla ? 0.6 : 0.2, rand);
    const hasCarport = maybe(isHouse ? 0.2 : 0.02, rand);
    const hasEvCharging = hasParking && maybe(0.2, rand);
    const hasBicycleStorage = maybe(0.3, rand);
    const hasStrollerStorage = maybe(0.15, rand);
    const hasStorage = maybe(0.5, rand);
    const hasElevator = isApartment && maybe(0.6, rand);
    const hasSharedLaundry = maybe(0.2, rand);
    const hasGym = maybe(0.15, rand);
    const hasSauna = maybe(isVilla ? 0.5 : 0.1, rand);
    const hasPool = maybe(isVilla ? 0.4 : 0.05, rand);
    const hasCommonRoom = maybe(0.1, rand);
    const hasConcierge = maybe(0.05, rand);
    const hasSecurity = maybe(0.2, rand);
    const hasAlarmSystem = hasSecurity && maybe(0.6, rand);
    const hasCctv = hasSecurity && maybe(0.5, rand);
    const hasFireplace = maybe(isHouse || isVilla ? 0.5 : 0.1, rand);
    const hasFloorHeating = maybe(0.35, rand);
    const hasFloorCooling = hasFloorHeating && maybe(0.3, rand);
    const hasAirConditioning = maybe(0.3, rand);
    const hasVentilation = maybe(0.4, rand);
    const hasHeatRecoveryVentilation = hasVentilation && maybe(0.3, rand);
    const hasSolarPanels = maybe(isHouse || isVilla ? 0.2 : 0.05, rand);
    const hasHomeBattery = hasSolarPanels && maybe(0.3, rand);
    const hasDishwasher = isFurnished && maybe(0.7, rand);
    const hasWashingMachine = isFurnished && maybe(0.8, rand);
    const hasDryer = hasWashingMachine && maybe(0.3, rand);
    const hasHighCeilings = maybe(0.2, rand);
    const hasLargeWindows = maybe(0.3, rand);
    const hasSmartHome = maybe(0.1, rand);
    const hasBuiltInWardrobes = maybe(0.3, rand);
    const hasWindowShades = maybe(0.4, rand);
    const hasElectricShades = hasWindowShades && maybe(0.2, rand);
    const hasStepFreeAccess = maybe(0.2, rand);
    const hasWheelchairAccessible = hasStepFreeAccess && maybe(0.5, rand);
    const hasWideDoorways = hasStepFreeAccess && maybe(0.4, rand);
    const hasGroundFloorAccess = maybe(0.15, rand);
    const hasElevatorFromGarage = hasGarage && hasElevator && maybe(0.3, rand);
    const hasSecureEntrance = maybe(0.3, rand);
    const hasIntercom = maybe(0.5, rand);
    const hasGatedCommunity = maybe(0.05, rand);
    const hasFireSafety = maybe(0.3, rand);
    const hasSoundproofing = maybe(0.15, rand);

    // Rental-specific
    const allowsPets = !isSale && maybe(0.4, rand);
    const petsDetails = allowsPets ? pick(PETS_DETAILS_OPTIONS, rand) : null;
    const moveInImmediately = !isSale && maybe(0.6, rand);
    const availableFrom = !isSale && !moveInImmediately ? `2026-${String(randInt(3, 12, rand)).padStart(2, '0')}-01` : null;
    const availableUntil = !isSale && maybe(0.3, rand) ? `2027-${String(randInt(1, 12, rand)).padStart(2, '0')}-01` : null;
    const depositAmount = !isSale ? Math.round(price * pick([1, 2, 3], rand)) : null;
    const minLeaseMonths = !isSale ? pick(MIN_LEASE_OPTIONS, rand) : null;
    const internetIncluded = !isSale ? pick(INTERNET_OPTIONS, rand) : null;
    const utilitiesIncluded = !isSale ? pick(UTILITIES_OPTIONS, rand) : null;
    const utilityCostEstimate = !isSale && utilitiesIncluded !== 'yes' ? randInt(50, 250, rand) : null;

    // Sale-specific expenses
    const monthlyExpenses = isSale ? randInt(50, 400, rand) : null;
    const expenseBreakdownEnabled = isSale && maybe(0.4, rand);

    // Status variation: most active, some sold/rented, some drafts
    let status = 'active';
    let isActive = true;
    let isDraft = false;
    let completedAt: string | null = new Date().toISOString();

    if (i >= 90 && i < 95) {
      // Some sold
      status = 'sold';
      isActive = false;
    } else if (i >= 95 && i < 98) {
      // Some rented
      status = 'rented';
      isActive = false;
    } else if (i >= 98) {
      // Some drafts
      isDraft = true;
      isActive = false;
      completedAt = null;
    } else if (maybe(0.1, rand)) {
      // Randomly inactive
      isActive = false;
    }

    // Spread created_at over last 6 months
    const daysAgo = randInt(0, 180, rand);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    const listing: any = {
      title,
      description,
      listing_type: listingType,
      property_type: propertyType,
      house_type: houseType,
      price,
      currency: 'EUR',
      country: 'Slovenia',
      address,
      city: location.city,
      postal_code: location.postal,
      latitude: jitter(location.lat, 0.02, rand),
      longitude: jitter(location.lng, 0.02, rand),
      bedrooms,
      bathrooms,
      living_rooms: livingRooms,
      area_sqm: areaSqm,
      images,
      is_furnished: isFurnished,
      furnished_details: furnishedDetails,
      year_built: yearBuilt,
      property_condition: propertyCondition,
      energy_rating: energyRating,
      heating_distribution: heatingDist,
      heating_type: heatingType,
      floor_number: floorNumber,
      total_floors_building: totalFloorsBuilding,
      property_floors: propertyFloors,
      orientation: pick(ORIENTATIONS, rand),
      // Outdoor
      has_balcony: hasBalcony,
      balcony_sqm: hasBalcony ? randInt(3, 20, rand) : null,
      has_terrace: hasTermace,
      terrace_sqm: hasTermace ? randInt(10, 60, rand) : null,
      has_rooftop_terrace: hasRooftopTerrace,
      has_garden: hasGarden,
      garden_sqm: hasGarden ? randInt(20, 2000, rand) : null,
      has_bbq_area: hasBbqArea,
      has_playground: hasPlayground,
      has_waterfront: hasWaterfront,
      waterfront_distance_m: hasWaterfront ? pick(WATERFRONT_DISTANCES, rand) : null,
      has_view: hasView,
      view_type: hasView ? pick(VIEW_TYPES, rand) : null,
      // Parking
      has_parking: hasParking,
      parking_type: hasParking ? pick(PARKING_TYPES, rand) : null,
      parking_spaces: hasParking ? randInt(1, 3, rand) : null,
      has_garage: hasGarage,
      has_carport: hasCarport,
      has_ev_charging: hasEvCharging,
      ev_charger_power: hasEvCharging ? pick(EV_POWERS, rand) : null,
      has_bicycle_storage: hasBicycleStorage,
      has_stroller_storage: hasStrollerStorage,
      has_storage: hasStorage,
      // Building amenities
      has_elevator: hasElevator,
      elevator_condition: hasElevator ? pick(ELEVATOR_CONDITIONS, rand) : null,
      has_shared_laundry: hasSharedLaundry,
      has_gym: hasGym,
      has_sauna: hasSauna,
      has_pool: hasPool,
      has_common_room: hasCommonRoom,
      has_concierge: hasConcierge,
      has_security: hasSecurity,
      has_alarm_system: hasAlarmSystem,
      has_cctv: hasCctv,
      // Climate & appliances
      has_fireplace: hasFireplace,
      has_floor_heating: hasFloorHeating,
      has_floor_cooling: hasFloorCooling,
      has_air_conditioning: hasAirConditioning,
      ac_type: hasAirConditioning ? pick(AC_TYPES, rand) : null,
      ac_unit_count: hasAirConditioning ? randInt(1, 4, rand) : null,
      has_ventilation: hasVentilation,
      has_heat_recovery_ventilation: hasHeatRecoveryVentilation,
      has_solar_panels: hasSolarPanels,
      has_home_battery: hasHomeBattery,
      has_dishwasher: hasDishwasher,
      has_washing_machine: hasWashingMachine,
      has_dryer: hasDryer,
      // Interior
      has_high_ceilings: hasHighCeilings,
      has_large_windows: hasLargeWindows,
      has_smart_home: hasSmartHome,
      has_built_in_wardrobes: hasBuiltInWardrobes,
      has_window_shades: hasWindowShades,
      has_electric_shades: hasElectricShades,
      // Accessibility
      has_step_free_access: hasStepFreeAccess,
      has_wheelchair_accessible: hasWheelchairAccessible,
      has_wide_doorways: hasWideDoorways,
      has_ground_floor_access: hasGroundFloorAccess,
      has_elevator_from_garage: hasElevatorFromGarage,
      // Safety
      has_secure_entrance: hasSecureEntrance,
      has_intercom: hasIntercom,
      has_gated_community: hasGatedCommunity,
      has_fire_safety: hasFireSafety,
      has_soundproofing: hasSoundproofing,
      // Individual heaters
      individual_heater_types: heatingDist === 'individual' ? pickN(INDIVIDUAL_HEATER_TYPES, randInt(1, 3, rand), rand) : null,
      // Status
      status,
      is_active: isActive,
      is_draft: isDraft,
      completed_at: completedAt,
      created_at: createdAt,
      updated_at: createdAt,
      // Rental
      allows_pets: allowsPets,
      pets_details: petsDetails,
      move_in_immediately: moveInImmediately,
      available_from: availableFrom,
      available_until: availableUntil,
      deposit_amount: depositAmount,
      min_lease_months: minLeaseMonths,
      internet_included: internetIncluded,
      utilities_included: utilitiesIncluded,
      utility_cost_estimate: utilityCostEstimate,
      // Sale costs
      monthly_expenses: monthlyExpenses,
      expense_breakdown_enabled: expenseBreakdownEnabled,
      expense_hoa_fees: expenseBreakdownEnabled ? randInt(20, 150, rand) : null,
      expense_maintenance: expenseBreakdownEnabled ? randInt(10, 80, rand) : null,
      expense_property_tax: expenseBreakdownEnabled ? randInt(10, 100, rand) : null,
      expense_utilities: expenseBreakdownEnabled ? randInt(30, 200, rand) : null,
      expense_insurance: expenseBreakdownEnabled ? randInt(10, 50, rand) : null,
      expense_other: expenseBreakdownEnabled && maybe(0.3, rand) ? randInt(10, 50, rand) : null,
    };

    listings.push(listing);
  }

  return listings;
}

// Slovenian names for mock users
const LANDLORD_PROFILES = [
  { email: 'marko.novak@hemma.si', name: 'Marko Novak', bio: 'Property owner in Ljubljana. Quick responses guaranteed.', management_type: 'private', num_properties: 5, response_time: 'same_day' },
  { email: 'ana.horvat@hemma.si', name: 'Ana Horvat', bio: 'Managing family properties across Slovenia since 2015.', management_type: 'private', num_properties: 3, response_time: 'within_hour' },
  { email: 'janez.krajnc@hemma.si', name: 'Janez Krajnc', bio: 'Professional property management company.', management_type: 'company', num_properties: 12, response_time: 'same_day' },
  { email: 'maja.zupan@hemma.si', name: 'Maja Zupan', bio: 'Renting out my apartment while abroad.', management_type: 'private', num_properties: 1, response_time: 'next_day' },
  { email: 'luka.kovac@hemma.si', name: 'Luka Kovač', bio: 'Real estate investor with premium properties on the coast.', management_type: 'private', num_properties: 8, response_time: 'within_hour' },
];

const TENANT_PROFILES = [
  { email: 'nina.oblak@hemma.si', name: 'Nina Oblak', employment: 'employed', income: '2000-3000', timeline: 'asap', household: 1, pets: false, smoker: false, bio: 'Young professional, working in IT. Looking for a quiet place close to the city center.' },
  { email: 'tomaz.vidmar@hemma.si', name: 'Tomaž Vidmar', employment: 'self_employed', income: '3000-5000', timeline: '1_month', household: 2, pets: true, smoker: false, bio: 'Freelance designer with a small dog. Clean and organized tenant.' },
  { email: 'petra.kos@hemma.si', name: 'Petra Kos', employment: 'student', income: '0-1000', timeline: '2_3_months', household: 1, pets: false, smoker: false, bio: 'Masters student at University of Ljubljana. Quiet and respectful.' },
  { email: 'ales.mlakar@hemma.si', name: 'Aleš Mlakar', employment: 'employed', income: '2000-3000', timeline: 'asap', household: 3, pets: false, smoker: false, bio: 'Small family looking for a 2-bedroom apartment. Both parents working.' },
  { email: 'eva.breznik@hemma.si', name: 'Eva Breznik', employment: 'employed', income: '1000-2000', timeline: 'flexible', household: 2, pets: true, smoker: false, bio: 'Couple with a cat. Both of us are healthcare workers.' },
  { email: 'rok.turk@hemma.si', name: 'Rok Turk', employment: 'retired', income: '1000-2000', timeline: '3_6_months', household: 1, pets: false, smoker: true, bio: 'Retired teacher looking for a ground-floor apartment.' },
  { email: 'spela.kolar@hemma.si', name: 'Špela Kolar', employment: 'employed', income: '3000-5000', timeline: 'asap', household: 1, pets: false, smoker: false, bio: 'Relocating to Ljubljana for work. Need a furnished apartment.' },
  { email: 'matic.kern@hemma.si', name: 'Matic Kern', employment: 'student', income: '0-1000', timeline: '2_3_months', household: 2, pets: false, smoker: false, bio: 'Two students looking for shared accommodation near campus.' },
];

const MESSAGE_TEMPLATES = {
  initial: [
    'Hi! I saw your listing and I\'m very interested. Is it still available?',
    'Hello, I\'d like to know more about this property. When can I schedule a viewing?',
    'Good day! I\'m looking for a place to rent and your listing caught my eye. Could you tell me more?',
    'Hi there! Is this apartment still on the market? I\'d love to arrange a visit.',
    'Hello! I\'m interested in renting this property. Can we discuss the details?',
    'I\'m very interested in your property. Can I schedule a viewing this week?',
    'Hi, is this still available? When would be a good time to view it?',
    'Great listing! I\'d like to know more about the neighborhood and utilities.',
  ],
  landlordReply: [
    'Hello! Yes, the property is still available. When would you like to visit?',
    'Hi! Thanks for your interest. I\'m available for viewings on weekdays after 4 PM.',
    'Yes, it\'s available! I can show you the property this Saturday. Does 11 AM work?',
    'Thank you for reaching out! The property is available from next month. Let me know when you\'d like to visit.',
    'Hi! Glad you\'re interested. I can answer any questions you have. Would you like to schedule a viewing?',
    'Hello! The apartment is still free. Let me know your availability and we\'ll find a time.',
  ],
  followUp: [
    'That sounds great! Saturday at 11 works for me.',
    'Perfect, I\'ll be there on Wednesday at 5 PM. Thanks!',
    'Would it be possible to bring a friend along for the viewing?',
    'Can you tell me more about the utility costs?',
    'Is parking included in the rent?',
    'Thank you! One more question - are pets allowed?',
    'Great, looking forward to seeing the place!',
    'Could I also see the storage space in the basement?',
  ],
  landlordFollowUp: [
    'Of course! See you then. Here\'s the entrance code: #1234',
    'Sure, no problem at all. The building entrance is on the left side.',
    'The utility costs are approximately 80-120 EUR per month depending on season.',
    'Yes, one parking spot is included. There\'s also street parking available.',
    'Small pets are welcome with a refundable deposit.',
    'Looking forward to meeting you! Don\'t hesitate to reach out if you have more questions.',
  ],
};

const COVER_LETTERS = [
  'I\'m a reliable tenant with a stable income. I take great care of properties and always pay rent on time. Looking for a long-term stay.',
  'As a young professional, I value a clean and quiet living space. I have excellent references from my previous landlord and I\'m happy to provide them.',
  'My partner and I are looking for our first apartment together. We both have stable jobs and are looking for a long-term rental. We\'re non-smokers and very tidy.',
  'I\'m relocating to Ljubljana for work and need a place quickly. I can provide proof of employment and salary. Happy to meet in person to discuss.',
  'Currently a masters student with a part-time job. I\'ve been renting for 3 years and have great references. Quiet and respectful of neighbors.',
  'Small family looking for a comfortable home. Both parents are employed with good income. We have no pets and are non-smokers.',
  '',
  'I\'d love to rent this property. I\'m a healthcare worker with a steady income. I\'ve been renting in Maribor for 5 years and looking to move to Ljubljana.',
  '',
  'Experienced tenant with 10+ years of renting history. I maintain properties well and respect house rules. Happy to provide references.',
];

async function getOrCreateUser(supabase: any, email: string, fullName: string) {
  const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = existingUsers?.users?.find((u: any) => u.email === email);
  if (existing) return existing.id;

  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email,
    password: 'hemma-seed-2024!',
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  return newUser.user.id;
}

export async function POST() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const rand = seededRandom(777);
  const log: string[] = [];

  try {
    // ── Step 1: Check migrations (non-blocking) ─────────────────
    log.push('Checking profile columns...');
    const { data: testProfile } = await supabase.from('profiles').select('*').limit(1).single();
    const existingCols = testProfile ? Object.keys(testProfile) : [];
    const neededCols = ['user_intents', 'onboarding_completed', 'employment_status', 'management_type'];
    const missingCols = neededCols.filter(c => !existingCols.includes(c));
    const hasEnhancedProfiles = missingCols.length === 0;
    if (!hasEnhancedProfiles) {
      log.push(`Missing profile columns (will skip enhanced fields): ${missingCols.join(', ')}`);
    } else {
      log.push('All profile columns exist');
    }

    // Applications table — check if exists (non-blocking)
    log.push('Checking applications table...');
    const { error: appTableCheck } = await supabase.from('applications').select('id').limit(1);
    const hasApplicationsTable = !(appTableCheck?.message?.includes('does not exist') || appTableCheck?.code === '42P01');
    if (!hasApplicationsTable) {
      log.push('Applications table does not exist — skipping applications seeding');
    } else {
      log.push('Applications table exists');
    }

    // ── Step 2: Create landlord users + profiles ────────────────
    log.push('Creating landlord users...');
    const landlordIds: string[] = [];
    for (const lp of LANDLORD_PROFILES) {
      const userId = await getOrCreateUser(supabase, lp.email, lp.name);
      landlordIds.push(userId);
      await supabase.from('profiles').upsert({
        user_id: userId,
        full_name: lp.name,
        bio: lp.bio,
        phone: `+386 ${randInt(30, 70, rand)} ${randInt(100, 999, rand)} ${randInt(100, 999, rand)}`,
        ...(hasEnhancedProfiles ? {
          user_intents: ['renting_out'],
          onboarding_completed: true,
          management_type: lp.management_type,
          num_properties: lp.num_properties,
          response_time: lp.response_time,
        } : {}),
      }, { onConflict: 'user_id' });
    }
    log.push(`Created ${landlordIds.length} landlord profiles`);

    // ── Step 3: Create tenant users + profiles ──────────────────
    log.push('Creating tenant users...');
    const tenantIds: string[] = [];
    for (const tp of TENANT_PROFILES) {
      const userId = await getOrCreateUser(supabase, tp.email, tp.name);
      tenantIds.push(userId);
      await supabase.from('profiles').upsert({
        user_id: userId,
        full_name: tp.name,
        bio: tp.bio,
        phone: `+386 ${randInt(30, 70, rand)} ${randInt(100, 999, rand)} ${randInt(100, 999, rand)}`,
        ...(hasEnhancedProfiles ? {
          user_intents: ['rent'],
          onboarding_completed: true,
          employment_status: tp.employment,
          monthly_income_range: tp.income,
          move_in_timeline: tp.timeline,
          household_size: tp.household,
          has_pets: tp.pets,
          is_smoker: tp.smoker,
        } : {}),
      }, { onConflict: 'user_id' });
    }
    log.push(`Created ${tenantIds.length} tenant profiles`);

    // ── Step 4: Reassign existing listings to landlords ─────────
    log.push('Distributing listings across landlords...');
    const { data: allListings } = await supabase
      .from('listings')
      .select('id')
      .order('created_at', { ascending: true });

    if (allListings && allListings.length > 0) {
      for (let i = 0; i < allListings.length; i++) {
        const landlordId = landlordIds[i % landlordIds.length];
        await supabase
          .from('listings')
          .update({ user_id: landlordId })
          .eq('id', allListings[i].id);
      }
      log.push(`Distributed ${allListings.length} listings across ${landlordIds.length} landlords`);
    } else {
      log.push('No listings found — generating 110 new ones...');
      const newListings = generateListings(110);
      const BATCH_SIZE = 20;
      for (let b = 0; b < newListings.length; b += BATCH_SIZE) {
        const batch = newListings.slice(b, b + BATCH_SIZE).map((l, idx) => ({
          ...l,
          user_id: landlordIds[(b + idx) % landlordIds.length],
        }));
        const { error } = await supabase.from('listings').insert(batch);
        if (error) throw error;
      }
      log.push('Created 110 new listings distributed across landlords');
    }

    // ── Step 5: Create mock applications ────────────────────────
    let appsCreated = 0;
    if (hasApplicationsTable) {
      log.push('Creating mock applications...');
      const { data: rentalListings } = await supabase
        .from('listings')
        .select('id, user_id, title')
        .eq('listing_type', 'rent')
        .eq('is_active', true)
        .limit(30);

      if (rentalListings && rentalListings.length > 0) {
        const statuses = ['applied', 'viewing_scheduled', 'under_review', 'accepted', 'declined'] as const;
        for (let i = 0; i < Math.min(rentalListings.length, 25); i++) {
          const listing = rentalListings[i];
          const numApplicants = randInt(1, 3, rand);
          const applicants = pickN(tenantIds, numApplicants, rand);

          for (const tenantId of applicants) {
            if (tenantId === listing.user_id) continue;

            const status = pick(statuses, rand);
            const tp = TENANT_PROFILES[tenantIds.indexOf(tenantId)];
            const viewingDate = status === 'viewing_scheduled'
              ? new Date(Date.now() + randInt(1, 14, rand) * 86400000).toISOString()
              : null;

            const { error: appErr } = await supabase.from('applications').upsert({
              listing_id: listing.id,
              renter_id: tenantId,
              landlord_id: listing.user_id,
              status,
              cover_letter: pick(COVER_LETTERS, rand) || null,
              viewing_date: viewingDate,
              landlord_notes: maybe(0.3, rand) ? pick(['Good candidate', 'Schedule follow-up', 'Needs income verification', 'Very promising', 'Check references'], rand) : null,
              renter_snapshot: tp ? {
                full_name: tp.name,
                email: tp.email,
                phone: `+386 ${randInt(30, 70, rand)} ${randInt(100, 999, rand)} ${randInt(100, 999, rand)}`,
                employment_status: tp.employment,
                monthly_income_range: tp.income,
                move_in_timeline: tp.timeline,
                household_size: tp.household,
                has_pets: tp.pets,
                is_smoker: tp.smoker,
                bio: tp.bio,
              } : null,
            }, { onConflict: 'listing_id,renter_id' });

            if (!appErr) appsCreated++;
          }
        }
      }
      log.push(`Created ${appsCreated} mock applications`);
    } else {
      log.push('Skipped applications (table not found)');
    }

    // ── Step 6: Create mock conversations & messages ─────────────
    log.push('Creating mock conversations and messages...');
    const { data: convListings } = await supabase
      .from('listings')
      .select('id, user_id')
      .eq('is_active', true)
      .limit(40);

    let convsCreated = 0;
    let msgsCreated = 0;

    if (convListings && convListings.length > 0) {
      for (let i = 0; i < Math.min(convListings.length, 30); i++) {
        const listing = convListings[i];
        // 1-2 tenants message per listing
        const numMessagers = randInt(1, 2, rand);
        const messagers = pickN(tenantIds, numMessagers, rand);

        for (const tenantId of messagers) {
          if (tenantId === listing.user_id) continue;

          // Check for existing conversation
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('listing_id', listing.id)
            .eq('renter_id', tenantId)
            .eq('landlord_id', listing.user_id)
            .single();

          let convId: string;
          if (existingConv) {
            convId = existingConv.id;
          } else {
            const { data: newConv, error: convErr } = await supabase
              .from('conversations')
              .insert({
                listing_id: listing.id,
                renter_id: tenantId,
                landlord_id: listing.user_id,
              })
              .select('id')
              .single();
            if (convErr) continue;
            convId = newConv.id;
            convsCreated++;
          }

          // Create 2-6 messages in the conversation
          const numMessages = randInt(2, 6, rand);
          const messages: any[] = [];
          const baseTime = Date.now() - randInt(1, 30, rand) * 86400000;

          for (let m = 0; m < numMessages; m++) {
            const isFromTenant = m % 2 === 0;
            const senderId = isFromTenant ? tenantId : listing.user_id;
            let content: string;

            if (m === 0) content = pick(MESSAGE_TEMPLATES.initial, rand);
            else if (m === 1) content = pick(MESSAGE_TEMPLATES.landlordReply, rand);
            else if (isFromTenant) content = pick(MESSAGE_TEMPLATES.followUp, rand);
            else content = pick(MESSAGE_TEMPLATES.landlordFollowUp, rand);

            messages.push({
              conversation_id: convId,
              sender_id: senderId,
              content,
              is_read: m < numMessages - 1, // last message unread
              created_at: new Date(baseTime + m * randInt(300, 7200, rand) * 1000).toISOString(),
            });
          }

          const { error: msgErr } = await supabase.from('messages').insert(messages);
          if (!msgErr) msgsCreated += messages.length;

          // Update conversation last_message_at
          await supabase
            .from('conversations')
            .update({ last_message_at: messages[messages.length - 1].created_at })
            .eq('id', convId);
        }
      }
    }
    log.push(`Created ${convsCreated} conversations with ${msgsCreated} messages`);

    return NextResponse.json({
      ok: true,
      log,
      summary: {
        landlords: landlordIds.length,
        tenants: tenantIds.length,
        listings_distributed: allListings?.length || 110,
        applications: appsCreated,
        conversations: convsCreated,
        messages: msgsCreated,
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message || 'Seed failed', log }, { status: 500 });
  }
}
