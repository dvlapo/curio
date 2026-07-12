import { useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { catalogApi, inventoryApi, reviewsApi, uploadApi, vendorApi } from '../../api';
import {
  FileField,
  FormError,
  SelectField,
  TextareaField,
  TextField,
} from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import { formatMoney } from '../../utils/money';
import { getErrorMessage } from '../../utils/errors';
import type { Inventory, Product } from '../../types';
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
  imageFiles: [],
};

function productFormInitialValues(product?: Product): VendorProductValues {
  return {
    name: product?.name ?? '',
    price: product?.price ? String(product.price) : '',
    categoryId: product?.categoryId ?? '',
    description: product?.description ?? '',
    imageFiles: [],
  };
}

function VendorProductForm({
  product,
  approved,
  categories,
  isSaving,
  onSave,
  onCancel,
}: {
  product?: Product;
  approved: boolean;
  categories: Array<{ id: string; name: string }> | undefined;
  isSaving: boolean;
  onSave: (product: Product | undefined, values: VendorProductValues) => Promise<unknown>;
  onCancel?: () => void;
}) {
  return (
    <Formik<VendorProductValues>
      enableReinitialize
      initialValues={product ? productFormInitialValues(product) : productInitialValues}
      validationSchema={vendorProductSchema}
      onSubmit={async (values, { resetForm, setStatus, setSubmitting }) => {
        setStatus(undefined);
        try {
          await onSave(product, values);
          if (!product) resetForm();
        } catch (err) {
          setStatus(
            getErrorMessage(
              err,
              product ? 'Could not update product' : 'Could not create product',
            ),
          );
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, status: formStatus }) => (
        <Form className={product ? 'settings-form product-edit-form' : 'settings-form'} noValidate>
          <FormError>{formStatus}</FormError>
          <div className="two-col">
            <TextField name="name" label="Name" />
            <TextField name="price" label="Price" type="number" min="0" step="0.01" />
          </div>
          <SelectField name="categoryId" label="Category">
            <option value="">Choose category</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectField>
          <TextareaField name="description" label="Description" />
          {product?.images?.length ? (
            <p className="m-0 text-sm text-muted">
              Existing images are preserved unless you upload replacements.
            </p>
          ) : null}
          <FileField
            name="imageFiles"
            label="Product images"
            accept="image/*"
            multiple
            description="Upload up to 5 images, 5MB each. Leave empty while editing to keep current images."
          />
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              size={product ? 'sm' : 'lg'}
              disabled={!approved || isSaving || isSubmitting}
              isLoading={isSaving || isSubmitting}
            >
              {product ? 'Save product' : 'Create product'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}

export function VendorProductsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const store = useQuery({ queryKey: ['vendor', 'store'], queryFn: vendorApi.myStore });
  const products = useQuery({ queryKey: ['vendor', 'products'], queryFn: catalogApi.myProducts });
  const categories = useQuery({ queryKey: ['categories'], queryFn: catalogApi.categories });

  const saveMutation = useMutation({
    mutationFn: async ({
      product,
      values,
    }: {
      product?: Product;
      values: VendorProductValues;
    }) => {
      const next = vendorProductSchema.cast(values);
      const files = Array.isArray(next.imageFiles) ? next.imageFiles : [];
      const uploaded = files.length ? await uploadApi.productImages(files) : null;
      const images = uploaded?.images.map((image) => image.url) ?? product?.images ?? undefined;
      const body = {
        name: next.name,
        description: next.description,
        price: Number(next.price),
        categoryId: next.categoryId,
        ...(images ? { images } : {}),
      };

      return product
        ? catalogApi.updateProduct(product.id, body)
        : catalogApi.createProduct(body);
    },
    onSuccess: () => {
      toast.success('Product saved');
      queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] });
      setEditingId(null);
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
      <VendorProductForm
        approved={Boolean(store.data?.isApproved)}
        categories={categories.data}
        isSaving={saveMutation.isPending}
        onSave={(product, values) => saveMutation.mutateAsync({ product, values })}
      />
      <div className="table-list">
        {products.data?.map((product) => (
          <article key={product.id}>
            {editingId === product.id ? (
              <div className="col-span-full">
                <VendorProductForm
                  product={product}
                  approved={Boolean(store.data?.isApproved)}
                  categories={categories.data}
                  isSaving={saveMutation.isPending}
                  onSave={(item, values) => saveMutation.mutateAsync({ product: item, values })}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category?.name ?? 'Category'}</span>
                </div>
                <div>{formatMoney(product.price)}</div>
                <div>{product.isActive ? 'Active' : 'Inactive'}</div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(product.id)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateMutation.mutate({ id: product.id, isActive: !product.isActive })}
                  >
                    {product.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </>
            )}
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

export function VendorReviewsPage() {
  const [page, setPage] = useState(1);
  const reviews = useQuery({
    queryKey: ['reviews', 'vendor', page],
    queryFn: () => reviewsApi.vendor(page),
  });

  return (
    <section>
      <VendorIntro
        title="Product reviews"
        body="Read customer reviews across your products. Review editing and replies are not part of the current API."
      />
      {reviews.isLoading && <div className="route-state">Loading reviews...</div>}
      {reviews.error && (
        <div className="form-error">{getErrorMessage(reviews.error, 'Could not load reviews')}</div>
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
            <div>{new Date(review.createdAt).toLocaleDateString()}</div>
          </article>
        ))}
      </div>
      {reviews.data?.data.length === 0 && (
        <div className="empty-panel">
          <h2>No reviews yet.</h2>
          <p>Reviews for your products will appear here after customers submit them.</p>
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
