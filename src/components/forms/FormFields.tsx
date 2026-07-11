import { useId, type ReactNode } from 'react';
import { useField } from 'formik';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';

type FieldShellProps = {
  name: string;
  label: string;
  description?: string;
  className?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

function FieldShell({ name, label, description, className, children }: FieldShellProps) {
  const id = useId();
  const [, meta] = useField(name);
  const error = meta.touched && meta.error ? meta.error : '';
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {description && (
        <p id={descriptionId} className="m-0 text-sm leading-[1.5] text-muted">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="m-0 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = Omit<React.ComponentProps<typeof Input>, 'name'> & {
  name: string;
  label: string;
  description?: string;
  wrapperClassName?: string;
};

export function TextField({
  name,
  label,
  description,
  wrapperClassName,
  ...props
}: TextFieldProps) {
  const [field] = useField(name);

  return (
    <FieldShell
      name={name}
      label={label}
      description={description}
      className={wrapperClassName}
    >
      {({ id, describedBy, invalid }) => (
        <Input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          {...field}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type TextareaFieldProps = Omit<React.ComponentProps<typeof Textarea>, 'name'> & {
  name: string;
  label: string;
  description?: string;
  wrapperClassName?: string;
};

export function TextareaField({
  name,
  label,
  description,
  wrapperClassName,
  ...props
}: TextareaFieldProps) {
  const [field] = useField(name);

  return (
    <FieldShell
      name={name}
      label={label}
      description={description}
      className={wrapperClassName}
    >
      {({ id, describedBy, invalid }) => (
        <Textarea
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          {...field}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type SelectFieldProps = Omit<React.ComponentProps<typeof Select>, 'name'> & {
  name: string;
  label: string;
  description?: string;
  wrapperClassName?: string;
};

export function SelectField({
  name,
  label,
  description,
  wrapperClassName,
  children,
  ...props
}: SelectFieldProps) {
  const [field] = useField(name);

  return (
    <FieldShell
      name={name}
      label={label}
      description={description}
      className={wrapperClassName}
    >
      {({ id, describedBy, invalid }) => (
        <Select
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          {...field}
          {...props}
        >
          {children}
        </Select>
      )}
    </FieldShell>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;

  return <div className="form-error">{children}</div>;
}
