import type { AuthUser } from '../types';
import { api } from './client';

export const usersApi = {
  list: () => api<AuthUser[]>('/users', { auth: true }),
  activate: (id: string) =>
    api<Pick<AuthUser, 'id' | 'isActive'>>(`/users/${id}/activate`, {
      method: 'PATCH',
      auth: true,
    }),
  deactivate: (id: string) =>
    api<Pick<AuthUser, 'id' | 'isActive'>>(`/users/${id}/deactivate`, {
      method: 'PATCH',
      auth: true,
    }),
};
