import React from 'react';
import { Outlet } from 'react-router-dom';

export const MeetingLayout = () => {
  return (
    <div className="h-screen w-full bg-dark-900 overflow-hidden flex flex-col text-white selection:bg-primary-500/30">
      <Outlet />
    </div>
  );
};
