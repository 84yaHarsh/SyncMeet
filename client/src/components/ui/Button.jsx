import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const variants = {
  primary: 'bg-gradient-to-br from-primary-500 to-primary-700 text-white hover:from-primary-400 hover:to-primary-600 shadow-lg shadow-primary-500/30',
  secondary: 'bg-dark-700 text-white hover:bg-dark-600 border border-dark-600',
  ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-dark-800',
  danger: 'bg-gradient-to-br from-accent to-rose-600 text-white hover:from-rose-400 hover:to-rose-600 shadow-lg shadow-accent/30',
  success: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg font-medium',
  icon: 'p-2',
};

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
