import React from 'react';
import { useMedia } from '../../context/MediaContext';

export const DeviceSelector = () => {
  const { devices, enumerateDevices } = useMedia();

  // For a full implementation, you would store selected device IDs in state
  // and pass them to initStream() when changed.
  // This is a simplified version just showing the dropdowns.

  if (!devices.cameras.length && !devices.microphones.length) {
    return null; // Don't show if devices haven't been enumerated or permission denied
  }

  return (
    <div className="w-full max-w-sm mt-4 flex flex-col gap-3">
      {devices.cameras.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Camera</label>
          <select 
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary-500"
            defaultValue={devices.cameras[0]?.deviceId}
          >
            {devices.cameras.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${devices.cameras.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {devices.microphones.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Microphone</label>
          <select 
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary-500"
            defaultValue={devices.microphones[0]?.deviceId}
          >
            {devices.microphones.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${devices.microphones.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
