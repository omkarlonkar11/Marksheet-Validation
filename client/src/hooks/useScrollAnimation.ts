import { useEffect, useState, useRef } from 'react';

/**
 * A hook that detects when an element enters the viewport
 * to trigger animations on scroll
 */
export function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the element enters the viewport, set visibility state to true
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once we've seen it, no need to keep observing
          observer.unobserve(entry.target);
        }
      },
      // Start animation when element is 10% in view
      { threshold: 0.1 }
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return { isVisible, elementRef };
}

export default useScrollAnimation; 