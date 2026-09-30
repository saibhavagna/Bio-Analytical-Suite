'use client';

import React, { useRef } from 'react';
import { useDocking } from '@/context/DockingContext';
import { DockingProtocol } from '@/types/docking';
import { ScientificTooltip } from '@/components/common/ScientificTooltip';

export const LeftWorkflowPanel: React.FC = () => {
  const {
    receptor,
    updateReceptor,
    prepareReceptor,
    bindingSite,
    updateBindingSite,
    autoDetectBindingSite,
    activeLigand,
    ligands,
    dockingProtocol,
    updateDockingProtocol,
    dockingRun,
    runDockingCalculation,
    toggleModal,
    importPdbFile,
    importSdfFile,
    pockets,
    selectedPocketId,
    applyPocketAsBindingSite,
    isSearchingPockets,
  } = useDocking();

  const pdbInputRef = useRef<HTMLInputElement>(null);
  const sdfInputRef = useRef<HTMLInputElement>(null);

  const handlePdbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      importPdbFile(e.target.files[0]);
    }
  };

  const handleSdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      importSdfFile(e.target.files[0]);
    }
  };

  return (
    <aside className="w-[320px] min-w-[320px] max-w-[320px] h-full bg-[#0D1117] border-r border-[#1C2532] flex flex-col overflow-y-auto custom-scrollbar select-none text-[#CBD5E0]">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={pdbInputRef}
        onChange={handlePdbChange}
        accept=".pdb,.ent"
        className="hidden"
      />
      <input
        type="file"
        ref={sdfInputRef}
        onChange={handleSdfChange}
        accept=".sdf,.mol,.mol2"
        className="hidden"
      />

      {/* Panel Title Bar */}
      <div className="p-3 border-b border-[#1C2532] flex items-center justify-between bg-[#111720]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-[#3B82C4]" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDF2F7]">
            DOCKING WORKFLOW
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            id="btn-workflow-open-sessions"
            onClick={() => toggleModal('projectManager', true)}
            className="flex items-center gap-1 text-[10px] font-mono text-[#48CAE4] hover:text-[#EDF2F7] bg-[#102236] hover:bg-[#16304C] px-2 py-0.5 rounded border border-[#193A5E] transition-colors cursor-pointer"
            title="Open Project & Session Manager (IndexedDB)"
          >
            <span>📁 SESSIONS</span>
          </button>
          <span className="text-[10px] font-mono text-[#63758A] bg-[#0A0E13] px-2 py-0.5 rounded border border-[#1A222D]">
            VINA 1.2.5
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-4 flex-1">
        {/* ================= STEP 01: RECEPTOR TARGET ================= */}
        <section className="bg-[#11161E] border border-[#1E2734] rounded-sm p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#48CAE4] font-bold">01</span>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-[#EDF2F7]">
                RECEPTOR TARGET
              </h3>
            </div>
            <button
              id="btn-upload-pdb"
              onClick={() => pdbInputRef.current?.click()}
              className="text-[10px] font-mono text-[#7395B8] hover:text-[#EDF2F7] underline underline-offset-2"
            >
              LOAD PDB
            </button>
          </div>

          {/* Active Receptor Details */}
          <div className="bg-[#0B0F14] p-2 rounded border border-[#18212C] flex flex-col gap-1 text-[11px] font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#8C9BAE] font-semibold">{receptor.filename}</span>
              <span className="text-[#48CAE4]">CHAIN {receptor.chain}</span>
            </div>
            <div className="text-[10px] text-[#A0AEC0] truncate">{receptor.name}</div>
            <div className="flex items-center justify-between text-[10px] text-[#63758A] pt-0.5 border-t border-[#141C26]">
              <span>{receptor.atomCount.toLocaleString()} Atoms</span>
              <span>Res. {receptor.resolution} Å</span>
              <span>{receptor.residuesCount} Residues</span>
            </div>
          </div>

          {/* Quick Target Switcher Presets */}
          <div className="flex items-center gap-1.5 text-[9px] font-mono">
            <span className="text-[#63758A]">TARGET:</span>
            <button
              type="button"
              onClick={() => {
                updateReceptor({
                  filename: '5EW8.pdb',
                  name: 'Kinase Catalytic Domain (5EW8)',
                  atomCount: 2840,
                  residuesCount: 345,
                  resolution: 1.85,
                  chain: 'A',
                  preparationStatus: 'prepared',
                });
              }}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                receptor.filename === '5EW8.pdb'
                  ? 'bg-[#1C2C3F] text-[#48CAE4] border-[#2C496A]'
                  : 'bg-[#0E131A] text-[#7395B8] border-[#1A232E] hover:text-[#EDF2F7]'
              }`}
            >
              5EW8 (Kinase)
            </button>
            <button
              type="button"
              onClick={() => {
                updateReceptor({
                  filename: '6LU7.pdb',
                  name: 'SARS-CoV-2 Main Protease (6LU7)',
                  atomCount: 2614,
                  residuesCount: 306,
                  resolution: 2.16,
                  chain: 'A',
                  preparationStatus: 'prepared',
                });
              }}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                receptor.filename === '6LU7.pdb'
                  ? 'bg-[#1C2C3F] text-[#48CAE4] border-[#2C496A]'
                  : 'bg-[#0E131A] text-[#7395B8] border-[#1A232E] hover:text-[#EDF2F7]'
              }`}
            >
              6LU7 (Mpro)
            </button>
          </div>

          {/* Preparation Options */}
          <div className="flex flex-col gap-1.5 text-[10px] font-mono text-[#8C9BAE] pt-1">
            <label className="flex items-center gap-2 cursor-pointer hover:text-[#EDF2F7]">
              <input
                type="checkbox"
                checked={receptor.preparationOptions.addPolarHydrogens}
                onChange={(e) =>
                  updateReceptor({
                    preparationOptions: {
                      ...receptor.preparationOptions,
                      addPolarHydrogens: e.target.checked,
                    },
                  })
                }
                className="w-3.5 h-3.5 rounded bg-[#0B0F14] border-[#2A394A] text-[#3B82C4] focus:ring-0"
              />
              <span>Add polar hydrogens (Kollman)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-[#EDF2F7]">
              <input
                type="checkbox"
                checked={receptor.preparationOptions.assignGasteigerCharges}
                onChange={(e) =>
                  updateReceptor({
                    preparationOptions: {
                      ...receptor.preparationOptions,
                      assignGasteigerCharges: e.target.checked,
                    },
                  })
                }
                className="w-3.5 h-3.5 rounded bg-[#0B0F14] border-[#2A394A] text-[#3B82C4] focus:ring-0"
              />
              <span>Assign Gasteiger-Marsili charges</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-[#EDF2F7]">
              <input
                type="checkbox"
                checked={receptor.preparationOptions.removeCrystalWaters}
                onChange={(e) =>
                  updateReceptor({
                    preparationOptions: {
                      ...receptor.preparationOptions,
                      removeCrystalWaters: e.target.checked,
                    },
                  })
                }
                className="w-3.5 h-3.5 rounded bg-[#0B0F14] border-[#2A394A] text-[#3B82C4] focus:ring-0"
              />
              <span>Remove crystallographic waters</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-[#EDF2F7]">
              <input
                type="checkbox"
                checked={receptor.preparationOptions.detectCofactors}
                onChange={(e) =>
                  updateReceptor({
                    preparationOptions: {
                      ...receptor.preparationOptions,
                      detectCofactors: e.target.checked,
                    },
                  })
                }
                className="w-3.5 h-3.5 rounded bg-[#0B0F14] border-[#2A394A] text-[#3B82C4] focus:ring-0"
              />
              <span>Retain structural zinc / cofactors</span>
            </label>
          </div>

          {/* Prepare Receptor Button */}
          <button
            id="btn-prepare-receptor"
            onClick={prepareReceptor}
            disabled={receptor.preparationStatus === 'preparing'}
            className={`w-full py-1.5 px-3 rounded text-[11px] font-mono font-medium transition-colors flex items-center justify-center gap-2 ${
              receptor.preparationStatus === 'prepared'
                ? 'bg-[#153428] text-[#4FAE7B] border border-[#216147] hover:bg-[#1a4233]'
                : receptor.preparationStatus === 'preparing'
                ? 'bg-[#1B2838] text-[#48CAE4] border border-[#2D4560] cursor-wait'
                : 'bg-[#1A2634] text-[#EDF2F7] border border-[#2E4158] hover:bg-[#223346]'
            }`}
          >
            {receptor.preparationStatus === 'preparing' ? (
              <>
                <span className="w-2.5 h-2.5 border-2 border-t-transparent border-[#48CAE4] rounded-full animate-spin" />
                <span>PREPARING ({receptor.progress}%)...</span>
              </>
            ) : receptor.preparationStatus === 'prepared' ? (
              <>
                <span>✓ RECEPTOR PREPARED (PDBQT)</span>
              </>
            ) : (
              <span>PREPARE RECEPTOR (PDBQT)</span>
            )}
          </button>
        </section>

        {/* ================= STEP 02: BINDING SITE & GRID BOX ================= */}
        <section className="bg-[#11161E] border border-[#1E2734] rounded-sm p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#48CAE4] font-bold">02</span>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-[#EDF2F7]">
                GRID BOX (SEARCH SPACE)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-pocket-search-trigger"
                onClick={() => toggleModal('pocketSearch', true)}
                className="text-[10px] font-mono text-[#48CAE4] hover:underline flex items-center gap-1"
                title="Perform automated 3D grid pocket search across protein surface"
              >
                <span>POCKET SEARCH</span>
              </button>
              <span className="text-[#3A4A5E]">|</span>
              <button
                id="btn-autodetect-site"
                onClick={autoDetectBindingSite}
                className="text-[10px] font-mono text-[#E9C46A] hover:underline"
                title="Target top predicted pocket"
              >
                AUTO
              </button>
            </div>
          </div>

          {/* Suggested Pockets Quick Target Selector */}
          {pockets.length > 0 && (
            <div className="bg-[#0A0E14] p-2 rounded border border-[#1A2636] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[9px] font-mono text-[#64748B]">
                <span className="uppercase tracking-wider">SUGGESTED SURFACE POCKETS:</span>
                <button
                  onClick={() => toggleModal('pocketSearch', true)}
                  className="text-[#48CAE4] hover:underline"
                >
                  Configure Grid Scan ({pockets.length}) →
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {pockets.slice(0, 3).map((pkt) => {
                  const isCurrent =
                    Math.abs(bindingSite.center.x - pkt.center.x) < 1 &&
                    Math.abs(bindingSite.center.y - pkt.center.y) < 1 &&
                    Math.abs(bindingSite.center.z - pkt.center.z) < 1;

                  return (
                    <div
                      key={pkt.id}
                      onClick={() => applyPocketAsBindingSite(pkt)}
                      className={`px-2 py-1.5 rounded flex items-center justify-between text-[10px] font-mono cursor-pointer transition-colors border ${
                        isCurrent
                          ? 'bg-[#15273C] border-[#2563EB] text-[#F1F5F9]'
                          : 'bg-[#0E141E] border-[#162232] text-[#94A3B8] hover:bg-[#121A26] hover:text-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`font-bold ${isCurrent ? 'text-[#48CAE4]' : 'text-[#64748B]'}`}>
                          #{pkt.rank}
                        </span>
                        <span className="truncate">{pkt.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-1 py-0.2 rounded text-[9px] ${
                            pkt.druggabilityScore >= 0.75
                              ? 'bg-[#112C1E] text-[#4FAE7B]'
                              : 'bg-[#1E2516] text-[#E9C46A]'
                          }`}
                        >
                          D: {pkt.druggabilityScore.toFixed(2)}
                        </span>
                        {isCurrent ? (
                          <span className="text-[9px] text-[#48CAE4] font-bold">ACTIVE</span>
                        ) : (
                          <span className="text-[9px] text-[#475569] hover:text-[#94A3B8]">Target</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grid Center Inputs */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#7395B8]">GRID CENTER (Å):</span>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex items-center bg-[#0B0F14] border border-[#1A232E] rounded px-1.5 py-1">
                <span className="text-[10px] font-mono text-[#63758A] mr-1">X</span>
                <input
                  type="number"
                  step="0.1"
                  value={bindingSite.center.x}
                  onChange={(e) =>
                    updateBindingSite({
                      center: { ...bindingSite.center, x: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-transparent text-[11px] font-mono text-[#EDF2F7] focus:outline-none"
                />
              </div>

              <div className="flex items-center bg-[#0B0F14] border border-[#1A232E] rounded px-1.5 py-1">
                <span className="text-[10px] font-mono text-[#63758A] mr-1">Y</span>
                <input
                  type="number"
                  step="0.1"
                  value={bindingSite.center.y}
                  onChange={(e) =>
                    updateBindingSite({
                      center: { ...bindingSite.center, y: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-transparent text-[11px] font-mono text-[#EDF2F7] focus:outline-none"
                />
              </div>

              <div className="flex items-center bg-[#0B0F14] border border-[#1A232E] rounded px-1.5 py-1">
                <span className="text-[10px] font-mono text-[#63758A] mr-1">Z</span>
                <input
                  type="number"
                  step="0.1"
                  value={bindingSite.center.z}
                  onChange={(e) =>
                    updateBindingSite({
                      center: { ...bindingSite.center, z: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-transparent text-[11px] font-mono text-[#EDF2F7] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grid Size Inputs */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#7395B8]">GRID DIMENSIONS (Å):</span>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex items-center bg-[#0B0F14] border border-[#1A232E] rounded px-1.5 py-1">
                <span className="text-[10px] font-mono text-[#63758A] mr-1">X</span>
                <input
                  type="number"
                  step="0.5"
                  value={bindingSite.size.x}
                  onChange={(e) =>
                    updateBindingSite({
                      size: { ...bindingSite.size, x: parseFloat(e.target.value) || 10 },
                    })
                  }
                  className="w-full bg-transparent text-[11px] font-mono text-[#EDF2F7] focus:outline-none"
                />
              </div>

              <div className="flex items-center bg-[#0B0F14] border border-[#1A232E] rounded px-1.5 py-1">
                <span className="text-[10px] font-mono text-[#63758A] mr-1">Y</span>
                <input
                  type="number"
                  step="0.5"
                  value={bindingSite.size.y}
                  onChange={(e) =>
                    updateBindingSite({
                      size: { ...bindingSite.size, y: parseFloat(e.target.value) || 10 },
                    })
                  }
                  className="w-full bg-transparent text-[11px] font-mono text-[#EDF2F7] focus:outline-none"
                />
              </div>

              <div className="flex items-center bg-[#0B0F14] border border-[#1A232E] rounded px-1.5 py-1">
                <span className="text-[10px] font-mono text-[#63758A] mr-1">Z</span>
                <input
                  type="number"
                  step="0.5"
                  value={bindingSite.size.z}
                  onChange={(e) =>
                    updateBindingSite({
                      size: { ...bindingSite.size, z: parseFloat(e.target.value) || 10 },
                    })
                  }
                  className="w-full bg-transparent text-[11px] font-mono text-[#EDF2F7] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Volume and Visibility */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#63758A] pt-1 border-t border-[#18212C]">
            <span>Vol: {bindingSite.volume.toLocaleString()} Å³</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#8C9BAE] hover:text-[#EDF2F7]">
              <input
                type="checkbox"
                checked={bindingSite.showGrid}
                onChange={(e) => updateBindingSite({ showGrid: e.target.checked })}
                className="w-3 h-3 rounded bg-[#0B0F14] border-[#2A394A] text-[#48CAE4] focus:ring-0"
              />
              <span>Render Box</span>
            </label>
          </div>
        </section>

        {/* ================= STEP 03: LIGAND SELECTION ================= */}
        <section className="bg-[#11161E] border border-[#1E2734] rounded-sm p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#48CAE4] font-bold">03</span>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-[#EDF2F7]">
                LIGAND CANDIDATE
              </h3>
            </div>
            <button
              id="btn-open-library"
              onClick={() => toggleModal('ligandLibrary', true)}
              className="text-[10px] font-mono text-[#48CAE4] hover:underline"
            >
              LIBRARY ({ligands.length})
            </button>
          </div>

          {/* Active Ligand Card */}
          <div className="bg-[#0B0F14] p-2.5 rounded border border-[#18212C] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[#E9C46A]">
                {activeLigand.id}
              </span>
              <span className="text-[10px] font-mono text-[#4FAE7B] bg-[#122A1E] px-1.5 py-0.5 rounded border border-[#1E4D34]">
                {activeLigand.status}
              </span>
            </div>
            <p className="text-[11px] font-sans text-[#EDF2F7] line-clamp-1">
              {activeLigand.name}
            </p>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-[#7395B8] pt-1 border-t border-[#141B24]">
              <ScientificTooltip metricId="molecularWeight" position="right">
                <span className="hover:text-[#48CAE4] cursor-help">MW: {activeLigand.molecularWeight} g/mol</span>
              </ScientificTooltip>
              <ScientificTooltip metricId="logP" position="left">
                <span className="hover:text-[#48CAE4] cursor-help">LogP: {activeLigand.logP}</span>
              </ScientificTooltip>
              <ScientificTooltip metricId="rotatableBonds" position="right">
                <span className="hover:text-[#48CAE4] cursor-help">RotB: {activeLigand.rotatableBonds}</span>
              </ScientificTooltip>
              <ScientificTooltip metricId="tpsa" position="left">
                <span className="hover:text-[#48CAE4] cursor-help">TPSA: {activeLigand.tpsa} Å²</span>
              </ScientificTooltip>
            </div>
          </div>

          {/* Actions: Import SDF or SMILES */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              id="btn-import-sdf"
              onClick={() => sdfInputRef.current?.click()}
              className="py-1 px-2 text-[10px] font-mono rounded bg-[#131B24] border border-[#233142] text-[#8C9BAE] hover:text-[#EDF2F7] hover:border-[#384E68] transition-colors"
            >
              + IMPORT SDF
            </button>
            <button
              id="btn-import-smiles"
              onClick={() => toggleModal('smilesInput', true)}
              className="py-1 px-2 text-[10px] font-mono rounded bg-[#131B24] border border-[#233142] text-[#8C9BAE] hover:text-[#EDF2F7] hover:border-[#384E68] transition-colors"
            >
              + DRAW / SMILES
            </button>
          </div>
        </section>

        {/* ================= STEP 04: DOCKING PROTOCOL ================= */}
        <section className="bg-[#11161E] border border-[#1E2734] rounded-sm p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#48CAE4] font-bold">04</span>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-[#EDF2F7]">
                PROTOCOL & ENGINE
              </h3>
            </div>
            <span className="text-[9px] font-mono text-[#63758A]">CUDA ACCELERATED</span>
          </div>

          {/* Engine Selector */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#7395B8]">CALCULATION ENGINE:</span>
            <select
              value={dockingProtocol.engine}
              onChange={(e) =>
                updateDockingProtocol({ engine: e.target.value as DockingProtocol['engine'] })
              }
              className="bg-[#0B0F14] border border-[#1A232E] text-[11px] font-mono text-[#EDF2F7] rounded p-1.5 focus:outline-none"
            >
              <option value="AutoDock Vina 1.2.5">AutoDock Vina 1.2.5 (Empirical ΔG)</option>
              <option value="GOLD v5.8">GOLD v5.8 (ChemScore)</option>
              <option value="Glide XP">Glide XP (Extra Precision)</option>
            </select>
          </div>

          {/* Exhaustiveness Pills */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#7395B8]">SEARCH EXHAUSTIVENESS:</span>
              <ScientificTooltip metricId="exhaustiveness" position="right" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[8, 32, 64].map((val) => (
                <button
                  key={val}
                  id={`btn-exhaustiveness-${val}`}
                  onClick={() => updateDockingProtocol({ exhaustiveness: val })}
                  className={`py-1 text-[10px] font-mono rounded border transition-colors ${
                    dockingProtocol.exhaustiveness === val
                      ? 'bg-[#1C2F43] border-[#48CAE4] text-[#48CAE4] font-semibold'
                      : 'bg-[#0B0F14] border-[#1C2532] text-[#8C9BAE] hover:text-[#EDF2F7]'
                  }`}
                >
                  {val === 8 ? '8 (Fast)' : val === 32 ? '32 (Std)' : '64 (Deep)'}
                </button>
              ))}
            </div>
          </div>

          {/* Max Poses & Energy Cutoff */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[#63758A]">MAX POSES:</span>
                <ScientificTooltip metricId="maxPoses" position="top" />
              </div>
              <input
                type="number"
                min="1"
                max="20"
                value={dockingProtocol.maxPoses}
                onChange={(e) =>
                  updateDockingProtocol({ maxPoses: parseInt(e.target.value) || 10 })
                }
                className="w-full bg-[#0B0F14] border border-[#1A232E] rounded px-1.5 py-1 text-[11px] text-[#EDF2F7] mt-0.5"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[#63758A]">CUTOFF (kcal/mol):</span>
                <ScientificTooltip metricId="energyCutoff" position="top" />
              </div>
              <input
                type="number"
                step="0.5"
                value={dockingProtocol.energyCutoff}
                onChange={(e) =>
                  updateDockingProtocol({ energyCutoff: parseFloat(e.target.value) || 3.0 })
                }
                className="w-full bg-[#0B0F14] border border-[#1A232E] rounded px-1.5 py-1 text-[11px] text-[#EDF2F7] mt-0.5"
              />
            </div>
          </div>
        </section>

        {/* ================= PRIMARY ACTION: RUN DOCKING ================= */}
        <div className="flex flex-col gap-2 pt-1 pb-4">
          <button
            id="btn-run-docking"
            onClick={runDockingCalculation}
            disabled={dockingRun.status !== 'idle' && dockingRun.status !== 'completed'}
            className={`w-full py-2.5 px-4 rounded text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md flex flex-col items-center justify-center gap-1 ${
              dockingRun.status !== 'idle' && dockingRun.status !== 'completed'
                ? 'bg-[#1C2D3D] text-[#48CAE4] border border-[#315779] cursor-wait'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#3B82F6]'
            }`}
          >
            {dockingRun.status !== 'idle' && dockingRun.status !== 'completed' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-t-transparent border-[#48CAE4] rounded-full animate-spin" />
                  <span>DOCKING IN PROGRESS ({dockingRun.progress}%)</span>
                </div>
                <span className="text-[10px] font-normal text-[#A0AEC0] normal-case">
                  {dockingRun.currentPhaseText}
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span>⚡ RUN DOCKING (VINA)</span>
                </div>
                <span className="text-[9px] font-normal text-[#BFDBFE] tracking-normal">
                  Grid 22.5 Å³ • {ligands.length} Candidates • Seed 198402
                </span>
              </>
            )}
          </button>

          {/* Progress Bar when running */}
          {dockingRun.status !== 'idle' && dockingRun.status !== 'completed' && (
            <div className="w-full h-1.5 bg-[#0B0F14] rounded-full overflow-hidden border border-[#1F2B3B]">
              <div
                className="h-full bg-gradient-to-r from-[#2563EB] via-[#48CAE4] to-[#4FAE7B] transition-all duration-300"
                style={{ width: `${dockingRun.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
