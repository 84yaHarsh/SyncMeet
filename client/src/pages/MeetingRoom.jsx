import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Mic, MicOff, VideoOff, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useMedia } from '../context/MediaContext';
import { usePeers } from '../hooks/usePeers';
import { Button, Tooltip, useToast } from '../components/ui';
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
    activeVideoTrack,
    activeAudioTrack,
    initStream, 
    toggleAudio, 
    toggleVideo,
    stopStream,
    startScreenShare,
    stopScreenShare,
    screenStream
  } = useMedia();

  // IMPORTANT: usePeers must always be initialized with the camera stream
  // (localStream), never the screen-share stream. Peers are created once
  // when a participant joins; toggling screen share must NOT change the
  // stream identity passed here, or it recreates createPeer/removePeer with
  // a new identity, which in turn forces the socket-events effect below to
  // tear down and re-run (leave-room + rejoin-room) on every screen-share
  // toggle. Screen sharing is handled entirely via replaceTrack() further
  // down, which swaps the outgoing video track in place without touching
  // room membership or peer connections.
  const { remoteStreams, createPeer, removePeer, destroyAllPeers, replaceTrack } = usePeers(
    localStream
  );

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
      // We are the one who just joined: we already have the full roster, so
      // we initiate the WebRTC offer to each existing participant. They will
      // respond as the answering side when they receive our signal. This
      // one-directional convention avoids both sides racing to initiate.
      users.forEach((existingUser) => createPeer(existingUser.id, true));
    };

    const onUserJoined = ({ user }) => {
      setParticipants(prev => [...prev, user]);
      addToast({ title: 'User joined', message: `${user.name} joined the meeting`, type: 'info' });
      // Do NOT initiate here — the newcomer initiates to us (see onRoomJoined
      // above). We just wait for their offer, which usePeers handles via the
      // incoming 'signal' event.
    };

    const onUserLeft = ({ userId }) => {
      removePeer(userId);
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
  }, [step, socket, isConnected, meetingId, addToast, stopStream, destroyAllPeers, createPeer, removePeer]);

  // Handle local media state changes and notify others
  useEffect(() => {
    if (step === 'active' && socket && isConnected) {
      socket.emit('media-state-change', {
        roomId: meetingId,
        state: { isAudioMuted: !isAudioEnabled, isVideoOff: !isVideoEnabled, isScreenSharing }
      });
    }
  }, [isAudioEnabled, isVideoEnabled, isScreenSharing, step, socket, isConnected, meetingId]);

  // Handle track replacement when screen sharing toggles OR the active
  // camera device is switched mid-call. Peers are created (in
  // onRoomJoined/handleSignal) using the camera stream as their base
  // stream, so `localStream` is the anchor identity simple-peer uses
  // internally to look up the right RTCRtpSender — it must stay the same
  // object reference across calls, which useMediaStream guarantees by
  // mutating tracks in place rather than creating a new MediaStream.
  const prevVideoTrackRef = useRef(null);
  const prevAudioTrackRef = useRef(null);

  useEffect(() => {
    if (step !== 'active' || !localStream) return;

    const nextVideoTrack = isScreenSharing && screenStream
      ? screenStream.getVideoTracks()[0]
      : activeVideoTrack || localStream.getVideoTracks()[0];

    const oldVideoTrack = prevVideoTrackRef.current || localStream.getVideoTracks()[0];

    if (nextVideoTrack && oldVideoTrack && nextVideoTrack !== oldVideoTrack) {
      replaceTrack(oldVideoTrack, nextVideoTrack, localStream);
      prevVideoTrackRef.current = nextVideoTrack;
    }
  }, [isScreenSharing, screenStream, activeVideoTrack, localStream, step, replaceTrack]);

  // Microphone switching: screen share never touches audio, so this is a
  // simpler, independent swap.
  useEffect(() => {
    if (step !== 'active' || !localStream || !activeAudioTrack) return;

    const oldAudioTrack = prevAudioTrackRef.current || localStream.getAudioTracks()[0];

    if (oldAudioTrack && activeAudioTrack !== oldAudioTrack) {
      replaceTrack(oldAudioTrack, activeAudioTrack, localStream);
      prevAudioTrackRef.current = activeAudioTrack;
    }
  }, [activeAudioTrack, localStream, step, replaceTrack]);

  const handleJoin = useCallback(() => {
    setStep('active');
  }, []);

  const handleLeave = useCallback(() => {
    setStep('left');
    stopStream();
    if (isScreenSharing) stopScreenShare();
    destroyAllPeers();
    if (socket) {
      socket.emit('leave-room', { roomId: meetingId });
    }
  }, [stopStream, isScreenSharing, stopScreenShare, destroyAllPeers, socket, meetingId]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [isScreenSharing, stopScreenShare, startScreenShare]);

  const togglePanel = useCallback((panel) => {
    setActivePanel(prev => (prev === panel ? null : panel));
  }, []);

  // Must be called unconditionally, before any early returns below, or React
  // will see a different number of hooks on different renders (e.g. when
  // `step` transitions from 'prejoin' to 'active').
  const allParticipants = useMemo(
    () => [
      {
        id: socket?.id || 'local',
        name: user?.name ?? 'You',
        picture: user?.picture,
        isLocal: true,
        isAudioMuted: !isAudioEnabled,
        isVideoOff: !isVideoEnabled,
      },
      ...participants
    ],
    [socket?.id, user?.name, user?.picture, isAudioEnabled, isVideoEnabled, participants]
  );

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
        <p className="text-gray-400 mb-8">Have a great day, {user?.name?.split(' ')[0] ?? 'there'}!</p>
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
            ) : mediaError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mb-4">
                  <Camera size={32} className="text-gray-500" />
                </div>
                <p className="text-gray-400 text-center">{`Camera/Mic error: ${mediaError}`}</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center" role="status" aria-live="polite">
                <div className="skeleton-shimmer absolute inset-0" />
                <div className="relative w-20 h-20 rounded-full bg-dark-700/80 backdrop-blur flex items-center justify-center mb-4 animate-pulse-glow">
                  <Camera size={32} className="text-gray-400" />
                </div>
                <p className="relative text-gray-400 text-center px-4">Starting camera…</p>
              </div>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <Tooltip content={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
                <Button
                  variant={isAudioEnabled ? "secondary" : "danger"}
                  size="icon"
                  className="rounded-full w-12 h-12 shadow-lg border border-white/10 hover:scale-105 active:scale-95 transition-transform"
                  onClick={toggleAudio}
                  aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                  aria-pressed={!isAudioEnabled}
                >
                  {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </Button>
              </Tooltip>
              <Tooltip content={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
                <Button
                  variant={isVideoEnabled ? "secondary" : "danger"}
                  size="icon"
                  className="rounded-full w-12 h-12 shadow-lg border border-white/10 hover:scale-105 active:scale-95 transition-transform"
                  onClick={toggleVideo}
                  aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                  aria-pressed={!isVideoEnabled}
                >
                  {isVideoEnabled ? <Camera size={20} /> : <VideoOff size={20} />}
                </Button>
              </Tooltip>
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
