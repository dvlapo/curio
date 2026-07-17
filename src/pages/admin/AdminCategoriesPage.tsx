import { Form, Formik } from 'formik';
import {
  categorySchema,
  type CategoryValues,
} from '../../../validations';
import {
  FormError,
  TextareaField,
  TextField,
} from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '../../hooks/queries';
import type { Category, UpdateCategoryInput } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { AdminIntro } from './components/AdminIntro';

function categoryInitialValues(category?: Category): CategoryValues {
  return {
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    imageUrl: category?.imageUrl ?? '',
  };
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
              mode === 'create'
                ? 'Could not save category'
                : 'Could not update category',
            ),
          );
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, status: formStatus }) => (
        <Form
          className={mode === 'create' ? 'settings-form' : 'category-edit-form'}
          noValidate
        >
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
          {/* <TextField name="imageUrl" label="Image URL" inputMode="url" /> */}
          <Button
            type="submit"
            variant={mode === 'create' ? 'default' : 'outline'}
            size={mode === 'create' ? 'lg' : 'sm'}
            isLoading={isSubmitting || isSaving}
          >
            {mode === 'create' ? 'Create category' : 'Save'}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export function AdminCategoriesPage() {
  const categories = useCategoriesQuery();
  const create = useCreateCategoryMutation();
  const update = useUpdateCategoryMutation();
  const remove = useDeleteCategoryMutation();

  return (
    <section>
      <AdminIntro
        title="Categories"
        body="Create, update, and remove categories. Product-linked deletions may be rejected by the database."
      />
      <div className="admin-form-panel">
        <div className="admin-form-panel__heading">
          <div>
            <span className="admin-eyebrow">New category</span>
            <h2>Add to your catalog</h2>
          </div>
          <p>Use a short, descriptive name and a URL-friendly slug.</p>
        </div>
        <CategoryForm
          mode="create"
          isSaving={create.isPending}
          onSubmit={(values) =>
            create.mutateAsync(values as Required<UpdateCategoryInput>)
          }
        />
      </div>
      {remove.error && (
        <div className="form-error">
          {getErrorMessage(remove.error, 'Could not delete category')}
        </div>
      )}
      <div className="admin-table admin-table--categories">
        <div className="admin-table__header" aria-hidden="true">
          <span>Category details</span>
          <span>Products</span>
          <span>Action</span>
        </div>
        {categories.data?.map((category) => (
          <article key={category.id} className="admin-table__row category-row">
            <CategoryForm
              mode="update"
              category={category}
              isSaving={update.isPending}
              onSubmit={(values) =>
                update.mutateAsync({ id: category.id, body: values })
              }
            />
            <div className="admin-table__metric" data-label="Products">
              <strong>{category._count?.products ?? 0}</strong>
              <span>products</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="admin-table__action admin-table__action--danger"
              onClick={() =>
                window.confirm(`Delete ${category.name}?`) &&
                remove.mutate(category.id)
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
