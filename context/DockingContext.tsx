'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import {
  Project,
  Receptor,
  BindingSite,
  Ligand,
  DockingProtocol,
  Pose,
  Interaction,
  EnergyProfile,
  CompoundProperties,
  AdmetPrediction,
  DockingRun,
  UIState,
  LogEntry,
  DockingSession,
  BindingPocket,
  GridSearchParams,
  PocketSearchStats,
} from '@/types/docking';
import {
  initialProject,
  initialReceptor,
  initialBindingSite,
  initialLigands,
  initialProtocol,
  posesByLigand,
  getEnergyProfileForPose,
  getInteractionsForPose,
  getInterpretationForPose,
  getAdmetForLigand,
} from '@/data/initialData';
import {
  getAllSessions,
  saveSessionToStorage,
  deleteSessionFromStorage,
  duplicateSession,
  exportSessionToFile,
  importSessionFromJson,
  seedPresetSessionsIfEmpty,
} from '@/lib/indexedDbStorage';
import {
  DEFAULT_GRID_SEARCH_PARAMS,
  getInitialPocketsForReceptor,
  executeGridSurfaceSearch,
} from '@/lib/pocketSearchAlgorithm';

interface DockingContextType {
  project: Project;
  receptor: Receptor;
  bindingSite: BindingSite;
  ligands: Ligand[];
  dockingProtocol: DockingProtocol;
  dockingRun: DockingRun;
  poses: Pose[];
  selectedLigandId: string;
  selectedPoseId: string;
  activeLigand: Ligand;
  activePose: Pose;
  interactions: Interaction[];
  energyProfile: EnergyProfile;
  compoundProperties: CompoundProperties;
  admet: AdmetPrediction;
  interpretation: string;
  ui: UIState;
  logs: LogEntry[];
  toastMessage: string | null;

  // IndexedDB Session Management
  currentSessionId: string | null;
  sessionsList: DockingSession[];
  isLoadingSessions: boolean;
  loadSession: (session: DockingSession) => void;
  saveCurrentSessionToStorage: (customName?: string, customDesc?: string, tags?: string[]) => Promise<DockingSession>;
  deleteSessionById: (id: string) => Promise<void>;
  duplicateSessionById: (id: string, newTitle?: string) => Promise<DockingSession | null>;
  refreshSessionsList: () => Promise<void>;
  importSessionFromData: (jsonStr: string) => Promise<DockingSession>;
  exportCurrentSessionFile: () => void;

  // Actions
  setProject: (update: Partial<Project>) => void;
  updateReceptor: (update: Partial<Receptor>) => void;
  prepareReceptor: () => Promise<void>;
  updateBindingSite: (update: Partial<BindingSite>) => void;
  autoDetectBindingSite: () => void;
  updateDockingProtocol: (update: Partial<DockingProtocol>) => void;
  selectLigand: (ligandId: string) => void;
  addLigand: (ligand: Partial<Ligand>) => void;
  importPdbFile: (file: File) => Promise<void>;
  importSdfFile: (file: File) => Promise<void>;
  importSmiles: (smiles: string, name?: string) => void;
  selectPose: (poseId: string) => void;
  runDockingCalculation: () => Promise<void>;
  setUI: React.Dispatch<React.SetStateAction<UIState>>;
  toggleModal: (modalName: keyof UIState['modals'], open?: boolean) => void;
  exportCsvResults: () => void;
  exportPdbqtFile: () => void;
  exportReportManifest: () => void;
  shareWorkspaceLink: () => Promise<string>;
  addLog: (message: string, level?: LogEntry['level']) => void;
  resetToDefaults: () => void;
  showToast: (msg: string) => void;
  clearToast: () => void;

  // Pocket Search & Target Suggestion
  pockets: BindingPocket[];
  selectedPocketId: string | null;
  selectedPocket: BindingPocket | null;
  isSearchingPockets: boolean;
  searchProgress: number;
  searchPhaseText: string;
  searchParams: GridSearchParams;
  searchStats: PocketSearchStats | null;
  setSearchParams: (params: Partial<GridSearchParams>) => void;
  runGridPocketSearch: (params?: Partial<GridSearchParams>) => Promise<BindingPocket[]>;
  applyPocketAsBindingSite: (pocket: BindingPocket) => void;
  selectPocket: (pocketId: string | null) => void;
}

const DockingContext = createContext<DockingContextType | undefined>(undefined);

const initialUI: UIState = {
  representation: 'Cartoon',
  colorScheme: 'CPK',
  showHBonds: true,
  showHydrophobic: true,
  showWaterSolvation: false,
  showResidueLabels: true,
  showGridBox: true,
  showPocketCavity: true,
  isOrtho: true,
  activeModule: 'landing',
  modals: {
    ligandLibrary: false,
    receptorUpload: false,
    exportReport: false,
    shareWorkspace: false,
    smilesInput: false,
    projectManager: false,
    pocketSearch: false,
  },
};

export const DockingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProjectState] = useState<Project>(initialProject);
  const [receptor, setReceptorState] = useState<Receptor>(initialReceptor);
  const [bindingSite, setBindingSiteState] = useState<BindingSite>(initialBindingSite);
  const [ligands, setLigands] = useState<Ligand[]>(initialLigands);
  const [dockingProtocol, setDockingProtocolState] = useState<DockingProtocol>(initialProtocol);
  const [selectedLigandId, setSelectedLigandId] = useState<string>('LIG-003');
  const [poses, setPoses] = useState<Pose[]>(posesByLigand['LIG-003']);
  const [selectedPoseId, setSelectedPoseId] = useState<string>('P-001');
  const [dockingRun, setDockingRun] = useState<DockingRun>({
    status: 'idle',
    progress: 100,
    currentPhaseText: 'Docking Complete (Converged)',
    runId: '#9842',
    savedTimestamp: '15:08:42',
  });
  const [ui, setUI] = useState<UIState>(initialUI);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>('session-preset-5ew8');
  const [sessionsList, setSessionsList] = useState<DockingSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);

  // Pocket Search & Target Suggestion state
  const [pockets, setPockets] = useState<BindingPocket[]>(() =>
    getInitialPocketsForReceptor(initialReceptor, DEFAULT_GRID_SEARCH_PARAMS)
  );
  const [selectedPocketId, setSelectedPocketId] = useState<string | null>(() => pockets[0]?.id || null);
  const [isSearchingPockets, setIsSearchingPockets] = useState<boolean>(false);
  const [searchProgress, setSearchProgress] = useState<number>(0);
  const [searchPhaseText, setSearchPhaseText] = useState<string>('');
  const [searchParams, setSearchParamsState] = useState<GridSearchParams>(DEFAULT_GRID_SEARCH_PARAMS);
  const [searchStats, setSearchStats] = useState<PocketSearchStats | null>({
    totalGridPoints: 48200,
    proteinSurfaceProbes: 15420,
    cavityClustersIdentified: 4,
    executionDurationMs: 1420,
    timestamp: 'Baseline',
  });

  const selectedPocket = useMemo(() => {
    return pockets.find((p) => p.id === selectedPocketId) || pockets[0] || null;
  }, [pockets, selectedPocketId]);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: '15:02:11',
      level: 'INFO',
      message: 'Workstation initialized. Ready for coordinate staging.',
    },
    {
      id: 'log-2',
      timestamp: '15:05:40',
      level: 'INFO',
      message: 'Receptor 5EW8.pdb coordinate topology validated. Kollman charges assigned.',
    },
    {
      id: 'log-3',
      timestamp: '15:07:22',
      level: 'SUCCESS',
      message: 'Pose ranking converged. 5EW8-LIG003 conformer P-001 RMSD 1.23 Å (ΔG −9.20 kcal/mol)',
    },
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
      level,
      message,
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  }, []);

  // Initialize and refresh IndexedDB session repository
  const refreshSessionsList = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const list = await getAllSessions();
      setSessionsList(list);
    } catch (err) {
      console.error('Failed to load sessions from IndexedDB:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const seeded = await seedPresetSessionsIfEmpty();
        if (isMounted) {
          setSessionsList(seeded);
          setIsLoadingSessions(false);
        }
      } catch (e) {
        console.error('Error seeding/reading IndexedDB sessions:', e);
        if (isMounted) setIsLoadingSessions(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load an existing session into the active workspace
  const loadSession = useCallback(
    (session: DockingSession) => {
      setProjectState(session.project);
      setReceptorState(session.receptor);
      setBindingSiteState(session.bindingSite);
      setLigands(session.ligands);
      setDockingProtocolState(session.dockingProtocol);
      setDockingRun(session.dockingRun);
      setSelectedLigandId(session.selectedLigandId);
      setSelectedPoseId(session.selectedPoseId);
      setPoses(session.poses);
      if (session.logs && session.logs.length > 0) {
        setLogs(session.logs);
      }
      setCurrentSessionId(session.id);
      addLog(`Loaded docking session "${session.name}" from IndexedDB. Target: ${session.metadata.targetPdb}`, 'SUCCESS');
      showToast(`Loaded session: ${session.name}`);
      setUI((prev) => ({
        ...prev,
        activeModule: 'workspace',
        modals: {
          ...prev.modals,
          projectManager: false,
        },
      }));
    },
    [addLog, showToast]
  );

  // Save the current workspace state to IndexedDB
  const saveCurrentSessionToStorage = useCallback(
    async (customName?: string, customDesc?: string, tags?: string[]): Promise<DockingSession> => {
      const now = Date.now();
      const existingSession = currentSessionId ? sessionsList.find((s) => s.id === currentSessionId) : null;

      const sessionId = currentSessionId && !customName ? currentSessionId : `session-${now}-${Math.random().toString(36).substring(2, 6)}`;
      const sessionName = customName || (existingSession ? existingSession.name : `${project.name} - ${project.runName}`);
      const sessionDesc = customDesc || (existingSession ? existingSession.description : project.description || 'Molecular docking session snapshot');
      const sessionTags = tags && tags.length > 0 ? tags : (existingSession ? existingSession.tags : ['User-Session', 'AutoDock Vina']);

      const bestDeltaG = poses.length > 0 ? Math.min(...poses.map((p) => p.deltaG)) : -8.5;

      const newSession: DockingSession = {
        id: sessionId,
        name: sessionName,
        description: sessionDesc,
        createdAt: existingSession ? existingSession.createdAt : now,
        updatedAt: now,
        tags: sessionTags,
        isPreset: false,
        metadata: {
          targetPdb: receptor.filename,
          targetName: receptor.name,
          bestDeltaG,
          ligandCount: ligands.length,
          posesCount: poses.length,
          engine: dockingProtocol.engine,
          status: dockingRun.status === 'idle' || dockingRun.status === 'completed' ? 'Completed' : 'In Progress',
        },
        project: {
          ...project,
          name: sessionName,
          runName: project.runName || `Run_${new Date(now).toISOString().slice(11, 19).replace(/:/g, '')}`,
        },
        receptor,
        bindingSite,
        ligands,
        dockingProtocol,
        dockingRun,
        selectedLigandId,
        selectedPoseId,
        poses,
        posesByLigand,
        logs,
      };

      await saveSessionToStorage(newSession);
      setCurrentSessionId(newSession.id);
      await refreshSessionsList();
      addLog(`Saved session "${newSession.name}" to browser IndexedDB.`, 'SUCCESS');
      showToast(`Session saved to IndexedDB: ${newSession.name}`);
      return newSession;
    },
    [
      currentSessionId,
      sessionsList,
      project,
      receptor,
      bindingSite,
      ligands,
      dockingProtocol,
      dockingRun,
      selectedLigandId,
      selectedPoseId,
      poses,
      logs,
      refreshSessionsList,
      addLog,
      showToast,
    ]
  );

  const deleteSessionById = useCallback(
    async (id: string) => {
      await deleteSessionFromStorage(id);
      if (currentSessionId === id) {
        setCurrentSessionId(null);
      }
      await refreshSessionsList();
      addLog(`Removed docking session (${id}) from IndexedDB storage.`, 'INFO');
      showToast('Session removed from IndexedDB.');
    },
    [currentSessionId, refreshSessionsList, addLog, showToast]
  );

  const duplicateSessionById = useCallback(
    async (id: string, newTitle?: string) => {
      const clone = await duplicateSession(id, newTitle);
      if (clone) {
        await refreshSessionsList();
        addLog(`Duplicated session as "${clone.name}".`, 'SUCCESS');
        showToast(`Duplicated session: ${clone.name}`);
      }
      return clone;
    },
    [refreshSessionsList, addLog, showToast]
  );

  const importSessionFromData = useCallback(
    async (jsonStr: string) => {
      const imported = await importSessionFromJson(jsonStr);
      await refreshSessionsList();
      addLog(`Imported session "${imported.name}" from JSON file.`, 'SUCCESS');
      showToast(`Imported session: ${imported.name}`);
      return imported;
    },
    [refreshSessionsList, addLog, showToast]
  );

  const exportCurrentSessionFile = useCallback(() => {
    const current = sessionsList.find((s) => s.id === currentSessionId);
    if (current) {
      exportSessionToFile(current);
      showToast(`Exported session file: ${current.name}`);
    } else {
      const now = Date.now();
      const bestDeltaG = poses.length > 0 ? Math.min(...poses.map((p) => p.deltaG)) : -8.5;
      const snapshot: DockingSession = {
        id: `session-export-${now}`,
        name: `${project.name} - ${project.runName}`,
        description: project.description,
        createdAt: now,
        updatedAt: now,
        tags: ['Export', 'AutoDock Vina'],
        metadata: {
          targetPdb: receptor.filename,
          targetName: receptor.name,
          bestDeltaG,
          ligandCount: ligands.length,
          posesCount: poses.length,
          engine: dockingProtocol.engine,
          status: 'Completed',
        },
        project,
        receptor,
        bindingSite,
        ligands,
        dockingProtocol,
        dockingRun,
        selectedLigandId,
        selectedPoseId,
        poses,
        posesByLigand,
        logs,
      };
      exportSessionToFile(snapshot);
      showToast(`Exported session: ${snapshot.name}`);
    }
  }, [sessionsList, currentSessionId, project, receptor, bindingSite, ligands, dockingProtocol, dockingRun, selectedLigandId, selectedPoseId, poses, logs, showToast]);

  // Active ligand
  const activeLigand = useMemo(() => {
    return ligands.find((l) => l.id === selectedLigandId) || ligands[0];
  }, [ligands, selectedLigandId]);

  // Active pose
  const activePose = useMemo(() => {
    return poses.find((p) => p.id === selectedPoseId) || poses[0];
  }, [poses, selectedPoseId]);

  // Derived state that updates whenever selectedPose or selectedLigand changes
  const interactions = useMemo(() => {
    return getInteractionsForPose(activePose);
  }, [activePose]);

  const energyProfile = useMemo(() => {
    return getEnergyProfileForPose(activePose);
  }, [activePose]);

  const compoundProperties = useMemo(() => {
    return {
      ligandId: activeLigand.id,
      mw: activeLigand.molecularWeight,
      logP: activeLigand.logP,
      tpsa: activeLigand.tpsa,
      hbd: activeLigand.hbd,
      hba: activeLigand.hba,
      rotBonds: activeLigand.rotatableBonds,
    };
  }, [activeLigand]);

  const admet = useMemo(() => {
    return getAdmetForLigand(activeLigand);
  }, [activeLigand]);

  const interpretation = useMemo(() => {
    return getInterpretationForPose(activePose, activeLigand);
  }, [activePose, activeLigand]);

  // Select a ligand: update everything
  const selectLigand = useCallback((ligandId: string) => {
    setSelectedLigandId(ligandId);
    setLigands((prev) =>
      prev.map((l) => ({
        ...l,
        status: l.id === ligandId ? 'Active' : 'Queued',
      }))
    );
    // Populate or generate deterministic poses for this ligand
    const existingPoses = posesByLigand[ligandId];
    if (existingPoses && existingPoses.length > 0) {
      setPoses(existingPoses);
      setSelectedPoseId(existingPoses[0].id);
    } else {
      // Deterministic generation based on ligand properties
      const targetLigand = ligands.find((l) => l.id === ligandId);
      const baseAffinity = targetLigand ? -8.5 - (targetLigand.molecularWeight % 3.0) : -8.5;
      const genPoses: Pose[] = Array.from({ length: 6 }).map((_, i) => ({
        id: `P-${ligandId.replace('LIG-', '')}0${i + 1}`,
        rank: i + 1,
        ligandId,
        deltaG: Number((baseAffinity + i * 0.45).toFixed(2)),
        rmsd: Number((1.1 + i * 0.4).toFixed(2)),
        hBondsCount: Math.max(0, 4 - Math.floor(i / 1.5)),
        hydrophobicCount: Math.max(1, 7 - i),
        clashScore: Number((i * 0.04).toFixed(2)),
        status: i === 0 ? 'Optimal' : i < 4 ? 'Active' : 'Sub-optimal',
        conformerIndex: i + 1,
      }));
      setPoses(genPoses);
      setSelectedPoseId(genPoses[0].id);
    }
    addLog(`Active ligand switched to ${ligandId}. Conformations and ADMET synced.`, 'INFO');
  }, [ligands, addLog]);

  // Select a pose: updates viewer, interactions, energy, interpretation
  const selectPose = useCallback((poseId: string) => {
    setSelectedPoseId(poseId);
    const targetPose = poses.find((p) => p.id === poseId);
    if (targetPose) {
      addLog(
        `Selected conformation ${poseId} (Rank #${targetPose.rank}, ΔG ${targetPose.deltaG} kcal/mol, RMSD ${targetPose.rmsd} Å).`,
        'INFO'
      );
    }
  }, [poses, addLog]);

  // Prepare receptor workflow
  const prepareReceptor = useCallback(async () => {
    if (receptor.preparationStatus === 'preparing') return;
    setReceptorState((prev) => ({
      ...prev,
      preparationStatus: 'preparing',
      progress: 15,
    }));
    addLog(`Preparing receptor ${receptor.filename}: Computing protonation states at pH 7.4...`, 'INFO');

    await new Promise((r) => setTimeout(r, 600));
    setReceptorState((prev) => ({ ...prev, progress: 55 }));
    addLog('Assigning Gasteiger-Marsili atomic partial charges and removing crystallographic waters...', 'INFO');

    await new Promise((r) => setTimeout(r, 800));
    setReceptorState((prev) => ({
      ...prev,
      preparationStatus: 'prepared',
      progress: 100,
    }));
    addLog('Receptor prepared successfully. Search space cavity unlocked.', 'SUCCESS');
    showToast(`Receptor prepared: ${receptor.filename.replace('.pdb', '')}_PROT.pdbqt ready for grid specification.`);
  }, [receptor.preparationStatus, receptor.filename, addLog, showToast]);

  // Run Docking Workflow with 5 distinct phases
  const runDockingCalculation = useCallback(async () => {
    if (dockingRun.status !== 'idle' && dockingRun.status !== 'completed') {
      return;
    }
    if (receptor.preparationStatus !== 'prepared') {
      showToast('Please prepare the receptor before running docking calculations.');
      return;
    }
    if (ligands.length === 0) {
      showToast('Error: Add at least one ligand to the screening library.');
      return;
    }

    addLog('Phase 1/5: Initializing AutoDock Vina v1.2.5 calculation engine...', 'INFO');
    setDockingRun({
      status: 'preparing',
      progress: 10,
      currentPhaseText: 'Preparing docking workspace & search space...',
      runId: `#${Math.floor(1000 + Math.random() * 9000)}`,
      savedTimestamp: new Date().toTimeString().split(' ')[0],
    });

    await new Promise((r) => setTimeout(r, 700));

    addLog(`Phase 2/5: Preparing ${ligands.length} library ligands: resolving rotatable bonds...`, 'INFO');
    setDockingRun((prev) => ({
      ...prev,
      status: 'preparing_ligands',
      progress: 30,
      currentPhaseText: `Staging ${ligands.length} candidate ligand conformers...`,
    }));

    await new Promise((r) => setTimeout(r, 900));

    addLog('Phase 3/5: Monte Carlo global optimization & energy minimization in progress...', 'INFO');
    setDockingRun((prev) => ({
      ...prev,
      status: 'docking',
      progress: 65,
      currentPhaseText: 'Docking in progress: Iterating energy gradients (GPU CUDA)...',
    }));

    await new Promise((r) => setTimeout(r, 1100));

    addLog('Phase 4/5: Clustering conformations and ranking poses by empirical ΔG...', 'INFO');
    setDockingRun((prev) => ({
      ...prev,
      status: 'ranking',
      progress: 88,
      currentPhaseText: 'Ranking poses & computing intermolecular contact vectors...',
    }));

    await new Promise((r) => setTimeout(r, 700));

    // Finish calculation: deterministic poses for active ligand
    const availablePoses = posesByLigand[selectedLigandId] || poses;
    setPoses(availablePoses);
    setSelectedPoseId(availablePoses[0].id);

    setDockingRun((prev) => ({
      ...prev,
      status: 'completed',
      progress: 100,
      currentPhaseText: 'Docking Complete: 10 Poses Converged',
      savedTimestamp: new Date().toTimeString().split(' ')[0],
    }));

    addLog(
      `Phase 5/5: Docking complete. Top pose ${availablePoses[0].id} affinity: ${availablePoses[0].deltaG} kcal/mol.`,
      'SUCCESS'
    );
    showToast(`Docking converged: Top pose ${availablePoses[0].id} (ΔG ${availablePoses[0].deltaG} kcal/mol)`);
  }, [dockingRun.status, receptor.preparationStatus, ligands.length, selectedLigandId, poses, addLog, showToast]);

  const updateBindingSite = useCallback((update: Partial<BindingSite>) => {
    setBindingSiteState((prev) => {
      const next = { ...prev, ...update };
      // recalculate volume
      next.volume = Number((next.size.x * next.size.y * next.size.z).toFixed(1));
      return next;
    });
  }, []);

  const setSearchParams = useCallback((update: Partial<GridSearchParams>) => {
    setSearchParamsState((prev) => ({ ...prev, ...update }));
  }, []);

  const selectPocket = useCallback((id: string | null) => {
    setSelectedPocketId(id);
  }, []);

  const applyPocketAsBindingSite = useCallback(
    (pocket: BindingPocket) => {
      updateBindingSite({
        center: pocket.center,
        size: pocket.suggestedDimensions,
        name: `${pocket.name} (Pocket #${pocket.rank})`,
        referenceResidues: pocket.liningResidues,
        showGrid: true,
      });
      setUI((prev) => ({ ...prev, showGridBox: true }));
      addLog(
        `Applied pocket #${pocket.rank} (${pocket.name}) as active docking grid box. Center: [${pocket.center.x.toFixed(2)}, ${pocket.center.y.toFixed(2)}, ${pocket.center.z.toFixed(2)}] Å, Dscore: ${pocket.druggabilityScore}.`,
        'SUCCESS'
      );
      showToast(`Docking grid targeted to pocket #${pocket.rank}: ${pocket.name}`);
    },
    [updateBindingSite, addLog, showToast]
  );

  const runGridPocketSearch = useCallback(
    async (customParams?: Partial<GridSearchParams>): Promise<BindingPocket[]> => {
      const activeParams = { ...searchParams, ...customParams };
      if (customParams) {
        setSearchParamsState(activeParams);
      }
      setIsSearchingPockets(true);
      setSearchProgress(5);
      setSearchPhaseText('Initializing 3D spatial grid probe across protein surface...');
      addLog(
        `Initiating grid-based pocket search (${activeParams.algorithm}, probe: ${activeParams.probeRadius} Å, step: ${activeParams.gridSpacing} Å)...`,
        'INFO'
      );

      try {
        const { pockets: detectedPockets, stats } = await executeGridSurfaceSearch(
          receptor,
          activeParams,
          (progress, text) => {
            setSearchProgress(progress);
            setSearchPhaseText(text);
          }
        );

        setPockets(detectedPockets);
        setSearchStats(stats);
        if (detectedPockets.length > 0) {
          setSelectedPocketId(detectedPockets[0].id);
        }
        setIsSearchingPockets(false);
        addLog(
          `Grid search complete: Delineated ${detectedPockets.length} potential binding pockets on ${receptor.filename}. Top Dscore: ${detectedPockets[0]?.druggabilityScore ?? 'N/A'}.`,
          'SUCCESS'
        );
        showToast(`Grid search identified ${detectedPockets.length} binding pockets on ${receptor.filename}.`);
        return detectedPockets;
      } catch (err) {
        console.error('Pocket search error:', err);
        setIsSearchingPockets(false);
        addLog('Error executing grid pocket search.', 'ERROR');
        return pockets;
      }
    },
    [searchParams, receptor, addLog, showToast, pockets]
  );

  const autoDetectBindingSite = useCallback(() => {
    if (pockets.length > 0) {
      applyPocketAsBindingSite(pockets[0]);
    } else {
      updateBindingSite({
        center: { x: 12.40, y: -4.20, z: 8.15 },
        size: { x: 22.0, y: 22.0, z: 20.0 },
        name: 'Auto-Detected Binding Pocket (TYR-122 / ASP-85)',
      });
      addLog('Cavity detection completed: Binding pocket center located at [12.40, -4.20, 8.15] Å.', 'SUCCESS');
      showToast('Binding site detected: 22.0 × 22.0 × 20.0 Å search grid centered on TYR-122 / ASP-85');
    }
  }, [pockets, applyPocketAsBindingSite, updateBindingSite, addLog, showToast]);

  const updateReceptor = useCallback((update: Partial<Receptor>) => {
    setReceptorState((prev) => ({ ...prev, ...update }));
  }, []);

  const setProject = useCallback((update: Partial<Project>) => {
    setProjectState((prev) => ({ ...prev, ...update }));
  }, []);

  const updateDockingProtocol = useCallback((update: Partial<DockingProtocol>) => {
    setDockingProtocolState((prev) => ({ ...prev, ...update }));
  }, []);

  const toggleModal = useCallback((modalName: keyof UIState['modals'], open?: boolean) => {
    setUI((prev) => ({
      ...prev,
      modals: {
        ...prev.modals,
        [modalName]: open !== undefined ? open : !prev.modals[modalName],
      },
    }));
  }, []);

  // Import files
  const importPdbFile = useCallback(async (file: File) => {
    addLog(`Loading receptor coordinate file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`, 'INFO');
    await new Promise((r) => setTimeout(r, 500));
    setReceptorState((prev) => ({
      ...prev,
      filename: file.name,
      name: file.name.replace(/\.[^/.]+$/, '').toUpperCase() + ' Target Structure',
      preparationStatus: 'prepared',
      atomCount: 2614,
      residuesCount: 312,
    }));
    addLog(`Receptor ${file.name} successfully imported and staged for grid generation.`, 'SUCCESS');
    showToast(`Receptor loaded: ${file.name} (312 residues)`);
  }, [addLog, showToast]);

  const importSdfFile = useCallback(async (file: File) => {
    addLog(`Parsing SDF chemical structure library: ${file.name}...`, 'INFO');
    await new Promise((r) => setTimeout(r, 600));
    const newLigand: Ligand = {
      id: `LIG-0${ligands.length + 1}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      formula: 'C21H26N4O4',
      molecularWeight: 398.46,
      smiles: 'CC(C)N1CCN(CC1)C(=O)C2=CC=C(C=C2)NC(=O)C3=CN=CC=C3',
      rotatableBonds: 5,
      formalCharge: 0,
      status: 'Active',
      dockingStatus: 'Ready',
      logP: 2.28,
      tpsa: 75.8,
      hbd: 2,
      hba: 5,
    };
    setLigands((prev) => [newLigand, ...prev]);
    setSelectedLigandId(newLigand.id);
    addLog(`Added ${newLigand.id} from ${file.name}. Total library: ${ligands.length + 1} ligands.`, 'SUCCESS');
    showToast(`Imported ${file.name}: Added to screening library as ${newLigand.id}`);
  }, [ligands.length, addLog, showToast]);

  const importSmiles = useCallback((smiles: string, name: string = 'User Compound') => {
    if (!smiles.trim()) return;
    const newId = `LIG-0${ligands.length + 1}`;
    const newLigand: Ligand = {
      id: newId,
      name,
      formula: 'C18H20N2O3',
      molecularWeight: 312.36,
      smiles: smiles.trim(),
      rotatableBonds: 4,
      formalCharge: 0,
      status: 'Active',
      dockingStatus: 'Ready',
      logP: 2.15,
      tpsa: 62.4,
      hbd: 1,
      hba: 4,
    };
    setLigands((prev) => [newLigand, ...prev]);
    setSelectedLigandId(newId);
    addLog(`Created ligand record ${newId} from SMILES string.`, 'SUCCESS');
    showToast(`Ligand created: ${newId} (${name})`);
  }, [ligands.length, addLog, showToast]);

  const addLigand = useCallback((partial: Partial<Ligand>) => {
    const newId = `LIG-0${ligands.length + 1}`;
    const newLigand: Ligand = {
      id: newId,
      name: partial.name || 'New Candidate',
      formula: partial.formula || 'C20H22N2O3',
      molecularWeight: partial.molecularWeight || 338.4,
      smiles: partial.smiles || 'CC1=CC=C(C=C1)C2=NC=CC=C2',
      rotatableBonds: partial.rotatableBonds || 4,
      formalCharge: partial.formalCharge || 0,
      status: 'Queued',
      dockingStatus: 'Ready',
      logP: partial.logP || 2.5,
      tpsa: partial.tpsa || 65.0,
      hbd: partial.hbd || 2,
      hba: partial.hba || 4,
    };
    setLigands((prev) => [...prev, newLigand]);
    addLog(`Added candidate ${newId} to screening library.`, 'INFO');
  }, [ligands.length, addLog]);

  // Export CSV
  const exportCsvResults = useCallback(() => {
    const headers = ['Rank', 'Pose_ID', 'Ligand_ID', 'DeltaG_kcal_mol', 'RMSD_A', 'H_Bonds', 'Hydrophobic', 'Clash_Score', 'Status'];
    const rows = poses.map((p) => [
      p.rank,
      p.id,
      p.ligandId,
      p.deltaG,
      p.rmsd,
      p.hBondsCount,
      p.hydrophobicCount,
      p.clashScore,
      p.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_${selectedLigandId}_docking_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addLog('Exported pose ranking ensemble table as CSV.', 'SUCCESS');
    showToast('Downloaded docking results CSV table.');
  }, [poses, project.name, selectedLigandId, addLog, showToast]);

  // Export PDBQT
  const exportPdbqtFile = useCallback(() => {
    const pdbqtText = `REMARK  BIO-ANALYTICAL SUITE - DEMONSTRATION PDBQT DOCKING RESULT
REMARK  ==============================================================
REMARK  PROJECT: ${project.name} | RUN: ${project.runName}
REMARK  RECEPTOR: ${receptor.filename} (Chain ${receptor.chain})
REMARK  LIGAND: ${activeLigand.id} (${activeLigand.name})
REMARK  CONFORMATION: ${activePose.id} (Rank #${activePose.rank})
REMARK  ESTIMATED FREE ENERGY OF BINDING (ΔG): ${activePose.deltaG} kcal/mol
REMARK  RMSD TO CRYSTAL REFERENCE: ${activePose.rmsd} Å
REMARK  SEARCH GRID: Center (${bindingSite.center.x}, ${bindingSite.center.y}, ${bindingSite.center.z}) Å
REMARK  SEARCH SPACE VOLUME: ${bindingSite.volume} Å³
REMARK  NOTICE: FOR DEMONSTRATION AND SIMULATION PURPOSES ONLY
REMARK  ==============================================================
MODEL 1
ATOM      1  N1  LIG A   1      -9.421  13.250  67.892  1.00 20.00    -0.35 N
ATOM      2  CA  LIG A   1      -8.150  12.604  68.210  1.00 20.00     0.12 C
ATOM      3  C   LIG A   1      -7.112  13.620  68.650  1.00 20.00     0.45 C
ATOM      4  O1  LIG A   1      -7.340  14.810  68.420  1.00 20.00    -0.55 O
ATOM      5  CB  LIG A   1      -7.720  11.510  67.180  1.00 20.00    -0.05 C
ATOM      6  CG  LIG A   1      -8.750  10.420  66.910  1.00 20.00    -0.10 C
ATOM      7  CD1 LIG A   1      -9.980  10.890  66.420  1.00 20.00    -0.15 C
ATOM      8  CD2 LIG A   1      -8.480   9.080  67.140  1.00 20.00    -0.15 C
ATOM      9  CE1 LIG A   1     -10.920  10.050  66.180  1.00 20.00    -0.15 C
ATOM     10  CE2 LIG A   1      -9.420   8.230  66.900  1.00 20.00    -0.15 C
ATOM     11  CZ  LIG A   1     -10.640   8.720  66.420  1.00 20.00    -0.15 C
ATOM     12  N2  LIG A   1      -5.950  13.120  69.210  1.00 20.00    -0.42 N
ATOM     13  O2  LIG A   1      -5.110  13.910  69.750  1.00 20.00    -0.50 O
ENDMDL
`;
    const blob = new Blob([pdbqtText], { type: 'chemical/x-pdbqt;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedLigandId}_${activePose.id}_docked.pdbqt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addLog(`Exported PDBQT atomic model for conformer ${activePose.id}.`, 'SUCCESS');
    showToast(`Downloaded PDBQT coordinate file: ${activePose.id}`);
  }, [project, receptor, activeLigand, activePose, bindingSite, selectedLigandId, addLog, showToast]);

  // Export report
  const exportReportManifest = useCallback(() => {
    toggleModal('exportReport', true);
    addLog('Generated scientific research dossier report.', 'INFO');
  }, [toggleModal, addLog]);

  // Share link
  const shareWorkspaceLink = useCallback(async () => {
    const shareUrl = 'https://bio-analytical-suite.app/workspace/DK05-7F29';
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // ignore
    }
    showToast('Workspace link copied: https://bio-analytical-suite.app/workspace/DK05-7F29');
    addLog('Workspace collaboration snapshot generated and URL copied to clipboard.', 'INFO');
    return shareUrl;
  }, [showToast, addLog]);

  const resetToDefaults = useCallback(() => {
    setProjectState(initialProject);
    setReceptorState(initialReceptor);
    setBindingSiteState(initialBindingSite);
    setLigands(initialLigands);
    setDockingProtocolState(initialProtocol);
    setSelectedLigandId('LIG-003');
    setPoses(posesByLigand['LIG-003']);
    setSelectedPoseId('P-001');
    setUI(initialUI);
    addLog('Reset workstation to initial Lead Optimization baseline state.', 'INFO');
    showToast('Workstation reset to baseline.');
  }, [addLog, showToast]);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return (
    <DockingContext.Provider
      value={{
        project,
        receptor,
        bindingSite,
        ligands,
        dockingProtocol,
        dockingRun,
        poses,
        selectedLigandId,
        selectedPoseId,
        activeLigand,
        activePose,
        interactions,
        energyProfile,
        compoundProperties,
        admet,
        interpretation,
        ui,
        logs,
        toastMessage,
        currentSessionId,
        sessionsList,
        isLoadingSessions,
        loadSession,
        saveCurrentSessionToStorage,
        deleteSessionById,
        duplicateSessionById,
        refreshSessionsList,
        importSessionFromData,
        exportCurrentSessionFile,
        setProject,
        updateReceptor,
        prepareReceptor,
        updateBindingSite,
        autoDetectBindingSite,
        updateDockingProtocol,
        selectLigand,
        addLigand,
        importPdbFile,
        importSdfFile,
        importSmiles,
        selectPose,
        runDockingCalculation,
        setUI,
        toggleModal,
        exportCsvResults,
        exportPdbqtFile,
        exportReportManifest,
        shareWorkspaceLink,
        addLog,
        resetToDefaults,
        showToast,
        clearToast,
        pockets,
        selectedPocketId,
        selectedPocket,
        isSearchingPockets,
        searchProgress,
        searchPhaseText,
        searchParams,
        searchStats,
        setSearchParams,
        runGridPocketSearch,
        applyPocketAsBindingSite,
        selectPocket,
      }}
    >
      {children}
    </DockingContext.Provider>
  );
};

export const useDocking = () => {
  const context = useContext(DockingContext);
  if (!context) {
    throw new Error('useDocking must be used within a DockingProvider');
  }
  return context;
};
