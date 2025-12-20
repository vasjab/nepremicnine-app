import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface WizardStepWrapperProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  children: ReactNode;
  className?: string;
}

export function WizardStepWrapper({ 
  title, 
  subtitle, 
  emoji, 
  children,
  className 
}: WizardStepWrapperProps) {
  return (
    <div className={cn("min-h-[calc(100vh-220px)] flex flex-col animate-fade-in", className)}>
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        {emoji && (
          <span className="text-5xl md:text-6xl mb-4 block animate-bounce-subtle">
            {emoji}
          </span>
        )}
        <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
