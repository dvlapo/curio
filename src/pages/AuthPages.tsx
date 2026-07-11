import { ErrorMessage, Form, Formik } from 'formik';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FormError, TextField } from '../components/forms/FormFields';
import { Button } from '../components/ui/button';
import { getErrorMessage } from '../utils/errors';
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from '../../validations';

function fromPath(state: unknown) {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: { pathname?: string } }).from;
    return from?.pathname ?? '/products';
  }
  return '/products';
}

const loginInitialValues: LoginValues = {
  email: '',
  password: '',
};

const registerInitialValues: RegisterValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'CUSTOMER',
};

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (status === 'authenticated') return <Navigate to="/products" replace />;

  return (
    <main className="auth-page">
      <Formik<LoginValues>
        initialValues={loginInitialValues}
        validationSchema={loginSchema}
        onSubmit={async (values, { setStatus, setSubmitting }) => {
          setStatus(undefined);
          try {
            const next = loginSchema.cast(values);
            await login(next.email, next.password);
            navigate(fromPath(location.state), { replace: true });
          } catch (err) {
            setStatus(getErrorMessage(err, 'Could not sign you in'));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status: formStatus }) => (
          <Form className="auth-card" noValidate>
            <Link to="/" className="app-wordmark">
              curio<span>.</span>
            </Link>
            <h1>Sign in</h1>
            <p>Continue to checkout, orders, or your dashboard.</p>
            <FormError>{formStatus}</FormError>
            <TextField name="email" label="Email" type="email" autoComplete="email" />
            <TextField
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
            />
            <Button type="submit" size="lg" disabled={isSubmitting}>
              Sign in
            </Button>
            <p>
              New here? <Link to="/register">Create an account</Link>
            </p>
          </Form>
        )}
      </Formik>
    </main>
  );
}

export function RegisterPage() {
  const { register, status } = useAuth();
  const navigate = useNavigate();

  if (status === 'authenticated') return <Navigate to="/products" replace />;

  return (
    <main className="auth-page">
      <Formik<RegisterValues>
        initialValues={registerInitialValues}
        validationSchema={registerSchema}
        onSubmit={async (values, { setStatus, setSubmitting }) => {
          setStatus(undefined);
          try {
            const next = registerSchema.cast(values);
            await register(next);
            navigate(next.role === 'VENDOR' ? '/vendor' : '/products', { replace: true });
          } catch (err) {
            setStatus(getErrorMessage(err, 'Could not create your account'));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, setFieldValue, status: formStatus, values }) => (
          <Form className="auth-card" noValidate>
            <Link to="/" className="app-wordmark">
              curio<span>.</span>
            </Link>
            <h1>Create account</h1>
            <p>Choose customer checkout or vendor onboarding. Admin accounts are invite-only.</p>
            <FormError>{formStatus}</FormError>
            <div className="two-col">
              <TextField name="firstName" label="First name" autoComplete="given-name" />
              <TextField name="lastName" label="Last name" autoComplete="family-name" />
            </div>
            <TextField name="email" label="Email" type="email" autoComplete="email" />
            <TextField
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
            />
            <div className="grid gap-2">
              <div className="segmented" role="group" aria-label="Account type">
                <button
                  type="button"
                  className={values.role === 'CUSTOMER' ? 'active' : ''}
                  onClick={() => setFieldValue('role', 'CUSTOMER')}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className={values.role === 'VENDOR' ? 'active' : ''}
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
            <Button type="submit" size="lg" disabled={isSubmitting}>
              Create account
            </Button>
            <p>
              Already registered? <Link to="/login">Sign in</Link>
            </p>
          </Form>
        )}
      </Formik>
    </main>
  );
}
