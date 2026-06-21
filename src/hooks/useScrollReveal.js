import { useEffect } from 'react';

const useScrollReveal = (ref, options = {}) => {
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            el.classList.add('is-visible');
            observer.disconnect();
          });
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px', ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
};

export default useScrollReveal;
