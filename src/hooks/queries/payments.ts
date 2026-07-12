import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api';
import type { PaymentMethod } from '../../types';
import { queryKeys } from './keys';

export function useInitializePaymentMutation() {
  return useMutation({
    mutationFn: ({
      orderId,
      method,
    }: {
      orderId: string;
      method: PaymentMethod;
    }) => paymentsApi.initialize(orderId, method),
  });
}

export function useVerifyPaymentQuery(reference: string) {
  return useQuery({
    queryKey: queryKeys.payments.verify(reference),
    queryFn: () => paymentsApi.verify(reference),
    enabled: Boolean(reference),
    retry: 2,
  });
}

export function usePaymentByOrderQuery(
  orderId: string,
  verificationStatus: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.payments.order(orderId),
    queryFn: () => paymentsApi.byOrder(orderId),
    enabled: Boolean(orderId),
    retry: 2,
    refetchInterval: verificationStatus === 'success' ? 2500 : false,
  });
}
