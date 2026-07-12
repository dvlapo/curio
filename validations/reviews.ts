import * as yup from 'yup';
import { optionalText, requiredNumber } from './common';

export const reviewSchema = yup.object({
  rating: requiredNumber('Rating', 1)
    .integer('Rating must be a whole number')
    .max(5, 'Rating cannot be higher than 5'),
  comment: optionalText.max(1000, 'Comment must be 1000 characters or fewer'),
});

export type ReviewValues = {
  rating: string;
  comment: string;
};
