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
          <button className="w-full flex items-center justify-between px-4 py-3.5 text-base hover:bg-gray-50 cursor-pointer transition-colors rounded-xl">
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gray-100 text-gray-500">
                <Globe className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{t('international.title')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm">{currentLanguage?.flag}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold tracking-tight text-center">
            {t('international.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-5 pb-6 space-y-6">
          {/* Language Section */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {t('international.language')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-left transition-all duration-150 active:scale-[0.97]",
                    language === lang.code
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Currency Section */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {t('international.currency')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr as Currency)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-left transition-all duration-150 active:scale-[0.97]",
                    currency === curr
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className={cn(
                    "w-7 text-base font-semibold",
                    currency === curr ? "text-gray-300" : "text-gray-400"
                  )}>{CURRENCY_SYMBOLS[curr]}</span>
                  <span className="text-sm font-medium">{curr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Area Unit Section */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {t('international.areaUnit')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAreaUnit('sqm')}
                className={cn(
                  "flex flex-col items-center justify-center px-4 py-4 rounded-[12px] transition-all duration-150 active:scale-[0.97]",
                  areaUnit === 'sqm'
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="text-xl font-semibold">m²</span>
                <span className={cn(
                  "text-xs mt-1",
                  areaUnit === 'sqm' ? "text-gray-400" : "text-gray-400"
                )}>{t('international.squareMeters')}</span>
              </button>
              <button
                onClick={() => setAreaUnit('sqft')}
                className={cn(
                  "flex flex-col items-center justify-center px-4 py-4 rounded-[12px] transition-all duration-150 active:scale-[0.97]",
                  areaUnit === 'sqft'
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="text-xl font-semibold">ft²</span>
                <span className={cn(
                  "text-xs mt-1",
                  areaUnit === 'sqft' ? "text-gray-400" : "text-gray-400"
                )}>Square feet</span>
              </button>
            </div>
          </div>

          {/* Rent Period Section */}
          <div>
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {t('international.rentPeriod')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRentPeriod('month')}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-3 rounded-[12px] transition-all duration-150 active:scale-[0.97]",
                  rentPeriod === 'month'
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="text-sm font-medium">{t('international.perMonth')}</span>
              </button>
              <button
                onClick={() => setRentPeriod('week')}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-3 rounded-[12px] transition-all duration-150 active:scale-[0.97]",
                  rentPeriod === 'week'
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="text-sm font-medium">{t('international.perWeek')}</span>
              </button>
              <button
                onClick={() => setRentPeriod('year')}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-3 rounded-[12px] transition-all duration-150 active:scale-[0.97]",
                  rentPeriod === 'year'
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="text-sm font-medium">{t('international.perYear')}</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
