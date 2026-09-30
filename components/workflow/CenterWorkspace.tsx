'use client';

import React from 'react';
import { MolecularViewer3D } from '../viewer/MolecularViewer3D';
import { ViewerToolbar } from '../viewer/ViewerToolbar';
import { ComputationalInterpretationCard } from '../viewer/ComputationalInterpretationCard';

export const CenterWorkspace: React.FC = () => {
  return (
    <main className="flex-1 h-full flex flex-col min-w-0 bg-[#0A0E13] overflow-hidden select-none">
      {/* 3D Molecular Viewer Canvas */}
      <div className="flex-1 min-h-[360px] relative">
        <MolecularViewer3D />
      </div>

      {/* Viewer Controls Toolbar */}
      <ViewerToolbar />

      {/* Computational Interpretation Card at bottom of center */}
      <div className="p-2.5 bg-[#090D12] border-t border-[#1C2532]">
        <ComputationalInterpretationCard />
      </div>
    </main>
  );
};
