import * as React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'squircle min-h-12 w-full border border-ink/15 bg-surface px-4 text-base text-ink outline-0 transition-[border-color,box-shadow] duration-150 placeholder:text-muted/70 focus:border-ink disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  />
));

Input.displayName = 'Input';
