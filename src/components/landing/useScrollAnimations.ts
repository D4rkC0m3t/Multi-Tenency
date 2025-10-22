import { useEffect, useState } from 'react';

/**
 * Custom hook for scroll-based animations
 * Handles intersection observer and scroll position tracking
 */
export const useScrollAnimations = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Update CSS variable for parallax effects
      document.documentElement.style.setProperty('--scroll', `${window.scrollY}`);
    };

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll(
      '.fade-in-scroll, .scale-in-scroll, .rotate-in-scroll, ' +
      '.blur-to-focus, .slide-fade-left, .slide-fade-right, ' +
      '.stagger-children, .line-divider, .line-expand-center, ' +
      '.scrub-reveal, .text-reveal-mask'
    );

    animatedElements.forEach(el => observer.observe(el));

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return { scrollY };
};

/**
 * Split text into animated letters
 */
export const splitTextToLetters = (text: string, className: string = 'letter-slide-down') => {
  return text.split('').map((char, index) => (
    char === ' ' ? ' ' : `<span class="${className}" key="${index}">${char}</span>`
  )).join('');
};

/**
 * Split text into animated words
 */
export const splitTextToWords = (text: string, className: string = 'slide-from-right') => {
  return text.split(' ').map((word, index) => (
    `<span class="${className} ${className}-delay-${index + 1}" key="${index}">${word}</span>`
  )).join(' ');
};

/**
 * Counter animation utility
 */
export const animateCounter = (
  element: HTMLElement,
  start: number,
  end: number,
  duration: number = 2000
) => {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString();
  }, 16);

  return () => clearInterval(timer);
};

/**
 * Magnetic effect for elements
 */
export const useMagneticEffect = (ref: React.RefObject<HTMLElement>, strength: number = 0.3) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0, 0)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, strength]);
};

/**
 * Scroll progress indicator
 */
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
};
