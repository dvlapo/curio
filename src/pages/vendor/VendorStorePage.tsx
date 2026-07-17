import { useMemo } from 'react';
import { Form, Formik } from 'formik';
import {
  vendorStoreSchema,
  type VendorStoreValues,
} from '../../../validations';
import {
  FormError,
  TextareaField,
  TextField,
} from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import {
  useUpdateVendorStoreMutation,
  useVendorStoreQuery,
} from '../../hooks/queries';
import { getErrorMessage } from '../../utils/errors';
import { VendorIntro } from './components/VendorIntro';

export function VendorStorePage() {
  const store = useVendorStoreQuery();
  const mutation = useUpdateVendorStoreMutation();

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
            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting || mutation.isPending}
            >
              Save store
            </Button>
          </Form>
        )}
      </Formik>
    </section>
  );
}
