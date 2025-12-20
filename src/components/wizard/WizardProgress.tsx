import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface WizardStep {
  id: string;
  title: string;
  emoji: string;
  isOptional?: boolean;
}

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (index: number) => void;
  completedSteps: Set<number>;
}

export function WizardProgress({ steps, currentStep, onStepClick, completedSteps }: WizardProgressProps) {
  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden md:flex items-center justify-between relative px-4">
        {/* Progress Line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-border" />
        <div 
          className="absolute top-5 left-8 h-0.5 bg-accent transition-all duration-500"
          style={{ 
            width: `calc(${Math.max(0, (currentStep / (steps.length - 1)) * 100)}% - 2rem)` 
          }}
        />
        
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = index === currentStep;
          const isClickable = isCompleted || index <= currentStep;
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(index)}
              className={cn(
                "relative z-10 flex flex-col items-center gap-2 transition-all duration-300",
                isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-300",
                  isCompleted && "bg-success text-success-foreground",
                  isCurrent && !isCompleted && "bg-accent text-accent-foreground ring-4 ring-accent/20 scale-110",
                  !isCompleted && !isCurrent && "bg-secondary text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.emoji}
              </div>
              <span className={cn(
                "text-xs font-medium whitespace-nowrap transition-colors",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between px-4">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            steps[currentStep]?.isOptional 
              ? "bg-muted text-muted-foreground" 
              : "bg-accent/10 text-accent"
          )}>
            {steps[currentStep]?.isOptional ? "Optional" : "Required"}
          </span>
        </div>
        
        {/* Mobile progress bar */}
        <div className="h-1.5 bg-secondary rounded-full mx-4 overflow-hidden">
          <div 
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        <div className="flex items-center gap-2 px-4">
          <span className="text-2xl">{steps[currentStep]?.emoji}</span>
          <span className="font-semibold text-foreground">{steps[currentStep]?.title}</span>
        </div>
      </div>
    </div>
  );
}
