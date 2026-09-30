'use client';

import React from 'react';
import { useDocking } from '@/context/DockingContext';

export const ComputationalInterpretationCard: React.FC = () => {
  const { interpretation, activePose, activeLigand, interactions, energyProfile } = useDocking();

  // Ligand efficiency: ΔG / Heavy Atoms (approx formula: MW / 13)
  const heavyAtoms = Math.round(activeLigand.molecularWeight / 14);
  const ligandEfficiency = (Math.abs(activePose.deltaG) / (heavyAtoms || 1)).toFixed(2);
  const buriedSurfaceArea = (450 + (activePose.hydrophobicCount * 42)).toFixed(0);

  return (
    <div className="w-full bg-[#0D1217] border border-[#1E2633] rounded-sm p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#48CAE4] animate-pulse" />
          <h4 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#A0AEC0]">
            COMPUTATIONAL INTERPRETATION • {activePose.id}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
              activePose.status === 'Optimal'
                ? 'bg-[#153428] text-[#4FAE7B] border border-[#216147]'
                : activePose.status === 'Active'
                ? 'bg-[#1A2E44] text-[#48CAE4] border border-[#264E74]'
                : 'bg-[#332215] text-[#E9C46A] border border-[#664322]'
            }`}
          >
            {activePose.status} CONFORMATION
          </span>
          <span className="text-[9px] font-mono text-[#63758A]">
            CONFORMER #{activePose.conformerIndex}
          </span>
        </div>
      </div>

      {/* Dynamic Scientific Analysis Statement */}
      <p className="text-xs text-[#CBD5E0] leading-relaxed font-sans">
        {interpretation}
      </p>

      {/* Thermodynamic Metrics Grid */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#19222E]">
        <div className="bg-[#111720] p-2 rounded border border-[#1E2633]">
          <div className="text-[9px] font-mono uppercase text-[#63758A]">LIGAND EFFICIENCY (LE)</div>
          <div className="text-xs font-mono font-semibold text-[#EDF2F7] mt-0.5">
            {ligandEfficiency} <span className="text-[9px] font-normal text-[#7395B8]">kcal/mol/HA</span>
          </div>
        </div>

        <div className="bg-[#111720] p-2 rounded border border-[#1E2633]">
          <div className="text-[9px] font-mono uppercase text-[#63758A]">BURIED SURFACE AREA</div>
          <div className="text-xs font-mono font-semibold text-[#48CAE4] mt-0.5">
            {buriedSurfaceArea} <span className="text-[9px] font-normal text-[#7395B8]">Å²</span>
          </div>
        </div>

        <div className="bg-[#111720] p-2 rounded border border-[#1E2633]">
          <div className="text-[9px] font-mono uppercase text-[#63758A]">TORSIONAL STRAIN</div>
          <div className="text-xs font-mono font-semibold text-[#E9C46A] mt-0.5">
            +{energyProfile.ligandStrain.toFixed(2)}{' '}
            <span className="text-[9px] font-normal text-[#7395B8]">kcal/mol</span>
          </div>
        </div>

        <div className="bg-[#111720] p-2 rounded border border-[#1E2633]">
          <div className="text-[9px] font-mono uppercase text-[#63758A]">ENGAGED CONTACTS</div>
          <div className="text-xs font-mono font-semibold text-[#4FAE7B] mt-0.5">
            {interactions.length} <span className="text-[9px] font-normal text-[#7395B8]">Residues</span>
          </div>
        </div>
      </div>

      {/* Engaged Residue Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[9px] font-mono text-[#63758A] mr-1">ACTIVE ANCHORS:</span>
        {interactions.slice(0, 5).map((int) => (
          <span
            key={int.id}
            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#16202C] text-[#A0AEC0] border border-[#243346] flex items-center gap-1"
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: int.color }}
            />
            <span>{int.residue}</span>
            <span className="text-[8px] text-[#7395B8]">({int.distance}Å)</span>
          </span>
        ))}
      </div>
    </div>
  );
};
