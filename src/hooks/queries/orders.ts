import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ordersApi } from '../../api';
import { queryKeys } from './keys';

export function useCreateOrderMutation() {
  return useMutation({ mutationFn: ordersApi.create });
}

export function useMyOrdersQuery() {
  return useQuery({
    queryKey: queryKeys.orders.mine,
    queryFn: ordersApi.mine,
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.cancel,
    onSuccess: () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}
