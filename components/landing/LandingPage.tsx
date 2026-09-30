'use client';

import React, { useState } from 'react';
import { useDocking } from '@/context/DockingContext';
import { WorkflowVideoWalkthrough } from './WorkflowVideoWalkthrough';
import {
  Play,
  Box,
  Layers,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  FileText,
  Sliders,
  Cpu,
  ChevronDown,
  Database,
  Search,
  Activity,
  Compass,
  Download,
  Share2,
  FolderArchive,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    receptor,
    updateReceptor,
    updateBindingSite,
    selectLigand,
    selectPose,
    setUI,
    toggleModal,
    showToast,
    addLog,
  } = useDocking();

  // Interactive state in the hero preview
  const [activePreviewPose, setActivePreviewPose] = useState<'P-001' | 'P-002' | 'P-003'>('P-001');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [selectedDemoCompound, setSelectedDemoCompound] = useState<'LIG-003' | 'LIG-001' | 'LIG-007'>('LIG-003');

  const previewPoses = {
    'P-001': {
      deltaG: -9.20,
      rmsd: 1.23,
      hBonds: 3,
      hydrophobic: 7,
      clashScore: 0.05,
      contacts: [
        { res: 'TYR-122', atom: 'OH', dist: '2.15 Å', type: 'Hydrogen Bond' },
        { res: 'ASP-85', atom: 'OD2', dist: '2.42 Å', type: 'Hydrogen Bond' },
        { res: 'LEU-98', atom: 'CD1', dist: '3.10 Å', type: 'Hydrophobic' },
        { res: 'PHE-101', atom: 'Ring', dist: '3.45 Å', type: 'Pi-Stacking' },
      ],
      comment: 'Thermodynamically favored global minimum. Low torsional penalty with dual hinge hydrogen bonds.',
    },
    'P-002': {
      deltaG: -8.74,
      rmsd: 1.95,
      hBonds: 2,
      hydrophobic: 6,
      clashScore: 0.12,
      contacts: [
        { res: 'TYR-122', atom: 'OH', dist: '2.28 Å', type: 'Hydrogen Bond' },
        { res: 'GLU-166', atom: 'OE1', dist: '2.65 Å', type: 'Hydrogen Bond' },
        { res: 'VAL-104', atom: 'CG2', dist: '3.32 Å', type: 'Hydrophobic' },
        { res: 'PHE-101', atom: 'Ring', dist: '3.80 Å', type: 'Pi-Stacking' },
      ],
      comment: 'Alternative hinge orientation. Retains catalytic contact but exhibits slight rotatable bond strain.',
    },
    'P-003': {
      deltaG: -8.15,
      rmsd: 2.84,
      hBonds: 2,
      hydrophobic: 5,
      clashScore: 0.28,
      contacts: [
        { res: 'ASP-85', atom: 'OD1', dist: '2.54 Å', type: 'Hydrogen Bond' },
        { res: 'CYS-145', atom: 'SG', dist: '3.12 Å', type: 'Hydrogen Bond' },
        { res: 'LEU-98', atom: 'CD2', dist: '3.40 Å', type: 'Hydrophobic' },
      ],
      comment: 'Peripheral pocket binding mode with higher solvent-exposed hydrophobic surface.',
    },
  };

  const sampleCompounds = {
    'LIG-003': {
      name: 'Staurosporine Analog (LIG-003)',
      smiles: 'CC1(C2=C(C3=C(C=C2)N1)C4=C5C(=C6C(=C53)N(C6=O)C)C7=CC=CC=C7N4)OC',
      mw: 466.5,
      logP: 2.85,
      tpsa: 72.4,
      rotBonds: 2,
      hbd: 2,
      hba: 4,
      lipinski: true,
      class: 'Indolocarbazole Macrocycle',
      affinityEst: '−9.2 kcal/mol',
    },
    'LIG-001': {
      name: 'Kinase Inhibitor Fragment (LIG-001)',
      smiles: 'CC1=C(C(=NO1)C)C2=CC=C(C=C2)NC(=O)NC3=CC(=C(C=C3)Cl)C(F)(F)F',
      mw: 382.7,
      logP: 3.42,
      tpsa: 68.1,
      rotBonds: 4,
      hbd: 2,
      hba: 3,
      lipinski: true,
      class: 'Isoxazole Diarylisourea',
      affinityEst: '−8.4 kcal/mol',
    },
    'LIG-007': {
      name: 'Mpro Protease Lead (LIG-007)',
      smiles: 'CC(C)CC(C(=O)NC(CC1=CC=CC=C1)C(=O)NC(CC2CCNC2=O)C=O)NC(=O)OCC3=CC=CC=C3',
      mw: 509.6,
      logP: 2.10,
      tpsa: 118.5,
      rotBonds: 11,
      hbd: 4,
      hba: 6,
      lipinski: false,
      class: 'Peptidomimetic Aldehyde',
      affinityEst: '−8.6 kcal/mol',
    },
  };

  const handleLaunchTarget = (
    target: '5EW8' | '6LU7' | '1M17'
  ) => {
    if (target === '5EW8') {
      updateReceptor({
        id: 'rec_5ew8',
        filename: '5EW8.pdb',
        name: 'Kinase Catalytic Domain (5EW8)',
        chain: 'A',
        atomCount: 2840,
        residuesCount: 345,
        resolution: 1.85,
        preparationStatus: 'prepared',
      });
      updateBindingSite({
        name: 'Binding Site (TYR-122 / ASP-85)',
        center: { x: 12.40, y: -4.20, z: 8.15 },
        size: { x: 22.0, y: 22.0, z: 20.0 },
        referenceResidues: ['TYR-122', 'ASP-85', 'LEU-98', 'PHE-101', 'HIS-41', 'CYS-145'],
      });
      selectLigand('LIG-003');
      selectPose('P-001');
      addLog('Loaded benchmark target 5EW8.pdb (Kinase Catalytic Domain).', 'INFO');
      showToast('Loaded target: 5EW8 Kinase Catalytic Domain (1.85 Å)');
    } else if (target === '6LU7') {
      updateReceptor({
        id: 'rec_6lu7',
        filename: '6LU7.pdb',
        name: 'SARS-CoV-2 Main Protease (6LU7)',
        chain: 'A',
        atomCount: 2614,
        residuesCount: 306,
        resolution: 2.16,
        preparationStatus: 'prepared',
      });
      updateBindingSite({
        name: 'Catalytic Dyad (HIS-41 / CYS-145)',
        center: { x: -10.72, y: 12.44, z: 68.05 },
        size: { x: 22.5, y: 22.5, z: 22.5 },
        referenceResidues: ['HIS-41', 'CYS-145', 'GLU-166', 'GLY-143', 'MET-165'],
      });
      selectLigand('LIG-001');
      selectPose('P-001');
      addLog('Loaded benchmark target 6LU7.pdb (SARS-CoV-2 Mpro).', 'INFO');
      showToast('Loaded target: 6LU7 SARS-CoV-2 Mpro (2.16 Å)');
    } else {
      updateReceptor({
        id: 'rec_1m17',
        filename: '1M17.pdb',
        name: 'EGFR Tyrosine Kinase Domain (1M17)',
        chain: 'A',
        atomCount: 2548,
        residuesCount: 320,
        resolution: 2.60,
        preparationStatus: 'prepared',
      });
      updateBindingSite({
        name: 'ATP Cleft (MET-769 / LYS-721)',
        center: { x: 28.15, y: 3.40, z: 45.80 },
        size: { x: 20.0, y: 20.0, z: 20.0 },
        referenceResidues: ['MET-769', 'LYS-721', 'THR-766', 'LEU-694', 'ALA-719'],
      });
      selectLigand('LIG-003');
      selectPose('P-001');
      addLog('Loaded benchmark target 1M17.pdb (EGFR Kinase).', 'INFO');
      showToast('Loaded target: 1M17 EGFR Tyrosine Kinase Domain');
    }
    setUI((prev) => ({ ...prev, activeModule: 'workspace' }));
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-[#0B0F13] text-[#CBD5E0] selection:bg-[#1E3A5F] selection:text-[#EDF2F7]">
      {/* Hero Announcement Banner */}
      <div className="border-b border-[#1A2533] bg-[#0E141C] py-2 px-4 text-center text-xs font-mono flex items-center justify-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#16273A] text-[#48CAE4] border border-[#234263] text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#48CAE4] animate-pulse" />
          AUTODOCK VINA FORCEFIELD v1.2.5
        </span>
        <span className="text-[#8C9BAE] hidden md:inline">
          Browser-native Monte Carlo simulated docking, WebGL coordinate inspection, and per-residue thermodynamic profiles.
        </span>
        <button
          onClick={() => setUI((prev) => ({ ...prev, activeModule: 'workspace' }))}
          className="text-[#48CAE4] hover:text-[#78E0F5] underline underline-offset-2 flex items-center gap-1 font-semibold ml-2"
        >
          Open 3D Studio <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-12 pt-12 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Left: Headline & Copy */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#131C27] border border-[#1F2E40] text-[#78A1C5] font-mono text-xs mb-5">
              <Compass className="w-3.5 h-3.5 text-[#48CAE4]" />
              <span>Computational Drug Discovery • Structure-Based Design</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#EDF2F7] leading-[1.15]">
              High-Precision Molecular Docking & Binding Site Analysis in the Browser
            </h1>

            <p className="text-[#94A3B8] text-base sm:text-lg leading-relaxed mt-5 max-w-2xl">
              Inspect receptor-ligand complex dynamics, compute empirical binding affinities with AutoDock Vina, and deconstruct residue-level thermodynamic contributions directly in the browser—zero native binary dependencies or remote queuing delays.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 mt-8 w-full sm:w-auto">
              <button
                id="hero-btn-launch"
                onClick={() => setUI((prev) => ({ ...prev, activeModule: 'workspace' }))}
                className="flex items-center justify-center gap-2.5 px-5 py-3 rounded bg-gradient-to-r from-[#2563EB] to-[#0284C7] hover:from-[#1D4ED8] hover:to-[#0369A1] text-white font-mono text-xs font-semibold tracking-wider uppercase transition-all shadow-md shadow-blue-900/20 active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Launch 3D Workstation</span>
              </button>

              <button
                id="hero-btn-sessions"
                onClick={() => toggleModal('projectManager', true)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded bg-[#131C26] hover:bg-[#1A2534] border border-[#213247] text-[#48CAE4] hover:text-[#EDF2F7] font-mono text-xs font-medium transition-colors cursor-pointer"
                title="Manage and load saved docking sessions in IndexedDB"
              >
                <FolderArchive className="w-3.5 h-3.5 text-[#48CAE4]" />
                <span>Saved Sessions</span>
              </button>

              <button
                onClick={() => handleLaunchTarget('6LU7')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded bg-[#131C26] hover:bg-[#1A2534] border border-[#213247] text-[#A0AEC0] hover:text-[#EDF2F7] font-mono text-xs font-medium transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-[#E9C46A]" />
                <span>Load 6LU7 Protease Preset</span>
              </button>

              <button
                onClick={() => setUI((prev) => ({ ...prev, activeModule: 'matrix' }))}
                className="flex items-center justify-center gap-1.5 px-3 py-3 rounded bg-transparent hover:bg-[#131C26] text-[#7395B8] hover:text-[#48CAE4] font-mono text-xs transition-colors cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Interaction Matrix</span>
              </button>
            </div>

            {/* Quick Spec Highlights */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-[#1C2735] w-full max-w-xl font-mono">
              <div>
                <div className="text-xl font-bold text-[#EDF2F7]">−9.20</div>
                <div className="text-[11px] text-[#718096] uppercase tracking-wider mt-0.5">kcal/mol Max Affinity</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[#48CAE4]">1.23 Å</div>
                <div className="text-[11px] text-[#718096] uppercase tracking-wider mt-0.5">Lead RMSD Cluster</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[#E9C46A]">100%</div>
                <div className="text-[11px] text-[#718096] uppercase tracking-wider mt-0.5">Client-Side WASM</div>
              </div>
            </div>
          </div>

          {/* Hero Right: Live Interactive Docking Inspector Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#0E141C] rounded-lg border border-[#202E3E] shadow-2xl p-5 relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#1C2836]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#48CAE4] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#EDF2F7]">ACTIVE DOCKING SESSION</span>
                </div>
                <span className="text-[10px] font-mono text-[#7395B8] bg-[#141E2A] px-2 py-0.5 rounded border border-[#1E2E40]">
                  5EW8 • LIG-003
                </span>
              </div>

              {/* Target & Pocket Information */}
              <div className="mt-3.5 bg-[#090D12] p-3 rounded border border-[#17212D] text-xs font-mono flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[#8C9BAE]">
                  <span>Target Macromolecule:</span>
                  <span className="text-[#EDF2F7] font-semibold">5EW8.pdb (Kinase Domain)</span>
                </div>
                <div className="flex items-center justify-between text-[#8C9BAE]">
                  <span>Resolution / Chain:</span>
                  <span className="text-[#48CAE4]">1.85 Å • Chain A</span>
                </div>
                <div className="flex items-center justify-between text-[#8C9BAE]">
                  <span>Grid Box (Center):</span>
                  <span className="text-[#E9C46A]">[12.40, −4.20, 8.15] Å</span>
                </div>
                <div className="flex items-center justify-between text-[#8C9BAE]">
                  <span>Search Cavity Volume:</span>
                  <span className="text-[#A0AEC0]">9,680.0 Å³</span>
                </div>
              </div>

              {/* Conformer Pose Selector (Interactive) */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8C9BAE] mb-2">
                  <span>EXAMINE CONFORMATIONAL CLUSTERS:</span>
                  <span className="text-[10px] text-[#48CAE4]">AutoDock Vina Scoring</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {(['P-001', 'P-002', 'P-003'] as const).map((poseId) => (
                    <button
                      key={poseId}
                      onClick={() => setActivePreviewPose(poseId)}
                      className={`p-2 rounded border transition-all text-left cursor-pointer ${
                        activePreviewPose === poseId
                          ? 'bg-[#192A3E] border-[#38628F] text-[#EDF2F7] shadow-inner'
                          : 'bg-[#101721] border-[#1C2634] text-[#718096] hover:text-[#A0AEC0]'
                      }`}
                    >
                      <div className="font-bold">{poseId}</div>
                      <div className="text-[11px] text-[#48CAE4]">{previewPoses[poseId].deltaG} kcal/mol</div>
                      <div className="text-[10px] text-[#63758A]">RMSD {previewPoses[poseId].rmsd} Å</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Pose Detailed Biophysical Breakdown */}
              <div className="mt-3.5 bg-[#090D12] p-3 rounded border border-[#17212D] text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] border-b border-[#17212D] pb-1.5 mb-2">
                  <span className="text-[#8C9BAE]">INTERMOLECULAR CONTACTS:</span>
                  <span className="text-[#48CAE4]">
                    {previewPoses[activePreviewPose].hBonds} H-Bonds • {previewPoses[activePreviewPose].hydrophobic} Hydrophobic
                  </span>
                </div>
                <div className="space-y-1.5">
                  {previewPoses[activePreviewPose].contacts.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-[#EDF2F7] font-medium">{c.res} ({c.atom})</span>
                      <span className="text-[#8C9BAE]">{c.type}</span>
                      <span className="text-[#E9C46A]">{c.dist}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#718096] italic mt-2.5 pt-2 border-t border-[#17212D] leading-relaxed">
                  {previewPoses[activePreviewPose].comment}
                </p>
              </div>

              {/* Card Launch CTA */}
              <button
                onClick={() => {
                  selectPose(activePreviewPose);
                  setUI((prev) => ({ ...prev, activeModule: 'workspace' }));
                }}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded bg-[#172535] hover:bg-[#1E3146] border border-[#273E59] text-[#48CAE4] hover:text-[#7AE4F7] font-mono text-xs font-medium transition-colors cursor-pointer"
              >
                <span>Inspect {activePreviewPose} in 3D WebGL Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Bio-Analytical Suite Video Walkthrough */}
      <WorkflowVideoWalkthrough />

      {/* 5-Step Computational Pipeline (Workflow) */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#192433]">
        <div className="text-left mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-[#48CAE4] bg-[#101A26] px-2.5 py-1 rounded border border-[#1E2E42]">
            END-TO-END METHODOLOGY
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDF2F7] mt-3">
            The AutoDock Vina Calculation Pipeline
          </h2>
          <p className="text-[#8C9BAE] text-base mt-2 max-w-3xl">
            From raw crystallographic coordinates to ranked conformational poses and publication-ready research reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono">
          {/* Step 1 */}
          <div className="bg-[#0E141C] p-4 rounded border border-[#1A2533]">
            <div className="text-[#48CAE4] text-xs font-bold mb-1">PHASE 01</div>
            <div className="text-sm font-semibold text-[#EDF2F7] mb-2">Receptor Topology</div>
            <p className="text-[11px] text-[#7395B8] leading-relaxed">
              Remove crystallographic waters, detect cofactor heteroatoms, assign Kollman partial charges, and optimize protonation states at pH 7.4.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0E141C] p-4 rounded border border-[#1A2533]">
            <div className="text-[#48CAE4] text-xs font-bold mb-1">PHASE 02</div>
            <div className="text-sm font-semibold text-[#EDF2F7] mb-2">Cavity Parameterization</div>
            <p className="text-[11px] text-[#7395B8] leading-relaxed">
              Define 3D search box coordinates and dimensions (X, Y, Z). Auto-detect catalytic dyads or specify manual Cartesian boundaries in Å.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0E141C] p-4 rounded border border-[#1A2533]">
            <div className="text-[#48CAE4] text-xs font-bold mb-1">PHASE 03</div>
            <div className="text-sm font-semibold text-[#EDF2F7] mb-2">Ligand Staging</div>
            <p className="text-[11px] text-[#7395B8] leading-relaxed">
              Parse SMILES or Mol2 chemical inputs, generate 3D conformers, assign Gasteiger charges, and identify rotatable torsion angles.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#0E141C] p-4 rounded border border-[#1A2533]">
            <div className="text-[#48CAE4] text-xs font-bold mb-1">PHASE 04</div>
            <div className="text-sm font-semibold text-[#EDF2F7] mb-2">Global Optimization</div>
            <p className="text-[11px] text-[#7395B8] leading-relaxed">
              Iterated local search (BFGS quasi-Newton) with Lamarckian genetic exploration. Cluster top poses by heavy-atom RMSD (2.0 Å cutoff).
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-[#0E141C] p-4 rounded border border-[#1A2533]">
            <div className="text-[#48CAE4] text-xs font-bold mb-1">PHASE 05</div>
            <div className="text-sm font-semibold text-[#EDF2F7] mb-2">Dossier & Export</div>
            <p className="text-[11px] text-[#7395B8] leading-relaxed">
              Inspect interaction vectors in 3D, deconstruct thermodynamic contributions, evaluate ADMET profiles, and export CSV/PDBQT reports.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities: Engine & Architecture Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#192433]">
        <div className="text-left mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-[#48CAE4] bg-[#101A26] px-2.5 py-1 rounded border border-[#1E2E42]">
            SCIENTIFIC ENGINE CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDF2F7] mt-3">
            Designed for Biophysical Rigor & Structural Drug Discovery
          </h2>
          <p className="text-[#8C9BAE] text-base mt-2 max-w-3xl">
            Engineered around the verified AutoDock Vina scoring equations, offering granular control over conformational sampling, spatial constraints, and post-docking thermodynamic analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Scoring Function */}
          <div className="bg-[#0E141C] p-5 rounded-lg border border-[#1C2735] flex flex-col justify-between hover:border-[#2A3B4E] transition-colors">
            <div>
              <div className="w-9 h-9 rounded bg-[#162230] border border-[#24374D] flex items-center justify-center text-[#48CAE4] mb-4">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#EDF2F7]">AutoDock Vina Scoring</h3>
              <p className="text-xs text-[#8C9BAE] mt-2 leading-relaxed">
                Empirical free-energy approximation incorporating Gauss-1, Gauss-2 steric attractions, quadratic repulsion penalties, hydrophobic potentials, and directional hydrogen bonds.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#18222E] text-[11px] font-mono text-[#7395B8] flex items-center justify-between">
              <span>ΔG = ΔH − TΔS</span>
              <span className="text-[#48CAE4]">Calibrated</span>
            </div>
          </div>

          {/* Card 2: Interactive 3D Search Box */}
          <div className="bg-[#0E141C] p-5 rounded-lg border border-[#1C2735] flex flex-col justify-between hover:border-[#2A3B4E] transition-colors">
            <div>
              <div className="w-9 h-9 rounded bg-[#162230] border border-[#24374D] flex items-center justify-center text-[#48CAE4] mb-4">
                <Box className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#EDF2F7]">Interactive Cavity Grid</h3>
              <p className="text-xs text-[#8C9BAE] mt-2 leading-relaxed">
                Dynamically parameterize Cartesian coordinates (X, Y, Z) and bounding box dimensions in Ångströms with real-time wireframe cage rendering and pocket residue identification.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#18222E] text-[11px] font-mono text-[#7395B8] flex items-center justify-between">
              <span>0.375 Å Spacing</span>
              <span className="text-[#E9C46A]">Configurable</span>
            </div>
          </div>

          {/* Card 3: Thermodynamic Decomposition */}
          <div className="bg-[#0E141C] p-5 rounded-lg border border-[#1C2735] flex flex-col justify-between hover:border-[#2A3B4E] transition-colors">
            <div>
              <div className="w-9 h-9 rounded bg-[#162230] border border-[#24374D] flex items-center justify-center text-[#48CAE4] mb-4">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#EDF2F7]">Energy Decomposition</h3>
              <p className="text-xs text-[#8C9BAE] mt-2 leading-relaxed">
                Deconstruct each binding pose into van der Waals, electrostatic (Coulombic), hydrogen bonding, desolvation penalty, and ligand conformational strain profiles.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#18222E] text-[11px] font-mono text-[#7395B8] flex items-center justify-between">
              <span>5 Energy Terms</span>
              <span className="text-[#48CAE4]">Per-Pose D3</span>
            </div>
          </div>

          {/* Card 4: ADMET & Drug Likeness */}
          <div className="bg-[#0E141C] p-5 rounded-lg border border-[#1C2735] flex flex-col justify-between hover:border-[#2A3B4E] transition-colors">
            <div>
              <div className="w-9 h-9 rounded bg-[#162230] border border-[#24374D] flex items-center justify-center text-[#48CAE4] mb-4">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-[#EDF2F7]">ADMET & Lipinski</h3>
              <p className="text-xs text-[#8C9BAE] mt-2 leading-relaxed">
                Automated evaluation of molecular weight, LogP, topological polar surface area (TPSA), rotatable bonds, and Lipinski Rule of 5 bioavailability compliance.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-[#18222E] text-[11px] font-mono text-[#7395B8] flex items-center justify-between">
              <span>Veber & Lipinski</span>
              <span className="text-[#48CAE4]">Auto-Screened</span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Presets Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#192433]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#E9C46A] bg-[#1C180E] px-2.5 py-1 rounded border border-[#3D331A]">
              CURATED BENCHMARK MACROMOLECULES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDF2F7] mt-3">
              One-Click Structural Presets
            </h2>
            <p className="text-[#8C9BAE] text-base mt-2 max-w-2xl">
              Select verified crystallographic structures with pre-calibrated catalytic pockets to begin docking calculations immediately.
            </p>
          </div>
          <button
            onClick={() => setUI((prev) => ({ ...prev, activeModule: 'workspace' }))}
            className="text-xs font-mono text-[#48CAE4] hover:text-[#78E0F5] flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <span>Or upload custom PDB / PDBQT file</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target 1: 5EW8 */}
          <div className="bg-[#0E141C] rounded-lg border border-[#1D2938] p-5 flex flex-col justify-between hover:border-[#314A66] transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1A2533]">
                <span className="text-xs font-mono font-bold text-[#48CAE4]">PDB: 5EW8</span>
                <span className="text-[10px] font-mono text-[#8C9BAE] bg-[#141E2A] px-2 py-0.5 rounded border border-[#1E2B3A]">
                  Resolution: 1.85 Å
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#EDF2F7] mt-3">Kinase Catalytic Domain</h3>
              <p className="text-xs text-[#8C9BAE] mt-2 leading-relaxed">
                Essential oncology therapeutic target. Pre-configured search grid centered on ATP hinge region residues TYR-122, ASP-85, and PHE-101.
              </p>

              <div className="mt-4 bg-[#090D12] p-3 rounded border border-[#17212D] text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-[#7395B8]">
                  <span>Atoms:</span>
                  <span className="text-[#EDF2F7]">2,840 (Chain A)</span>
                </div>
                <div className="flex justify-between text-[#7395B8]">
                  <span>Catalytic Pocket:</span>
                  <span className="text-[#E9C46A]">TYR-122 / ASP-85</span>
                </div>
                <div className="flex justify-between text-[#7395B8]">
                  <span>Benchmark Ligand:</span>
                  <span className="text-[#48CAE4]">Staurosporine (LIG-003)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchTarget('5EW8')}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded bg-[#162434] hover:bg-[#1E3248] border border-[#233852] text-[#48CAE4] font-mono text-xs font-medium transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-[#48CAE4]" />
              <span>Load Target in 3D Canvas</span>
            </button>
          </div>

          {/* Target 2: 6LU7 */}
          <div className="bg-[#0E141C] rounded-lg border border-[#1D2938] p-5 flex flex-col justify-between hover:border-[#314A66] transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1A2533]">
                <span className="text-xs font-mono font-bold text-[#48CAE4]">PDB: 6LU7</span>
                <span className="text-[10px] font-mono text-[#8C9BAE] bg-[#141E2A] px-2 py-0.5 rounded border border-[#1E2B3A]">
                  Resolution: 2.16 Å
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#EDF2F7] mt-3">SARS-CoV-2 Main Protease</h3>
              <p className="text-xs text-[#8C9BAE] mt-2 leading-relaxed">
                Antiviral protease (Mpro) dimeric assembly. Centered directly on the catalytic dyad (HIS-41 / CYS-145) alongside GLU-166 and GLY-143.
              </p>

              <div className="mt-4 bg-[#090D12] p-3 rounded border border-[#17212D] text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-[#7395B8]">
                  <span>Atoms:</span>
                  <span className="text-[#EDF2F7]">2,614 (Chain A)</span>
                </div>
                <div className="flex justify-between text-[#7395B8]">
                  <span>Catalytic Pocket:</span>
                  <span className="text-[#E9C46A]">HIS-41 / CYS-145 Dyad</span>
                </div>
                <div className="flex justify-between text-[#7395B8]">
                  <span>Benchmark Ligand:</span>
                  <span className="text-[#48CAE4]">N3 Peptide Analog (LIG-001)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchTarget('6LU7')}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded bg-[#162434] hover:bg-[#1E3248] border border-[#233852] text-[#48CAE4] font-mono text-xs font-medium transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-[#48CAE4]" />
              <span>Load Target in 3D Canvas</span>
            </button>
          </div>

          {/* Target 3: 1M17 */}
          <div className="bg-[#0E141C] rounded-lg border border-[#1D2938] p-5 flex flex-col justify-between hover:border-[#314A66] transition-all">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1A2533]">
                <span className="text-xs font-mono font-bold text-[#48CAE4]">PDB: 1M17</span>
                <span className="text-[10px] font-mono text-[#8C9BAE] bg-[#141E2A] px-2 py-0.5 rounded border border-[#1E2B3A]">
                  Resolution: 2.60 Å
                </span>
              </div>
              <h3 className="text-base font-semibold text-[#EDF2F7] mt-3">EGFR Tyrosine Kinase</h3>
              <p className="text-xs text-[#8C9BAE] mt-2 leading-relaxed">
                Non-small cell lung carcinoma clinical target. Search box encompasses the Erlotinib pocket including gatekeeper THR-766 and MET-769.
              </p>

              <div className="mt-4 bg-[#090D12] p-3 rounded border border-[#17212D] text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-[#7395B8]">
                  <span>Atoms:</span>
                  <span className="text-[#EDF2F7]">2,548 (Chain A)</span>
                </div>
                <div className="flex justify-between text-[#7395B8]">
                  <span>Catalytic Pocket:</span>
                  <span className="text-[#E9C46A]">MET-769 / LYS-721</span>
                </div>
                <div className="flex justify-between text-[#7395B8]">
                  <span>Benchmark Ligand:</span>
                  <span className="text-[#48CAE4]">Gefitinib Scaffolds</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchTarget('1M17')}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded bg-[#162434] hover:bg-[#1E3248] border border-[#233852] text-[#48CAE4] font-mono text-xs font-medium transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-[#48CAE4]" />
              <span>Load Target in 3D Canvas</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Chemical Playground / Compound Tester */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#192433]">
        <div className="bg-[#0E141C] rounded-xl border border-[#202E3E] p-6 sm:p-8">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-[#48CAE4] bg-[#121E2C] px-2.5 py-1 rounded border border-[#1F334A]">
              INTERACTIVE COMPOUND SCREENER
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#EDF2F7] mt-3">
              Test Chemical Scaffolds & Drug-Likeness
            </h2>
            <p className="text-[#8C9BAE] text-sm mt-2">
              Select a clinical candidate from the pre-loaded library to inspect calculated physicochemical properties and predicted binding performance.
            </p>
          </div>

          {/* Compound Selection Buttons */}
          <div className="flex flex-wrap gap-2.5 mb-6 font-mono text-xs">
            {(['LIG-003', 'LIG-001', 'LIG-007'] as const).map((id) => (
              <button
                key={id}
                onClick={() => setSelectedDemoCompound(id)}
                className={`px-3 py-1.5 rounded border transition-all cursor-pointer ${
                  selectedDemoCompound === id
                    ? 'bg-[#1C2F45] text-[#48CAE4] border-[#315782] font-semibold'
                    : 'bg-[#121822] text-[#8C9BAE] border-[#1C2534] hover:text-[#EDF2F7]'
                }`}
              >
                {sampleCompounds[id].name}
              </button>
            ))}
          </div>

          {/* Chemical Data Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#090D12] p-5 rounded-lg border border-[#182330] font-mono">
            {/* Left: Identity & SMILES */}
            <div className="lg:col-span-2 space-y-3">
              <div>
                <div className="text-[10px] text-[#63758A] uppercase">Compound Designation</div>
                <div className="text-sm font-bold text-[#EDF2F7] mt-0.5">
                  {sampleCompounds[selectedDemoCompound].name}
                </div>
                <div className="text-xs text-[#7395B8]">
                  Class: {sampleCompounds[selectedDemoCompound].class}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[#63758A] uppercase">Canonical SMILES String</div>
                <div className="text-xs text-[#48CAE4] break-all bg-[#0B1017] p-2 rounded border border-[#162230] mt-1">
                  {sampleCompounds[selectedDemoCompound].smiles}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="bg-[#0D131B] p-2 rounded border border-[#17222E]">
                  <div className="text-[10px] text-[#63758A]">MOL WEIGHT</div>
                  <div className="text-[#EDF2F7] font-semibold">{sampleCompounds[selectedDemoCompound].mw} g/mol</div>
                </div>
                <div className="bg-[#0D131B] p-2 rounded border border-[#17222E]">
                  <div className="text-[10px] text-[#63758A]">CLogP</div>
                  <div className="text-[#EDF2F7] font-semibold">{sampleCompounds[selectedDemoCompound].logP}</div>
                </div>
                <div className="bg-[#0D131B] p-2 rounded border border-[#17222E]">
                  <div className="text-[10px] text-[#63758A]">TPSA</div>
                  <div className="text-[#EDF2F7] font-semibold">{sampleCompounds[selectedDemoCompound].tpsa} Å²</div>
                </div>
                <div className="bg-[#0D131B] p-2 rounded border border-[#17222E]">
                  <div className="text-[10px] text-[#63758A]">ROT BONDS</div>
                  <div className="text-[#EDF2F7] font-semibold">{sampleCompounds[selectedDemoCompound].rotBonds}</div>
                </div>
              </div>
            </div>

            {/* Right: Lipinski Evaluation & Launch */}
            <div className="bg-[#0D131C] p-4 rounded border border-[#1C2A3A] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#63758A] uppercase">Lipinski Rule of 5</span>
                  {sampleCompounds[selectedDemoCompound].lipinski ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#102B20] text-[#4FAE7B] border border-[#1A4533] font-bold">
                      PASS (0 VIOLATIONS)
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#2D1B18] text-[#E76F51] border border-[#482820] font-bold">
                      VIOLATION DETECTED
                    </span>
                  )}
                </div>

                <div className="mt-3 text-xs space-y-1 text-[#8C9BAE]">
                  <div className="flex justify-between">
                    <span>Hydrogen Bond Donors:</span>
                    <span className="text-[#EDF2F7]">{sampleCompounds[selectedDemoCompound].hbd} / 5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hydrogen Bond Acceptors:</span>
                    <span className="text-[#EDF2F7]">{sampleCompounds[selectedDemoCompound].hba} / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Predicted Target Affinity:</span>
                    <span className="text-[#E9C46A] font-bold">{sampleCompounds[selectedDemoCompound].affinityEst}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  selectLigand(selectedDemoCompound);
                  selectPose('P-001');
                  setUI((prev) => ({ ...prev, activeModule: 'workspace' }));
                  showToast(`Loaded ${sampleCompounds[selectedDemoCompound].name} into 3D Workspace`);
                }}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded bg-[#203650] hover:bg-[#284464] border border-[#315682] text-[#EDF2F7] text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Dock Compound in 3D Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Technical FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto border-t border-[#192433]">
        <div className="text-center mb-10">
          <span className="text-xs font-mono uppercase tracking-wider text-[#48CAE4] bg-[#101A26] px-2.5 py-1 rounded border border-[#1E2E42]">
            TECHNICAL SPECIFICATIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EDF2F7] mt-3">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 font-sans">
          {[
            {
              q: 'How does this in-browser suite compute AutoDock Vina affinities?',
              a: 'Calculations utilize a compiled WebAssembly port of the AutoDock Vina global search routine and empirical forcefield equations. The scoring function evaluates steric interactions (Gaussian 1 and 2 terms), repulsive penalties, hydrophobic contacts, and directed hydrogen bond geometries without relying on an external backend server.',
            },
            {
              q: 'Can I upload custom PDB or PDBQT macromolecule files?',
              a: 'Yes. The workspace provides an active PDB/PDBQT coordinate loader that parses ATOM and HETATM records directly into WebGL memory. You can specify custom search space centers (X, Y, Z) and bounding dimensions in Ångströms to target any allosteric or catalytic cavity.',
            },
            {
              q: 'Is my proprietary structural data sent to third-party servers?',
              a: 'No. All PDB parsing, ligand conformer evaluation, Cartesian grid bounding, and thermodynamic decomposition occur locally inside your browser sandbox. No coordinates or SMILES strings are logged or exfiltrated.',
            },
            {
              q: 'How are the per-residue thermodynamic profiles calculated?',
              a: 'Each docked conformation is decomposed into five orthogonal energetic components: van der Waals steric attraction, Coulombic electrostatics, directional hydrogen bonding, desolvation penalty, and ligand conformational strain, plotted interactively with D3.js.',
            },
            {
              q: 'What export formats are available for publication and analysis?',
              a: 'You can export multi-model PDBQT atomic coordinate files containing docked poses, structured CSV pose ranking tables, and complete formatted Research Dossier reports summarizing target metadata, grid parameters, and ADMET profiles.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0E141C] rounded-lg border border-[#1C2735] overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-medium text-[#EDF2F7] text-sm hover:bg-[#121924] transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#7395B8] transition-transform duration-200 ${
                    activeFaq === idx ? 'transform rotate-180 text-[#48CAE4]' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[#8C9BAE] leading-relaxed border-t border-[#17222E]">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#192433]">
        <div className="bg-gradient-to-b from-[#111A26] to-[#0A0E14] rounded-2xl border border-[#203247] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#EDF2F7]">
              Ready to Explore Molecular Pockets?
            </h2>
            <p className="text-[#8C9BAE] text-base mt-4 leading-relaxed">
              Launch the 3D WebGL docking studio with pre-calibrated kinase and protease targets, interactive grid boxes, and real-time contact maps.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setUI((prev) => ({ ...prev, activeModule: 'workspace' }))}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded bg-gradient-to-r from-[#2563EB] to-[#0284C7] hover:from-[#1D4ED8] hover:to-[#0369A1] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Enter 3D Docking Studio</span>
              </button>

              <button
                onClick={() => handleLaunchTarget('5EW8')}
                className="flex items-center gap-2 px-5 py-3.5 rounded bg-[#15202E] hover:bg-[#1B293B] border border-[#263A52] text-[#A0AEC0] hover:text-[#EDF2F7] font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Launch Kinase 5EW8 Preset</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Citation & Footer */}
      <footer className="border-t border-[#192433] bg-[#090D12] py-8 px-4 sm:px-6 lg:px-12 text-xs font-mono text-[#63758A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-[#2563EB] to-[#48CAE4] flex items-center justify-center text-white text-[9px] font-bold">
              ⬡
            </div>
            <span className="font-bold text-[#A0AEC0]">BIO-ANALYTICAL SUITE</span>
            <span>•</span>
            <span>Structure-Based Lead Discovery Workstation v2.4.1</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Methodology: AutoDock Vina (Trott & Olson)</span>
            <span>•</span>
            <span>PDB Coordinates: wwPDB Standard</span>
            <span>•</span>
            <button
              onClick={() => setUI((prev) => ({ ...prev, activeModule: 'workspace' }))}
              className="text-[#48CAE4] hover:underline cursor-pointer"
            >
              Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
