import * as yup from 'yup';
import {
  optionalNumber,
  optionalText,
  optionalUrl,
  requiredNumber,
  requiredText,
} from './common';

const MAX_PRODUCT_IMAGES = 5;
const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;

export const vendorStoreSchema = yup.object({
  storeName: requiredText('Store name', 3),
  description: optionalText,
  logo: optionalUrl,
});

export type VendorStoreValues = yup.InferType<typeof vendorStoreSchema>;

export const vendorProductSchema = yup.object({
  name: requiredText('Name', 3),
  price: requiredNumber('Price', 0),
  categoryId: requiredText('Category'),
  description: optionalText,
  imageFiles: yup
    .mixed<File[]>()
    .test(
      'file-count',
      'Upload up to 5 images',
      (files) => !files || files.length <= MAX_PRODUCT_IMAGES,
    )
    .test(
      'file-size',
      'Each image must be 5MB or smaller',
      (files) =>
        !files || files.every((file) => file.size <= MAX_PRODUCT_IMAGE_BYTES),
    )
    .test(
      'file-type',
      'Only image files are allowed',
      (files) =>
        !files || files.every((file) => file.type.startsWith('image/')),
    )
    .default([]),
});

export type VendorProductValues = {
  name: string;
  price: string;
  categoryId: string;
  description: string;
  imageFiles: File[];
};

export const inventorySchema = yup.object({
  quantity: requiredNumber('Quantity', 0).integer(
    'Quantity must be a whole number',
  ),
  lowStockAt: optionalNumber('Low stock threshold', 1).integer(
    'Low stock threshold must be a whole number',
  ),
});

export type InventoryValues = {
  quantity: string;
  lowStockAt: string;
};
