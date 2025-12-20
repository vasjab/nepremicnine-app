import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateListing } from '@/hooks/useListings';
import { useAddressGeocoding } from '@/hooks/useAddressGeocoding';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { HoneypotField, isHoneypotTriggered } from '@/components/HoneypotField';
import { useRateLimit, LISTING_RATE_LIMIT } from '@/hooks/useRateLimit';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { type Currency } from '@/lib/exchangeRates';

import { WizardProgress, type WizardStep } from '@/components/wizard/WizardProgress';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { PropertyTypeStep } from '@/components/wizard/steps/PropertyTypeStep';
import { TitleStep } from '@/components/wizard/steps/TitleStep';
import { LocationStep } from '@/components/wizard/steps/LocationStep';
import { PriceStep } from '@/components/wizard/steps/PriceStep';
import { PhotosStep } from '@/components/wizard/steps/PhotosStep';
import { DetailsStep } from '@/components/wizard/steps/DetailsStep';
import { FeaturesStep } from '@/components/wizard/steps/FeaturesStep';
import { ReviewStep } from '@/components/wizard/steps/ReviewStep';

type PropertyType = 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'other';

const WIZARD_STEPS: WizardStep[] = [
  { id: 'type', title: 'Type', emoji: '🏠' },
  { id: 'title', title: 'Title', emoji: '✨' },
  { id: 'location', title: 'Location', emoji: '📍' },
  { id: 'price', title: 'Price', emoji: '💰' },
  { id: 'photos', title: 'Photos', emoji: '📸' },
  { id: 'details', title: 'Details', emoji: '📝', isOptional: true },
  { id: 'features', title: 'Features', emoji: '⭐', isOptional: true },
  { id: 'review', title: 'Review', emoji: '🎉' },
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createListing = useCreateListing();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [honeypot, setHoneypot] = useState('');
  const { checkRateLimit, isLimited, remainingTime } = useRateLimit(LISTING_RATE_LIMIT);

  const { images, isUploading, uploadProgress, uploadImages, removeImage, reorderImages } = useImageUpload({ userId: user?.id || '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    listing_type: 'rent' as 'rent' | 'sale',
    property_type: 'apartment' as PropertyType,
    price: '',
    currency: 'SEK' as Currency,
    country: 'Sweden',
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
    has_elevator: false,
    has_balcony: false,
    has_terrace: false,
    has_garden: false,
    has_parking: false,
    has_garage: false,
    has_air_conditioning: false,
    has_dishwasher: false,
    has_washing_machine: false,
    has_storage: false,
  });

  const [manualCoordinates, setManualCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { coordinates, isGeocoding, status: geocodingStatus } = useAddressGeocoding({
    address: formData.address,
    city: formData.city,
    postalCode: formData.postal_code,
    country: formData.country,
  });

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return !!formData.property_type;
      case 1: return formData.title.length >= 5;
      case 2: return !!formData.address && !!formData.city && !!(coordinates || manualCoordinates);
      case 3: return !!formData.price && parseFloat(formData.price) > 0;
      case 4: return images.length > 0;
      case 5: return true;
      case 6: return true;
      case 7: return formData.title.length >= 5 && !!formData.price && !!(coordinates || manualCoordinates) && images.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkip = () => {
    setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (index: number) => {
    if (completedSteps.has(index) || index <= currentStep) {
      setCurrentStep(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const checkServerRateLimit = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      const { data, error } = await supabase.functions.invoke('check-rate-limit', {
        body: { identifier: user.id, action: 'create_listing' },
      });
      if (error) return true;
      return data?.allowed !== false;
    } catch {
      return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (isHoneypotTriggered(honeypot)) {
      await new Promise(r => setTimeout(r, 2000));
      toast({ title: 'Listing created!', description: 'Your property is now live.' });
      return;
    }
    if (!checkRateLimit()) {
      toast({ variant: 'destructive', title: 'Too many listings', description: `Please wait ${Math.ceil(remainingTime / 60)} minutes.` });
      return;
    }
    const serverAllowed = await checkServerRateLimit();
    if (!serverAllowed) {
      toast({ variant: 'destructive', title: 'Too many listings', description: 'Please wait before creating more.' });
      return;
    }

    const finalCoords = manualCoordinates || coordinates;
    if (!finalCoords) {
      toast({ variant: 'destructive', title: 'Error', description: 'Location not found.' });
      return;
    }

    createListing.mutate({
      user_id: user.id,
      title: formData.title,
      description: formData.description || null,
      listing_type: formData.listing_type,
      property_type: formData.property_type,
      price: parseFloat(formData.price),
      currency: formData.currency,
      address: formData.address,
      city: formData.city,
      postal_code: formData.postal_code || null,
      country: formData.country,
      latitude: finalCoords.latitude,
      longitude: finalCoords.longitude,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 1,
      area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
      available_from: formData.listing_type === 'rent' ? (formData.available_from || null) : null,
      available_until: formData.listing_type === 'rent' ? (formData.available_until || null) : null,
      is_furnished: formData.is_furnished,
      allows_pets: formData.allows_pets,
      images: images.map(img => img.url),
      is_active: true,
      has_elevator: formData.has_elevator,
      has_balcony: formData.has_balcony,
      has_terrace: formData.has_terrace,
      has_garden: formData.has_garden,
      has_parking: formData.has_parking,
      has_garage: formData.has_garage,
      has_air_conditioning: formData.has_air_conditioning,
      has_dishwasher: formData.has_dishwasher,
      has_washing_machine: formData.has_washing_machine,
      has_storage: formData.has_storage,
    }, {
      onSuccess: () => {
        toast({ title: '🎉 Listing created!', description: 'Your property is now live.' });
        navigate('/my-listings');
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to create listing.' });
      },
    });
  };

  if (!user) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PropertyTypeStep
            propertyType={formData.property_type}
            listingType={formData.listing_type}
            onPropertyTypeChange={v => handleChange('property_type', v)}
            onListingTypeChange={v => handleChange('listing_type', v)}
          />
        );
      case 1:
        return <TitleStep title={formData.title} onTitleChange={v => handleChange('title', v)} error={errors.title} />;
      case 2:
        return (
          <LocationStep
            country={formData.country}
            city={formData.city}
            address={formData.address}
            postalCode={formData.postal_code}
            coordinates={coordinates}
            manualCoordinates={manualCoordinates}
            isGeocoding={isGeocoding}
            geocodingStatus={geocodingStatus}
            onCountryChange={v => handleChange('country', v)}
            onCityChange={v => handleChange('city', v)}
            onAddressChange={v => handleChange('address', v)}
            onPostalCodeChange={v => handleChange('postal_code', v)}
            onAddressSelect={s => { handleChange('address', s.address); if (s.city) handleChange('city', s.city); if (s.postalCode) handleChange('postal_code', s.postalCode); setManualCoordinates(null); }}
            onCoordinatesChange={(lat, lng) => setManualCoordinates({ latitude: lat, longitude: lng })}
            onResetLocation={() => setManualCoordinates(null)}
            errors={{ city: errors.city, address: errors.address }}
          />
        );
      case 3:
        return (
          <PriceStep
            price={formData.price}
            currency={formData.currency}
            listingType={formData.listing_type}
            onPriceChange={v => handleChange('price', v)}
            onCurrencyChange={v => handleChange('currency', v)}
            error={errors.price}
          />
        );
      case 4:
        return <PhotosStep images={images} isUploading={isUploading} uploadProgress={uploadProgress} onUpload={uploadImages} onRemove={removeImage} onReorder={reorderImages} disabled={!user} />;
      case 5:
        return (
          <DetailsStep
            description={formData.description}
            bedrooms={formData.bedrooms}
            bathrooms={formData.bathrooms}
            areaSqm={formData.area_sqm}
            availableFrom={formData.available_from}
            availableUntil={formData.available_until}
            isFurnished={formData.is_furnished}
            allowsPets={formData.allows_pets}
            listingType={formData.listing_type}
            onDescriptionChange={v => handleChange('description', v)}
            onBedroomsChange={v => handleChange('bedrooms', v)}
            onBathroomsChange={v => handleChange('bathrooms', v)}
            onAreaChange={v => handleChange('area_sqm', v)}
            onAvailableFromChange={v => handleChange('available_from', v)}
            onAvailableUntilChange={v => handleChange('available_until', v)}
            onFurnishedChange={v => handleChange('is_furnished', v)}
            onPetsChange={v => handleChange('allows_pets', v)}
          />
        );
      case 6:
        return (
          <FeaturesStep
            hasElevator={formData.has_elevator}
            hasBalcony={formData.has_balcony}
            hasTerrace={formData.has_terrace}
            hasGarden={formData.has_garden}
            hasParking={formData.has_parking}
            hasGarage={formData.has_garage}
            hasAirConditioning={formData.has_air_conditioning}
            hasDishwasher={formData.has_dishwasher}
            hasWashingMachine={formData.has_washing_machine}
            hasStorage={formData.has_storage}
            propertyType={formData.property_type}
            onFeatureToggle={(f, v) => handleChange(f, v)}
          />
        );
      case 7:
        return <ReviewStep formData={formData} images={images} hasValidLocation={!!(coordinates || manualCoordinates)} onEditStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <WizardProgress steps={WIZARD_STEPS} currentStep={currentStep} onStepClick={handleStepClick} completedSteps={completedSteps} />

          <div className="mt-8 max-w-3xl mx-auto">
            <HoneypotField value={honeypot} onChange={setHoneypot} />
            {renderStep()}
          </div>
        </div>
      </main>

      <WizardNavigation
        currentStep={currentStep}
        totalSteps={WIZARD_STEPS.length}
        canProceed={canProceed()}
        isOptionalStep={WIZARD_STEPS[currentStep]?.isOptional || false}
        isSubmitting={createListing.isPending}
        onBack={handleBack}
        onNext={handleNext}
        onSkip={handleSkip}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
