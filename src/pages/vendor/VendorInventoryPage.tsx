import { useMemo } from 'react';
import { format } from 'date-fns';
import { Form, Formik } from 'formik';
import { inventorySchema, type InventoryValues } from '../../../validations';
import { FormError, TextField } from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import {
  useInventoryQuery,
  useLowStockQuery,
  useUpdateInventoryMutation,
} from '../../hooks/queries';
import type { Inventory } from '../../types';
import { getErrorMessage } from '../../utils/errors';
import { VendorIntro } from './components/VendorIntro';

function InventoryRowForm({
  row,
  onSubmit,
}: {
  row: Inventory;
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
        <Form className="inline-form items-start" noValidate>
          <TextField name="quantity" label="Qty" type="number" min="0" />
          <TextField name="lowStockAt" label="Low at" type="number" min="1" />
          <Button
            variant="outline"
            size="sm"
            type="submit"
            className="justify-self-end"
            isLoading={isSubmitting}
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
  const inventory = useInventoryQuery();
  const lowStock = useLowStockQuery();
  const mutation = useUpdateInventoryMutation();

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
              <strong>{row.product?.name}</strong>
              <span>
                Last updated: {format(new Date(row.updatedAt), 'dd-MM-yyyy')}
              </span>
            </div>
            <InventoryRowForm
              row={row}
              onSubmit={async (productId, values) => {
                const next = inventorySchema.cast(values);
                await mutation.mutateAsync({
                  productId,
                  quantity: Number(next.quantity),
                  ...(next.lowStockAt
                    ? { lowStockAt: Number(next.lowStockAt) }
                    : {}),
                });
              }}
            />
          </article>
        ))}
      </div>
      {inventory.error && (
        <div className="form-error">
          {getErrorMessage(inventory.error, 'Could not load inventory')}
        </div>
      )}
    </section>
  );
}
