import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRightIcon,
  Bars2Icon,
  ShoppingBagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';

interface HeaderProps {
  onScroll: (id: string) => void;
}

export function Header({ onScroll }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const routerNavigate = useNavigate();
  const { status, user } = useAuth();
  const { count } = useCart();
  const canUseCart = status === 'anonymous' || user?.role === 'CUSTOMER';

  const navigate = (id: string) => {
    setOpen(false);
    onScroll(id);
  };

  return (
    <header className="site-header">
      <div className="nav-shell">
        <button
          className="wordmark pressable"
          onClick={() => navigate('top')}
          aria-label="Curio home"
        >
          curio<span>.</span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          <button onClick={() => navigate('categories')}>Departments</button>
          <button onClick={() => navigate('products')}>New arrivals</button>
          <button onClick={() => navigate('story')}>Our promise</button>
        </nav>
        <div className="nav-actions">
          {canUseCart && (
            <button
              className="bag-button pressable"
              aria-label={`Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`}
              onClick={() => routerNavigate('/cart')}
            >
              <ShoppingBagIcon aria-hidden="true" />
              <span>{count}</span>
            </button>
          )}
          <button
            className="menu-button pressable"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? (
              <XMarkIcon aria-hidden="true" />
            ) : (
              <Bars2Icon aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, transform: 'translateY(-8px) scale(.98)' }
            }
            animate={{ opacity: 1, transform: 'translateY(0) scale(1)' }}
            exit={{ opacity: 0, transform: 'translateY(-6px) scale(.98)' }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            <button onClick={() => navigate('categories')}>
              Departments <ArrowRightIcon aria-hidden="true" />
            </button>
            <button onClick={() => navigate('products')}>
              New arrivals <ArrowRightIcon aria-hidden="true" />
            </button>
            <button onClick={() => navigate('story')}>
              Our promise <ArrowRightIcon aria-hidden="true" />
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
