import { useCallback } from 'react';
import { useInternationalization } from '@/contexts/InternationalizationContext';
import { getTranslation, Language } from '@/lib/translations';

export function useTranslation() {
  const { language } = useInternationalization();
  
  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>) => {
      let result = getTranslation(language, key);
      
      if (replacements) {
        Object.entries(replacements).forEach(([placeholder, value]) => {
          result = result.replace(`{${placeholder}}`, String(value));
        });
      }
      
      return result;
    },
    [language]
  );
  
  return { t, language };
}
