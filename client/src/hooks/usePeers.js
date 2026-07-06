import { useState, useRef, useCallback, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import { useSocket } from './useSocket';

// Using Google's public STUN servers
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' }
];

export const usePeers = (localStream) => {
  const { socket, isConnected } = useSocket();
  // Map of peerId -> SimplePeer instance
  const peersRef = useRef(new Map());
  // State for React to render (peerId -> stream)
  const [remoteStreams, setRemoteStreams] = useState(new Map());

  const createPeer = useCallback((targetId, initiator) => {
    if (!socket || !isConnected) return;
    
    // Don't recreate if it already exists
    if (peersRef.current.has(targetId)) return;

    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream: localStream || undefined,
      config: { iceServers: ICE_SERVERS }
    });

    peer.on('signal', (signalData) => {
      socket.emit('signal', { to: targetId, signal: signalData });
    });

    peer.on('stream', (remoteStream) => {
      setRemoteStreams((prev) => new Map(prev).set(targetId, remoteStream));
    });

    peer.on('close', () => {
      removePeer(targetId);
    });

    peer.on('error', (err) => {
      console.error(`Peer error with ${targetId}:`, err);
      removePeer(targetId);
    });

    peersRef.current.set(targetId, peer);
    return peer;
  }, [socket, isConnected, localStream]);

  const handleSignal = useCallback((fromId, signalData) => {
    let peer = peersRef.current.get(fromId);
    
    if (!peer) {
      // If we receive an offer and don't have a peer, create one as receiver
      peer = createPeer(fromId, false);
    }
    
    if (peer) {
      peer.signal(signalData);
    }
  }, [createPeer]);

  const removePeer = useCallback((peerId) => {
    const peer = peersRef.current.get(peerId);
    if (peer) {
      peer.destroy();
      peersRef.current.delete(peerId);
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.delete(peerId);
        return next;
      });
    }
  }, []);

  const destroyAllPeers = useCallback(() => {
    peersRef.current.forEach((peer) => peer.destroy());
    peersRef.current.clear();
    setRemoteStreams(new Map());
  }, []);

  const replaceTrack = useCallback((oldTrack, newTrack) => {
    peersRef.current.forEach((peer) => {
      if (peer.connected) {
        try {
          const sender = peer._pc.getSenders().find((s) => s.track === oldTrack);
          if (sender) {
            sender.replaceTrack(newTrack);
          }
        } catch (err) {
          console.error('Failed to replace track on peer:', err);
        }
      }
    });
  }, []);

  // Set up socket signaling listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const onSignal = ({ from, signal }) => {
      handleSignal(from, signal);
    };

    socket.on('signal', onSignal);

    return () => {
      socket.off('signal', onSignal);
    };
  }, [socket, isConnected, handleSignal]);

  return {
    peersRef,
    remoteStreams,
    createPeer,
    removePeer,
    destroyAllPeers,
    replaceTrack
  };
};
