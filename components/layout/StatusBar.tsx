'use client';

import React from 'react';
import { useDocking } from '@/context/DockingContext';

export const StatusBar: React.FC = () => {
  const { logs, bindingSite, dockingRun, ui, setUI } = useDocking();
  const latestLog = logs[0] || {
    timestamp: '15:08:42',
    level: 'INFO',
    message: 'System ready.',
  };

  return (
    <footer className="h-[28px] min-h-[28px] max-h-[28px] bg-[#090C10] border-t border-[#1C2532] px-3 flex items-center justify-between text-[10px] font-mono text-[#7395B8] select-none">
      {/* Left: Latest Activity Log / Click to view logs */}
      <button
        id="btn-status-log"
        onClick={() => setUI((prev) => ({ ...prev, activeModule: 'logs' }))}
        className="flex items-center gap-2 hover:text-[#EDF2F7] transition-colors truncate max-w-[55%]"
        title="Click to view full calculation log archive"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            latestLog.level === 'SUCCESS'
              ? 'bg-[#4FAE7B]'
              : latestLog.level === 'WARN'
              ? 'bg-[#E9C46A]'
              : latestLog.level === 'ERROR'
              ? 'bg-[#E76F51]'
              : 'bg-[#48CAE4]'
          }`}
        />
        <span className="text-[#63758A]">[{latestLog.timestamp}]</span>
        <span className="truncate text-[#CBD5E0]">{latestLog.message}</span>
      </button>

      {/* Right: Hardware & Telemetry Readouts */}
      <div className="flex items-center gap-4 text-[#63758A]">
        {/* Grid dimensions */}
        <div className="hidden md:flex items-center gap-1.5">
          <span>GRID:</span>
          <span className="text-[#8C9BAE]">
            [{bindingSite.size.x.toFixed(1)} × {bindingSite.size.y.toFixed(1)} ×{' '}
            {bindingSite.size.z.toFixed(1)}] Å
          </span>
        </div>

        {/* Volume */}
        <div className="hidden lg:flex items-center gap-1.5">
          <span>VOL:</span>
          <span className="text-[#8C9BAE]">{bindingSite.volume.toLocaleString()} Å³</span>
        </div>

        {/* GPU VRAM */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span>VRAM:</span>
          <span className="text-[#48CAE4]">4.8 / 24.0 GB</span>
        </div>

        {/* Host Status */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4FAE7B]" />
          <span className="text-[#8C9BAE]">NODE-04: ONLINE</span>
        </div>
      </div>
    </footer>
  );
};
