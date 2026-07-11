import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import gsap from 'gsap';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { heroSlides } from '../data';
import { ImageWithFallback } from './ImageWithFallback';

interface HeroProps {
  onExplore: (target?: string) => void;
}

export function Hero({ onExplore }: HeroProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [visible, setVisible] = useState(true);
  const visualRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const slide = heroSlides[active];
  const autoplayPaused = Boolean(
    reduceMotion || paused || manualPause || !visible,
  );

  useEffect(() => {
    const onVisibility = () =>
      setVisible(document.visibilityState === 'visible');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (autoplayPaused) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % heroSlides.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [autoplayPaused]);

  const selectSlide = (next: number) => {
    setManualPause(true);
    setActive((next + heroSlides.length) % heroSlides.length);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType === 'touch' || !visualRef.current)
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(visualRef.current, {
      rotateY: x * 3,
      rotateX: y * -3,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: true,
    });
  };

  const resetPointer = () => {
    if (visualRef.current)
      gsap.to(visualRef.current, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.45,
        ease: 'power3.out',
      });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowRight') selectSlide(active + 1);
    if (event.key === 'ArrowLeft') selectSlide(active - 1);
    if (event.key === 'Home') selectSlide(0);
    if (event.key === 'End') selectSlide(heroSlides.length - 1);
  };

  return (
    <section
      id="top"
      ref={heroRef}
      className="hero section-reveal"
      aria-labelledby="hero-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!heroRef.current?.contains(event.relatedTarget)) setPaused(false);
      }}
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      <div
        className="hero-media"
        onPointerMove={onPointerMove}
        onPointerLeave={resetPointer}
      >
        <div className="hero-grid" aria-hidden="true" />
        <div
          className="hero-accent"
          style={{ backgroundColor: slide.accent }}
          aria-hidden="true"
        />
        <AnimatePresence mode="wait">
          <motion.div
            ref={visualRef}
            key={slide.id}
            className="hero-product"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, transform: 'translateY(16px)' }
            }
            animate={{ opacity: 1, transform: 'translateY(0)' }}
            exit={{ opacity: 0, transform: 'translateY(-10px)' }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            <ImageWithFallback src={slide.image} alt={slide.alt} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="hero-copy">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="hero-copy-inner"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, transform: 'translateY(12px)' }
            }
            animate={{ opacity: 1, transform: 'translateY(0)' }}
            exit={{ opacity: 0, transform: 'translateY(-8px)' }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="eyebrow">Curio marketplace</p>
            <h1 id="hero-title">{slide.headline}</h1>
            <p className="hero-lede">{slide.description}</p>
          </motion.div>
        </AnimatePresence>
        <div className="hero-actions">
          <button
            className="button button-dark pressable"
            onClick={() => onExplore(slide.filterTarget)}
          >
            Explore {slide.category} <ArrowRightIcon aria-hidden="true" />
          </button>
          <button className="text-link pressable" onClick={() => onExplore()}>
            Browse all <ArrowDownIcon aria-hidden="true" />
          </button>
        </div>
        <div
          className="hero-controls"
          aria-label="Featured departments controls"
        >
          <button
            className="hero-control pressable"
            onClick={() => selectSlide(active - 1)}
            aria-label="Previous featured department"
          >
            <ArrowLeftIcon aria-hidden="true" />
          </button>
          <div
            className="hero-dots"
            role="tablist"
            aria-label="Featured departments"
          >
            {heroSlides.map((item, index) => (
              <button
                key={item.id}
                className={index === active ? 'active' : ''}
                onClick={() => selectSlide(index)}
                role="tab"
                aria-selected={index === active}
                aria-label={`Show ${item.category}`}
              />
            ))}
          </div>
          <button
            className="hero-control pressable"
            onClick={() => selectSlide(active + 1)}
            aria-label="Next featured department"
          >
            <ArrowRightIcon aria-hidden="true" />
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {slide.category} slide {active + 1} of {heroSlides.length}
          {autoplayPaused ? ', autoplay paused' : ''}
        </p>
      </div>
    </section>
  );
}
