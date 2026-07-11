export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'BANK_TRANSFER' | 'WALLET';
export type Money = string | number;

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  vendor?: Pick<Vendor, 'id' | 'storeName' | 'isApproved'> | null;
}

export interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  description: string | null;
  logo: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: Pick<AuthUser, 'id' | 'email' | 'firstName' | 'lastName'>;
  products?: Product[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { products: number };
}

export interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  lowStockAt: number;
  updatedAt: string;
  product?: Partial<Product> & Pick<Product, 'id' | 'name'>;
}

export interface ReviewReadModel {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<AuthUser, 'id' | 'firstName' | 'lastName'>;
}

export interface Product {
  id: string;
  vendorId?: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: Money;
  images: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  vendor?: Pick<Vendor, 'id' | 'storeName' | 'logo'>;
  category?: Category;
  inventory?: Inventory | { quantity: number } | null;
  reviews?: ReviewReadModel[];
  _count?: { reviews: number };
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: Money;
  createdAt: string;
  product?: Partial<Product> & Pick<Product, 'id' | 'name' | 'images' | 'price'>;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: Money;
  status: PaymentStatus;
  method: PaymentMethod;
  providerReference: string | null;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: Money;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItem[];
  payment?: Payment | null;
  user?: Pick<AuthUser, 'id' | 'email' | 'firstName' | 'lastName'>;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  images?: string[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  images?: string[];
  isActive?: boolean;
}

export interface UpdateInventoryInput {
  quantity: number;
  lowStockAt?: number;
}

export interface UpdateVendorInput {
  storeName?: string;
  description?: string;
  logo?: string;
}

export interface CreateOrderInput {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: ShippingAddress;
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  reference: string;
}

export interface VerifyPaymentResponse {
  status: string;
  amount: number;
  reference: string;
  paidAt: string | null;
}

export interface CategoryView {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  count?: number;
}

export interface ProductView {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  category: string;
  stock?: number;
  reviews?: number;
}

export interface HeroSlide {
  id: string;
  category: string;
  headline: string;
  description: string;
  image: string;
  alt: string;
  filterTarget: string;
  accent: string;
}
