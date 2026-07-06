import React from 'react';
import { Outlet } from 'react-router-dom';
import { Video } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent flex items-center justify-center">
              <Video className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              SyncMeet
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <img 
                    src={user?.picture} 
                    alt={user?.name} 
                    className="w-8 h-8 rounded-full border border-dark-600"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span className="text-sm font-medium text-gray-200">{user?.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Log out
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-dark-900 py-8 border-t border-dark-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
      <p>&copy; {new Date().getFullYear()} SyncMeet. Designed for modern teams.</p>
    </div>
  </footer>
);

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-white selection:bg-primary-500/30">
      <Navbar />
      <main className="flex-1 pt-16 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
