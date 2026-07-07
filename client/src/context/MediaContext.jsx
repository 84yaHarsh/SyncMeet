import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMediaStream } from '../hooks/useMediaStream';

export const MediaContext = createContext(null);

export const MediaProvider = ({ children }) => {
  const media = useMediaStream();
  const [devices, setDevices] = useState({ cameras: [], microphones: [], speakers: [] });

  const enumerateDevices = async () => {
    try {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const cameras = [];
      const microphones = [];
      const speakers = [];

      deviceInfos.forEach(device => {
        if (device.kind === 'videoinput') cameras.push(device);
        else if (device.kind === 'audioinput') microphones.push(device);
        else if (device.kind === 'audiooutput') speakers.push(device);
      });

      setDevices({ cameras, microphones, speakers });
    } catch (err) {
      console.error('Error enumerating devices', err);
    }
  };

  useEffect(() => {
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
    };
  }, []);

  // Update devices after initial stream to get labels (which are hidden before permission)
  useEffect(() => {
    if (media.stream) {
      enumerateDevices();
    }
  }, [media.stream]);

  // Re-enumerate after a device switch too, in case switching revealed new labels
  useEffect(() => {
    if (media.activeVideoTrack || media.activeAudioTrack) {
      enumerateDevices();
    }
  }, [media.activeVideoTrack, media.activeAudioTrack]);

  return (
    <MediaContext.Provider value={{ ...media, devices, enumerateDevices }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) throw new Error('useMedia must be used within MediaProvider');
  return context;
};
