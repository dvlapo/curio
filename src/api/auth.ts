import type { AuthResponse, AuthUser, Role } from '../types';
import { api } from './client';

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body }),
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Exclude<Role, 'ADMIN'>;
  }) => api<AuthResponse>('/auth/register', { method: 'POST', body }),
  refresh: (refreshToken: string) =>
    api<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    }),
  logout: () =>
    api<{ message: string }>('/auth/logout', {
      method: 'POST',
      auth: true,
    }),
  me: () => api<AuthUser>('/users/me', { auth: true }),
  updateMe: (body: {
    firstName?: string;
    lastName?: string;
    password?: string;
  }) => api<AuthUser>('/users/me', { method: 'PATCH', auth: true, body }),
};
