import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Mic, MicOff, VideoOff, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useMedia } from '../context/MediaContext';
import { usePeers } from '../hooks/usePeers';
import { Button, useToast } from '../components/ui';
import { VideoGrid } from '../components/meeting/VideoGrid';
import { MeetingControls } from '../components/meeting/MeetingControls';
import { ChatPanel } from '../components/meeting/ChatPanel';
import { ParticipantList } from '../components/meeting/ParticipantList';
import { MeetingTimer } from '../components/meeting/MeetingTimer';
import { InviteModal } from '../components/meeting/InviteModal';
import { DeviceSelector } from '../components/meeting/DeviceSelector';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { addToast } = useToast();
  
  const { 
    stream: localStream, 
    error: mediaError, 
    isAudioEnabled, 
    isVideoEnabled,
    isScreenSharing,
    initStream, 
    toggleAudio, 
    toggleVideo,
    stopStream,
    startScreenShare,
    stopScreenShare,
    screenStream
  } = useMedia();

  const { remoteStreams, destroyAllPeers, replaceTrack } = usePeers(isScreenSharing ? screenStream : localStream);

  const [step, setStep] = useState('prejoin'); // 'prejoin', 'active', 'left', 'error'
  const [participants, setParticipants] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  // UI State
  const [activePanel, setActivePanel] = useState(null); // 'chat' | 'participants' | null
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // 1. Validate Meeting ID on load
  useEffect(() => {
    const validate = async () => {
      try {
        const token = localStorage.getItem('syncmeet_token');
        const res = await axios.get(`${API_URL}/api/meetings/${meetingId}/validate`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          initStream();
        }
      } catch (err) {
        setStep('error');
        setErrorMessage(err.response?.data?.message || 'Failed to validate meeting');
      }
    };
    validate();
  }, [meetingId, initStream]);

  // 2. Handle Socket Events when Active
  useEffect(() => {
    if (step !== 'active' || !socket || !isConnected) return;

    const onRoomJoined = ({ users }) => {
      setParticipants(users);
    };

    const onUserJoined = ({ user }) => {
      setParticipants(prev => [...prev, user]);
      addToast({ title: 'User joined', message: `${user.name} joined the meeting`, type: 'info' });
    };

    const onUserLeft = ({ userId }) => {
      setParticipants(prev => {
        const user = prev.find(u => u.id === userId);
        if (user) {
          addToast({ title: 'User left', message: `${user.name} left the meeting`, type: 'info' });
        }
        return prev.filter(u => u.id !== userId);
      });
    };

    const onUserMediaChanged = ({ userId, state }) => {
      setParticipants(prev => prev.map(p => 
        p.id === userId ? { ...p, ...state } : p
      ));
    };

    const onRoomError = ({ message }) => {
      setStep('error');
      setErrorMessage(message);
      stopStream();
      destroyAllPeers();
    };

    socket.on('room-joined', onRoomJoined);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('user-media-changed', onUserMediaChanged);
    socket.on('room-error', onRoomError);

    socket.emit('join-room', { roomId: meetingId });

    return () => {
      socket.off('room-joined', onRoomJoined);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('user-media-changed', onUserMediaChanged);
      socket.off('room-error', onRoomError);
      socket.emit('leave-room', { roomId: meetingId });
    };
  }, [step, socket, isConnected, meetingId, addToast, stopStream, destroyAllPeers]);

  // Handle local media state changes and notify others
  useEffect(() => {
    if (step === 'active' && socket && isConnected) {
      socket.emit('media-state-change', {
        roomId: meetingId,
        state: { isAudioMuted: !isAudioEnabled, isVideoOff: !isVideoEnabled, isScreenSharing }
      });
    }
  }, [isAudioEnabled, isVideoEnabled, isScreenSharing, step, socket, isConnected, meetingId]);

  // Handle track replacement when screen sharing toggles
  useEffect(() => {
    if (step === 'active') {
      if (isScreenSharing && screenStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        if (localStream) {
            const oldTrack = localStream.getVideoTracks()[0];
            replaceTrack(oldTrack, videoTrack);
        }
      } else if (!isScreenSharing && localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (screenStream) {
            const oldTrack = screenStream.getVideoTracks()[0];
            replaceTrack(oldTrack, videoTrack);
        } else {
             // If we just stopped screen share, replace with camera
             // In a more complex setup, we'd keep track of the specific sender, but simple-peer replaces tracks natively if we pass the new stream to the constructor, which we don't.
             // We'd need renegotiation for a robust screen share, but replaceTrack works if the sender is found.
             // Since we use 'usePeers(isScreenSharing ? screenStream : localStream)', the initial stream might change.
             // For simplicity, we assume replaceTrack handles it if we pass the right old/new tracks.
        }
      }
    }
  }, [isScreenSharing, screenStream, localStream, step, replaceTrack]);

  const handleJoin = () => {
    setStep('active');
  };

  const handleLeave = () => {
    setStep('left');
    stopStream();
    if (isScreenSharing) stopScreenShare();
    destroyAllPeers();
    if (socket) {
      socket.emit('leave-room', { roomId: meetingId });
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  if (step === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle size={64} className="text-accent mb-6" />
        <h1 className="text-3xl font-bold mb-4">Meeting Error</h1>
        <p className="text-gray-400 mb-8 max-w-md">{errorMessage}</p>
        <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  if (step === 'left') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
        <h1 className="text-4xl font-bold mb-4">You left the meeting</h1>
        <p className="text-gray-400 mb-8">Have a great day, {user?.name.split(' ')[0]}!</p>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => {
            initStream();
            setStep('prejoin');
          }}>
            Rejoin
          </Button>
          <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
        </div>
      </div>
    );
  }

  if (step === 'prejoin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-8 w-full items-center justify-center">
          <div className="w-full max-w-2xl aspect-video bg-dark-800 rounded-3xl overflow-hidden relative shadow-2xl border border-dark-700">
            {localStream ? (
              <video 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]"
                ref={(el) => { if (el) el.srcObject = localStream; }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mb-4">
                  <Camera size={32} className="text-gray-500" />
                </div>
                <p className="text-gray-400 text-center px-4">
                  {mediaError ? `Camera/Mic Error: ${mediaError}` : 'Starting camera...'}
                </p>
              </div>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <Button 
                variant={isAudioEnabled ? "secondary" : "danger"}
                size="icon"
                className="rounded-full w-12 h-12 shadow-lg border border-white/10"
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </Button>
              <Button 
                variant={isVideoEnabled ? "secondary" : "danger"}
                size="icon"
                className="rounded-full w-12 h-12 shadow-lg border border-white/10"
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Camera size={20} /> : <VideoOff size={20} />}
              </Button>
            </div>
          </div>

          <div className="w-full max-w-sm flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-2">Ready to join?</h2>
            <p className="text-gray-400 mb-6">No one else is here yet</p>
            <DeviceSelector />
            <div className="mt-8 w-full flex flex-col gap-3">
              <Button size="lg" className="w-full py-6 text-lg rounded-2xl" onClick={handleJoin}>
                Join Meeting
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Meeting
  const allParticipants = [
    {
      id: socket?.id || 'local',
      name: user.name,
      picture: user.picture,
      isLocal: true,
      isAudioMuted: !isAudioEnabled,
      isVideoOff: !isVideoEnabled,
    },
    ...participants
  ];

  return (
    <div className="flex-1 flex w-full h-full relative overflow-hidden bg-black">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
            <MeetingTimer />
          </div>
          <div className="pointer-events-auto bg-dark-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg text-gray-300 font-medium">
            {meetingId}
          </div>
        </div>

        {/* Main Video Area */}
        <div className={`flex-1 w-full h-full p-2 pb-24 transition-all duration-300 ${activePanel ? 'sm:pr-4' : ''}`}>
          <VideoGrid 
            participants={allParticipants} 
            localStream={isScreenSharing && screenStream ? screenStream : localStream}
            remoteStreams={remoteStreams}
          />
        </div>

        <MeetingControls 
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onLeave={handleLeave}
          onOpenInvite={() => setIsInviteOpen(true)}
          activePanel={activePanel}
          onTogglePanel={togglePanel}
        />
      </div>

      {/* Side Panels */}
      {activePanel === 'chat' && (
        <ChatPanel 
          roomId={meetingId} 
          isOpen={true} 
          onClose={() => setActivePanel(null)} 
        />
      )}
      {activePanel === 'participants' && (
        <ParticipantList 
          participants={allParticipants} 
          isOpen={true} 
          onClose={() => setActivePanel(null)} 
        />
      )}

      {/* Modals */}
      <InviteModal 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
        meetingId={meetingId}
      />
    </div>
  );
};
