import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import {
  usePaymentByOrderQuery,
  useVerifyPaymentQuery,
} from '../../hooks/queries';
import { getErrorMessage } from '../../utils/errors';

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
