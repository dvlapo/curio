import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';

function activeClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'active' : '';
}

export function StoreShell() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-frame">
      <header className="app-header">
        <Link to="/" className="app-wordmark">
          curio<span>.</span>
        </Link>
        <nav className="app-nav" aria-label="Store navigation">
          <NavLink to="/products" className={activeClass}>
            Products
          </NavLink>
          {user?.role === 'CUSTOMER' && (
            <NavLink to="/orders" className={activeClass}>
              Orders
            </NavLink>
          )}
          {user && (
            <NavLink to="/profile" className={activeClass}>
              Profile
            </NavLink>
          )}
          {user?.role === 'VENDOR' && (
            <NavLink to="/vendor" end className={activeClass}>
              Vendor
            </NavLink>
          )}
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin/users" className={activeClass}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="app-actions">
          {user ? (
            <button className="icon-text pressable" onClick={signOut}>
              <ArrowRightOnRectangleIcon aria-hidden="true" />
              <span>Logout</span>
            </button>
          ) : (
            <Link to="/login" className="text-button">
              Sign in
            </Link>
          )}
          <Link
            to="/cart"
            className="cart-link"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingBagIcon aria-hidden="true" />
            <span>{count}</span>
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

interface DashboardShellProps {
  title: string;
  links: Array<{ to: string; label: string }>;
}

export function DashboardShell({ title, links }: DashboardShellProps) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link to="/" className="app-wordmark">
          curio<span>.</span>
        </Link>
        <p>{title}</p>
        <nav aria-label={`${title} navigation`}>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end className={activeClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
