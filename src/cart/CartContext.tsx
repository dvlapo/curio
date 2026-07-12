import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import type { Money, Product, ProductView } from '../types';

const CART_KEY = 'curio_cart';

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: Money | number;
  quantity: number;
  stock?: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addProduct: (product: Product | ProductView, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readCart() {
  try {
    const value = localStorage.getItem(CART_KEY);
    return value ? (JSON.parse(value) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function normalizeProduct(
  product: Product | ProductView,
): Omit<CartItem, 'quantity'> {
  const isApiProduct = 'images' in product;
  return {
    productId: product.id,
    name: product.name,
    image: isApiProduct ? (product.images?.[0] ?? '') : product.image,
    price: product.price,
    stock: isApiProduct ? product.inventory?.quantity : product.stock,
  };
}

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(readCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addProduct = useCallback(
    (product: Product | ProductView, quantity = 1) => {
      const next = normalizeProduct(product);
      setItems((current) => {
        const existing = current.find(
          (item) => item.productId === next.productId,
        );
        if (!existing) {
          return [...current, { ...next, quantity: Math.max(1, quantity) }];
        }
        return current.map((item) => {
          if (item.productId !== next.productId) return item;
          const requested = item.quantity + quantity;
          const max = item.stock ?? next.stock;
          return {
            ...item,
            ...next,
            quantity: max === undefined ? requested : Math.min(max, requested),
          };
        });
      });
    },
    [],
  );

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.productId !== productId) return [item];
        if (quantity <= 0) return [];
        return [
          {
            ...item,
            quantity:
              item.stock === undefined
                ? quantity
                : Math.min(item.stock, quantity),
          },
        ];
      }),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0,
      ),
      addProduct,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [addProduct, clearCart, items, removeItem, setQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
