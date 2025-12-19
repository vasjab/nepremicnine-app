import { Globe, RefreshCw } from 'lucide-react';
import { useInternationalization } from '@/contexts/InternationalizationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { CURRENCIES, Currency, CURRENCY_SYMBOLS } from '@/lib/exchangeRates';
import { LANGUAGES, Language } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function InternationalSettings() {
  const { t } = useTranslation();
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    areaUnit,
    setAreaUnit,
    rentPeriod,
    setRentPeriod,
    ratesDate,
    refreshRates,
    isLoadingRates,
  } = useInternationalization();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>{t('international.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Language */}
        <div className="px-2 py-2">
          <Label className="text-xs text-muted-foreground mb-2 block">
            {t('international.language')}
          </Label>
          <DropdownMenuRadioGroup value={language} onValueChange={(v) => setLanguage(v as Language)}>
            {LANGUAGES.map((lang) => (
              <DropdownMenuRadioItem key={lang.code} value={lang.code} className="cursor-pointer">
                <span className="mr-2">{lang.flag}</span>
                {lang.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Currency */}
        <div className="px-2 py-2">
          <Label className="text-xs text-muted-foreground mb-2 block">
            {t('international.currency')}
          </Label>
          <DropdownMenuRadioGroup value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            {CURRENCIES.map((curr) => (
              <DropdownMenuRadioItem key={curr} value={curr} className="cursor-pointer">
                <span className="w-8 font-medium">{CURRENCY_SYMBOLS[curr]}</span>
                {curr}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {ratesDate && ratesDate !== 'fallback' && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {t('international.lastUpdated')}: {ratesDate}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={refreshRates}
                disabled={isLoadingRates}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingRates ? 'animate-spin' : ''}`} />
                {t('international.refresh')}
              </Button>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Area Unit */}
        <div className="px-2 py-2">
          <Label className="text-xs text-muted-foreground mb-2 block">
            {t('international.areaUnit')}
          </Label>
          <div className="flex items-center justify-between py-1">
            <span className={`text-sm ${areaUnit === 'sqm' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              m² ({t('international.squareMeters')})
            </span>
            <Switch
              checked={areaUnit === 'sqft'}
              onCheckedChange={(checked) => setAreaUnit(checked ? 'sqft' : 'sqm')}
            />
            <span className={`text-sm ${areaUnit === 'sqft' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              ft²
            </span>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Rent Period */}
        <div className="px-2 py-2">
          <Label className="text-xs text-muted-foreground mb-2 block">
            {t('international.rentPeriod')}
          </Label>
          <DropdownMenuRadioGroup value={rentPeriod} onValueChange={(v) => setRentPeriod(v as 'month' | 'week' | 'year')}>
            <DropdownMenuRadioItem value="month" className="cursor-pointer">
              {t('international.perMonth')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="week" className="cursor-pointer">
              {t('international.perWeek')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="year" className="cursor-pointer">
              {t('international.perYear')}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
