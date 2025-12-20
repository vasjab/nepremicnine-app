import { WizardStepWrapper } from '../WizardStepWrapper';
import { cn } from '@/lib/utils';
import { Lightbulb } from 'lucide-react';

interface TitleStepProps {
  title: string;
  onTitleChange: (title: string) => void;
  error?: string;
}

const TITLE_TIPS = [
  "Include the neighborhood name",
  "Mention standout features (sunlit, renovated, etc.)",
  "Add bedroom count for quick scanning",
];

export function TitleStep({ title, onTitleChange, error }: TitleStepProps) {
  const charCount = title.length;
  const maxChars = 200;
  const minChars = 5;
  const isValid = charCount >= minChars && charCount <= maxChars;

  return (
    <WizardStepWrapper
      title="Give it a catchy title"
      subtitle="This is the first thing people see"
      emoji="✨"
    >
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Large Input */}
        <div className="relative">
          <textarea
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onTouchStart={(e) => {
              // Ensure focus on iOS Safari
              e.currentTarget.focus();
            }}
            onFocus={(e) => {
              // Scroll into view on focus for mobile
              setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }}
            placeholder="Cozy 2-bedroom in Södermalm with balcony..."
            rows={3}
            inputMode="text"
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
            enterKeyHint="done"
            className={cn(
              "w-full p-6 text-xl md:text-2xl font-medium bg-card border-2 rounded-2xl resize-none transition-all duration-300",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none focus:ring-0",
              // iOS Safari touch optimization
              "touch-action-auto",
              error 
                ? "border-destructive focus:border-destructive" 
                : isValid 
                  ? "border-success focus:border-success"
                  : "border-border focus:border-accent"
            )}
            style={{ 
              WebkitUserSelect: 'text',
              userSelect: 'text',
              WebkitAppearance: 'none',
              fontSize: '16px', // Prevents iOS zoom on focus
            }}
          />
          
          {/* Character Count */}
          <div className={cn(
            "absolute bottom-3 right-4 text-sm font-medium transition-colors pointer-events-none",
            charCount > maxChars ? "text-destructive" : charCount >= minChars ? "text-success" : "text-muted-foreground"
          )}>
            {charCount} / {maxChars}
          </div>
        </div>

        {error && (
          <p className="text-destructive text-sm font-medium text-center">{error}</p>
        )}

        {/* Tips */}
        <div className="bg-accent/10 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-accent font-medium">
            <Lightbulb className="h-4 w-4" />
            Pro tips for a great title
          </div>
          <ul className="space-y-1">
            {TITLE_TIPS.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-accent">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WizardStepWrapper>
  );
}
