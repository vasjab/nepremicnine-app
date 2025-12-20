import { WizardStepWrapper } from '../WizardStepWrapper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  MapPin, 
  DollarSign,
  Type,
  Edit3
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { CURRENCY_SYMBOLS, type Currency } from '@/lib/exchangeRates';

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
}

interface ReviewStepProps {
  formData: {
    title: string;
    description: string;
    listing_type: 'rent' | 'sale';
    property_type: string;
    price: string;
    currency: Currency;
    address: string;
    city: string;
    country: string;
    bedrooms: string;
    bathrooms: string;
    area_sqm: string;
  };
  images: UploadedImage[];
  hasValidLocation: boolean;
  onEditStep: (step: number) => void;
}

interface CheckItem {
  label: string;
  isComplete: boolean;
  step: number;
  icon: typeof CheckCircle2;
}

export function ReviewStep({
  formData,
  images,
  hasValidLocation,
  onEditStep,
}: ReviewStepProps) {
  const requiredItems: CheckItem[] = [
    {
      label: 'Property type selected',
      isComplete: !!formData.property_type,
      step: 0,
      icon: CheckCircle2,
    },
    {
      label: 'Title added',
      isComplete: formData.title.length >= 5,
      step: 1,
      icon: Type,
    },
    {
      label: 'Location set',
      isComplete: hasValidLocation && !!formData.address && !!formData.city,
      step: 2,
      icon: MapPin,
    },
    {
      label: 'Price set',
      isComplete: !!formData.price && parseFloat(formData.price) > 0,
      step: 3,
      icon: DollarSign,
    },
  ];

  const optionalItems: CheckItem[] = [
    {
      label: 'Photos uploaded',
      isComplete: images.length > 0,
      step: 4,
      icon: ImageIcon,
    },
  ];

  const allComplete = requiredItems.every(item => item.isComplete);
  const price = parseFloat(formData.price) || 0;

  return (
    <WizardStepWrapper
      title="Review your listing"
      subtitle="Make sure everything looks good before publishing"
      emoji="🎉"
    >
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Preview Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
          {/* Image */}
          <div className="aspect-[16/9] bg-secondary relative overflow-hidden">
            {images.length > 0 ? (
              <img 
                src={images[0].url} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-12 w-12" />
              </div>
            )}
            
            {/* Image count badge */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-foreground/80 text-background px-2 py-1 rounded-lg text-sm font-medium">
                +{images.length - 1} more
              </div>
            )}

            {/* Listing type badge */}
            <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
              For {formData.listing_type === 'rent' ? 'Rent' : 'Sale'}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            <h3 className="font-display text-xl font-semibold text-foreground line-clamp-2">
              {formData.title || 'Your listing title'}
            </h3>
            
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4" />
              {formData.address ? `${formData.address}, ${formData.city}` : 'Location not set'}
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                {price > 0 ? formatPrice(price, formData.currency) : 'Price not set'}
              </span>
              {formData.listing_type === 'rent' && price > 0 && (
                <span className="text-muted-foreground text-sm">/ month</span>
              )}
            </div>

            {/* Quick stats */}
            {(formData.bedrooms || formData.bathrooms || formData.area_sqm) && (
              <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                {formData.bedrooms && (
                  <span>{formData.bedrooms} bed{parseInt(formData.bedrooms) !== 1 ? 's' : ''}</span>
                )}
                {formData.bathrooms && (
                  <span>{formData.bathrooms} bath{parseInt(formData.bathrooms) !== 1 ? 's' : ''}</span>
                )}
                {formData.area_sqm && (
                  <span>{formData.area_sqm} m²</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Required Checklist */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h4 className="font-medium text-foreground">Required</h4>
          {requiredItems.map((item, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors",
                item.isComplete ? "bg-success/10" : "bg-destructive/10"
              )}
            >
              <div className="flex items-center gap-3">
                {item.isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <span className={cn(
                  "font-medium",
                  item.isComplete ? "text-foreground" : "text-destructive"
                )}>
                  {item.label}
                </span>
              </div>
              
              {!item.isComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditStep(item.step)}
                  className="text-accent hover:text-accent"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Fix
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Optional Checklist */}
        <div className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
          <h4 className="font-medium text-muted-foreground text-sm">Optional (recommended)</h4>
          {optionalItems.map((item, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors",
                item.isComplete ? "bg-success/10" : "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                {item.isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={cn(
                  "font-medium",
                  item.isComplete ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </div>
              
              {!item.isComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditStep(item.step)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Status message */}
        <div className={cn(
          "text-center p-4 rounded-xl",
          allComplete ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        )}>
          {allComplete ? (
            <p className="font-medium">All set! Your listing is ready to publish.</p>
          ) : (
            <p>Complete all required items to publish your listing.</p>
          )}
        </div>
      </div>
    </WizardStepWrapper>
  );
}
