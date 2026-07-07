import { useState, useCallback, useRef, useEffect } from 'react';

export const useMediaStream = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState(null);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState(null);
  // Bumped whenever the active video/audio track is swapped in place (camera
  // or mic switch) so consumers (e.g. WebRTC track replacement) can react
  // without needing a brand-new MediaStream object identity.
  const [activeVideoTrack, setActiveVideoTrack] = useState(null);
  const [activeAudioTrack, setActiveAudioTrack] = useState(null);
  const [isSwitchingDevice, setIsSwitchingDevice] = useState(false);

  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const initStream = useCallback(async (videoDeviceId = null, audioDeviceId = null) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(videoDeviceId ? { deviceId: { exact: videoDeviceId } } : {}),
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          ...(audioDeviceId ? { deviceId: { exact: audioDeviceId } } : {}),
        },
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setActiveVideoTrack(mediaStream.getVideoTracks()[0] || null);
      setActiveAudioTrack(mediaStream.getAudioTracks()[0] || null);
      setError(null);

      const videoTrack = mediaStream.getVideoTracks()[0];
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (videoTrack) setSelectedVideoDeviceId(videoTrack.getSettings().deviceId || null);
      if (audioTrack) setSelectedAudioDeviceId(audioTrack.getSettings().deviceId || null);

      return mediaStream;
    } catch (err) {
      console.error('Media error:', err);
      setError(err.name);
      return null;
    }
  }, []);

  // Swaps the active camera in place (same MediaStream object identity is
  // preserved) so any WebRTC senders bound to that stream stay valid — only
  // the track itself is replaced.
  const switchCamera = useCallback(async (deviceId) => {
    if (!streamRef.current || !deviceId || deviceId === selectedVideoDeviceId) return;
    setIsSwitchingDevice(true);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      const newTrack = newStream.getVideoTracks()[0];
      const oldTrack = streamRef.current.getVideoTracks()[0];

      if (oldTrack) {
        streamRef.current.removeTrack(oldTrack);
        oldTrack.stop();
      }
      streamRef.current.addTrack(newTrack);
      newTrack.enabled = isVideoEnabled;

      setActiveVideoTrack(newTrack);
      setSelectedVideoDeviceId(deviceId);
    } catch (err) {
      console.error('Failed to switch camera:', err);
      setError(err.name);
    } finally {
      setIsSwitchingDevice(false);
    }
  }, [selectedVideoDeviceId, isVideoEnabled]);

  const switchMicrophone = useCallback(async (deviceId) => {
    if (!streamRef.current || !deviceId || deviceId === selectedAudioDeviceId) return;
    setIsSwitchingDevice(true);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true },
      });
      const newTrack = newStream.getAudioTracks()[0];
      const oldTrack = streamRef.current.getAudioTracks()[0];

      if (oldTrack) {
        streamRef.current.removeTrack(oldTrack);
        oldTrack.stop();
      }
      streamRef.current.addTrack(newTrack);
      newTrack.enabled = isAudioEnabled;

      setActiveAudioTrack(newTrack);
      setSelectedAudioDeviceId(deviceId);
    } catch (err) {
      console.error('Failed to switch microphone:', err);
      setError(err.name);
    } finally {
      setIsSwitchingDevice(false);
    }
  }, [selectedAudioDeviceId, isAudioEnabled]);

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
    setActiveVideoTrack(null);
    setActiveAudioTrack(null);
  }, []);

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);
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
  }, [stopScreenShare]);

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
    isSwitchingDevice,
    selectedVideoDeviceId,
    selectedAudioDeviceId,
    activeVideoTrack,
    activeAudioTrack,
    initStream,
    switchCamera,
    switchMicrophone,
    toggleAudio,
    toggleVideo,
    stopStream,
    startScreenShare,
    stopScreenShare,
    screenStream: screenStreamRef.current
  };
};
