import * as yup from 'yup';
import {
  commaSeparatedUrls,
  optionalNumber,
  optionalText,
  optionalUrl,
  requiredNumber,
  requiredText,
} from './common';

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
  images: commaSeparatedUrls,
});

export type VendorProductValues = {
  name: string;
  price: string;
  categoryId: string;
  description: string;
  images: string;
};

export const inventorySchema = yup.object({
  quantity: requiredNumber('Quantity', 0).integer('Quantity must be a whole number'),
  lowStockAt: optionalNumber('Low stock threshold', 1).integer(
    'Low stock threshold must be a whole number',
  ),
});

export type InventoryValues = {
  quantity: string;
  lowStockAt: string;
};
