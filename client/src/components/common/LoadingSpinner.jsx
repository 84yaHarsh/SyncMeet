import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4">
      <Loader2 size={40} className="text-primary-500 animate-spin" />
      {text && <p className="text-gray-400 text-sm font-medium">{text}</p>}
    </div>
  );
};
