import { useState } from 'react';
import { Form, Formik } from 'formik';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { reviewSchema, type ReviewValues } from '../../../validations';
import { useAuth } from '../../auth/AuthContext';
import { useCart } from '../../cart/CartContext';
import {
  FormError,
  SelectField,
  TextareaField,
} from '../../components/forms/FormFields';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { Button } from '../../components/ui/button';
import {
  useCreateReviewMutation,
  useProductQuery,
  useProductReviewsQuery,
  useReviewEligibilityQuery,
} from '../../hooks/queries';
import { getErrorMessage } from '../../utils/errors';
import { formatMoney } from '../../utils/money';

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
                  onCreated={() => setShowFullReviews(false)}
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
