import type {
  AdminAnalytics,
  ApiErrorBody,
  AuthResponse,
  AuthUser,
  Category,
  CreateCategoryInput,
  CreateOrderInput,
  CreateProductInput,
  CreateReviewInput,
  InitializePaymentResponse,
  Inventory,
  Order,
  OrderStatus,
  Paginated,
  Payment,
  PaymentMethod,
  Product,
  ProductFilters,
  ProductImageUploadResponse,
  ReviewEligibility,
  ReviewReadModel,
  Role,
  ShippingAddress,
  UpdateCategoryInput,
  UpdateInventoryInput,
  UpdateProductInput,
  UpdateVendorInput,
  Vendor,
  VerifyPaymentResponse,
} from './types';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api/v1';

const ACCESS_TOKEN_KEY = 'ecommerce_access_token';
const REFRESH_TOKEN_KEY = 'ecommerce_refresh_token';

export const tokenStore = {
  get: () => sessionStorage.getItem(ACCESS_TOKEN_KEY),
  getAccess: () => sessionStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => sessionStorage.getItem(REFRESH_TOKEN_KEY),
  hasSession: () =>
    Boolean(sessionStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY)),
  set: (tokens: AuthResponse) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },
  clear: () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody,
  ) {
    super(Array.isArray(body.message) ? body.message.join(', ') : body.message);
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

function queryString<T extends object>(values: T) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function api<T>(
  path: string,
  { body, auth = false, retryOnUnauthorized = true, headers, ...init }: ApiOptions = {},
): Promise<T> {
  const token = tokenStore.getAccess();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return api<T>(path, {
        body,
        auth,
        headers,
        retryOnUnauthorized: false,
        ...init,
      });
    }
  }

  if (!response.ok) {
    const fallback: ApiErrorBody = {
      statusCode: response.status,
      message: response.statusText || 'Request failed',
    };
    const errorBody = await response.json().catch(() => fallback);
    if (response.status === 401) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new ApiError(response.status, errorBody);
  }

  return response.json() as Promise<T>;
}

async function refreshSession() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    tokenStore.clear();
    return false;
  }

  tokenStore.set((await response.json()) as AuthResponse);
  return true;
}

async function authorizedMultipart<T>(
  path: string,
  body: FormData,
  retryOnUnauthorized = true,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(tokenStore.getAccess() ? { Authorization: `Bearer ${tokenStore.getAccess()}` } : {}),
    },
    body,
  });

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshSession();
    if (refreshed) return authorizedMultipart<T>(path, body, false);
  }

  if (!response.ok) {
    const fallback: ApiErrorBody = {
      statusCode: response.status,
      message: response.statusText || 'Upload failed',
    };
    const errorBody = await response.json().catch(() => fallback);
    if (response.status === 401) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new ApiError(response.status, errorBody);
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body }),
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Exclude<Role, 'ADMIN'>;
  }) => api<AuthResponse>('/auth/register', { method: 'POST', body }),
  refresh: (refreshToken: string) =>
    api<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    }),
  logout: () =>
    api<{ message: string }>('/auth/logout', {
      method: 'POST',
      auth: true,
    }),
  me: () => api<AuthUser>('/users/me', { auth: true }),
  updateMe: (body: { firstName?: string; lastName?: string; password?: string }) =>
    api<AuthUser>('/users/me', { method: 'PATCH', auth: true, body }),
};

export const uploadApi = {
  productImages: (files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    return authorizedMultipart<ProductImageUploadResponse>('/uploads/product-images', form);
  },
};

export const reviewsApi = {
  product: (productId: string, page = 1, limit = 20) =>
    api<Paginated<ReviewReadModel>>(
      `/reviews/products/${productId}${queryString({ page, limit })}`,
    ),
  eligibility: (productId: string) =>
    api<ReviewEligibility>(`/reviews/products/${productId}/eligibility`, { auth: true }),
  create: (body: CreateReviewInput) =>
    api<ReviewReadModel>('/reviews', { method: 'POST', auth: true, body }),
  vendor: (page = 1, limit = 20) =>
    api<Paginated<ReviewReadModel>>(
      `/reviews/vendor/my-products${queryString({ page, limit })}`,
      { auth: true },
    ),
};

export const adminApi = {
  analytics: (limit = 5) =>
    api<AdminAnalytics>(`/admin/analytics${queryString({ limit })}`, { auth: true }),
};

export const catalogApi = {
  categories: () => api<Category[]>('/categories'),
  category: (id: string) => api<Category>(`/categories/${id}`),
  createCategory: (body: CreateCategoryInput) =>
    api<Category>('/categories', { method: 'POST', auth: true, body }),
  updateCategory: (id: string, body: UpdateCategoryInput) =>
    api<Category>(`/categories/${id}`, { method: 'PATCH', auth: true, body }),
  deleteCategory: (id: string) => api<Category>(`/categories/${id}`, { method: 'DELETE', auth: true }),
  products: (filters: ProductFilters = {}) => api<Paginated<Product>>(`/products${queryString(filters)}`),
  product: (id: string) => api<Product>(`/products/${id}`),
  myProducts: () => api<Product[]>('/products/my/products', { auth: true }),
  createProduct: (body: CreateProductInput) =>
    api<Product>('/products', { method: 'POST', auth: true, body }),
  updateProduct: (id: string, body: UpdateProductInput) =>
    api<Product>(`/products/${id}`, { method: 'PATCH', auth: true, body }),
  deleteProduct: (id: string) => api<Product>(`/products/${id}`, { method: 'DELETE', auth: true }),
};

export const vendorApi = {
  myStore: () => api<Vendor>('/vendors/my-store', { auth: true }),
  updateMyStore: (body: UpdateVendorInput) =>
    api<Vendor>('/vendors/my-store', { method: 'PATCH', auth: true, body }),
  vendors: () => api<Vendor[]>('/vendors', { auth: true }),
  approve: (id: string) => api<Vendor>(`/vendors/${id}/approve`, { method: 'PATCH', auth: true }),
};

export const inventoryApi = {
  list: () => api<Inventory[]>('/inventory', { auth: true }),
  lowStock: () => api<Inventory[]>('/inventory/low-stock', { auth: true }),
  update: (productId: string, body: UpdateInventoryInput) =>
    api<Inventory>(`/inventory/${productId}`, { method: 'PATCH', auth: true, body }),
};

export const ordersApi = {
  create: (body: CreateOrderInput) => api<Order>('/orders', { method: 'POST', auth: true, body }),
  mine: () => api<Order[]>('/orders/my-orders', { auth: true }),
  detail: (id: string) => api<Order>(`/orders/${id}`, { auth: true }),
  cancel: (id: string) => api<Order>(`/orders/${id}/cancel`, { method: 'PATCH', auth: true }),
  all: () => api<Order[]>('/orders', { auth: true }),
  updateStatus: (id: string, status: OrderStatus) =>
    api<Order>(`/orders/${id}/status`, { method: 'PATCH', auth: true, body: { status } }),
};

export const paymentsApi = {
  initialize: (orderId: string, method: PaymentMethod) =>
    api<InitializePaymentResponse>('/payments/initialize', {
      method: 'POST',
      auth: true,
      body: { orderId, method },
    }),
  byOrder: (orderId: string) => api<Payment>(`/payments/order/${orderId}`, { auth: true }),
  verify: (reference: string) => api<VerifyPaymentResponse>(`/payments/verify/${reference}`, { auth: true }),
};

export const usersApi = {
  list: () => api<AuthUser[]>('/users', { auth: true }),
  activate: (id: string) =>
    api<Pick<AuthUser, 'id' | 'isActive'>>(`/users/${id}/activate`, { method: 'PATCH', auth: true }),
  deactivate: (id: string) =>
    api<Pick<AuthUser, 'id' | 'isActive'>>(`/users/${id}/deactivate`, { method: 'PATCH', auth: true }),
};

export function getLandingData(signal?: AbortSignal) {
  return Promise.all([
    api<Category[]>('/categories', { signal }),
    api<Paginated<Product>>('/products?limit=8', { signal }),
  ]);
}

export function emptyShippingAddress(): ShippingAddress {
  return { street: '', city: '', state: '', country: '', zipCode: '' };
}
