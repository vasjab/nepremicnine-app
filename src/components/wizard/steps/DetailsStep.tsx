import { WizardStepWrapper } from '../WizardStepWrapper';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';

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

// Number picker with plus/minus buttons
function NumberPicker({ 
  value, 
  onChange, 
  min = 0, 
  max = 10,
  label 
}: { 
  value: number; 
  onChange: (v: number) => void; 
  min?: number; 
  max?: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
            value <= min 
              ? "border-border text-muted-foreground cursor-not-allowed" 
              : "border-foreground text-foreground hover:bg-foreground hover:text-background"
          )}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-2xl font-bold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
            value >= max 
              ? "border-border text-muted-foreground cursor-not-allowed" 
              : "border-foreground text-foreground hover:bg-foreground hover:text-background"
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
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

  return (
    <WizardStepWrapper
      title="Add the details"
      subtitle="Help people understand what you're offering"
      emoji="📝"
    >
      <div className="max-w-2xl mx-auto w-full space-y-8">
        {/* Furnished Toggle - Show for all listing types, early in the form */}
        <div className="p-4 bg-card rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">🛋️ Furnished</p>
              <p className="text-sm text-muted-foreground">Property comes with furniture</p>
            </div>
            <Switch checked={isFurnished} onCheckedChange={onFurnishedChange} />
          </div>
          {isFurnished && (
            <input
              type="text"
              value={furnishedDetails}
              onChange={(e) => onFurnishedDetailsChange(e.target.value)}
              placeholder="e.g., Fully furnished with bed, sofa, and kitchen appliances..."
              maxLength={200}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground"
            />
          )}
        </div>

        {/* Room counters - Bedrooms, Bathrooms, Living Rooms */}
        <div className="flex justify-center gap-8 flex-wrap">
          <NumberPicker
            label="Bedrooms"
            value={bedroomsNum}
            onChange={(v) => onBedroomsChange(v.toString())}
            min={0}
            max={20}
          />
          <NumberPicker
            label="Bathrooms"
            value={bathroomsNum}
            onChange={(v) => onBathroomsChange(v.toString())}
            min={1}
            max={10}
          />
          <NumberPicker
            label="Living Rooms"
            value={livingRoomsNum}
            onChange={(v) => onLivingRoomsChange(v.toString())}
            min={0}
            max={10}
          />
        </div>

        {/* Area */}
        <div className="flex flex-col items-center gap-2">
          <Label className="text-sm font-medium text-muted-foreground">Living Area</Label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={areaSqm}
              onChange={(e) => onAreaChange(e.target.value)}
              placeholder="65"
              className="w-24 text-center text-2xl font-bold bg-transparent border-b-2 border-border focus:border-accent outline-none py-2"
            />
            <span className="text-xl text-muted-foreground">m²</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Internal living area only (excludes balcony, basement, storage)
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Tell people what makes this place special..."
            rows={4}
            className="resize-none text-base"
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length} / 5000 characters
          </p>
        </div>

        {/* Rental-specific fields */}
        {isRental && (
          <div className="space-y-6 pt-4 border-t border-border">
            {/* Move-in Immediately Toggle */}
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
              <div>
                <p className="font-medium">📅 Available Immediately</p>
                <p className="text-sm text-muted-foreground">Ready for move-in now</p>
              </div>
              <Switch 
                checked={moveInImmediately} 
                onCheckedChange={(checked) => {
                  onMoveInImmediatelyChange(checked);
                  if (checked) {
                    onAvailableFromChange('');
                  }
                }} 
              />
            </div>

            {/* Dates - Only show specific date if not immediately */}
            {!moveInImmediately && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Move-in Date</Label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => onAvailableFromChange(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-border bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date (optional)</Label>
                  <input
                    type="date"
                    value={availableUntil}
                    min={availableFrom || undefined}
                    onChange={(e) => onAvailableUntilChange(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-border bg-background"
                  />
                </div>
              </div>
            )}

            {/* End date for immediate availability */}
            {moveInImmediately && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">End Date (optional)</Label>
                <input
                  type="date"
                  value={availableUntil}
                  onChange={(e) => onAvailableUntilChange(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background max-w-xs"
                />
                <p className="text-xs text-muted-foreground">Leave empty for ongoing rental</p>
              </div>
            )}

            {/* Pets Toggle - Only for rentals */}
            <div className="p-4 bg-card rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">🐕 Pets Allowed</p>
                  <p className="text-sm text-muted-foreground">Tenants can have pets</p>
                </div>
                <Switch checked={allowsPets} onCheckedChange={onPetsChange} />
              </div>
              {allowsPets && (
                <input
                  type="text"
                  value={petsDetails}
                  onChange={(e) => onPetsDetailsChange(e.target.value)}
                  placeholder="e.g., Cats and small dogs welcome, no exotic pets..."
                  maxLength={200}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </WizardStepWrapper>
  );
}
