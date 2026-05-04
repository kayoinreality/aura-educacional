import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'narrow' | 'default' | 'wide';
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'default', ...props }, ref) => {
    const max = size === 'narrow' ? 'max-w-3xl' : size === 'wide' ? 'max-w-7xl' : 'max-w-6xl';
    return (
      <div
        ref={ref}
        className={cn('mx-auto w-full px-6 md:px-8 lg:px-10', max, className)}
        {...props}
      />
    );
  },
);
Container.displayName = 'Container';
