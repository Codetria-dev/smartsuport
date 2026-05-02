import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCarouselReturn {
  currentIndex: number;
  goTo: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
}

export function useCarousel(itemCount: number, intervalMs = 4500): UseCarouselReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % itemCount);
    }, intervalMs);
  }, [itemCount, intervalMs, clearTimer]);

  useEffect(() => {
    if (!isPaused) {
      startTimer();
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isPaused, startTimer, clearTimer]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % itemCount);
  }, [itemCount]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? itemCount - 1 : i - 1));
  }, [itemCount]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  return { currentIndex, goTo, goNext, goPrev, isPaused, pause, resume };
}
