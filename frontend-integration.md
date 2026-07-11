# Frontend Integration Guide

This guide describes how a React and TypeScript frontend can integrate with the
ecommerce API as it exists today. The final section separately identifies
planned backend work that is **not yet available to the frontend**.

## 1. API conventions

### Base URL

The server listens on port `3333` by default and applies `/api/v1` to every
route.

```env
VITE_API_URL=http://localhost:3333/api/v1
```

```ts
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3333/api/v1";
```

Change the environment variable for staging and production. Do not hard-code a
production origin in components.

The API:

- accepts and returns JSON;
- has CORS enabled;
- strips unknown request properties and rejects them with `400 Bad Request`;
- transforms numeric query-string values where the corresponding DTO requests
  transformation;
- returns ISO 8601 strings for dates;
- normally serializes Prisma `Decimal` values, such as `price` and
  `totalAmount`, as strings. Parse them only for calculation or display.

### Authentication

Protected requests use a bearer token:

```http
Authorization: Bearer <access_token>
```

Registration and login return:

```ts
interface AuthResponse {
  access_token: string;
}
```

The token expires after 15 minutes. There is currently no refresh-token or
server-side logout endpoint. On `401 Unauthorized`, clear the local session and
send the user to login. A frontend logout is simply local token removal.

For a simple browser client, `sessionStorage` limits persistence to the current
tab:

```ts
const TOKEN_KEY = "ecommerce_access_token";

export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};
```

`localStorage` provides longer persistence but increases the impact of an XSS
vulnerability. Whichever mechanism is chosen, do not log the token or put it in
URLs. An HttpOnly cookie cannot be adopted solely by the frontend; it requires
a backend authentication change.

### Errors

NestJS usually returns errors in this shape:

```ts
interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}
```

Validation failures often use a `string[]` message. Domain failures, such as
insufficient stock, generally use a single string.

Common statuses:

| Status | Meaning | Frontend response |
| --- | --- | --- |
| `400` | Invalid input, stock failure, payment failure, or invalid order transition | Show the returned message near the action |
| `401` | Missing, invalid, expired, or disabled-user token | Clear the session and require login |
| `403` | Correctly authenticated but wrong role or resource owner | Show an access-denied state |
| `404` | Entity or payment not found | Show a not-found state |
| `409` | Duplicate email, category slug, or vendor profile | Show the returned conflict message |

## 2. A small React API layer

Keep HTTP details outside page components:

```ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody,
  ) {
    super(
      Array.isArray(body.message) ? body.message.join(", ") : body.message,
    );
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function api<T>(
  path: string,
  { body, auth = false, headers, ...init }: ApiOptions = {},
): Promise<T> {
  const token = tokenStore.get();

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const fallback: ApiErrorBody = {
      statusCode: response.status,
      message: response.statusText || "Request failed",
    };
    const errorBody = await response.json().catch(() => fallback);

    if (response.status === 401) {
      tokenStore.clear();
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    throw new ApiError(response.status, errorBody);
  }

  return response.json() as Promise<T>;
}
```

All current successful API operations return JSON, so this helper expects a
JSON response. Extend it before using it with a future `204 No Content` route.

### Authentication bootstrap

After registration or login:

1. Store `access_token`.
2. Request `GET /auth/me`.
3. Keep the returned user in React state.
4. Render routes allowed by `user.role`.

On application startup, request `/auth/me` only when a token exists. A failure
should clear the token and leave the app unauthenticated. Subscribe to the
`auth:unauthorized` event from the API helper so an expired token logs the user
out consistently.

```ts
type AuthState =
  | { status: "loading"; user: null }
  | { status: "anonymous"; user: null }
  | { status: "authenticated"; user: AuthUser };

function canAccess(user: AuthUser | null, roles?: Role[]) {
  return Boolean(user && (!roles || roles.includes(user.role)));
}
```

A protected-route component should wait for bootstrap to finish, redirect
anonymous users to login, and show an access-denied page when the role does not
match. Frontend route guards improve navigation but are not security controls;
the API guards remain authoritative.

Never offer `ADMIN` as a registration choice. The backend DTO currently accepts
all `Role` enum values, so the public frontend must constrain registration to
`CUSTOMER` or `VENDOR`.

## 3. Shared frontend types

These types cover the stable fields returned by current endpoints. Individual
endpoints include different relations, so optional relation fields are useful
at the API boundary.

```ts
export type Role = "CUSTOMER" | "VENDOR" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "WALLET";
export type Money = string;

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  vendor?: Pick<Vendor, "id" | "storeName" | "isApproved"> | null;
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
  user?: Pick<AuthUser, "id" | "email" | "firstName" | "lastName">;
  products?: Product[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  lowStockAt: number;
  updatedAt: string;
  product?: Partial<Product> & Pick<Product, "id" | "name">;
}

export interface ReviewReadModel {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<AuthUser, "id" | "firstName" | "lastName">;
}

export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: Money;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vendor?: Pick<Vendor, "id" | "storeName" | "logo">;
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
  product?: Partial<Product> & Pick<Product, "id" | "name" | "images" | "price">;
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
  user?: Pick<AuthUser, "id" | "email" | "firstName" | "lastName">;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

Use a decimal-aware formatter for display:

```ts
export function formatMoney(value: Money, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(Number(value));
}
```

JavaScript numbers are acceptable for display, but avoid floating-point
arithmetic for financial totals. The server calculates authoritative order and
payment amounts.

## 4. Authentication and users

### Endpoints

| Method | Path | Access | Request | Response | Notable errors |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | `{ email, password, firstName, lastName, role? }` | `201`, `AuthResponse` | `400`, `409` email used |
| `POST` | `/auth/login` | Public | `{ email, password }` | `200`, `AuthResponse` | `401` credentials or disabled account |
| `GET` | `/auth/me` | Authenticated | — | Basic `AuthUser` without `isActive` or vendor | `401` |
| `GET` | `/users/me` | Authenticated | — | `AuthUser` including vendor summary | `401`, `404` |
| `PATCH` | `/users/me` | Authenticated | Any of `{ firstName, lastName, password }` | Updated profile | `400`, `401` |
| `GET` | `/users` | Admin | — | `AuthUser[]` | `401`, `403` |
| `GET` | `/users/:id` | Admin | — | User including vendor summary | `401`, `403`, `404` |
| `PATCH` | `/users/:id/deactivate` | Admin | — | `{ id, isActive: false }` | `401`, `403`, `404` |
| `PATCH` | `/users/:id/activate` | Admin | — | `{ id, isActive: true }` | `401`, `403`, `404` |

Registration rules:

- `email` must be a valid email.
- `password` must be at least six characters.
- `firstName` and `lastName` are required strings.
- The frontend should submit only `CUSTOMER` or `VENDOR`.
- Registering as `VENDOR` automatically creates an unapproved vendor profile
  with a placeholder store name.

```ts
async function login(email: string, password: string) {
  const result = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  tokenStore.set(result.access_token);
  return api<AuthUser>("/users/me", { auth: true });
}
```

Use `/users/me` when the UI needs vendor approval information. Use `/auth/me`
for the lightest session check.

## 5. Catalog

### Categories

| Method | Path | Access | Request | Response | Notable errors |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/categories` | Public | — | `Category[]` with product counts | — |
| `GET` | `/categories/:id` | Public | — | `Category` with product count | `404` |
| `POST` | `/categories` | Admin | `CreateCategoryInput` | Created category | `400`, `401`, `403`, `409` slug used |
| `PATCH` | `/categories/:id` | Admin | `UpdateCategoryInput` | Updated category | `400`, `401`, `403`, `404` |
| `DELETE` | `/categories/:id` | Admin | — | Deleted category | `401`, `403`, `404` |

```ts
interface CreateCategoryInput {
  name: string; // at least 2 characters
  slug: string;
  description?: string;
  imageUrl?: string;
}

type UpdateCategoryInput = Partial<CreateCategoryInput>;
```

Category deletion is a real database deletion, not a soft delete. The database
may reject deletion when products still reference the category; the frontend
should confirm the action and handle a server error.

### Products

| Method | Path | Access | Request | Response | Notable errors |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/products` | Public | Product query parameters | `Paginated<Product>` | `400` invalid query |
| `GET` | `/products/:id` | Public | — | Detailed `Product` | `404` |
| `GET` | `/products/my/products` | Vendor | — | Vendor's `Product[]`, including inactive items | `401`, `403`, `404` profile |
| `POST` | `/products` | Approved vendor | `CreateProductInput` | Product with inventory | `400`, `401`, `403` |
| `PATCH` | `/products/:id` | Owning vendor | `UpdateProductInput` | Updated product | `400`, `401`, `403`, `404` |
| `DELETE` | `/products/:id` | Owning vendor | — | Product with `isActive: false` | `401`, `403`, `404` |

Supported product-list query parameters:

```ts
interface ProductFilters {
  search?: string;
  categoryId?: string; // UUID
  vendorId?: string; // UUID
  minPrice?: number;
  maxPrice?: number;
  page?: number; // default 1
  limit?: number; // default 20
}

function productQuery(filters: ProductFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return api<Paginated<Product>>(`/products?${params}`);
}
```

The public list includes category, vendor summary, inventory quantity, and
review count. It returns active products only, newest first. The detail endpoint
includes full inventory, vendor summary, the five newest existing reviews, and
the total review count.

```ts
interface CreateProductInput {
  name: string; // at least 3 characters
  description?: string;
  price: number; // non-negative, at most 2 decimal places
  categoryId: string;
  images?: string[];
}

interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  images?: string[];
  isActive?: boolean;
}
```

Creating a product also creates inventory with quantity `0`. The vendor must
update inventory before customers can order it. Product deletion is a soft
delete and can be reversed with `PATCH /products/:id` and
`{ "isActive": true }`.

## 6. Vendors and inventory

### Vendors

The `vendors` controller currently has a controller-level JWT guard. Therefore,
**all vendor endpoints, including `GET /vendors/:id`, require authentication**.

| Method | Path | Access | Request | Response | Notable errors |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/vendors` | Authenticated | `{ storeName, description? }` | Created vendor | `400`, `401`, `409` profile exists |
| `GET` | `/vendors/my-store` | Vendor | — | Vendor with all products | `401`, `403`, `404` |
| `PATCH` | `/vendors/my-store` | Vendor | Store update | Updated vendor | `400`, `401`, `403`, `404` |
| `GET` | `/vendors` | Admin | — | All vendors with user summary | `401`, `403` |
| `GET` | `/vendors/:id` | Authenticated | — | Vendor with up to 10 active products | `401`, `404` |
| `PATCH` | `/vendors/:id/approve` | Admin | — | Approved vendor | `401`, `403`, `404` |

```ts
interface CreateVendorInput {
  storeName: string; // at least 3 characters
  description?: string;
}

interface UpdateVendorInput {
  storeName?: string; // at least 3 characters
  description?: string;
  logo?: string;
}
```

`POST /vendors` creates a profile but does not change a customer's role to
`VENDOR`. In the current application, the usable onboarding path is registration
with role `VENDOR`, followed by admin approval. Vendors can view and update
their store before approval, but product creation fails until approval.

### Inventory

All inventory endpoints require the `VENDOR` role.

| Method | Path | Access | Request | Response | Notable errors |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/inventory` | Vendor | — | Own `Inventory[]`, lowest quantity first | `401`, `403`, `404` profile |
| `GET` | `/inventory/low-stock` | Vendor | — | Own inventory at or below threshold | `401`, `403`, `404` profile |
| `GET` | `/inventory/:productId` | Vendor | — | Inventory with product/vendor summary | `401`, `403`, `404` |
| `PATCH` | `/inventory/:productId` | Owning vendor | `{ quantity, lowStockAt? }` | Updated inventory | `400`, `401`, `403`, `404` |

```ts
interface UpdateInventoryInput {
  quantity: number; // integer, minimum 0
  lowStockAt?: number; // integer, minimum 1
}
```

The single-inventory read route checks the caller's role but does not currently
check product ownership. Do not use that behavior to expose another vendor's
data in the UI; ownership is enforced when updating.

## 7. Orders

All order endpoints require authentication. Creation, own-order reads, and
cancellation are not explicitly restricted to `CUSTOMER` by a role guard, but
the UI should present them as customer workflows.

| Method | Path | Access | Request | Response | Notable errors |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/orders` | Authenticated | `CreateOrderInput` | Created order with items | `400` invalid product or stock, `401` |
| `GET` | `/orders/my-orders` | Authenticated | — | Own `Order[]` with products/payment | `401` |
| `GET` | `/orders/:id` | Owner | — | Detailed order | `401`, `403`, `404` |
| `PATCH` | `/orders/:id/cancel` | Owner | — | Cancelled order | `400` not pending, `401`, `403`, `404` |
| `GET` | `/orders` | Admin | — | All orders with users/items/payment | `401`, `403` |
| `PATCH` | `/orders/:id/status` | Admin | `{ status }` | Updated order | `400` invalid transition, `401`, `403`, `404` |

```ts
interface CreateOrderInput {
  items: Array<{
    productId: string; // UUID
    quantity: number; // integer, minimum 1
  }>;
  shippingAddress: ShippingAddress;
}
```

`shippingAddress` is validated as an object at runtime, but its nested string
fields are not individually validated by the current DTO. The frontend should
still require all five fields.

The server:

1. verifies that every product is active;
2. checks current inventory;
3. calculates the total from server-side product prices;
4. creates the order and items;
5. decrements stock transactionally.

Do not send or calculate an authoritative total from the browser. Handle both
`One or more products are invalid or unavailable` and per-product insufficient
stock messages by returning the customer to the cart.

Cancelling is allowed only while the order is `PENDING` and restores inventory.

### Admin status transitions

Only these transitions are accepted:

```text
PENDING   -> CONFIRMED | CANCELLED
CONFIRMED -> SHIPPED | CANCELLED
SHIPPED   -> DELIVERED
DELIVERED -> REFUNDED
CANCELLED -> no transition
REFUNDED  -> no transition
```

Disable impossible choices in the admin UI, but still display server errors in
case the status changed concurrently.

There is an important current limitation: `GET /orders/:id` always performs an
owner check because the controller does not pass the service's admin override.
An admin can list all orders but receives `403` when requesting another user's
order detail. Build the admin list from `GET /orders`; do not rely on a separate
detail request until the backend is corrected.

## 8. Payments and Paystack

| Method | Path | Access | Request | Response | Notable errors |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/payments/initialize` | Authenticated owner | `{ orderId, method }` | `{ authorizationUrl, reference }` | `400`, `401`, `403`, `404` |
| `GET` | `/payments/order/:orderId` | Authenticated owner | — | `Payment` | `401`, `403`, `404` |
| `GET` | `/payments/verify/:reference` | Authenticated owner | — | Verification result | `401`, `403`, `404` |
| `POST` | `/payments/webhook` | Paystack only | Signed raw event | `{ received: true }` | `400` invalid signature |

```ts
interface InitializePaymentInput {
  orderId: string; // UUID
  method: PaymentMethod;
}

interface InitializePaymentResponse {
  authorizationUrl: string;
  reference: string;
}

interface VerifyPaymentResponse {
  status: string;
  amount: number;
  reference: string;
  paidAt: string | null;
}
```

Recommended flow:

1. Create an order.
2. Initialize payment with the order ID and selected method.
3. Save the returned reference in temporary checkout state.
4. Navigate the browser to `authorizationUrl`.
5. After Paystack redirects to the frontend callback page, call
   `GET /payments/verify/:reference`.
6. Refetch `GET /payments/order/:orderId` or the order list to obtain persisted
   backend state.

```ts
const payment = await api<InitializePaymentResponse>("/payments/initialize", {
  method: "POST",
  auth: true,
  body: { orderId, method: "CARD" satisfies PaymentMethod },
});

sessionStorage.setItem("pending_payment_reference", payment.reference);
window.location.assign(payment.authorizationUrl);
```

The verification response reports Paystack's current result. Persisted payment
and order status are updated by the Paystack webhook, which may arrive slightly
later. If the verification succeeds but the order still appears pending, refetch
with a short bounded retry and show a processing state rather than creating a
second order.

Never call `/payments/webhook` from React, generate a Paystack signature, or
expose Paystack secrets in frontend environment variables. That endpoint is
server-to-server only.

The backend currently accepts `CARD`, `BANK_TRANSFER`, and `WALLET` as methods,
although actual availability still depends on Paystack and backend behavior.
Initialization is blocked for cancelled and successfully paid orders.

## 9. Suggested React screens

### Public and customer

- Product list with debounced search, category/vendor filters, price filters,
  and page controls driven by `meta`.
- Product detail using inventory quantity for availability and the currently
  returned review read model.
- Client-side cart state, because no cart API exists.
- Checkout with address validation, order creation, and Paystack handoff.
- Order history with payment and cancellation actions.
- Profile settings and explicit logout.

### Vendor

- Approval-aware store dashboard.
- Store profile editor.
- Product list/editor with activation controls.
- Inventory table and low-stock view.

### Admin

- User list with activate/deactivate actions.
- Vendor approval queue.
- Category management.
- Order list and valid status-transition controls.
- A reserved analytics route for the planned feature, with no API call yet.

Route visibility should be derived from `AuthUser.role`; resource ownership and
approval failures must still be handled from API responses.

## 10. Features not implemented yet

The following roadmap items must not be treated as live API contracts. Keep
their frontend code behind disabled UI, feature flags, or isolated component
boundaries until the backend publishes routes and response shapes.

### Step 10 — Reviews

Planned behavior:

- customers can review a product they have ordered;
- one review is allowed per customer per product;
- vendors can see reviews for their products.

The database already has a review model with a unique
`(userId, productId)` constraint. Product detail responses currently include the
five newest stored reviews, and product list/detail responses include review
counts. However, there is no reviews controller or frontend-callable endpoint
for:

- creating or editing a review;
- checking whether the customer is eligible;
- listing a complete product review history;
- listing reviews for a vendor's products.

The frontend may create presentational `ReviewList`, `ReviewSummary`, and
`ReviewForm` boundaries. It should keep submission disabled or hidden until the
backend contract exists. Do not infer eligibility only from local order data;
the backend must enforce purchase history and uniqueness.

### Step 11 — Email notifications

Planned behavior uses Nodemailer and Handlebars templates to email customers
when:

- an order is confirmed;
- payment succeeds;
- an order ships.

This is a backend side effect and requires no frontend API call. The frontend
should continue to render status from order and payment endpoints and must not
claim that an email was delivered merely because a status update succeeded.
There are currently no email preference, delivery-history, or resend endpoints.

### Step 12 — Admin analytics

Planned admin-only metrics:

- total revenue;
- orders by status;
- top-selling products;
- vendor performance.

No analytics module, routes, query parameters, or response types exist yet.
Reserve an admin-only page with loading, empty, error, and unavailable states,
but do not define chart data types or make speculative requests. All eventual
analytics requests must use the bearer token and must remain protected by the
backend `ADMIN` role guard.

## 11. Current integration limitations

- Access tokens expire after 15 minutes; there is no refresh endpoint.
- Logout is frontend-only token removal.
- There is no cart or saved-cart endpoint.
- There is no image upload endpoint; product image and logo fields accept
  strings, so hosting/upload must be supplied separately.
- There is no vendor-facing order list or fulfillment endpoint.
- Admin order detail is blocked for orders owned by other users even though
  admin order listing is available.
- The vendor profile read route requires authentication despite its source
  comment describing it as public.
- Creating a vendor profile does not promote a customer's role.
- Reviews are partly present in read models but cannot yet be created or fully
  queried.
- Email notifications and admin analytics are not implemented.

Treat these as backend contract gaps rather than problems to work around with
client-side authorization or fabricated data.
