import * as yup from 'yup';
import {
  optionalNumber,
  optionalText,
  optionalUrl,
  requiredText,
} from './common';

export const productFilterSchema = yup
  .object({
    search: optionalText,
    categoryId: optionalText,
    vendorId: optionalText,
    minPrice: optionalNumber('Minimum price', 0),
    maxPrice: optionalNumber('Maximum price', 0),
  })
  .test(
    'price-range',
    'Maximum price must be greater than minimum price',
    function (value) {
      if (!value?.minPrice || !value?.maxPrice) return true;
      if (Number(value.maxPrice) >= Number(value.minPrice)) return true;

      return this.createError({
        path: 'maxPrice',
        message: 'Maximum price must be greater than minimum price',
      });
    },
  );

export type ProductFilterValues = {
  search: string;
  categoryId: string;
  vendorId: string;
  minPrice: string;
  maxPrice: string;
};

export const categorySchema = yup.object({
  name: requiredText('Name', 2),
  slug: requiredText('Slug', 2).matches(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers, and hyphens',
  ),
  description: optionalText,
  imageUrl: optionalUrl,
});

export type CategoryValues = yup.InferType<typeof categorySchema>;
