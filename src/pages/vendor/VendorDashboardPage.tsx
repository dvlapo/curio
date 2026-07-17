import {
  useVendorDashboardInventoryQuery,
  useVendorStoreQuery,
} from '../../hooks/queries';
import { getErrorMessage } from '../../utils/errors';
import { VendorIntro } from './components/VendorIntro';

export function VendorDashboardPage() {
  const store = useVendorStoreQuery();
  const inventory = useVendorDashboardInventoryQuery();

  return (
    <section>
      <VendorIntro
        title="Vendor dashboard"
        body="Manage your store, products, and inventory from the backend profile attached to your account."
      />
      {store.isLoading && <div className="route-state">Loading store...</div>}
      {store.error && (
        <div className="form-error">
          {getErrorMessage(store.error, 'Could not load store')}
        </div>
      )}
      {store.data && (
        <div className="metric-grid">
          <article>
            <span>Store</span>
            <strong>{store.data.storeName}</strong>
          </article>
          <article>
            <span>Approval</span>
            <strong>{store.data.isApproved ? 'Approved' : 'Pending'}</strong>
          </article>
          <article>
            <span>Products</span>
            <strong>{store.data.products?.length ?? 0}</strong>
          </article>
          <article>
            <span>Inventory rows</span>
            <strong>{inventory.data?.length ?? 0}</strong>
          </article>
        </div>
      )}
      {store.data && !store.data.isApproved && (
        <div className="notice-panel">
          <h2>Approval required</h2>
          <p>
            You can edit your store profile now, but product creation will fail
            until an admin approves the vendor profile.
          </p>
        </div>
      )}
    </section>
  );
}
