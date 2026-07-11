import * as yup from 'yup';

export const newsletterSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Enter a valid email address')
    .required('Email is required'),
});

export type NewsletterValues = yup.InferType<typeof newsletterSchema>;
