import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Eye } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useListing, useUpdateListing } from '@/hooks/useListings';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ImageUploader } from '@/components/ImageUploader';
import { useImageUpload, type UploadedImage } from '@/hooks/useImageUpload';
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
      (url) => /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url) || url.includes('unsplash.com') || url.includes('images.pexels.com') || url.includes('supabase'),
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

export default function EditListing() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const updateListing = useUpdateListing();
  const { data: listing, isLoading, error } = useListing(id);
  const firstErrorRef = useRef<HTMLDivElement>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

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
    setImages,
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

  // Auto-geocoding from address
  const { coordinates, isGeocoding, status: geocodingStatus } = useAddressGeocoding({
    address: formData.address,
    city: formData.city,
    postalCode: formData.postal_code,
    country: 'Sweden',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Populate form with existing listing data
  useEffect(() => {
    if (listing && !isFormInitialized) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        listing_type: listing.listing_type || 'rent',
        property_type: listing.property_type || 'apartment',
        property_type_other: '',
        price: listing.price?.toString() || '',
        currency: (listing.currency as Currency) || 'SEK',
        address: listing.address || '',
        city: listing.city || '',
        postal_code: listing.postal_code || '',
        bedrooms: listing.bedrooms?.toString() || '1',
        bathrooms: listing.bathrooms?.toString() || '1',
        area_sqm: listing.area_sqm?.toString() || '',
        available_from: listing.available_from || '',
        available_until: listing.available_until || '',
        is_furnished: listing.is_furnished || false,
        allows_pets: listing.allows_pets || false,
        // Building & Floor
        floor_number: listing.floor_number?.toString() || '',
        total_floors_building: listing.total_floors_building?.toString() || '',
        property_floors: listing.property_floors?.toString() || '',
        has_elevator: listing.has_elevator || false,
        // Outdoor
        has_balcony: listing.has_balcony || false,
        has_terrace: listing.has_terrace || false,
        has_garden: listing.has_garden || false,
        garden_sqm: listing.garden_sqm?.toString() || '',
        // Parking
        has_parking: listing.has_parking || false,
        parking_type: listing.parking_type || '',
        parking_spaces: listing.parking_spaces?.toString() || '',
        has_garage: listing.has_garage || false,
        // Amenities
        has_storage: listing.has_storage || false,
        has_air_conditioning: listing.has_air_conditioning || false,
        has_dishwasher: listing.has_dishwasher || false,
        has_washing_machine: listing.has_washing_machine || false,
        // Building Info
        heating_type: listing.heating_type || '',
        heating_type_other: '',
        energy_rating: listing.energy_rating || '',
        year_built: listing.year_built?.toString() || '',
        property_condition: listing.property_condition || '',
        // Rental Terms
        deposit_amount: listing.deposit_amount?.toString() || '',
        min_lease_months: listing.min_lease_months?.toString() || '',
        internet_included: listing.internet_included || '',
        utilities_included: listing.utilities_included || '',
      });

      // Set manual coordinates from existing listing
      if (listing.latitude && listing.longitude) {
        setManualCoordinates({ latitude: listing.latitude, longitude: listing.longitude });
      }

      // Set existing images
      if (listing.images && listing.images.length > 0) {
        const existingImages: UploadedImage[] = listing.images.map((url, index) => ({
          id: `existing-${index}`,
          url,
          name: `Image ${index + 1}`,
          size: 0,
        }));
        setImages(existingImages);
      }

      setIsFormInitialized(true);
    }
  }, [listing, isFormInitialized, setImages]);

  // Check authorization
  const isAuthorized = listing && user && listing.user_id === user.id;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !id) return;

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
    const finalCoordinates = manualCoordinates || coordinates;
    if (!finalCoordinates) {
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

    updateListing.mutate(
      {
        id,
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
        latitude: finalCoordinates!.latitude,
        longitude: finalCoordinates!.longitude,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        area_sqm: validatedData.area_sqm,
        available_from: validatedData.available_from,
        available_until: validatedData.available_until,
        is_furnished: validatedData.is_furnished,
        allows_pets: validatedData.allows_pets,
        images: validatedData.images,
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
            title: 'Listing updated!',
            description: 'Your changes have been saved.',
          });
          navigate('/my-listings');
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to update listing. Please try again.',
          });
        },
      }
    );
  };

  if (!user) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Skeleton className="h-10 w-24 mb-6" />
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-48 mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Listing not found</h1>
            <p className="text-muted-foreground mb-6">This listing may have been removed or doesn't exist.</p>
            <Button onClick={() => navigate('/my-listings')}>Back to My Listings</Button>
          </div>
        </main>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Not authorized</h1>
            <p className="text-muted-foreground mb-6">You don't have permission to edit this listing.</p>
            <Button onClick={() => navigate('/my-listings')}>Back to My Listings</Button>
          </div>
        </main>
      </div>
    );
  }

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
            Edit listing
          </h1>
          <p className="text-muted-foreground mb-8">
            Update your property details
          </p>

          {/* Form Completion Checklist */}
          <FormCompletionChecklist items={checklistItems} />

          <form onSubmit={handleSubmit} className="space-y-8">
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
                latitude={manualCoordinates?.latitude ?? coordinates?.latitude ?? null}
                longitude={manualCoordinates?.longitude ?? coordinates?.longitude ?? null}
                status={manualCoordinates ? 'found' : geocodingStatus}
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

            {/* Building & Floor - for apartments */}
            {isApartmentType && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Building & Floor</h2>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField label="Floor Number" htmlFor="floor_number">
                    <Input
                      id="floor_number"
                      type="number"
                      min="0"
                      placeholder="3"
                      value={formData.floor_number}
                      onChange={(e) => handleChange('floor_number', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Total Floors" htmlFor="total_floors_building">
                    <Input
                      id="total_floors_building"
                      type="number"
                      min="1"
                      placeholder="5"
                      value={formData.total_floors_building}
                      onChange={(e) => handleChange('total_floors_building', e.target.value)}
                    />
                  </FormField>
                  <div className="flex items-end pb-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="has_elevator"
                        checked={formData.has_elevator}
                        onCheckedChange={(checked) => handleChange('has_elevator', checked)}
                      />
                      <Label htmlFor="has_elevator">Elevator</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Property Floors - for houses */}
            {isHouseType && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Property Floors</h2>
                <FormField label="Number of Floors" htmlFor="property_floors">
                  <Input
                    id="property_floors"
                    type="number"
                    min="1"
                    placeholder="2"
                    value={formData.property_floors}
                    onChange={(e) => handleChange('property_floors', e.target.value)}
                  />
                </FormField>
              </div>
            )}

            {/* Outdoor Features */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Outdoor Features</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="has_balcony"
                    checked={formData.has_balcony}
                    onCheckedChange={(checked) => handleChange('has_balcony', checked)}
                  />
                  <Label htmlFor="has_balcony">Balcony</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="has_terrace"
                    checked={formData.has_terrace}
                    onCheckedChange={(checked) => handleChange('has_terrace', checked)}
                  />
                  <Label htmlFor="has_terrace">Terrace</Label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="has_garden"
                  checked={formData.has_garden}
                  onCheckedChange={(checked) => handleChange('has_garden', checked)}
                />
                <Label htmlFor="has_garden">Garden</Label>
              </div>

              {formData.has_garden && (
                <FormField label="Garden Size (m²)" htmlFor="garden_sqm">
                  <Input
                    id="garden_sqm"
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formData.garden_sqm}
                    onChange={(e) => handleChange('garden_sqm', e.target.value)}
                  />
                </FormField>
              )}
            </div>

            {/* Parking */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Parking</h2>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="has_parking"
                  checked={formData.has_parking}
                  onCheckedChange={(checked) => handleChange('has_parking', checked)}
                />
                <Label htmlFor="has_parking">Parking Available</Label>
              </div>

              {formData.has_parking && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Parking Type" htmlFor="parking_type">
                    <Select
                      value={formData.parking_type}
                      onValueChange={(value) => handleChange('parking_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="street">Street Parking</SelectItem>
                        <SelectItem value="designated">Designated Spot</SelectItem>
                        <SelectItem value="underground">Underground</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Parking Spaces" htmlFor="parking_spaces">
                    <Input
                      id="parking_spaces"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={formData.parking_spaces}
                      onChange={(e) => handleChange('parking_spaces', e.target.value)}
                    />
                  </FormField>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="has_garage"
                  checked={formData.has_garage}
                  onCheckedChange={(checked) => handleChange('has_garage', checked)}
                />
                <Label htmlFor="has_garage">Garage</Label>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Amenities</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="has_storage"
                    checked={formData.has_storage}
                    onCheckedChange={(checked) => handleChange('has_storage', checked)}
                  />
                  <Label htmlFor="has_storage">Storage/Cellar</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="has_air_conditioning"
                    checked={formData.has_air_conditioning}
                    onCheckedChange={(checked) => handleChange('has_air_conditioning', checked)}
                  />
                  <Label htmlFor="has_air_conditioning">Air Conditioning</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="has_dishwasher"
                    checked={formData.has_dishwasher}
                    onCheckedChange={(checked) => handleChange('has_dishwasher', checked)}
                  />
                  <Label htmlFor="has_dishwasher">Dishwasher</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="has_washing_machine"
                    checked={formData.has_washing_machine}
                    onCheckedChange={(checked) => handleChange('has_washing_machine', checked)}
                  />
                  <Label htmlFor="has_washing_machine">Washing Machine</Label>
                </div>
              </div>
            </div>

            {/* Building Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Building Info</h2>
              
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
                      <SelectItem value="central">Central Heating</SelectItem>
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
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Year Built" htmlFor="year_built" error={getError('year_built')}>
                  <Input
                    id="year_built"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear() + 5}
                    placeholder="2010"
                    value={formData.year_built}
                    onChange={(e) => handleChange('year_built', e.target.value)}
                    onBlur={() => handleBlur('year_built')}
                    className={cn(getError('year_built') && 'border-destructive')}
                  />
                </FormField>

                <FormField label="Property Condition" htmlFor="property_condition">
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
            </div>

            {/* Rental Terms - only for rentals */}
            {isRental && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Rental Terms</h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Deposit Amount" htmlFor="deposit_amount" error={getError('deposit_amount')}>
                    <Input
                      id="deposit_amount"
                      type="number"
                      min="0"
                      placeholder="24000"
                      value={formData.deposit_amount}
                      onChange={(e) => handleChange('deposit_amount', e.target.value)}
                      onBlur={() => handleBlur('deposit_amount')}
                      className={cn(getError('deposit_amount') && 'border-destructive')}
                    />
                  </FormField>

                  <FormField label="Minimum Lease (months)" htmlFor="min_lease_months">
                    <Input
                      id="min_lease_months"
                      type="number"
                      min="1"
                      placeholder="12"
                      value={formData.min_lease_months}
                      onChange={(e) => handleChange('min_lease_months', e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Internet" htmlFor="internet_included">
                    <Select
                      value={formData.internet_included}
                      onValueChange={(value) => handleChange('internet_included', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Included</SelectItem>
                        <SelectItem value="no">Not Included</SelectItem>
                        <SelectItem value="available">Available (extra cost)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Utilities" htmlFor="utilities_included">
                    <Select
                      value={formData.utilities_included}
                      onValueChange={(value) => handleChange('utilities_included', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Included</SelectItem>
                        <SelectItem value="no">Not Included</SelectItem>
                        <SelectItem value="partial">Partially Included</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </div>
            )}

            {/* Images */}
            <div ref={imagesRef} className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Photos</h2>
              <p className="text-sm text-muted-foreground">
                Upload photos of your property. The first image will be the main photo.
              </p>
              
              <ImageUploader
                images={uploadedImages}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                onUpload={uploadImages}
                onRemove={removeImage}
                onReorder={reorderImages}
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/my-listings')}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePreviewClick}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('preview.previewButton')}
              </Button>
              <Button
                type="submit"
                disabled={updateListing.isPending || isUploading}
              >
                {updateListing.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
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
