import { useState } from 'react';
import { PartyPopper, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
}

export function MarkCompletedModal({
  open,
  onOpenChange,
  listingType,
  askingPrice,
  currency,
  onConfirm,
  isLoading = false,
}: MarkCompletedModalProps) {
  const { t } = useTranslation();
  const { formatPrice } = useFormattedPrice();
  const [finalPrice, setFinalPrice] = useState<string>(askingPrice.toString());
  const [showPriceInput, setShowPriceInput] = useState(false);

  const isSale = listingType === 'sale';
  const title = isSale ? t('markCompleted.soldTitle') : t('markCompleted.rentedTitle');
  const description = isSale ? t('markCompleted.soldDescription') : t('markCompleted.rentedDescription');
  const priceLabel = isSale ? t('markCompleted.finalSalePrice') : t('markCompleted.finalRentPrice');

  const handleConfirm = () => {
    if (showPriceInput && finalPrice) {
      onConfirm(parseFloat(finalPrice));
    } else {
      onConfirm(null);
    }
  };

  const handleSkip = () => {
    onConfirm(null);
  };

  const priceValue = parseFloat(finalPrice) || 0;
  const priceDiff = priceValue - askingPrice;
  const priceDiffPercent = askingPrice > 0 ? ((priceDiff / askingPrice) * 100).toFixed(1) : '0';

  const getPriceComparisonIcon = () => {
    if (priceDiff > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (priceDiff < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getPriceComparisonText = () => {
    if (priceDiff > 0) return `+${priceDiffPercent}% ${t('markCompleted.aboveAsking')}`;
    if (priceDiff < 0) return `${priceDiffPercent}% ${t('markCompleted.belowAsking')}`;
    return t('markCompleted.atAsking');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <PartyPopper className="h-6 w-6 text-success" />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">{t('markCompleted.askingPrice')}</p>
            <p className="text-lg font-semibold">
              {formatPrice(askingPrice, currency, { isRental: !isSale, showPeriod: !isSale })}
            </p>
          </div>

          {!showPriceInput ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPriceInput(true)}
            >
              {t('markCompleted.addFinalPrice')}
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="finalPrice">{priceLabel}</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="finalPrice"
                    type="number"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {currency}
                  </span>
                </div>
              </div>

              {priceValue > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  {getPriceComparisonIcon()}
                  <span className={priceDiff > 0 ? 'text-success' : priceDiff < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                    {getPriceComparisonText()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading}
            className="sm:mr-auto"
          >
            {t('markCompleted.skip')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-success text-success-foreground hover:bg-success/90"
          >
            {isLoading ? t('common.saving') : (isSale ? t('markCompleted.markAsSold') : t('markCompleted.markAsRented'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}