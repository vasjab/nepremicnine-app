import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sun, 
  Trees, 
  Building2, 
  Flower2, 
  Flame, 
  PlayCircle, 
  Waves, 
  Eye,
  Mountain,
  Building
} from 'lucide-react';

interface OutdoorFeaturesStepProps {
  hasBalcony: boolean;
  balconySqm: string;
  hasTerrace: boolean;
  terraceSqm: string;
  hasRooftopTerrace: boolean;
  hasGarden: boolean;
  gardenSqm: string;
  hasBbqArea: boolean;
  hasPlayground: boolean;
  hasWaterfront: boolean;
  waterfrontDistanceM: string;
  hasView: boolean;
  viewType: string;
  onFeatureToggle: (feature: string, value: boolean) => void;
  onChange: (field: string, value: string) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof Sun;
  description: string;
}

const OUTDOOR_FEATURES: FeatureCard[] = [
  { id: 'has_balcony', label: 'Balcony', icon: Sun, description: 'Private outdoor balcony' },
  { id: 'has_terrace', label: 'Terrace', icon: Trees, description: 'Outdoor terrace/patio' },
  { id: 'has_rooftop_terrace', label: 'Rooftop Terrace', icon: Building2, description: 'Rooftop access' },
  { id: 'has_garden', label: 'Garden', icon: Flower2, description: 'Private or shared garden' },
  { id: 'has_bbq_area', label: 'BBQ Area', icon: Flame, description: 'Outdoor barbecue area' },
  { id: 'has_playground', label: 'Playground', icon: PlayCircle, description: "Children's playground" },
  { id: 'has_waterfront', label: 'Close to Water', icon: Waves, description: 'Near lake, sea, or river' },
  { id: 'has_view', label: 'Special View', icon: Eye, description: 'Mountain, city, or sea view' },
];

const VIEW_TYPES = [
  { value: 'mountain', label: 'Mountain View', icon: Mountain },
  { value: 'city', label: 'City View', icon: Building },
  { value: 'sea', label: 'Sea View', icon: Waves },
  { value: 'park', label: 'Park View', icon: Trees },
  { value: 'garden', label: 'Garden View', icon: Flower2 },
];

const WATERFRONT_DISTANCES = [
  { value: '0', label: 'Direct access' },
  { value: '50', label: '< 50 meters' },
  { value: '100', label: '< 100 meters' },
  { value: '200', label: '< 200 meters' },
  { value: '500', label: '< 500 meters' },
  { value: '1000', label: '< 1 km' },
  { value: '2000', label: '< 2 km' },
];

export function OutdoorFeaturesStep({
  hasBalcony,
  balconySqm,
  hasTerrace,
  terraceSqm,
  hasRooftopTerrace,
  hasGarden,
  gardenSqm,
  hasBbqArea,
  hasPlayground,
  hasWaterfront,
  waterfrontDistanceM,
  hasView,
  viewType,
  onFeatureToggle,
  onChange,
}: OutdoorFeaturesStepProps) {
  const featureValues: Record<string, boolean> = {
    has_balcony: hasBalcony,
    has_terrace: hasTerrace,
    has_rooftop_terrace: hasRooftopTerrace,
    has_garden: hasGarden,
    has_bbq_area: hasBbqArea,
    has_playground: hasPlayground,
    has_waterfront: hasWaterfront,
    has_view: hasView,
  };

  const selectedCount = Object.values(featureValues).filter(Boolean).length;

  return (
    <WizardStepWrapper
      title="Outdoor & Views"
      subtitle="Features that enhance lifestyle and emotional appeal"
      emoji="🌳"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {OUTDOOR_FEATURES.map(({ id, label, icon: Icon, description }) => {
            const isSelected = featureValues[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onFeatureToggle(id, !isSelected)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 shadow-[0_1px_4px_hsl(217_91%_60%/0.12),0_0_0_1px_hsl(217_91%_60%/0.2)]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-[0_2px_8px_hsl(0_0%_0%/0.06)]"
                )}
              >
                <div className={cn(
                  "w-11 h-11 rounded-[12px] flex items-center justify-center mb-2.5 transition-all duration-200",
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-500"
                )}>
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <span className={cn(
                  "text-sm font-semibold text-center tracking-tight transition-colors",
                  isSelected ? "text-gray-900" : "text-gray-600"
                )}>{label}</span>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Conditional Inputs */}
        <div className="space-y-4">
          {hasBalcony && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <Label htmlFor="balcony_sqm">Balcony size (m²)</Label>
              <Input
                id="balcony_sqm"
                type="number"
                value={balconySqm}
                onChange={(e) => onChange('balcony_sqm', e.target.value)}
                placeholder="e.g. 8"
                className="max-w-32"
              />
            </div>
          )}

          {hasTerrace && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <Label htmlFor="terrace_sqm">Terrace size (m²)</Label>
              <Input
                id="terrace_sqm"
                type="number"
                value={terraceSqm}
                onChange={(e) => onChange('terrace_sqm', e.target.value)}
                placeholder="e.g. 15"
                className="max-w-32"
              />
            </div>
          )}

          {hasGarden && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <Label htmlFor="garden_sqm">Garden size (m²)</Label>
              <Input
                id="garden_sqm"
                type="number"
                value={gardenSqm}
                onChange={(e) => onChange('garden_sqm', e.target.value)}
                placeholder="e.g. 50"
                className="max-w-32"
              />
            </div>
          )}

          {hasWaterfront && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <Label>Distance to water</Label>
              <Select value={waterfrontDistanceM} onValueChange={(v) => onChange('waterfront_distance_m', v)}>
                <SelectTrigger className="max-w-48">
                  <SelectValue placeholder="Select distance" />
                </SelectTrigger>
                <SelectContent>
                  {WATERFRONT_DISTANCES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {hasView && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <Label>View type</Label>
              <Select value={viewType} onValueChange={(v) => onChange('view_type', v)}>
                <SelectTrigger className="max-w-48">
                  <SelectValue placeholder="Select view type" />
                </SelectTrigger>
                <SelectContent>
                  {VIEW_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
