import { useMemo } from 'react';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { profileSchema, type ProfileValues } from '../../../validations';
import { useAuth } from '../../auth/AuthContext';
import {
  FormError,
  PasswordField,
  TextField,
} from '../../components/forms/FormFields';
import { Button } from '../../components/ui/button';
import { getErrorMessage } from '../../utils/errors';
import { PageIntro } from './components/PageIntro';

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const defaults = useMemo<ProfileValues>(
    () => ({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      password: '',
    }),
    [user],
  );

  return (
    <main className="page-shell">
      <PageIntro
        title="Profile"
        body="Keep your account details current. Logging out revokes the active backend session and clears this tab."
      />
      <Formik<ProfileValues>
        enableReinitialize
        initialValues={defaults}
        validationSchema={profileSchema}
        onSubmit={async (values, { setStatus, setSubmitting }) => {
          setStatus(undefined);
          try {
            const next = profileSchema.cast(values);
            await updateProfile({
              firstName: next.firstName,
              lastName: next.lastName,
              ...(next.password ? { password: next.password } : {}),
            });
          } catch (err) {
            setStatus(getErrorMessage(err, 'Could not update profile'));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status: formStatus }) => (
          <Form className="settings-form" noValidate>
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
            <PasswordField
              name="password"
              label="New password"
              placeholder="Leave blank to keep current password"
              autoComplete="new-password"
            />
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Save profile
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              Logout
            </Button>
          </Form>
        )}
      </Formik>
    </main>
  );
}
