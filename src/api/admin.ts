import type { AdminAnalytics } from '../types';
import { api, queryString } from './client';

export const adminApi = {
  analytics: (limit = 5) =>
    api<AdminAnalytics>(`/admin/analytics${queryString({ limit })}`, {
      auth: true,
    }),
};
