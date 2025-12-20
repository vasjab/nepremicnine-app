import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Loader2, Eye, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isOptionalStep: boolean;
  isSubmitting: boolean;
  canPreview: boolean;
  canSaveDraft?: boolean;
  isResumingDraft?: boolean;
  isMobile?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onPreview: () => void;
  onSaveDraft?: () => void;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  canProceed,
  isOptionalStep,
  isSubmitting,
  canPreview,
  canSaveDraft = true,
  isResumingDraft = false,
  isMobile = false,
  onBack,
  onNext,
  onSubmit,
  onPreview,
  onSaveDraft,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="container mx-auto max-w-2xl flex items-center justify-between gap-2 sm:gap-4">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
          className={cn("min-w-[80px] sm:min-w-[100px]", isFirstStep && "invisible")}
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        {/* Center actions: Preview + Save Draft */}
        <div className="flex items-center gap-2">
          {/* Save as Draft button - show text on mobile */}
          {canSaveDraft && onSaveDraft && (
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className="gap-1 sm:gap-2 text-sm text-muted-foreground"
            >
              <Save className="h-4 w-4" />
              <span className={cn(isMobile ? "inline" : "hidden sm:inline")}>
                {isMobile ? "Draft" : "Save Draft"}
              </span>
            </Button>
          )}

          {/* Preview button - available after mandatory fields */}
          {canPreview && (
            <Button
              variant="outline"
              onClick={onPreview}
              disabled={isSubmitting}
              className="gap-1 sm:gap-2 text-sm"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Button>
          )}
        </div>

        {/* Next/Submit button */}
        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className="min-w-[100px] sm:min-w-[140px] bg-accent text-accent-foreground hover:bg-accent/90 gap-1 sm:gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Publishing...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span className="hidden sm:inline">{isResumingDraft ? 'Publish' : 'Publish'}</span>
                <span className="sm:hidden">Publish</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="min-w-[80px] sm:min-w-[100px] gap-1 sm:gap-2"
          >
            <span className="hidden sm:inline">Continue</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
