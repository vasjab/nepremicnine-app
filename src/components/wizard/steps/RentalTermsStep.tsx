import { WizardStepWrapper } from '../WizardStepWrapper';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Currency } from '@/lib/exchangeRates';

interface RentalTermsStepProps {
  depositAmount: string;
  minLeaseMonths: string;
  internetIncluded: string;
  internetType: string;
  utilitiesIncluded: string;
  utilitiesIncludedDescription: string;
  utilitiesNotIncludedDescription: string;
  utilityCostEstimate: string;
  currency: Currency;
  onChange: (field: string, value: string) => void;
}

const INTERNET_OPTIONS = [
  { value: 'included', label: 'Included in rent', description: 'Active internet connection paid by landlord' },
  { value: 'available', label: 'Available (tenant arranges)', description: 'Building has internet infrastructure — tenant sets up their own connection' },
  { value: 'not_available', label: 'No fixed internet available', description: 'No wired internet infrastructure at this location' },
];

const INTERNET_TYPES = [
  { value: 'fiber', label: 'Fiber' },
  { value: 'cable', label: 'Cable' },
  { value: 'dsl', label: 'DSL' },
  { value: 'fixed_wireless', label: 'Fixed Wireless' },
  { value: 'unknown', label: 'Unknown' },
];

const UTILITIES_OPTIONS = [
  { value: 'yes', label: 'Yes, all included' },
  { value: 'no', label: 'No, tenant pays all' },
  { value: 'partial', label: 'Partially included' },
];

const MIN_LEASE_OPTIONS = [
  { value: '1', label: '1 month' },
  { value: '3', label: '3 months' },
  { value: '6', label: '6 months' },
  { value: '12', label: '12 months' },
  { value: '24', label: '24 months' },
];

export function RentalTermsStep({
  depositAmount,
  minLeaseMonths,
  internetIncluded,
  internetType,
  utilitiesIncluded,
  utilitiesIncludedDescription,
  utilitiesNotIncludedDescription,
  utilityCostEstimate,
  currency,
  onChange,
}: RentalTermsStepProps) {
  const showUtilityCost = utilitiesIncluded === 'no' || utilitiesIncluded === 'partial';
  const showInternetType = internetIncluded === 'included' || internetIncluded === 'available';
  const showPartialUtilitiesDetails = utilitiesIncluded === 'partial';

  return (
    <WizardStepWrapper
      title="Rental terms"
      subtitle="Set expectations for potential tenants"
      emoji="📋"
    >
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Deposit amount */}
        <div>
          <Label htmlFor="deposit_amount">Security deposit</Label>
          <div className="relative mt-1">
            <Input
              id="deposit_amount"
              type="number"
              min="0"
              placeholder="e.g., 15000"
              value={depositAmount}
              onChange={(e) => onChange('deposit_amount', e.target.value)}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currency}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Amount required upfront as security deposit
          </p>
        </div>

        {/* Minimum lease */}
        <div className="space-y-2">
          <Label>Minimum lease period</Label>
          <Select value={minLeaseMonths} onValueChange={(v) => onChange('min_lease_months', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select minimum lease" />
            </SelectTrigger>
            <SelectContent>
              {MIN_LEASE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Internet included */}
        <div className="space-y-3">
          <Label>Internet</Label>
          <div className="grid grid-cols-1 gap-2">
            {INTERNET_OPTIONS.map((option) => {
              const isSelected = internetIncluded === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange('internet_included', option.value);
                    // Reset internet type when switching to not available
                    if (option.value === 'not_available') {
                      onChange('internet_type', '');
                    }
                  }}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 rounded-lg border-2 transition-all duration-200 text-left",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-secondary/50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Internet type - shown when included or available */}
        {showInternetType && (
          <div className="space-y-2 p-4 rounded-lg bg-secondary/50">
            <Label>Connection type</Label>
            <Select value={internetType} onValueChange={(v) => onChange('internet_type', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select connection type" />
              </SelectTrigger>
              <SelectContent>
                {INTERNET_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Utilities included */}
        <div className="space-y-2">
          <Label>Utilities included?</Label>
          <Select value={utilitiesIncluded} onValueChange={(v) => onChange('utilities_included', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {UTILITIES_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Water, electricity, heating, etc.
          </p>
        </div>

        {/* Partial utilities details */}
        {showPartialUtilitiesDetails && (
          <div className="space-y-4 p-4 rounded-lg bg-secondary/50">
            <div className="space-y-2">
              <Label htmlFor="utilities_included_desc">What's included in rent?</Label>
              <Textarea
                id="utilities_included_desc"
                placeholder="e.g., Water and heating"
                value={utilitiesIncludedDescription}
                onChange={(e) => onChange('utilities_included_description', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="utilities_not_included_desc">What's NOT included?</Label>
              <Textarea
                id="utilities_not_included_desc"
                placeholder="e.g., Electricity"
                value={utilitiesNotIncludedDescription}
                onChange={(e) => onChange('utilities_not_included_description', e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="utility_cost_estimate">Estimated monthly cost for non-included</Label>
              <div className="relative mt-1">
                <Input
                  id="utility_cost_estimate"
                  type="number"
                  min="0"
                  placeholder="e.g., 800"
                  value={utilityCostEstimate}
                  onChange={(e) => onChange('utility_cost_estimate', e.target.value)}
                  className="pr-20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currency}/mo
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Utility cost estimate - show when utilities fully not included */}
        {utilitiesIncluded === 'no' && (
          <div>
            <Label htmlFor="utility_cost_estimate_full">Estimated monthly utilities</Label>
            <div className="relative mt-1">
              <Input
                id="utility_cost_estimate_full"
                type="number"
                min="0"
                placeholder="e.g., 800"
                value={utilityCostEstimate}
                onChange={(e) => onChange('utility_cost_estimate', e.target.value)}
                className="pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currency}/mo
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Approximate cost for water, electricity, heating, etc.
            </p>
          </div>
        )}

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          This step is optional — you can skip if unsure
        </p>
      </div>
    </WizardStepWrapper>
  );
}