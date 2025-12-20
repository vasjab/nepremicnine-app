import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { 
  ArrowUp, 
  Shirt, 
  Dumbbell, 
  Thermometer, 
  Waves, 
  Sofa, 
  Bell, 
  Shield,
  Siren,
  Camera,
  Lock,
  Video
} from 'lucide-react';

interface BuildingAmenitiesStepProps {
  hasElevator: boolean;
  elevatorCondition: string;
  hasSharedLaundry: boolean;
  hasGym: boolean;
  hasSauna: boolean;
  hasPool: boolean;
  hasCommonRoom: boolean;
  hasConcierge: boolean;
  hasSecurity: boolean;
  hasAlarmSystem: boolean;
  hasCctv: boolean;
  hasPhysicalProtection: boolean;
  hasVideoDoorbell: boolean;
  onFeatureToggle: (feature: string, value: boolean) => void;
  onChange: (field: string, value: string) => void;
}

interface FeatureCard {
  id: string;
  label: string;
  icon: typeof ArrowUp;
  info: string;
}

const BUILDING_AMENITIES: FeatureCard[] = [
  { id: 'has_elevator', label: 'Elevator', icon: ArrowUp, info: 'Building has an elevator for easy access to upper floors' },
  { id: 'has_shared_laundry', label: 'Shared Laundry', icon: Shirt, info: 'Common laundry room with washing machines and dryers' },
  { id: 'has_gym', label: 'Gym', icon: Dumbbell, info: 'On-site fitness room or gym for residents' },
  { id: 'has_sauna', label: 'Sauna', icon: Thermometer, info: 'Sauna or spa facilities in the building' },
  { id: 'has_pool', label: 'Pool', icon: Waves, info: 'Swimming pool available for residents' },
  { id: 'has_common_room', label: 'Common Room', icon: Sofa, info: 'Shared lounge or party room for resident use' },
  { id: 'has_concierge', label: 'Concierge', icon: Bell, info: 'Reception desk or doorman service' },
  { id: 'has_security', label: 'Security', icon: Shield, info: 'Building has security measures (guards, cameras, etc.)' },
];

const SECURITY_SUB_OPTIONS: FeatureCard[] = [
  { id: 'has_alarm_system', label: 'Alarm System', icon: Siren, info: 'Burglar alarm or security alarm installed in the unit' },
  { id: 'has_cctv', label: 'CCTV Cameras', icon: Camera, info: 'Video surveillance in common areas or around the property' },
  { id: 'has_physical_protection', label: 'Physical Protection', icon: Lock, info: 'Security bars, grilles, or reinforced doors/windows' },
  { id: 'has_video_doorbell', label: 'Video Doorbell', icon: Video, info: 'Smart doorbell with camera to see visitors remotely' },
];

const ELEVATOR_CONDITIONS = [
  { value: 'old', label: 'Older model (may be slower)' },
  { value: 'modern', label: 'Modern elevator' },
  { value: 'renovated', label: 'Recently renovated' },
];

export function BuildingAmenitiesStep({
  hasElevator,
  elevatorCondition,
  hasSharedLaundry,
  hasGym,
  hasSauna,
  hasPool,
  hasCommonRoom,
  hasConcierge,
  hasSecurity,
  hasAlarmSystem,
  hasCctv,
  hasPhysicalProtection,
  hasVideoDoorbell,
  onFeatureToggle,
  onChange,
}: BuildingAmenitiesStepProps) {
  const featureValues: Record<string, boolean> = {
    has_elevator: hasElevator,
    has_shared_laundry: hasSharedLaundry,
    has_gym: hasGym,
    has_sauna: hasSauna,
    has_pool: hasPool,
    has_common_room: hasCommonRoom,
    has_concierge: hasConcierge,
    has_security: hasSecurity,
  };

  const securitySubValues: Record<string, boolean> = {
    has_alarm_system: hasAlarmSystem,
    has_cctv: hasCctv,
    has_physical_protection: hasPhysicalProtection,
    has_video_doorbell: hasVideoDoorbell,
  };

  const selectedCount = Object.values(featureValues).filter(Boolean).length + 
    (hasSecurity ? Object.values(securitySubValues).filter(Boolean).length : 0);

  return (
    <WizardStepWrapper
      title="Building Amenities"
      subtitle="Shared facilities that add value to apartment living"
      emoji="🏢"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BUILDING_AMENITIES.map(({ id, label, icon: Icon, info }) => {
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
                {/* Info tooltip in top-right */}
                <div className="absolute top-1 right-1">
                  <InfoTooltip content={info} />
                </div>
                
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                  isSelected ? "bg-accent text-accent-foreground" : "bg-secondary"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-center">{label}</span>
                
                {isSelected && (
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Elevator Condition - shown when elevator is selected */}
        {hasElevator && (
          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
            <div className="flex items-center gap-2">
              <Label>Elevator Condition</Label>
              <InfoTooltip content="Older elevators are typically smaller and slower. Modern elevators are faster and often have better accessibility features." />
            </div>
            <Select value={elevatorCondition} onValueChange={(v) => onChange('elevator_condition', v)}>
              <SelectTrigger className="max-w-64">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {ELEVATOR_CONDITIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Security Sub-options - shown when security is selected */}
        {hasSecurity && (
          <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Security Features</Label>
              <InfoTooltip content="Select specific security features available in the building or unit" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SECURITY_SUB_OPTIONS.map(({ id, label, icon: Icon, info }) => {
                const isSelected = securitySubValues[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onFeatureToggle(id, !isSelected)}
                    className={cn(
                      "relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                      "hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
                      isSelected
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-accent/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "bg-accent text-accent-foreground" : "bg-secondary"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                    <div className="ml-auto">
                      <InfoTooltip content={info} />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Counter */}
        <p className="text-center text-sm text-muted-foreground">
          {selectedCount} amenity{selectedCount !== 1 ? 'ies' : ''} selected
        </p>

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground">
          This step is optional — you can skip if none apply
        </p>
      </div>
    </WizardStepWrapper>
  );
}
