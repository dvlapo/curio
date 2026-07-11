import * as React from 'react';
import { cn } from '../../lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-28 w-full rounded-[8px] border border-ink/15 bg-surface px-4 py-3 text-base text-ink outline-0 transition-[border-color,box-shadow] duration-150 placeholder:text-muted/70 focus:border-ink disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';
