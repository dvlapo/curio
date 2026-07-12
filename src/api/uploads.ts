import type { ProductImageUploadResponse } from '../types';
import { authorizedMultipart } from './client';

export const uploadApi = {
  productImages: (files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    return authorizedMultipart<ProductImageUploadResponse>(
      '/uploads/product-images',
      form,
    );
  },
};
