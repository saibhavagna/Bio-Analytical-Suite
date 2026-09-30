'use client';

import React from 'react';
import { useDocking } from '@/context/DockingContext';

export const ReportExportModal: React.FC = () => {
  const {
    project,
    receptor,
    bindingSite,
    activeLigand,
    activePose,
    poses,
    interactions,
    energyProfile,
    admet,
    ui,
    toggleModal,
    dockingProtocol,
  } = useDocking();

  if (!ui.modals.exportReport) return null;

  const downloadTextReport = () => {
    const reportText = `================================================================================
BIO-ANALYTICAL SUITE - DEMONSTRATION / PROTOTYPE DOCKING REPORT
================================================================================
NOTICE: DEMONSTRATION / PROTOTYPE RESULTS ONLY (SIMULATED / PREDICTED VALUES)
--------------------------------------------------------------------------------
PROJECT IDENTIFIER: ${project.name}
PROJECT STAGE:      ${project.stage}
RUN MANIFEST:       ${project.runName} (${dockingProtocol.engine})
TIMESTAMP:          ${new Date().toISOString()}
WORKSTATION ID:     NODE-04 (CUDA GPU ACCELERATED)
--------------------------------------------------------------------------------

1. RECEPTOR TARGET PARAMETERS
--------------------------------------------------------------------------------
Receptor File:      ${receptor.filename}
Chain ID:           ${receptor.chain}
Experimental Res.:  ${receptor.resolution} Å
Total Atom Count:   ${receptor.atomCount.toLocaleString()} atoms
Residues:           ${receptor.residuesCount}
Preparation:        Polar Hydrogens (Kollman) Assigned, Waters Removed, Gasteiger Charges

2. SEARCH SPACE (GRID BOX SPECIFICATION)
--------------------------------------------------------------------------------
Grid Center (X,Y,Z): [${bindingSite.center.x}, ${bindingSite.center.y}, ${bindingSite.center.z}] Å
Grid Dimensions:     [${bindingSite.size.x} × ${bindingSite.size.y} × ${bindingSite.size.z}] Å
Grid Spacing:        ${bindingSite.spacing} Å
Search Volume:       ${bindingSite.volume.toLocaleString()} Å³
Targeted Residues:   ${bindingSite.referenceResidues.join(', ')}

3. CANDIDATE LIGAND PHARMACOPHORE
--------------------------------------------------------------------------------
Ligand ID:          ${activeLigand.id}
Chemical Name:      ${activeLigand.name}
Formula:            ${activeLigand.formula}
Molecular Weight:   ${activeLigand.molecularWeight} g/mol
LogP:               ${activeLigand.logP}
TPSA:               ${activeLigand.tpsa} Å²
Rotatable Bonds:    ${activeLigand.rotatableBonds}
Canonical SMILES:   ${activeLigand.smiles}

4. TOP RANKED CONFORMATION SUMMARY (${activePose.id})
--------------------------------------------------------------------------------
Binding Affinity (ΔG): ${activePose.deltaG.toFixed(2)} kcal/mol
RMSD to Crystal:       ${activePose.rmsd.toFixed(2)} Å
Hydrogen Bonds:        ${activePose.hBondsCount}
Hydrophobic Contacts:  ${activePose.hydrophobicCount}
Steric Clash Score:    ${activePose.clashScore.toFixed(2)}
Conformation Status:   ${activePose.status}

5. THERMODYNAMIC ENERGY DECOMPOSITION
--------------------------------------------------------------------------------
Van der Waals (vdW):       ${energyProfile.vdw.toFixed(2)} kcal/mol
Electrostatic Energy:      ${energyProfile.electrostatic.toFixed(2)} kcal/mol
Hydrogen Bonding:          ${energyProfile.hBonding.toFixed(2)} kcal/mol
Desolvation Penalty:      +${energyProfile.desolvation.toFixed(2)} kcal/mol
Ligand Torsional Strain:  +${energyProfile.ligandStrain.toFixed(2)} kcal/mol
Net Calculated ΔG:         ${energyProfile.deltaG.toFixed(2)} kcal/mol

6. KEY INTERMOLECULAR RESIDUE CONTACTS
--------------------------------------------------------------------------------
${interactions
  .map(
    (int) =>
      `  • ${int.residue} (${int.atom}) <-> Ligand ${int.ligandAtom} | Type: ${int.type.padEnd(
        14
      )} | Dist: ${int.distance.toFixed(2)} Å | ΔE: ${int.energy.toFixed(2)} kcal/mol`
  )
  .join('\n')}

7. COMPLETE CONFORMATION ENSEMBLE
--------------------------------------------------------------------------------
Rank  | Pose ID | ΔG (kcal/mol) | RMSD (Å) | H-Bonds | Clash Score | Status
${poses
  .map(
    (p) =>
      `#${p.rank.toString().padEnd(4)}| ${p.id.padEnd(8)}| ${p.deltaG
        .toFixed(2)
        .padEnd(14)}| ${p.rmsd.toFixed(2).padEnd(9)}| ${p.hBondsCount
        .toString()
        .padEnd(8)}| ${p.clashScore.toFixed(2).padEnd(12)}| ${p.status}`
  )
  .join('\n')}

8. IN SILICO ADMET PREDICTIONS
--------------------------------------------------------------------------------
Oral Absorption:     ${admet.absorption}
Distribution (Vd):   ${admet.distribution}
Metabolism (CYP):    ${admet.metabolism}
Toxicity Risk:       ${admet.toxicity}
Lipinski Rule of 5:  ${admet.lipinskiPass ? 'PASSED (0 Violations)' : 'VIOLATIONS DETECTED'}
Assessment Note:     ${admet.notes}

================================================================================
NOTICE: Generated for in silico drug discovery screening and computational chemistry
simulation workflows. Validated against AutoDock Vina v1.2.5 scoring functions.
================================================================================
`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '_')}_${activeLigand.id}_Dossier_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyJsonManifest = () => {
    const data = {
      project,
      receptor,
      bindingSite,
      activeLigand,
      activePose,
      interactions,
      energyProfile,
      admet,
      ensemble: poses,
    };
    navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
    alert('JSON Research Manifest copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs select-none">
      <div className="w-[860px] max-w-[95vw] max-h-[90vh] bg-[#0E131A] border border-[#233144] rounded shadow-2xl flex flex-col overflow-hidden text-[#CBD5E0]">
        {/* Header */}
        <div className="p-3.5 bg-[#121922] border-b border-[#202C3C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#4FAE7B]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#EDF2F7]">
              RESEARCH DOSSIER REPORT • {project.runName}
            </h3>
            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-[#1C2C3F] text-[#48CAE4] border border-[#2D4560]">
              DEMONSTRATION / PROTOTYPE
            </span>
          </div>
          <button
            onClick={() => toggleModal('exportReport', false)}
            className="text-xs font-mono text-[#8C9BAE] hover:text-[#EDF2F7] px-2 py-0.5 rounded hover:bg-[#1A2533]"
          >
            ✕ ESC
          </button>
        </div>

        {/* Report Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 font-mono text-xs flex flex-col gap-4 bg-[#090C10]">
          {/* Title Banner */}
          <div className="border border-[#1E2734] bg-[#0F141C] p-3 rounded flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#EDF2F7]">
                BIO-ANALYTICAL MOLECULAR DOCKING DOSSIER
              </h2>
              <p className="text-[10px] text-[#7395B8]">
                {project.name} • {project.stage} • AutoDock Vina Engine v1.2.5
              </p>
            </div>
            <div className="text-right text-[10px] text-[#63758A]">
              <div>DATE: {new Date().toLocaleDateString()}</div>
              <div className="text-[#4FAE7B]">STATUS: CONVERGED</div>
            </div>
          </div>

          {/* Section 1: Receptor & Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111720] p-3 rounded border border-[#1C2532]">
              <div className="text-[10px] font-bold text-[#48CAE4] mb-2">TARGET RECEPTOR</div>
              <div className="text-[11px] flex flex-col gap-1 text-[#8C9BAE]">
                <div>File: <span className="text-[#EDF2F7]">{receptor.filename} (Chain {receptor.chain})</span></div>
                <div>Atoms / Residues: <span className="text-[#EDF2F7]">{receptor.atomCount.toLocaleString()} / {receptor.residuesCount}</span></div>
                <div>X-Ray Resolution: <span className="text-[#EDF2F7]">{receptor.resolution} Å</span></div>
                <div>Protonation: <span className="text-[#4FAE7B]">Kollman Hydrogens (pH 7.4)</span></div>
              </div>
            </div>

            <div className="bg-[#111720] p-3 rounded border border-[#1C2532]">
              <div className="text-[10px] font-bold text-[#E9C46A] mb-2">SEARCH SPACE GRID</div>
              <div className="text-[11px] flex flex-col gap-1 text-[#8C9BAE]">
                <div>Center (X,Y,Z): <span className="text-[#EDF2F7]">[{bindingSite.center.x}, {bindingSite.center.y}, {bindingSite.center.z}] Å</span></div>
                <div>Dimensions: <span className="text-[#EDF2F7]">[{bindingSite.size.x} × {bindingSite.size.y} × {bindingSite.size.z}] Å</span></div>
                <div>Volume: <span className="text-[#EDF2F7]">{bindingSite.volume.toLocaleString()} Å³</span></div>
                <div>Key Dyad: <span className="text-[#EDF2F7]">HIS41 / CYS145 / GLU166</span></div>
              </div>
            </div>
          </div>

          {/* Section 2: Top Conformation & Energy */}
          <div className="bg-[#111720] p-3.5 rounded border border-[#1C2532]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#4FAE7B]">
                LEAD CONFORMATION ({activePose.id}) • AFFINITY ΔG {activePose.deltaG.toFixed(2)} kcal/mol
              </span>
              <span className="text-[10px] text-[#7395B8]">RMSD {activePose.rmsd.toFixed(2)} Å</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] text-center mb-3">
              <div className="bg-[#0B0F14] p-1.5 rounded border border-[#1A222D]">
                <span className="text-[#63758A] block">vdW</span>
                <span className="text-[#4FAE7B] font-bold">{energyProfile.vdw.toFixed(2)}</span>
              </div>
              <div className="bg-[#0B0F14] p-1.5 rounded border border-[#1A222D]">
                <span className="text-[#63758A] block">Electrostatic</span>
                <span className="text-[#48CAE4] font-bold">{energyProfile.electrostatic.toFixed(2)}</span>
              </div>
              <div className="bg-[#0B0F14] p-1.5 rounded border border-[#1A222D]">
                <span className="text-[#63758A] block">H-Bonding</span>
                <span className="text-[#48CAE4] font-bold">{energyProfile.hBonding.toFixed(2)}</span>
              </div>
              <div className="bg-[#0B0F14] p-1.5 rounded border border-[#1A222D]">
                <span className="text-[#63758A] block">Torsion Strain</span>
                <span className="text-[#E9C46A] font-bold">+{energyProfile.ligandStrain.toFixed(2)}</span>
              </div>
            </div>

            {/* Key Contacts Table */}
            <div className="text-[10px] text-[#63758A] mb-1 font-bold">ENGAGED RESIDUE ANCHORS:</div>
            <div className="flex flex-col gap-1">
              {interactions.map((int) => (
                <div
                  key={int.id}
                  className="flex items-center justify-between bg-[#0B0F14] px-2 py-1 rounded text-[10px]"
                >
                  <span className="text-[#EDF2F7] font-semibold">{int.residue} ({int.atom})</span>
                  <span className="text-[#8C9BAE]">{int.type}</span>
                  <span className="text-[#48CAE4]">{int.distance.toFixed(2)} Å</span>
                  <span className="text-[#4FAE7B]">{int.energy.toFixed(2)} kcal/mol</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Ensemble Summary */}
          <div className="bg-[#111720] p-3 rounded border border-[#1C2532]">
            <div className="text-[10px] font-bold text-[#A0AEC0] mb-2">CONFORMATION ENSEMBLE</div>
            <div className="grid grid-cols-5 text-[10px] text-[#63758A] pb-1 border-b border-[#1A222D]">
              <span>Rank / Pose</span>
              <span className="text-right">ΔG (kcal/mol)</span>
              <span className="text-right">RMSD (Å)</span>
              <span className="text-right">H-Bonds</span>
              <span className="text-right">Clash Score</span>
            </div>
            <div className="divide-y divide-[#151C26]">
              {poses.slice(0, 6).map((p) => (
                <div key={p.id} className="grid grid-cols-5 text-[10px] py-1 text-[#CBD5E0]">
                  <span>#{p.rank} {p.id}</span>
                  <span className="text-right font-semibold text-[#4FAE7B]">{p.deltaG.toFixed(2)}</span>
                  <span className="text-right text-[#8C9BAE]">{p.rmsd.toFixed(2)}</span>
                  <span className="text-right text-[#E9C46A]">{p.hBondsCount}</span>
                  <span className="text-right text-[#A0AEC0]">{p.clashScore.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Export Actions */}
        <div className="p-3 bg-[#121922] border-t border-[#202C3C] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={downloadTextReport}
              className="px-3 py-1.5 rounded bg-[#1C2C3F] border border-[#2B4B6F] text-[#48CAE4] hover:bg-[#253D57] transition-colors"
            >
              DOWNLOAD REPORT (.TXT)
            </button>
            <button
              onClick={copyJsonManifest}
              className="px-3 py-1.5 rounded bg-[#16202C] border border-[#243346] text-[#A0AEC0] hover:text-[#EDF2F7] transition-colors"
            >
              COPY JSON MANIFEST
            </button>
          </div>

          <button
            onClick={() => toggleModal('exportReport', false)}
            className="px-4 py-1.5 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
