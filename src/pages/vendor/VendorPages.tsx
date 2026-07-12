import { useMemo } from 'react';
import { Form, Formik } from 'formik';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi, inventoryApi, vendorApi } from '../../api';
import { FormError, SelectField, TextareaField, TextField } from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import { formatMoney } from '../../utils/money';
import { getErrorMessage } from '../../utils/errors';
import type { Inventory } from '../../types';
import {
  inventorySchema,
  vendorProductSchema,
  vendorStoreSchema,
  type InventoryValues,
  type VendorProductValues,
  type VendorStoreValues,
} from '../../../validations';

function VendorIntro({ title, body }: { title: string; body: string }) {
  return (
    <div className="dashboard-intro">
      <h1>{title}</h1>
      <p>{body}</p>
    </div>
  );
}

function splitImages(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function VendorDashboardPage() {
  const store = useQuery({ queryKey: ['vendor', 'store'], queryFn: vendorApi.myStore });
  const inventory = useQuery({ queryKey: ['inventory'], queryFn: inventoryApi.list });

  return (
    <section>
      <VendorIntro
        title="Vendor dashboard"
        body="Manage your store, products, and inventory from the backend profile attached to your account."
      />
      {store.isLoading && <div className="route-state">Loading store...</div>}
      {store.error && (
        <div className="form-error">{getErrorMessage(store.error, 'Could not load store')}</div>
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
            You can edit your store profile now, but product creation will fail until an admin
            approves the vendor profile.
          </p>
        </div>
      )}
    </section>
  );
}

export function VendorStorePage() {
  const queryClient = useQueryClient();
  const store = useQuery({ queryKey: ['vendor', 'store'], queryFn: vendorApi.myStore });
  const mutation = useMutation({
    mutationFn: vendorApi.updateMyStore,
    onSuccess: () => {
      toast.success('Store updated');
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
    },
  });

  const initialValues = useMemo<VendorStoreValues>(
    () => ({
      storeName: store.data?.storeName ?? '',
      description: store.data?.description ?? '',
      logo: store.data?.logo ?? '',
    }),
    [store.data],
  );

  return (
    <section>
      <VendorIntro
        title="Store profile"
        body="Update public store details. Logo remains a URL because no upload endpoint exists yet."
      />
      <Formik<VendorStoreValues>
        enableReinitialize
        initialValues={initialValues}
        validationSchema={vendorStoreSchema}
        onSubmit={async (values, { setStatus, setSubmitting }) => {
          setStatus(undefined);
          try {
            await mutation.mutateAsync(vendorStoreSchema.cast(values));
          } catch (err) {
            setStatus(getErrorMessage(err, 'Could not update store'));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status: formStatus }) => (
          <Form className="settings-form" noValidate>
            <FormError>{formStatus}</FormError>
            <TextField name="storeName" label="Store name" />
            <TextareaField name="description" label="Description" />
            <TextField name="logo" label="Logo URL" inputMode="url" />
            <Button type="submit" size="lg" isLoading={isSubmitting || mutation.isPending}>
              Save store
            </Button>
          </Form>
        )}
      </Formik>
    </section>
  );
}

const productInitialValues: VendorProductValues = {
  name: '',
  price: '',
  categoryId: '',
  description: '',
  images: '',
};

export function VendorProductsPage() {
  const queryClient = useQueryClient();
  const store = useQuery({ queryKey: ['vendor', 'store'], queryFn: vendorApi.myStore });
  const products = useQuery({ queryKey: ['vendor', 'products'], queryFn: catalogApi.myProducts });
  const categories = useQuery({ queryKey: ['categories'], queryFn: catalogApi.categories });

  const createMutation = useMutation({
    mutationFn: catalogApi.createProduct,
    onSuccess: () => {
      toast.success('Product created');
      queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      catalogApi.updateProduct(id, { isActive }),
    onSuccess: () => {
      toast.success('Product updated');
      queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] });
    },
  });

  return (
    <section>
      <VendorIntro
        title="Products"
        body="Create products after approval, then manage activation from the vendor list."
      />
      {!store.data?.isApproved && (
        <div className="notice-panel">
          <h2>Pending approval</h2>
          <p>Product creation is disabled until your vendor profile is approved.</p>
        </div>
      )}
      <Formik<VendorProductValues>
        initialValues={productInitialValues}
        validationSchema={vendorProductSchema}
        onSubmit={async (values, { resetForm, setStatus, setSubmitting }) => {
          setStatus(undefined);
          try {
            const next = vendorProductSchema.cast(values);
            await createMutation.mutateAsync({
              name: next.name,
              description: next.description,
              price: Number(next.price),
              categoryId: next.categoryId,
              images: splitImages(next.images),
            });
            resetForm();
          } catch (err) {
            setStatus(getErrorMessage(err, 'Could not create product'));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status: formStatus }) => (
          <Form className="settings-form" noValidate>
            <FormError>{formStatus}</FormError>
            <div className="two-col">
              <TextField name="name" label="Name" />
              <TextField name="price" label="Price" type="number" min="0" step="0.01" />
            </div>
            <SelectField name="categoryId" label="Category">
              <option value="">Choose category</option>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>
            <TextareaField name="description" label="Description" />
            <TextField
              name="images"
              label="Image URLs"
              placeholder="https://example.com/a.jpg, https://example.com/b.jpg"
            />
            <Button
              type="submit"
              size="lg"
              disabled={!store.data?.isApproved || isSubmitting || createMutation.isPending}
              isLoading={isSubmitting || createMutation.isPending}
            >
              Create product
            </Button>
          </Form>
        )}
      </Formik>
      <div className="table-list">
        {products.data?.map((product) => (
          <article key={product.id}>
            <div>
              <strong>{product.name}</strong>
              <span>{product.category?.name ?? 'Category'}</span>
            </div>
            <div>{formatMoney(product.price)}</div>
            <div>{product.isActive ? 'Active' : 'Inactive'}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateMutation.mutate({ id: product.id, isActive: !product.isActive })}
            >
              {product.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

function InventoryRowForm({
  row,
  isSaving,
  onSubmit,
}: {
  row: Inventory;
  isSaving: boolean;
  onSubmit: (productId: string, values: InventoryValues) => Promise<void>;
}) {
  const initialValues = useMemo<InventoryValues>(
    () => ({
      quantity: String(row.quantity),
      lowStockAt: row.lowStockAt ? String(row.lowStockAt) : '',
    }),
    [row.lowStockAt, row.quantity],
  );

  return (
    <Formik<InventoryValues>
      enableReinitialize
      initialValues={initialValues}
      validationSchema={inventorySchema}
      onSubmit={async (values, { setStatus, setSubmitting }) => {
        setStatus(undefined);
        try {
          await onSubmit(row.productId, values);
        } catch (err) {
          setStatus(getErrorMessage(err, 'Could not update inventory'));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, status: formStatus }) => (
        <Form className="inline-form" noValidate>
          <TextField name="quantity" label="Qty" type="number" min="0" />
          <TextField name="lowStockAt" label="Low at" type="number" min="1" />
          <Button
            variant="outline"
            size="sm"
            type="submit"
            isLoading={isSubmitting || isSaving}
          >
            Save
          </Button>
          <FormError>{formStatus}</FormError>
        </Form>
      )}
    </Formik>
  );
}

export function VendorInventoryPage() {
  const queryClient = useQueryClient();
  const inventory = useQuery({ queryKey: ['inventory'], queryFn: inventoryApi.list });
  const lowStock = useQuery({ queryKey: ['inventory', 'low'], queryFn: inventoryApi.lowStock });
  const mutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
      lowStockAt,
    }: {
      productId: string;
      quantity: number;
      lowStockAt?: number;
    }) => inventoryApi.update(productId, { quantity, lowStockAt }),
    onSuccess: () => {
      toast.success('Inventory updated');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  return (
    <section>
      <VendorIntro
        title="Inventory"
        body="Update stock quantities and low-stock thresholds for your products."
      />
      {lowStock.data && lowStock.data.length > 0 && (
        <div className="notice-panel">
          <h2>Low stock</h2>
          <p>{lowStock.data.length} products are at or below threshold.</p>
        </div>
      )}
      <div className="table-list">
        {inventory.data?.map((row) => (
          <article key={row.productId}>
            <div>
              <strong>{row.product?.name ?? row.productId}</strong>
              <span>{row.productId}</span>
            </div>
            <InventoryRowForm
              row={row}
              isSaving={mutation.isPending}
              onSubmit={async (productId, values) => {
                const next = inventorySchema.cast(values);
                await mutation.mutateAsync({
                  productId,
                  quantity: Number(next.quantity),
                  ...(next.lowStockAt ? { lowStockAt: Number(next.lowStockAt) } : {}),
                });
              }}
            />
          </article>
        ))}
      </div>
      {inventory.error && (
        <div className="form-error">{getErrorMessage(inventory.error, 'Could not load inventory')}</div>
      )}
    </section>
  );
}
