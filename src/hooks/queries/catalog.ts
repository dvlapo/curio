import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import type { ProductFilters } from '../../types';
import { queryKeys } from './keys';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: catalogApi.categories,
  });
}

export function useProductsQuery(filters: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => catalogApi.products(filters),
  });
}

export function useProductQuery(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => catalogApi.product(productId ?? ''),
    enabled: Boolean(productId),
  });
}
