import { useMemo, useState } from 'react';
import { Check, Circle, ClipboardList, Star, ChevronDown, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export interface ChecklistItem {
  id: string;
  label: string;
  isComplete: boolean;
  isOptional?: boolean;
  onClick?: () => void;
}

interface FormCompletionChecklistProps {
  items: ChecklistItem[];
  title?: string;
}

export function FormCompletionChecklist({ items, title }: FormCompletionChecklistProps) {
  const { t } = useTranslation();
  const [bonusOpen, setBonusOpen] = useState(false);
  
  const { 
    requiredItems, 
    bonusItems, 
    requiredCompleted, 
    bonusCompleted,
    requiredPercentage,
    bonusPercentage,
    isAllRequiredComplete,
  } = useMemo(() => {
    const required = items.filter(item => !item.isOptional);
    const bonus = items.filter(item => item.isOptional);
    const reqCompleted = required.filter(item => item.isComplete).length;
    const bonCompleted = bonus.filter(item => item.isComplete).length;
    
    return {
      requiredItems: required,
      bonusItems: bonus,
      requiredCompleted: reqCompleted,
      bonusCompleted: bonCompleted,
      requiredPercentage: required.length > 0 ? Math.round((reqCompleted / required.length) * 100) : 0,
      bonusPercentage: bonus.length > 0 ? Math.round((bonCompleted / bonus.length) * 100) : 0,
      isAllRequiredComplete: reqCompleted === required.length,
    };
  }, [items]);

  // Gamification message based on bonus completion
  const getBonusMessage = () => {
    if (bonusItems.length === 0) return null;
    if (bonusPercentage >= 75) return t('checklist.outstanding');
    if (bonusPercentage >= 50) return t('checklist.greatJob');
    if (bonusPercentage >= 25) return t('checklist.goodStart');
    return t('checklist.encourageMore');
  };

  const bonusMessage = getBonusMessage();

  return (
    <Card className="sticky top-20 z-10 mb-6 border-border/50 bg-card/95 backdrop-blur-md shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            {title || t('checklist.formCompletion')}
          </CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <span className={cn(
              "font-medium",
              isAllRequiredComplete ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}>
              {requiredCompleted}/{requiredItems.length} {t('checklist.requiredFields')}
            </span>
            {bonusItems.length > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {bonusCompleted}/{bonusItems.length}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Required progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t('checklist.requiredFields')}</span>
            <span className={cn(
              isAllRequiredComplete ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}>
              {isAllRequiredComplete ? t('checklist.allComplete') : `${requiredPercentage}%`}
            </span>
          </div>
          <Progress 
            value={requiredPercentage} 
            className={cn(
              "h-2",
              isAllRequiredComplete && "[&>div]:bg-green-500"
            )}
          />
        </div>

        {/* Bonus progress bar */}
        {bonusItems.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                {t('checklist.bonusFields')}
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                {bonusPercentage >= 75 && <Trophy className="h-3 w-3 inline mr-1" />}
                {bonusPercentage}%
              </span>
            </div>
            <Progress 
              value={bonusPercentage} 
              className="h-2 [&>div]:bg-amber-500"
            />
            {bonusMessage && (
              <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                {bonusMessage}
              </p>
            )}
          </div>
        )}

        {/* Required checklist items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {requiredItems.map((item) => (
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

        {/* Bonus checklist items - collapsible */}
        {bonusItems.length > 0 && (
          <Collapsible open={bonusOpen} onOpenChange={setBonusOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-muted/30 rounded-md px-2 transition-colors">
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-current" />
                {t('checklist.bonusFields')} ({bonusCompleted}/{bonusItems.length})
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                bonusOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <p className="text-xs text-muted-foreground mb-2 px-2">
                {t('checklist.bonusSubtitle')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bonusItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onClick}
                    disabled={item.isComplete || !item.onClick}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
                      item.isComplete
                        ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
                        : "text-muted-foreground hover:bg-muted/50 cursor-pointer",
                      !item.onClick && !item.isComplete && "cursor-default"
                    )}
                  >
                    {item.isComplete ? (
                      <Star className="h-4 w-4 shrink-0 fill-current" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Helper text */}
        {!isAllRequiredComplete && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            {t('checklist.clickToNavigate')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
