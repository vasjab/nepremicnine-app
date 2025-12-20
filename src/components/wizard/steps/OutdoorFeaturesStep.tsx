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
  { id: 'has_waterfront', label: 'Waterfront', icon: Waves, description: 'Lake or sea access' },
  { id: 'has_view', label: 'Special View', icon: Eye, description: 'Mountain, city, or sea view' },
];

const VIEW_TYPES = [
  { value: 'mountain', label: 'Mountain View', icon: Mountain },
  { value: 'city', label: 'City View', icon: Building },
  { value: 'sea', label: 'Sea View', icon: Waves },
  { value: 'park', label: 'Park View', icon: Trees },
  { value: 'garden', label: 'Garden View', icon: Flower2 },
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
