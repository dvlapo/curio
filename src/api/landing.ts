import type { Category, Paginated, Product, ShippingAddress } from '../types';
import { api } from './client';

export function getLandingData(signal?: AbortSignal) {
  return Promise.all([
    api<Category[]>('/categories', { signal }),
    api<Paginated<Product>>('/products?limit=8', { signal }),
  ]);
}

export function emptyShippingAddress(): ShippingAddress {
  return { street: '', city: '', state: '', country: '', zipCode: '' };
}
