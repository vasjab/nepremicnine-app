import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowUpFromLine, 
  Square, 
  Compass, 
  Smartphone, 
  DoorClosed,
  Accessibility,
  Lock,
  Phone,
  VolumeX,
  ArrowRightFromLine,
  CircleDot,
  ShieldCheck
} from 'lucide-react';

interface InteriorHighlightsStepProps {
  hasHighCeilings: boolean;
  hasLargeWindows: boolean;
  hasSmartHome: boolean;
  hasBuiltInWardrobes: boolean;
  orientation: string;
  hasStepFreeAccess: boolean;
  hasWheelchairAccessible: boolean;
  hasSecureEntrance: boolean;
  hasIntercom: boolean;
  hasSoundproofing: boolean;
  hasGatedCommunity: boolean;
  hasFireSafety: boolean;
  onFeatureToggle: (feature: string, value: boolean) => void;
  onChange: (field: string, value: string) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof ArrowUpFromLine;
  description: string;
}

const INTERIOR_FEATURES: FeatureCard[] = [
  { id: 'has_high_ceilings', label: 'High Ceilings', icon: ArrowUpFromLine, description: 'Extra ceiling height' },
  { id: 'has_large_windows', label: 'Large Windows', icon: Square, description: 'Plenty of natural light' },
  { id: 'has_smart_home', label: 'Smart Home', icon: Smartphone, description: 'Connected devices' },
  { id: 'has_built_in_wardrobes', label: 'Built-in Wardrobes', icon: DoorClosed, description: 'Fitted storage' },
];

const ACCESSIBILITY_FEATURES: FeatureCard[] = [
  { id: 'has_step_free_access', label: 'Step-free Access', icon: Accessibility, description: 'No steps at entrance' },
  { id: 'has_wheelchair_accessible', label: 'Wheelchair Accessible', icon: ArrowRightFromLine, description: 'Wide doorways, ramps' },
];

const SAFETY_FEATURES: FeatureCard[] = [
  { id: 'has_secure_entrance', label: 'Secure Entrance', icon: Lock, description: 'Locked entry' },
  { id: 'has_intercom', label: 'Intercom', icon: Phone, description: 'Video doorbell' },
  { id: 'has_soundproofing', label: 'Soundproofing', icon: VolumeX, description: 'Noise insulation' },
  { id: 'has_gated_community', label: 'Gated Community', icon: ShieldCheck, description: 'Controlled access' },
  { id: 'has_fire_safety', label: 'Fire Safety', icon: CircleDot, description: 'Fire alarms & systems' },
];

const ORIENTATIONS = [
  { value: 'south', label: 'South' },
  { value: 'south-east', label: 'South-East' },
  { value: 'south-west', label: 'South-West' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'north', label: 'North' },
  { value: 'north-east', label: 'North-East' },
  { value: 'north-west', label: 'North-West' },
];

export function InteriorHighlightsStep({
  hasHighCeilings,
  hasLargeWindows,
  hasSmartHome,
  hasBuiltInWardrobes,
  orientation,
  hasStepFreeAccess,
  hasWheelchairAccessible,
  hasSecureEntrance,
  hasIntercom,
  hasSoundproofing,
  hasGatedCommunity,
  hasFireSafety,
  onFeatureToggle,
  onChange,
}: InteriorHighlightsStepProps) {
  const allFeatures: Record<string, boolean> = {
    has_high_ceilings: hasHighCeilings,
    has_large_windows: hasLargeWindows,
    has_smart_home: hasSmartHome,
    has_built_in_wardrobes: hasBuiltInWardrobes,
    has_step_free_access: hasStepFreeAccess,
    has_wheelchair_accessible: hasWheelchairAccessible,
    has_secure_entrance: hasSecureEntrance,
    has_intercom: hasIntercom,
    has_soundproofing: hasSoundproofing,
    has_gated_community: hasGatedCommunity,
    has_fire_safety: hasFireSafety,
  };

  const selectedCount = Object.values(allFeatures).filter(Boolean).length + (orientation ? 1 : 0);

  const renderFeatureGrid = (features: FeatureCard[]) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {features.map(({ id, label, icon: Icon }) => {
        const isSelected = allFeatures[id];
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
      title="Interior & Safety"
      subtitle="Highlights, accessibility, and security features"
      emoji="✨"
    >
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Interior Highlights */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Interior Highlights</h3>
          {renderFeatureGrid(INTERIOR_FEATURES)}
        </div>

        {/* Orientation Selector */}
        <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-muted-foreground" />
            <Label>Main orientation (sunny side)</Label>
          </div>
          <Select value={orientation} onValueChange={(v) => onChange('orientation', v)}>
            <SelectTrigger className="max-w-48">
              <SelectValue placeholder="Select orientation" />
            </SelectTrigger>
            <SelectContent>
              {ORIENTATIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Accessibility */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Accessibility</h3>
          {renderFeatureGrid(ACCESSIBILITY_FEATURES)}
        </div>

        {/* Safety & Privacy */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Safety & Privacy</h3>
          {renderFeatureGrid(SAFETY_FEATURES)}
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
