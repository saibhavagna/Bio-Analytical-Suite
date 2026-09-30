'use client';

import React from 'react';
import { useDocking } from '@/context/DockingContext';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useDocking();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-10 right-6 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded bg-[#162232] border border-[#2B4B6F] text-[#EDF2F7] text-xs font-mono shadow-xl animate-in fade-in slide-in-from-bottom-2">
      <span className="w-2 h-2 rounded-full bg-[#48CAE4] animate-ping" />
      <span>{toastMessage}</span>
      <button
        onClick={clearToast}
        className="text-[#7395B8] hover:text-[#EDF2F7] ml-2 text-xs"
      >
        ✕
      </button>
    </div>
  );
};
