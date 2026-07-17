import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useCart } from '../../cart/CartContext';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { formatMoney } from '../../utils/money';
import { PageIntro } from './components/PageIntro';

export function CartPage() {
  const location = useLocation();
  const { status } = useAuth();
  const { items, setQuantity, removeItem, subtotal } = useCart();
  const cartError =
    location.state &&
    typeof location.state === 'object' &&
    'cartError' in location.state
      ? String((location.state as { cartError: string }).cartError)
      : '';

  return (
    <main className="page-shell">
      <PageIntro
        title="Cart"
        body="Your cart is stored on this device. Final prices and stock are confirmed by the server at checkout."
      />
      {cartError && <div className="form-error">{cartError}</div>}
      {items.length === 0 ? (
        <div className="empty-panel">
          <h2>Your cart is empty.</h2>
          <p className="mb-2">Browse the catalog to add something useful.</p>
          <Button asChild size="lg">
            <Link to="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-row" key={item.productId}>
                <ImageWithFallback src={item.image} alt={item.name} />
                <div>
                  <h2>{item.name}</h2>
                  <p>{formatMoney(item.price)}</p>
                  {item.stock === 0 && (
                    <span className="inline-warning">Out of stock</span>
                  )}
                </div>
                <Input
                  aria-label={`Quantity for ${item.name}`}
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(event) =>
                    setQuantity(item.productId, Number(event.target.value))
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                >
                  Remove
                </Button>
              </article>
            ))}
          </div>
          <aside className="summary-panel">
            <p>Estimated subtotal</p>
            <strong>{formatMoney(subtotal)}</strong>
            <p>
              Server pricing and stock are checked when the order is created.
            </p>
            {status === 'authenticated' ? (
              <Button asChild size="lg">
                <Link to="/checkout">Checkout</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/login" state={{ from: { pathname: '/checkout' } }}>
                  Sign in to checkout
                </Link>
              </Button>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
