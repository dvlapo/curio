import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi, uploadApi, vendorApi } from '../../api';
import type { Product } from '../../types';
import {
  vendorProductSchema,
  type VendorProductValues,
} from '../../../validations';
import { queryKeys } from './keys';

export function useVendorStoreQuery() {
  return useQuery({
    queryKey: queryKeys.vendor.store,
    queryFn: vendorApi.myStore,
  });
}

export function useUpdateVendorStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorApi.updateMyStore,
    onSuccess: () => {
      toast.success('Store updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.all });
    },
  });
}

export function useVendorProductsQuery() {
  return useQuery({
    queryKey: queryKeys.vendor.products,
    queryFn: catalogApi.myProducts,
  });
}

export function useSaveVendorProductMutation(options?: {
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      product,
      values,
    }: {
      product?: Product;
      values: VendorProductValues;
    }) => {
      const next = vendorProductSchema.cast(values);
      const files = Array.isArray(next.imageFiles) ? next.imageFiles : [];
      const uploaded = files.length
        ? await uploadApi.productImages(files)
        : null;
      const images =
        uploaded?.images.map((image) => image.url) ??
        product?.images ??
        undefined;
      const body = {
        name: next.name,
        description: next.description,
        price: Number(next.price),
        categoryId: next.categoryId,
        ...(images ? { images } : {}),
      };

      return product
        ? catalogApi.updateProduct(product.id, body)
        : catalogApi.createProduct(body);
    },
    onSuccess: () => {
      toast.success('Product saved');
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.products });
      options?.onSuccess?.();
    },
  });
}

export function useToggleVendorProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      catalogApi.updateProduct(id, { isActive }),
    onSuccess: () => {
      toast.success('Product updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.vendor.products });
    },
  });
}
