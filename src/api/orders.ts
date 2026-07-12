import type { CreateOrderInput, Order, OrderStatus } from '../types';
import { api } from './client';

export const ordersApi = {
  create: (body: CreateOrderInput) =>
    api<Order>('/orders', { method: 'POST', auth: true, body }),
  mine: () => api<Order[]>('/orders/my-orders', { auth: true }),
  detail: (id: string) => api<Order>(`/orders/${id}`, { auth: true }),
  cancel: (id: string) =>
    api<Order>(`/orders/${id}/cancel`, { method: 'PATCH', auth: true }),
  all: () => api<Order[]>('/orders', { auth: true }),
  updateStatus: (id: string, status: OrderStatus) =>
    api<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      auth: true,
      body: { status },
    }),
};
