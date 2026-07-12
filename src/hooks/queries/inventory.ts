import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi } from '../../api';
import { queryKeys } from './keys';

export function useInventoryQuery() {
  return useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: inventoryApi.list,
  });
}

export function useVendorDashboardInventoryQuery() {
  return useInventoryQuery();
}

export function useLowStockQuery() {
  return useQuery({
    queryKey: queryKeys.inventory.low,
    queryFn: inventoryApi.lowStock,
  });
}

export function useUpdateInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
      lowStockAt,
    }: {
      productId: string;
      quantity: number;
      lowStockAt?: number;
    }) => inventoryApi.update(productId, { quantity, lowStockAt }),
    onSuccess: () => {
      toast.success('Inventory updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}
