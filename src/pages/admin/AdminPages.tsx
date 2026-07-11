import { Form, Formik } from 'formik';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi, ordersApi, usersApi, vendorApi } from '../../api';
import { FormError, TextField, TextareaField } from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { formatMoney } from '../../utils/money';
import { getErrorMessage } from '../../utils/errors';
import type { Category, OrderStatus, UpdateCategoryInput } from '../../types';
import { categorySchema, type CategoryValues } from '../../../validations';

function AdminIntro({ title, body }: { title: string; body: string }) {
  return (
    <div className="dashboard-intro">
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  );
}

function categoryInitialValues(category?: Category): CategoryValues {
  return {
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    imageUrl: category?.imageUrl ?? '',
  };
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ['admin', 'users'], queryFn: usersApi.list });
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? usersApi.deactivate(id) : usersApi.activate(id),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return (
    <section>
      <AdminIntro
        title="Users"
        body="Activate or deactivate users. Role assignment is not exposed by the current API."
      />
      {users.error && (
        <div className="form-error">{getErrorMessage(users.error, 'Could not load users')}</div>
      )}
      <div className="table-list">
        {users.data?.map((user) => (
          <article key={user.id}>
            <div>
              <strong>
                {user.firstName} {user.lastName}
              </strong>
              <span>{user.email}</span>
            </div>
            <div>{user.role}</div>
            <div>{user.isActive === false ? 'Inactive' : 'Active'}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggle.mutate({ id: user.id, active: user.isActive !== false })}
            >
              {user.isActive === false ? 'Activate' : 'Deactivate'}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AdminVendorsPage() {
  const queryClient = useQueryClient();
  const vendors = useQuery({ queryKey: ['admin', 'vendors'], queryFn: vendorApi.vendors });
  const approve = useMutation({
    mutationFn: vendorApi.approve,
    onSuccess: () => {
      toast.success('Vendor approved');
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
    },
  });

  return (
    <section>
      <AdminIntro
        title="Vendors"
        body="Review vendor profiles and approve stores that can start creating products."
      />
      {vendors.error && (
        <div className="form-error">{getErrorMessage(vendors.error, 'Could not load vendors')}</div>
      )}
      <div className="table-list">
        {vendors.data?.map((vendor) => (
          <article key={vendor.id}>
            <div>
              <strong>{vendor.storeName}</strong>
              <span>{vendor.user?.email ?? vendor.userId}</span>
            </div>
            <div>{vendor.isApproved ? 'Approved' : 'Pending'}</div>
            <div>{vendor.description ?? 'No description'}</div>
            {!vendor.isApproved && (
              <Button variant="outline" size="sm" onClick={() => approve.mutate(vendor.id)}>
                Approve
              </Button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function CategoryForm({
  category,
  mode,
  onSubmit,
  isSaving,
}: {
  category?: Category;
  mode: 'create' | 'update';
  onSubmit: (values: UpdateCategoryInput) => Promise<unknown>;
  isSaving: boolean;
}) {
  return (
    <Formik<CategoryValues>
      enableReinitialize
      initialValues={categoryInitialValues(category)}
      validationSchema={categorySchema}
      onSubmit={async (values, { resetForm, setStatus, setSubmitting }) => {
        setStatus(undefined);
        try {
          await onSubmit(categorySchema.cast(values));
          if (mode === 'create') resetForm();
        } catch (err) {
          setStatus(
            getErrorMessage(
              err,
              mode === 'create' ? 'Could not save category' : 'Could not update category',
            ),
          );
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, status: formStatus }) => (
        <Form className={mode === 'create' ? 'settings-form' : 'category-edit-form'} noValidate>
          <FormError>{formStatus}</FormError>
          <div className={mode === 'create' ? 'two-col' : 'contents'}>
            <TextField name="name" label="Name" />
            <TextField name="slug" label="Slug" />
          </div>
          {mode === 'create' ? (
            <TextareaField name="description" label="Description" />
          ) : (
            <TextField name="description" label="Description" />
          )}
          <TextField name="imageUrl" label="Image URL" inputMode="url" />
          <Button
            type="submit"
            variant={mode === 'create' ? 'default' : 'outline'}
            size={mode === 'create' ? 'lg' : 'sm'}
            disabled={isSubmitting || isSaving}
          >
            {mode === 'create' ? 'Create category' : 'Save'}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ['categories'], queryFn: catalogApi.categories });
  const create = useMutation({
    mutationFn: catalogApi.createCategory,
    onSuccess: () => {
      toast.success('Category saved');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryInput }) =>
      catalogApi.updateCategory(id, body),
    onSuccess: () => {
      toast.success('Category updated');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
  const remove = useMutation({
    mutationFn: catalogApi.deleteCategory,
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return (
    <section>
      <AdminIntro
        title="Categories"
        body="Create, update, and remove categories. Product-linked deletions may be rejected by the database."
      />
      <CategoryForm
        mode="create"
        isSaving={create.isPending}
        onSubmit={(values) => create.mutateAsync(values as Required<UpdateCategoryInput>)}
      />
      {remove.error && (
        <div className="form-error">{getErrorMessage(remove.error, 'Could not delete category')}</div>
      )}
      <div className="table-list">
        {categories.data?.map((category) => (
          <article key={category.id} className="category-row">
            <CategoryForm
              mode="update"
              category={category}
              isSaving={update.isPending}
              onSubmit={(values) => update.mutateAsync({ id: category.id, body: values })}
            />
            <div>{category._count?.products ?? 0} products</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.confirm(`Delete ${category.name}?`) && remove.mutate(category.id)
              }
            >
              Delete
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const orders = useQuery({ queryKey: ['admin', 'orders'], queryFn: ordersApi.all });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });

  return (
    <section>
      <AdminIntro
        title="Orders"
        body="Manage valid status transitions from the list. Admin detail requests are intentionally avoided due to a backend limitation."
      />
      {orders.error && (
        <div className="form-error">{getErrorMessage(orders.error, 'Could not load orders')}</div>
      )}
      <div className="table-list">
        {orders.data?.map((order) => (
          <article key={order.id}>
            <div>
              <strong>{order.id.slice(0, 8)}</strong>
              <span>{order.user?.email ?? order.userId}</span>
            </div>
            <div>{order.status}</div>
            <div>{formatMoney(order.totalAmount)}</div>
            <Select
              value=""
              aria-label={`Update ${order.id}`}
              onChange={(event) =>
                update.mutate({ id: order.id, status: event.target.value as OrderStatus })
              }
            >
              <option value="" disabled>
                Change status
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

export function AdminAnalyticsPage() {
  return (
    <section>
      <AdminIntro title="Analytics" body="This route is reserved for the planned analytics backend." />
      <div className="empty-panel">
        <h2>Analytics are unavailable.</h2>
        <p>
          No analytics module, route, response shape, or query contract exists yet, so this page
          makes no speculative API request.
        </p>
      </div>
    </section>
  );
}
