import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'glass' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold ' +
  'transition-all duration-300 ease-smooth will-change-transform ' +
  'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand bg-200 text-primary-foreground shadow-glow hover:bg-right hover:shadow-glow',
  glass: 'glass text-foreground shadow-glass hover:shadow-soft',
  outline: 'border border-border bg-card/40 text-foreground hover:bg-card/70 hover:border-primary/40',
  ghost: 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
};

type ButtonVariantOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/** Returns the composed class string — use on `<button>` or a `<Link>`. */
export function buttonVariants({ variant = 'primary', size = 'md' }: ButtonVariantOptions = {}) {
  return cn(base, variants[variant], sizes[size]);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariantOptions;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
