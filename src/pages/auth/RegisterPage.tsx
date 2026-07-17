import { ErrorMessage, Formik } from 'formik';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterValues } from '../../../validations';
import { useAuth } from '../../auth/AuthContext';
import {
  FormError,
  PasswordField,
  TextField,
} from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { getErrorMessage } from '../../utils/errors';
import { AuthPageShell } from './components/AuthPageShell';

const registerInitialValues: RegisterValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'CUSTOMER',
};

export function RegisterPage() {
  const { register, status } = useAuth();
  const navigate = useNavigate();

  if (status === 'authenticated') return <Navigate to="/products" replace />;

  return (
    <Formik<RegisterValues>
      initialValues={registerInitialValues}
      validationSchema={registerSchema}
      onSubmit={async (values, { setStatus, setSubmitting }) => {
        setStatus(undefined);
        try {
          const next = registerSchema.cast(values);
          await register(next);
          navigate(next.role === 'VENDOR' ? '/vendor' : '/products', {
            replace: true,
          });
        } catch (err) {
          setStatus(getErrorMessage(err, 'Could not create your account'));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, setFieldValue, status: formStatus, values }) => (
        <AuthPageShell
          title="Create account"
          description={
            <>
              Choose customer checkout or vendor onboarding. Admin accounts are
              invite-only.
            </>
          }
          footer={
            <>
              Already registered? <Link to="/login">Sign in</Link>
            </>
          }
        >
          <FormError>{formStatus}</FormError>
          <div className="two-col">
            <TextField
              name="firstName"
              label="First name"
              autoComplete="given-name"
            />
            <TextField
              name="lastName"
              label="Last name"
              autoComplete="family-name"
            />
          </div>
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
          />
          <PasswordField
            name="password"
            label="Password"
            autoComplete="new-password"
          />
          <div className="grid gap-2">
            <div
              className="segmented squircle"
              role="group"
              aria-label="Account type"
            >
              <button
                type="button"
                style={{ '--rad': '14px' } as React.CSSProperties}
                className={cn(
                  'squircle',
                  values.role === 'CUSTOMER' && 'active',
                )}
                onClick={() => setFieldValue('role', 'CUSTOMER')}
              >
                Customer
              </button>
              <button
                type="button"
                style={{ '--rad': '14px' } as React.CSSProperties}
                className={cn(
                  'squircle',
                  values.role === 'VENDOR' && 'active',
                )}
                onClick={() => setFieldValue('role', 'VENDOR')}
              >
                Vendor
              </button>
            </div>
            <ErrorMessage
              name="role"
              component="p"
              className="m-0 text-sm font-semibold text-red-700"
            />
          </div>
          <Button type="submit" size="lg" isLoading={isSubmitting}>
            Create account
          </Button>
        </AuthPageShell>
      )}
    </Formik>
  );
}
