import { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from 'motion/react';
import { getLandingData } from '../api';
import {
  fallbackCategories,
  fallbackProducts,
  normalizeCategories,
  normalizeProducts,
} from '../data';
import {
  Categories,
  Footer,
  Header,
  Hero,
  MobileCatalogShortcut,
  Newsletter,
  Products,
  Story,
} from '../components';
import type { CategoryView, ProductView } from '../types';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] =
    useState<CategoryView[]>(fallbackCategories);
  const [products, setProducts] = useState<ProductView[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const [targetCategory, setTargetCategory] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const load = useCallback((signal?: AbortSignal) => {
    setLoading(true);
    getLandingData(signal)
      .then(([categoryData, productData]) => {
        setCategories(normalizeCategories(categoryData));
        setProducts(normalizeProducts(productData.data));
        setUsedFallback(false);
      })
      .catch((error: unknown) => {
        if (
          signal?.aborted ||
          (error instanceof DOMException && error.name === 'AbortError')
        )
          return;
        setCategories(fallbackCategories);
        setProducts(fallbackProducts);
        setUsedFallback(true);
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    if (reduceMotion) return;
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !rootRef.current) return;
    const context = gsap.context(() => {
      gsap.from('.hero-copy > *', {
        opacity: 0,
        y: 20,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power3.out',
      });
      gsap.from('.hero-media', {
        opacity: 0,
        clipPath: 'inset(0 0 100% 0)',
        duration: 1,
        ease: 'power3.out',
        delay: 0.12,
      });
      gsap.utils
        .toArray<HTMLElement>('.section-reveal')
        .filter((element) => !element.closest('.hero'))
        .forEach((element) => {
          gsap.from(element, {
            opacity: 0,
            y: 28,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              once: true,
            },
          });
        });
      gsap.to('.hero-product', {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        },
      });
    }, rootRef);
    return () => context.revert();
  }, [reduceMotion, loading]);

  const scrollTo = useCallback(
    (id: string) => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    },
    [reduceMotion],
  );

  const explore = useCallback(
    (target?: string) => {
      setTargetCategory(target ?? null);
      scrollTo('products');
    },
    [scrollTo],
  );

  const chooseCategory = useCallback(
    (category: CategoryView) => {
      setTargetCategory(category.id);
      scrollTo('products');
    },
    [scrollTo],
  );

  const clearTargetCategory = useCallback(() => setTargetCategory(null), []);

  return (
    <div ref={rootRef}>
      <Header onScroll={scrollTo} />
      <main className="mb-40">
        <Hero onExplore={explore} />
        <Categories
          categories={categories.length ? categories : fallbackCategories}
          onChoose={chooseCategory}
        />
        <Products
          products={products}
          categories={categories}
          loading={loading}
          usedFallback={usedFallback}
          onRetry={() => load()}
          targetCategory={targetCategory}
          onTargetHandled={clearTargetCategory}
        />
        <Story />
        <Newsletter />
      </main>
      <Footer />
      <MobileCatalogShortcut onClick={() => explore()} />
    </div>
  );
}
