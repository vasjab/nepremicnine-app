import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateListing } from '@/hooks/useListings';
import { useAddressGeocoding } from '@/hooks/useAddressGeocoding';
import { Header } from '@/components/Header';
import { FormField } from '@/components/FormField';
import { LocationPreviewMap } from '@/components/LocationPreviewMap';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
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
import { ImageUploader } from '@/components/ImageUploader';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { CURRENCIES, CURRENCY_SYMBOLS, type Currency } from '@/lib/exchangeRates';
import { ListingPreviewModal } from '@/components/ListingPreviewModal';
import { FormCompletionChecklist, type ChecklistItem } from '@/components/FormCompletionChecklist';
import { useTranslation } from '@/hooks/useTranslation';

// Validation schema for listing data
const listingSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000, 'Description must be less than 5000 characters').optional().or(z.literal('')),
  listing_type: z.enum(['rent', 'sale']),
  property_type: z.enum(['apartment', 'house', 'room', 'studio', 'villa', 'other']),
  property_type_other: z.string().max(100, 'Property type description must be less than 100 characters').optional(),
  price: z.number().positive('Price must be positive').min(1, 'Price must be at least 1').max(1000000000, 'Price is too large'),
  address: z.string().trim().min(1, 'Address is required').max(500, 'Address must be less than 500 characters'),
  city: z.string().trim().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  postal_code: z.string().max(20, 'Postal code must be less than 20 characters').optional().or(z.literal('')),
  bedrooms: z.number().int().min(0, 'Bedrooms cannot be negative').max(50, 'Bedrooms must be 50 or less'),
  bathrooms: z.number().int().min(0, 'Bathrooms cannot be negative').max(20, 'Bathrooms must be 20 or less'),
  area_sqm: z.number().positive('Area must be positive').max(100000, 'Area is too large').optional().nullable(),
  available_from: z.string().optional().nullable(),
  available_until: z.string().optional().nullable(),
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

// Field validation rules
const fieldValidators: Record<string, (value: string) => string | null> = {
  title: (value) => {
    if (!value.trim()) return 'Title is required';
    if (value.trim().length < 5) return 'Title must be at least 5 characters';
    if (value.length > 200) return 'Title must be less than 200 characters';
    return null;
  },
  description: (value) => {
    if (value.length > 5000) return 'Description must be less than 5000 characters';
    return null;
  },
  price: (value) => {
    if (!value) return 'Price is required';
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return 'Price must be a positive number';
    if (num > 1000000000) return 'Price is too large';
    return null;
  },
  address: (value) => {
    if (!value.trim()) return 'Address is required';
    if (value.length > 500) return 'Address must be less than 500 characters';
    return null;
  },
  city: (value) => {
    if (!value.trim()) return 'City is required';
    if (value.length > 100) return 'City must be less than 100 characters';
    return null;
  },
  postal_code: (value) => {
    if (value.length > 20) return 'Postal code must be less than 20 characters';
    return null;
  },
  area_sqm: (value) => {
    if (value) {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return 'Area must be a positive number';
      if (num > 100000) return 'Area is too large';
    }
    return null;
  },
  year_built: (value) => {
    if (value) {
      const num = parseInt(value);
      if (isNaN(num)) return 'Year must be a number';
      if (num < 1800 || num > new Date().getFullYear() + 5) return 'Please enter a valid year';
    }
    return null;
  },
  deposit_amount: (value) => {
    if (value) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) return 'Deposit must be a positive number';
    }
    return null;
  },
  property_type_other: (value) => {
    if (value && value.length > 100) return 'Property type description must be less than 100 characters';
    return null;
  },
  heating_type_other: (value) => {
    if (value && value.length > 100) return 'Heating type description must be less than 100 characters';
    return null;
  },
};

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const createListing = useCreateListing();
  const firstErrorRef = useRef<HTMLDivElement>(null);

  // Bot protection
  const [honeypot, setHoneypot] = useState('');
  const { checkRateLimit, isLimited, remainingTime } = useRateLimit(LISTING_RATE_LIMIT);

  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);

  // Image upload hook
  const {
    images: uploadedImages,
    isUploading,
    uploadProgress,
    uploadImages,
    removeImage,
    reorderImages,
  } = useImageUpload({ userId: user?.id || '' });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    listing_type: 'rent' as 'rent' | 'sale',
    property_type: 'apartment' as PropertyType,
    property_type_other: '',
    price: '',
    currency: 'SEK' as Currency,
    address: '',
    city: '',
    postal_code: '',
    bedrooms: '1',
    bathrooms: '1',
    area_sqm: '',
    available_from: '',
    available_until: '',
    is_furnished: false,
    allows_pets: false,
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
    heating_type_other: '',
    energy_rating: '' as string,
    year_built: '',
    property_condition: '' as string,
    // Rental Terms
    deposit_amount: '',
    min_lease_months: '',
    internet_included: '' as string,
    utilities_included: '' as string,
  });

  // Manual coordinates (when user adjusts the marker)
  const [manualCoordinates, setManualCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  // Field errors and touched states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Computed flags
  const isApartmentType = ['apartment', 'room', 'studio'].includes(formData.property_type);
  const isHouseType = ['house', 'villa'].includes(formData.property_type);
  const isRental = formData.listing_type === 'rent';
  const isSale = formData.listing_type === 'sale';

  // Auto-geocoding from address
  const { coordinates, isGeocoding, status: geocodingStatus } = useAddressGeocoding({
    address: formData.address,
    city: formData.city,
    postalCode: formData.postal_code,
    country: 'Sweden',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Validate a single field
  const validateField = (field: string, value: string): string | null => {
    const validator = fieldValidators[field];
    return validator ? validator(value) : null;
  };

  // Handle field blur - validate and set touched
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData] as string);
    setErrors((prev) => {
      if (error) {
        return { ...prev, [field]: error };
      }
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Handle field change - clear error if field becomes valid
  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error if field is now valid (only for text fields)
    if (typeof value === 'string' && touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => {
        if (!error) {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        }
        return { ...prev, [field]: error };
      });
    }
  };

  // Get error message for a field
  const getError = (field: string): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  };

  // Check required fields for preview validation
  const getPreviewWarnings = (): string[] => {
    const warnings: string[] = [];
    const requiredFields = [
      { field: 'title', label: 'Title' },
      { field: 'price', label: 'Price' },
      { field: 'address', label: 'Address' },
      { field: 'city', label: 'City' },
    ];

    requiredFields.forEach(({ field, label }) => {
      const value = formData[field as keyof typeof formData];
      if (!value || (typeof value === 'string' && !value.trim())) {
        warnings.push(label);
      }
    });

    if (!coordinates && !manualCoordinates) {
      warnings.push('Location (valid address)');
    }

    if (uploadedImages.length === 0) {
      warnings.push('Images');
    }

    return warnings;
  };

  const handlePreviewClick = () => {
    const warnings = getPreviewWarnings();
    
    if (warnings.length > 0) {
      toast({
        title: t('preview.incompleteTitle'),
        description: t('preview.incompleteDescription', { fields: warnings.join(', ') }),
        variant: 'default',
      });
    }
    
    setShowPreview(true);
  };

  // Refs for scrolling to fields
  const titleRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  // Scroll to field helper
  const scrollToField = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Checklist items
  const checklistItems: ChecklistItem[] = [
    {
      id: 'title',
      label: t('checklist.title'),
      isComplete: !!formData.title?.trim() && formData.title.trim().length >= 5,
      onClick: () => scrollToField(titleRef),
    },
    {
      id: 'price',
      label: t('checklist.price'),
      isComplete: !!formData.price && parseFloat(formData.price) > 0,
      onClick: () => scrollToField(priceRef),
    },
    {
      id: 'address',
      label: t('checklist.address'),
      isComplete: !!formData.address?.trim(),
      onClick: () => scrollToField(addressRef),
    },
    {
      id: 'city',
      label: t('checklist.city'),
      isComplete: !!formData.city?.trim(),
      onClick: () => scrollToField(cityRef),
    },
    {
      id: 'location',
      label: t('checklist.location'),
      isComplete: !!(coordinates || manualCoordinates),
      onClick: () => scrollToField(addressRef),
    },
    {
      id: 'images',
      label: t('checklist.images'),
      isComplete: uploadedImages.length > 0,
      onClick: () => scrollToField(imagesRef),
    },
  ];

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

    // Validate all required fields
    const requiredFields = ['title', 'price', 'address', 'city'];
    const allErrors: Record<string, string> = {};
    const allTouched: Record<string, boolean> = {};

    requiredFields.forEach((field) => {
      allTouched[field] = true;
      const error = validateField(field, formData[field as keyof typeof formData] as string);
      if (error) {
        allErrors[field] = error;
      }
    });

    // Check geocoding (allow manual coordinates override)
    if (!coordinates && !manualCoordinates) {
      allErrors['address'] = 'Could not find location. Please check the address.';
      allTouched['address'] = true;
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched((prev) => ({ ...prev, ...allTouched }));
      
      // Scroll to first error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('[data-error="true"]');
        firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the highlighted fields.',
      });
      return;
    }
    
    const price = parseFloat(formData.price) || 0;
    const bedrooms = parseInt(formData.bedrooms) || 0;
    const bathrooms = parseInt(formData.bathrooms) || 0;
    const area_sqm = formData.area_sqm ? parseFloat(formData.area_sqm) : null;

    const dataToValidate = {
      title: formData.title,
      description: formData.description || undefined,
      listing_type: formData.listing_type,
      property_type: formData.property_type,
      property_type_other: formData.property_type === 'other' ? formData.property_type_other : undefined,
      price,
      address: formData.address,
      city: formData.city,
      postal_code: formData.postal_code || undefined,
      bedrooms,
      bathrooms,
      area_sqm,
      available_from: isRental ? (formData.available_from || null) : null,
      available_until: isRental ? (formData.available_until || null) : null,
      is_furnished: isRental ? formData.is_furnished : false,
      allows_pets: isRental ? formData.allows_pets : false,
      images: uploadedImages.map(img => img.url),
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
        currency: formData.currency,
        address: validatedData.address,
        city: validatedData.city,
        postal_code: validatedData.postal_code || null,
        country: 'Sweden',
        latitude: (manualCoordinates?.latitude ?? coordinates?.latitude)!,
        longitude: (manualCoordinates?.longitude ?? coordinates?.longitude)!,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        area_sqm: validatedData.area_sqm,
        available_from: validatedData.available_from,
        available_until: validatedData.available_until,
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
        // Rental Terms (only for rentals)
        deposit_amount: isRental && formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
        min_lease_months: isRental && formData.min_lease_months ? parseInt(formData.min_lease_months) : null,
        internet_included: isRental ? (formData.internet_included || null) as 'yes' | 'no' | 'available' | null : null,
        utilities_included: isRental ? (formData.utilities_included || null) as 'yes' | 'no' | 'partial' | null : null,
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

          {/* Form Completion Checklist */}
          <FormCompletionChecklist items={checklistItems} />

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Honeypot field for bot detection */}
            <HoneypotField value={honeypot} onChange={setHoneypot} />
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  label="Listing Type"
                  htmlFor="listing_type"
                  required
                >
                  <Select
                    value={formData.listing_type}
                    onValueChange={(value: 'rent' | 'sale') => 
                      handleChange('listing_type', value)
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
                </FormField>

                <FormField
                  label="Property Type"
                  htmlFor="property_type"
                  required
                >
                  <Select
                    value={formData.property_type}
                    onValueChange={(value: PropertyType) => 
                      handleChange('property_type', value)
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
                </FormField>
              </div>

              {/* Other property type text input */}
              {formData.property_type === 'other' && (
                <FormField
                  label="Describe Property Type"
                  htmlFor="property_type_other"
                  required
                  error={getError('property_type_other')}
                >
                  <Input
                    id="property_type_other"
                    placeholder="e.g., Warehouse, Loft, Townhouse"
                    value={formData.property_type_other}
                    onChange={(e) => handleChange('property_type_other', e.target.value)}
                    onBlur={() => handleBlur('property_type_other')}
                    className={cn(getError('property_type_other') && 'border-destructive')}
                    data-error={!!getError('property_type_other')}
                  />
                </FormField>
              )}

              <div ref={titleRef}>
                <FormField
                  label="Title"
                  htmlFor="title"
                  required
                  error={getError('title')}
                >
                  <Input
                    id="title"
                    placeholder="Cozy 2-bedroom apartment in city center"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    onBlur={() => handleBlur('title')}
                    className={cn(getError('title') && 'border-destructive')}
                    data-error={!!getError('title')}
                  />
                </FormField>
              </div>

              <FormField
                label="Description"
                htmlFor="description"
                error={getError('description')}
              >
                <Textarea
                  id="description"
                  placeholder="Describe your property..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  className={cn(getError('description') && 'border-destructive')}
                />
              </FormField>

              <div ref={priceRef}>
                <FormField
                  label={`Price ${isRental ? 'per month' : ''}`}
                  htmlFor="price"
                  required
                  error={getError('price')}
                >
                  <div className="flex gap-2">
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => handleChange('currency', value as Currency)}
                    >
                      <SelectTrigger className="w-24 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((curr) => (
                          <SelectItem key={curr} value={curr}>
                            {CURRENCY_SYMBOLS[curr]} {curr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="price"
                      type="number"
                      placeholder={isRental ? '12000' : '2500000'}
                      value={formData.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      onBlur={() => handleBlur('price')}
                      className={cn(getError('price') && 'border-destructive', 'flex-1')}
                      data-error={!!getError('price')}
                    />
                  </div>
                </FormField>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Location</h2>
              <p className="text-sm text-muted-foreground">
                Enter the address and we'll automatically find the location on the map.
              </p>
              
              <div ref={addressRef}>
                <FormField
                  label="Address"
                  htmlFor="address"
                  required
                  error={getError('address')}
                >
                  <AddressAutocomplete
                    value={formData.address}
                    onChange={(value) => handleChange('address', value)}
                    onSelect={(suggestion) => {
                      handleChange('address', suggestion.address);
                      if (suggestion.city) {
                        handleChange('city', suggestion.city);
                      }
                      if (suggestion.postalCode) {
                        handleChange('postal_code', suggestion.postalCode);
                      }
                      // Reset manual coordinates when a new address is selected
                      setManualCoordinates(null);
                    }}
                    onBlur={() => handleBlur('address')}
                    placeholder="Start typing an address..."
                    hasError={!!getError('address')}
                  />
                </FormField>
              </div>

              <div ref={cityRef} className="grid sm:grid-cols-2 gap-4">
                <FormField
                  label="City"
                  htmlFor="city"
                  required
                  error={getError('city')}
                >
                  <Input
                    id="city"
                    placeholder="Stockholm"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    onBlur={() => handleBlur('city')}
                    className={cn(getError('city') && 'border-destructive')}
                    data-error={!!getError('city')}
                  />
                </FormField>
                <FormField
                  label="Postal Code"
                  htmlFor="postal_code"
                  error={getError('postal_code')}
                >
                  <Input
                    id="postal_code"
                    placeholder="111 22"
                    value={formData.postal_code}
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                    onBlur={() => handleBlur('postal_code')}
                    className={cn(getError('postal_code') && 'border-destructive')}
                  />
                </FormField>
              </div>

              {/* Map preview with geocoding status */}
              <LocationPreviewMap
                latitude={coordinates?.latitude ?? null}
                longitude={coordinates?.longitude ?? null}
                status={geocodingStatus}
                formattedAddress={coordinates?.formattedAddress}
                isGeocoding={isGeocoding}
                onLocationChange={(lat, lng) => setManualCoordinates({ latitude: lat, longitude: lng })}
                manualCoordinates={manualCoordinates}
                onResetLocation={() => setManualCoordinates(null)}
              />
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Property Details</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Bedrooms" htmlFor="bedrooms">
                  <Select
                    value={formData.bedrooms}
                    onValueChange={(value) => handleChange('bedrooms', value)}
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
                </FormField>

                <FormField label="Bathrooms" htmlFor="bathrooms">
                  <Select
                    value={formData.bathrooms}
                    onValueChange={(value) => handleChange('bathrooms', value)}
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
                </FormField>

                <FormField label="Area (m²)" htmlFor="area" error={getError('area_sqm')}>
                  <Input
                    id="area"
                    type="number"
                    placeholder="65"
                    value={formData.area_sqm}
                    onChange={(e) => handleChange('area_sqm', e.target.value)}
                    onBlur={() => handleBlur('area_sqm')}
                    className={cn(getError('area_sqm') && 'border-destructive')}
                  />
                </FormField>
              </div>

              {/* Rental-specific dates */}
              {isRental && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Move-in Date" htmlFor="available_from">
                    <Input
                      id="available_from"
                      type="date"
                      value={formData.available_from}
                      onChange={(e) => handleChange('available_from', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Rental End Date (optional)" htmlFor="available_until">
                    <Input
                      id="available_until"
                      type="date"
                      value={formData.available_until}
                      min={formData.available_from || undefined}
                      onChange={(e) => handleChange('available_until', e.target.value)}
                    />
                  </FormField>
                </div>
              )}

              {/* Rental-specific toggles */}
              {isRental && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_furnished">Furnished</Label>
                      <p className="text-sm text-muted-foreground">Property comes with furniture</p>
                    </div>
                    <Switch
                      id="is_furnished"
                      checked={formData.is_furnished}
                      onCheckedChange={(checked) => handleChange('is_furnished', checked)}
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
                      onCheckedChange={(checked) => handleChange('allows_pets', checked)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Building & Floor - Conditional */}
            {(isApartmentType || isHouseType) && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Building & Floor</h2>
                
                {isApartmentType && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Floor Number" htmlFor="floor_number">
                        <Input
                          id="floor_number"
                          type="number"
                          placeholder="3"
                          value={formData.floor_number}
                          onChange={(e) => handleChange('floor_number', e.target.value)}
                        />
                      </FormField>
                      <FormField label="Total Building Floors" htmlFor="total_floors_building">
                        <Input
                          id="total_floors_building"
                          type="number"
                          placeholder="5"
                          value={formData.total_floors_building}
                          onChange={(e) => handleChange('total_floors_building', e.target.value)}
                        />
                      </FormField>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="has_elevator">Elevator</Label>
                        <p className="text-sm text-muted-foreground">Building has an elevator</p>
                      </div>
                      <Switch
                        id="has_elevator"
                        checked={formData.has_elevator}
                        onCheckedChange={(checked) => handleChange('has_elevator', checked)}
                      />
                    </div>
                  </>
                )}

                {isHouseType && (
                  <FormField label="Number of Floors" htmlFor="property_floors">
                    <Input
                      id="property_floors"
                      type="number"
                      placeholder="2"
                      value={formData.property_floors}
                      onChange={(e) => handleChange('property_floors', e.target.value)}
                    />
                  </FormField>
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
                    onCheckedChange={(checked) => handleChange('has_balcony', checked)}
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
                    onCheckedChange={(checked) => handleChange('has_terrace', checked)}
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
                    onCheckedChange={(checked) => handleChange('has_garden', checked)}
                  />
                </div>

                {formData.has_garden && (
                  <div className="ml-4">
                    <FormField label="Garden Size (m²)" htmlFor="garden_sqm">
                      <Input
                        id="garden_sqm"
                        type="number"
                        placeholder="50"
                        value={formData.garden_sqm}
                        onChange={(e) => handleChange('garden_sqm', e.target.value)}
                      />
                    </FormField>
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
                    onCheckedChange={(checked) => handleChange('has_parking', checked)}
                  />
                </div>

                {formData.has_parking && (
                  <div className="grid sm:grid-cols-2 gap-4 ml-4">
                    <FormField label="Parking Type" htmlFor="parking_type">
                      <Select
                        value={formData.parking_type}
                        onValueChange={(value) => handleChange('parking_type', value)}
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
                    </FormField>
                    <FormField label="Number of Spaces" htmlFor="parking_spaces">
                      <Input
                        id="parking_spaces"
                        type="number"
                        placeholder="1"
                        value={formData.parking_spaces}
                        onChange={(e) => handleChange('parking_spaces', e.target.value)}
                      />
                    </FormField>
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
                    onCheckedChange={(checked) => handleChange('has_garage', checked)}
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
                    onCheckedChange={(checked) => handleChange('has_air_conditioning', checked)}
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
                    onCheckedChange={(checked) => handleChange('has_dishwasher', checked)}
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
                    onCheckedChange={(checked) => handleChange('has_washing_machine', checked)}
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
                    onCheckedChange={(checked) => handleChange('has_storage', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Building Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Building Information</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Heating Type" htmlFor="heating_type">
                  <Select
                    value={formData.heating_type}
                    onValueChange={(value) => handleChange('heating_type', value)}
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
                </FormField>

                <FormField label="Energy Rating" htmlFor="energy_rating">
                  <Select
                    value={formData.energy_rating}
                    onValueChange={(value) => handleChange('energy_rating', value)}
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
                </FormField>

                <FormField label="Year Built" htmlFor="year_built" error={getError('year_built')}>
                  <Input
                    id="year_built"
                    type="number"
                    placeholder="2005"
                    value={formData.year_built}
                    onChange={(e) => handleChange('year_built', e.target.value)}
                    onBlur={() => handleBlur('year_built')}
                    className={cn(getError('year_built') && 'border-destructive')}
                  />
                </FormField>

                <FormField label="Condition" htmlFor="property_condition">
                  <Select
                    value={formData.property_condition}
                    onValueChange={(value) => handleChange('property_condition', value)}
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
                </FormField>
              </div>

              {/* Other heating type text input */}
              {formData.heating_type === 'other' && (
                <FormField
                  label="Describe Heating Type"
                  htmlFor="heating_type_other"
                  error={getError('heating_type_other')}
                >
                  <Input
                    id="heating_type_other"
                    placeholder="e.g., Geothermal, Wood burning, etc."
                    value={formData.heating_type_other}
                    onChange={(e) => handleChange('heating_type_other', e.target.value)}
                    onBlur={() => handleBlur('heating_type_other')}
                    className={cn(getError('heating_type_other') && 'border-destructive')}
                  />
                </FormField>
              )}
            </div>

            {/* Rental Terms - Only for rentals */}
            {isRental && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Rental Terms</h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Deposit Amount (SEK)" htmlFor="deposit_amount" error={getError('deposit_amount')}>
                    <Input
                      id="deposit_amount"
                      type="number"
                      placeholder="24000"
                      value={formData.deposit_amount}
                      onChange={(e) => handleChange('deposit_amount', e.target.value)}
                      onBlur={() => handleBlur('deposit_amount')}
                      className={cn(getError('deposit_amount') && 'border-destructive')}
                    />
                  </FormField>

                  <FormField label="Minimum Lease (months)" htmlFor="min_lease_months">
                    <Select
                      value={formData.min_lease_months}
                      onValueChange={(value) => handleChange('min_lease_months', value)}
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
                  </FormField>

                  <FormField label="Internet Included" htmlFor="internet_included">
                    <Select
                      value={formData.internet_included}
                      onValueChange={(value) => handleChange('internet_included', value)}
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
                  </FormField>

                  <FormField label="Utilities Included" htmlFor="utilities_included">
                    <Select
                      value={formData.utilities_included}
                      onValueChange={(value) => handleChange('utilities_included', value)}
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
                  </FormField>
                </div>
              </div>
            )}

            {/* Images */}
            <div ref={imagesRef} className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Images</h2>
              <p className="text-sm text-muted-foreground">
                Drag and drop images or click to upload. Images will be automatically compressed.
              </p>
              
              <ImageUploader
                images={uploadedImages}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                onUpload={uploadImages}
                onRemove={removeImage}
                onReorder={reorderImages}
                maxImages={20}
                disabled={!user}
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="sm:flex-1"
                onClick={handlePreviewClick}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('preview.previewButton')}
              </Button>
              <Button
                type="submit"
                className="sm:flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={createListing.isPending || isLimited || isGeocoding}
              >
                {createListing.isPending ? 'Creating...' : isGeocoding ? 'Finding location...' : 'Create Listing'}
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

      {/* Preview Modal */}
      <ListingPreviewModal
        formData={formData}
        uploadedImages={uploadedImages}
        coordinates={manualCoordinates || coordinates}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
