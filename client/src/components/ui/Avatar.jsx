import React from 'react';
import { cn } from '../../utils/helpers';

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-24 w-24 text-2xl',
};

export const Avatar = ({
  src,
  alt,
  initials,
  size = 'md',
  className,
  status, // 'online' | 'offline' | 'busy'
}) => {
  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden bg-dark-700 border border-dark-600',
          sizes[size],
          className
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="font-semibold text-gray-200 uppercase tracking-wider">
            {initials?.slice(0, 2) || '?'}
          </span>
        )}
      </div>
      
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-dark-900',
            size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-2.5 w-2.5' : 'h-3 w-3',
            status === 'online' ? 'bg-success' : 
            status === 'busy' ? 'bg-accent' : 'bg-gray-500'
          )}
        />
      )}
    </div>
  );
};
