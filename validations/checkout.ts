import * as yup from 'yup';
import { requiredText } from './common';

export const checkoutSchema = yup.object({
  street: requiredText('Street', 3),
  city: requiredText('City', 2),
  state: requiredText('State', 2),
  country: requiredText('Country', 2),
  zipCode: requiredText('Zip code', 2),
  method: yup
    .mixed<'CARD' | 'BANK_TRANSFER' | 'WALLET'>()
    .oneOf(['CARD', 'BANK_TRANSFER', 'WALLET'], 'Choose a valid payment method')
    .required('Payment method is required'),
});

export type CheckoutValues = yup.InferType<typeof checkoutSchema>;
