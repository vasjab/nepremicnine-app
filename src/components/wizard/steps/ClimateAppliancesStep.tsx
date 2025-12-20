import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { 
  Flame, 
  ThermometerSun, 
  Factory, 
  RefreshCw, 
  Wind, 
  Fan, 
  Sun,
  UtensilsCrossed,
  Shirt
} from 'lucide-react';

interface ClimateAppliancesStepProps {
  // Climate Control
  hasFireplace: boolean;
  hasFloorHeating: boolean;
  hasDistrictHeating: boolean;
  hasHeatPump: boolean;
  hasAirConditioning: boolean;
  hasVentilation: boolean;
  // Energy Systems
  hasSolarPanels: boolean;
  // Appliances
  hasDishwasher: boolean;
  hasWashingMachine: boolean;
  hasDryer: boolean;
  onFeatureToggle: (feature: string, value: boolean) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof Flame;
}

const CLIMATE_FEATURES: FeatureCard[] = [
  { id: 'has_air_conditioning', label: 'Air Conditioning', icon: Wind },
  { id: 'has_floor_heating', label: 'Floor Heating', icon: ThermometerSun },
  { id: 'has_district_heating', label: 'District Heating', icon: Factory },
  { id: 'has_heat_pump', label: 'Heat Pump', icon: RefreshCw },
  { id: 'has_ventilation', label: 'Ventilation', icon: Fan },
  { id: 'has_fireplace', label: 'Fireplace', icon: Flame },
];

const ENERGY_FEATURES: FeatureCard[] = [
  { id: 'has_solar_panels', label: 'Solar Panels', icon: Sun },
];

const APPLIANCE_FEATURES: FeatureCard[] = [
  { id: 'has_dishwasher', label: 'Dishwasher', icon: UtensilsCrossed },
  { id: 'has_washing_machine', label: 'Washing Machine', icon: Shirt },
  { id: 'has_dryer', label: 'Dryer', icon: Fan },
];

export function ClimateAppliancesStep({
  hasFireplace,
  hasFloorHeating,
  hasDistrictHeating,
  hasHeatPump,
  hasAirConditioning,
  hasVentilation,
  hasSolarPanels,
  hasDishwasher,
  hasWashingMachine,
  hasDryer,
  onFeatureToggle,
}: ClimateAppliancesStepProps) {
  const featureValues: Record<string, boolean> = {
    has_fireplace: hasFireplace,
    has_floor_heating: hasFloorHeating,
    has_district_heating: hasDistrictHeating,
    has_heat_pump: hasHeatPump,
    has_air_conditioning: hasAirConditioning,
    has_ventilation: hasVentilation,
    has_solar_panels: hasSolarPanels,
    has_dishwasher: hasDishwasher,
    has_washing_machine: hasWashingMachine,
    has_dryer: hasDryer,
  };

  const selectedCount = Object.values(featureValues).filter(Boolean).length;

  const renderFeatureGrid = (features: FeatureCard[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {features.map(({ id, label, icon: Icon }) => {
        const isSelected = featureValues[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => onFeatureToggle(id, !isSelected)}
            className={cn(
              "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
              "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
              isSelected
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-accent/50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
              isSelected ? "bg-accent text-accent-foreground" : "bg-secondary"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-center">{label}</span>
            
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <WizardStepWrapper
      title="Climate & Appliances"
      subtitle="Heating, cooling, energy systems, and included appliances"
      emoji="🌡️"
    >
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Climate Control Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Climate Control
          </h3>
          {renderFeatureGrid(CLIMATE_FEATURES)}
        </div>

        {/* Energy Systems Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Energy Systems
          </h3>
          {renderFeatureGrid(ENERGY_FEATURES)}
        </div>

        {/* Appliances Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Kitchen & Laundry
          </h3>
          {renderFeatureGrid(APPLIANCE_FEATURES)}
        </div>

        {/* Counter */}
        <p className="text-center text-sm text-muted-foreground">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </p>

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground">
          This step is optional — you can skip if none apply
        </p>
      </div>
    </WizardStepWrapper>
  );
}
