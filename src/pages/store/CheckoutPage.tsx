import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { checkoutSchema, type CheckoutValues } from '../../../validations';
import { useCart } from '../../cart/CartContext';
import {
  FormError,
  SelectField,
  TextField,
} from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import {
  useCreateOrderMutation,
  useInitializePaymentMutation,
} from '../../hooks/queries';
import { getErrorMessage } from '../../utils/errors';
import { PageIntro } from './components/PageIntro';

const checkoutInitialValues: CheckoutValues = {
  street: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  method: 'CARD',
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const orderMutation = useCreateOrderMutation();
  const paymentMutation = useInitializePaymentMutation();

  return (
    <main className="page-shell checkout-page">
      <PageIntro
        title="Checkout"
        body="Enter the delivery address, then continue to Paystack. The webhook may update order status shortly after verification."
      />
      <Formik<CheckoutValues>
        initialValues={checkoutInitialValues}
        validationSchema={checkoutSchema}
        onSubmit={async (values, { setStatus, setSubmitting }) => {
          setStatus(undefined);
          if (items.length === 0) {
            setStatus('Your cart is empty.');
            setSubmitting(false);
            return;
          }

          try {
            const { method, ...shippingAddress } = checkoutSchema.cast(values);
            const order = await orderMutation.mutateAsync({
              items: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
              shippingAddress,
            });
            const payment = await paymentMutation.mutateAsync({
              orderId: order.id,
              method,
            });
            sessionStorage.setItem(
              'pending_payment_reference',
              payment.reference,
            );
            sessionStorage.setItem('pending_order_id', order.id);
            clearCart();
            window.location.assign(payment.authorizationUrl);
          } catch (err) {
            const message = getErrorMessage(err, 'Could not create the order');
            if (
              message.toLowerCase().includes('stock') ||
              message.toLowerCase().includes('unavailable')
            ) {
              navigate('/cart', { state: { cartError: message } });
              return;
            }
            setStatus(message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status: formStatus }) => (
          <Form className="checkout-form" noValidate>
            <FormError>{formStatus}</FormError>
            <TextField
              name="street"
              label="Street"
              autoComplete="street-address"
            />
            <TextField name="city" label="City" autoComplete="address-level2" />
            <TextField
              name="state"
              label="State"
              autoComplete="address-level1"
            />
            <TextField
              name="country"
              label="Country"
              autoComplete="country-name"
            />
            <TextField
              name="zipCode"
              label="Zip code"
              autoComplete="postal-code"
            />
            <SelectField name="method" label="Payment method">
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="WALLET">Wallet</option>
            </SelectField>
            <Button
              type="submit"
              size="lg"
              isLoading={
                isSubmitting ||
                orderMutation.isPending ||
                paymentMutation.isPending
              }
            >
              Continue to payment
            </Button>
          </Form>
        )}
      </Formik>
    </main>
  );
}
