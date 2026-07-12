import type { Inventory, UpdateInventoryInput } from '../types';
import { api } from './client';

export const inventoryApi = {
  list: () => api<Inventory[]>('/inventory', { auth: true }),
  lowStock: () => api<Inventory[]>('/inventory/low-stock', { auth: true }),
  update: (productId: string, body: UpdateInventoryInput) =>
    api<Inventory>(`/inventory/${productId}`, {
      method: 'PATCH',
      auth: true,
      body,
    }),
};
