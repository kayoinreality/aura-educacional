import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold-500 focus-visible:ring-offset-ivory disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-navy-700 text-paper hover:bg-navy-600 active:bg-navy-800 shadow-soft hover:shadow-card',
        gold:
          'btn-shimmer bg-gold-500 text-navy-900 hover:bg-gold-400 active:bg-gold-600 shadow-soft hover:shadow-card font-semibold',
        outline:
          'border border-navy-700 text-navy-700 hover:bg-navy-50 active:bg-navy-100',
        'outline-gold':
          'border border-gold-500 text-navy-700 hover:bg-gold-50 active:bg-gold-100',
        ghost: 'text-navy-700 hover:bg-navy-50 active:bg-navy-100',
        link: 'text-navy-700 underline-offset-4 hover:underline hover:text-navy-500 p-0 h-auto',
        danger: 'bg-danger text-paper hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-7 text-base',
        xl: 'h-14 px-8 text-base',
        icon: 'h-10 w-10',
      },
      block: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      block: false,
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
