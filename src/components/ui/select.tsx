import * as React from 'react';
import { cn } from '../../lib/utils';

export const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'min-h-12 w-full rounded-[8px] border border-ink/15 bg-surface px-4 text-base text-ink outline-0 transition-[border-color,box-shadow] duration-150 focus:border-ink disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = 'Select';
