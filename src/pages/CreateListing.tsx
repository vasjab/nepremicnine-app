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
    property_type: 'apartment' as 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'other',
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
  });

  const [imageUrl, setImageUrl] = useState('');

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
                    onValueChange={(value: typeof formData.property_type) => 
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
