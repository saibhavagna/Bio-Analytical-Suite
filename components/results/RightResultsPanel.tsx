'use client';

import React, { useState } from 'react';
import { useDocking } from '@/context/DockingContext';
import { EnergyDecompositionChart } from './EnergyDecompositionChart';
import { ScientificTooltip } from '@/components/common/ScientificTooltip';

export const RightResultsPanel: React.FC = () => {
  const {
    activeLigand,
    poses,
    selectedPoseId,
    selectPose,
    activePose,
    interactions,
    energyProfile,
    compoundProperties,
    admet,
    exportCsvResults,
    exportPdbqtFile,
    exportReportManifest,
  } = useDocking();

  const [activeTab, setActiveTab] = useState<'poses' | 'contacts' | 'energy' | 'admet'>('poses');

  // Scientific conversions & metrics
  const formatKi = (deltaG: number) => {
    // ΔG = RT ln(Ki) -> Ki = exp(ΔG / (R·T))
    // R = 1.9872e-3 kcal/(mol·K), T = 298.15 K -> RT = 0.59248 kcal/mol
    const kdMolar = Math.exp(deltaG / 0.59248);
    if (kdMolar < 1e-9) {
      return `${(kdMolar * 1e12).toFixed(1)} pM`;
    } else if (kdMolar < 1e-6) {
      return `${(kdMolar * 1e9).toFixed(1)} nM`;
    } else if (kdMolar < 1e-3) {
      return `${(kdMolar * 1e6).toFixed(2)} µM`;
    } else {
      return `${(kdMolar * 1e3).toFixed(2)} mM`;
    }
  };

  const calcLE = (deltaG: number, mw: number) => {
    const heavyAtoms = Math.max(1, Math.round(mw / 13.8));
    return (-deltaG / heavyAtoms).toFixed(2);
  };

  const calcLipE = (deltaG: number, logP: number) => {
    const pKd = -deltaG / (2.303 * 0.59248);
    return (pKd - logP).toFixed(1);
  };

  return (
    <aside className="w-[360px] min-w-[360px] max-w-[360px] h-full bg-[#0D1117] border-l border-[#1C2532] flex flex-col overflow-y-auto custom-scrollbar select-none text-[#CBD5E0]">
      {/* Title Bar */}
      <div className="p-3 border-b border-[#1C2532] flex items-center justify-between bg-[#111720]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-[#4FAE7B]" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDF2F7]">
            RESULTS & ANALYSIS
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#E9C46A] bg-[#0A0E13] px-2 py-0.5 rounded border border-[#1A222D]">
          {poses.length} CONFORMERS
        </span>
      </div>

      <div className="p-3 flex flex-col gap-3.5 flex-1">
        {/* ================= TOP SOLUTION CARD ================= */}
        <section className="bg-[#11161E] border border-[#1E2734] rounded-sm p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#48CAE4] font-bold uppercase tracking-wider">
              LEAD CONFORMATION
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase ${
                activePose.status === 'Optimal'
                  ? 'bg-[#153428] text-[#4FAE7B] border border-[#216147]'
                  : 'bg-[#1A2E44] text-[#48CAE4] border border-[#264E74]'
              }`}
            >
              {activePose.id} (RANK #{activePose.rank})
            </span>
          </div>

          {/* Large Affinity Stat with Tooltips */}
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <ScientificTooltip metricId="deltaG" underline position="bottom">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-mono font-bold text-[#4FAE7B] tracking-tight">
                    {activePose.deltaG.toFixed(2)}
                  </span>
                  <span className="text-xs font-mono text-[#7395B8]">kcal/mol</span>
                </div>
              </ScientificTooltip>

              {/* Estimated Ki & Ligand Efficiency */}
              <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                <ScientificTooltip metricId="inhibitionConstant" underline position="bottom">
                  <span className="text-[#64748B]">Est. Ki:</span>{' '}
                  <span className="text-[#48CAE4] font-semibold">{formatKi(activePose.deltaG)}</span>
                </ScientificTooltip>
                <span className="text-[#334155]">•</span>
                <ScientificTooltip metricId="ligandEfficiency" underline position="bottom">
                  <span className="text-[#64748B]">LE:</span>{' '}
                  <span className="text-[#E9C46A] font-semibold">
                    {calcLE(activePose.deltaG, compoundProperties.mw)}
                  </span>
                </ScientificTooltip>
              </div>
            </div>

            <div className="text-right">
              <ScientificTooltip metricId="rmsd" underline position="left">
                <div className="text-right">
                  <span className="text-sm font-mono font-semibold text-[#CBD5E0]">
                    {activePose.rmsd.toFixed(2)} Å
                  </span>
                  <span className="text-[10px] font-mono text-[#63758A] block">RMSD to Ref</span>
                </div>
              </ScientificTooltip>
              <span className="text-[9px] font-mono text-[#4FAE7B] block mt-0.5">
                {activePose.rmsd <= 2.0
                  ? '✓ Native-like (≤2.0 Å)'
                  : activePose.rmsd <= 3.0
                  ? '○ Moderate (2–3 Å)'
                  : '▲ Divergent (>3 Å)'}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar with Scientific Tooltips */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#18212C] text-center text-[10px] font-mono">
            <ScientificTooltip metricId="hBonds" className="w-full" position="top">
              <div className="w-full bg-[#0B0F14] p-1.5 rounded border border-[#161F2B] hover:border-[#26374A] transition-colors">
                <span className="text-[#63758A] block text-[9px]">H-BONDS</span>
                <span className="text-[#48CAE4] font-semibold">{activePose.hBondsCount}</span>
              </div>
            </ScientificTooltip>

            <ScientificTooltip metricId="hydrophobic" className="w-full" position="top">
              <div className="w-full bg-[#0B0F14] p-1.5 rounded border border-[#161F2B] hover:border-[#26374A] transition-colors">
                <span className="text-[#63758A] block text-[9px]">HYDROPHOBIC</span>
                <span className="text-[#2A9D8F] font-semibold">{activePose.hydrophobicCount}</span>
              </div>
            </ScientificTooltip>

            <ScientificTooltip metricId="clashScore" className="w-full" position="top">
              <div className="w-full bg-[#0B0F14] p-1.5 rounded border border-[#161F2B] hover:border-[#26374A] transition-colors">
                <span className="text-[#63758A] block text-[9px]">STERIC CLASH</span>
                <span
                  className={`font-semibold ${
                    activePose.clashScore === 0 ? 'text-[#4FAE7B]' : 'text-[#E76F51]'
                  }`}
                >
                  {activePose.clashScore.toFixed(2)}
                </span>
              </div>
            </ScientificTooltip>
          </div>
        </section>

        {/* ================= TABS SWITCHER ================= */}
        <div className="flex items-center bg-[#0B0F14] p-0.5 rounded border border-[#1C2532] text-[10px] font-mono">
          <button
            id="tab-poses"
            onClick={() => setActiveTab('poses')}
            className={`flex-1 py-1 rounded transition-colors ${
              activeTab === 'poses'
                ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium'
                : 'text-[#7395B8] hover:text-[#EDF2F7]'
            }`}
          >
            ENSEMBLE ({poses.length})
          </button>
          <button
            id="tab-contacts"
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-1 rounded transition-colors ${
              activeTab === 'contacts'
                ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium'
                : 'text-[#7395B8] hover:text-[#EDF2F7]'
            }`}
          >
            CONTACTS ({interactions.length})
          </button>
          <button
            id="tab-energy"
            onClick={() => setActiveTab('energy')}
            className={`flex-1 py-1 rounded transition-colors ${
              activeTab === 'energy'
                ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium'
                : 'text-[#7395B8] hover:text-[#EDF2F7]'
            }`}
          >
            ENERGY
          </button>
          <button
            id="tab-admet"
            onClick={() => setActiveTab('admet')}
            className={`flex-1 py-1 rounded transition-colors ${
              activeTab === 'admet'
                ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium'
                : 'text-[#7395B8] hover:text-[#EDF2F7]'
            }`}
          >
            ADMET
          </button>
        </div>

        {/* ================= TAB CONTENT 1: CONFORMATION ENSEMBLE ================= */}
        {activeTab === 'poses' && (
          <section className="bg-[#11161E] border border-[#1E2734] rounded-sm p-2 flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between px-1 text-[10px] font-mono text-[#63758A]">
              <span>RANK & CONFORMER</span>
              <div className="flex items-center gap-3">
                <ScientificTooltip metricId="deltaG" underline position="bottom">
                  <span>ΔG (kcal)</span>
                </ScientificTooltip>
                <ScientificTooltip metricId="rmsd" underline position="bottom">
                  <span>RMSD</span>
                </ScientificTooltip>
                <ScientificTooltip metricId="hBonds" underline position="bottom">
                  <span>HB</span>
                </ScientificTooltip>
              </div>
            </div>

            <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto custom-scrollbar">
              {poses.map((pose) => {
                const isSelected = pose.id === selectedPoseId;
                return (
                  <button
                    key={pose.id}
                    id={`pose-row-${pose.id}`}
                    onClick={() => selectPose(pose.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] font-mono transition-all text-left ${
                      isSelected
                        ? 'bg-[#1C2C3F] border border-[#48CAE4] text-[#EDF2F7]'
                        : 'bg-[#0B0F14] border border-[#161F2B] text-[#A0AEC0] hover:bg-[#141B24] hover:text-[#EDF2F7]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#63758A] w-4">#{pose.rank}</span>
                      <span className="font-semibold text-[#E9C46A]">{pose.id}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#48CAE4] animate-ping" />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <ScientificTooltip metricId="deltaG" position="left">
                        <span
                          className={`font-semibold ${
                            pose.deltaG <= -9.0 ? 'text-[#4FAE7B]' : 'text-[#48CAE4]'
                          }`}
                        >
                          {pose.deltaG.toFixed(2)}
                        </span>
                      </ScientificTooltip>

                      <ScientificTooltip metricId="rmsd" position="left">
                        <span className="text-[#8C9BAE] text-[10px] w-10 text-right">
                          {pose.rmsd.toFixed(2)} Å
                        </span>
                      </ScientificTooltip>

                      <ScientificTooltip metricId="hBonds" position="left">
                        <span className="text-[#E9C46A] text-[10px] w-4 text-right">
                          {pose.hBondsCount}
                        </span>
                      </ScientificTooltip>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-[9px] font-mono text-[#63758A] px-1 pt-1 text-center">
              Hover metrics for thermodynamic definitions & benchmarks
            </div>
          </section>
        )}

        {/* ================= TAB CONTENT 2: KEY RESIDUE CONTACTS ================= */}
        {activeTab === 'contacts' && (
          <section className="bg-[#11161E] border border-[#1E2734] rounded-sm p-2 flex flex-col gap-1.5 flex-1">
            <div className="flex items-center justify-between px-1 text-[10px] font-mono text-[#63758A]">
              <span>RESIDUE & CHAIN</span>
              <span>TYPE</span>
              <ScientificTooltip metricId="contactDistance" underline position="bottom">
                <span>DIST. (Å)</span>
              </ScientificTooltip>
              <ScientificTooltip metricId="deltaG" underline position="bottom">
                <span>ΔE (kcal)</span>
              </ScientificTooltip>
            </div>

            <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto custom-scrollbar">
              {interactions.map((int) => (
                <div
                  key={int.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded bg-[#0B0F14] border border-[#161F2B] text-[10px] font-mono"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: int.color }}
                    />
                    <span className="font-semibold text-[#EDF2F7]">{int.residue}</span>
                    <span className="text-[#63758A]">({int.atom})</span>
                  </div>

                  <span className="text-[#8C9BAE] text-[9px] truncate max-w-[70px]">
                    {int.type}
                  </span>

                  <ScientificTooltip metricId="contactDistance" position="left">
                    <span className="text-[#48CAE4] font-semibold">{int.distance} Å</span>
                  </ScientificTooltip>

                  <ScientificTooltip metricId="deltaG" position="left">
                    <span className="text-[#4FAE7B] font-semibold">{int.energy.toFixed(2)}</span>
                  </ScientificTooltip>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= TAB CONTENT 3: THERMODYNAMIC ENERGY ================= */}
        {activeTab === 'energy' && (
          <section className="bg-[#11161E] border border-[#1E2734] rounded-sm p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase text-[#7395B8]">
                EMPIRICAL DECOMPOSITION
              </span>
              <ScientificTooltip metricId="deltaG" underline position="bottom">
                <span className="text-[10px] font-mono text-[#4FAE7B] font-semibold">
                  ΔG {energyProfile.deltaG.toFixed(2)} kcal/mol
                </span>
              </ScientificTooltip>
            </div>

            <EnergyDecompositionChart profile={energyProfile} />

            {/* Quick Component Exploration Pills */}
            <div className="flex flex-wrap gap-1 pt-1">
              <ScientificTooltip metricId="vdwEnergy" underline position="top">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#0D1612] text-[#4FAE7B] border border-[#1A3326]">
                  vdW {energyProfile.vdw.toFixed(1)}
                </span>
              </ScientificTooltip>
              <ScientificTooltip metricId="electrostaticEnergy" underline position="top">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#0E1B26] text-[#48CAE4] border border-[#1B364C]">
                  Elec {energyProfile.electrostatic.toFixed(1)}
                </span>
              </ScientificTooltip>
              <ScientificTooltip metricId="hBonds" underline position="top">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#0E1B26] text-[#00B4D8] border border-[#1B364C]">
                  H-Bond {energyProfile.hBonding.toFixed(1)}
                </span>
              </ScientificTooltip>
              <ScientificTooltip metricId="desolvationEnergy" underline position="top">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#241310] text-[#E76F51] border border-[#44231E]">
                  Desolv +{energyProfile.desolvation.toFixed(1)}
                </span>
              </ScientificTooltip>
              <ScientificTooltip metricId="torsionalStrain" underline position="top">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#261B10] text-[#F4A261] border border-[#48331E]">
                  Tors +{energyProfile.ligandStrain.toFixed(1)}
                </span>
              </ScientificTooltip>
            </div>

            <div className="text-[9px] font-mono text-[#63758A] leading-tight pt-1">
              Linear additive scoring function: ΔG_bind = ΔG_vdw + ΔG_elec + ΔG_hbond + ΔG_desolv +
              ΔG_tors.
            </div>
          </section>
        )}

        {/* ================= TAB CONTENT 4: IN SILICO ADMET ================= */}
        {activeTab === 'admet' && (
          <section className="bg-[#11161E] border border-[#1E2734] rounded-sm p-2.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold uppercase text-[#7395B8]">
                {activeLigand.id} ADMET PROFILE
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                  admet.lipinskiPass
                    ? 'bg-[#153428] text-[#4FAE7B] border border-[#216147]'
                    : 'bg-[#332215] text-[#E9C46A] border border-[#664322]'
                }`}
              >
                {admet.lipinskiPass ? 'LIPINSKI PASS (0 VIOLATIONS)' : `${admet.lipinskiViolations} VIOLATIONS`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div className="bg-[#0B0F14] p-1.5 rounded border border-[#161F2B]">
                <span className="text-[#63758A] block">ORAL ABSORPTION</span>
                <span className="text-[#48CAE4] font-semibold">{admet.absorption}</span>
              </div>
              <div className="bg-[#0B0F14] p-1.5 rounded border border-[#161F2B]">
                <span className="text-[#63758A] block">DISTRIBUTION (VD)</span>
                <span className="text-[#4FAE7B] font-semibold">{admet.distribution}</span>
              </div>
              <div className="bg-[#0B0F14] p-1.5 rounded border border-[#161F2B]">
                <span className="text-[#63758A] block">CYP METABOLISM</span>
                <span className="text-[#E9C46A] font-semibold">{admet.metabolism}</span>
              </div>
              <div className="bg-[#0B0F14] p-1.5 rounded border border-[#161F2B]">
                <span className="text-[#63758A] block">TOXICITY RISK</span>
                <span
                  className={`font-semibold ${
                    admet.toxicity === 'Low' ? 'text-[#4FAE7B]' : 'text-[#E76F51]'
                  }`}
                >
                  {admet.toxicity}
                </span>
              </div>
            </div>

            {/* Physicochemical Parameters with Scientific Tooltips */}
            <div className="bg-[#0B0F14] p-2 rounded border border-[#161F2B] text-[10px] font-mono flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[#8C9BAE]">
                <ScientificTooltip metricId="molecularWeight" underline position="right">
                  <span>Molecular Weight:</span>
                </ScientificTooltip>
                <span className="text-[#EDF2F7] font-semibold">{compoundProperties.mw} g/mol</span>
              </div>

              <div className="flex justify-between items-center text-[#8C9BAE]">
                <ScientificTooltip metricId="logP" underline position="right">
                  <span>LogP (Lipophilicity):</span>
                </ScientificTooltip>
                <span className="text-[#EDF2F7] font-semibold">{compoundProperties.logP}</span>
              </div>

              <div className="flex justify-between items-center text-[#8C9BAE]">
                <ScientificTooltip metricId="tpsa" underline position="right">
                  <span>Polar Surface Area (TPSA):</span>
                </ScientificTooltip>
                <span className="text-[#EDF2F7] font-semibold">{compoundProperties.tpsa} Å²</span>
              </div>

              <div className="flex justify-between items-center text-[#8C9BAE]">
                <ScientificTooltip metricId="hbd_hba" underline position="right">
                  <span>H-Bond Donors / Acceptors:</span>
                </ScientificTooltip>
                <span className="text-[#EDF2F7] font-semibold">
                  {compoundProperties.hbd} / {compoundProperties.hba}
                </span>
              </div>

              {/* Derived Lead-Likeness Metrics: LE & LipE */}
              <div className="flex justify-between items-center text-[#8C9BAE] pt-1 border-t border-[#141B24]">
                <ScientificTooltip metricId="ligandEfficiency" underline position="right">
                  <span>Ligand Efficiency (LE):</span>
                </ScientificTooltip>
                <span className="text-[#E9C46A] font-semibold">
                  {calcLE(activePose.deltaG, compoundProperties.mw)} kcal/mol/HA
                </span>
              </div>

              <div className="flex justify-between items-center text-[#8C9BAE]">
                <ScientificTooltip metricId="lipophilicEfficiency" underline position="right">
                  <span>Lipophilic Efficiency (LipE):</span>
                </ScientificTooltip>
                <span className="text-[#48CAE4] font-semibold">
                  {calcLipE(activePose.deltaG, compoundProperties.logP)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-[#A0AEC0] italic leading-tight">{admet.notes}</p>
          </section>
        )}

        {/* ================= EXPORT ACTIONS ================= */}
        <section className="bg-[#11161E] border border-[#1E2734] rounded-sm p-3 flex flex-col gap-2 mt-auto">
          <span className="text-[10px] font-mono font-semibold uppercase text-[#7395B8]">
            DATA EXPORT & REPORTING
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              id="btn-export-csv"
              onClick={exportCsvResults}
              className="py-1.5 px-2 text-[10px] font-mono rounded bg-[#131B24] border border-[#233142] text-[#8C9BAE] hover:text-[#EDF2F7] hover:border-[#384E68] transition-colors cursor-pointer"
            >
              DOWNLOAD CSV
            </button>
            <button
              id="btn-export-pdbqt"
              onClick={exportPdbqtFile}
              className="py-1.5 px-2 text-[10px] font-mono rounded bg-[#131B24] border border-[#233142] text-[#8C9BAE] hover:text-[#EDF2F7] hover:border-[#384E68] transition-colors cursor-pointer"
            >
              DOWNLOAD PDBQT
            </button>
          </div>

          <button
            id="btn-export-report"
            onClick={exportReportManifest}
            className="w-full py-1.5 px-3 rounded text-[10px] font-mono font-semibold bg-[#1C2C3F] border border-[#2B4B6F] text-[#48CAE4] hover:bg-[#233852] transition-colors cursor-pointer"
          >
            VIEW RESEARCH DOSSIER REPORT
          </button>
        </section>
      </div>
    </aside>
  );
};

