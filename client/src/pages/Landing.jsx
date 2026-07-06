import React from 'react';
import { Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Video, Shield, Users, Zap, MessageSquare, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui';
import axios from 'axios';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export const Landing = () => {
  const { isAuthenticated, login } = useAuth();
  const { addToast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        token: credentialResponse.credential,
      });
      
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        addToast({
          title: 'Welcome back!',
          message: 'Successfully logged in.',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Login failed', error);
      addToast({
        title: 'Authentication Failed',
        message: error.response?.data?.message || 'Could not verify Google login.',
        type: 'error'
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Abstract Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-primary-600/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-accent/20 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-primary-400 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            New: High-fidelity audio is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Meet without <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent">
              boundaries.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            Experience crystal-clear video calls with an interface that gets out of your way. 
            No downloads. No friction. Just instant connection.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="glass-panel p-2 rounded-2xl transform hover:scale-105 transition-transform duration-300">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  addToast({ title: 'Error', message: 'Google Login Failed', type: 'error' });
                }}
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4">
              Free forever for small teams.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-dark-900 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need. Nothing you don't.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              SyncMeet is designed for performance and simplicity, offering a premium experience without the clutter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap />}
              title="Instant Join"
              description="No app downloads required. Join directly from any modern web browser in seconds."
            />
            <FeatureCard 
              icon={<Shield />}
              title="Secure by Default"
              description="Direct peer-to-peer WebRTC connections ensure your media stays private."
            />
            <FeatureCard 
              icon={<Users />}
              title="Small Teams Focus"
              description="Optimized for up to 4 participants for the highest quality mesh connection."
            />
            <FeatureCard 
              icon={<Globe />}
              title="Global Infrastructure"
              description="Google's STUN network ensures reliable connections anywhere in the world."
            />
            <FeatureCard 
              icon={<Video />}
              title="Crystal Clear"
              description="Adaptive bitrate streaming ensures the best possible quality for your connection."
            />
            <FeatureCard 
              icon={<MessageSquare />}
              title="Integrated Chat"
              description="Share links, notes, and messages without leaving the meeting context."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-panel p-6 hover:bg-dark-800/80 transition-colors duration-300 group">
    <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:text-primary-300">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);
