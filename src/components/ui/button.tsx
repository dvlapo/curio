import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold outline-0 transition-[background-color,border-color,color,opacity,transform] duration-150 ease-out-expo active:scale-[.97] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-ink text-paper hover:opacity-90',
        secondary: 'bg-acid text-[#111311] hover:brightness-95',
        outline: 'border border-ink/15 bg-transparent text-ink hover:border-ink/45',
        ghost: 'bg-transparent text-ink hover:bg-surface',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'min-h-11 px-5 py-2.5',
        sm: 'min-h-10 px-4 py-2',
        lg: 'min-h-13 px-6 py-3',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
