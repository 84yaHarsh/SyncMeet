import { useState, useRef, useCallback, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import axios from 'axios';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

// Fallback used only if the backend ICE-servers endpoint can't be reached
// (e.g. offline dev work). Production connectivity should rely on the
// server-provided config so TURN credentials never ship in the client bundle.
const FALLBACK_ICE_SERVERS = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
];

export const usePeers = (localStream) => {
  const { socket, isConnected } = useSocket();
  const { token } = useAuth();
  // Map of peerId -> SimplePeer instance
  const peersRef = useRef(new Map());
  // State for React to render (peerId -> stream)
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const iceServersRef = useRef(FALLBACK_ICE_SERVERS);
  const [iceServersReady, setIceServersReady] = useState(false);

  // Fetch ICE server config (STUN + TURN) from the backend once per session.
  useEffect(() => {
    let cancelled = false;

    const fetchIceServers = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/api/meetings/ice-servers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && res.data?.data?.iceServers?.length) {
          iceServersRef.current = res.data.data.iceServers;
        }
      } catch (err) {
        console.warn('Falling back to default STUN servers:', err.message);
      } finally {
        if (!cancelled) setIceServersReady(true);
      }
    };

    fetchIceServers();
    return () => {
      cancelled = true;
    };
  }, [token]);

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

  const createPeer = useCallback(
    (targetId, initiator) => {
      if (!socket || !isConnected) return undefined;

      // Don't recreate if it already exists
      if (peersRef.current.has(targetId)) return peersRef.current.get(targetId);

      const peer = new SimplePeer({
        initiator,
        trickle: true,
        stream: localStream || undefined,
        config: { iceServers: iceServersRef.current },
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
    },
    [socket, isConnected, localStream, removePeer]
  );

  const handleSignal = useCallback(
    (fromId, signalData) => {
      let peer = peersRef.current.get(fromId);

      if (!peer) {
        // If we receive signaling data and don't have a peer yet, we are the
        // answering side — create it as a non-initiator.
        peer = createPeer(fromId, false);
      }

      if (peer) {
        peer.signal(signalData);
      }
    },
    [createPeer]
  );

  const destroyAllPeers = useCallback(() => {
    peersRef.current.forEach((peer) => peer.destroy());
    peersRef.current.clear();
    setRemoteStreams(new Map());
  }, []);

  // Uses simple-peer's own public replaceTrack API instead of reaching into
  // the private `_pc` (RTCPeerConnection) property, which is undocumented
  // and can break across simple-peer versions.
  const replaceTrack = useCallback((oldTrack, newTrack, stream) => {
    peersRef.current.forEach((peer) => {
      if (peer.destroyed) return;
      try {
        peer.replaceTrack(oldTrack, newTrack, stream);
      } catch (err) {
        console.error('Failed to replace track on peer:', err);
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
    replaceTrack,
    iceServersReady,
  };
};
