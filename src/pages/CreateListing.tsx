import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateListing } from '@/hooks/useListings';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { HoneypotField, isHoneypotTriggered } from '@/components/HoneypotField';
import { useRateLimit, LISTING_RATE_LIMIT } from '@/hooks/useRateLimit';
import { supabase } from '@/integrations/supabase/client';

// Validation schema for listing data
const listingSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional().or(z.literal('')),
  listing_type: z.enum(['rent', 'sale']),
  property_type: z.enum(['apartment', 'house', 'room', 'studio', 'villa', 'other']),
  price: z.number().positive('Price must be positive').min(1, 'Price must be at least 1').max(1000000000, 'Price is too large'),
  address: z.string().trim().min(1, 'Address is required').max(500, 'Address must be less than 500 characters'),
  city: z.string().trim().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  postal_code: z.string().max(20, 'Postal code must be less than 20 characters').optional().or(z.literal('')),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  bedrooms: z.number().int().min(0, 'Bedrooms cannot be negative').max(50, 'Bedrooms must be 50 or less'),
  bathrooms: z.number().int().min(0, 'Bathrooms cannot be negative').max(20, 'Bathrooms must be 20 or less'),
  area_sqm: z.number().positive('Area must be positive').max(100000, 'Area is too large').optional().nullable(),
  available_from: z.string().optional().nullable(),
  is_furnished: z.boolean(),
  allows_pets: z.boolean(),
  images: z.array(
    z.string().url('Invalid image URL').refine(
      (url) => /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url) || url.includes('unsplash.com') || url.includes('images.pexels.com'),
      'Image URL must end with .jpg, .jpeg, .png, .gif, or .webp'
    )
  ).max(20, 'Maximum 20 images allowed'),
});

type PropertyType = 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'other';

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createListing = useCreateListing();

  // Bot protection
  const [honeypot, setHoneypot] = useState('');
  const { checkRateLimit, isLimited, remainingTime } = useRateLimit(LISTING_RATE_LIMIT);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    listing_type: 'rent' as 'rent' | 'sale',
    property_type: 'apartment' as PropertyType,
    price: '',
    address: '',
    city: '',
    postal_code: '',
    latitude: '',
    longitude: '',
    bedrooms: '1',
    bathrooms: '1',
    area_sqm: '',
    available_from: '',
    is_furnished: false,
    allows_pets: false,
    images: [] as string[],
    // Building & Floor
    floor_number: '',
    total_floors_building: '',
    property_floors: '',
    has_elevator: false,
    // Outdoor
    has_balcony: false,
    has_terrace: false,
    has_garden: false,
    garden_sqm: '',
    // Parking
    has_parking: false,
    parking_type: '' as string,
    parking_spaces: '',
    has_garage: false,
    // Amenities
    has_storage: false,
    has_air_conditioning: false,
    has_dishwasher: false,
    has_washing_machine: false,
    // Building Info
    heating_type: '' as string,
    energy_rating: '' as string,
    year_built: '',
    property_condition: '' as string,
    // Rental Terms
    deposit_amount: '',
    min_lease_months: '',
    internet_included: '' as string,
    utilities_included: '' as string,
  });

  const [imageUrl, setImageUrl] = useState('');

  const isApartmentType = ['apartment', 'room', 'studio'].includes(formData.property_type);
  const isHouseType = ['house', 'villa'].includes(formData.property_type);
  const isRental = formData.listing_type === 'rent';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const checkServerRateLimit = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      const { data, error } = await supabase.functions.invoke('check-rate-limit', {
        body: { identifier: user.id, action: 'create_listing' },
      });
      
      if (error) return true; // Fail open
      return data?.allowed !== false;
    } catch {
      return true; // Fail open on network errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Check honeypot
    if (isHoneypotTriggered(honeypot)) {
      // Silently fail for bots
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Listing created!',
        description: 'Your property is now live.',
      });
      return;
    }

    // Check client-side rate limit first
    if (!checkRateLimit()) {
      toast({
        variant: 'destructive',
        title: 'Too many listings',
        description: `Please wait ${Math.ceil(remainingTime / 60)} minutes before creating another listing.`,
      });
      return;
    }

    // Check server-side rate limit
    const serverAllowed = await checkServerRateLimit();
    if (!serverAllowed) {
      toast({
        variant: 'destructive',
        title: 'Too many listings',
        description: 'You have reached the maximum number of listings allowed. Please wait before creating more.',
      });
      return;
    }
    
    const latitude = formData.latitude ? parseFloat(formData.latitude) : 59.3293;
    const longitude = formData.longitude ? parseFloat(formData.longitude) : 18.0686;
    const price = parseFloat(formData.price) || 0;
    const bedrooms = parseInt(formData.bedrooms) || 0;
    const bathrooms = parseInt(formData.bathrooms) || 0;
    const area_sqm = formData.area_sqm ? parseFloat(formData.area_sqm) : null;

    const dataToValidate = {
      title: formData.title,
      description: formData.description || undefined,
      listing_type: formData.listing_type,
      property_type: formData.property_type,
      price,
      address: formData.address,
      city: formData.city,
      postal_code: formData.postal_code || undefined,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      area_sqm,
      available_from: formData.available_from || null,
      is_furnished: formData.is_furnished,
      allows_pets: formData.allows_pets,
      images: formData.images,
    };

    // Validate with zod schema
    const validationResult = listingSchema.safeParse(dataToValidate);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: firstError.message,
      });
      return;
    }

    const validatedData = validationResult.data;

    createListing.mutate(
      {
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description || null,
        listing_type: validatedData.listing_type,
        property_type: validatedData.property_type,
        price: validatedData.price,
        currency: 'SEK',
        address: validatedData.address,
        city: validatedData.city,
        postal_code: validatedData.postal_code || null,
        country: 'Sweden',
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        area_sqm: validatedData.area_sqm,
        available_from: validatedData.available_from,
        available_until: null,
        is_furnished: validatedData.is_furnished,
        allows_pets: validatedData.allows_pets,
        images: validatedData.images,
        floor_plan_url: null,
        is_active: true,
        // Building & Floor
        floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
        total_floors_building: formData.total_floors_building ? parseInt(formData.total_floors_building) : null,
        property_floors: formData.property_floors ? parseInt(formData.property_floors) : null,
        has_elevator: formData.has_elevator,
        // Outdoor
        has_balcony: formData.has_balcony,
        has_terrace: formData.has_terrace,
        has_garden: formData.has_garden,
        garden_sqm: formData.garden_sqm ? parseFloat(formData.garden_sqm) : null,
        // Parking
        has_parking: formData.has_parking,
        parking_type: (formData.parking_type || null) as 'street' | 'designated' | 'underground' | 'private' | null,
        parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
        has_garage: formData.has_garage,
        // Amenities
        has_storage: formData.has_storage,
        has_air_conditioning: formData.has_air_conditioning,
        has_dishwasher: formData.has_dishwasher,
        has_washing_machine: formData.has_washing_machine,
        // Building Info
        heating_type: (formData.heating_type || null) as 'central' | 'electric' | 'gas' | 'heat_pump' | 'other' | null,
        energy_rating: (formData.energy_rating || null) as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        property_condition: (formData.property_condition || null) as 'new' | 'renovated' | 'good' | 'needs_work' | null,
        // Rental Terms
        deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
        min_lease_months: formData.min_lease_months ? parseInt(formData.min_lease_months) : null,
        internet_included: (formData.internet_included || null) as 'yes' | 'no' | 'available' | null,
        utilities_included: (formData.utilities_included || null) as 'yes' | 'no' | 'partial' | null,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Listing created!',
            description: 'Your property is now live.',
          });
          navigate('/my-listings');
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to create listing. Please try again.',
          });
        },
      }
    );
  };

  const handleAddImage = () => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
      setImageUrl('');
    }
  };

  const handleRemoveImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== url),
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Create a new listing
          </h1>
          <p className="text-muted-foreground mb-8">
            Fill in the details about your property
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Honeypot field for bot detection */}
            <HoneypotField value={honeypot} onChange={setHoneypot} />
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="listing_type">Listing Type *</Label>
                  <Select
                    value={formData.listing_type}
                    onValueChange={(value: 'rent' | 'sale') => 
                      setFormData(prev => ({ ...prev, listing_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value: PropertyType) => 
                      setFormData(prev => ({ ...prev, property_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Cozy 2-bedroom apartment in city center"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (SEK) {formData.listing_type === 'rent' ? 'per month' : ''} *
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="12000"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Location</h2>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Storgatan 1"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Stockholm"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    placeholder="111 22"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="59.3293"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="18.0686"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Property Details</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select
                    value={formData.bedrooms}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, bedrooms: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select
                    value={formData.bathrooms}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, bathrooms: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(n => (
                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Area (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="65"
                    value={formData.area_sqm}
                    onChange={(e) => setFormData(prev => ({ ...prev, area_sqm: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="available_from">Available From</Label>
                <Input
                  id="available_from"
                  type="date"
                  value={formData.available_from}
                  onChange={(e) => setFormData(prev => ({ ...prev, available_from: e.target.value }))}
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_furnished">Furnished</Label>
                    <p className="text-sm text-muted-foreground">Property comes with furniture</p>
                  </div>
                  <Switch
                    id="is_furnished"
                    checked={formData.is_furnished}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_furnished: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allows_pets">Pets Allowed</Label>
                    <p className="text-sm text-muted-foreground">Tenants can have pets</p>
                  </div>
                  <Switch
                    id="allows_pets"
                    checked={formData.allows_pets}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, allows_pets: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Building & Floor - Conditional */}
            {(isApartmentType || isHouseType) && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Building & Floor</h2>
                
                {isApartmentType && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="floor_number">Floor Number</Label>
                        <Input
                          id="floor_number"
                          type="number"
                          placeholder="3"
                          value={formData.floor_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, floor_number: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total_floors_building">Total Building Floors</Label>
                        <Input
                          id="total_floors_building"
                          type="number"
                          placeholder="5"
                          value={formData.total_floors_building}
                          onChange={(e) => setFormData(prev => ({ ...prev, total_floors_building: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="has_elevator">Elevator</Label>
                        <p className="text-sm text-muted-foreground">Building has an elevator</p>
                      </div>
                      <Switch
                        id="has_elevator"
                        checked={formData.has_elevator}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, has_elevator: checked }))
                        }
                      />
                    </div>
                  </>
                )}

                {isHouseType && (
                  <div className="space-y-2">
                    <Label htmlFor="property_floors">Number of Floors</Label>
                    <Input
                      id="property_floors"
                      type="number"
                      placeholder="2"
                      value={formData.property_floors}
                      onChange={(e) => setFormData(prev => ({ ...prev, property_floors: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Outdoor Features */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Outdoor Features</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="has_balcony">Balcony</Label>
                    <p className="text-sm text-muted-foreground">Property has a balcony</p>
                  </div>
                  <Switch
                    id="has_balcony"
                    checked={formData.has_balcony}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, has_balcony: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="has_terrace">Terrace</Label>
                    <p className="text-sm text-muted-foreground">Property has a terrace</p>
                  </div>
                  <Switch
                    id="has_terrace"
                    checked={formData.has_terrace}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, has_terrace: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="has_garden">Garden</Label>
                    <p className="text-sm text-muted-foreground">Property has a garden</p>
                  </div>
                  <Switch
                    id="has_garden"
                    checked={formData.has_garden}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, has_garden: checked }))
                    }
                  />
                </div>

                {formData.has_garden && (
                  <div className="space-y-2 ml-4">
                    <Label htmlFor="garden_sqm">Garden Size (m²)</Label>
                    <Input
                      id="garden_sqm"
                      type="number"
                      placeholder="50"
                      value={formData.garden_sqm}
                      onChange={(e) => setFormData(prev => ({ ...prev, garden_sqm: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Parking */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Parking</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="has_parking">Parking Available</Label>
                    <p className="text-sm text-muted-foreground">Parking is available</p>
                  </div>
                  <Switch
                    id="has_parking"
                    checked={formData.has_parking}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, has_parking: checked }))
                    }
                  />
                </div>

                {formData.has_parking && (
                  <div className="grid sm:grid-cols-2 gap-4 ml-4">
                    <div className="space-y-2">
                      <Label htmlFor="parking_type">Parking Type</Label>
                      <Select
                        value={formData.parking_type}
                        onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, parking_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="street">Street</SelectItem>
                          <SelectItem value="designated">Designated</SelectItem>
                          <SelectItem value="underground">Underground</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parking_spaces">Number of Spaces</Label>
                      <Input
                        id="parking_spaces"
                        type="number"
                        placeholder="1"
                        value={formData.parking_spaces}
                        onChange={(e) => setFormData(prev => ({ ...prev, parking_spaces: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="has_garage">Garage</Label>
                    <p className="text-sm text-muted-foreground">Property has a garage</p>
                  </div>
                  <Switch
                    id="has_garage"
                    checked={formData.has_garage}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, has_garage: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Amenities</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="has_air_conditioning">Air Conditioning</Label>
                    <p className="text-sm text-muted-foreground">Property has AC</p>
                  </div>
                  <Switch
                    id="has_air_conditioning"
                    checked={formData.has_air_conditioning}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, has_air_conditioning: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="has_dishwasher">Dishwasher</Label>
                    <p className="text-sm text-muted-foreground">Property has a dishwasher</p>
                  </div>
                  <Switch
                    id="has_dishwasher"
                    checked={formData.has_dishwasher}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, has_dishwasher: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="has_washing_machine">Washing Machine</Label>
                    <p className="text-sm text-muted-foreground">Property has a washing machine</p>
                  </div>
                  <Switch
                    id="has_washing_machine"
                    checked={formData.has_washing_machine}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, has_washing_machine: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="has_storage">Storage/Cellar</Label>
                    <p className="text-sm text-muted-foreground">Property has storage space</p>
                  </div>
                  <Switch
                    id="has_storage"
                    checked={formData.has_storage}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, has_storage: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Building Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Building Information</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heating_type">Heating Type</Label>
                  <Select
                    value={formData.heating_type}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, heating_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="central">Central</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                      <SelectItem value="heat_pump">Heat Pump</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="energy_rating">Energy Rating</Label>
                  <Select
                    value={formData.energy_rating}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, energy_rating: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(rating => (
                        <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year_built">Year Built</Label>
                  <Input
                    id="year_built"
                    type="number"
                    placeholder="2005"
                    value={formData.year_built}
                    onChange={(e) => setFormData(prev => ({ ...prev, year_built: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_condition">Condition</Label>
                  <Select
                    value={formData.property_condition}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, property_condition: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="renovated">Renovated</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="needs_work">Needs Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Rental Terms - Only for rentals */}
            {isRental && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Rental Terms</h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit_amount">Deposit Amount (SEK)</Label>
                    <Input
                      id="deposit_amount"
                      type="number"
                      placeholder="24000"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, deposit_amount: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_lease_months">Minimum Lease (months)</Label>
                    <Select
                      value={formData.min_lease_months}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, min_lease_months: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 3, 6, 12, 24].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} months</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="internet_included">Internet Included</Label>
                    <Select
                      value={formData.internet_included}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, internet_included: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="available">Available (extra cost)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utilities_included">Utilities Included</Label>
                    <Select
                      value={formData.utilities_included}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, utilities_included: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes (all included)</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="partial">Partial (some included)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Images */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Images</h2>
              <p className="text-sm text-muted-foreground">Add image URLs for your property</p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={handleAddImage}>
                  <Upload className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={createListing.isPending || isLimited}
              >
                {createListing.isPending ? 'Creating...' : 'Create Listing'}
              </Button>
            </div>
            
            {isLimited && (
              <p className="text-sm text-destructive text-center">
                You've created too many listings recently. Please wait {Math.ceil(remainingTime / 60)} minutes.
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
