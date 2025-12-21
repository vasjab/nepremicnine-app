import { Globe, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useInternationalization } from '@/contexts/InternationalizationContext';
import { useTranslation } from '@/hooks/useTranslation';
import { CURRENCIES, Currency, CURRENCY_SYMBOLS } from '@/lib/exchangeRates';
import { LANGUAGES, Language } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface InternationalSettingsProps {
  trigger?: 'icon' | 'menu-item';
  onOpenChange?: (open: boolean) => void;
}

export function InternationalSettings({ trigger = 'icon', onOpenChange }: InternationalSettingsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    areaUnit,
    setAreaUnit,
    rentPeriod,
    setRentPeriod,
  } = useInternationalization();

  const currentLanguage = LANGUAGES.find(l => l.code === language);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger === 'icon' ? (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Globe className="h-5 w-5" />
          </Button>
        ) : (
          <button className="w-full flex items-center justify-between px-4 py-3.5 text-base hover:bg-secondary/50 cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <Globe className="h-5 w-5" />
              <span>{t('international.title')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm">{currentLanguage?.flag}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border/50">
          <DialogTitle className="text-xl font-semibold text-center">
            {t('international.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Language Section */}
          <div className="px-6 py-5 border-b border-border/30">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {t('international.language')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all",
                    "border-2",
                    language === lang.code
                      ? "border-foreground bg-secondary/50"
                      : "border-transparent hover:bg-secondary/30"
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Currency Section */}
          <div className="px-6 py-5 border-b border-border/30">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {t('international.currency')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr as Currency)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all",
                    "border-2",
                    currency === curr
                      ? "border-foreground bg-secondary/50"
                      : "border-transparent hover:bg-secondary/30"
                  )}
                >
                  <span className="w-8 text-lg font-semibold text-muted-foreground">{CURRENCY_SYMBOLS[curr]}</span>
                  <span className="font-medium">{curr}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Area Unit Section */}
          <div className="px-6 py-5 border-b border-border/30">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {t('international.areaUnit')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAreaUnit('sqm')}
                className={cn(
                  "flex flex-col items-center justify-center px-4 py-4 rounded-xl transition-all",
                  "border-2",
                  areaUnit === 'sqm'
                    ? "border-foreground bg-secondary/50"
                    : "border-transparent hover:bg-secondary/30"
                )}
              >
                <span className="text-2xl font-semibold">m²</span>
                <span className="text-sm text-muted-foreground mt-1">{t('international.squareMeters')}</span>
              </button>
              <button
                onClick={() => setAreaUnit('sqft')}
                className={cn(
                  "flex flex-col items-center justify-center px-4 py-4 rounded-xl transition-all",
                  "border-2",
                  areaUnit === 'sqft'
                    ? "border-foreground bg-secondary/50"
                    : "border-transparent hover:bg-secondary/30"
                )}
              >
                <span className="text-2xl font-semibold">ft²</span>
                <span className="text-sm text-muted-foreground mt-1">Square feet</span>
              </button>
            </div>
          </div>
          
          {/* Rent Period Section */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {t('international.rentPeriod')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRentPeriod('month')}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-3.5 rounded-xl transition-all",
                  "border-2",
                  rentPeriod === 'month'
                    ? "border-foreground bg-secondary/50"
                    : "border-transparent hover:bg-secondary/30"
                )}
              >
                <span className="font-medium">{t('international.perMonth')}</span>
              </button>
              <button
                onClick={() => setRentPeriod('week')}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-3.5 rounded-xl transition-all",
                  "border-2",
                  rentPeriod === 'week'
                    ? "border-foreground bg-secondary/50"
                    : "border-transparent hover:bg-secondary/30"
                )}
              >
                <span className="font-medium">{t('international.perWeek')}</span>
              </button>
              <button
                onClick={() => setRentPeriod('year')}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-3.5 rounded-xl transition-all",
                  "border-2",
                  rentPeriod === 'year'
                    ? "border-foreground bg-secondary/50"
                    : "border-transparent hover:bg-secondary/30"
                )}
              >
                <span className="font-medium">{t('international.perYear')}</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
