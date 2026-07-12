import { useId, useState, type ReactNode } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useField, useFormikContext } from 'formik';
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
  children: (props: {
    id: string;
    describedBy?: string;
    invalid: boolean;
  }) => ReactNode;
};

function FieldShell({
  name,
  label,
  description,
  className,
  children,
}: FieldShellProps) {
  const id = useId();
  const [, meta] = useField(name);
  const error = meta.touched && meta.error ? meta.error : '';
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

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
        <p
          id={errorId}
          className="m-0 text-sm font-semibold text-red-700"
          role="alert"
        >
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
  className,
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
          className={cn(
            invalid && 'field-invalid-shake border-red-500/55',
            className,
          )}
          {...field}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type PasswordFieldProps = Omit<
  React.ComponentProps<typeof Input>,
  'name' | 'type'
> & {
  name: string;
  label: string;
  description?: string;
  wrapperClassName?: string;
};

export function PasswordField({
  name,
  label,
  description,
  wrapperClassName,
  className,
  disabled,
  ...props
}: PasswordFieldProps) {
  const [field] = useField(name);
  const [showPassword, setShowPassword] = useState(false);
  const Icon = showPassword ? EyeSlashIcon : EyeIcon;

  return (
    <FieldShell
      name={name}
      label={label}
      description={description}
      className={wrapperClassName}
    >
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <Input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={cn(
              'pr-12',
              invalid && 'field-invalid-shake border-red-500/55',
              className,
            )}
            disabled={disabled}
            type={showPassword ? 'text' : 'password'}
            {...field}
            {...props}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-transparent text-muted transition-colors duration-150 hover:text-ink disabled:pointer-events-none disabled:opacity-50"
            disabled={disabled}
            onClick={() => setShowPassword((current) => !current)}
          >
            <Icon className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </FieldShell>
  );
}

type TextareaFieldProps = Omit<
  React.ComponentProps<typeof Textarea>,
  'name'
> & {
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
  className,
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
          className={cn(
            invalid && 'field-invalid-shake border-red-500/55',
            className,
          )}
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
  className,
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
          className={cn(
            invalid && 'field-invalid-shake border-red-500/55',
            className,
          )}
          {...field}
          {...props}
        >
          {children}
        </Select>
      )}
    </FieldShell>
  );
}

type FileFieldProps = Omit<
  React.ComponentProps<typeof Input>,
  'name' | 'type' | 'value' | 'onChange'
> & {
  name: string;
  label: string;
  description?: string;
  wrapperClassName?: string;
};

export function FileField({
  name,
  label,
  description,
  wrapperClassName,
  className,
  ...props
}: FileFieldProps) {
  const [field, meta] = useField<File[]>(name);
  const { setFieldTouched, setFieldValue } = useFormikContext();
  const files = Array.isArray(field.value) ? field.value : [];

  return (
    <FieldShell
      name={name}
      label={label}
      description={description}
      className={wrapperClassName}
    >
      {({ id, describedBy, invalid }) => (
        <div className="grid gap-2">
          <Input
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            className={cn(
              invalid && 'field-invalid-shake border-red-500/55',
              className,
            )}
            type="file"
            onBlur={() => setFieldTouched(name, true)}
            onChange={(event) =>
              setFieldValue(name, Array.from(event.currentTarget.files ?? []))
            }
            {...props}
          />
          {files.length > 0 && !meta.error && (
            <p className="m-0 text-sm leading-[1.5] text-muted">
              {files.map((file) => file.name).join(', ')}
            </p>
          )}
        </div>
      )}
    </FieldShell>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;

  return <div className="form-error">{children}</div>;
}
