import React, { useEffect, useRef } from 'react';
import { MicOff, VideoOff } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { Avatar } from '../ui';

export const VideoTile = React.memo(({
  stream,
  name,
  picture,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  className
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div 
      className={cn(
        'relative bg-dark-800 rounded-2xl overflow-hidden border border-dark-700/50 shadow-xl w-full h-full group',
        className
      )}
    >
      {isVideoOff || !stream ? (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800">
          <Avatar 
            src={picture} 
            initials={name} 
            size="2xl" 
            className="ring-4 ring-dark-700 shadow-2xl"
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent echo
          className={cn(
            "w-full h-full object-cover",
            isLocal && !stream?.getVideoTracks()[0]?.label?.includes('screen') ? "scale-x-[-1]" : "" // Mirror local camera (but not screen share)
          )}
        />
      )}

      {/* Overlays */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between transition-opacity duration-300">
        <div className="flex items-center gap-2">
          <div className="bg-dark-900/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
            <span className="text-sm font-medium text-white truncate max-w-[120px]">
              {name} {isLocal && '(You)'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {isMuted && (
            <div className="bg-accent/80 backdrop-blur-md p-1.5 rounded-full flex items-center justify-center text-white border border-accent/20 animate-fade-in">
              <MicOff size={16} />
            </div>
          )}
          {isVideoOff && (
            <div className="bg-dark-900/80 backdrop-blur-md p-1.5 rounded-full flex items-center justify-center text-white border border-white/10 animate-fade-in">
              <VideoOff size={16} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

VideoTile.displayName = 'VideoTile';
