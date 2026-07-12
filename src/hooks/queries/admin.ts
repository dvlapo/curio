import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi, catalogApi, ordersApi, usersApi, vendorApi } from '../../api';
import type { OrderStatus, UpdateCategoryInput } from '../../types';
import { queryKeys } from './keys';

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: usersApi.list,
  });
}

export function useToggleUserActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? usersApi.deactivate(id) : usersApi.activate(id),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
    },
  });
}

export function useAdminVendorsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.vendors,
    queryFn: vendorApi.vendors,
  });
}

export function useApproveVendorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorApi.approve,
    onSuccess: () => {
      toast.success('Vendor approved');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.vendors });
    },
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogApi.createCategory,
    onSuccess: () => {
      toast.success('Category saved');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryInput }) =>
      catalogApi.updateCategory(id, body),
    onSuccess: () => {
      toast.success('Category updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogApi.deleteCategory,
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: queryKeys.admin.orders,
    queryFn: ordersApi.all,
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders });
    },
  });
}

export function useAdminAnalyticsQuery(limit: number) {
  return useQuery({
    queryKey: queryKeys.admin.analytics(limit),
    queryFn: () => adminApi.analytics(limit),
  });
}
