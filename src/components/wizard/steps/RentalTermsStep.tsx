import { WizardStepWrapper } from '../WizardStepWrapper';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Currency } from '@/lib/exchangeRates';

interface RentalTermsStepProps {
  depositAmount: string;
  minLeaseMonths: string;
  internetIncluded: string;
  utilitiesIncluded: string;
  utilityCostEstimate: string;
  currency: Currency;
  onChange: (field: string, value: string) => void;
}

const INTERNET_OPTIONS = [
  { value: 'yes', label: 'Yes, included in rent' },
  { value: 'no', label: 'No, tenant pays separately' },
  { value: 'available', label: 'Available but not included' },
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
  utilitiesIncluded,
  utilityCostEstimate,
  currency,
  onChange,
}: RentalTermsStepProps) {
  const showUtilityCost = utilitiesIncluded === 'no' || utilitiesIncluded === 'partial';

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
        <div className="space-y-2">
          <Label>Internet included?</Label>
          <Select value={internetIncluded} onValueChange={(v) => onChange('internet_included', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {INTERNET_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        {/* Utility cost estimate - show when utilities not included */}
        {showUtilityCost && (
          <div>
            <Label htmlFor="utility_cost_estimate">Estimated monthly utilities</Label>
            <div className="relative mt-1">
              <Input
                id="utility_cost_estimate"
                type="number"
                min="0"
                placeholder="e.g., 800"
                value={utilityCostEstimate}
                onChange={(e) => onChange('utility_cost_estimate', e.target.value)}
                className="pr-16"
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
