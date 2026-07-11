import { useState } from 'react';
import { Field, Form, Formik, type FieldProps } from 'formik';
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { newsletterSchema, type NewsletterValues } from '../../validations';

const initialValues: NewsletterValues = {
  email: '',
};

export function Newsletter() {
  const [sent, setSent] = useState(false);

  return (
    <section
      className="newsletter page-section section-reveal"
      aria-labelledby="newsletter-title"
    >
      <div>
        <h2 id="newsletter-title">
          Fresh finds,
          <br />
          without the clutter.
        </h2>
      </div>
      {sent ? (
        <div className="success-message" role="status">
          <CheckIcon aria-hidden="true" />{' '}
          <div>
            <strong>You are on the list.</strong>
            <p>We will only write when there is something worth sharing.</p>
          </div>
        </div>
      ) : (
        <Formik<NewsletterValues>
          initialValues={initialValues}
          validationSchema={newsletterSchema}
          onSubmit={() => setSent(true)}
        >
          <Form noValidate>
            <label htmlFor="newsletter-email">Email address</label>
            <Field name="email">
              {({ field, meta }: FieldProps<string>) => {
                const error = meta.touched && meta.error ? meta.error : '';
                return (
                  <>
                    <div>
                      <Input
                        id="newsletter-email"
                        type="email"
                        placeholder="you@example.com"
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? 'newsletter-email-error' : undefined}
                        {...field}
                      />
                      <Button type="submit" size="icon" aria-label="Join newsletter">
                        <ArrowRightIcon aria-hidden="true" />
                      </Button>
                    </div>
                    {error && (
                      <p
                        id="newsletter-email-error"
                        className="m-0 text-sm font-semibold text-red-700"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}
                  </>
                );
              }}
            </Field>
            <p>No clutter. Unsubscribe whenever you like.</p>
          </Form>
        </Formik>
      )}
    </section>
  );
}
