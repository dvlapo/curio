import * as React from 'react';
import { cn } from '../../lib/utils';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<'select'>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'select-control min-h-12 w-full appearance-none rounded-[8px] border border-ink/15 bg-surface py-2 pl-4 pr-11 text-base text-ink outline-0 transition-[border-color,box-shadow] duration-150 focus:border-ink disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = 'Select';
