import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import {
  useCancelOrderMutation,
  useMyOrdersQuery,
} from '../../hooks/queries';
import { getErrorMessage } from '../../utils/errors';
import { formatMoney } from '../../utils/money';
import { PageIntro } from './components/PageIntro';

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
