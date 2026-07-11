import * as React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-[8px] border border-ink/15 bg-paper p-6', className)}
      {...props}
    />
  );
}
