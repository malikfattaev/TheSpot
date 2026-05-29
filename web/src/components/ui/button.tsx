import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium ' +
  'transition-all duration-300 ease-smooth ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border border-foreground/20 text-foreground hover:bg-foreground/5',
  ghost: 'text-muted-foreground hover:text-foreground',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-7 text-base',
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
