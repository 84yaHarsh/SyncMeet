import React from 'react';
import { Mic, MicOff, Video as CameraIcon, VideoOff, MonitorUp, MonitorOff, MessageSquare, Users, UserPlus, PhoneOff } from 'lucide-react';
import { Button, Tooltip, Badge } from '../ui';

export const MeetingControls = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeave,
  onOpenInvite,
  activePanel, // 'chat' | 'participants' | null
  onTogglePanel
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex justify-center z-20 pointer-events-none">
      <div className="glass-panel px-4 sm:px-6 py-3 rounded-2xl flex items-center justify-center gap-2 sm:gap-4 border-dark-600/50 bg-dark-900/90 shadow-2xl pointer-events-auto overflow-x-auto max-w-full">
        
        <Tooltip content={isAudioEnabled ? "Turn off microphone" : "Turn on microphone"}>
          <Button 
            variant={isAudioEnabled ? "secondary" : "danger"}
            size="icon"
            className="rounded-xl w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
            onClick={onToggleAudio}
          >
            {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </Button>
        </Tooltip>

        <Tooltip content={isVideoEnabled ? "Turn off camera" : "Turn on camera"}>
          <Button 
            variant={isVideoEnabled ? "secondary" : "danger"}
            size="icon"
            className="rounded-xl w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
            onClick={onToggleVideo}
          >
            {isVideoEnabled ? <CameraIcon size={20} /> : <VideoOff size={20} />}
          </Button>
        </Tooltip>

        <div className="w-px h-8 bg-dark-700 mx-1 sm:mx-2 flex-shrink-0"></div>

        <Tooltip content={isScreenSharing ? "Stop presenting" : "Present now"}>
          <Button 
            variant={isScreenSharing ? "primary" : "secondary"}
            size="icon"
            className="rounded-xl w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 hidden sm:flex"
            onClick={onToggleScreenShare}
          >
            {isScreenSharing ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
          </Button>
        </Tooltip>

        <div className="w-px h-8 bg-dark-700 mx-1 sm:mx-2 flex-shrink-0 hidden sm:block"></div>

        <Tooltip content="Chat">
          <div className="relative">
            <Button 
              variant={activePanel === 'chat' ? "primary" : "secondary"}
              size="icon"
              className={`rounded-xl w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ${activePanel === 'chat' ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : ''}`}
              onClick={() => onTogglePanel('chat')}
            >
              <MessageSquare size={20} />
            </Button>
          </div>
        </Tooltip>

        <Tooltip content="People">
          <Button 
            variant={activePanel === 'participants' ? "primary" : "secondary"}
            size="icon"
            className={`rounded-xl w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ${activePanel === 'participants' ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : ''}`}
            onClick={() => onTogglePanel('participants')}
          >
            <Users size={20} />
          </Button>
        </Tooltip>

        <Tooltip content="Meeting details">
          <Button 
            variant="secondary"
            size="icon"
            className="rounded-xl w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
            onClick={onOpenInvite}
          >
            <UserPlus size={20} />
          </Button>
        </Tooltip>

        <div className="w-px h-8 bg-dark-700 mx-1 sm:mx-2 flex-shrink-0"></div>
        
        <Tooltip content="Leave call">
          <Button 
            variant="danger" 
            className="px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-xl flex-shrink-0 gap-2"
            onClick={onLeave}
          >
            <PhoneOff size={18} className="hidden sm:block" />
            Leave
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};
