import { cn } from '../lib/cn';

type LogoProps = {
  variant?: 'full' | 'mark';
  className?: string;
  monochrome?: 'navy' | 'gold' | 'ivory';
};

/**
 * Logo Aura Educacional.
 * - "mark": apenas o A com livro (compacto)
 * - "full": A com livro + tipografia "AURA / EDUCACIONAL"
 *
 * Inspirado no logo institucional: triângulo (A) navy + linhas curvas gold (livro aberto).
 */
export function Logo({ variant = 'full', className, monochrome }: LogoProps) {
  const navy = monochrome === 'gold' ? '#C9A961' : monochrome === 'ivory' ? '#FAF8F3' : '#0F1E47';
  const gold = monochrome === 'navy' ? '#0F1E47' : monochrome === 'ivory' ? '#FAF8F3' : '#C9A961';

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className={cn('h-9 w-9', className)}
        aria-label="Aura Educacional"
        role="img"
      >
        <path d="M32 6 L54 50 H10 Z" stroke={navy} strokeWidth={4} strokeLinejoin="round" fill="none" />
        <path d="M22 38 Q32 33 42 38" stroke={navy} strokeWidth={3} strokeLinecap="round" fill="none" />
        <path d="M14 50 Q24 44 32 50" stroke={gold} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <path d="M32 50 Q40 44 50 50" stroke={gold} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="h-10 w-10"
        aria-hidden="true"
      >
        <path d="M32 6 L54 50 H10 Z" stroke={navy} strokeWidth={4} strokeLinejoin="round" fill="none" />
        <path d="M22 38 Q32 33 42 38" stroke={navy} strokeWidth={3} strokeLinecap="round" fill="none" />
        <path d="M14 50 Q24 44 32 50" stroke={gold} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <path d="M32 50 Q40 44 50 50" stroke={gold} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      </svg>
      <div className="leading-none">
        <span
          className="block font-display text-xl font-medium tracking-[0.18em]"
          style={{ color: navy }}
        >
          AURA
        </span>
        <span
          className="mt-1 block text-[0.6rem] font-medium tracking-[0.32em]"
          style={{ color: gold }}
        >
          EDUCACIONAL
        </span>
      </div>
    </div>
  );
}
