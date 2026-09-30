export type ReceptorPreparationOptions = {
  addPolarHydrogens: boolean;
  assignGasteigerCharges: boolean;
  removeCrystalWaters: boolean;
  detectCofactors: boolean;
};

export type Receptor = {
  id: string;
  filename: string;
  name: string;
  chain: string;
  resolution: number;
  atomCount: number;
  residuesCount: number;
  preparationOptions: ReceptorPreparationOptions;
  preparationStatus: 'unprepared' | 'preparing' | 'prepared';
  progress: number;
};

export type Vector3D = {
  x: number;
  y: number;
  z: number;
};

export type BindingSite = {
  id: string;
  name: string;
  center: Vector3D;
  size: Vector3D;
  spacing: number;
  volume: number;
  showGrid: boolean;
  referenceResidues: string[];
};

export type Ligand = {
  id: string;
  name: string;
  formula: string;
  molecularWeight: number;
  smiles: string;
  rotatableBonds: number;
  formalCharge: number;
  status: 'Active' | 'Queued' | 'Excluded';
  dockingStatus: 'Ready' | 'Docked' | 'Pending';
  logP: number;
  tpsa: number;
  hbd: number;
  hba: number;
};

export type DockingProtocol = {
  engine: 'AutoDock Vina 1.2.5' | 'GOLD v5.8' | 'Glide XP';
  searchMethod: 'Monte Carlo / Vina' | 'Genetic Algorithm';
  exhaustiveness: number;
  maxPoses: number;
  energyCutoff: number;
  randomSeed: number;
};

export type Pose = {
  id: string;
  rank: number;
  ligandId: string;
  deltaG: number; // kcal/mol
  rmsd: number; // Å
  hBondsCount: number;
  hydrophobicCount: number;
  clashScore: number;
  status: 'Optimal' | 'Active' | 'Sub-optimal';
  conformerIndex: number;
  coordinatesSeed?: number;
};

export type InteractionType = 'Hydrogen Bond' | 'Hydrophobic' | 'Salt Bridge' | 'Pi-Stack';

export type Interaction = {
  id: string;
  poseId: string;
  residue: string;
  chain: string;
  atom: string;
  ligandAtom: string;
  type: InteractionType;
  distance: number; // Å
  energy: number; // kcal/mol
  color: string;
};

export type EnergyProfile = {
  poseId: string;
  deltaG: number;
  vdw: number;
  electrostatic: number;
  hBonding: number;
  desolvation: number;
  ligandStrain: number;
};

export type CompoundProperties = {
  ligandId: string;
  mw: number;
  logP: number;
  tpsa: number;
  hbd: number;
  hba: number;
  rotBonds: number;
};

export type AdmetPrediction = {
  ligandId: string;
  absorption: 'High' | 'Moderate' | 'Low';
  distribution: 'High' | 'Moderate' | 'Low';
  metabolism: 'High' | 'Moderate' | 'Low';
  excretion: 'High' | 'Moderate' | 'Low';
  toxicity: 'High' | 'Moderate' | 'Low';
  lipinskiPass: boolean;
  lipinskiViolations: number;
  notes: string;
};

export type DockingRun = {
  status: 'idle' | 'preparing' | 'preparing_ligands' | 'docking' | 'ranking' | 'completed';
  progress: number;
  currentPhaseText: string;
  runId: string;
  savedTimestamp: string;
};

export type Project = {
  name: string;
  stage: string;
  runName: string;
  description: string;
  workspaceDir: string;
  uuid: string;
  isoDate: string;
};

export type LogEntry = {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
};

export type RepresentationMode = 'Cartoon' | 'Sticks' | 'Surface' | 'CPK';
export type ColorScheme = 'CPK' | 'Chain' | 'Residue' | 'Hydrophobic';

export type ActiveModule = 'landing' | 'workspace' | 'matrix' | 'admet' | 'logs';

export type DockingSessionMetadata = {
  targetPdb: string;
  targetName: string;
  bestDeltaG: number;
  ligandCount: number;
  posesCount: number;
  engine: string;
  status: 'Completed' | 'Ready' | 'In Progress';
};

export type DockingSession = {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isPreset?: boolean;
  metadata: DockingSessionMetadata;
  project: Project;
  receptor: Receptor;
  bindingSite: BindingSite;
  ligands: Ligand[];
  dockingProtocol: DockingProtocol;
  dockingRun: DockingRun;
  selectedLigandId: string;
  selectedPoseId: string;
  poses: Pose[];
  posesByLigand?: Record<string, Pose[]>;
  logs?: LogEntry[];
};

export type ProbePoint = Vector3D & {
  type?: 'apolar' | 'polar' | 'h-bond-donor' | 'h-bond-acceptor';
  alphaRadius?: number;
};

export type BindingPocket = {
  id: string;
  rank: number;
  name: string;
  type: 'Catalytic Active Site' | 'Allosteric Pocket' | 'Interface Cavity' | 'Secondary Groove' | 'Cryptic Site';
  center: Vector3D;
  suggestedDimensions: Vector3D;
  volume: number; // Å³
  surfaceArea: number; // Å²
  druggabilityScore: number; // 0.0 - 1.0
  burialRatio: number; // e.g. 78 (%)
  hydrophobicRatio: number; // e.g. 64 (%)
  liningResidues: string[];
  keyInteractions: string[];
  suggestedLigandTypes: string[];
  probePointsCount: number;
  probePoints?: ProbePoint[];
  meanCurvature?: number;
  description: string;
};

export type GridSearchParams = {
  gridSpacing: number; // 0.5 to 1.5 Å (default 0.8 Å)
  probeRadius: number; // 1.2 to 2.2 Å (default 1.4 Å)
  minVolumeCutoff: number; // 100 to 500 Å³ (default 180 Å³)
  burialThreshold: number; // 0.4 to 0.9 (default 0.65)
  algorithm: 'fpocket Alpha-Spheres' | 'LIGSITE Ray-Tracing' | 'AutoLigand Potential Field';
};

export type PocketSearchStats = {
  totalGridPoints: number;
  proteinSurfaceProbes: number;
  cavityClustersIdentified: number;
  executionDurationMs: number;
  timestamp: string;
};

export type UIState = {
  representation: RepresentationMode;
  colorScheme: ColorScheme;
  showHBonds: boolean;
  showHydrophobic: boolean;
  showWaterSolvation: boolean;
  showResidueLabels: boolean;
  showGridBox: boolean;
  showPocketCavity: boolean;
  isOrtho: boolean;
  activeModule: ActiveModule;
  modals: {
    ligandLibrary: boolean;
    receptorUpload: boolean;
    exportReport: boolean;
    shareWorkspace: boolean;
    smilesInput: boolean;
    projectManager: boolean;
    pocketSearch: boolean;
  };
};
