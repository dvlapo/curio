import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './auth/AuthContext';
import { CartProvider } from './cart/CartContext';
import { queryClient } from './queryClient';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardShell, StoreShell } from './ui/AppShell';
import { LandingPage } from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import {
  CartPage,
  CheckoutPage,
  OrdersPage,
  PaymentCallbackPage,
  ProductDetailPage,
  ProductListPage,
  ProfilePage,
} from './pages/StorePages';
import {
  VendorDashboardPage,
  VendorInventoryPage,
  VendorProductsPage,
  VendorStorePage,
} from './pages/vendor/VendorPages';
import {
  AdminAnalyticsPage,
  AdminCategoriesPage,
  AdminOrdersPage,
  AdminUsersPage,
  AdminVendorsPage,
} from './pages/admin/AdminPages';

const vendorLinks = [
  { to: '/vendor', label: 'Overview' },
  { to: '/vendor/store', label: 'Store' },
  { to: '/vendor/products', label: 'Products' },
  { to: '/vendor/inventory', label: 'Inventory' },
];

const adminLinks = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/vendors', label: 'Vendors' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/analytics', label: 'Analytics' },
];

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster
              className="curio-toaster"
              position="bottom-right"
              closeButton
              visibleToasts={3}
              toastOptions={{ duration: 3200 }}
            />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<StoreShell />}>
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route
                  path="/payment/callback"
                  element={<PaymentCallbackPage />}
                />
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['VENDOR']} />}>
                <Route
                  path="/vendor"
                  element={
                    <DashboardShell title="Vendor" links={vendorLinks} />
                  }
                >
                  <Route index element={<VendorDashboardPage />} />
                  <Route path="store" element={<VendorStorePage />} />
                  <Route path="products" element={<VendorProductsPage />} />
                  <Route path="inventory" element={<VendorInventoryPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                <Route
                  path="/admin"
                  element={<DashboardShell title="Admin" links={adminLinks} />}
                >
                  <Route
                    index
                    element={<Navigate to="/admin/users" replace />}
                  />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="vendors" element={<AdminVendorsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
