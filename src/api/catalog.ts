import type {
  Category,
  CreateCategoryInput,
  CreateProductInput,
  Paginated,
  Product,
  ProductFilters,
  UpdateCategoryInput,
  UpdateProductInput,
} from '../types';
import { api, queryString } from './client';

export const catalogApi = {
  categories: () => api<Category[]>('/categories'),
  category: (id: string) => api<Category>(`/categories/${id}`),
  createCategory: (body: CreateCategoryInput) =>
    api<Category>('/categories', { method: 'POST', auth: true, body }),
  updateCategory: (id: string, body: UpdateCategoryInput) =>
    api<Category>(`/categories/${id}`, { method: 'PATCH', auth: true, body }),
  deleteCategory: (id: string) =>
    api<Category>(`/categories/${id}`, { method: 'DELETE', auth: true }),
  products: (filters: ProductFilters = {}) =>
    api<Paginated<Product>>(`/products${queryString(filters)}`),
  product: (id: string) => api<Product>(`/products/${id}`),
  myProducts: () => api<Product[]>('/products/my/products', { auth: true }),
  createProduct: (body: CreateProductInput) =>
    api<Product>('/products', { method: 'POST', auth: true, body }),
  updateProduct: (id: string, body: UpdateProductInput) =>
    api<Product>(`/products/${id}`, { method: 'PATCH', auth: true, body }),
  deleteProduct: (id: string) =>
    api<Product>(`/products/${id}`, { method: 'DELETE', auth: true }),
};
