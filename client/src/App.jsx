import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MediaProvider } from './context/MediaContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Layouts
import { AppLayout } from './layouts/AppLayout';
import { MeetingLayout } from './layouts/MeetingLayout';

// Pages — lazily loaded so the initial bundle only ships what the landing
// route needs; meeting/dashboard code (incl. simple-peer) loads on demand.
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const MeetingRoom = lazy(() => import('./pages/MeetingRoom').then(m => ({ default: m.MeetingRoom })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-900">
    <LoadingSpinner text="Loading..." />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <MediaProvider>
              <BrowserRouter>
                <Suspense fallback={<RouteFallback />}>
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
                            <ErrorBoundary>
                              <MeetingRoom />
                            </ErrorBoundary>
                          </ProtectedRoute>
                        }
                      />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </MediaProvider>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
