'use client';

import React from 'react';
import { useDocking } from '@/context/DockingContext';
import { TopHeader } from './TopHeader';
import { StatusBar } from './StatusBar';
import { Toast } from './Toast';
import { LeftWorkflowPanel } from '../workflow/LeftWorkflowPanel';
import { CenterWorkspace } from '../workflow/CenterWorkspace';
import { RightResultsPanel } from '../results/RightResultsPanel';
import { InteractionMatrixView } from '../modules/InteractionMatrixView';
import { BindingAdmetView } from '../modules/BindingAdmetView';
import { RunLogsView } from '../modules/RunLogsView';
import { LandingPage } from '../landing/LandingPage';
import { LigandLibraryModal } from '../modals/LigandLibraryModal';
import { SmilesInputModal } from '../modals/SmilesInputModal';
import { ReportExportModal } from '../modals/ReportExportModal';
import { ProjectManagerModal } from '../modals/ProjectManagerModal';
import { PocketSearchModal } from '../modals/PocketSearchModal';

export const AppShell: React.FC = () => {
  const { ui } = useDocking();

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#0B0F13] text-[#CBD5E0]">
      {/* Top Application Header */}
      <TopHeader />

      {/* Main Workstation Body */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {ui.activeModule === 'landing' && <LandingPage />}

        {ui.activeModule === 'workspace' && (
          <div className="flex w-full h-full">
            {/* Left Docking Workflow Panel (Step 01 - 04) */}
            <LeftWorkflowPanel />

            {/* Center Molecular 3D Viewer & Interpretation */}
            <CenterWorkspace />

            {/* Right Results & Analysis Panel */}
            <RightResultsPanel />
          </div>
        )}

        {ui.activeModule === 'matrix' && <InteractionMatrixView />}

        {ui.activeModule === 'admet' && <BindingAdmetView />}

        {ui.activeModule === 'logs' && <RunLogsView />}
      </div>

      {/* Bottom Status / Telemetry Bar */}
      <StatusBar />

      {/* Global Modals & Toast */}
      <LigandLibraryModal />
      <SmilesInputModal />
      <ReportExportModal />
      <ProjectManagerModal />
      <PocketSearchModal />
      <Toast />
    </div>
  );
};
