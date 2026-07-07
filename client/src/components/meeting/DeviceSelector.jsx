import React from 'react';
import { Loader2 } from 'lucide-react';
import { useMedia } from '../../context/MediaContext';

export const DeviceSelector = () => {
  const {
    devices,
    selectedVideoDeviceId,
    selectedAudioDeviceId,
    switchCamera,
    switchMicrophone,
    isSwitchingDevice,
  } = useMedia();

  if (!devices.cameras.length && !devices.microphones.length) {
    return null; // Don't show if devices haven't been enumerated or permission denied
  }

  return (
    <div className="w-full max-w-sm mt-4 flex flex-col gap-3 relative">
      {isSwitchingDevice && (
        <div className="absolute -top-6 right-0 flex items-center gap-1.5 text-xs text-primary-400">
          <Loader2 size={12} className="animate-spin" />
          Switching…
        </div>
      )}

      {devices.cameras.length > 0 && (
        <div>
          <label htmlFor="camera-select" className="block text-xs font-medium text-gray-400 mb-1">
            Camera
          </label>
          <select
            id="camera-select"
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-shadow disabled:opacity-60"
            value={selectedVideoDeviceId || ''}
            disabled={isSwitchingDevice}
            onChange={(e) => switchCamera(e.target.value)}
          >
            {devices.cameras.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {devices.microphones.length > 0 && (
        <div>
          <label htmlFor="mic-select" className="block text-xs font-medium text-gray-400 mb-1">
            Microphone
          </label>
          <select
            id="mic-select"
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-shadow disabled:opacity-60"
            value={selectedAudioDeviceId || ''}
            disabled={isSwitchingDevice}
            onChange={(e) => switchMicrophone(e.target.value)}
          >
            {devices.microphones.map((device, idx) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
