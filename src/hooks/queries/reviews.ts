import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewsApi } from '../../api';
import type { CreateReviewInput } from '../../types';
import { queryKeys } from './keys';

type ReviewDraft = Omit<CreateReviewInput, 'productId'>;

export function useProductReviewsQuery(
  productId: string | undefined,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.reviews.product(productId),
    queryFn: ({ pageParam }) => reviewsApi.product(productId ?? '', pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
    enabled: Boolean(productId) && enabled,
  });
}

export function useReviewEligibilityQuery(
  productId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.reviews.eligibility(productId),
    queryFn: () => reviewsApi.eligibility(productId ?? ''),
    enabled: Boolean(productId) && enabled,
    retry: false,
  });
}

export function useCreateReviewMutation(productId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ReviewDraft) =>
      reviewsApi.create({ ...body, productId: productId ?? '' }),
    onSuccess: () => {
      toast.success('Review submitted');
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(productId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.product(productId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.eligibility(productId),
      });
    },
  });
}

export function useVendorReviewsQuery(page: number) {
  return useQuery({
    queryKey: queryKeys.reviews.vendor(page),
    queryFn: () => reviewsApi.vendor(page),
  });
}
