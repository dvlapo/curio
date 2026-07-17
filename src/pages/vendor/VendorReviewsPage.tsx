import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import { useVendorReviewsQuery } from '../../hooks/queries';
import { getErrorMessage } from '../../utils/errors';
import { VendorIntro } from './components/VendorIntro';

export function VendorReviewsPage() {
  const [page, setPage] = useState(1);
  const reviews = useVendorReviewsQuery(page);

  return (
    <section>
      <VendorIntro
        title="Product reviews"
        body="Read customer reviews across your products. You can use this feedback to improve your products and customer experience."
      />
      {reviews.isLoading && (
        <div className="route-state">Loading reviews...</div>
      )}
      {reviews.error && (
        <div className="form-error">
          {getErrorMessage(reviews.error, 'Could not load reviews')}
        </div>
      )}
      <div className="table-list">
        {reviews.data?.data.map((review) => (
          <article key={review.id}>
            <div>
              <strong>{review.product?.name ?? review.productId}</strong>
              <span>
                {review.user
                  ? `${review.user.firstName} ${review.user.lastName}`
                  : review.userId}
              </span>
            </div>
            <div>{review.rating}/5</div>
            <div>{review.comment ?? 'No written comment.'}</div>
            <div>{format(new Date(review.createdAt), 'dd-MM-yyyy')}</div>
          </article>
        ))}
      </div>
      {reviews.data?.data.length === 0 && (
        <div className="empty-panel">
          <h2>No reviews yet.</h2>
          <p>
            Reviews for your products will appear here after customers submit
            them.
          </p>
        </div>
      )}
      {reviews.data && reviews.data.meta.totalPages > 1 && (
        <div className="pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span>
            Page {reviews.data.meta.page} of {reviews.data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= reviews.data.meta.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
