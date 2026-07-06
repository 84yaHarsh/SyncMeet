import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MediaProvider } from './context/MediaContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layouts
import { AppLayout } from './layouts/AppLayout';
import { MeetingLayout } from './layouts/MeetingLayout';

// Pages
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { MeetingRoom } from './pages/MeetingRoom';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SocketProvider>
          <MediaProvider>
            <BrowserRouter>
              <Routes>
            {/* Public/App Layout Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Landing />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Meeting Layout Routes */}
            <Route element={<MeetingLayout />}>
              <Route 
                path="/meeting/:meetingId" 
                element={
                  <ProtectedRoute>
                    <MeetingRoom />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MediaProvider>
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
