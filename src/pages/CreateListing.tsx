import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateListing, useUpdateListing, useListing } from '@/hooks/useListings';
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
import { HouseTypeStep } from '@/components/wizard/steps/HouseTypeStep';
import { TitleStep } from '@/components/wizard/steps/TitleStep';
import { LocationStep } from '@/components/wizard/steps/LocationStep';
import { PriceStep } from '@/components/wizard/steps/PriceStep';
import { PhotosStep } from '@/components/wizard/steps/PhotosStep';
import { FloorPlansStep } from '@/components/wizard/steps/FloorPlansStep';
import { DetailsStep } from '@/components/wizard/steps/DetailsStep';
import { OutdoorFeaturesStep } from '@/components/wizard/steps/OutdoorFeaturesStep';
import { ParkingStorageStep } from '@/components/wizard/steps/ParkingStorageStep';
import { BuildingAmenitiesStep } from '@/components/wizard/steps/BuildingAmenitiesStep';
import { EnergyComfortStep } from '@/components/wizard/steps/EnergyComfortStep';
import { EquipmentStep } from '@/components/wizard/steps/EquipmentStep';
import { InteriorHighlightsStep } from '@/components/wizard/steps/InteriorHighlightsStep';
import { BuildingInfoStep } from '@/components/wizard/steps/BuildingInfoStep';
import { RentalTermsStep } from '@/components/wizard/steps/RentalTermsStep';
import { SaleCostsStep } from '@/components/wizard/steps/SaleCostsStep';
import { ReviewStep } from '@/components/wizard/steps/ReviewStep';

type PropertyType = 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'summer_house' | 'other';
type HouseType = 'detached' | 'semi_detached' | 'terraced' | 'end_terrace' | 'bungalow' | '';

export default function CreateListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get('resume');
  const { user } = useAuth();
  const { toast } = useToast();
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  
  // Fetch draft if resuming
  const { data: draftListing, isLoading: isDraftLoading } = useListing(resumeId || undefined);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [honeypot, setHoneypot] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { checkRateLimit, isLimited, remainingTime } = useRateLimit(LISTING_RATE_LIMIT);

  const { images, isUploading, uploadProgress, uploadImages, removeImage, reorderImages, setImages } = useImageUpload({ userId: user?.id || '' });
  const { floorPlans, isUploading: isUploadingFloorPlans, uploadProgress: floorPlanProgress, uploadFloorPlans, removeFloorPlan, reorderFloorPlans, setFloorPlans } = useFloorPlanUpload({ userId: user?.id || '' });

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
    furnished_details: '',
    allows_pets: false,
    pets_details: '',
    move_in_immediately: true,
    // Outdoor features
    has_balcony: false,
    balcony_sqm: '',
    has_terrace: false,
    terrace_sqm: '',
    has_rooftop_terrace: false,
    has_garden: false,
    garden_sqm: '',
    has_bbq_area: false,
    has_playground: false,
    has_waterfront: false,
    has_view: false,
    view_type: '',
    // Parking & Storage
    has_parking: false,
    parking_type: '',
    parking_spaces: '',
    has_garage: false,
    has_carport: false,
    has_ev_charging: false,
    has_bicycle_storage: false,
    has_storage: false,
    has_basement: false,
    // Building amenities
    has_elevator: false,
    has_shared_laundry: false,
    has_gym: false,
    has_sauna: false,
    has_pool: false,
    has_common_room: false,
    has_concierge: false,
    has_security: false,
    // Energy & Comfort
    has_fireplace: false,
    has_floor_heating: false,
    has_district_heating: false,
    has_heat_pump: false,
    has_air_conditioning: false,
    has_ventilation: false,
    has_solar_panels: false,
    // Equipment
    has_dishwasher: false,
    has_washing_machine: false,
    has_dryer: false,
    // Interior Highlights
    has_high_ceilings: false,
    has_large_windows: false,
    has_smart_home: false,
    has_built_in_wardrobes: false,
    orientation: '',
    // Accessibility
    has_step_free_access: false,
    has_wheelchair_accessible: false,
    has_wide_doorways: false,
    has_ground_floor_access: false,
    has_elevator_from_garage: false,
    // Safety & Privacy
    has_secure_entrance: false,
    has_intercom: false,
    has_gated_community: false,
    has_fire_safety: false,
    has_soundproofing: false,
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

  // Dynamic steps based on listing type and property type
  const getWizardSteps = (): WizardStep[] => {
    const steps: WizardStep[] = [
      { id: 'type', title: 'Type', emoji: '🏠' },
    ];
    
    // Add house type step only for house/summer_house
    if (formData.property_type === 'house' || formData.property_type === 'summer_house') {
      steps.push({ id: 'house_type', title: 'Style', emoji: '🏡' });
    }
    
    steps.push(
      { id: 'title', title: 'Title', emoji: '✨' },
      { id: 'location', title: 'Location', emoji: '📍' },
      { id: 'price', title: 'Price', emoji: '💰' },
      { id: 'photos', title: 'Photos', emoji: '📸', isOptional: true },
      { id: 'floorplans', title: 'Floor Plans', emoji: '📐', isOptional: true },
      { id: 'details', title: 'Details', emoji: '📝', isOptional: true },
      { id: 'outdoor', title: 'Outdoor', emoji: '🌳', isOptional: true },
      { id: 'parking', title: 'Parking', emoji: '🚗', isOptional: true },
    );
    
    // Add building amenities only for apartments/studios/rooms
    if (['apartment', 'studio', 'room'].includes(formData.property_type)) {
      steps.push({ id: 'amenities', title: 'Amenities', emoji: '🏢', isOptional: true });
    }
    
    steps.push(
      { id: 'energy', title: 'Energy', emoji: '⚡', isOptional: true },
      { id: 'equipment', title: 'Equipment', emoji: '🔌', isOptional: true },
      { id: 'interior', title: 'Interior', emoji: '✨', isOptional: true },
      { id: 'building_info', title: 'Info', emoji: '📊', isOptional: true },
    );
    
    // Add rental terms step only for rentals
    if (formData.listing_type === 'rent') {
      steps.push({ id: 'rental', title: 'Terms', emoji: '📋', isOptional: true });
    } else {
      steps.push({ id: 'sale_costs', title: 'Costs', emoji: '💵', isOptional: true });
    }
    
    steps.push({ id: 'review', title: 'Review', emoji: '🎉' });
    
    return steps;
  };

  const WIZARD_STEPS = getWizardSteps();

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  // Populate form when resuming a draft
  useEffect(() => {
    if (draftListing && !isFormInitialized) {
      setFormData({
        title: draftListing.title || '',
        description: draftListing.description || '',
        listing_type: draftListing.listing_type || 'rent',
        property_type: (draftListing.property_type || 'apartment') as any,
        property_type_other: '',
        house_type: (draftListing as any).house_type || '',
        price: draftListing.price?.toString() || '',
        currency: (draftListing.currency as Currency) || 'SEK',
        country: draftListing.country || 'Sweden',
        address: draftListing.address || '',
        city: draftListing.city || '',
        postal_code: draftListing.postal_code || '',
        bedrooms: draftListing.bedrooms?.toString() || '1',
        bathrooms: draftListing.bathrooms?.toString() || '1',
        area_sqm: draftListing.area_sqm?.toString() || '',
        available_from: draftListing.available_from || '',
        available_until: draftListing.available_until || '',
        is_furnished: draftListing.is_furnished || false,
        furnished_details: (draftListing as any).furnished_details || '',
        allows_pets: draftListing.allows_pets || false,
        pets_details: (draftListing as any).pets_details || '',
        move_in_immediately: (draftListing as any).move_in_immediately ?? true,
        // Outdoor features
        has_balcony: draftListing.has_balcony || false,
        balcony_sqm: draftListing.balcony_sqm?.toString() || '',
        has_terrace: draftListing.has_terrace || false,
        terrace_sqm: draftListing.terrace_sqm?.toString() || '',
        has_rooftop_terrace: (draftListing as any).has_rooftop_terrace || false,
        has_garden: draftListing.has_garden || false,
        garden_sqm: draftListing.garden_sqm?.toString() || '',
        has_bbq_area: (draftListing as any).has_bbq_area || false,
        has_playground: (draftListing as any).has_playground || false,
        has_waterfront: (draftListing as any).has_waterfront || false,
        has_view: (draftListing as any).has_view || false,
        view_type: (draftListing as any).view_type || '',
        // Parking & Storage
        has_parking: draftListing.has_parking || false,
        parking_type: draftListing.parking_type || '',
        parking_spaces: draftListing.parking_spaces?.toString() || '',
        has_garage: draftListing.has_garage || false,
        has_carport: (draftListing as any).has_carport || false,
        has_ev_charging: (draftListing as any).has_ev_charging || false,
        has_bicycle_storage: (draftListing as any).has_bicycle_storage || false,
        has_storage: draftListing.has_storage || false,
        has_basement: (draftListing as any).has_basement || false,
        // Building amenities
        has_elevator: draftListing.has_elevator || false,
        has_shared_laundry: (draftListing as any).has_shared_laundry || false,
        has_gym: (draftListing as any).has_gym || false,
        has_sauna: (draftListing as any).has_sauna || false,
        has_pool: (draftListing as any).has_pool || false,
        has_common_room: (draftListing as any).has_common_room || false,
        has_concierge: (draftListing as any).has_concierge || false,
        has_security: (draftListing as any).has_security || false,
        // Energy & Comfort
        has_fireplace: (draftListing as any).has_fireplace || false,
        has_floor_heating: (draftListing as any).has_floor_heating || false,
        has_district_heating: (draftListing as any).has_district_heating || false,
        has_heat_pump: (draftListing as any).has_heat_pump || false,
        has_air_conditioning: draftListing.has_air_conditioning || false,
        has_ventilation: (draftListing as any).has_ventilation || false,
        has_solar_panels: (draftListing as any).has_solar_panels || false,
        // Equipment
        has_dishwasher: draftListing.has_dishwasher || false,
        has_washing_machine: draftListing.has_washing_machine || false,
        has_dryer: (draftListing as any).has_dryer || false,
        // Interior Highlights
        has_high_ceilings: (draftListing as any).has_high_ceilings || false,
        has_large_windows: (draftListing as any).has_large_windows || false,
        has_smart_home: (draftListing as any).has_smart_home || false,
        has_built_in_wardrobes: (draftListing as any).has_built_in_wardrobes || false,
        orientation: (draftListing as any).orientation || '',
        // Accessibility
        has_step_free_access: (draftListing as any).has_step_free_access || false,
        has_wheelchair_accessible: (draftListing as any).has_wheelchair_accessible || false,
        has_wide_doorways: (draftListing as any).has_wide_doorways || false,
        has_ground_floor_access: (draftListing as any).has_ground_floor_access || false,
        has_elevator_from_garage: (draftListing as any).has_elevator_from_garage || false,
        // Safety & Privacy
        has_secure_entrance: (draftListing as any).has_secure_entrance || false,
        has_intercom: (draftListing as any).has_intercom || false,
        has_gated_community: (draftListing as any).has_gated_community || false,
        has_fire_safety: (draftListing as any).has_fire_safety || false,
        has_soundproofing: (draftListing as any).has_soundproofing || false,
        // Building info
        floor_number: draftListing.floor_number?.toString() || '',
        total_floors_building: draftListing.total_floors_building?.toString() || '',
        property_floors: draftListing.property_floors?.toString() || '',
        heating_type: draftListing.heating_type || '',
        heating_type_other: '',
        energy_rating: draftListing.energy_rating || '',
        year_built: draftListing.year_built?.toString() || '',
        property_condition: draftListing.property_condition || '',
        // Rental terms
        deposit_amount: draftListing.deposit_amount?.toString() || '',
        min_lease_months: draftListing.min_lease_months?.toString() || '',
        internet_included: draftListing.internet_included || '',
        utilities_included: draftListing.utilities_included || '',
        utility_cost_estimate: (draftListing as any).utility_cost_estimate?.toString() || '',
        // Sale expenses
        monthly_expenses: (draftListing as any).monthly_expenses?.toString() || '',
      });
      
      // Set coordinates
      if (draftListing.latitude && draftListing.longitude) {
        setManualCoordinates({ latitude: draftListing.latitude, longitude: draftListing.longitude });
      }
      
      // Set images
      if (draftListing.images && draftListing.images.length > 0) {
        setImages(draftListing.images.map((url, index) => ({
          id: `existing-${index}`,
          url,
          name: `Image ${index + 1}`,
          size: 0,
        })));
      }
      
      // Set floor plans
      if (draftListing.floor_plan_urls && draftListing.floor_plan_urls.length > 0) {
        setFloorPlans(draftListing.floor_plan_urls.map((url, index) => ({
          id: `existing-fp-${index}`,
          url,
          name: `Floor Plan ${index + 1}`,
          size: 0,
        })));
      }
      
      // Resume at saved step
      if ((draftListing as any).current_step) {
        setCurrentStep((draftListing as any).current_step);
      }
      
      setIsFormInitialized(true);
    }
  }, [draftListing, isFormInitialized, setImages, setFloorPlans]);

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
      case 'house_type': return !!formData.house_type;
      case 'title': return formData.title.length >= 5;
      case 'location': return !!formData.address && !!formData.city && !!(coordinates || manualCoordinates);
      case 'price': return !!formData.price && parseFloat(formData.price) > 0;
      case 'photos': return true; // Now optional
      case 'floorplans': return true;
      case 'details': return true;
      case 'outdoor': return true;
      case 'parking': return true;
      case 'amenities': return true;
      case 'energy': return true;
      case 'equipment': return true;
      case 'interior': return true;
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

  // Build the complete listing data
  const buildListingData = (isDraft: boolean = false) => {
    const finalCoords = manualCoordinates || coordinates;
    return {
      user_id: user!.id,
      title: formData.title || 'Draft Listing',
      description: formData.description || null,
      listing_type: formData.listing_type,
      property_type: (formData.property_type === 'summer_house' ? 'house' : formData.property_type) as 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'other',
      price: parseFloat(formData.price) || 0,
      currency: formData.currency,
      address: formData.address || 'Draft Address',
      city: formData.city || 'Draft City',
      postal_code: formData.postal_code || null,
      country: formData.country,
      latitude: finalCoords?.latitude || 0,
      longitude: finalCoords?.longitude || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 1,
      area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
      available_from: formData.listing_type === 'rent' && !formData.move_in_immediately ? (formData.available_from || null) : null,
      available_until: formData.listing_type === 'rent' ? (formData.available_until || null) : null,
      is_furnished: formData.is_furnished,
      furnished_details: formData.furnished_details || null,
      allows_pets: formData.allows_pets,
      pets_details: formData.pets_details || null,
      move_in_immediately: formData.move_in_immediately,
      images: images.map(img => img.url),
      floor_plan_urls: floorPlans.map(fp => fp.url),
      is_active: !isDraft,
      is_draft: isDraft,
      current_step: isDraft ? currentStep : null,
      // Outdoor features
      has_balcony: formData.has_balcony,
      balcony_sqm: formData.balcony_sqm ? parseFloat(formData.balcony_sqm) : null,
      has_terrace: formData.has_terrace,
      terrace_sqm: formData.terrace_sqm ? parseFloat(formData.terrace_sqm) : null,
      has_rooftop_terrace: formData.has_rooftop_terrace,
      has_garden: formData.has_garden,
      garden_sqm: formData.garden_sqm ? parseFloat(formData.garden_sqm) : null,
      has_bbq_area: formData.has_bbq_area,
      has_playground: formData.has_playground,
      has_waterfront: formData.has_waterfront,
      has_view: formData.has_view,
      view_type: formData.view_type || null,
      // Parking & Storage
      has_parking: formData.has_parking,
      parking_type: (formData.parking_type || null) as 'street' | 'designated' | 'underground' | 'private' | null,
      parking_spaces: formData.parking_spaces ? parseInt(formData.parking_spaces) : null,
      has_garage: formData.has_garage,
      has_carport: formData.has_carport,
      has_ev_charging: formData.has_ev_charging,
      has_bicycle_storage: formData.has_bicycle_storage,
      has_storage: formData.has_storage,
      has_basement: formData.has_basement,
      // Building amenities
      has_elevator: formData.has_elevator,
      has_shared_laundry: formData.has_shared_laundry,
      has_gym: formData.has_gym,
      has_sauna: formData.has_sauna,
      has_pool: formData.has_pool,
      has_common_room: formData.has_common_room,
      has_concierge: formData.has_concierge,
      has_security: formData.has_security,
      // Energy & Comfort
      has_fireplace: formData.has_fireplace,
      has_floor_heating: formData.has_floor_heating,
      has_district_heating: formData.has_district_heating,
      has_heat_pump: formData.has_heat_pump,
      has_air_conditioning: formData.has_air_conditioning,
      has_ventilation: formData.has_ventilation,
      has_solar_panels: formData.has_solar_panels,
      // Equipment
      has_dishwasher: formData.has_dishwasher,
      has_washing_machine: formData.has_washing_machine,
      has_dryer: formData.has_dryer,
      // Interior Highlights
      has_high_ceilings: formData.has_high_ceilings,
      has_large_windows: formData.has_large_windows,
      has_smart_home: formData.has_smart_home,
      has_built_in_wardrobes: formData.has_built_in_wardrobes,
      orientation: formData.orientation || null,
      // Accessibility
      has_step_free_access: formData.has_step_free_access,
      has_wheelchair_accessible: formData.has_wheelchair_accessible,
      has_wide_doorways: formData.has_wide_doorways,
      has_ground_floor_access: formData.has_ground_floor_access,
      has_elevator_from_garage: formData.has_elevator_from_garage,
      // Safety & Privacy
      has_secure_entrance: formData.has_secure_entrance,
      has_intercom: formData.has_intercom,
      has_gated_community: formData.has_gated_community,
      has_fire_safety: formData.has_fire_safety,
      has_soundproofing: formData.has_soundproofing,
      // Building info
      floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
      total_floors_building: formData.total_floors_building ? parseInt(formData.total_floors_building) : null,
      property_floors: formData.property_floors ? parseInt(formData.property_floors) : null,
      heating_type: (formData.heating_type || null) as 'central' | 'electric' | 'gas' | 'heat_pump' | 'other' | null,
      energy_rating: (formData.energy_rating || null) as 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      property_condition: (formData.property_condition || null) as 'new' | 'renovated' | 'good' | 'needs_work' | null,
      house_type: formData.house_type || null,
      // Rental terms
      deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
      min_lease_months: formData.min_lease_months ? parseInt(formData.min_lease_months) : null,
      internet_included: (formData.internet_included || null) as 'yes' | 'no' | 'available' | null,
      utilities_included: (formData.utilities_included || null) as 'yes' | 'no' | 'partial' | null,
      utility_cost_estimate: formData.utility_cost_estimate ? parseFloat(formData.utility_cost_estimate) : null,
      // Sale costs
      monthly_expenses: formData.monthly_expenses ? parseFloat(formData.monthly_expenses) : null,
    };
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    setIsSavingDraft(true);

    const listingData = buildListingData(true);

    if (resumeId) {
      // Update existing draft
      updateListing.mutate(
        { id: resumeId, ...listingData },
        {
          onSuccess: () => {
            toast({ title: '💾 Draft saved!', description: 'You can continue editing anytime.' });
            navigate('/my-listings');
          },
          onError: () => {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save draft.' });
          },
          onSettled: () => setIsSavingDraft(false),
        }
      );
    } else {
      // Create new draft
      createListing.mutate(listingData, {
        onSuccess: () => {
          toast({ title: '💾 Draft saved!', description: 'You can continue editing anytime.' });
          navigate('/my-listings');
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to save draft.' });
        },
        onSettled: () => setIsSavingDraft(false),
      });
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

    const listingData = buildListingData(false);

    if (resumeId) {
      // Update the draft to publish it
      updateListing.mutate(
        { id: resumeId, ...listingData },
        {
          onSuccess: () => {
            toast({ title: '🎉 Listing published!', description: 'Your property is now live.' });
            navigate('/my-listings');
          },
          onError: () => {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to publish listing.' });
          },
        }
      );
    } else {
      createListing.mutate(listingData, {
        onSuccess: () => {
          toast({ title: '🎉 Listing created!', description: 'Your property is now live.' });
          navigate('/my-listings');
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to create listing.' });
        },
      });
    }
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
      case 'house_type':
        return (
          <HouseTypeStep
            houseType={formData.house_type}
            propertyType={formData.property_type as 'house' | 'summer_house'}
            onHouseTypeChange={v => handleChange('house_type', v)}
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
      case 'floorplans':
        return (
          <FloorPlansStep
            floorPlans={floorPlans}
            isUploading={isUploadingFloorPlans}
            uploadProgress={floorPlanProgress}
            onUpload={uploadFloorPlans}
            onRemove={removeFloorPlan}
            onReorder={reorderFloorPlans}
            disabled={!user}
          />
        );
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
            furnishedDetails={formData.furnished_details}
            allowsPets={formData.allows_pets}
            petsDetails={formData.pets_details}
            moveInImmediately={formData.move_in_immediately}
            listingType={formData.listing_type}
            onDescriptionChange={v => handleChange('description', v)}
            onBedroomsChange={v => handleChange('bedrooms', v)}
            onBathroomsChange={v => handleChange('bathrooms', v)}
            onAreaChange={v => handleChange('area_sqm', v)}
            onAvailableFromChange={v => handleChange('available_from', v)}
            onAvailableUntilChange={v => handleChange('available_until', v)}
            onFurnishedChange={v => handleChange('is_furnished', v)}
            onFurnishedDetailsChange={v => handleChange('furnished_details', v)}
            onPetsChange={v => handleChange('allows_pets', v)}
            onPetsDetailsChange={v => handleChange('pets_details', v)}
            onMoveInImmediatelyChange={v => handleChange('move_in_immediately', v)}
          />
        );
      case 'outdoor':
        return (
          <OutdoorFeaturesStep
            hasBalcony={formData.has_balcony}
            balconySqm={formData.balcony_sqm}
            hasTerrace={formData.has_terrace}
            terraceSqm={formData.terrace_sqm}
            hasRooftopTerrace={formData.has_rooftop_terrace}
            hasGarden={formData.has_garden}
            gardenSqm={formData.garden_sqm}
            hasBbqArea={formData.has_bbq_area}
            hasPlayground={formData.has_playground}
            hasWaterfront={formData.has_waterfront}
            hasView={formData.has_view}
            viewType={formData.view_type}
            onFeatureToggle={(f, v) => handleChange(f, v)}
            onChange={handleChange}
          />
        );
      case 'parking':
        return (
          <ParkingStorageStep
            hasParking={formData.has_parking}
            parkingType={formData.parking_type}
            parkingSpaces={formData.parking_spaces}
            hasGarage={formData.has_garage}
            hasCarport={formData.has_carport}
            hasEvCharging={formData.has_ev_charging}
            hasBicycleStorage={formData.has_bicycle_storage}
            hasStorage={formData.has_storage}
            hasBasement={formData.has_basement}
            onFeatureToggle={(f, v) => handleChange(f, v)}
            onChange={handleChange}
          />
        );
      case 'amenities':
        return (
          <BuildingAmenitiesStep
            hasElevator={formData.has_elevator}
            hasSharedLaundry={formData.has_shared_laundry}
            hasGym={formData.has_gym}
            hasSauna={formData.has_sauna}
            hasPool={formData.has_pool}
            hasCommonRoom={formData.has_common_room}
            hasConcierge={formData.has_concierge}
            hasSecurity={formData.has_security}
            onFeatureToggle={(f, v) => handleChange(f, v)}
          />
        );
      case 'energy':
        return (
          <EnergyComfortStep
            hasFireplace={formData.has_fireplace}
            hasFloorHeating={formData.has_floor_heating}
            hasDistrictHeating={formData.has_district_heating}
            hasHeatPump={formData.has_heat_pump}
            hasAirConditioning={formData.has_air_conditioning}
            hasVentilation={formData.has_ventilation}
            hasSolarPanels={formData.has_solar_panels}
            onFeatureToggle={(f, v) => handleChange(f, v)}
          />
        );
      case 'equipment':
        return (
          <EquipmentStep
            hasAirConditioning={formData.has_air_conditioning}
            hasDishwasher={formData.has_dishwasher}
            hasWashingMachine={formData.has_washing_machine}
            hasDryer={formData.has_dryer}
            onFeatureToggle={(f, v) => handleChange(f, v)}
          />
        );
      case 'interior':
        return (
          <InteriorHighlightsStep
            hasHighCeilings={formData.has_high_ceilings}
            hasLargeWindows={formData.has_large_windows}
            hasSmartHome={formData.has_smart_home}
            hasBuiltInWardrobes={formData.has_built_in_wardrobes}
            orientation={formData.orientation}
            hasStepFreeAccess={formData.has_step_free_access}
            hasWheelchairAccessible={formData.has_wheelchair_accessible}
            hasSecureEntrance={formData.has_secure_entrance}
            hasIntercom={formData.has_intercom}
            hasSoundproofing={formData.has_soundproofing}
            hasGatedCommunity={formData.has_gated_community}
            hasFireSafety={formData.has_fire_safety}
            onFeatureToggle={(f, v) => handleChange(f, v)}
            onChange={handleChange}
          />
        );
      case 'building_info':
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
            utilityCostEstimate={formData.utility_cost_estimate}
            currency={formData.currency}
            onChange={handleChange}
          />
        );
      case 'sale_costs':
        return (
          <SaleCostsStep
            monthlyExpenses={formData.monthly_expenses}
            currency={formData.currency}
            onChange={handleChange}
          />
        );
      case 'review':
        return <ReviewStep formData={formData as any} images={images} hasValidLocation={!!(coordinates || manualCoordinates)} onEditStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  // Convert formData to preview format - cast property_type for compatibility
  const previewFormData = {
    ...formData,
    property_type: formData.property_type === 'summer_house' ? 'house' : formData.property_type,
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
  } as any;

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
        isSubmitting={createListing.isPending || updateListing.isPending || isSavingDraft}
        canPreview={canPreview()}
        canSaveDraft={true}
        isResumingDraft={!!resumeId}
        onBack={handleBack}
        onNext={handleNext}
        onSkip={handleSkip}
        onSubmit={handleSubmit}
        onPreview={() => setShowPreview(true)}
        onSaveDraft={handleSaveDraft}
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
