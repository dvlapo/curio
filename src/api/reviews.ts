import type {
  CreateReviewInput,
  Paginated,
  ReviewEligibility,
  ReviewReadModel,
} from '../types';
import { api, queryString } from './client';

export const reviewsApi = {
  product: (productId: string, page = 1, limit = 20) =>
    api<Paginated<ReviewReadModel>>(
      `/reviews/products/${productId}${queryString({ page, limit })}`,
    ),
  eligibility: (productId: string) =>
    api<ReviewEligibility>(`/reviews/products/${productId}/eligibility`, {
      auth: true,
    }),
  create: (body: CreateReviewInput) =>
    api<ReviewReadModel>('/reviews', { method: 'POST', auth: true, body }),
  vendor: (page = 1, limit = 20) =>
    api<Paginated<ReviewReadModel>>(
      `/reviews/vendor/my-products${queryString({ page, limit })}`,
      { auth: true },
    ),
};
