import { useState, useCallback, useRef, useEffect } from 'react';

export const useMediaStream = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const initStream = useCallback(async (videoConstraints = true, audioConstraints = true) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: audioConstraints ? { echoCancellation: true, noiseSuppression: true } : false
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setError(null);
      return mediaStream;
    } catch (err) {
      console.error('Media error:', err);
      setError(err.name);
      return null;
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    screenStreamRef.current = null;
    setStream(null);
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      // Listen for browser's native stop sharing button
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      return screenStream;
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        console.error('Screen share error:', err);
      }
      return null;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    stream,
    error,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    initStream,
    toggleAudio,
    toggleVideo,
    stopStream,
    startScreenShare,
    stopScreenShare,
    screenStream: screenStreamRef.current
  };
};
