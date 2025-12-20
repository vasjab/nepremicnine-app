import { useMemo } from 'react';
import { Check, Circle, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export interface ChecklistItem {
  id: string;
  label: string;
  isComplete: boolean;
  onClick?: () => void;
}

interface FormCompletionChecklistProps {
  items: ChecklistItem[];
  title?: string;
}

export function FormCompletionChecklist({ items, title }: FormCompletionChecklistProps) {
  const { t } = useTranslation();
  
  const { completedCount, totalCount, percentage, isAllComplete } = useMemo(() => {
    const completed = items.filter(item => item.isComplete).length;
    const total = items.length;
    return {
      completedCount: completed,
      totalCount: total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      isAllComplete: completed === total,
    };
  }, [items]);

  return (
    <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            {title || t('checklist.formCompletion')}
          </CardTitle>
          <span className={cn(
            "text-sm font-medium",
            isAllComplete ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
          )}>
            {completedCount}/{totalCount} {t('checklist.complete')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress 
            value={percentage} 
            className={cn(
              "h-2",
              isAllComplete && "[&>div]:bg-green-500"
            )}
          />
          <p className={cn(
            "text-xs text-right",
            isAllComplete ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
          )}>
            {isAllComplete ? t('checklist.allComplete') : `${percentage}%`}
          </p>
        </div>

        {/* Checklist items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              disabled={item.isComplete || !item.onClick}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
                item.isComplete
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
                  : "text-muted-foreground hover:bg-muted/50 cursor-pointer",
                !item.onClick && !item.isComplete && "cursor-default"
              )}
            >
              {item.isComplete ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Helper text */}
        {!isAllComplete && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            {t('checklist.clickToNavigate')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
