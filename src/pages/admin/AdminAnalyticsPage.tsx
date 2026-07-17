import { useState } from 'react';
import { Select } from '../../components/ui/select';
import { useAdminAnalyticsQuery } from '../../hooks/queries';
import { getErrorMessage } from '../../utils/errors';
import { formatMoney } from '../../utils/money';
import { AdminIntro } from './components/AdminIntro';

export function AdminAnalyticsPage() {
  const [limit, setLimit] = useState(5);
  const analytics = useAdminAnalyticsQuery(limit);

  return (
    <section>
      <AdminIntro
        title="Analytics"
        body="Real marketplace analytics from successful payments, orders, vendors, and product reviews."
      />
      <div className="analytics-toolbar">
        <div>
          <span className="admin-eyebrow">Report controls</span>
          <strong>Performance overview</strong>
        </div>
        <label htmlFor="analytics-limit">
          <span>Rows per table</span>
          <Select
            id="analytics-limit"
            value={String(limit)}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            <option value="5">5 rows</option>
            <option value="10">10 rows</option>
            <option value="20">20 rows</option>
          </Select>
        </label>
      </div>
      {analytics.isLoading && (
        <div className="route-state">Loading analytics...</div>
      )}
      {analytics.error && (
        <div className="form-error">
          {getErrorMessage(analytics.error, 'Could not load analytics')}
        </div>
      )}
      {analytics.data && (
        <>
          <div className="metric-grid analytics-metrics">
            <article>
              <span>Total revenue</span>
              <strong>{formatMoney(analytics.data.totalRevenue)}</strong>
            </article>
            {Object.entries(analytics.data.ordersByStatus).map(
              ([status, count]) => (
                <article key={status}>
                  <span>{status}</span>
                  <strong>{count}</strong>
                </article>
              ),
            )}
          </div>
          <div className="analytics-grid">
            <section>
              <h2>Top-selling products</h2>
              {analytics.data.topSellingProducts.length > 0 && (
              <div className="admin-table analytics-table">
                <div className="admin-table__header" aria-hidden="true">
                  <span>Product</span>
                  <span>Sales</span>
                  <span>Revenue</span>
                </div>
                {analytics.data.topSellingProducts.map((product) => (
                  <article key={product.productId} className="admin-table__row">
                    <div className="admin-table__identity">
                      <strong>{product.name}</strong>
                      <span>{product.vendor.storeName}</span>
                    </div>
                    <div className="analytics-table__stack" data-label="Sales">
                      <strong>{product.unitsSold} sold</strong>
                      <span>{product.orderCount} orders</span>
                    </div>
                    <div className="admin-table__amount" data-label="Revenue">
                      {formatMoney(product.revenue)}
                    </div>
                  </article>
                ))}
              </div>
              )}
              {analytics.data.topSellingProducts.length === 0 && (
                <div className="empty-panel">
                  <h2>No product sales yet.</h2>
                  <p>
                    Paid product performance will appear after successful
                    orders.
                  </p>
                </div>
              )}
            </section>
            <section>
              <h2>Vendor performance</h2>
              {analytics.data.vendorPerformance.length > 0 && (
              <div className="admin-table analytics-table">
                <div className="admin-table__header" aria-hidden="true">
                  <span>Vendor</span>
                  <span>Sales</span>
                  <span>Revenue</span>
                </div>
                {analytics.data.vendorPerformance.map((vendor) => (
                  <article key={vendor.vendorId} className="admin-table__row">
                    <div className="admin-table__identity">
                      <strong>{vendor.storeName}</strong>
                      <span>{vendor.productCount} products</span>
                    </div>
                    <div className="analytics-table__stack" data-label="Sales">
                      <strong>{vendor.unitsSold} sold</strong>
                      <span>
                        {vendor.averageRating === null
                          ? 'No rating'
                          : `${vendor.averageRating.toFixed(1)} avg rating`}
                      </span>
                    </div>
                    <div className="admin-table__amount" data-label="Revenue">
                      {formatMoney(vendor.revenue)}
                    </div>
                  </article>
                ))}
              </div>
              )}
              {analytics.data.vendorPerformance.length === 0 && (
                <div className="empty-panel">
                  <h2>No vendor performance yet.</h2>
                  <p>Vendor rankings will appear once paid orders exist.</p>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
}
