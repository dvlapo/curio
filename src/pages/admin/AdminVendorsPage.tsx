import { Button } from '../../components/ui/button';
import {
  useAdminVendorsQuery,
  useApproveVendorMutation,
} from '../../hooks/queries';
import { getErrorMessage } from '../../utils/errors';
import { AdminIntro } from './components/AdminIntro';

export function AdminVendorsPage() {
  const vendors = useAdminVendorsQuery();
  const approve = useApproveVendorMutation();

  return (
    <section>
      <AdminIntro
        title="Vendors"
        body="Review vendor profiles and approve stores that can start creating products."
      />
      {vendors.error && (
        <div className="form-error">
          {getErrorMessage(vendors.error, 'Could not load vendors')}
        </div>
      )}
      {vendors.isLoading && (
        <div className="route-state">Loading vendors...</div>
      )}
      {vendors.data && vendors.data.length > 0 && (
        <div className="admin-table admin-table--vendors">
          <div className="admin-table__header" aria-hidden="true">
            <span>Store</span>
            <span>Status</span>
            <span>Description</span>
            <span>Action</span>
          </div>
          {vendors.data.map((vendor) => (
          <article key={vendor.id} className="admin-table__row">
            <div className="admin-table__identity">
              <strong>{vendor.storeName}</strong>
              <span>{vendor.user?.email ?? vendor.userId}</span>
            </div>
            <div data-label="Status">
              <span
                className={`admin-status ${
                  vendor.isApproved
                    ? 'admin-status--active'
                    : 'admin-status--pending'
                }`}
              >
                {vendor.isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>
            <div className="admin-table__description" data-label="Description">
              {vendor.description ?? 'No description provided'}
            </div>
            {!vendor.isApproved && (
              <Button
                variant="outline"
                size="sm"
                className="admin-table__action"
                disabled={approve.isPending}
                onClick={() => approve.mutate(vendor.id)}
              >
                Approve
              </Button>
            )}
            {vendor.isApproved && (
              <span className="admin-table__complete" aria-label="No action required">
                Complete
              </span>
            )}
          </article>
          ))}
        </div>
      )}
      {vendors.data?.length === 0 && (
        <div className="empty-panel admin-empty-state">
          <h2>No vendor applications.</h2>
          <p>New vendor profiles will appear here for review.</p>
        </div>
      )}
    </section>
  );
}
