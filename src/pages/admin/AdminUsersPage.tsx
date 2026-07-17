import { Button } from '../../components/ui/button';
import {
  useAdminUsersQuery,
  useToggleUserActiveMutation,
} from '../../hooks/queries';
import { getErrorMessage } from '../../utils/errors';
import { AdminIntro } from './components/AdminIntro';

export function AdminUsersPage() {
  const users = useAdminUsersQuery();
  const toggle = useToggleUserActiveMutation();

  return (
    <section>
      <AdminIntro
        title="Users"
        body="Activate or deactivate users. Deactivated users will not be able to log in or make purchases."
      />
      {users.error && (
        <div className="form-error">
          {getErrorMessage(users.error, 'Could not load users')}
        </div>
      )}
      {users.isLoading && <div className="route-state">Loading users...</div>}
      {users.data && users.data.length > 0 && (
        <div className="admin-table">
          <div className="admin-table__header" aria-hidden="true">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {users.data.map((user) => (
            <article key={user.id} className="admin-table__row">
              <div className="admin-table__identity">
                <strong>
                  {user.firstName} {user.lastName}
                </strong>
                <span>{user.email}</span>
              </div>
              <div data-label="Role">
                <span className="admin-role">{user.role.toLowerCase()}</span>
              </div>
              <div data-label="Status">
                <span
                  className={`admin-status ${
                    user.isActive === false
                      ? 'admin-status--inactive'
                      : 'admin-status--active'
                  }`}
                >
                  {user.isActive === false ? 'Inactive' : 'Active'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={
                  user.isActive === false
                    ? 'admin-table__action'
                    : 'admin-table__action admin-table__action--danger'
                }
                disabled={toggle.isPending}
                onClick={() =>
                  toggle.mutate({
                    id: user.id,
                    active: user.isActive !== false,
                  })
                }
              >
                {user.isActive === false ? 'Activate' : 'Deactivate'}
              </Button>
            </article>
          ))}
        </div>
      )}
      {users.data?.length === 0 && (
        <div className="empty-panel admin-empty-state">
          <h2>No users found.</h2>
          <p>New customer accounts will appear here after registration.</p>
        </div>
      )}
    </section>
  );
}
