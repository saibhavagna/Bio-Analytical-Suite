'use client';

import React, { useState } from 'react';
import { useDocking } from '@/context/DockingContext';

export const RunLogsView: React.FC = () => {
  const { logs, dockingRun, project, receptor, bindingSite } = useDocking();
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR'>('ALL');

  const filteredLogs = logs.filter((l) => {
    if (filterLevel === 'ALL') return true;
    return l.level === filterLevel;
  });

  return (
    <div className="flex-1 h-full bg-[#0B0F14] p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 text-[#CBD5E0]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1C2532]">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#EDF2F7]">
            CALCULATION ENGINE RUN LOG ARCHIVE
          </h2>
          <p className="text-xs text-[#7395B8] mt-0.5">
            AutoDock Vina execution trace, GPU kernel offloads, coordinate assignments, and scoring events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                filterLevel === lvl
                  ? 'bg-[#1C2C3F] text-[#48CAE4] border border-[#2B4B6F]'
                  : 'text-[#8C9BAE] hover:text-[#EDF2F7]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-[#080B0F] border border-[#1C2532] rounded p-4 font-mono text-xs flex flex-col gap-2 shadow-inner">
        {/* Environment banner */}
        <div className="text-[#63758A] pb-2 border-b border-[#161F2B] text-[11px] leading-relaxed">
          <div>$ vina --receptor {receptor.filename} --ligand active_library.sdf --center_x {bindingSite.center.x} --center_y {bindingSite.center.y} --center_z {bindingSite.center.z} --size_x {bindingSite.size.x} --size_y {bindingSite.size.y} --size_z {bindingSite.size.z} --exhaustiveness 32 --cpu 16</div>
          <div className="text-[#4FAE7B] mt-1">✓ CUDA device initialized: NVIDIA GeForce RTX 4090 (Compute capability 8.9)</div>
          <div className="text-[#7395B8]">✓ Grid box: {bindingSite.volume.toLocaleString()} Å³ volume, 0.375 Å spacing, 8.4M grid points evaluated</div>
        </div>

        {/* Log Entries */}
        <div className="flex flex-col gap-1.5 pt-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 py-0.5">
              <span className="text-[#63758A] select-none">[{log.timestamp}]</span>
              <span
                className={`font-semibold px-1 rounded text-[10px] select-none ${
                  log.level === 'SUCCESS'
                    ? 'bg-[#142E21] text-[#4FAE7B]'
                    : log.level === 'WARN'
                    ? 'bg-[#2E2814] text-[#E9C46A]'
                    : log.level === 'ERROR'
                    ? 'bg-[#331C1A] text-[#E76F51]'
                    : 'bg-[#162332] text-[#48CAE4]'
                }`}
              >
                {log.level}
              </span>
              <span className="text-[#CBD5E0] leading-snug flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
