import { Select } from '../../components/ui/select';
import {
  useAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../../hooks/queries';
import type { OrderStatus } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { formatMoney } from '../../utils/money';
import { AdminIntro } from './components/AdminIntro';

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export function AdminOrdersPage() {
  const orders = useAdminOrdersQuery();
  const update = useUpdateOrderStatusMutation();

  return (
    <section>
      <AdminIntro
        title="Orders"
        body="Manage valid status transitions from the list. Admin detail requests are intentionally avoided due to a backend limitation."
      />
      {orders.error && (
        <div className="form-error">
          {getErrorMessage(orders.error, 'Could not load orders')}
        </div>
      )}
      <div className="admin-table">
        <div className="admin-table__header" aria-hidden="true">
          <span>Order</span>
          <span>Status</span>
          <span>Total</span>
          <span>Update</span>
        </div>
        {orders.data?.map((order) => (
          <article key={order.id} className="admin-table__row">
            <div className="admin-table__identity">
              <strong>{order.id.slice(0, 8)}</strong>
              <span>{order.user?.email ?? order.userId}</span>
            </div>
            <div data-label="Status">
              <span className={`admin-status admin-status--${order.status.toLowerCase()}`}>
                {order.status.toLowerCase()}
              </span>
            </div>
            <div className="admin-table__amount" data-label="Total">
              {formatMoney(order.totalAmount)}
            </div>
            <Select
              className="admin-table__select"
              value=""
              aria-label={`Update ${order.id}`}
              disabled={transitions[order.status].length === 0 || update.isPending}
              onChange={(event) =>
                update.mutate({
                  id: order.id,
                  status: event.target.value as OrderStatus,
                })
              }
            >
              <option value="" disabled>
                {transitions[order.status].length ? 'Change status' : 'No actions'}
              </option>
              {transitions[order.status].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </article>
        ))}
      </div>
    </section>
  );
}
