import { useState, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  storageKey: string;
}

interface RateLimitEntry {
  attempts: number[];
}

/**
 * Client-side rate limiting hook.
 * This provides a first line of defense against rapid-fire requests.
 * Server-side rate limiting via the database is the primary protection.
 */
export function useRateLimit(config: RateLimitConfig) {
  const [isLimited, setIsLimited] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const storageData = localStorage.getItem(config.storageKey);
    let entry: RateLimitEntry = { attempts: [] };

    if (storageData) {
      try {
        entry = JSON.parse(storageData);
      } catch {
        entry = { attempts: [] };
      }
    }

    // Filter out old attempts outside the window
    entry.attempts = entry.attempts.filter(
      (timestamp) => now - timestamp < config.windowMs
    );

    // Check if rate limited
    if (entry.attempts.length >= config.maxAttempts) {
      const oldestAttempt = Math.min(...entry.attempts);
      const timeUntilReset = config.windowMs - (now - oldestAttempt);
      setIsLimited(true);
      setRemainingTime(Math.ceil(timeUntilReset / 1000));
      return false;
    }

    // Record this attempt
    entry.attempts.push(now);
    localStorage.setItem(config.storageKey, JSON.stringify(entry));
    setIsLimited(false);
    setRemainingTime(0);
    return true;
  }, [config]);

  const resetRateLimit = useCallback(() => {
    localStorage.removeItem(config.storageKey);
    setIsLimited(false);
    setRemainingTime(0);
  }, [config.storageKey]);

  return {
    checkRateLimit,
    resetRateLimit,
    isLimited,
    remainingTime,
  };
}

// Pre-configured rate limits
export const AUTH_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  storageKey: 'auth_rate_limit',
};

export const LISTING_RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  storageKey: 'listing_rate_limit',
};
