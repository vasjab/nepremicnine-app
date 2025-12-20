import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { 
  Flame, 
  ThermometerSun, 
  Factory, 
  RefreshCw, 
  Wind, 
  Fan, 
  Sun
} from 'lucide-react';

interface EnergyComfortStepProps {
  hasFireplace: boolean;
  hasFloorHeating: boolean;
  hasDistrictHeating: boolean;
  hasHeatPump: boolean;
  hasAirConditioning: boolean;
  hasVentilation: boolean;
  hasSolarPanels: boolean;
  onFeatureToggle: (feature: string, value: boolean) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof Flame;
  description: string;
}

const ENERGY_FEATURES: FeatureCard[] = [
  { id: 'has_fireplace', label: 'Fireplace', icon: Flame, description: 'Wood or gas fireplace' },
  { id: 'has_floor_heating', label: 'Floor Heating', icon: ThermometerSun, description: 'Underfloor heating' },
  { id: 'has_district_heating', label: 'District Heating', icon: Factory, description: 'Central heating system' },
  { id: 'has_heat_pump', label: 'Heat Pump', icon: RefreshCw, description: 'Energy efficient heating' },
  { id: 'has_air_conditioning', label: 'Air Conditioning', icon: Wind, description: 'Cooling system' },
  { id: 'has_ventilation', label: 'Ventilation', icon: Fan, description: 'Mechanical ventilation' },
  { id: 'has_solar_panels', label: 'Solar Panels', icon: Sun, description: 'Solar energy system' },
];

export function EnergyComfortStep({
  hasFireplace,
  hasFloorHeating,
  hasDistrictHeating,
  hasHeatPump,
  hasAirConditioning,
  hasVentilation,
  hasSolarPanels,
  onFeatureToggle,
}: EnergyComfortStepProps) {
  const featureValues: Record<string, boolean> = {
    has_fireplace: hasFireplace,
    has_floor_heating: hasFloorHeating,
    has_district_heating: hasDistrictHeating,
    has_heat_pump: hasHeatPump,
    has_air_conditioning: hasAirConditioning,
    has_ventilation: hasVentilation,
    has_solar_panels: hasSolarPanels,
  };

  const selectedCount = Object.values(featureValues).filter(Boolean).length;

  return (
    <WizardStepWrapper
      title="Energy & Comfort"
      subtitle="Heating, cooling, and energy efficiency features"
      emoji="⚡"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ENERGY_FEATURES.map(({ id, label, icon: Icon, description }) => {
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

        {/* Counter */}
        <p className="text-center text-sm text-muted-foreground">
          {selectedCount} feature{selectedCount !== 1 ? 's' : ''} selected
        </p>

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground">
          This step is optional — you can skip if none apply
        </p>
      </div>
    </WizardStepWrapper>
  );
}
