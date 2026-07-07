import React, { useEffect, useRef } from 'react';
import { MicOff, VideoOff, Loader2 } from 'lucide-react';
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
  // Distinguishes "peer hasn't sent a stream yet" (still connecting) from
  // "peer explicitly turned their camera off" — same fallback avatar, but
  // worth a different affordance so users aren't left guessing.
  const isConnecting = !isLocal && !stream && !isVideoOff;

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.srcObject = stream || null;
    }
    // Clear srcObject on cleanup (stream change or unmount) so the video
    // element doesn't hold a lingering reference to a stopped MediaStream.
    // Uses the snapshotted `videoEl` (not videoRef.current) since the ref
    // may point elsewhere by the time this cleanup runs.
    return () => {
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div
      role="group"
      aria-label={`${name}${isLocal ? ' (you)' : ''}${isMuted ? ', muted' : ''}${isVideoOff ? ', camera off' : ''}`}
      className={cn(
        'relative bg-dark-800 rounded-2xl overflow-hidden border border-dark-700/50 shadow-xl w-full h-full group',
        'transition-all duration-300 hover:border-primary-500/40 hover:shadow-primary-500/10',
        className
      )}
    >
      {isVideoOff || !stream ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
          <Avatar
            src={picture}
            initials={name}
            size="2xl"
            className={cn(
              'ring-4 ring-dark-700 shadow-2xl transition-shadow',
              isConnecting && 'animate-pulse-glow'
            )}
          />
          {isConnecting && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400" role="status">
              <Loader2 size={12} className="animate-spin" />
              Connecting…
            </div>
          )}
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent echo
          className={cn(
            "w-full h-full object-cover animate-fade-in",
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
            <div className="bg-accent/80 backdrop-blur-md p-1.5 rounded-full flex items-center justify-center text-white border border-accent/20 animate-scale-in" aria-hidden="true">
              <MicOff size={16} />
            </div>
          )}
          {isVideoOff && (
            <div className="bg-dark-900/80 backdrop-blur-md p-1.5 rounded-full flex items-center justify-center text-white border border-white/10 animate-scale-in" aria-hidden="true">
              <VideoOff size={16} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

VideoTile.displayName = 'VideoTile';
