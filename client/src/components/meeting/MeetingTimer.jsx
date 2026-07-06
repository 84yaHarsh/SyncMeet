import React from 'react';
import { useMeetingTimer } from '../../hooks/useMeetingTimer';

export const MeetingTimer = () => {
  const { formatted } = useMeetingTimer();

  return (
    <div className="bg-dark-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-lg">
      <span className="font-mono text-lg font-semibold tracking-wider text-white">
        {formatted}
      </span>
    </div>
  );
};
