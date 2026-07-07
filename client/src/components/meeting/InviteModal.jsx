import React, { useState, useCallback } from 'react';
import { Copy, Check, Users } from 'lucide-react';
import { Modal, Button, Input } from '../ui';

export const InviteModal = React.memo(({ isOpen, onClose, meetingId }) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/meeting/${meetingId}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }, [link]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add others">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 text-gray-300">
          <div className="bg-primary-500/10 p-3 rounded-full text-primary-400">
            <Users size={24} />
          </div>
          <p className="text-sm">
            Share this meeting link with others you want in the meeting.
            This meeting supports up to 4 participants.
          </p>
        </div>

        <div>
          <label htmlFor="invite-link" className="block text-sm font-medium text-gray-400 mb-2">Meeting Link</label>
          <div className="flex gap-2">
            <Input 
              id="invite-link"
              readOnly 
              value={link}
              className="flex-1 font-mono text-sm"
              onFocus={(e) => e.target.select()}
              aria-label="Meeting invite link"
            />
            <Button variant={copied ? "success" : "primary"} onClick={handleCopy} className="min-w-[100px]" aria-label="Copy meeting link">
              {copied ? (
                <>
                  <Check size={18} className="mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={18} className="mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
});

InviteModal.displayName = 'InviteModal';
