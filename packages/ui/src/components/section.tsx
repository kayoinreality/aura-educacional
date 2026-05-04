import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

type SectionProps = HTMLAttributes<HTMLElement> & {
  variant?: 'ivory' | 'paper' | 'navy' | 'gold';
  spacing?: 'sm' | 'md' | 'lg';
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = 'ivory', spacing = 'lg', ...props }, ref) => {
    const bg =
      variant === 'paper'
        ? 'bg-paper'
        : variant === 'navy'
          ? 'bg-navy-700 text-paper'
          : variant === 'gold'
            ? 'bg-gold-100 text-navy-900'
            : 'bg-ivory';
    const pad =
      spacing === 'sm' ? 'py-12 md:py-16' : spacing === 'md' ? 'py-16 md:py-24' : 'py-20 md:py-32';
    return <section ref={ref} className={cn(bg, pad, className)} {...props} />;
  },
);
Section.displayName = 'Section';
