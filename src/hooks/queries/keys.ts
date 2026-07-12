import type { ProductFilters } from '../../types';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (filters: ProductFilters = {}) => ['products', filters] as const,
    detail: (id: string | undefined) => ['product', id] as const,
  },
  reviews: {
    product: (productId: string | undefined) =>
      ['reviews', 'product', productId] as const,
    eligibility: (productId: string | undefined) =>
      ['reviews', 'eligibility', productId] as const,
    vendor: (page: number) => ['reviews', 'vendor', page] as const,
  },
  orders: {
    all: ['orders'] as const,
    mine: ['orders', 'mine'] as const,
  },
  payments: {
    verify: (reference: string) => ['payment', 'verify', reference] as const,
    order: (orderId: string) => ['payment', 'order', orderId] as const,
  },
  admin: {
    users: ['admin', 'users'] as const,
    vendors: ['admin', 'vendors'] as const,
    orders: ['admin', 'orders'] as const,
    analytics: (limit: number) => ['admin', 'analytics', limit] as const,
  },
  vendor: {
    all: ['vendor'] as const,
    store: ['vendor', 'store'] as const,
    products: ['vendor', 'products'] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    low: ['inventory', 'low'] as const,
  },
};
