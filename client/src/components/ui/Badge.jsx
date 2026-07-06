import React from 'react';
import { cn } from '../../utils/helpers';

const variants = {
  default: 'bg-dark-700 text-gray-200 border-dark-600',
  primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
  success: 'bg-success/10 text-success border-success/20',
  danger: 'bg-accent/10 text-accent border-accent/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

export const Badge = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
