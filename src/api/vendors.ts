import type { UpdateVendorInput, Vendor } from '../types';
import { api } from './client';

export const vendorApi = {
  myStore: () => api<Vendor>('/vendors/my-store', { auth: true }),
  updateMyStore: (body: UpdateVendorInput) =>
    api<Vendor>('/vendors/my-store', { method: 'PATCH', auth: true, body }),
  vendors: () => api<Vendor[]>('/vendors', { auth: true }),
  approve: (id: string) =>
    api<Vendor>(`/vendors/${id}/approve`, { method: 'PATCH', auth: true }),
};
