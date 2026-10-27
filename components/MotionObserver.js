'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Adds `is-in` to every [data-reveal] element as it scrolls into view.
// Content is only hidden once this has run (html.motion), so nothing is lost if JavaScript fails.
export default function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = Array.from(document.querySelectorAll('[data-reveal]:not(.is-in)'));

    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }

    root.classList.add('motion');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -2% 0px', threshold: 0.04 }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
