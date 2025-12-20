import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { WizardProgress, type WizardStep } from '@/components/wizard/WizardProgress';
import { WizardNavigation } from '@/components/wizard/WizardNavigation';
import { ListingTypeStep } from '@/components/wizard/steps/ListingTypeStep';
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
import { ClimateAppliancesStep } from '@/components/wizard/steps/ClimateAppliancesStep';
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
  const isMobile = useIsMobile();
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
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
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
    living_rooms: '1',
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
    waterfront_distance_m: '',
    has_view: false,
    view_type: '',
    // Parking & Storage
    has_parking: false,
    parking_type: '',
    parking_spaces: '',
    has_garage: false,
    has_carport: false,
    has_ev_charging: false,
    ev_charger_power: '',
    has_bicycle_storage: false,
    has_stroller_storage: false,
    has_storage: false,
    // Building amenities
    has_elevator: false,
    elevator_condition: '',
    has_shared_laundry: false,
    has_gym: false,
    has_sauna: false,
    has_pool: false,
    has_common_room: false,
    has_concierge: false,
    has_security: false,
    has_alarm_system: false,
    has_cctv: false,
    has_physical_protection: false,
    has_video_doorbell: false,
    // Climate & Comfort
    has_fireplace: false,
    has_floor_heating: false,
    has_floor_cooling: false,
    has_air_conditioning: false,
    ac_type: '',
    ac_unit_count: '',
    has_ventilation: false,
    has_heat_recovery_ventilation: false,
    has_solar_panels: false,
    has_home_battery: false,
    // Kitchen Equipment
    has_oven: false,
    has_microwave: false,
    hob_type: '',
    has_dishwasher: false,
    has_washing_machine: false,
    has_dryer: false,
    // Interior Highlights
    has_high_ceilings: false,
    has_large_windows: false,
    has_smart_home: false,
    has_built_in_wardrobes: false,
    has_window_shades: false,
    has_electric_shades: false,
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
    heating_distribution: '',
    heating_source: '',
    heat_pump_type: '',
    heating_type_other: '',
    individual_heater_types: [] as string[],
    energy_rating: '',
    year_built: '',
    property_condition: '',
    // Rental terms
    deposit_amount: '',
    min_lease_months: '',
    internet_included: '',
    internet_type: '',
    utilities_included: '',
    utilities_included_description: '',
    utilities_not_included_description: '',
    utility_cost_estimate: '',
    // Sale expenses
    monthly_expenses: '',
    expense_breakdown_enabled: false,
    expense_hoa_fees: '',
    expense_maintenance: '',
    expense_property_tax: '',
    expense_utilities: '',
    expense_insurance: '',
    expense_other: '',
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
      { id: 'listing_type', title: 'Purpose', emoji: '🏷️' },
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
      { id: 'climate_appliances', title: 'Climate', emoji: '🌡️', isOptional: true },
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
        living_rooms: (draftListing as any).living_rooms?.toString() || '1',
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
        waterfront_distance_m: (draftListing as any).waterfront_distance_m?.toString() || '',
        has_view: (draftListing as any).has_view || false,
        view_type: (draftListing as any).view_type || '',
        // Parking & Storage
        has_parking: draftListing.has_parking || false,
        parking_type: draftListing.parking_type || '',
        parking_spaces: draftListing.parking_spaces?.toString() || '',
        has_garage: draftListing.has_garage || false,
        has_carport: (draftListing as any).has_carport || false,
        has_ev_charging: (draftListing as any).has_ev_charging || false,
        ev_charger_power: (draftListing as any).ev_charger_power || '',
        has_bicycle_storage: (draftListing as any).has_bicycle_storage || false,
        has_stroller_storage: (draftListing as any).has_stroller_storage || false,
        has_storage: draftListing.has_storage || false,
        // Building amenities
        has_elevator: draftListing.has_elevator || false,
        elevator_condition: (draftListing as any).elevator_condition || '',
        has_shared_laundry: (draftListing as any).has_shared_laundry || false,
        has_gym: (draftListing as any).has_gym || false,
        has_sauna: (draftListing as any).has_sauna || false,
        has_pool: (draftListing as any).has_pool || false,
        has_common_room: (draftListing as any).has_common_room || false,
        has_concierge: (draftListing as any).has_concierge || false,
        has_security: (draftListing as any).has_security || false,
        has_alarm_system: (draftListing as any).has_alarm_system || false,
        has_cctv: (draftListing as any).has_cctv || false,
        has_physical_protection: (draftListing as any).has_physical_protection || false,
        has_video_doorbell: (draftListing as any).has_video_doorbell || false,
        // Climate & Comfort
        has_fireplace: (draftListing as any).has_fireplace || false,
        has_floor_heating: (draftListing as any).has_floor_heating || false,
        has_floor_cooling: (draftListing as any).has_floor_cooling || false,
        has_air_conditioning: draftListing.has_air_conditioning || false,
        ac_type: (draftListing as any).ac_type || '',
        ac_unit_count: (draftListing as any).ac_unit_count?.toString() || '',
        has_ventilation: (draftListing as any).has_ventilation || false,
        has_heat_recovery_ventilation: (draftListing as any).has_heat_recovery_ventilation || false,
        has_solar_panels: (draftListing as any).has_solar_panels || false,
        has_home_battery: (draftListing as any).has_home_battery || false,
        // Kitchen Equipment
        has_oven: (draftListing as any).has_oven || false,
        has_microwave: (draftListing as any).has_microwave || false,
        hob_type: (draftListing as any).hob_type || '',
        has_dishwasher: draftListing.has_dishwasher || false,
        has_washing_machine: draftListing.has_washing_machine || false,
        has_dryer: (draftListing as any).has_dryer || false,
        // Interior Highlights
        has_high_ceilings: (draftListing as any).has_high_ceilings || false,
        has_large_windows: (draftListing as any).has_large_windows || false,
        has_smart_home: (draftListing as any).has_smart_home || false,
        has_built_in_wardrobes: (draftListing as any).has_built_in_wardrobes || false,
        has_window_shades: (draftListing as any).has_window_shades || false,
        has_electric_shades: (draftListing as any).has_electric_shades || false,
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
        heating_distribution: (draftListing as any).heating_distribution || '',
        heating_source: (draftListing as any).heating_source || '',
        heat_pump_type: (draftListing as any).heat_pump_type || '',
        heating_type_other: '',
        individual_heater_types: (draftListing as any).individual_heater_types || [],
        energy_rating: draftListing.energy_rating || '',
        year_built: draftListing.year_built?.toString() || '',
        property_condition: draftListing.property_condition || '',
        // Rental terms
        deposit_amount: draftListing.deposit_amount?.toString() || '',
        min_lease_months: draftListing.min_lease_months?.toString() || '',
        internet_included: draftListing.internet_included || '',
        internet_type: (draftListing as any).internet_type || '',
        utilities_included: draftListing.utilities_included || '',
        utilities_included_description: (draftListing as any).utilities_included_description || '',
        utilities_not_included_description: (draftListing as any).utilities_not_included_description || '',
        utility_cost_estimate: draftListing.utility_cost_estimate?.toString() || '',
        // Sale expenses
        monthly_expenses: draftListing.monthly_expenses?.toString() || '',
        expense_breakdown_enabled: (draftListing as any).expense_breakdown_enabled || false,
        expense_hoa_fees: (draftListing as any).expense_hoa_fees?.toString() || '',
        expense_maintenance: (draftListing as any).expense_maintenance?.toString() || '',
        expense_property_tax: (draftListing as any).expense_property_tax?.toString() || '',
        expense_utilities: (draftListing as any).expense_utilities?.toString() || '',
        expense_insurance: (draftListing as any).expense_insurance?.toString() || '',
        expense_other: (draftListing as any).expense_other?.toString() || '',
      });
      
      // Set images if available - convert string[] to UploadedImage[]
      if (draftListing.images && draftListing.images.length > 0) {
        setImages(draftListing.images.map((url, index) => ({
          id: `draft-image-${index}`,
          url,
          name: `Image ${index + 1}`,
          size: 0,
        })));
      }
      
      // Set floor plans if available - convert string[] to UploadedFloorPlan[]
      if (draftListing.floor_plan_urls && draftListing.floor_plan_urls.length > 0) {
        setFloorPlans(draftListing.floor_plan_urls.map((url, index) => ({
          id: `draft-floorplan-${index}`,
          url,
          name: `Floor Plan ${index + 1}`,
          size: 0,
        })));
      }
      
      // Set manual coordinates if available
      if (draftListing.latitude && draftListing.longitude) {
        setManualCoordinates({
          latitude: draftListing.latitude,
          longitude: draftListing.longitude,
        });
      }
      
      // Set current step if available
      if (draftListing.current_step) {
        setCurrentStep(draftListing.current_step);
      }
      
      setIsFormInitialized(true);
    }
  }, [draftListing, isFormInitialized, setImages, setFloorPlans]);

  const handleChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking on completed or current step
    if (completedSteps.has(stepIndex) || stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkip = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Prepare listing data for submission
  const prepareListingData = () => {
    const coords = manualCoordinates || coordinates;
    
    // Parse heating type
    let heatingType = '';
    if (formData.heating_source === 'heat_pump' && formData.heat_pump_type) {
      heatingType = `heat_pump_${formData.heat_pump_type}`;
    } else if (formData.heating_source === 'other' && formData.heating_type_other) {
      heatingType = formData.heating_type_other;
    } else if (formData.heating_source) {
      heatingType = formData.heating_source;
    }
    
    return {
      title: formData.title,
      description: formData.description || null,
      listing_type: formData.listing_type,
      property_type: formData.property_type as 'apartment' | 'house' | 'room' | 'studio' | 'villa' | 'summer_house' | 'other',
      house_type: formData.house_type || null,
      price: parseFloat(formData.price) || 0,
      currency: formData.currency,
      country: formData.country,
      address: formData.address,
      city: formData.city,
      postal_code: formData.postal_code || null,
      latitude: coords?.latitude || 0,
      longitude: coords?.longitude || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 1,
      living_rooms: parseInt(formData.living_rooms) || 1,
      area_sqm: parseFloat(formData.area_sqm) || null,
      available_from: formData.available_from || null,
      available_until: formData.available_until || null,
      is_furnished: formData.is_furnished,
      furnished_details: formData.furnished_details || null,
      allows_pets: formData.allows_pets,
      pets_details: formData.pets_details || null,
      move_in_immediately: formData.move_in_immediately,
      // Outdoor
      has_balcony: formData.has_balcony,
      balcony_sqm: parseFloat(formData.balcony_sqm) || null,
      has_terrace: formData.has_terrace,
      terrace_sqm: parseFloat(formData.terrace_sqm) || null,
      has_rooftop_terrace: formData.has_rooftop_terrace,
      has_garden: formData.has_garden,
      garden_sqm: parseFloat(formData.garden_sqm) || null,
      has_bbq_area: formData.has_bbq_area,
      has_playground: formData.has_playground,
      has_waterfront: formData.has_waterfront,
      waterfront_distance_m: parseInt(formData.waterfront_distance_m) || null,
      has_view: formData.has_view,
      view_type: formData.view_type || null,
      // Parking & Storage
      has_parking: formData.has_parking,
      parking_type: formData.parking_type || null,
      parking_spaces: parseInt(formData.parking_spaces) || null,
      has_garage: formData.has_garage,
      has_carport: formData.has_carport,
      has_ev_charging: formData.has_ev_charging,
      ev_charger_power: formData.ev_charger_power || null,
      has_bicycle_storage: formData.has_bicycle_storage,
      has_stroller_storage: formData.has_stroller_storage,
      has_storage: formData.has_storage,
      // Building
      has_elevator: formData.has_elevator,
      elevator_condition: formData.elevator_condition || null,
      has_shared_laundry: formData.has_shared_laundry,
      has_gym: formData.has_gym,
      has_sauna: formData.has_sauna,
      has_pool: formData.has_pool,
      has_common_room: formData.has_common_room,
      has_concierge: formData.has_concierge,
      has_security: formData.has_security,
      has_alarm_system: formData.has_alarm_system,
      has_cctv: formData.has_cctv,
      // Climate
      has_fireplace: formData.has_fireplace,
      has_floor_heating: formData.has_floor_heating,
      has_floor_cooling: formData.has_floor_cooling,
      has_air_conditioning: formData.has_air_conditioning,
      ac_type: formData.ac_type || null,
      ac_unit_count: parseInt(formData.ac_unit_count) || null,
      has_ventilation: formData.has_ventilation,
      has_heat_recovery_ventilation: formData.has_heat_recovery_ventilation,
      has_solar_panels: formData.has_solar_panels,
      has_home_battery: formData.has_home_battery,
      // Kitchen
      has_dishwasher: formData.has_dishwasher,
      has_washing_machine: formData.has_washing_machine,
      has_dryer: formData.has_dryer,
      // Interior
      has_high_ceilings: formData.has_high_ceilings,
      has_large_windows: formData.has_large_windows,
      has_smart_home: formData.has_smart_home,
      has_built_in_wardrobes: formData.has_built_in_wardrobes,
      has_window_shades: formData.has_window_shades,
      has_electric_shades: formData.has_electric_shades,
      orientation: formData.orientation || null,
      // Accessibility
      has_step_free_access: formData.has_step_free_access,
      has_wheelchair_accessible: formData.has_wheelchair_accessible,
      has_wide_doorways: formData.has_wide_doorways,
      has_ground_floor_access: formData.has_ground_floor_access,
      has_elevator_from_garage: formData.has_elevator_from_garage,
      // Safety
      has_secure_entrance: formData.has_secure_entrance,
      has_intercom: formData.has_intercom,
      has_gated_community: formData.has_gated_community,
      has_fire_safety: formData.has_fire_safety,
      has_soundproofing: formData.has_soundproofing,
      // Building info
      floor_number: parseInt(formData.floor_number) || null,
      total_floors_building: parseInt(formData.total_floors_building) || null,
      property_floors: parseInt(formData.property_floors) || null,
      heating_type: heatingType || null,
      energy_rating: formData.energy_rating || null,
      year_built: parseInt(formData.year_built) || null,
      property_condition: formData.property_condition || null,
      // Rental terms
      deposit_amount: parseFloat(formData.deposit_amount) || null,
      min_lease_months: parseInt(formData.min_lease_months) || null,
      internet_included: formData.internet_included || null,
      utilities_included: formData.utilities_included || null,
      utility_cost_estimate: parseFloat(formData.utility_cost_estimate) || null,
      // Sale expenses
      monthly_expenses: parseFloat(formData.monthly_expenses) || null,
      expense_breakdown_enabled: formData.expense_breakdown_enabled,
      expense_hoa_fees: parseFloat(formData.expense_hoa_fees) || null,
      expense_maintenance: parseFloat(formData.expense_maintenance) || null,
      expense_property_tax: parseFloat(formData.expense_property_tax) || null,
      expense_utilities: parseFloat(formData.expense_utilities) || null,
      expense_insurance: parseFloat(formData.expense_insurance) || null,
      expense_other: parseFloat(formData.expense_other) || null,
      // Images - convert UploadedImage[] to string[] of URLs
      images: images.length > 0 ? images.map(img => img.url) : null,
      floor_plan_urls: floorPlans.length > 0 ? floorPlans.map(fp => fp.url) : null,
    } as any;
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    
    setIsSavingDraft(true);
    
    try {
      const listingData = prepareListingData();
      
      if (resumeId) {
        // Update existing draft
        await updateListing.mutateAsync({
          id: resumeId,
          ...listingData,
          is_draft: true,
          current_step: currentStep,
        });
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('listings')
          .insert({
            ...listingData,
            user_id: user.id,
            is_draft: true,
            is_active: false,
            current_step: currentStep,
          })
          .select('id')
          .single();
        
        if (error) throw error;
        
        // Update URL to include resume param without navigation
        window.history.replaceState({}, '', `/create-listing?resume=${data.id}`);
      }
      
      toast({
        title: 'Draft saved',
        description: 'Your listing has been saved as a draft.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save draft',
        variant: 'destructive',
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (isHoneypotTriggered(honeypot)) {
      toast({
        title: 'Error',
        description: 'Submission blocked',
        variant: 'destructive',
      });
      return;
    }

    const allowed = checkRateLimit();
    if (!allowed) {
      toast({
        title: 'Rate limit exceeded',
        description: `Please wait ${remainingTime} before creating another listing.`,
        variant: 'destructive',
      });
      return;
    }

    const coords = manualCoordinates || coordinates;
    if (!coords) {
      toast({
        title: 'Error',
        description: 'Please enter a valid address',
        variant: 'destructive',
      });
      return;
    }

    try {
      const listingData = prepareListingData();
      
      if (resumeId) {
        // Update existing draft and publish
        await updateListing.mutateAsync({
          id: resumeId,
          ...listingData,
          is_draft: false,
          is_active: true,
          current_step: null,
          completed_at: new Date().toISOString(),
        });
      } else {
        // Create new listing
        await createListing.mutateAsync({
          ...listingData,
          user_id: user!.id,
          is_draft: false,
          is_active: true,
        });
      }

      toast({
        title: 'Success!',
        description: 'Your listing has been published.',
      });
      navigate('/my-listings');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create listing',
        variant: 'destructive',
      });
    }
  };

  const canProceed = () => {
    const step = WIZARD_STEPS[currentStep]?.id;
    
    switch (step) {
      case 'listing_type':
        return !!formData.listing_type;
      case 'type':
        return !!formData.property_type;
      case 'house_type':
        return !!formData.house_type;
      case 'title':
        return formData.title.length >= 5;
      case 'location':
        return formData.address.length > 0 && formData.city.length > 0 && !!(coordinates || manualCoordinates);
      case 'price':
        return parseFloat(formData.price) > 0;
      case 'photos':
      case 'floorplans':
      case 'details':
      case 'outdoor':
      case 'parking':
      case 'amenities':
      case 'climate_appliances':
      case 'interior':
      case 'building_info':
      case 'rental':
      case 'sale_costs':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const canPreview = () => {
    return (
      formData.title.length >= 5 &&
      formData.address.length > 0 &&
      formData.city.length > 0 &&
      parseFloat(formData.price) > 0 &&
      !!(coordinates || manualCoordinates)
    );
  };

  const renderStep = () => {
    const step = WIZARD_STEPS[currentStep]?.id;
    
    switch (step) {
      case 'listing_type':
        return (
          <ListingTypeStep
            listingType={formData.listing_type}
            onListingTypeChange={(v) => handleChange('listing_type', v)}
          />
        );
      case 'type':
        return (
          <PropertyTypeStep
            propertyType={formData.property_type}
            propertyTypeOther={formData.property_type_other}
            onPropertyTypeChange={(v) => handleChange('property_type', v)}
            onPropertyTypeOtherChange={(v) => handleChange('property_type_other', v)}
          />
        );
      case 'house_type':
        return (
          <HouseTypeStep
            houseType={formData.house_type}
            propertyType={formData.property_type as 'house' | 'summer_house'}
            onHouseTypeChange={(v) => handleChange('house_type', v)}
          />
        );
      case 'title':
        return (
          <TitleStep
            title={formData.title}
            onTitleChange={(v) => handleChange('title', v)}
          />
        );
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
            onCountryChange={(v) => handleChange('country', v)}
            onCityChange={(v) => handleChange('city', v)}
            onAddressChange={(v) => handleChange('address', v)}
            onPostalCodeChange={(v) => handleChange('postal_code', v)}
            onAddressSelect={(suggestion) => {
              handleChange('address', suggestion.address);
              if (suggestion.city) handleChange('city', suggestion.city);
              if (suggestion.postalCode) handleChange('postal_code', suggestion.postalCode);
            }}
            onCoordinatesChange={(lat, lng) => setManualCoordinates({ latitude: lat, longitude: lng })}
            onReverseGeocode={(addr) => {
              handleChange('address', addr.address);
              handleChange('city', addr.city);
              handleChange('postal_code', addr.postalCode);
              handleChange('country', addr.country);
            }}
            onResetLocation={() => setManualCoordinates(null)}
            errors={errors}
          />
        );
      case 'price':
        return (
          <PriceStep
            price={formData.price}
            currency={formData.currency}
            listingType={formData.listing_type}
            onPriceChange={(v) => handleChange('price', v)}
            onCurrencyChange={(v) => handleChange('currency', v)}
          />
        );
      case 'photos':
        return (
          <PhotosStep
            images={images}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onUpload={uploadImages}
            onRemove={removeImage}
            onReorder={reorderImages}
          />
        );
      case 'floorplans':
        return (
          <FloorPlansStep
            floorPlans={floorPlans}
            isUploading={isUploadingFloorPlans}
            uploadProgress={floorPlanProgress}
            onUpload={uploadFloorPlans}
            onRemove={removeFloorPlan}
            onReorder={reorderFloorPlans}
          />
        );
      case 'details':
        return (
          <DetailsStep
            description={formData.description}
            bedrooms={formData.bedrooms}
            bathrooms={formData.bathrooms}
            livingRooms={formData.living_rooms}
            areaSqm={formData.area_sqm}
            availableFrom={formData.available_from}
            availableUntil={formData.available_until}
            isFurnished={formData.is_furnished}
            furnishedDetails={formData.furnished_details}
            allowsPets={formData.allows_pets}
            petsDetails={formData.pets_details}
            moveInImmediately={formData.move_in_immediately}
            listingType={formData.listing_type}
            onDescriptionChange={(v) => handleChange('description', v)}
            onBedroomsChange={(v) => handleChange('bedrooms', v)}
            onBathroomsChange={(v) => handleChange('bathrooms', v)}
            onLivingRoomsChange={(v) => handleChange('living_rooms', v)}
            onAreaChange={(v) => handleChange('area_sqm', v)}
            onAvailableFromChange={(v) => handleChange('available_from', v)}
            onAvailableUntilChange={(v) => handleChange('available_until', v)}
            onFurnishedChange={(v) => handleChange('is_furnished', v)}
            onFurnishedDetailsChange={(v) => handleChange('furnished_details', v)}
            onPetsChange={(v) => handleChange('allows_pets', v)}
            onPetsDetailsChange={(v) => handleChange('pets_details', v)}
            onMoveInImmediatelyChange={(v) => handleChange('move_in_immediately', v)}
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
            waterfrontDistanceM={formData.waterfront_distance_m}
            hasView={formData.has_view}
            viewType={formData.view_type}
            onFeatureToggle={(feature, value) => handleChange(feature, value)}
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
            evChargerPower={formData.ev_charger_power}
            hasBicycleStorage={formData.has_bicycle_storage}
            hasStrollerStorage={formData.has_stroller_storage}
            hasStorage={formData.has_storage}
            onFeatureToggle={(feature, value) => handleChange(feature, value)}
            onChange={handleChange}
          />
        );
      case 'amenities':
        return (
          <BuildingAmenitiesStep
            hasElevator={formData.has_elevator}
            elevatorCondition={formData.elevator_condition}
            hasSharedLaundry={formData.has_shared_laundry}
            hasGym={formData.has_gym}
            hasSauna={formData.has_sauna}
            hasPool={formData.has_pool}
            hasCommonRoom={formData.has_common_room}
            hasConcierge={formData.has_concierge}
            hasSecurity={formData.has_security}
            hasAlarmSystem={formData.has_alarm_system}
            hasCctv={formData.has_cctv}
            hasPhysicalProtection={formData.has_physical_protection}
            hasVideoDoorbell={formData.has_video_doorbell}
            onFeatureToggle={(feature, value) => handleChange(feature, value)}
            onChange={handleChange}
          />
        );
      case 'climate_appliances':
        return (
          <ClimateAppliancesStep
            hasFireplace={formData.has_fireplace}
            hasFloorHeating={formData.has_floor_heating}
            hasFloorCooling={formData.has_floor_cooling}
            hasAirConditioning={formData.has_air_conditioning}
            acType={formData.ac_type}
            acUnitCount={formData.ac_unit_count}
            hasVentilation={formData.has_ventilation}
            hasHeatRecoveryVentilation={formData.has_heat_recovery_ventilation}
            hasSolarPanels={formData.has_solar_panels}
            hasHomeBattery={formData.has_home_battery}
            hasOven={formData.has_oven}
            hasMicrowave={formData.has_microwave}
            hobType={formData.hob_type}
            hasDishwasher={formData.has_dishwasher}
            hasWashingMachine={formData.has_washing_machine}
            hasDryer={formData.has_dryer}
            isFurnished={formData.is_furnished}
            onFeatureToggle={(feature, value) => handleChange(feature, value)}
            onChange={handleChange}
          />
        );
      case 'interior':
        return (
          <InteriorHighlightsStep
            hasHighCeilings={formData.has_high_ceilings}
            hasLargeWindows={formData.has_large_windows}
            hasSmartHome={formData.has_smart_home}
            hasBuiltInWardrobes={formData.has_built_in_wardrobes}
            hasWindowShades={formData.has_window_shades}
            hasElectricShades={formData.has_electric_shades}
            orientation={formData.orientation}
            hasStepFreeAccess={formData.has_step_free_access}
            hasWheelchairAccessible={formData.has_wheelchair_accessible}
            hasSecureEntrance={formData.has_secure_entrance}
            hasIntercom={formData.has_intercom}
            hasSoundproofing={formData.has_soundproofing}
            hasGatedCommunity={formData.has_gated_community}
            hasFireSafety={formData.has_fire_safety}
            onFeatureToggle={(feature, value) => handleChange(feature, value)}
            onChange={handleChange}
          />
        );
      case 'building_info':
        return (
          <BuildingInfoStep
            floorNumber={formData.floor_number}
            totalFloorsBuilding={formData.total_floors_building}
            propertyFloors={formData.property_floors}
            heatingDistribution={formData.heating_distribution}
            heatingSource={formData.heating_source}
            heatPumpType={formData.heat_pump_type}
            heatingTypeOther={formData.heating_type_other}
            individualHeaterTypes={formData.individual_heater_types}
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
            internetType={formData.internet_type}
            utilitiesIncluded={formData.utilities_included}
            utilitiesIncludedDescription={formData.utilities_included_description}
            utilitiesNotIncludedDescription={formData.utilities_not_included_description}
            utilityCostEstimate={formData.utility_cost_estimate}
            currency={formData.currency}
            onChange={handleChange}
          />
        );
      case 'sale_costs':
        return (
          <SaleCostsStep
            monthlyExpenses={formData.monthly_expenses}
            expenseBreakdownEnabled={formData.expense_breakdown_enabled}
            expenseHoaFees={formData.expense_hoa_fees}
            expenseMaintenance={formData.expense_maintenance}
            expensePropertyTax={formData.expense_property_tax}
            expenseUtilities={formData.expense_utilities}
            expenseInsurance={formData.expense_insurance}
            expenseOther={formData.expense_other}
            currency={formData.currency}
            onChange={handleChange}
            onBreakdownToggle={(enabled) => handleChange('expense_breakdown_enabled', enabled)}
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
    heating_type: formData.heating_source || formData.heating_distribution,
    energy_rating: formData.energy_rating,
    year_built: formData.year_built,
    property_condition: formData.property_condition,
    deposit_amount: formData.deposit_amount,
    min_lease_months: formData.min_lease_months,
    internet_included: formData.internet_included,
    utilities_included: formData.utilities_included,
  } as any;

  // Check if user has entered meaningful data (beyond just listing_type and property_type)
  const hasSubstantialData = () => {
    return (
      formData.title.length > 0 ||
      formData.address.length > 0 ||
      formData.city.length > 0 ||
      formData.price.length > 0 ||
      formData.description.length > 0 ||
      images.length > 0
    );
  };

  const handleCloseClick = () => {
    if (hasSubstantialData()) {
      setShowCloseConfirm(true);
    } else {
      navigate(-1);
    }
  };

  const handleDiscardAndClose = () => {
    setShowCloseConfirm(false);
    navigate(-1);
  };

  const handleSaveAndClose = async () => {
    setShowCloseConfirm(false);
    await handleSaveDraft();
    navigate(-1);
  };

  // Mobile fullscreen layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-24 flex flex-col">
        {/* Mobile header with close button on left and Save Draft on right */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border h-14 flex items-center justify-between px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCloseClick} 
            className="touch-safe-button min-w-[44px] min-h-[44px]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <X className="h-5 w-5" />
          </Button>
          <span className="font-medium text-foreground">
            {resumeId ? 'Edit Listing' : 'New Listing'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={createListing.isPending || updateListing.isPending || isSavingDraft}
            className="touch-safe-button min-h-[44px] border-border"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            Save Draft
          </Button>
        </div>
        
        <main className="pt-14 flex-1">
          <div className="container mx-auto px-4 py-4">
            <WizardProgress steps={WIZARD_STEPS} currentStep={currentStep} onStepClick={handleStepClick} completedSteps={completedSteps} />

            <div className="mt-6 max-w-3xl mx-auto">
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
          canSaveDraft={false}
          isResumingDraft={!!resumeId}
          isMobile={true}
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

        {/* Close Confirmation Dialog */}
        <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save your progress?</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Would you like to save your listing as a draft before closing?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDiscardAndClose}>Discard</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveAndClose}>Save Draft</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" className="mb-4" onClick={handleCloseClick}>
            <X className="h-4 w-4 mr-2" /> Close
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
        isMobile={false}
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

      {/* Close Confirmation Dialog */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save your progress?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Would you like to save your listing as a draft before closing?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardAndClose}>Discard</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAndClose}>Save Draft</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
