import { WizardStepWrapper } from '../WizardStepWrapper';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import type { Currency } from '@/lib/exchangeRates';
import { 
  Building2, 
  Wrench, 
  Landmark, 
  Zap, 
  Shield, 
  Plus,
  Calculator,
  List
} from 'lucide-react';

interface SaleCostsStepProps {
  monthlyExpenses: string;
  expenseBreakdownEnabled: boolean;
  expenseHoaFees: string;
  expenseMaintenance: string;
  expensePropertyTax: string;
  expenseUtilities: string;
  expenseInsurance: string;
  expenseOther: string;
  currency: Currency;
  onChange: (field: string, value: string) => void;
  onBreakdownToggle: (enabled: boolean) => void;
}

const EXPENSE_CATEGORIES = [
  { 
    id: 'expense_hoa_fees', 
    label: 'HOA / Condo Fees', 
    icon: Building2,
    info: 'Monthly fees paid to homeowner association for common area maintenance, amenities, and building services'
  },
  { 
    id: 'expense_maintenance', 
    label: 'Maintenance Reserve', 
    icon: Wrench,
    info: 'Monthly set-aside for repairs and maintenance — typically 1% of property value per year divided by 12'
  },
  { 
    id: 'expense_property_tax', 
    label: 'Property Tax', 
    icon: Landmark,
    info: 'Annual property tax divided by 12 months — varies by location and property value'
  },
  { 
    id: 'expense_utilities', 
    label: 'Utilities', 
    icon: Zap,
    info: 'Average monthly cost for electricity, water, gas, heating — if not included in HOA'
  },
  { 
    id: 'expense_insurance', 
    label: 'Insurance', 
    icon: Shield,
    info: 'Homeowner\'s insurance premium divided by 12 months — covers property damage and liability'
  },
  { 
    id: 'expense_other', 
    label: 'Other', 
    icon: Plus,
    info: 'Any other recurring monthly costs not covered above'
  },
];

export function SaleCostsStep({
  monthlyExpenses,
  expenseBreakdownEnabled,
  expenseHoaFees,
  expenseMaintenance,
  expensePropertyTax,
  expenseUtilities,
  expenseInsurance,
  expenseOther,
  currency,
  onChange,
  onBreakdownToggle,
}: SaleCostsStepProps) {
  const expenseValues: Record<string, string> = {
    expense_hoa_fees: expenseHoaFees,
    expense_maintenance: expenseMaintenance,
    expense_property_tax: expensePropertyTax,
    expense_utilities: expenseUtilities,
    expense_insurance: expenseInsurance,
    expense_other: expenseOther,
  };

  // Calculate total from breakdown
  const calculatedTotal = EXPENSE_CATEGORIES.reduce((sum, cat) => {
    const val = parseFloat(expenseValues[cat.id] || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <WizardStepWrapper
      title="Monthly costs"
      subtitle="Help buyers understand ongoing expenses"
      emoji="💵"
    >
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Toggle between single total and breakdown */}
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
          <button
            type="button"
            onClick={() => onBreakdownToggle(false)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
              !expenseBreakdownEnabled
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calculator className="h-4 w-4" />
            Single total
          </button>
          <button
            type="button"
            onClick={() => onBreakdownToggle(true)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
              expenseBreakdownEnabled
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
            Break down
          </button>
        </div>

        {!expenseBreakdownEnabled ? (
          /* Single total mode */
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
        ) : (
          /* Breakdown mode */
          <div className="space-y-4">
            {EXPENSE_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={category.id} className="flex items-center gap-1.5">
                      {category.label}
                      <InfoTooltip content={category.info} />
                    </Label>
                  </div>
                  <div className="relative">
                    <Input
                      id={category.id}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={expenseValues[category.id]}
                      onChange={(e) => onChange(category.id, e.target.value)}
                      className="pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {currency}/mo
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Calculated total */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <span className="text-sm font-medium text-foreground">Estimated total</span>
                <span className="text-lg font-semibold text-primary">
                  {calculatedTotal.toLocaleString()} {currency}/mo
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Skip hint */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          This step is optional — you can skip if unknown
        </p>
      </div>
    </WizardStepWrapper>
  );
}
