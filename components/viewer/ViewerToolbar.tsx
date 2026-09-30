'use client';

import React from 'react';
import { useDocking } from '@/context/DockingContext';
import { RepresentationMode, ColorScheme } from '@/types/docking';

export const ViewerToolbar: React.FC = () => {
  const { ui, setUI, bindingSite, updateBindingSite } = useDocking();

  const representations: RepresentationMode[] = ['Cartoon', 'Sticks', 'Surface', 'CPK'];
  const colorSchemes: ColorScheme[] = ['CPK', 'Chain', 'Residue', 'Hydrophobic'];

  const toggleGrid = () => {
    const nextVal = !bindingSite.showGrid;
    updateBindingSite({ showGrid: nextVal });
    setUI((prev) => ({ ...prev, showGridBox: nextVal }));
  };

  return (
    <div className="w-full bg-[#11161D] border-t border-b border-[#1E2633] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
      {/* Left: Representation & Color Options */}
      <div className="flex items-center gap-3">
        {/* Representation selector */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#63758A] mr-1">
            REP:
          </span>
          <div className="flex items-center bg-[#0B0F14] p-0.5 rounded border border-[#1E2633]">
            {representations.map((rep) => (
              <button
                key={rep}
                id={`btn-rep-${rep.toLowerCase()}`}
                onClick={() => setUI((prev) => ({ ...prev, representation: rep }))}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  ui.representation === rep
                    ? 'bg-[#203248] text-[#48CAE4] font-medium'
                    : 'text-[#8C9BAE] hover:text-[#EDF2F7]'
                }`}
              >
                {rep}
              </button>
            ))}
          </div>
        </div>

        {/* Color Scheme */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#63758A] mr-1">
            COLOR:
          </span>
          <div className="flex items-center bg-[#0B0F14] p-0.5 rounded border border-[#1E2633]">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme}
                id={`btn-color-${scheme.toLowerCase()}`}
                onClick={() => setUI((prev) => ({ ...prev, colorScheme: scheme }))}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  ui.colorScheme === scheme
                    ? 'bg-[#203248] text-[#48CAE4] font-medium'
                    : 'text-[#8C9BAE] hover:text-[#EDF2F7]'
                }`}
              >
                {scheme}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Feature Toggles */}
      <div className="flex items-center gap-2">
        {/* H-Bonds toggle */}
        <button
          id="toggle-hbonds"
          onClick={() => setUI((prev) => ({ ...prev, showHBonds: !prev.showHBonds }))}
          className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
            ui.showHBonds
              ? 'bg-[#142636] border-[#2B4B6F] text-[#48CAE4]'
              : 'bg-[#0B0F14] border-[#1E2633] text-[#63758A] hover:text-[#8C9BAE]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              ui.showHBonds ? 'bg-[#48CAE4]' : 'bg-[#3A4A5B]'
            }`}
          />
          <span>H-BONDS</span>
        </button>

        {/* Hydrophobic toggle */}
        <button
          id="toggle-hydrophobic"
          onClick={() => setUI((prev) => ({ ...prev, showHydrophobic: !prev.showHydrophobic }))}
          className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
            ui.showHydrophobic
              ? 'bg-[#142B28] border-[#21574C] text-[#2A9D8F]'
              : 'bg-[#0B0F14] border-[#1E2633] text-[#63758A] hover:text-[#8C9BAE]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              ui.showHydrophobic ? 'bg-[#2A9D8F]' : 'bg-[#3A4A5B]'
            }`}
          />
          <span>HYDROPHOBIC</span>
        </button>

        {/* Grid Box toggle */}
        <button
          id="toggle-grid-box"
          onClick={toggleGrid}
          className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
            bindingSite.showGrid && ui.showGridBox
              ? 'bg-[#242A1D] border-[#4B5A33] text-[#E9C46A]'
              : 'bg-[#0B0F14] border-[#1E2633] text-[#63758A] hover:text-[#8C9BAE]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              bindingSite.showGrid && ui.showGridBox ? 'bg-[#E9C46A]' : 'bg-[#3A4A5B]'
            }`}
          />
          <span>GRID BOX</span>
        </button>

        {/* Water Solvation */}
        <button
          id="toggle-water"
          onClick={() => setUI((prev) => ({ ...prev, showWaterSolvation: !prev.showWaterSolvation }))}
          className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
            ui.showWaterSolvation
              ? 'bg-[#1C2433] border-[#364966] text-[#7395B8]'
              : 'bg-[#0B0F14] border-[#1E2633] text-[#63758A] hover:text-[#8C9BAE]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              ui.showWaterSolvation ? 'bg-[#7395B8]' : 'bg-[#3A4A5B]'
            }`}
          />
          <span>SOLVATION</span>
        </button>
      </div>
    </div>
  );
};
