import { WizardStepWrapper } from '../WizardStepWrapper';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Minus, Plus, Bed, Bath, Sofa, Square, Calendar, PawPrint, Armchair, ArrowRight } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface DetailsStepProps {
  description: string;
  bedrooms: string;
  bathrooms: string;
  livingRooms: string;
  areaSqm: string;
  availableFrom: string;
  availableUntil: string;
  isFurnished: boolean;
  furnishedDetails: string;
  allowsPets: boolean;
  petsDetails: string;
  moveInImmediately: boolean;
  listingType: 'rent' | 'sale';
  onDescriptionChange: (value: string) => void;
  onBedroomsChange: (value: string) => void;
  onBathroomsChange: (value: string) => void;
  onLivingRoomsChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onAvailableFromChange: (value: string) => void;
  onAvailableUntilChange: (value: string) => void;
  onFurnishedChange: (value: boolean) => void;
  onFurnishedDetailsChange: (value: string) => void;
  onPetsChange: (value: boolean) => void;
  onPetsDetailsChange: (value: string) => void;
  onMoveInImmediatelyChange: (value: boolean) => void;
}

// Counter card component for rooms
function CounterCard({ 
  value, 
  onChange, 
  min = 0, 
  max = 10,
  label,
  icon: Icon
}: { 
  value: number; 
  onChange: (v: number) => void; 
  min?: number; 
  max?: number;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex-1 min-w-[140px] p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
            value <= min 
              ? "border-border text-muted-foreground/40 cursor-not-allowed" 
              : "border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
          )}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
            value >= max 
              ? "border-border text-muted-foreground/40 cursor-not-allowed" 
              : "border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground hover:text-background"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// Toggle card component
function ToggleCard({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
  children,
  info
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
  info?: string;
}) {
  return (
    <div className={cn(
      "rounded-xl border transition-colors",
      checked ? "border-accent bg-accent/5" : "border-border bg-card"
    )}>
      <div className="flex items-center gap-4 p-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          checked ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-foreground">{label}</p>
            {info && <InfoTooltip content={info} />}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {checked && children && (
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

export function DetailsStep({
  description,
  bedrooms,
  bathrooms,
  livingRooms,
  areaSqm,
  availableFrom,
  availableUntil,
  isFurnished,
  furnishedDetails,
  allowsPets,
  petsDetails,
  moveInImmediately,
  listingType,
  onDescriptionChange,
  onBedroomsChange,
  onBathroomsChange,
  onLivingRoomsChange,
  onAreaChange,
  onAvailableFromChange,
  onAvailableUntilChange,
  onFurnishedChange,
  onFurnishedDetailsChange,
  onPetsChange,
  onPetsDetailsChange,
  onMoveInImmediatelyChange,
}: DetailsStepProps) {
  const isRental = listingType === 'rent';
  const bedroomsNum = parseInt(bedrooms) || 0;
  const bathroomsNum = parseInt(bathrooms) || 1;
  const livingRoomsNum = parseInt(livingRooms) || 1;

  // Convert string dates to Date objects for DatePicker
  const availableFromDate = availableFrom ? new Date(availableFrom) : undefined;
  const availableUntilDate = availableUntil ? new Date(availableUntil) : undefined;

  const handleAvailableFromChange = (date: Date | undefined) => {
    onAvailableFromChange(date ? date.toISOString().split('T')[0] : '');
  };

  const handleAvailableUntilChange = (date: Date | undefined) => {
    onAvailableUntilChange(date ? date.toISOString().split('T')[0] : '');
  };

  return (
    <WizardStepWrapper
      title="Add the details"
      subtitle="Help people understand what you're offering"
      emoji="📝"
    >
      <div className="max-w-2xl mx-auto w-full space-y-10">
        {/* Section: Rooms */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Rooms & Size</h3>
          <div className="flex flex-wrap gap-3">
            <CounterCard
              label="Bedrooms"
              icon={Bed}
              value={bedroomsNum}
              onChange={(v) => onBedroomsChange(v.toString())}
              min={0}
              max={20}
            />
            <CounterCard
              label="Bathrooms"
              icon={Bath}
              value={bathroomsNum}
              onChange={(v) => onBathroomsChange(v.toString())}
              min={1}
              max={10}
            />
            <CounterCard
              label="Living Rooms"
              icon={Sofa}
              value={livingRoomsNum}
              onChange={(v) => onLivingRoomsChange(v.toString())}
              min={0}
              max={10}
            />
          </div>

          {/* Area */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Square className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Living Area</span>
              <InfoTooltip content="Internal living area only. Excludes balcony, basement, and storage spaces." />
            </div>
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                value={areaSqm}
                onChange={(e) => onAreaChange(e.target.value)}
                placeholder="65"
                className="w-24 text-2xl font-semibold bg-transparent border-b-2 border-border focus:border-accent outline-none pb-1 tabular-nums"
              />
              <span className="text-lg text-muted-foreground">m²</span>
            </div>
          </div>
        </section>

        {/* Section: Furnishing */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Furnishing</h3>
          <ToggleCard
            icon={Armchair}
            label="Furnished"
            description="Property comes with furniture"
            checked={isFurnished}
            onCheckedChange={onFurnishedChange}
            info="Includes essential furniture like beds, sofas, dining table. Specific appliances can be added in a later step."
          >
            <input
              type="text"
              value={furnishedDetails}
              onChange={(e) => onFurnishedDetailsChange(e.target.value)}
              placeholder="e.g., Fully furnished with bed, sofa, and kitchen appliances..."
              maxLength={200}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
          </ToggleCard>
        </section>

        {/* Section: Description */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Description</h3>
            <span className="text-xs text-muted-foreground tabular-nums">
              {description.length} / 5000
            </span>
          </div>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Tell people what makes this place special..."
            rows={4}
            className="resize-none text-base"
          />
        </section>

        {/* Section: Rental Terms (only for rentals) */}
        {isRental && (
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Availability</h3>
            
            <ToggleCard
              icon={Calendar}
              label="Available Immediately"
              description="Ready for move-in now"
              checked={moveInImmediately}
              onCheckedChange={(checked) => {
                onMoveInImmediatelyChange(checked);
                if (checked) {
                  onAvailableFromChange('');
                }
              }}
            />

            {/* Date pickers */}
            <div className="grid sm:grid-cols-2 gap-4">
              {!moveInImmediately && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Move-in Date</Label>
                  <DatePicker
                    value={availableFromDate}
                    onChange={handleAvailableFromChange}
                    placeholder="Select move-in date"
                    minDate={new Date()}
                  />
                </div>
              )}
              <div className={cn("space-y-2", moveInImmediately && "sm:col-span-2 max-w-xs")}>
                <Label className="text-sm font-medium text-muted-foreground">End Date (optional)</Label>
                <DatePicker
                  value={availableUntilDate}
                  onChange={handleAvailableUntilChange}
                  placeholder="Open ended"
                  minDate={availableFromDate || new Date()}
                />
                <p className="text-xs text-muted-foreground">Leave empty for ongoing rental</p>
              </div>
            </div>

            {/* Pets */}
            <ToggleCard
              icon={PawPrint}
              label="Pets Allowed"
              description="Tenants can have pets"
              checked={allowsPets}
              onCheckedChange={onPetsChange}
              info="Specify any restrictions on pet types, sizes, or number of pets allowed."
            >
              <input
                type="text"
                value={petsDetails}
                onChange={(e) => onPetsDetailsChange(e.target.value)}
                placeholder="e.g., Cats and small dogs welcome, no exotic pets..."
                maxLength={200}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              />
            </ToggleCard>
          </section>
        )}
      </div>
    </WizardStepWrapper>
  );
}
