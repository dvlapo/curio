import * as yup from 'yup';

export const optionalText = yup.string().trim().default('');

export const optionalUrl = yup
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .url('Enter a valid URL')
  .optional();

export function requiredText(label: string, minimum = 1) {
  return yup
    .string()
    .trim()
    .min(minimum, `${label} must be at least ${minimum} characters`)
    .required(`${label} is required`);
}

export function requiredNumber(label: string, minimum = 0) {
  return yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? undefined : value,
    )
    .typeError(`${label} must be a number`)
    .min(minimum, `${label} must be at least ${minimum}`)
    .required(`${label} is required`);
}

export function optionalNumber(label: string, minimum = 0) {
  return yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? undefined : value,
    )
    .typeError(`${label} must be a number`)
    .min(minimum, `${label} must be at least ${minimum}`)
    .optional();
}

export const commaSeparatedUrls = yup
  .string()
  .trim()
  .test('comma-separated-urls', 'Use valid URLs separated by commas', (value) => {
    if (!value) return true;

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .every((item) => {
        try {
          new URL(item);
          return true;
        } catch {
          return false;
        }
      });
  })
  .default('');
