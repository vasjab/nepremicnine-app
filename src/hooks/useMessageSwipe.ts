import { useState, useCallback, useRef } from 'react';

interface SwipeState {
  messageId: string | null;
  offset: number;
  isActive: boolean;
}

interface UseMessageSwipeOptions {
  onSwipeComplete: (messageId: string) => void;
  swipeThreshold?: number;
  maxSwipeDistance?: number;
}

export function useMessageSwipe({
  onSwipeComplete,
  swipeThreshold = 60,
  maxSwipeDistance = 100,
}: UseMessageSwipeOptions) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    messageId: null,
    offset: 0,
    isActive: false,
  });
  
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent, messageId: string) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setSwipeState({
      messageId,
      offset: 0,
      isActive: true,
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeState.isActive || !swipeState.messageId) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Determine swipe direction on first significant movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    // Only handle horizontal swipes
    if (isHorizontalSwipe.current === false) {
      setSwipeState(prev => ({ ...prev, isActive: false, offset: 0 }));
      return;
    }

    // Only allow right swipe (positive delta)
    if (deltaX > 0) {
      // Apply dampening as we approach max distance
      const dampening = 1 - (deltaX / maxSwipeDistance) * 0.3;
      const dampedOffset = Math.min(deltaX * dampening, maxSwipeDistance);
      setSwipeState(prev => ({ ...prev, offset: dampedOffset }));
    }
  }, [swipeState.isActive, swipeState.messageId, maxSwipeDistance]);

  const handleTouchEnd = useCallback(() => {
    if (!swipeState.isActive || !swipeState.messageId) return;

    if (swipeState.offset >= swipeThreshold) {
      onSwipeComplete(swipeState.messageId);
    }

    // Reset with animation
    setSwipeState({
      messageId: null,
      offset: 0,
      isActive: false,
    });
  }, [swipeState, swipeThreshold, onSwipeComplete]);

  const getSwipeStyles = useCallback((messageId: string) => {
    if (swipeState.messageId !== messageId) {
      return {
        transform: 'translateX(0)',
        transition: 'transform 0.2s ease-out',
      };
    }

    return {
      transform: `translateX(${swipeState.offset}px)`,
      transition: swipeState.isActive ? 'none' : 'transform 0.2s ease-out',
    };
  }, [swipeState]);

  const getReplyIconOpacity = useCallback((messageId: string) => {
    if (swipeState.messageId !== messageId) return 0;
    // Start showing at 20px, fully visible at threshold
    return Math.min(1, Math.max(0, (swipeState.offset - 20) / (swipeThreshold - 20)));
  }, [swipeState, swipeThreshold]);

  const getReplyIconScale = useCallback((messageId: string) => {
    const opacity = getReplyIconOpacity(messageId);
    return 0.5 + (opacity * 0.5); // Scale from 0.5 to 1
  }, [getReplyIconOpacity]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getSwipeStyles,
    getReplyIconOpacity,
    getReplyIconScale,
    isSwipingMessage: swipeState.messageId,
  };
}
