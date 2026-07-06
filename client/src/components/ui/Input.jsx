import React from 'react';
import { cn } from '../../utils/helpers';

export const Input = React.forwardRef(({
  className,
  label,
  error,
  icon: Icon,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex w-full rounded-xl border bg-dark-800/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            Icon ? 'pl-10' : '',
            error ? 'border-accent focus:ring-accent/50' : 'border-dark-700',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-accent">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
