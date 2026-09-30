'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDocking } from '@/context/DockingContext';
import { DockingSession } from '@/types/docking';
import {
  FolderArchive,
  Save,
  Download,
  Upload,
  Trash2,
  Copy,
  Plus,
  Search,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  FileCode,
  Tag,
  Sliders,
  Play,
  Layers,
  Activity,
  AlertCircle,
} from 'lucide-react';
import {
  exportSessionToFile,
  getStorageFootprint,
  seedPresetSessionsIfEmpty,
} from '@/lib/indexedDbStorage';

export const ProjectManagerModal: React.FC = () => {
  const {
    ui,
    toggleModal,
    project,
    receptor,
    bindingSite,
    activeLigand,
    activePose,
    poses,
    ligands,
    dockingProtocol,
    currentSessionId,
    sessionsList,
    isLoadingSessions,
    loadSession,
    saveCurrentSessionToStorage,
    deleteSessionById,
    duplicateSessionById,
    refreshSessionsList,
    importSessionFromData,
    resetToDefaults,
    showToast,
    addLog,
  } = useDocking();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'BENCHMARK' | 'CUSTOM'>('ALL');
  const [isSavingDrawerOpen, setIsSavingDrawerOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Save form fields
  const [sessionName, setSessionName] = useState('');
  const [sessionDesc, setSessionDesc] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Lead-Opt', 'AutoDock Vina']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Storage stats
  const [storageInfo, setStorageInfo] = useState<{
    count: number;
    estimatedKb: number;
    engine: 'IndexedDB' | 'LocalStorage';
  }>({ count: 0, estimatedKb: 0, engine: 'IndexedDB' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update storage footprint on list change
  useEffect(() => {
    getStorageFootprint()
      .then(setStorageInfo)
      .catch(() => {});
  }, [sessionsList]);

  // Pre-fill save form when opening drawer
  const handleOpenSaveDrawer = () => {
    const bestScore = poses[0]?.deltaG ? ` (ΔG ${poses[0].deltaG.toFixed(1)} kcal/mol)` : '';
    setSessionName(`${receptor.name || 'Molecular Target'} — ${activeLigand.name || 'Ligand'}${bestScore}`);
    setSessionDesc(
      `Molecular docking run on ${receptor.filename} (Chain ${receptor.chain}) using ${dockingProtocol.engine}. Search volume: ${bindingSite.volume.toLocaleString()} Å³.`
    );
    setSelectedTags([
      receptor.filename.replace('.pdb', '').toUpperCase(),
      'AutoDock Vina',
      'Conformer Ensemble',
    ]);
    setIsSavingDrawerOpen(true);
  };

  // Keyboard shortcut ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ui.modals.projectManager) {
        toggleModal('projectManager', false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ui.modals.projectManager, toggleModal]);

  if (!ui.modals.projectManager) return null;

  // Filtered session list
  const filteredSessions = sessionsList.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query) ||
      s.metadata.targetPdb.toLowerCase().includes(query) ||
      s.metadata.targetName.toLowerCase().includes(query) ||
      s.tags?.some((t) => t.toLowerCase().includes(query));

    const matchesCategory =
      filterCategory === 'ALL' ||
      (filterCategory === 'BENCHMARK' && s.isPreset) ||
      (filterCategory === 'CUSTOM' && !s.isPreset);

    return matchesQuery && matchesCategory;
  });

  const benchmarkCount = sessionsList.filter((s) => s.isPreset).length;
  const customCount = sessionsList.filter((s) => !s.isPreset).length;

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) {
      showToast('Please enter a session name.');
      return;
    }
    await saveCurrentSessionToStorage(sessionName.trim(), sessionDesc.trim(), selectedTags);
    setIsSavingDrawerOpen(false);
  };

  const handleAddCustomTag = () => {
    const clean = customTagInput.trim();
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = await importSessionFromData(text);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast(`Imported session: "${imported.name}" into IndexedDB`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid session format';
      showToast(`Import failed: ${msg}`);
      addLog(`Failed to import session file: ${msg}`, 'ERROR');
    }
  };

  const handleRestorePresets = async () => {
    await seedPresetSessionsIfEmpty();
    await refreshSessionsList();
    showToast('Restored default benchmark sessions in IndexedDB.');
  };

  const formatSessionDate = (timestamp: number) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Session Record';
    }
  };

  return (
    <div
      id="project-manager-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs select-none p-4"
    >
      <div className="w-[1040px] max-w-[96vw] h-[90vh] max-h-[820px] bg-[#0A0E14] border border-[#233144] rounded-lg shadow-2xl flex flex-col overflow-hidden text-[#CBD5E0]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-[#0F151E] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#2563EB] to-[#48CAE4] flex items-center justify-center text-white shadow-sm">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-[#EDF2F7]">
                  PROJECT & SESSION MANAGER
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#11243B] text-[#48CAE4] border border-[#1B3A60] flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  {storageInfo.engine}: Persistent
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#7395B8]">
                Browser-local IndexedDB repository for molecular docking workflows, target receptors & conformer states
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#63758A] bg-[#070A0E] px-2.5 py-1 rounded border border-[#192330]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4FAE7B] animate-pulse" />
              <span>{storageInfo.count} Sessions Stored</span>
              <span className="text-[#3A4D62]">•</span>
              <span>~{storageInfo.estimatedKb} KB</span>
            </div>

            <button
              id="btn-close-project-manager"
              onClick={() => toggleModal('projectManager', false)}
              className="p-1.5 rounded text-[#8C9BAE] hover:text-[#EDF2F7] hover:bg-[#1C2838] transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Active Session Quick-Status Bar */}
        <div className="px-5 py-2.5 bg-[#0B1017] border-b border-[#182230] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-semibold uppercase text-[#48CAE4] bg-[#102336] px-1.5 py-0.5 rounded border border-[#193754]">
              ACTIVE WORKSPACE
            </span>
            <span className="text-[#EDF2F7] font-medium truncate">
              {project.name}
            </span>
            <span className="text-[#63758A]">/</span>
            <span className="text-[#E9C46A] truncate">{receptor.filename}</span>
            <span className="text-[#63758A]">/</span>
            <span className="text-[#4FAE7B]">
              Top ΔG: {poses[0]?.deltaG ? `${poses[0].deltaG.toFixed(2)} kcal/mol` : 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Overwrite / Save */}
            <button
              id="btn-quick-save-session"
              onClick={async () => {
                await saveCurrentSessionToStorage();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131F2E] hover:bg-[#1A2C42] border border-[#213752] text-[#48CAE4] text-[11px] font-mono transition-colors cursor-pointer"
              title="Save changes to currently selected session in IndexedDB"
            >
              <Save className="w-3 h-3" />
              <span>SAVE WORKSPACE</span>
            </button>

            {/* Save As New */}
            <button
              id="btn-open-save-drawer"
              onClick={() => {
                if (isSavingDrawerOpen) {
                  setIsSavingDrawerOpen(false);
                } else {
                  handleOpenSaveDrawer();
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono transition-colors cursor-pointer ${
                isSavingDrawerOpen
                  ? 'bg-[#1C2C3F] border-[#48CAE4] text-[#48CAE4]'
                  : 'bg-[#182330] hover:bg-[#203042] border-[#2B3E56] text-[#CBD5E0]'
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>SAVE AS NEW...</span>
            </button>

            {/* New Clean Workspace */}
            <button
              id="btn-reset-clean-workspace"
              onClick={() => {
                if (window.confirm('Reset current workspace to a fresh baseline state?')) {
                  resetToDefaults();
                  toggleModal('projectManager', false);
                }
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#10151D] hover:bg-[#161D27] border border-[#1A2432] text-[#7395B8] hover:text-[#EDF2F7] text-[11px] font-mono transition-colors cursor-pointer"
              title="Reset to clean baseline state"
            >
              <RefreshCw className="w-3 h-3" />
              <span>NEW</span>
            </button>
          </div>
        </div>

        {/* Save As New Session Form Drawer */}
        {isSavingDrawerOpen && (
          <div className="p-4 bg-[#0E1520] border-b border-[#233348] text-xs font-mono transition-all">
            <form onSubmit={handleSaveSubmit} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Save className="w-3.5 h-3.5 text-[#48CAE4]" />
                  <span className="font-semibold text-[#EDF2F7] uppercase tracking-wide">
                    SAVE CURRENT SESSION SNAPSHOT TO INDEXEDDB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSavingDrawerOpen(false)}
                  className="text-[#63758A] hover:text-[#EDF2F7]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Session Title */}
                <div>
                  <label className="text-[10px] text-[#8C9BAE] block mb-1">
                    SESSION TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g. Kinase 5EW8 — Staurosporine Optimization"
                    className="w-full px-3 py-1.5 rounded bg-[#090D14] border border-[#212E40] text-[#EDF2F7] text-xs focus:outline-none focus:border-[#48CAE4]"
                  />
                </div>

                {/* Session Tags */}
                <div>
                  <label className="text-[10px] text-[#8C9BAE] block mb-1">
                    TAGS & PHARMACOPHORE LABELS
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      placeholder="Add tag (press Enter)"
                      className="flex-1 px-3 py-1.5 rounded bg-[#090D14] border border-[#212E40] text-[#EDF2F7] text-xs focus:outline-none focus:border-[#48CAE4]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-2.5 py-1.5 rounded bg-[#1A2636] hover:bg-[#23354B] text-[#48CAE4] text-xs border border-[#2A3F59] cursor-pointer"
                    >
                      + ADD
                    </button>
                  </div>
                </div>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#121E2C] border border-[#1E334B] text-[#7395B8] text-[10px]"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-[#EDF2F7] ml-0.5 text-[#E63946]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] text-[#8C9BAE] block mb-1">
                  RESEARCH NOTES & EXPERIMENTAL HYPOTHESIS
                </label>
                <textarea
                  rows={2}
                  value={sessionDesc}
                  onChange={(e) => setSessionDesc(e.target.value)}
                  placeholder="Notes on target conformation, binding pocket residues, or exhaustiveness settings..."
                  className="w-full px-3 py-1.5 rounded bg-[#090D14] border border-[#212E40] text-[#EDF2F7] text-xs focus:outline-none focus:border-[#48CAE4] resize-none"
                />
              </div>

              {/* Snapshot Preview Pill */}
              <div className="p-2 rounded bg-[#070A0F] border border-[#172230] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#7395B8]">
                <span>Receptor: <strong className="text-[#EDF2F7]">{receptor.filename}</strong></span>
                <span>Grid: <strong className="text-[#EDF2F7]">{bindingSite.volume.toLocaleString()} Å³</strong></span>
                <span>Ligand: <strong className="text-[#EDF2F7]">{activeLigand.name}</strong></span>
                <span>Top Pose: <strong className="text-[#4FAE7B]">{poses[0]?.deltaG.toFixed(2)} kcal/mol</strong></span>
                <span>Engine: <strong className="text-[#E9C46A]">{dockingProtocol.engine}</strong></span>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsSavingDrawerOpen(false)}
                    className="px-3 py-1 rounded bg-transparent hover:bg-[#151D28] text-[#8C9BAE] text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    SAVE TO INDEXEDDB
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Toolbar: Search, Filters & Import */}
        <div className="px-5 py-3 bg-[#0C1118] border-b border-[#1A2432] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Left: Search input */}
          <div className="flex items-center gap-2 flex-1 min-w-[260px] max-w-md bg-[#070A0F] px-2.5 py-1.5 rounded border border-[#1E2A3A] focus-within:border-[#48CAE4]">
            <Search className="w-3.5 h-3.5 text-[#63758A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, PDB, ligand, or tag..."
              className="bg-transparent border-none outline-none text-xs text-[#EDF2F7] placeholder-[#4A596B] w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#63758A] hover:text-[#EDF2F7]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Center: Category Filter Tabs */}
          <div className="flex items-center bg-[#070A0F] p-0.5 rounded border border-[#1A232E] text-[11px]">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1 rounded transition-colors ${
                filterCategory === 'ALL'
                  ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium'
                  : 'text-[#7395B8] hover:text-[#EDF2F7]'
              }`}
            >
              ALL ({sessionsList.length})
            </button>
            <button
              onClick={() => setFilterCategory('BENCHMARK')}
              className={`px-3 py-1 rounded transition-colors ${
                filterCategory === 'BENCHMARK'
                  ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium'
                  : 'text-[#7395B8] hover:text-[#EDF2F7]'
              }`}
            >
              BENCHMARK ({benchmarkCount})
            </button>
            <button
              onClick={() => setFilterCategory('CUSTOM')}
              className={`px-3 py-1 rounded transition-colors ${
                filterCategory === 'CUSTOM'
                  ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium'
                  : 'text-[#7395B8] hover:text-[#EDF2F7]'
              }`}
            >
              SAVED SESSIONS ({customCount})
            </button>
          </div>

          {/* Right: Import & Refresh Actions */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json,.biodock.json"
              className="hidden"
            />

            <button
              id="btn-import-session-json"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#101721] hover:bg-[#172230] border border-[#1E2B3C] text-[#8C9BAE] hover:text-[#EDF2F7] text-[11px] font-mono transition-colors cursor-pointer"
              title="Import session archive from .json file into IndexedDB"
            >
              <Upload className="w-3 h-3 text-[#48CAE4]" />
              <span>IMPORT JSON</span>
            </button>

            <button
              onClick={refreshSessionsList}
              className="p-1.5 rounded bg-[#101721] hover:bg-[#172230] border border-[#1E2B3C] text-[#8C9BAE] hover:text-[#EDF2F7] transition-colors cursor-pointer"
              title="Refresh IndexedDB list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSessions ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sessions List Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-[#090C12]">
          {isLoadingSessions ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-[#7395B8] font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin text-[#48CAE4]" />
              <span>Reading sessions from browser IndexedDB...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center text-[#7395B8] font-mono text-xs border border-dashed border-[#1E2734] rounded-lg p-6">
              <FolderArchive className="w-8 h-8 text-[#4A5D75]" />
              <div>
                <p className="text-[#CBD5E0] font-semibold">No docking sessions found</p>
                <p className="text-[11px] text-[#63758A] mt-1 max-w-md">
                  {searchQuery
                    ? `No saved sessions match "${searchQuery}". Try adjusting your search or filters.`
                    : 'Your local IndexedDB repository is currently empty.'}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleRestorePresets}
                  className="px-3 py-1.5 rounded bg-[#182330] hover:bg-[#203042] border border-[#26384E] text-[#48CAE4] text-xs font-mono transition-colors cursor-pointer"
                >
                  Restore Benchmark Presets
                </button>
                <button
                  onClick={handleOpenSaveDrawer}
                  className="px-3 py-1.5 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  Save Current Workspace
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map((session) => {
                const isActive = currentSessionId === session.id;
                const isConfirmingDelete = deleteConfirmId === session.id;

                return (
                  <div
                    key={session.id}
                    className={`relative rounded-lg border p-4 flex flex-col justify-between transition-all select-none ${
                      isActive
                        ? 'bg-[#101A26] border-[#3B82C4] shadow-md shadow-[#2563EB]/10'
                        : 'bg-[#0E131B] hover:bg-[#121822] border-[#1C2736]'
                    }`}
                  >
                    {/* Top Row: Title, Badges & Time */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {isActive && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#132A44] text-[#48CAE4] border border-[#1E436E]">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                ACTIVE WORKSPACE
                              </span>
                            )}
                            {session.isPreset ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#192318] text-[#4FAE7B] border border-[#233B23]">
                                BENCHMARK PRESET
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#172230] text-[#7395B8] border border-[#1F3045]">
                                SAVED USER SESSION
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-[#5A6D82] flex items-center gap-1 ml-auto">
                              <Clock className="w-2.5 h-2.5" />
                              {formatSessionDate(session.updatedAt)}
                            </span>
                          </div>

                          <h3 className="text-xs font-mono font-bold text-[#EDF2F7] leading-snug truncate">
                            {session.name}
                          </h3>
                        </div>
                      </div>

                      {/* Description / Hypothesis snippet */}
                      <p className="text-[11px] font-mono text-[#7395B8] line-clamp-2 mb-3 leading-relaxed">
                        {session.description || 'Molecular docking parameter specification and conformer coordinates.'}
                      </p>

                      {/* Metric Badges Grid */}
                      <div className="grid grid-cols-3 gap-2 p-2 rounded bg-[#080B10] border border-[#161F2C] text-[10px] font-mono mb-3">
                        <div>
                          <span className="text-[#5A6D82] block text-[9px]">TARGET PDB</span>
                          <span className="font-semibold text-[#EDF2F7] truncate block">
                            {session.metadata.targetPdb}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#5A6D82] block text-[9px]">BEST AFFINITY</span>
                          <span className="font-semibold text-[#48CAE4] block">
                            ΔG: {session.metadata.bestDeltaG.toFixed(2)} kcal/mol
                          </span>
                        </div>
                        <div>
                          <span className="text-[#5A6D82] block text-[9px]">ENSEMBLE</span>
                          <span className="font-semibold text-[#E9C46A] block">
                            {session.metadata.posesCount} poses ({session.metadata.ligandCount} cpds)
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      {session.tags && session.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mb-3">
                          {session.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#111721] border border-[#182332] text-[#6E8299]"
                            >
                              #{tag}
                            </span>
                          ))}
                          {session.tags.length > 4 && (
                            <span className="text-[9px] font-mono text-[#5A6D82]">
                              +{session.tags.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-2 border-t border-[#172230] flex items-center justify-between gap-2 mt-auto">
                      {/* Left: Load Button */}
                      <button
                        id={`btn-load-session-${session.id}`}
                        onClick={() => loadSession(session)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#1A2C42] hover:bg-[#203652] text-[#48CAE4] border border-[#2A486E]'
                            : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isActive ? 'RELOAD WORKSPACE' : 'LOAD SESSION'}</span>
                      </button>

                      {/* Right: Secondary Actions */}
                      <div className="flex items-center gap-1">
                        {/* Duplicate */}
                        <button
                          onClick={() => duplicateSessionById(session.id)}
                          className="p-1.5 rounded bg-[#111721] hover:bg-[#1A2330] border border-[#192433] text-[#7395B8] hover:text-[#EDF2F7] transition-colors cursor-pointer"
                          title="Duplicate / Branch Session"
                        >
                          <Copy className="w-3 h-3" />
                        </button>

                        {/* Export JSON */}
                        <button
                          onClick={() => {
                            exportSessionToFile(session);
                            showToast(`Exported session file: ${session.name}`);
                          }}
                          className="p-1.5 rounded bg-[#111721] hover:bg-[#1A2330] border border-[#192433] text-[#7395B8] hover:text-[#EDF2F7] transition-colors cursor-pointer"
                          title="Download session as .biodock.json file"
                        >
                          <Download className="w-3 h-3" />
                        </button>

                        {/* Delete with inline confirmation */}
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1 bg-[#2B1115] border border-[#521C22] p-0.5 rounded">
                            <button
                              onClick={() => {
                                deleteSessionById(session.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-1.5 py-0.5 rounded bg-[#E63946] text-white text-[9px] font-mono font-bold hover:bg-[#C92A36]"
                              title="Confirm deletion"
                            >
                              DELETE?
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1 text-[#8C9BAE] hover:text-white text-[9px]"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(session.id)}
                            className="p-1.5 rounded bg-[#111721] hover:bg-[#261619] border border-[#192433] hover:border-[#4D1C22] text-[#7395B8] hover:text-[#E63946] transition-colors cursor-pointer"
                            title="Delete session"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#0C1118] border-t border-[#1C2532] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#7395B8] text-[11px]">
            <Database className="w-3.5 h-3.5 text-[#48CAE4]" />
            <span>
              IndexedDB Store: <code className="text-[#8C9BAE]">docking_sessions</code> in{' '}
              <code className="text-[#8C9BAE]">BioAnalyticalDocking_DB</code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestorePresets}
              className="text-[11px] text-[#7395B8] hover:text-[#EDF2F7] underline underline-offset-2 cursor-pointer"
            >
              Restore Benchmark Defaults
            </button>
            <div className="h-3 w-[1px] bg-[#1E293B]" />
            <button
              id="btn-close-project-manager-footer"
              onClick={() => toggleModal('projectManager', false)}
              className="px-4 py-1.5 rounded bg-[#151E2B] hover:bg-[#1E2B3C] border border-[#233144] text-[#CBD5E0] hover:text-[#EDF2F7] text-xs font-mono transition-colors cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
