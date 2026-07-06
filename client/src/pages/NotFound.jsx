import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent">404</h1>
      <h2 className="text-3xl font-bold text-white mt-4 mb-6">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button size="lg">Go Home</Button>
      </Link>
    </div>
  );
};
