import React, { useMemo } from 'react';
import { VideoTile } from './VideoTile';

// Calculate grid layout based on participant count (up to 4)
const getGridLayout = (count) => {
  if (count <= 1) return 'grid-cols-1 grid-rows-1';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2 grid-rows-2 sm:grid-rows-1';
  if (count === 3) return 'grid-cols-1 sm:grid-cols-2 grid-rows-3 sm:grid-rows-2';
  return 'grid-cols-2 grid-rows-2'; // count 4
};

export const VideoGrid = ({ participants, localStream, remoteStreams }) => {
  const gridClass = useMemo(() => getGridLayout(participants.length), [participants.length]);

  return (
    <div className={`w-full h-full max-h-full p-4 grid gap-4 ${gridClass} auto-rows-fr`}>
      {participants.map((p) => {
        const isLocal = p.isLocal;
        // Use local stream for local user, otherwise look up in remoteStreams Map
        const stream = isLocal ? localStream : remoteStreams.get(p.id);
        
        // For 3 participants on sm+ screens, make the first one span 2 columns
        const isFeatured = participants.length === 3 && participants.indexOf(p) === 0;

        return (
          <div 
            key={p.id} 
            className={`w-full h-full min-h-0 ${isFeatured ? 'sm:col-span-2' : ''}`}
          >
            <VideoTile
              stream={stream}
              name={p.name}
              picture={p.picture}
              isLocal={isLocal}
              isMuted={p.isAudioMuted}
              isVideoOff={p.isVideoOff}
            />
          </div>
        );
      })}
    </div>
  );
};
