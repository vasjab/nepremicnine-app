import { WizardStepWrapper } from '../WizardStepWrapper';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { Currency } from '@/lib/exchangeRates';

interface SaleCostsStepProps {
  monthlyExpenses: string;
  currency: Currency;
  onChange: (field: string, value: string) => void;
}

export function SaleCostsStep({
  monthlyExpenses,
  currency,
  onChange,
}: SaleCostsStepProps) {
  return (
    <WizardStepWrapper
      title="Monthly costs"
      subtitle="Help buyers understand ongoing expenses"
      emoji="💵"
    >
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Monthly expenses */}
        <div>
          <Label htmlFor="monthly_expenses">Monthly expenses</Label>
          <div className="relative mt-1">
            <Input
              id="monthly_expenses"
              type="number"
              min="0"
              placeholder="e.g., 3500"
              value={monthlyExpenses}
              onChange={(e) => onChange('monthly_expenses', e.target.value)}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currency}/mo
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            HOA fees, maintenance, property taxes, utilities, etc.
          </p>
        </div>

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          This step is optional — you can skip if unknown
        </p>
      </div>
    </WizardStepWrapper>
  );
}