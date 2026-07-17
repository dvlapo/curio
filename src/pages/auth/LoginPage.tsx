import { Formik } from 'formik';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginValues } from '../../../validations';
import { useAuth } from '../../auth/AuthContext';
import {
  FormError,
  PasswordField,
  TextField,
} from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import { getErrorMessage } from '../../utils/errors';
import { AuthPageShell } from './components/AuthPageShell';

const loginInitialValues: LoginValues = {
  email: '',
  password: '',
};

function fromPath(state: unknown) {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: { pathname?: string } }).from;
    return from?.pathname ?? '/products';
  }
  return '/products';
}

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (status === 'authenticated') return <Navigate to="/products" replace />;

  return (
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
        <AuthPageShell
          title="Sign in"
          description="Continue to checkout, orders, or your dashboard."
          footer={
            <>
              New here? <Link to="/register">Create an account</Link>
            </>
          }
        >
          <FormError>{formStatus}</FormError>
          <TextField
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
          />
          <PasswordField
            name="password"
            label="Password"
            autoComplete="current-password"
          />
          <Button type="submit" size="lg" isLoading={isSubmitting}>
            Sign in
          </Button>
        </AuthPageShell>
      )}
    </Formik>
  );
}
