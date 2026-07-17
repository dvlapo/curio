import type { ReactNode } from 'react';
import { Form } from 'formik';
import { Link } from 'react-router-dom';

interface AuthPageShellProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthPageShell({
  title,
  description,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <main className="auth-page">
      <Form
        className="auth-card squircle"
        style={{ '--rad': '30px' } as React.CSSProperties}
        noValidate
      >
        <Link to="/" className="app-wordmark">
          curio<span>.</span>
        </Link>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
        <p>{footer}</p>
      </Form>
    </main>
  );
}
