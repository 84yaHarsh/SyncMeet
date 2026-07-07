import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Keyboard, Copy, Check, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, useToast } from '../components/ui';
import { generateMeetingId } from '../utils/meetingId';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [joinId, setJoinId] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // Live-ticking clock (was previously frozen at first render).
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const handleNewMeeting = useCallback(() => {
    const meetingId = generateMeetingId();
    const link = `${window.location.origin}/meeting/${meetingId}`;
    setGeneratedLink(link);
  }, []);

  const handleJoinMeeting = useCallback((e) => {
    e.preventDefault();
    if (!joinId.trim()) return;

    // Extract ID if it's a full URL
    let finalId = joinId.trim();
    if (finalId.includes('/meeting/')) {
      finalId = finalId.split('/meeting/')[1];
    }

    navigate(`/meeting/${finalId}`);
  }, [joinId, navigate]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({ title: 'Link copied', message: 'Meeting link copied to clipboard', type: 'success' });
    } catch (err) {
      addToast({ title: 'Copy failed', message: 'Could not copy link', type: 'error' });
    }
  }, [generatedLink, addToast]);

  const joinCreatedMeeting = useCallback(() => {
    if (!generatedLink) return;
    const finalId = generatedLink.split('/meeting/')[1];
    navigate(`/meeting/${finalId}`);
  }, [generatedLink, navigate]);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-12 relative">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 gradient-aura pointer-events-none -z-10" aria-hidden="true" />

      {/* Left Column: Actions */}
      <div className="w-full md:w-1/2 flex flex-col gap-8 animate-slide-up">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] ?? 'User'}</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Create a new meeting or join an existing one.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button size="lg" onClick={handleNewMeeting} className="w-full sm:w-auto gap-2">
            <Video size={20} aria-hidden="true" />
            New Meeting
          </Button>

          <form onSubmit={handleJoinMeeting} className="w-full sm:w-auto flex items-center gap-2">
            <label htmlFor="join-code" className="sr-only">Meeting code or link</label>
            <Input
              id="join-code"
              icon={Keyboard}
              placeholder="Enter a code or link"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              className="w-full sm:w-64"
            />
            <Button
              type="submit"
              variant="ghost"
              disabled={!joinId.trim()}
              className="px-6 text-primary-400 hover:text-primary-300 disabled:text-gray-500 font-semibold"
            >
              Join
            </Button>
          </form>
        </div>

        {generatedLink && (
          <div className="glass-panel p-6 mt-4 animate-scale-in border-primary-500/30">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Your Meeting's Ready</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-dark-900 rounded-lg p-3 text-sm text-gray-300 truncate border border-dark-600">
                {generatedLink}
              </div>
              <Button variant="secondary" size="icon" onClick={copyLink} aria-label="Copy meeting link">
                {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Share this link with others you want in the meeting. Maximum 4 participants allowed.
            </p>
            <Button onClick={joinCreatedMeeting} className="w-full">
              Join Now
            </Button>
          </div>
        )}
      </div>

      {/* Right Column: Illustration/Time */}
      <div className="w-full md:w-1/2 flex justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="relative w-full max-w-md aspect-square rounded-full glass-panel border border-dark-700/50 flex flex-col items-center justify-center p-8 text-center overflow-hidden animate-float">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/10 to-accent/10"></div>

          <Clock size={48} className="text-primary-400 mb-6" aria-hidden="true" />
          <h2 className="text-6xl font-bold tracking-tight mb-2" aria-live="off">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h2>
          <p className="text-xl text-gray-400">
            {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};
