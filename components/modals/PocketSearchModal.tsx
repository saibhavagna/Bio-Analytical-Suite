'use client';

import React, { useState, useEffect } from 'react';
import { useDocking } from '@/context/DockingContext';
import { BindingPocket, GridSearchParams } from '@/types/docking';
import {
  Target,
  Search,
  Crosshair,
  Sliders,
  Layers,
  Sparkles,
  Check,
  Download,
  Info,
  X,
  Activity,
  Cpu,
  RefreshCw,
  Box,
  Eye,
} from 'lucide-react';

export const PocketSearchModal: React.FC = () => {
  const {
    ui,
    setUI,
    toggleModal,
    receptor,
    pockets,
    selectedPocketId,
    selectedPocket,
    selectPocket,
    isSearchingPockets,
    searchProgress,
    searchPhaseText,
    searchParams,
    searchStats,
    setSearchParams,
    runGridPocketSearch,
    applyPocketAsBindingSite,
    showToast,
  } = useDocking();

  const [copiedCoords, setCopiedCoords] = useState(false);

  if (!ui.modals.pocketSearch) return null;

  const handleStartSearch = async () => {
    await runGridPocketSearch(searchParams);
  };

  const handleApplyPocket = (pocket: BindingPocket) => {
    applyPocketAsBindingSite(pocket);
    toggleModal('pocketSearch', false);
  };

  const handleCopyCoords = (pocket: BindingPocket) => {
    const text = `Center: [${pocket.center.x.toFixed(2)}, ${pocket.center.y.toFixed(2)}, ${pocket.center.z.toFixed(2)}] Å | Size: [${pocket.suggestedDimensions.x}, ${pocket.suggestedDimensions.y}, ${pocket.suggestedDimensions.z}] Å | Pocket: ${pocket.name}`;
    navigator.clipboard?.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
    showToast('Pocket coordinates copied to clipboard.');
  };

  const handleExportPocketJson = (pocket: BindingPocket) => {
    const data = {
      targetReceptor: receptor.filename,
      pocketId: pocket.id,
      rank: pocket.rank,
      name: pocket.name,
      type: pocket.type,
      druggabilityScore: pocket.druggabilityScore,
      volumeA3: pocket.volume,
      surfaceAreaA2: pocket.surfaceArea,
      burialRatioPercent: pocket.burialRatio,
      hydrophobicRatioPercent: pocket.hydrophobicRatio,
      recommendedGridBox: {
        center: pocket.center,
        dimensions: pocket.suggestedDimensions,
        volume: pocket.suggestedDimensions.x * pocket.suggestedDimensions.y * pocket.suggestedDimensions.z,
      },
      liningResidues: pocket.liningResidues,
      keyInteractions: pocket.keyInteractions,
      suggestedLigandTypes: pocket.suggestedLigandTypes,
      probePointsCount: pocket.probePointsCount,
      probePoints: pocket.probePoints,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${receptor.filename.replace('.pdb', '')}_${pocket.id}_binding_pocket.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported pocket specification: ${pocket.name}`);
  };

  const currentPocket = selectedPocket || pockets[0];

  const getDscoreBadge = (dscore: number) => {
    if (dscore >= 0.75) {
      return {
        label: 'High Druggability',
        badgeClass: 'bg-[#132E22] text-[#4FAE7B] border-[#225C3E]',
        barClass: 'bg-[#4FAE7B]',
      };
    }
    if (dscore >= 0.6) {
      return {
        label: 'Moderate Druggability',
        badgeClass: 'bg-[#152B3C] text-[#48CAE4] border-[#20496B]',
        barClass: 'bg-[#48CAE4]',
      };
    }
    return {
      label: 'Challenging / Shallow',
      badgeClass: 'bg-[#2D2415] text-[#E9C46A] border-[#5A4520]',
      barClass: 'bg-[#E9C46A]',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs select-none p-3 sm:p-4">
      <div className="w-full max-w-5xl max-h-[92vh] bg-[#0A0E14] border border-[#1E293B] rounded-lg shadow-2xl flex flex-col overflow-hidden text-[#CBD5E1]">
        {/* Header */}
        <div className="px-4 py-3 bg-[#0F1622] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-[#2563EB] to-[#48CAE4] flex items-center justify-center text-white shadow-xs">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold tracking-wide text-[#F1F5F9] uppercase">
                  Protein Surface Grid Pocket Detector
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A2638] text-[#48CAE4] border border-[#263C59]">
                  {receptor.filename} ({receptor.residuesCount} residues)
                </span>
              </div>
              <p className="text-[11px] font-sans text-[#78909C]">
                Grid-based solvent surface scanning, ray-cast concavity evaluation & druggability scoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-close-pocket-modal"
              onClick={() => toggleModal('pocketSearch', false)}
              className="p-1.5 rounded text-[#78909C] hover:text-[#F1F5F9] hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="p-3 bg-[#0D131D] border-b border-[#182333] flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Algorithm Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#48CAE4]" />
                ALGORITHM:
              </span>
              <div className="flex items-center bg-[#070A0E] p-0.5 rounded border border-[#1E293B]">
                {(['fpocket Alpha-Spheres', 'LIGSITE Ray-Tracing', 'AutoLigand Potential Field'] as const).map(
                  (algo) => (
                    <button
                      key={algo}
                      onClick={() => setSearchParams({ algorithm: algo })}
                      className={`px-2 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                        searchParams.algorithm === algo
                          ? 'bg-[#1E3A5F] text-[#48CAE4] font-medium'
                          : 'text-[#64748B] hover:text-[#94A3B8]'
                      }`}
                    >
                      {algo.split(' ')[0]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Grid Spacing / Probe Resolution */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                <Sliders className="w-3 h-3 text-[#E9C46A]" />
                PROBE STEP:
              </span>
              <div className="flex items-center bg-[#070A0E] p-0.5 rounded border border-[#1E293B]">
                {[
                  { label: '0.6 Å (Fine)', val: 0.6 },
                  { label: '0.8 Å (Std)', val: 0.8 },
                  { label: '1.2 Å (Fast)', val: 1.2 },
                ].map((step) => (
                  <button
                    key={step.val}
                    onClick={() => setSearchParams({ gridSpacing: step.val })}
                    className={`px-2 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                      searchParams.gridSpacing === step.val
                        ? 'bg-[#2E2E18] text-[#E9C46A] font-medium border border-[#484824]'
                        : 'text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Probe Radius */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#64748B]">PROBE RADIUS:</span>
              <div className="flex items-center bg-[#070A0E] p-0.5 rounded border border-[#1E293B]">
                {[
                  { label: '1.2 Å', val: 1.2 },
                  { label: '1.4 Å (H₂O)', val: 1.4 },
                  { label: '1.8 Å (Apolar)', val: 1.8 },
                ].map((pr) => (
                  <button
                    key={pr.val}
                    onClick={() => setSearchParams({ probeRadius: pr.val })}
                    className={`px-2 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                      searchParams.probeRadius === pr.val
                        ? 'bg-[#18342B] text-[#4FAE7B] font-medium border border-[#245442]'
                        : 'text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Run Search Button */}
            <button
              id="btn-execute-grid-search"
              onClick={handleStartSearch}
              disabled={isSearchingPockets}
              className={`px-3.5 py-1.5 rounded text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                isSearchingPockets
                  ? 'bg-[#1E2E42] text-[#48CAE4] border border-[#2B4868] cursor-wait'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#3B82F6]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSearchingPockets ? 'animate-spin text-[#48CAE4]' : ''}`} />
              <span>{isSearchingPockets ? 'SCANNING SURFACE...' : 'RUN SURFACE GRID SCAN'}</span>
            </button>
          </div>

          {/* Search Progress Status (when active) */}
          {isSearchingPockets && (
            <div className="w-full bg-[#070A0E] p-2 rounded border border-[#22374E] flex flex-col gap-1.5 animate-pulse">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#48CAE4]">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  {searchPhaseText}
                </span>
                <span className="font-bold">{searchProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#121E2C] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#48CAE4] transition-all duration-300"
                  style={{ width: `${searchProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Telemetry Stats Bar */}
          {searchStats && !isSearchingPockets && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#64748B] pt-1 border-t border-[#141E2C]">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#48CAE4]" />
                Grid Points: <strong className="text-[#CBD5E1]">{searchStats.totalGridPoints.toLocaleString()}</strong>
              </span>
              <span>
                Surface Probes:{' '}
                <strong className="text-[#CBD5E1]">{searchStats.proteinSurfaceProbes.toLocaleString()}</strong>
              </span>
              <span>
                Cavities Delineated:{' '}
                <strong className="text-[#4FAE7B]">{searchStats.cavityClustersIdentified} Pockets</strong>
              </span>
              <span>
                Calculation Time: <strong className="text-[#CBD5E1]">{searchStats.executionDurationMs} ms</strong>
              </span>
              <span className="text-[#475569]">Timestamp: {searchStats.timestamp}</span>
            </div>
          )}
        </div>

        {/* Main Content: Split Master-Detail */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#182333]">
          {/* Left Column: Ranked Pockets List */}
          <div className="lg:col-span-5 p-3 overflow-y-auto flex flex-col gap-2.5 bg-[#080C12]">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                IDENTIFIED SURFACE POCKETS ({pockets.length})
              </span>
              <span className="text-[10px] font-mono text-[#48CAE4]">Ranked by Druggability (Dscore)</span>
            </div>

            <div className="flex flex-col gap-2">
              {pockets.map((pkt) => {
                const isSelected = pkt.id === currentPocket?.id;
                const dscoreInfo = getDscoreBadge(pkt.druggabilityScore);

                return (
                  <div
                    key={pkt.id}
                    onClick={() => selectPocket(pkt.id)}
                    className={`p-3 rounded border transition-all cursor-pointer flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-[#111A27] border-[#3B82F6] shadow-md shadow-[#2563eb10]'
                        : 'bg-[#0D131C] border-[#182333] hover:border-[#27384E] hover:bg-[#101723]'
                    }`}
                  >
                    {/* Top Row: Rank, Title, and Druggability */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                            isSelected ? 'bg-[#2563EB] text-white' : 'bg-[#182333] text-[#94A3B8]'
                          }`}
                        >
                          #{pkt.rank}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-mono font-semibold text-[#F1F5F9] truncate">{pkt.name}</h4>
                          <span className="text-[10px] font-mono text-[#64748B]">{pkt.type}</span>
                        </div>
                      </div>

                      {/* Dscore Badge */}
                      <div
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold shrink-0 border ${dscoreInfo.badgeClass}`}
                      >
                        Dscore: {pkt.druggabilityScore.toFixed(2)}
                      </div>
                    </div>

                    {/* Metrics Bar */}
                    <div className="grid grid-cols-4 gap-1 text-[10px] font-mono bg-[#070B10] p-1.5 rounded border border-[#141E2B] text-[#78909C]">
                      <div>
                        <span className="text-[#475569] block">VOL</span>
                        <span className="text-[#E2E8F0] font-semibold">{pkt.volume} Å³</span>
                      </div>
                      <div>
                        <span className="text-[#475569] block">BURIAL</span>
                        <span className="text-[#E2E8F0] font-semibold">{pkt.burialRatio}%</span>
                      </div>
                      <div>
                        <span className="text-[#475569] block">HYDROPH</span>
                        <span className="text-[#E2E8F0] font-semibold">{pkt.hydrophobicRatio}%</span>
                      </div>
                      <div>
                        <span className="text-[#475569] block">PROBES</span>
                        <span className="text-[#48CAE4] font-semibold">{pkt.probePointsCount}</span>
                      </div>
                    </div>

                    {/* Lining Residues Preview */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[9px] font-mono text-[#64748B]">RESIDUES:</span>
                      {pkt.liningResidues.slice(0, 5).map((res) => (
                        <span
                          key={res}
                          className="text-[9px] font-mono bg-[#141E2C] text-[#94A3B8] px-1 py-0.2 rounded border border-[#1E2D40]"
                        >
                          {res}
                        </span>
                      ))}
                      {pkt.liningResidues.length > 5 && (
                        <span className="text-[9px] font-mono text-[#64748B]">
                          +{pkt.liningResidues.length - 5} more
                        </span>
                      )}
                    </div>

                    {/* Action button inside card */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#141D29]">
                      <span className="text-[9px] font-mono text-[#475569]">
                        Target Box: {pkt.suggestedDimensions.x}×{pkt.suggestedDimensions.y}×{pkt.suggestedDimensions.z} Å
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyPocket(pkt);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#132A1E] text-[#4FAE7B] border border-[#205238] hover:bg-[#1a3828] transition-colors cursor-pointer"
                        title="Set this pocket as active docking search space"
                      >
                        Target This Pocket
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Pocket Detailed Inspector */}
          {currentPocket ? (
            <div className="lg:col-span-7 p-4 overflow-y-auto flex flex-col gap-3.5 bg-[#0A0F16]">
              {/* Pocket Title Header & Target Action */}
              <div className="flex flex-wrap items-start justify-between gap-3 p-3 bg-[#0F1722] rounded border border-[#1E2C3D]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#1D3557] text-[#48CAE4] text-[10px] font-mono font-bold border border-[#2E5587]">
                      POCKET #{currentPocket.rank}
                    </span>
                    <h3 className="text-sm font-mono font-bold text-[#F8FAFC]">{currentPocket.name}</h3>
                  </div>
                  <p className="text-xs font-sans text-[#94A3B8] mt-1 leading-relaxed">{currentPocket.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="btn-apply-pocket-grid"
                    onClick={() => handleApplyPocket(currentPocket)}
                    className="px-3 py-1.5 rounded text-xs font-mono font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#3B82F6] flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5 text-[#48CAE4]" />
                    <span>TARGET AS DOCKING BOX</span>
                  </button>
                </div>
              </div>

              {/* 3D Docking Search Space Recommendation */}
              <div className="bg-[#0D141F] p-3 rounded border border-[#1A2636] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#48CAE4]" />
                    <span className="text-xs font-mono font-semibold uppercase text-[#E2E8F0]">
                      RECOMMENDED DOCKING GRID BOX
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCoords(currentPocket)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono text-[#94A3B8] hover:text-white bg-[#15202E] border border-[#223348] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCoords ? <Check className="w-3 h-3 text-[#4FAE7B]" /> : <Crosshair className="w-3 h-3" />}
                      <span>{copiedCoords ? 'COPIED' : 'COPY SPECS'}</span>
                    </button>
                    <button
                      onClick={() => handleExportPocketJson(currentPocket)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono text-[#94A3B8] hover:text-white bg-[#15202E] border border-[#223348] flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>EXPORT JSON</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                  <div className="bg-[#080C12] p-2 rounded border border-[#16202D]">
                    <span className="text-[10px] text-[#64748B] block">GRID CENTROID (Å)</span>
                    <span className="text-[#48CAE4] font-semibold text-[11px]">
                      [{currentPocket.center.x.toFixed(2)}, {currentPocket.center.y.toFixed(2)},{' '}
                      {currentPocket.center.z.toFixed(2)}]
                    </span>
                  </div>

                  <div className="bg-[#080C12] p-2 rounded border border-[#16202D]">
                    <span className="text-[10px] text-[#64748B] block">DIMENSIONS (dx, dy, dz)</span>
                    <span className="text-[#E9C46A] font-semibold text-[11px]">
                      {currentPocket.suggestedDimensions.x} × {currentPocket.suggestedDimensions.y} ×{' '}
                      {currentPocket.suggestedDimensions.z} Å
                    </span>
                  </div>

                  <div className="bg-[#080C12] p-2 rounded border border-[#16202D]">
                    <span className="text-[10px] text-[#64748B] block">SEARCH VOLUME</span>
                    <span className="text-[#F1F5F9] font-semibold text-[11px]">
                      {(
                        currentPocket.suggestedDimensions.x *
                        currentPocket.suggestedDimensions.y *
                        currentPocket.suggestedDimensions.z
                      ).toLocaleString()}{' '}
                      Å³
                    </span>
                  </div>

                  <div className="bg-[#080C12] p-2 rounded border border-[#16202D]">
                    <span className="text-[10px] text-[#64748B] block">GRID SPACING</span>
                    <span className="text-[#4FAE7B] font-semibold text-[11px]">
                      {searchParams.gridSpacing.toFixed(2)} Å (Vina std)
                    </span>
                  </div>
                </div>
              </div>

              {/* Physicochemical Properties & Druggability Indices */}
              <div className="bg-[#0D141F] p-3 rounded border border-[#1A2636] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-[#E2E8F0] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E9C46A]" />
                    PHYSICOCHEMICAL CAVITY METRICS & DRUGGABILITY
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      getDscoreBadge(currentPocket.druggabilityScore).badgeClass
                    }`}
                  >
                    {getDscoreBadge(currentPocket.druggabilityScore).label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="bg-[#080C12] p-2 rounded border border-[#16202D]">
                    <span className="text-[10px] text-[#64748B] block">CAVITY VOLUME</span>
                    <span className="text-[#E2E8F0] font-bold text-sm">{currentPocket.volume} Å³</span>
                    <span className="text-[9px] text-[#64748B] block">Surface: {currentPocket.surfaceArea} Å²</span>
                  </div>

                  <div className="bg-[#080C12] p-2 rounded border border-[#16202D]">
                    <span className="text-[10px] text-[#64748B] block">BURIAL / ENCLOSURE</span>
                    <span className="text-[#48CAE4] font-bold text-sm">{currentPocket.burialRatio}%</span>
                    <span className="text-[9px] text-[#64748B] block">Solvent inaccessible</span>
                  </div>

                  <div className="bg-[#080C12] p-2 rounded border border-[#16202D]">
                    <span className="text-[10px] text-[#64748B] block">HYDROPHOBIC RATIO</span>
                    <span className="text-[#4FAE7B] font-bold text-sm">{currentPocket.hydrophobicRatio}%</span>
                    <span className="text-[9px] text-[#64748B] block">Apolar contact patches</span>
                  </div>

                  <div className="bg-[#080C12] p-2 rounded border border-[#16202D]">
                    <span className="text-[10px] text-[#64748B] block">DRUGGABILITY (DSCORE)</span>
                    <span className="text-[#E9C46A] font-bold text-sm">
                      {currentPocket.druggabilityScore.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-[#64748B] block">fpocket model index</span>
                  </div>
                </div>

                {/* Progress Visualizer for Druggability Component */}
                <div className="bg-[#080C12] p-2.5 rounded border border-[#16202D] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#78909C]">
                    <span>Druggability Propensity:</span>
                    <span className="font-bold text-[#E2E8F0]">
                      {(currentPocket.druggabilityScore * 100).toFixed(1)}% / 100%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#141C26] rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${getDscoreBadge(currentPocket.druggabilityScore).barClass}`}
                      style={{ width: `${currentPocket.druggabilityScore * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-[#475569]">
                    Computed using calibrated empirical equation: Dscore = 0.23·log(Vol) + 0.52·Burial +
                    0.38·Hydrophobicity
                  </span>
                </div>
              </div>

              {/* Key Lining Residues Microenvironment */}
              <div className="bg-[#0D141F] p-3 rounded border border-[#1A2636] flex flex-col gap-2">
                <span className="text-xs font-mono font-semibold uppercase text-[#E2E8F0] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#48CAE4]" />
                  KEY LINING RESIDUES MICROENVIRONMENT ({currentPocket.liningResidues.length})
                </span>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentPocket.liningResidues.map((res) => (
                    <span
                      key={res}
                      className="px-2 py-1 rounded bg-[#131D2A] text-[#93C5FD] border border-[#213247] text-xs font-mono font-medium shadow-xs"
                    >
                      {res}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#16202D] flex flex-col gap-1 text-[11px] font-mono text-[#78909C]">
                  <span className="text-[#94A3B8] font-semibold">Critical Molecular Interactions:</span>
                  {currentPocket.keyInteractions.map((inter, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[#CBD5E1]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#48CAE4]" />
                      <span>{inter}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Chemotypes & Pharmacophore Strategy */}
              <div className="bg-[#0D141F] p-3 rounded border border-[#1A2636] flex flex-col gap-2">
                <span className="text-xs font-mono font-semibold uppercase text-[#E2E8F0] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#4FAE7B]" />
                  SUGGESTED LEAD CHEMOTYPES & PHARMACOPHORE
                </span>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentPocket.suggestedLigandTypes.map((type, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-[#122A1E] text-[#6EE7B7] border border-[#1B4D36] text-[11px] font-mono"
                    >
                      ✓ {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3D Viewer Cavity Highlight Toggle */}
              <div className="p-3 bg-[#0F1722] rounded border border-[#1E2C3D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#48CAE4]" />
                  <div>
                    <span className="text-xs font-mono font-medium text-[#E2E8F0]">
                      3D Viewport Cavity Probes Preview
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B] block">
                      Render {currentPocket.probePointsCount} pocket alpha-sphere probes in the 3D molecular stage
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setUI((prev) => ({ ...prev, showPocketCavity: !prev.showPocketCavity }))}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium border transition-colors cursor-pointer ${
                    ui.showPocketCavity
                      ? 'bg-[#153428] text-[#4FAE7B] border-[#216147]'
                      : 'bg-[#141C26] text-[#64748B] border-[#1E293B]'
                  }`}
                >
                  {ui.showPocketCavity ? '✓ PROBES ACTIVE' : 'PROBES HIDDEN'}
                </button>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-7 p-6 flex flex-col items-center justify-center text-center text-[#64748B] gap-2">
              <Search className="w-8 h-8 text-[#334155]" />
              <p className="text-xs font-mono">Select a detected binding pocket from the left to inspect properties.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#090D13] border-t border-[#182333] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-[#64748B]">
            <span>Active Target:</span>
            <strong className="text-[#CBD5E1]">{receptor.name}</strong>
            <span>•</span>
            <span>Current Grid Box:</span>
            <strong className="text-[#48CAE4]">{ui.showGridBox ? 'Visible' : 'Hidden'}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleModal('pocketSearch', false)}
              className="px-3 py-1 rounded text-xs font-mono text-[#94A3B8] hover:text-[#F1F5F9] bg-[#141C26] hover:bg-[#1E293B] border border-[#223144] transition-colors cursor-pointer"
            >
              Close
            </button>
            {currentPocket && (
              <button
                onClick={() => handleApplyPocket(currentPocket)}
                className="px-3 py-1 rounded text-xs font-mono font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white border border-[#3B82F6] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Target Pocket #{currentPocket.rank}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
