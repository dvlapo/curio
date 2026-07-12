import type {
  InitializePaymentResponse,
  Payment,
  PaymentMethod,
  VerifyPaymentResponse,
} from '../types';
import { api } from './client';

export const paymentsApi = {
  initialize: (orderId: string, method: PaymentMethod) =>
    api<InitializePaymentResponse>('/payments/initialize', {
      method: 'POST',
      auth: true,
      body: { orderId, method },
    }),
  byOrder: (orderId: string) =>
    api<Payment>(`/payments/order/${orderId}`, { auth: true }),
  verify: (reference: string) =>
    api<VerifyPaymentResponse>(`/payments/verify/${reference}`, { auth: true }),
};
