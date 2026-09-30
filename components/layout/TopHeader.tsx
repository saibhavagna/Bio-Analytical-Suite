'use client';

import React from 'react';
import { useDocking } from '@/context/DockingContext';
import { FolderArchive, Save } from 'lucide-react';

export const TopHeader: React.FC = () => {
  const {
    project,
    ui,
    setUI,
    shareWorkspaceLink,
    resetToDefaults,
    toggleModal,
    dockingRun,
    sessionsList,
  } = useDocking();

  return (
    <header className="h-[46px] min-h-[46px] max-h-[46px] bg-[#090C10] border-b border-[#1C2532] px-3 flex items-center justify-between select-none">
      {/* Left: Brand & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setUI((prev) => ({ ...prev, activeModule: 'landing' }))}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity text-left cursor-pointer"
          title="Return to Bio-Analytical Suite Overview"
        >
          <div className="w-5 h-5 rounded bg-gradient-to-br from-[#2563EB] to-[#48CAE4] flex items-center justify-center text-white text-[10px] font-mono font-bold shadow-sm">
            ⬡
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#EDF2F7]">
            BIO-ANALYTICAL SUITE
          </span>
          <span className="text-[9px] font-mono text-[#63758A] bg-[#111720] px-1.5 py-0.5 rounded border border-[#1E2633]">
            v2.4.1
          </span>
        </button>

        <div className="h-4 w-[1px] bg-[#1C2532] hidden sm:block" />

        {/* Project Breadcrumb - Clickable to open Project Manager */}
        <button
          id="btn-breadcrumb-project-manager"
          onClick={() => toggleModal('projectManager', true)}
          className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[#7395B8] hover:text-[#EDF2F7] px-2 py-1 rounded hover:bg-[#121822] transition-colors cursor-pointer"
          title="Click to open Project & Session Manager (IndexedDB)"
        >
          <FolderArchive className="w-3 h-3 text-[#48CAE4]" />
          <span className="text-[#A0AEC0] font-medium">{project.name}</span>
          <span>/</span>
          <span className="text-[#8C9BAE]">{project.stage}</span>
          <span>/</span>
          <span className="text-[#E9C46A]">{project.runName}</span>
        </button>
      </div>

      {/* Center: Module View Switcher */}
      <nav className="flex items-center bg-[#0F141C] p-0.5 rounded border border-[#1A232E] text-[10px] font-mono">
        <button
          id="nav-landing"
          onClick={() => setUI((prev) => ({ ...prev, activeModule: 'landing' }))}
          className={`px-3 py-1 rounded transition-colors ${
            ui.activeModule === 'landing'
              ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium shadow-xs'
              : 'text-[#7395B8] hover:text-[#EDF2F7]'
          }`}
        >
          OVERVIEW
        </button>

        <button
          id="nav-workspace"
          onClick={() => setUI((prev) => ({ ...prev, activeModule: 'workspace' }))}
          className={`px-3 py-1 rounded transition-colors ${
            ui.activeModule === 'workspace'
              ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium shadow-xs'
              : 'text-[#7395B8] hover:text-[#EDF2F7]'
          }`}
        >
          DOCKING WORKSPACE
        </button>

        <button
          id="nav-matrix"
          onClick={() => setUI((prev) => ({ ...prev, activeModule: 'matrix' }))}
          className={`px-3 py-1 rounded transition-colors ${
            ui.activeModule === 'matrix'
              ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium shadow-xs'
              : 'text-[#7395B8] hover:text-[#EDF2F7]'
          }`}
        >
          INTERACTION MATRIX
        </button>

        <button
          id="nav-admet"
          onClick={() => setUI((prev) => ({ ...prev, activeModule: 'admet' }))}
          className={`px-3 py-1 rounded transition-colors ${
            ui.activeModule === 'admet'
              ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium shadow-xs'
              : 'text-[#7395B8] hover:text-[#EDF2F7]'
          }`}
        >
          BINDING & ADMET
        </button>

        <button
          id="nav-logs"
          onClick={() => setUI((prev) => ({ ...prev, activeModule: 'logs' }))}
          className={`px-3 py-1 rounded transition-colors ${
            ui.activeModule === 'logs'
              ? 'bg-[#1C2C3F] text-[#48CAE4] font-medium shadow-xs'
              : 'text-[#7395B8] hover:text-[#EDF2F7]'
          }`}
        >
          RUN LOGS
        </button>
      </nav>

      {/* Right: Project Manager, Engine Indicator & Actions */}
      <div className="flex items-center gap-2">
        {/* Project & Session Manager Trigger */}
        <button
          id="btn-header-project-manager"
          onClick={() => toggleModal('projectManager', true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111F2F] hover:bg-[#182C43] border border-[#1E3B5C] text-[#48CAE4] text-[10px] font-mono font-medium transition-colors cursor-pointer shadow-xs"
          title="Open IndexedDB Project & Session Manager"
        >
          <FolderArchive className="w-3 h-3 text-[#48CAE4]" />
          <span className="hidden sm:inline">PROJECTS</span>
          <span className="text-[9px] px-1 py-0.2 rounded-full bg-[#1F3D60] text-white">
            {sessionsList.length}
          </span>
        </button>

        {/* Engine Ready Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0F141C] border border-[#1A232E] text-[10px] font-mono text-[#8C9BAE]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              dockingRun.status !== 'idle' && dockingRun.status !== 'completed'
                ? 'bg-[#E9C46A] animate-ping'
                : 'bg-[#4FAE7B]'
            }`}
          />
          <span>CUDA 0: RTX 4090</span>
        </div>

        {/* Share Workspace Button */}
        <button
          id="btn-share-workspace"
          onClick={shareWorkspaceLink}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#16202C] hover:bg-[#1E2B3B] border border-[#243346] text-[#48CAE4] text-[10px] font-mono font-medium transition-colors cursor-pointer"
          title="Copy shareable workspace link to clipboard"
        >
          <span>🔗</span>
          <span className="hidden sm:inline">SHARE</span>
        </button>

        {/* Reset Workspace */}
        <button
          id="btn-reset-workspace"
          onClick={resetToDefaults}
          className="px-2 py-1 rounded bg-[#12171F] hover:bg-[#1A222D] border border-[#1E2734] text-[#8C9BAE] hover:text-[#EDF2F7] text-[10px] font-mono transition-colors cursor-pointer"
          title="Reset to baseline parameters"
        >
          RESET
        </button>
      </div>
    </header>
  );
};
