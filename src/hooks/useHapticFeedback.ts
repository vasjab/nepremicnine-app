/**
 * Hook for providing haptic feedback on mobile devices
 * Uses the Vibration API when available
 */
export function useHapticFeedback() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const trigger = (pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection') => {
    if (!isSupported) return;

    const patterns: Record<typeof pattern, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 30, 10],
      error: [50, 30, 50],
      selection: 5,
    };

    try {
      navigator.vibrate(patterns[pattern]);
    } catch {
      // Silently fail if vibration is not allowed
    }
  };

  return { trigger, isSupported };
}
