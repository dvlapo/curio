import { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Formik, useFormikContext } from 'formik';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';
import {
  FormError,
  PasswordField,
  SelectField,
  TextareaField,
  TextField,
} from '../components/forms/FormFields';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  useCancelOrderMutation,
  useCategoriesQuery,
  useCreateOrderMutation,
  useCreateReviewMutation,
  useInitializePaymentMutation,
  useMyOrdersQuery,
  usePaymentByOrderQuery,
  useProductQuery,
  useProductReviewsQuery,
  useProductsQuery,
  useReviewEligibilityQuery,
  useVerifyPaymentQuery,
} from '../hooks/queries';
import { formatMoney } from '../utils/money';
import { getErrorMessage } from '../utils/errors';
import type { Product } from '../types';
import {
  checkoutSchema,
  productFilterSchema,
  profileSchema,
  reviewSchema,
  type CheckoutValues,
  type ProductFilterValues,
  type ProfileValues,
  type ReviewValues,
} from '../../validations';
import { format } from 'date-fns';

function PageIntro({ title, body }: { title: string; body?: string }) {
  return (
    <div className="page-intro">
      <h1>{title}</h1>
      {body && <p>{body}</p>}
    </div>
  );
}

function ProductTile({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const stock = product.inventory?.quantity;

  const add = () => {
    addProduct(product);
    toast.success('Added to cart', {
      description: product.name,
      action: { label: 'View cart', onClick: () => navigate('/cart') },
    });
  };

  return (
    <article className="commerce-card">
      <Link to={`/products/${product.id}`} className="commerce-image">
        <ImageWithFallback src={product.images?.[0] ?? ''} alt={product.name} />
      </Link>
      <div className="commerce-meta">
        <span>{product.category?.name ?? 'Marketplace'}</span>
        {product.vendor && (
          <Link to={`/products?vendorId=${product.vendor.id}`}>
            {product.vendor.storeName}
          </Link>
        )}
        {product._count?.reviews !== undefined && (
          <span>{product._count.reviews} reviews</span>
        )}
      </div>
      <h2>
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h2>
      <p>{product.description ?? 'A Curio marketplace find.'}</p>
      <div className="commerce-bottom">
        <strong>{formatMoney(product.price)}</strong>
        <Button
          variant="outline"
          size="sm"
          onClick={add}
          disabled={stock === 0}
        >
          {stock === 0 ? 'Out of stock' : 'Add to cart'}
        </Button>
      </div>
    </article>
  );
}

function productFilterParams(values: ProductFilterValues) {
  const next = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    const clean = String(value ?? '').trim();
    if (clean) next.set(key, clean);
  });
  next.set('page', '1');
  return next;
}

function DebouncedProductSearch({
  setParams,
}: {
  setParams: ReturnType<typeof useSearchParams>[1];
}) {
  const { values } = useFormikContext<ProductFilterValues>();
  const mounted = useRef(false);
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setParams(productFilterParams(valuesRef.current));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [setParams, values.search]);

  return null;
}

const reviewInitialValues: ReviewValues = {
  rating: '5',
  comment: '',
};

function ReviewForm({
  productId,
  onCreated,
}: {
  productId: string;
  onCreated: () => void;
}) {
  const mutation = useCreateReviewMutation(productId);

  return (
    <Formik<ReviewValues>
      initialValues={reviewInitialValues}
      validationSchema={reviewSchema}
      onSubmit={async (values, { resetForm, setStatus, setSubmitting }) => {
        setStatus(undefined);
        try {
          const next = reviewSchema.cast(values);
          await mutation.mutateAsync({
            rating: Number(next.rating),
            ...(next.comment ? { comment: next.comment } : {}),
          });
          resetForm();
          onCreated();
        } catch (err) {
          setStatus(getErrorMessage(err, 'Could not submit review'));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, status: formStatus }) => (
        <Form className="review-form" noValidate>
          <FormError>{formStatus}</FormError>
          <SelectField name="rating" label="Rating">
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} stars
              </option>
            ))}
          </SelectField>
          <TextareaField
            name="comment"
            label="Comment"
            placeholder="What stood out?"
            maxLength={1000}
          />
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting || mutation.isPending}
          >
            Submit review
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') ?? 1);
  const search = params.get('search') ?? '';
  const categoryId = params.get('categoryId') ?? undefined;
  const vendorId = params.get('vendorId') ?? undefined;
  const minPriceParam = params.get('minPrice') ?? '';
  const maxPriceParam = params.get('maxPrice') ?? '';
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;

  const categories = useCategoriesQuery();
  const products = useProductsQuery({
    page,
    limit: 12,
    search,
    categoryId,
    vendorId,
    minPrice,
    maxPrice,
  });

  const initialFilters = useMemo<ProductFilterValues>(
    () => ({
      search,
      categoryId: categoryId ?? '',
      vendorId: vendorId ?? '',
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
    }),
    [categoryId, maxPriceParam, minPriceParam, search, vendorId],
  );

  const meta = products.data?.meta;

  return (
    <main className="page-shell">
      <PageIntro
        title="Products"
        body="Search the live catalog, narrow by department, and add available products to your local cart."
      />
      <Formik<ProductFilterValues>
        enableReinitialize
        initialValues={initialFilters}
        validationSchema={productFilterSchema}
        onSubmit={(values) => setParams(productFilterParams(values))}
      >
        <Form className="filter-panel" noValidate>
          <DebouncedProductSearch setParams={setParams} />
          <TextField
            name="search"
            label="Search"
            placeholder="Sneakers, lamp, serum"
          />
          <input
            type="hidden"
            name="vendorId"
            value={vendorId ?? ''}
            readOnly
          />
          <SelectField name="categoryId" label="Department">
            <option value="">All departments</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
          <TextField name="minPrice" label="Min price" type="number" min="0" />
          <TextField name="maxPrice" label="Max price" type="number" min="0" />
          <Button type="submit" className="self-end">
            Apply filters
          </Button>
        </Form>
      </Formik>
      {vendorId && (
        <div className="filter-chip-row">
          <span>Vendor filter active: {vendorId.slice(0, 8)}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setParams((current) => {
                current.delete('vendorId');
                current.set('page', '1');
                return current;
              })
            }
          >
            Clear vendor
          </Button>
        </div>
      )}

      {products.isLoading && (
        <div className="route-state">Loading products...</div>
      )}
      {products.error && (
        <div className="form-error">
          {getErrorMessage(products.error, 'Could not load products')}
        </div>
      )}
      {products.data?.data.length === 0 && (
        <div className="empty-panel">
          <h2>No products found.</h2>
          <p>Try a broader search or clear the filters.</p>
        </div>
      )}
      <div className="commerce-grid">
        {products.data?.data.map((product) => (
          <ProductTile key={product.id} product={product} />
        ))}
      </div>
      {meta && meta.totalPages > 1 && (
        <div className="pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() =>
              setParams((current) => {
                current.set('page', String(page - 1));
                return current;
              })
            }
          >
            Previous
          </Button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() =>
              setParams((current) => {
                current.set('page', String(page + 1));
                return current;
              })
            }
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, user } = useAuth();
  const { addProduct } = useCart();
  const [showFullReviews, setShowFullReviews] = useState(false);
  const product = useProductQuery(id);
  const paginatedReviews = useProductReviewsQuery(id, showFullReviews);
  const eligibility = useReviewEligibilityQuery(
    id,
    status === 'authenticated' && user?.role === 'CUSTOMER',
  );

  if (product.isLoading) {
    return (
      <main className="page-shell">
        <div className="route-state">Loading product...</div>
      </main>
    );
  }

  if (product.error || !product.data) {
    return (
      <main className="page-shell">
        <div className="empty-panel">
          <h1>Product not found.</h1>
          <p>
            {getErrorMessage(product.error, 'This product is unavailable.')}
          </p>
        </div>
      </main>
    );
  }

  const item = product.data;
  const stock = item.inventory?.quantity;
  const fullReviews = paginatedReviews.data?.pages.flatMap((page) => page.data);

  const add = () => {
    addProduct(item);
    toast.success('Added to cart', {
      description: item.name,
      action: { label: 'View cart', onClick: () => navigate('/cart') },
    });
  };

  return (
    <main className="page-shell detail-layout">
      <div className="detail-media">
        <ImageWithFallback src={item.images?.[0] ?? ''} alt={item.name} />
      </div>
      <section className="detail-copy">
        <Link to="/products" className="text-link">
          Back to products
        </Link>
        <h1>{item.name}</h1>
        <p>{item.description ?? 'A curated marketplace find.'}</p>
        <div className="detail-price">{formatMoney(item.price)}</div>
        <p className="availability">
          {stock === 0
            ? 'Out of stock'
            : stock === undefined
              ? 'Availability updates at checkout.'
              : `${stock} available`}
        </p>
        <Button size="lg" onClick={add} disabled={stock === 0}>
          Add to cart
        </Button>
        <div className="review-boundary">
          <h2>Reviews</h2>
          {(fullReviews?.length ? fullReviews : item.reviews)?.length ? (
            (fullReviews?.length ? fullReviews : item.reviews)?.map(
              (review) => (
                <article key={review.id}>
                  <strong>
                    {review.rating}/5
                    {review.user &&
                      ` · ${review.user.firstName} ${review.user.lastName}`}
                  </strong>
                  <p>{review.comment ?? 'No written comment.'}</p>
                </article>
              ),
            )
          ) : (
            <p>No reviews yet.</p>
          )}
          <div className="review-actions">
            {showFullReviews && paginatedReviews.hasNextPage ? (
              <Button
                variant="outline"
                size="sm"
                isLoading={paginatedReviews.isFetching}
                onClick={() => paginatedReviews.fetchNextPage()}
              >
                Load more reviews
              </Button>
            ) : !showFullReviews ? (
              item._count?.reviews ? (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={paginatedReviews.isFetching}
                  onClick={() => setShowFullReviews(true)}
                >
                  Load full reviews
                </Button>
              ) : null
            ) : null}
          </div>
          {status !== 'authenticated' && (
            <p>
              <Link
                to="/login"
                state={{ from: { pathname: `/products/${item.id}` } }}
              >
                Sign in
              </Link>{' '}
              after a delivered order to review this product.
            </p>
          )}
          {status === 'authenticated' && user?.role === 'CUSTOMER' && (
            <div className="review-submit-panel">
              <h3>Write a review</h3>
              {eligibility.isLoading && <p>Checking review eligibility...</p>}
              {eligibility.error && (
                <p>
                  {getErrorMessage(
                    eligibility.error,
                    'Could not check review eligibility',
                  )}
                </p>
              )}
              {eligibility.data?.eligible ? (
                <ReviewForm
                  productId={item.id}
                  onCreated={() => {
                    setShowFullReviews(false);
                  }}
                />
              ) : (
                eligibility.data && (
                  <p>
                    {eligibility.data.reason ??
                      'Reviews are available after a delivered order and before you have reviewed this product.'}
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export function CartPage() {
  const location = useLocation();
  const { status } = useAuth();
  const { items, setQuantity, removeItem, subtotal } = useCart();
  const cartError =
    location.state &&
    typeof location.state === 'object' &&
    'cartError' in location.state
      ? String((location.state as { cartError: string }).cartError)
      : '';

  return (
    <main className="page-shell">
      <PageIntro
        title="Cart"
        body="Your cart is stored on this device. Final prices and stock are confirmed by the server at checkout."
      />
      {cartError && <div className="form-error">{cartError}</div>}
      {items.length === 0 ? (
        <div className="empty-panel">
          <h2>Your cart is empty.</h2>
          <p>Browse the catalog to add something useful.</p>
          <Button asChild size="lg">
            <Link to="/products">Browse products</Link>
          </Button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-row" key={item.productId}>
                <ImageWithFallback src={item.image} alt={item.name} />
                <div>
                  <h2>{item.name}</h2>
                  <p>{formatMoney(item.price)}</p>
                  {item.stock === 0 && (
                    <span className="inline-warning">Out of stock</span>
                  )}
                </div>
                <Input
                  aria-label={`Quantity for ${item.name}`}
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(event) =>
                    setQuantity(item.productId, Number(event.target.value))
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                >
                  Remove
                </Button>
              </article>
            ))}
          </div>
          <aside className="summary-panel">
            <p>Estimated subtotal</p>
            <strong>{formatMoney(subtotal)}</strong>
            <p>
              Server pricing and stock are checked when the order is created.
            </p>
            {status === 'authenticated' ? (
              <Button asChild size="lg">
                <Link to="/checkout">Checkout</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/login" state={{ from: { pathname: '/checkout' } }}>
                  Sign in to checkout
                </Link>
              </Button>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

const checkoutInitialValues: CheckoutValues = {
  street: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  method: 'CARD',
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const orderMutation = useCreateOrderMutation();
  const paymentMutation = useInitializePaymentMutation();

  return (
    <main className="page-shell checkout-page">
      <PageIntro
        title="Checkout"
        body="Enter the delivery address, then continue to Paystack. The webhook may update order status shortly after verification."
      />
      <Formik<CheckoutValues>
        initialValues={checkoutInitialValues}
        validationSchema={checkoutSchema}
        onSubmit={async (values, { setStatus, setSubmitting }) => {
          setStatus(undefined);
          if (items.length === 0) {
            setStatus('Your cart is empty.');
            setSubmitting(false);
            return;
          }

          try {
            const { method, ...shippingAddress } = checkoutSchema.cast(values);
            const order = await orderMutation.mutateAsync({
              items: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
              shippingAddress,
            });
            const payment = await paymentMutation.mutateAsync({
              orderId: order.id,
              method,
            });
            sessionStorage.setItem(
              'pending_payment_reference',
              payment.reference,
            );
            sessionStorage.setItem('pending_order_id', order.id);
            clearCart();
            window.location.assign(payment.authorizationUrl);
          } catch (err) {
            const message = getErrorMessage(err, 'Could not create the order');
            if (
              message.toLowerCase().includes('stock') ||
              message.toLowerCase().includes('unavailable')
            ) {
              navigate('/cart', { state: { cartError: message } });
              return;
            }
            setStatus(message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status: formStatus }) => (
          <Form className="checkout-form" noValidate>
            <FormError>{formStatus}</FormError>
            <TextField
              name="street"
              label="Street"
              autoComplete="street-address"
            />
            <TextField name="city" label="City" autoComplete="address-level2" />
            <TextField
              name="state"
              label="State"
              autoComplete="address-level1"
            />
            <TextField
              name="country"
              label="Country"
              autoComplete="country-name"
            />
            <TextField
              name="zipCode"
              label="Zip code"
              autoComplete="postal-code"
            />
            <SelectField name="method" label="Payment method">
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="WALLET">Wallet</option>
            </SelectField>
            <Button
              type="submit"
              size="lg"
              isLoading={
                isSubmitting ||
                orderMutation.isPending ||
                paymentMutation.isPending
              }
            >
              Continue to payment
            </Button>
          </Form>
        )}
      </Formik>
    </main>
  );
}

export function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const reference =
    params.get('reference') ??
    sessionStorage.getItem('pending_payment_reference') ??
    '';
  const orderId =
    params.get('orderId') ?? sessionStorage.getItem('pending_order_id') ?? '';
  const verification = useVerifyPaymentQuery(reference);
  const payment = usePaymentByOrderQuery(orderId, verification.data?.status);

  return (
    <main className="page-shell">
      <div className="empty-panel">
        <p className="kicker">Payment callback</p>
        <h1>
          {verification.isLoading
            ? 'Verifying payment...'
            : verification.error
              ? 'Payment needs attention.'
              : 'Payment verified.'}
        </h1>
        {verification.error && (
          <p>
            {getErrorMessage(verification.error, 'Could not verify payment')}
          </p>
        )}
        {verification.data && (
          <p>
            Reference {verification.data.reference}. Persisted status:{' '}
            {payment.data?.status ?? 'processing'}.
          </p>
        )}
        <Button asChild size="lg">
          <Link to="/orders">View orders</Link>
        </Button>
      </div>
    </main>
  );
}

export function OrdersPage() {
  const orders = useMyOrdersQuery();
  const cancelMutation = useCancelOrderMutation();

  return (
    <main className="page-shell">
      <PageIntro
        title="Orders"
        body="Track payment and fulfillment status. Pending orders can still be cancelled."
      />
      {orders.isLoading && <div className="route-state">Loading orders...</div>}
      {orders.error && (
        <div className="form-error">
          {getErrorMessage(orders.error, 'Could not load orders')}
        </div>
      )}
      <div className="table-list">
        {orders.data?.map((order) => (
          <article key={order.id}>
            <div>
              <strong>{order.id.slice(0, 8)}</strong>
              <span>{format(new Date(order.createdAt), 'dd-MM-yyyy')}</span>
            </div>
            <div>{order.status}</div>
            <div>{order.payment?.status ?? 'Payment pending'}</div>
            <div>{formatMoney(order.totalAmount)}</div>
            {order.status === 'PENDING' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => cancelMutation.mutate(order.id)}
              >
                Cancel
              </Button>
            )}
          </article>
        ))}
      </div>
      {orders.data?.length === 0 && (
        <div className="empty-panel">
          <h2>No orders yet.</h2>
          <p>Your completed checkout history will appear here.</p>
        </div>
      )}
    </main>
  );
}

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const defaults = useMemo<ProfileValues>(
    () => ({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      password: '',
    }),
    [user],
  );

  return (
    <main className="page-shell">
      <PageIntro
        title="Profile"
        body="Keep your account details current. Logging out revokes the active backend session and clears this tab."
      />
      <Formik<ProfileValues>
        enableReinitialize
        initialValues={defaults}
        validationSchema={profileSchema}
        onSubmit={async (values, { setStatus, setSubmitting }) => {
          setStatus(undefined);
          try {
            const next = profileSchema.cast(values);
            await updateProfile({
              firstName: next.firstName,
              lastName: next.lastName,
              ...(next.password ? { password: next.password } : {}),
            });
          } catch (err) {
            setStatus(getErrorMessage(err, 'Could not update profile'));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status: formStatus }) => (
          <Form className="settings-form" noValidate>
            <FormError>{formStatus}</FormError>
            <div className="two-col">
              <TextField
                name="firstName"
                label="First name"
                autoComplete="given-name"
              />
              <TextField
                name="lastName"
                label="Last name"
                autoComplete="family-name"
              />
            </div>
            <PasswordField
              name="password"
              label="New password"
              placeholder="Leave blank to keep current password"
              autoComplete="new-password"
            />
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Save profile
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              Logout
            </Button>
          </Form>
        )}
      </Formik>
    </main>
  );
}
