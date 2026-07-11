import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '../cart/CartContext';
import type { CategoryView, ProductView } from '../types';
import { formatNaira } from '../utils/money';
import { ImageWithFallback } from './ImageWithFallback';
import { Input } from './ui/input';

interface ProductsProps {
  products: ProductView[];
  categories: CategoryView[];
  loading: boolean;
  usedFallback: boolean;
  onRetry: () => void;
  targetCategory: string | null;
  onTargetHandled: () => void;
}

function Skeletons() {
  return (
    <div className="product-grid" aria-label="Loading products">
      {Array.from({ length: 8 }, (_, i) => (
        <div className="product-skeleton" key={i}>
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

export function Products({
  products,
  categories,
  loading,
  usedFallback,
  onRetry,
  targetCategory,
  onTargetHandled,
}: ProductsProps) {
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(
      () => setSearch(query.trim().toLowerCase()),
      220,
    );
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!targetCategory) return;
    const target = targetCategory.toLowerCase();
    const match = categories.find(
      (category) =>
        category.id.toLowerCase() === target ||
        category.slug.toLowerCase() === target ||
        category.name.toLowerCase().includes(target),
    );
    setActive(match?.id ?? 'all');
    onTargetHandled();
  }, [categories, onTargetHandled, targetCategory]);

  const visible = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory =
          active === 'all' ||
          product.categoryId === active ||
          product.category.toLowerCase() === active.toLowerCase();
        const matchesSearch =
          !search ||
          `${product.name} ${product.description} ${product.category}`
            .toLowerCase()
            .includes(search);
        return matchesCategory && matchesSearch;
      }),
    [products, active, search],
  );

  return (
    <section
      id="products"
      className="products page-section"
      aria-labelledby="products-title"
    >
      <div className="product-header section-reveal">
        <div>
          <h2 id="products-title">New and noteworthy.</h2>
        </div>
        <label className="search-field">
          <MagnifyingGlassIcon aria-hidden="true" />
          <span className="sr-only">Search products</span>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
          />
        </label>
      </div>
      <div
        className="filter-row section-reveal"
        role="group"
        aria-label="Filter products by category"
      >
        <button
          className={active === 'all' ? 'active' : ''}
          onClick={() => setActive('all')}
        >
          All departments
        </button>
        {categories.slice(0, 8).map((category) => (
          <button
            key={category.id}
            className={active === category.id ? 'active' : ''}
            onClick={() => setActive(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      {usedFallback && (
        <div className="fallback-note" role="status">
          <span>Preview catalog</span> The live catalog is offline, so we are
          showing a local marketplace edit.{' '}
          <button onClick={onRetry}>Retry</button>
        </div>
      )}
      {loading ? (
        <Skeletons />
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing matches that search.</h3>
          <p>Try another department or a broader product name.</p>
          <button
            className="button button-dark pressable"
            onClick={() => {
              setActive('all');
              setQuery('');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <motion.div layout className="product-grid">
          <AnimatePresence mode="popLayout">
            {visible.map((product) => (
              <motion.article
                layout
                key={product.id}
                className="product-card"
                initial={{ opacity: 0, transform: 'translateY(12px)' }}
                animate={{ opacity: 1, transform: 'translateY(0)' }}
                exit={{ opacity: 0, transform: 'translateY(8px)' }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="product-image">
                  <ImageWithFallback src={product.image} alt={product.name} />
                  <button
                    className="quick-add pressable"
                    aria-label={`Add ${product.name} to cart`}
                    disabled={product.stock === 0}
                    onClick={() => {
                      addProduct(product);
                      toast.success('Added to cart', {
                        description: product.name,
                        action: { label: 'View cart', onClick: () => navigate('/cart') },
                      });
                    }}
                  >
                    <span>{product.stock === 0 ? 'Unavailable' : 'Add to cart'}</span>
                    <ShoppingBagIcon aria-hidden="true" />
                  </button>
                  {product.stock === 0 && (
                    <span className="sold-out">Out of stock</span>
                  )}
                </div>
                <div className="product-meta">
                  <p>{product.category}</p>
                  {product.reviews !== undefined && (
                    <span>{product.reviews} reviews</span>
                  )}
                </div>
                <h3>{product.name}</h3>
                <div className="product-bottom">
                  <p>{product.description}</p>
                  <strong>{formatNaira(product.price)}</strong>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
