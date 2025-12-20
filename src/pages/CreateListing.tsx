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
import { useFloorPlanUpload } from '@/hooks/useFloorPlanUpload';
import { supabase } from '@/integrations/supabase/client';
import { type Currency } from '@/lib/exchangeRates';
import { ListingPreviewModal } from '@/components/ListingPreviewModal';

import { WizardProgress, type WizardStep } from '@/components/wizard/WizardProgress';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { PropertyTypeStep } from '@/components/wizard/steps/PropertyTypeStep';
import { TitleStep } from '@/components/wizard/steps/TitleStep';
import { LocationStep } from '@/components/wizard/steps/LocationStep';
import { PriceStep } from '@/components/wizard/steps/PriceStep';
import { PhotosStep } from '@/components/wizard/steps/PhotosStep';
import { FloorPlansStep } from '@/components/wizard/steps/FloorPlansStep';
import { DetailsStep } from '@/components/wizard/steps/DetailsStep';
import { BuildingFeaturesStep } from '@/components/wizard/steps/BuildingFeaturesStep';
import { EquipmentStep } from '@/components/wizard/steps/EquipmentStep';
import { BuildingInfoStep } from '@/components/wizard/steps/BuildingInfoStep';
import { RentalTermsStep } from '@/components/wizard/steps/RentalTermsStep';
import { ReviewStep } from '@/components/wizard/steps/ReviewStep';

type PropertyType = 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'summer_house' | 'other';
type HouseType = 'detached' | 'semi_detached' | 'terraced' | 'end_terrace' | 'bungalow' | '';

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createListing = useCreateListing();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [honeypot, setHoneypot] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const { checkRateLimit, isLimited, remainingTime } = useRateLimit(LISTING_RATE_LIMIT);

  const { images, isUploading, uploadProgress, uploadImages, removeImage, reorderImages } = useImageUpload({ userId: user?.id || '' });
  const { floorPlans, isUploading: isUploadingFloorPlans, uploadProgress: floorPlanProgress, uploadFloorPlans, removeFloorPlan, reorderFloorPlans } = useFloorPlanUpload({ userId: user?.id || '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    listing_type: 'rent' as 'rent' | 'sale',
    property_type: 'apartment' as PropertyType,
    property_type_other: '',
    house_type: '' as HouseType,
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
    move_in_immediately: true,
    // Building features
    has_elevator: false,
    has_balcony: false,
    balcony_sqm: '',
    has_terrace: false,
    terrace_sqm: '',
    has_garden: false,
    garden_sqm: '',
    has_parking: false,
    parking_type: '',
    parking_spaces: '',
    has_garage: false,
    has_storage: false,
    has_fireplace: false,
    // Equipment
    has_air_conditioning: false,
    has_dishwasher: false,
    has_washing_machine: false,
    has_dryer: false,
    // Building info
    floor_number: '',
    total_floors_building: '',
    property_floors: '',
    heating_type: '',
    heating_type_other: '',
    energy_rating: '',
    year_built: '',
    property_condition: '',
    // Rental terms
    deposit_amount: '',
    min_lease_months: '',
    internet_included: '',
    utilities_included: '',
    utility_cost_estimate: '',
    // Sale expenses
    monthly_expenses: '',
  });

  const [manualCoordinates, setManualCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { coordinates, isGeocoding, status: geocodingStatus } = useAddressGeocoding({
    address: formData.address,
    city: formData.city,
    postalCode: formData.postal_code,
    country: formData.country,
  });

  // Dynamic steps based on listing type
  const getWizardSteps = (): WizardStep[] => {
    const baseSteps: WizardStep[] = [
      { id: 'type', title: 'Type', emoji: '🏠' },
      { id: 'title', title: 'Title', emoji: '✨' },
      { id: 'location', title: 'Location', emoji: '📍' },
      { id: 'price', title: 'Price', emoji: '💰' },
      { id: 'photos', title: 'Photos', emoji: '📸', isOptional: true },
      { id: 'floorplans', title: 'Floor Plans', emoji: '📐', isOptional: true },
      { id: 'details', title: 'Details', emoji: '📝', isOptional: true },
      { id: 'building_features', title: 'Building', emoji: '🏗️', isOptional: true },
      { id: 'equipment', title: 'Equipment', emoji: '🔌', isOptional: true },
      { id: 'building_info', title: 'Info', emoji: '📊', isOptional: true },
    ];
    
    // Add rental terms step only for rentals
    if (formData.listing_type === 'rent') {
      baseSteps.push({ id: 'rental', title: 'Terms', emoji: '📋', isOptional: true });
    } else {
      baseSteps.push({ id: 'sale_costs', title: 'Costs', emoji: '💵', isOptional: true });
    }
    
    baseSteps.push({ id: 'review', title: 'Review', emoji: '🎉' });
    
    return baseSteps;
  };

  const WIZARD_STEPS = getWizardSteps();

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  // Check if mandatory fields for preview are complete
  const canPreview = (): boolean => {
    const hasPropertyType = !!formData.property_type;
    const hasTitle = formData.title.length >= 5;
    const hasLocation = !!formData.address && !!formData.city && !!(coordinates || manualCoordinates);
    const hasPrice = !!formData.price && parseFloat(formData.price) > 0;
    return hasPropertyType && hasTitle && hasLocation && hasPrice; // Photos no longer required
  };

  const canProceed = (): boolean => {
    const stepId = WIZARD_STEPS[currentStep]?.id;
    switch (stepId) {
      case 'type': return !!formData.property_type;
      case 'title': return formData.title.length >= 5;
      case 'location': return !!formData.address && !!formData.city && !!(coordinates || manualCoordinates);
      case 'price': return !!formData.price && parseFloat(formData.price) > 0;
      case 'photos': return true; // Now optional
      case 'floorplans': return true;
      case 'details': return true;
      case 'building_features': return true;
      case 'equipment': return true;
      case 'building_info': return true;
      case 'rental': return true;
      case 'sale_costs': return true;
      case 'review': return formData.title.length >= 5 && !!formData.price && !!(coordinates || manualCoordinates);
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
      property_type: formData.property_type as 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'other',
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
      floor_plan_urls: floorPlans.map(fp => fp.url),
      is_active: true,
      // Features
      has_elevator: formData.has_elevator,
      has_balcony: formData.has_balcony,
      balcony_sqm: formData.balcony_sqm ? parseFloat(formData.balcony_sqm) : null,
      has_terrace: formData.has_terrace,
      terrace_sqm: formData.terrace_sqm ? parseFloat(formData.terrace_sqm) : null,
      has_garden: formData.has_garden,
      garden_sqm: formData.garden_sqm ? parseFloat(formData.garden_sqm) : null,
      has_parking: formData.has_parking,
      parking_type: (formData.parking_type || null) as 'street' | 'designated' | 'underground' | 'private' | null,
      parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
      has_garage: formData.has_garage,
      has_air_conditioning: formData.has_air_conditioning,
      has_dishwasher: formData.has_dishwasher,
      has_washing_machine: formData.has_washing_machine,
      has_storage: formData.has_storage,
      // Building info
      floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
      total_floors_building: formData.total_floors_building ? parseInt(formData.total_floors_building) : null,
      property_floors: formData.property_floors ? parseInt(formData.property_floors) : null,
      heating_type: (formData.heating_type || null) as 'central' | 'electric' | 'gas' | 'heat_pump' | 'other' | null,
      energy_rating: (formData.energy_rating || null) as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      property_condition: (formData.property_condition || null) as 'new' | 'renovated' | 'good' | 'needs_work' | null,
      // Rental terms
      deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
      min_lease_months: formData.min_lease_months ? parseInt(formData.min_lease_months) : null,
      internet_included: (formData.internet_included || null) as 'yes' | 'no' | 'available' | null,
      utilities_included: (formData.utilities_included || null) as 'yes' | 'no' | 'partial' | null,
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
    const stepId = WIZARD_STEPS[currentStep]?.id;
    switch (stepId) {
      case 'type':
        return (
          <PropertyTypeStep
            propertyType={formData.property_type}
            listingType={formData.listing_type}
            propertyTypeOther={formData.property_type_other}
            onPropertyTypeChange={v => handleChange('property_type', v)}
            onListingTypeChange={v => handleChange('listing_type', v)}
            onPropertyTypeOtherChange={v => handleChange('property_type_other', v)}
          />
        );
      case 'title':
        return <TitleStep title={formData.title} onTitleChange={v => handleChange('title', v)} error={errors.title} />;
      case 'location':
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
      case 'price':
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
      case 'photos':
        return <PhotosStep images={images} isUploading={isUploading} uploadProgress={uploadProgress} onUpload={uploadImages} onRemove={removeImage} onReorder={reorderImages} disabled={!user} />;
      case 'details':
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
      case 'features':
        return (
          <FeaturesStep
            hasElevator={formData.has_elevator}
            hasBalcony={formData.has_balcony}
            balconySqm={formData.balcony_sqm}
            hasTerrace={formData.has_terrace}
            terraceSqm={formData.terrace_sqm}
            hasGarden={formData.has_garden}
            gardenSqm={formData.garden_sqm}
            hasParking={formData.has_parking}
            parkingType={formData.parking_type}
            parkingSpaces={formData.parking_spaces}
            hasGarage={formData.has_garage}
            hasAirConditioning={formData.has_air_conditioning}
            hasDishwasher={formData.has_dishwasher}
            hasWashingMachine={formData.has_washing_machine}
            hasStorage={formData.has_storage}
            propertyType={formData.property_type}
            onFeatureToggle={(f, v) => handleChange(f, v)}
            onChange={handleChange}
          />
        );
      case 'building':
        return (
          <BuildingInfoStep
            floorNumber={formData.floor_number}
            totalFloorsBuilding={formData.total_floors_building}
            propertyFloors={formData.property_floors}
            heatingType={formData.heating_type}
            heatingTypeOther={formData.heating_type_other}
            energyRating={formData.energy_rating}
            yearBuilt={formData.year_built}
            propertyCondition={formData.property_condition}
            propertyType={formData.property_type}
            onChange={handleChange}
          />
        );
      case 'rental':
        return (
          <RentalTermsStep
            depositAmount={formData.deposit_amount}
            minLeaseMonths={formData.min_lease_months}
            internetIncluded={formData.internet_included}
            utilitiesIncluded={formData.utilities_included}
            currency={formData.currency}
            onChange={handleChange}
          />
        );
      case 'review':
        return <ReviewStep formData={formData} images={images} hasValidLocation={!!(coordinates || manualCoordinates)} onEditStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  // Convert formData to preview format
  const previewFormData = {
    ...formData,
    floor_number: formData.floor_number,
    total_floors_building: formData.total_floors_building,
    property_floors: formData.property_floors,
    balcony_sqm: formData.balcony_sqm,
    terrace_sqm: formData.terrace_sqm,
    garden_sqm: formData.garden_sqm,
    parking_type: formData.parking_type,
    parking_spaces: formData.parking_spaces,
    heating_type: formData.heating_type,
    energy_rating: formData.energy_rating,
    year_built: formData.year_built,
    property_condition: formData.property_condition,
    deposit_amount: formData.deposit_amount,
    min_lease_months: formData.min_lease_months,
    internet_included: formData.internet_included,
    utilities_included: formData.utilities_included,
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
        canPreview={canPreview()}
        onBack={handleBack}
        onNext={handleNext}
        onSkip={handleSkip}
        onSubmit={handleSubmit}
        onPreview={() => setShowPreview(true)}
      />

      <ListingPreviewModal
        formData={previewFormData}
        uploadedImages={images}
        coordinates={manualCoordinates || coordinates}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
