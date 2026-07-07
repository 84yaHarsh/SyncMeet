import React from 'react';
import { X, MicOff, VideoOff, Mic, Camera } from 'lucide-react';
import { Avatar, Button } from '../ui';

export const ParticipantList = React.memo(({ participants, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="w-full sm:w-80 h-full bg-dark-900 border-l border-dark-700 flex flex-col shadow-2xl z-30 animate-fade-in absolute right-0 top-0 bottom-0 sm:relative">
      <div className="flex items-center justify-between p-4 border-b border-dark-800 bg-dark-800/50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Participants
          <span className="bg-dark-700 text-xs px-2 py-0.5 rounded-full">{participants.length}</span>
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-gray-400 hover:text-white" aria-label="Close participants panel">
          <X size={18} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        <div className="flex flex-col gap-1" role="list" aria-label="Meeting participants">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 hover:bg-dark-800/50 rounded-xl transition-colors animate-fade-in" role="listitem">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar 
                  src={p.picture} 
                  initials={p.name} 
                  size="md"
                  className={!p.isAudioMuted ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-900" : ""}
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-gray-200 truncate">
                    {p.name} {p.isLocal && '(You)'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {p.isLocal ? 'Meeting host' : 'Participant'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 ml-2">
                {p.isAudioMuted ? <MicOff size={16} className="text-accent" /> : <Mic size={16} />}
                {p.isVideoOff ? <VideoOff size={16} className="text-accent" /> : <Camera size={16} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ParticipantList.displayName = 'ParticipantList';
