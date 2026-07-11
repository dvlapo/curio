import * as yup from 'yup';
import { requiredText } from './common';

const email = yup
  .string()
  .trim()
  .email('Enter a valid email address')
  .required('Email is required');

const password = yup
  .string()
  .min(6, 'Password must be at least 6 characters')
  .required('Password is required');

export const loginSchema = yup.object({
  email,
  password: yup.string().required('Password is required'),
});

export type LoginValues = yup.InferType<typeof loginSchema>;

export const registerSchema = yup.object({
  firstName: requiredText('First name', 2),
  lastName: requiredText('Last name', 2),
  email,
  password,
  role: yup
    .mixed<'CUSTOMER' | 'VENDOR'>()
    .oneOf(['CUSTOMER', 'VENDOR'], 'Choose a valid account type')
    .required('Choose an account type'),
});

export type RegisterValues = yup.InferType<typeof registerSchema>;

export const profileSchema = yup.object({
  firstName: requiredText('First name', 2),
  lastName: requiredText('Last name', 2),
  password: yup
    .string()
    .transform((value) => (value === '' ? undefined : value))
    .min(6, 'Password must be at least 6 characters')
    .optional(),
});

export type ProfileValues = yup.InferType<typeof profileSchema>;
