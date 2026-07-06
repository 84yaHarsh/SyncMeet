import React from 'react';
import { ServerCrash } from 'lucide-react';
import { Button } from '../components/ui';

export const ServerError = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="glass-panel p-8 max-w-md w-full border-accent/20">
        <ServerCrash size={48} className="text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">500 - Server Error</h2>
        <p className="text-gray-400 mb-6 text-sm">
          We're experiencing some technical difficulties on our end. Please try again later.
        </p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="w-full"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};
