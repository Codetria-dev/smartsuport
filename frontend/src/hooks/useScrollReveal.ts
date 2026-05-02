import { useCallback, useEffect, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

interface UseScrollRevealReturn {
  ref: (node: HTMLDivElement | null) => void;
  isVisible: boolean;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}): UseScrollRevealReturn {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = options;
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, threshold, rootMargin]);

  const ref = useCallback((el: HTMLDivElement | null) => {
    setNode(el);
  }, []);

  return { ref, isVisible };
}
