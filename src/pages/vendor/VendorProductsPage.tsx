import { useState } from 'react';
import { Form, Formik } from 'formik';
import {
  vendorProductSchema,
  type VendorProductValues,
} from '../../../validations';
import {
  FileField,
  FormError,
  SelectField,
  TextareaField,
  TextField,
} from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import {
  useCategoriesQuery,
  useSaveVendorProductMutation,
  useToggleVendorProductMutation,
  useVendorProductsQuery,
  useVendorStoreQuery,
} from '../../hooks/queries';
import type { Product } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { formatMoney } from '../../utils/money';
import { VendorIntro } from './components/VendorIntro';

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
  onSave: (
    product: Product | undefined,
    values: VendorProductValues,
  ) => Promise<unknown>;
  onCancel?: () => void;
}) {
  return (
    <Formik<VendorProductValues>
      enableReinitialize
      initialValues={
        product ? productFormInitialValues(product) : productInitialValues
      }
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
        <Form
          className={
            product ? 'settings-form product-edit-form' : 'settings-form'
          }
          noValidate
        >
          <FormError>{formStatus}</FormError>
          <div className="two-col">
            <TextField name="name" label="Name" />
            <TextField
              name="price"
              label="Price"
              type="number"
              min="0"
              step="0.01"
            />
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const store = useVendorStoreQuery();
  const products = useVendorProductsQuery();
  const categories = useCategoriesQuery();
  const saveMutation = useSaveVendorProductMutation({
    onSuccess: () => setEditingId(null),
  });
  const updateMutation = useToggleVendorProductMutation();

  return (
    <section>
      <VendorIntro
        title="Products"
        body="Create products after approval, then manage activation from the vendor list."
      />
      {!store.data?.isApproved && (
        <div className="notice-panel">
          <h2>Pending approval</h2>
          <p>
            Product creation is disabled until your vendor profile is approved.
          </p>
        </div>
      )}
      <VendorProductForm
        approved={Boolean(store.data?.isApproved)}
        categories={categories.data}
        isSaving={saveMutation.isPending}
        onSave={(product, values) =>
          saveMutation.mutateAsync({ product, values })
        }
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
                  onSave={(item, values) =>
                    saveMutation.mutateAsync({ product: item, values })
                  }
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(product.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateMutation.mutate({
                        id: product.id,
                        isActive: !product.isActive,
                      })
                    }
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
