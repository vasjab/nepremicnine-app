import { useState } from 'react';
import { PartyPopper, TrendingUp, TrendingDown, Minus, ChartBar, Users, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useFormattedPrice } from '@/hooks/useFormattedPrice';

interface MarkCompletedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingType: 'rent' | 'sale';
  askingPrice: number;
  currency: string;
  onConfirm: (finalPrice: number | null) => void;
  isLoading?: boolean;
  listingAddress?: string;
}

export function MarkCompletedModal({
  open,
  onOpenChange,
  listingType,
  askingPrice,
  currency,
  onConfirm,
  isLoading = false,
  listingAddress = '',
}: MarkCompletedModalProps) {
  const { t } = useTranslation();
  const { formatPrice } = useFormattedPrice();
  const [step, setStep] = useState<1 | 2>(1);
  const [finalPrice, setFinalPrice] = useState<string>(askingPrice.toString());

  const isSale = listingType === 'sale';
  
  const handleContinueToStep2 = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirmWithPrice = () => {
    const price = parseFloat(finalPrice);
    if (price > 0) {
      onConfirm(price);
    } else {
      onConfirm(null);
    }
  };

  const handleSkip = () => {
    onConfirm(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep(1);
      setFinalPrice(askingPrice.toString());
    }
    onOpenChange(open);
  };

  const priceValue = parseFloat(finalPrice) || 0;
  const priceDiff = priceValue - askingPrice;
  const priceDiffPercent = askingPrice > 0 ? ((priceDiff / askingPrice) * 100).toFixed(1) : '0';

  const getPriceComparisonIcon = () => {
    if (priceDiff > 0) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (priceDiff < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getPriceComparisonText = () => {
    if (priceDiff > 0) return `+${priceDiffPercent}% ${t('markCompleted.aboveAsking')}`;
    if (priceDiff < 0) return `${priceDiffPercent}% ${t('markCompleted.belowAsking')}`;
    return t('markCompleted.atAsking');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 1 ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <PartyPopper className="h-6 w-6 text-emerald-500" />
                </div>
                <DialogTitle className="text-xl">
                  {isSale ? t('markCompleted.congratsSale') : t('markCompleted.congratsRental')}
                </DialogTitle>
              </div>
              <DialogDescription className="text-base">
                {listingAddress && (
                  <span className="block font-medium text-foreground mb-2">"{listingAddress}"</span>
                )}
                {isSale ? t('markCompleted.step1DescSale') : t('markCompleted.step1DescRental')}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleContinueToStep2}
                disabled={isLoading}
                className="bg-emerald-500 text-white hover:bg-emerald-600"
              >
                {t('common.continue')} →
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -ml-2"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ChartBar className="h-5 w-5 text-blue-500" />
                </div>
                <DialogTitle className="text-lg">
                  {t('markCompleted.shareFinalPrice')}
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm">
                {t('markCompleted.step2Desc')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Benefits */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                  <Users className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {t('markCompleted.benefit1')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                  <ChartBar className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {t('markCompleted.benefit2')}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/50">
                  <Shield className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {t('markCompleted.benefit3')}
                  </p>
                </div>
              </div>

              {/* Asking price reference */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-0.5">{t('markCompleted.askingPrice')}</p>
                <p className="font-semibold text-foreground">
                  {formatPrice(askingPrice, currency, { isRental: !isSale, showPeriod: !isSale })}
                </p>
              </div>

              {/* Final price input */}
              <div>
                <Label htmlFor="finalPrice" className="text-sm font-medium">
                  {isSale ? t('markCompleted.finalSalePrice') : t('markCompleted.finalRentPrice')}
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="finalPrice"
                    type="number"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    className="pr-16 text-lg font-medium"
                    placeholder={askingPrice.toString()}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {currency}
                  </span>
                </div>
              </div>

              {/* Price comparison */}
              {priceValue > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                  {getPriceComparisonIcon()}
                  <span className={`text-sm font-medium ${
                    priceDiff > 0 ? 'text-emerald-500' : priceDiff < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {getPriceComparisonText()}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground"
              >
                {t('markCompleted.skipAndComplete')}
              </Button>
              <Button
                onClick={handleConfirmWithPrice}
                disabled={isLoading || priceValue <= 0}
                className="bg-emerald-500 text-white hover:bg-emerald-600"
              >
                {isLoading ? t('common.saving') : t('markCompleted.savePrice')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
