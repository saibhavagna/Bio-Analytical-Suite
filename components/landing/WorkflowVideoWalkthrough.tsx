'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  FileDown,
  Box,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useDocking } from '@/context/DockingContext';

export const WorkflowVideoWalkthrough: React.FC = () => {
  const { setUI } = useDocking();

  // Video playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds (0 to 165)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isHoveringTimeline, setIsHoveringTimeline] = useState<boolean>(false);
  const [timelineHoverTime, setTimelineHoverTime] = useState<number>(0);
  const [timelineHoverX, setTimelineHoverX] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Total duration: 2 minutes 45 seconds = 165 seconds
  const TOTAL_DURATION = 165;

  // Timeline stage definitions corresponding to the prompt
  const stages = useMemo(
    () => [
      { id: 'intro', start: 0, end: 10, title: 'Introduction', subtitle: 'Molecular Docking & Drug Discovery', stepKey: 'prepare' },
      { id: 'import', start: 10, end: 25, title: 'Import Structure', subtitle: 'Receptor → 5EW8.pdb Kinase Domain', stepKey: 'prepare' },
      { id: 'prepare', start: 25, end: 40, title: 'Prepare Receptor', subtitle: 'Waters, Hydrogens & Partial Charges', stepKey: 'prepare' },
      { id: 'define', start: 40, end: 60, title: 'Define Binding Site', subtitle: '3D Cartesian Grid Box Parameterization', stepKey: 'define' },
      { id: 'ligand', start: 60, end: 75, title: 'Select Ligand', subtitle: 'LIG-003 Staurosporine Analog Staging', stepKey: 'dock' },
      { id: 'configure', start: 75, end: 90, title: 'Configure Docking', subtitle: 'AutoDock Vina Engine & Search Parameters', stepKey: 'dock' },
      { id: 'run', start: 90, end: 105, title: 'Run Docking', subtitle: 'Monte Carlo Iterated Local Search', stepKey: 'dock' },
      { id: 'poses', start: 105, end: 120, title: 'Compare Poses', subtitle: 'Cluster Ranking (P-001, P-002, P-003)', stepKey: 'analyze' },
      { id: 'interactions', start: 120, end: 135, title: 'Inspect Interactions', subtitle: 'H-Bonds, Hydrophobic Contacts & Pi-Stacking', stepKey: 'analyze' },
      { id: 'analysis', start: 135, end: 150, title: 'Analyze Results', subtitle: 'Thermodynamic Decomposition & ADMET Profile', stepKey: 'analyze' },
      { id: 'export', start: 150, end: 160, title: 'Export Results', subtitle: 'Multi-model PDBQT, CSV & Research Report', stepKey: 'analyze' },
      { id: 'finish', start: 160, end: 165, title: 'Workflow Complete', subtitle: 'From Structure → Docking → Interaction Analysis', stepKey: 'analyze' },
    ],
    []
  );

  // Current active stage
  const currentStage = useMemo(() => {
    return stages.find((s) => currentTime >= s.start && currentTime < s.end) || stages[stages.length - 1];
  }, [stages, currentTime]);

  // Major step indicators for the bottom bar: 01 Prepare -> 02 Define -> 03 Dock -> 04 Analyze
  const majorSteps = [
    { id: 'prepare', number: '01', label: 'Prepare', timestamp: 10, desc: 'Structure & Receptor Topology' },
    { id: 'define', number: '02', label: 'Define', timestamp: 40, desc: '3D Binding Site Grid Box' },
    { id: 'dock', number: '03', label: 'Dock', timestamp: 75, desc: 'Ligand Staging & Vina Calculation' },
    { id: 'analyze', number: '04', label: 'Analyze', timestamp: 105, desc: 'Pose Rankings, Interactions & Export' },
  ];

  // Playback timer engine
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTickTimeRef.current = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = time;

      setCurrentTime((prev) => {
        const next = prev + delta * playbackSpeed;
        if (next >= TOTAL_DURATION) {
          setIsPlaying(false);
          return TOTAL_DURATION;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, TOTAL_DURATION]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!hasStarted) setHasStarted(true);
    if (currentTime >= TOTAL_DURATION) {
      setCurrentTime(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [hasStarted, currentTime, TOTAL_DURATION]);

  // Seek handler
  const handleSeek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_DURATION, seconds));
    setCurrentTime(clamped);
    if (!hasStarted) setHasStarted(true);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Dynamic values calculated from currentTime to simulate living UI state
  // 1. Grid Box Dimensions animation (00:40 to 01:00)
  const gridParams = useMemo(() => {
    if (currentTime < 40) {
      return { cx: 12.40, cy: -4.20, cz: 8.15, sx: 20.0, sy: 20.0, sz: 20.0, vol: 8000 };
    }
    if (currentTime >= 40 && currentTime < 60) {
      const progress = (currentTime - 40) / 20;
      const sx = 20.0 + progress * 2.0;
      const sy = 20.0 + progress * 2.0;
      const sz = 20.0;
      return {
        cx: 12.40,
        cy: -4.20,
        cz: 8.15,
        sx: parseFloat(sx.toFixed(1)),
        sy: parseFloat(sy.toFixed(1)),
        sz: parseFloat(sz.toFixed(1)),
        vol: Math.round(sx * sy * sz),
      };
    }
    return { cx: 12.40, cy: -4.20, cz: 8.15, sx: 22.0, sy: 22.0, sz: 20.0, vol: 9680 };
  }, [currentTime]);

  // 2. Docking Run Progress (01:30 to 01:45)
  const dockingProgress = useMemo(() => {
    if (currentTime < 90) return 0;
    if (currentTime >= 105) return 100;
    const p = ((currentTime - 90) / 15) * 100;
    return Math.min(100, Math.round(p));
  }, [currentTime]);

  const dockingPhaseLabel = useMemo(() => {
    if (dockingProgress === 0) return 'Ready';
    if (dockingProgress < 25) return 'Preparing structures...';
    if (dockingProgress < 60) return 'Searching binding site...';
    if (dockingProgress < 85) return 'Generating poses...';
    if (dockingProgress < 100) return 'Ranking results...';
    return 'Complete';
  }, [dockingProgress]);

  // 3. Active Pose during pose comparison (01:45 to 02:00)
  const activePoseId = useMemo(() => {
    if (currentTime < 105) return 'P-001';
    if (currentTime >= 105 && currentTime < 110) return 'P-001';
    if (currentTime >= 110 && currentTime < 115) return 'P-002';
    if (currentTime >= 115 && currentTime < 120) return 'P-003';
    return 'P-001'; // Default back to optimal P-001
  }, [currentTime]);

  // Pose data definitions
  const currentPoseData = useMemo(() => {
    const data: Record<string, { deltaG: number; rmsd: number; hBonds: number; hydrophobic: number; clash: number }> = {
      'P-001': { deltaG: -9.20, rmsd: 1.23, hBonds: 3, hydrophobic: 7, clash: 0.05 },
      'P-002': { deltaG: -8.74, rmsd: 1.95, hBonds: 2, hydrophobic: 6, clash: 0.12 },
      'P-003': { deltaG: -8.15, rmsd: 2.84, hBonds: 2, hydrophobic: 5, clash: 0.28 },
    };
    return data[activePoseId] || data['P-001'];
  }, [activePoseId]);

  // Cursor position simulation to show where user clicks
  const cursorState = useMemo(() => {
    if (currentTime >= 10 && currentTime < 16) {
      return { visible: true, x: 18, y: 32, clicking: currentTime >= 13 && currentTime < 14, label: 'Import 5EW8.pdb' };
    }
    if (currentTime >= 28 && currentTime < 36) {
      return { visible: true, x: 22, y: 48, clicking: currentTime >= 31 && currentTime < 32, label: 'Prepare Receptor' };
    }
    if (currentTime >= 45 && currentTime < 55) {
      return { visible: true, x: 20, y: 64, clicking: false, label: 'Adjust Grid Box' };
    }
    if (currentTime >= 64 && currentTime < 72) {
      return { visible: true, x: 19, y: 76, clicking: currentTime >= 67 && currentTime < 68, label: 'Select LIG-003' };
    }
    if (currentTime >= 88 && currentTime < 94) {
      return { visible: true, x: 22, y: 88, clicking: currentTime >= 90 && currentTime < 91.5, label: 'Click Run Docking' };
    }
    if (currentTime >= 109 && currentTime < 113) {
      return { visible: true, x: 86, y: 36, clicking: currentTime >= 110 && currentTime < 111, label: 'Select Pose P-002' };
    }
    if (currentTime >= 114 && currentTime < 118) {
      return { visible: true, x: 86, y: 44, clicking: currentTime >= 115 && currentTime < 116, label: 'Select Pose P-003' };
    }
    if (currentTime >= 152 && currentTime < 158) {
      return { visible: true, x: 88, y: 88, clicking: currentTime >= 154 && currentTime < 155.5, label: 'Export Report' };
    }
    return { visible: false, x: 50, y: 50, clicking: false, label: '' };
  }, [currentTime]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto border-t border-[#192433]">
      {/* Section Header */}
      <div className="text-left mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#101C2B] border border-[#1E334D] text-[#48CAE4] font-mono text-xs uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HOW IT WORKS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#EDF2F7]">
          From Structure to Insight, Step by Step.
        </h2>
        <p className="text-[#8C9BAE] text-base sm:text-lg mt-3 leading-relaxed">
          See how Bio-Analytical Suite takes you from molecular structure preparation to docking, pose comparison, and interaction analysis in one workspace.
        </p>
      </div>

      {/* Main Video Walkthrough Container (16:9 Aspect Ratio) */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-xl border border-[#202F42] bg-[#070A0F] shadow-2xl overflow-hidden group select-none transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'aspect-video max-h-[720px]'
        }`}
      >
        {/* POSTER / THUMBNAIL OVERLAY (Shown before playback starts) */}
        {!hasStarted && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#070A0F]/95 backdrop-blur-xs p-6 text-center">
            {/* Background decorative workstation blueprint */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#2563EB]/20 blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#48CAE4]/20 blur-3xl" />
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1C2B3C" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              </svg>
            </div>

            {/* Poster Card & Thumbnail Elements */}
            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              {/* Play Button Icon */}
              <button
                id="video-poster-play-btn"
                onClick={togglePlay}
                className="relative group/play flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#152336] hover:bg-[#1E3553] border-2 border-[#36618F] hover:border-[#48CAE4] text-[#48CAE4] hover:text-white transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/20 cursor-pointer mb-6"
                aria-label="Play Walkthrough"
              >
                <div className="absolute inset-0 rounded-full bg-[#48CAE4]/10 animate-ping pointer-events-none" />
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101C2A] border border-[#213854] text-[#48CAE4] font-mono text-xs font-semibold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-[#48CAE4] animate-pulse" />
                <span>Interactive Workstation Video</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#EDF2F7] tracking-tight">
                Watch the 3-minute workflow
              </h3>

              <p className="text-[#8C9BAE] text-xs sm:text-sm mt-2 max-w-md leading-relaxed">
                Step-by-step walkthrough covering receptor topology, 3D grid bounding, AutoDock Vina scoring, and per-residue thermodynamic profiles.
              </p>

              {/* Quick Feature Badges on Poster */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-[11px] font-mono text-[#7395B8]">
                <span className="px-2.5 py-1 rounded bg-[#0E1520] border border-[#1A2838]">
                  PDB: 5EW8 Kinase
                </span>
                <span className="px-2.5 py-1 rounded bg-[#0E1520] border border-[#1A2838]">
                  Vina 1.2.5 Algorithm
                </span>
                <span className="px-2.5 py-1 rounded bg-[#0E1520] border border-[#1A2838]">
                  Pose Cluster P-001
                </span>
                <span className="px-2.5 py-1 rounded bg-[#0E1520] border border-[#1A2838]">
                  D3 Thermodynamic Profile
                </span>
              </div>
            </div>
          </div>
        )}

        {/* WORKSTATION INTERFACE SIMULATION (SCREEN RECORDING EFFECT) */}
        <div className="absolute inset-0 flex flex-col bg-[#090D14] text-[#CBD5E0] font-sans">
          {/* Top Bar of the Recorded Workstation */}
          <div className="h-9 sm:h-10 bg-[#0C121A] border-b border-[#182332] px-3 sm:px-4 flex items-center justify-between text-xs font-mono shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-[#2563EB] to-[#48CAE4] flex items-center justify-center text-white text-[10px] font-bold">
                ⬡
              </div>
              <span className="font-bold text-[#EDF2F7] tracking-wider hidden sm:inline">
                BIO-ANALYTICAL WORKSTATION
              </span>
              <span className="text-[10px] text-[#63758A]">v2.4</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-[#7395B8] bg-[#111A24] px-2 py-0.5 rounded border border-[#1B293A]">
                TARGET: {currentTime < 10 ? 'None Loaded' : '5EW8 (Kinase Domain)'}
              </span>
              <span className="text-[10px] sm:text-xs text-[#E9C46A] bg-[#171D18] px-2 py-0.5 rounded border border-[#2B3B2B] hidden md:inline">
                LIGAND: {currentTime < 60 ? 'Pending' : 'LIG-003 Staurosporine'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                  currentTime < 90
                    ? 'bg-[#15202E] text-[#8C9BAE] border-[#203248]'
                    : currentTime < 105
                    ? 'bg-[#291F0E] text-[#E9C46A] border-[#4A3B1B] animate-pulse'
                    : 'bg-[#102B1E] text-[#4FAE7B] border-[#1C4E36]'
                }`}
              >
                {currentTime < 90 ? 'STAGE: STAGING' : currentTime < 105 ? 'STAGE: SOLVING' : 'STAGE: DOCKED'}
              </span>
            </div>
          </div>

          {/* Main Workstation Triple-Column Body */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* COLUMN 1: Left Workflow Controls (26% width on desktop) */}
            <div className="w-[30%] sm:w-[26%] bg-[#0B0F16] border-r border-[#16212E] p-2 sm:p-3 flex flex-col justify-between overflow-y-auto text-xs font-mono shrink-0">
              <div className="space-y-2.5">
                <div className="text-[10px] text-[#63758A] uppercase tracking-wider font-semibold border-b border-[#16212E] pb-1">
                  WORKFLOW PIPELINE
                </div>

                {/* Step 1: Receptor Preparation Item */}
                <div
                  className={`p-2 rounded border transition-colors ${
                    currentTime < 40 ? 'bg-[#121B26] border-[#2A4462]' : 'bg-[#0E141E] border-[#172230]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#EDF2F7]">01 RECEPTOR</span>
                    {currentTime >= 35 ? (
                      <span className="text-[9px] text-[#4FAE7B] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> PREPARED
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#7395B8]">1.85 Å X-Ray</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#8C9BAE] mt-1">
                    {currentTime < 10
                      ? 'Select PDB file...'
                      : '5EW8.pdb (Kinase Domain)'}
                  </div>
                  {currentTime >= 25 && currentTime < 40 && (
                    <div className="mt-1.5 space-y-0.5 text-[9px] text-[#48CAE4] bg-[#070D14] p-1 rounded border border-[#132336]">
                      <div>✓ Waters stripped (134 HOH)</div>
                      <div>✓ Polar Hydrogens added</div>
                      <div>✓ Kollman charges assigned</div>
                    </div>
                  )}
                </div>

                {/* Step 2: Binding Site Grid Box */}
                <div
                  className={`p-2 rounded border transition-colors ${
                    currentTime >= 40 && currentTime < 60
                      ? 'bg-[#121B26] border-[#2A4462]'
                      : 'bg-[#0E141E] border-[#172230]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#EDF2F7]">02 BINDING SITE</span>
                    <span className="text-[9px] text-[#E9C46A]">
                      {gridParams.vol} Å³
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8C9BAE] mt-1">
                    Center: [{gridParams.cx}, {gridParams.cy}, {gridParams.cz}]
                  </div>
                  <div className="text-[10px] text-[#8C9BAE]">
                    Size: {gridParams.sx} × {gridParams.sy} × {gridParams.sz} Å
                  </div>
                </div>

                {/* Step 3: Ligand Staging */}
                <div
                  className={`p-2 rounded border transition-colors ${
                    currentTime >= 60 && currentTime < 75
                      ? 'bg-[#121B26] border-[#2A4462]'
                      : 'bg-[#0E141E] border-[#172230]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#EDF2F7]">03 LIGAND</span>
                    <span className="text-[9px] text-[#48CAE4]">
                      {currentTime < 60 ? 'None' : 'LIG-003'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8C9BAE] mt-1">
                    {currentTime < 60
                      ? 'Select from library...'
                      : 'Staurosporine (MW 466.5)'}
                  </div>
                </div>

                {/* Step 4: Protocol & Execution */}
                <div
                  className={`p-2 rounded border transition-colors ${
                    currentTime >= 75 && currentTime < 105
                      ? 'bg-[#121B26] border-[#2A4462]'
                      : 'bg-[#0E141E] border-[#172230]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#EDF2F7]">04 PROTOCOL</span>
                    <span className="text-[9px] text-[#7395B8]">Exhaust: 32</span>
                  </div>
                  <div className="text-[10px] text-[#8C9BAE] mt-1">
                    AutoDock Vina Forcefield
                  </div>
                </div>
              </div>

              {/* Run Docking Button / Progress Bar */}
              <div className="mt-2 pt-2 border-t border-[#16212E]">
                {currentTime >= 90 && currentTime < 105 ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-[#48CAE4]">{dockingPhaseLabel}</span>
                      <span className="text-[#E9C46A]">{dockingProgress}%</span>
                    </div>
                    <div className="w-full bg-[#121822] rounded-full h-2 overflow-hidden border border-[#1A2634]">
                      <div
                        className="bg-gradient-to-r from-[#2563EB] to-[#48CAE4] h-full transition-all duration-300"
                        style={{ width: `${dockingProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    className={`w-full py-2 rounded text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                      currentTime >= 105
                        ? 'bg-[#152332] text-[#48CAE4] border border-[#234262]'
                        : currentTime >= 75
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#0284C7] text-white shadow-md'
                        : 'bg-[#131A24] text-[#63758A] border border-[#1C2634]'
                    }`}
                  >
                    {currentTime >= 105 ? 'Docking Calculated' : 'Run Docking (Vina)'}
                  </button>
                )}
              </div>
            </div>

            {/* COLUMN 2: Center 3D Molecular Canvas (Simulated Interactive Viewport) */}
            <div className="flex-1 relative bg-gradient-to-b from-[#080C12] via-[#0A0F17] to-[#06090E] overflow-hidden flex items-center justify-center">
              {/* Perspective Grid Floor */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg width="100%" height="100%">
                  <pattern id="view-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2563EB" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#view-grid)" />
                </svg>
              </div>

              {/* 3D Receptor & Ligand Rendering Simulation (Dynamic SVG with depth & rotation) */}
              <div className="relative w-full h-full flex items-center justify-center">
                {currentTime < 10 ? (
                  /* Empty state before receptor import */
                  <div className="text-center font-mono text-xs text-[#63758A] flex flex-col items-center gap-2">
                    <Box className="w-8 h-8 text-[#283C52] stroke-1 animate-pulse" />
                    <span>AWAITING RECEPTOR STRUCTURE IMPORT...</span>
                  </div>
                ) : (
                  <div className="relative w-[340px] sm:w-[420px] h-[240px] sm:h-[300px] flex items-center justify-center">
                    {/* SVG 3D Protein Cartoon Backbone */}
                    <svg
                      viewBox="0 0 400 300"
                      className="w-full h-full drop-shadow-xl"
                      style={{
                        transform: `rotate(${Math.sin(currentTime * 0.4) * 4}deg) scale(${
                          currentTime >= 105 ? 1.08 : 1
                        })`,
                        transition: 'transform 0.8s ease-out',
                      }}
                    >
                      <defs>
                        {/* Shaders and gradients */}
                        <linearGradient id="helix-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1E3A8A" />
                          <stop offset="50%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#60A5FA" />
                        </linearGradient>
                        <linearGradient id="helix-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0F766E" />
                          <stop offset="50%" stopColor="#14B8A6" />
                          <stop offset="100%" stopColor="#2DD4BF" />
                        </linearGradient>
                        <linearGradient id="ligand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#D97706" />
                          <stop offset="50%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#FCD34D" />
                        </linearGradient>
                      </defs>

                      {/* Surrounding Protein Alpha Helices (Cartoon Ribbons) */}
                      <g opacity="0.85">
                        {/* Background Helix 1 */}
                        <path
                          d="M 50 120 Q 90 80, 130 110 T 210 90 T 290 80"
                          fill="none"
                          stroke="url(#helix-grad-1)"
                          strokeWidth="9"
                          strokeLinecap="round"
                          className="opacity-70"
                        />
                        {/* Beta Sheet Strand 1 */}
                        <path
                          d="M 80 180 L 140 195 L 200 175 L 260 210"
                          fill="none"
                          stroke="url(#helix-grad-2)"
                          strokeWidth="7"
                          strokeLinecap="square"
                        />
                        {/* Surrounding Loops */}
                        <path
                          d="M 290 80 Q 340 120, 310 180 T 260 210"
                          fill="none"
                          stroke="#334E68"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M 50 120 Q 30 160, 80 180"
                          fill="none"
                          stroke="#334E68"
                          strokeWidth="3.5"
                        />
                        {/* Foreground Catalytic Flap Helix */}
                        <path
                          d="M 120 230 Q 180 250, 240 230 T 320 220"
                          fill="none"
                          stroke="url(#helix-grad-1)"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                      </g>

                      {/* Catalytic Residues (TYR-122, ASP-85, LEU-98, PHE-101) */}
                      <g className="font-mono text-[9px] fill-[#8C9BAE]">
                        {/* TYR-122 */}
                        <circle cx="150" cy="120" r="4.5" fill="#48CAE4" />
                        <text x="125" y="112">TYR-122</text>

                        {/* ASP-85 */}
                        <circle cx="250" cy="125" r="4.5" fill="#E76F51" />
                        <text x="256" y="122">ASP-85</text>

                        {/* PHE-101 */}
                        <circle cx="210" cy="195" r="4.5" fill="#A78BFA" />
                        <text x="218" y="202">PHE-101</text>
                      </g>

                      {/* 3D Wireframe Docking Grid Box (Visible when defined in 00:40+) */}
                      {currentTime >= 40 && (
                        <g className="opacity-90 transition-all duration-500">
                          {/* 3D Box Back Face */}
                          <polygon
                            points="140,85 270,85 270,215 140,215"
                            fill="none"
                            stroke="#48CAE4"
                            strokeWidth="1.2"
                            strokeDasharray="4 3"
                            opacity="0.4"
                          />
                          {/* 3D Box Connectors */}
                          <line x1="120" y1="95" x2="140" y2="85" stroke="#48CAE4" strokeWidth="1.2" opacity="0.6" />
                          <line x1="250" y1="95" x2="270" y2="85" stroke="#48CAE4" strokeWidth="1.2" opacity="0.6" />
                          <line x1="250" y1="225" x2="270" y2="215" stroke="#48CAE4" strokeWidth="1.2" opacity="0.6" />
                          <line x1="120" y1="225" x2="140" y2="215" stroke="#48CAE4" strokeWidth="1.2" opacity="0.6" />
                          {/* 3D Box Front Face */}
                          <polygon
                            points="120,95 250,95 250,225 120,225"
                            fill="#48CAE4"
                            fillOpacity="0.04"
                            stroke="#48CAE4"
                            strokeWidth="1.6"
                          />
                          {/* Center Marker */}
                          <circle cx="195" cy="155" r="3" fill="#E9C46A" />
                        </g>
                      )}

                      {/* Ligand Model (Appears at 01:00+, moves with poses in 01:45+) */}
                      {currentTime >= 60 && (
                        <g
                          style={{
                            transform:
                              activePoseId === 'P-001'
                                ? 'translate(0px, 0px)'
                                : activePoseId === 'P-002'
                                ? 'translate(8px, -6px) rotate(12deg)'
                                : 'translate(-10px, 8px) rotate(-18deg)',
                            transformOrigin: '195px 155px',
                            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          }}
                        >
                          {/* Ligand Stick Bonds */}
                          <line x1="165" y1="145" x2="185" y2="135" stroke="#E9C46A" strokeWidth="4" strokeLinecap="round" />
                          <line x1="185" y1="135" x2="215" y2="145" stroke="#E9C46A" strokeWidth="4" strokeLinecap="round" />
                          <line x1="215" y1="145" x2="225" y2="170" stroke="#E9C46A" strokeWidth="4" strokeLinecap="round" />
                          <line x1="225" y1="170" x2="195" y2="185" stroke="#E9C46A" strokeWidth="4" strokeLinecap="round" />
                          <line x1="195" y1="185" x2="175" y2="170" stroke="#E9C46A" strokeWidth="4" strokeLinecap="round" />
                          <line x1="175" y1="170" x2="165" y2="145" stroke="#E9C46A" strokeWidth="4" strokeLinecap="round" />
                          <line x1="185" y1="135" x2="195" y2="110" stroke="#E9C46A" strokeWidth="3.5" strokeLinecap="round" />

                          {/* Ligand Atoms (Spheres) */}
                          <circle cx="165" cy="145" r="5" fill="#48CAE4" /> {/* Nitrogen */}
                          <circle cx="185" cy="135" r="6" fill="#E9C46A" /> {/* Carbon */}
                          <circle cx="215" cy="145" r="6" fill="#E9C46A" /> {/* Carbon */}
                          <circle cx="225" cy="170" r="5.5" fill="#EF4444" /> {/* Oxygen */}
                          <circle cx="195" cy="185" r="6" fill="#E9C46A" /> {/* Carbon */}
                          <circle cx="175" cy="170" r="5" fill="#48CAE4" /> {/* Nitrogen */}
                          <circle cx="195" cy="110" r="5.5" fill="#EF4444" /> {/* Carbonyl Oxygen */}
                        </g>
                      )}

                      {/* Interactive Non-Covalent Vectors (H-bonds & Pi-stacking in 01:45+) */}
                      {currentTime >= 105 && (
                        <g className="animate-pulse">
                          {/* H-Bond to TYR-122 */}
                          <line
                            x1="150"
                            y1="120"
                            x2="165"
                            y2="145"
                            stroke="#4FAE7B"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                          />
                          <rect x="144" y="128" width="28" height="12" rx="2" fill="#0B131C" stroke="#245442" strokeWidth="0.8" />
                          <text x="147" y="137" className="font-mono text-[8px] fill-[#4FAE7B]">2.15 Å</text>

                          {/* H-Bond to ASP-85 */}
                          <line
                            x1="250"
                            y1="125"
                            x2="215"
                            y2="145"
                            stroke="#4FAE7B"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                          />
                          <rect x="228" y="130" width="28" height="12" rx="2" fill="#0B131C" stroke="#245442" strokeWidth="0.8" />
                          <text x="231" y="139" className="font-mono text-[8px] fill-[#4FAE7B]">2.42 Å</text>

                          {/* Pi-Stacking Vector to PHE-101 */}
                          <line
                            x1="210"
                            y1="195"
                            x2="195"
                            y2="185"
                            stroke="#A78BFA"
                            strokeWidth="1.8"
                            strokeDasharray="4 2"
                          />
                        </g>
                      )}
                    </svg>

                    {/* Top Left HUD: Active Molecule & Pose Energy */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 font-mono text-[10px] pointer-events-none">
                      <span className="bg-[#0B1017]/85 border border-[#1C2C3D] px-2 py-0.5 rounded text-[#7395B8]">
                        5EW8.pdb (CHAIN A • 1.85 Å)
                      </span>
                      {currentTime >= 60 && (
                        <span className="bg-[#121E2C]/90 border border-[#234263] px-2 py-0.5 rounded text-[#E9C46A] font-semibold">
                          LIG-003 • {activePoseId}
                        </span>
                      )}
                      {currentTime >= 105 && (
                        <span className="bg-[#11241C]/90 border border-[#204735] px-2 py-0.5 rounded text-[#4FAE7B] font-bold">
                          ΔG {currentPoseData.deltaG} kcal/mol (RMSD {currentPoseData.rmsd} Å)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMN 3: Right Results & Analysis Panel (28% width) */}
            <div className="w-[32%] sm:w-[28%] bg-[#0B0F16] border-l border-[#16212E] p-2 sm:p-3 flex flex-col justify-between overflow-y-auto text-xs font-mono shrink-0">
              <div className="space-y-2.5">
                <div className="text-[10px] text-[#63758A] uppercase tracking-wider font-semibold border-b border-[#16212E] pb-1">
                  CALCULATED POSES & ENERGETICS
                </div>

                {currentTime < 105 ? (
                  /* Waiting for docking run */
                  <div className="h-36 flex flex-col items-center justify-center text-center p-3 text-[#63758A] bg-[#090D14] rounded border border-[#141C26]">
                    <Layers className="w-5 h-5 mb-1 text-[#223344]" />
                    <span className="text-[10px]">AWAITING CALCULATION</span>
                    <span className="text-[8px] text-[#48CAE4] mt-1">
                      {currentTime >= 90 ? 'Vina Optimizer Running...' : 'Step 04 to execute'}
                    </span>
                  </div>
                ) : (
                  /* Pose Ranking Table (01:45+) */
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-3 text-[9px] text-[#63758A] px-1 font-semibold">
                      <span>POSE</span>
                      <span>ΔG (kcal)</span>
                      <span>RMSD</span>
                    </div>
                    {(['P-001', 'P-002', 'P-003'] as const).map((pid) => (
                      <div
                        key={pid}
                        className={`p-1.5 rounded border text-[10px] flex items-center justify-between transition-all ${
                          activePoseId === pid
                            ? 'bg-[#182738] border-[#38628F] text-[#EDF2F7] font-bold shadow-inner'
                            : 'bg-[#0E141F] border-[#16212E] text-[#8C9BAE]'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {activePoseId === pid && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#48CAE4]" />
                          )}
                          {pid}
                        </span>
                        <span className="text-[#4FAE7B]">
                          {pid === 'P-001' ? '−9.20' : pid === 'P-002' ? '−8.74' : '−8.15'}
                        </span>
                        <span className="text-[#7395B8]">
                          {pid === 'P-001' ? '1.23 Å' : pid === 'P-002' ? '1.95 Å' : '2.84 Å'}
                        </span>
                      </div>
                    ))}

                    {/* Thermodynamic Energy Decomposition Bars (02:15+) */}
                    <div className="mt-2 pt-2 border-t border-[#16212E] space-y-1 text-[9px]">
                      <div className="text-[#8C9BAE] uppercase font-semibold">
                        Free Energy Breakdown (Vina)
                      </div>
                      <div className="space-y-1 bg-[#090D14] p-1.5 rounded border border-[#141E2A]">
                        <div className="flex justify-between text-[#7395B8]">
                          <span>vdW Dispersion:</span>
                          <span className="text-[#48CAE4]">−6.42 kcal</span>
                        </div>
                        <div className="w-full bg-[#111722] h-1 rounded overflow-hidden">
                          <div className="bg-[#48CAE4] h-full w-[75%]" />
                        </div>

                        <div className="flex justify-between text-[#7395B8]">
                          <span>Electrostatics:</span>
                          <span className="text-[#4FAE7B]">−2.10 kcal</span>
                        </div>
                        <div className="w-full bg-[#111722] h-1 rounded overflow-hidden">
                          <div className="bg-[#4FAE7B] h-full w-[45%]" />
                        </div>

                        <div className="flex justify-between text-[#7395B8]">
                          <span>H-Bond Potential:</span>
                          <span className="text-[#E9C46A]">−1.85 kcal</span>
                        </div>
                        <div className="w-full bg-[#111722] h-1 rounded overflow-hidden">
                          <div className="bg-[#E9C46A] h-full w-[38%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action / Export button */}
              <div className="mt-2 pt-2 border-t border-[#16212E]">
                <div
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-[10px] font-semibold border transition-all ${
                    currentTime >= 150
                      ? 'bg-[#183626] border-[#2A6647] text-[#4FAE7B]'
                      : 'bg-[#131C28] border-[#1F2E40] text-[#7395B8]'
                  }`}
                >
                  <FileDown className="w-3 h-3" />
                  <span>{currentTime >= 155 ? 'Report Exported (PDBQT/CSV)' : 'Export Dossier'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATED USER CURSOR POINTER */}
          {cursorState.visible && (
            <div
              className="absolute pointer-events-none z-30 transition-all duration-700 ease-out"
              style={{
                left: `${cursorState.x}%`,
                top: `${cursorState.y}%`,
              }}
            >
              {/* Cursor Arrow */}
              <div className="relative">
                <svg
                  className="w-5 h-5 text-white drop-shadow-lg fill-white stroke-black"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path d="M3 3l7 18 3-7 7-3L3 3z" />
                </svg>
                {/* Click Ripple Effect */}
                {cursorState.clicking && (
                  <span className="absolute -top-2 -left-2 w-8 h-8 rounded-full border-2 border-[#48CAE4] bg-[#48CAE4]/20 animate-ping" />
                )}
                {/* Cursor Action Tooltip Badge */}
                {cursorState.label && (
                  <span className="absolute left-4 top-2 whitespace-nowrap bg-[#0F1722]/90 border border-[#20344B] text-[9px] font-mono text-[#48CAE4] px-1.5 py-0.5 rounded shadow">
                    {cursorState.label}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* NARRATION / STEP CAPTION HUD OVERLAY */}
          <div className="absolute bottom-12 left-3 right-3 sm:left-6 sm:right-6 z-20 pointer-events-none">
            <div className="bg-[#0B1017]/90 border border-[#203042] backdrop-blur-md px-3 sm:px-4 py-2 rounded-lg shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#48CAE4] font-bold bg-[#132232] px-2 py-0.5 rounded border border-[#203A58]">
                  {formatTime(currentTime)} • {currentStage.title}
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#EDF2F7]">
                  {currentStage.subtitle}
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#8C9BAE] hidden md:block">
                AutoDock Vina Forcefield • Real-time coordinate inspection
              </div>
            </div>
          </div>

          {/* VIDEO CONTROLS BAR (Bottom) */}
          <div className="h-10 sm:h-11 bg-[#090D14]/95 border-t border-[#182434] px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-30">
            {/* Play / Pause & Restart */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#15202E] hover:bg-[#1E3046] text-[#48CAE4] hover:text-white transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              <button
                onClick={() => handleSeek(0)}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#111722] hover:bg-[#182332] text-[#8C9BAE] hover:text-[#EDF2F7] transition-colors cursor-pointer"
                title="Restart from beginning"
                aria-label="Restart"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Time display */}
              <span className="font-mono text-[11px] text-[#8C9BAE] ml-1">
                <span className="text-[#EDF2F7] font-semibold">{formatTime(currentTime)}</span>
                <span className="text-[#556980]"> / </span>
                <span>{formatTime(TOTAL_DURATION)}</span>
              </span>
            </div>

            {/* Scrubbable Progress Bar */}
            <div
              ref={timelineRef}
              onMouseMove={(e) => {
                if (!timelineRef.current) return;
                const rect = timelineRef.current.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                setTimelineHoverTime(Math.max(0, Math.min(TOTAL_DURATION, ratio * TOTAL_DURATION)));
                setTimelineHoverX(e.clientX - rect.left);
                setIsHoveringTimeline(true);
              }}
              onMouseLeave={() => setIsHoveringTimeline(false)}
              onClick={(e) => {
                if (!timelineRef.current) return;
                const rect = timelineRef.current.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                handleSeek(ratio * TOTAL_DURATION);
              }}
              className="flex-1 h-6 flex items-center cursor-pointer relative group/bar"
            >
              {/* Background Track */}
              <div className="w-full h-1.5 group-hover/bar:h-2.5 bg-[#141C26] rounded-full overflow-hidden transition-all relative">
                {/* Stage markers ticks */}
                {stages.map((stg) => (
                  <div
                    key={stg.id}
                    className="absolute top-0 bottom-0 w-0.5 bg-[#090D14]"
                    style={{ left: `${(stg.start / TOTAL_DURATION) * 100}%` }}
                  />
                ))}

                {/* Filled Progress */}
                <div
                  className="h-full bg-gradient-to-r from-[#2563EB] to-[#48CAE4] rounded-full"
                  style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
                />
              </div>

              {/* Scrubber Thumb */}
              <div
                className="absolute w-3 h-3 rounded-full bg-[#48CAE4] shadow-md border-2 border-white -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity"
                style={{ left: `${(currentTime / TOTAL_DURATION) * 100}%` }}
              />

              {/* Hover Timestamp Tooltip */}
              {isHoveringTimeline && (
                <div
                  className="absolute bottom-6 -translate-x-1/2 bg-[#0E1520] border border-[#22354A] px-2 py-0.5 rounded text-[10px] font-mono text-[#EDF2F7] pointer-events-none shadow"
                  style={{ left: `${timelineHoverX}px` }}
                >
                  {formatTime(timelineHoverTime)}
                </div>
              )}
            </div>

            {/* Right Controls: Playback Speed, Mute & Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Playback Speed selector */}
              <button
                onClick={() => {
                  const speeds = [1, 1.25, 1.5, 2];
                  const idx = speeds.indexOf(playbackSpeed);
                  setPlaybackSpeed(speeds[(idx + 1) % speeds.length]);
                }}
                className="px-2 py-0.5 rounded bg-[#111722] hover:bg-[#192433] border border-[#1E2C3C] text-[10px] font-mono text-[#8C9BAE] hover:text-[#EDF2F7] transition-colors cursor-pointer"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {/* Volume / Sound toggle */}
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#111722] hover:bg-[#192433] text-[#8C9BAE] hover:text-[#EDF2F7] transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#48CAE4]" />}
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#111722] hover:bg-[#192433] text-[#8C9BAE] hover:text-[#EDF2F7] transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STEP INDICATOR BELOW VIDEO: 01 Prepare -> 02 Define -> 03 Dock -> 04 Analyze */}
      <div className="mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
          {majorSteps.map((step) => {
            const isActive = currentStage.stepKey === step.id;
            return (
              <button
                key={step.id}
                onClick={() => {
                  handleSeek(step.timestamp);
                  if (!isPlaying) setIsPlaying(true);
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#101C2B] border-[#2A4D73] text-[#EDF2F7] shadow-lg shadow-blue-950/20'
                    : 'bg-[#0B0F16] border-[#182330] text-[#718096] hover:text-[#A0AEC0] hover:border-[#223344]'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${isActive ? 'text-[#48CAE4]' : 'text-[#536882]'}`}>
                    {step.number} {step.label}
                  </span>
                  <span className="text-[10px] text-[#63758A]">
                    {formatTime(step.timestamp)}
                  </span>
                </div>
                <div className="text-[11px] text-[#8C9BAE] mt-1 line-clamp-1 font-sans">
                  {step.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Direct Quick Launch Bridge into the real 3D Workstation */}
      <div className="mt-6 p-4 rounded-lg bg-[#0E1520] border border-[#1A2838] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <div className="text-xs font-mono font-bold text-[#EDF2F7]">
            WANT TO TEST THIS WORKFLOW DIRECTLY?
          </div>
          <div className="text-xs text-[#8C9BAE] mt-0.5">
            Launch the 3D studio with the 5EW8 kinase domain and LIG-003 Staurosporine preset pre-loaded.
          </div>
        </div>

        <button
          onClick={() => setUI((prev) => ({ ...prev, activeModule: 'workspace' }))}
          className="flex items-center gap-2 px-4 py-2.5 rounded bg-[#172738] hover:bg-[#20364E] border border-[#274567] text-[#48CAE4] hover:text-[#78E0F5] font-mono text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          <span>Open Real 3D Workstation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
