import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, SkipForward, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isOptionalStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  onSubmit: () => void;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  canProceed,
  isOptionalStep,
  isSubmitting,
  onBack,
  onNext,
  onSkip,
  onSubmit,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="container mx-auto max-w-2xl flex items-center justify-between gap-4">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
          className={cn("min-w-[100px]", isFirstStep && "invisible")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Skip button for optional steps */}
        {isOptionalStep && !isLastStep && onSkip && (
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={isSubmitting}
            className="text-muted-foreground"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip
          </Button>
        )}

        {/* Next/Submit button */}
        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className="min-w-[140px] bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Publish Listing
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="min-w-[100px] gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
