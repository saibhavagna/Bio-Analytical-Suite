import {
  Project,
  Receptor,
  BindingSite,
  Ligand,
  DockingProtocol,
  Pose,
  Interaction,
  EnergyProfile,
  AdmetPrediction,
  CompoundProperties,
} from '@/types/docking';

export const initialProject: Project = {
  name: 'Project A',
  stage: 'Lead Optimization',
  runName: 'Docking_Run_05',
  description: 'Conformational docking of candidate chemical library against catalytic pocket dyad (Cys145-His41).',
  workspaceDir: '/runs/2026-03-mpro',
  uuid: '8940-dck-2026-run05',
  isoDate: '2026-03-29T15:08:42Z',
};

export const initialReceptor: Receptor = {
  id: 'rec_5ew8',
  filename: '5EW8.pdb',
  name: 'Kinase Catalytic Domain (5EW8)',
  chain: 'A',
  resolution: 1.8,
  atomCount: 2458,
  residuesCount: 306,
  preparationOptions: {
    addPolarHydrogens: true,
    assignGasteigerCharges: true,
    removeCrystalWaters: true,
    detectCofactors: true,
  },
  preparationStatus: 'prepared',
  progress: 0,
};

export const initialBindingSite: BindingSite = {
  id: 'site_active_dyad',
  name: 'Binding Site (TYR-122 / ASP-85)',
  center: { x: 12.40, y: -4.20, z: 8.15 },
  size: { x: 22.0, y: 22.0, z: 20.0 },
  spacing: 0.375,
  volume: 9680.0,
  showGrid: true,
  referenceResidues: ['TYR-122', 'ASP-85', 'LEU-98', 'PHE-101', 'HIS-41', 'CYS-145', 'GLU-166', 'GLY-143'],
};

export const initialLigands: Ligand[] = [
  {
    id: 'LIG-003',
    name: 'N3 Inhibitor Peptide-Mimetic',
    formula: 'C19H22N4O3',
    molecularWeight: 354.41,
    smiles: 'CC(C)CC(NC(=O)C(CC1=CC=CC=C1)NC(=O)OCC2=CC=CC=C2)C(=O)C=CC(=O)OCC',
    rotatableBonds: 5,
    formalCharge: 0,
    status: 'Active',
    dockingStatus: 'Docked',
    logP: 2.14,
    tpsa: 78.4,
    hbd: 2,
    hba: 5,
  },
  {
    id: 'LIG-001',
    name: 'Nirmatrelvir Core Analog',
    formula: 'C23H32F3N5O4',
    molecularWeight: 499.53,
    smiles: 'CC1(C2C1C(N(C2)C(=O)C(C(C)(C)C)NC(=O)C(F)(F)F)C(=O)NC(CC3CCNC3=O)C#N)C',
    rotatableBonds: 6,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 1.85,
    tpsa: 110.2,
    hbd: 3,
    hba: 6,
  },
  {
    id: 'LIG-002',
    name: 'GC376 Dipeptidyl Bisulfite',
    formula: 'C21H30N3O5S',
    molecularWeight: 436.55,
    smiles: 'CC(C)CC(NC(=O)OCC1=CC=CC=C1)C(=O)NC(CC2CCNC2=O)C(O)S(=O)(=O)O',
    rotatableBonds: 8,
    formalCharge: -1,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 0.94,
    tpsa: 135.8,
    hbd: 4,
    hba: 7,
  },
  {
    id: 'LIG-004',
    name: 'Ensitrelvir Derivative D4',
    formula: 'C22H17ClF3N7O',
    molecularWeight: 487.87,
    smiles: 'CN1N=C(C(=N1)C2=NC(=NC=C2)NC3=C(C=C(C=C3)F)Cl)C4=CC(=NN4C)C(F)F',
    rotatableBonds: 4,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 2.65,
    tpsa: 84.1,
    hbd: 1,
    hba: 7,
  },
  {
    id: 'LIG-005',
    name: 'Boceprevir Ketoamide',
    formula: 'C27H45N5O5',
    molecularWeight: 519.68,
    smiles: 'CC(C)(C)NC(=O)NC1CC2(CC1C(=O)NC(C(C)(C)C)C(=O)C(=O)NC3CC3)C2(C)C',
    rotatableBonds: 7,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 3.12,
    tpsa: 118.6,
    hbd: 4,
    hba: 6,
  },
  {
    id: 'LIG-006',
    name: 'Cinanserin 5-HT Antagonist',
    formula: 'C20H24N2OS',
    molecularWeight: 340.48,
    smiles: 'CCCCNC(=O)C=CC1=CC=CC=C1SCC2=CC=CC=C2',
    rotatableBonds: 6,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 3.82,
    tpsa: 54.4,
    hbd: 1,
    hba: 2,
  },
  {
    id: 'LIG-007',
    name: 'Ebselen Organoselenium',
    formula: 'C13H9NOSe',
    molecularWeight: 274.18,
    smiles: 'O=C1C2=CC=CC=C2[Se]N1C3=CC=CC=C3',
    rotatableBonds: 1,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 2.45,
    tpsa: 29.1,
    hbd: 0,
    hba: 2,
  },
  {
    id: 'LIG-008',
    name: 'Disulfiram Dithiocarbamate',
    formula: 'C10H20N2S4',
    molecularWeight: 296.54,
    smiles: 'CCN(CC)C(=S)SSC(=S)N(CC)CC',
    rotatableBonds: 5,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 3.90,
    tpsa: 47.6,
    hbd: 0,
    hba: 2,
  },
  {
    id: 'LIG-009',
    name: 'Tideglusib Thiadiazolidine',
    formula: 'C19H14N2O2S',
    molecularWeight: 334.39,
    smiles: 'O=C1N(C(=O)SN1C2=CC=CC=C2)CC3=CC=CC4=CC=CC=C43',
    rotatableBonds: 3,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 3.38,
    tpsa: 55.4,
    hbd: 0,
    hba: 3,
  },
  {
    id: 'LIG-010',
    name: 'Shikonin Naphthoquinone',
    formula: 'C16H16O5',
    molecularWeight: 288.30,
    smiles: 'CC(=CCC(C1=CC(=O)C2=C(C1=O)C(=CC=C2O)O)O)C',
    rotatableBonds: 3,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 1.72,
    tpsa: 94.8,
    hbd: 3,
    hba: 5,
  },
  {
    id: 'LIG-011',
    name: 'Lopinavir Peptidomimetic',
    formula: 'C37H48N4O5',
    molecularWeight: 628.80,
    smiles: 'CC1=C(C(=CC=C1)C)OCC(=O)NC(CC2=CC=CC=C2)C(CC(CC3=CC=CC=C3)NC(=O)N4CCCC4)O',
    rotatableBonds: 12,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 4.88,
    tpsa: 119.9,
    hbd: 3,
    hba: 5,
  },
  {
    id: 'LIG-012',
    name: 'Ritonavir Thiazole Analog',
    formula: 'C35H40N6O5S2',
    molecularWeight: 720.95,
    smiles: 'CC(C)C1=NC(=CS1)CN(C)C(=O)NC(C(C)C)C(=O)NC(CC2=CC=CC=C2)CC(C(CC3=CC=CC=C3)NC(=O)OCC4=CN=CS4)O',
    rotatableBonds: 15,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 5.25,
    tpsa: 161.7,
    hbd: 4,
    hba: 8,
  },
  {
    id: 'LIG-013',
    name: 'Telaprevir Ketoamide',
    formula: 'C36H53N7O6',
    molecularWeight: 679.85,
    smiles: 'CCC1CC(NC(=O)C2CC3CCCC3N2C(=O)C(NC(=O)C4=NC=CN=C4)C5CCCCC5)C(=O)C(=O)NC6CC6',
    rotatableBonds: 10,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 3.75,
    tpsa: 163.4,
    hbd: 4,
    hba: 7,
  },
  {
    id: 'LIG-014',
    name: 'Baicalein Flavonoid',
    formula: 'C15H10O5',
    molecularWeight: 270.24,
    smiles: 'O=C1C=C(OC2=C1C(=C(C=C2)O)O)C3=CC=CC=C3',
    rotatableBonds: 1,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 2.11,
    tpsa: 87.0,
    hbd: 3,
    hba: 5,
  },
  {
    id: 'LIG-015',
    name: 'Quercetin Pentahydroxyflavone',
    formula: 'C15H10O7',
    molecularWeight: 302.24,
    smiles: 'C1=CC(=C(C=C1C2=C(C(=O)C3=C(C=C(C=C3O2)O)O)O)O)O',
    rotatableBonds: 1,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 1.54,
    tpsa: 127.3,
    hbd: 5,
    hba: 7,
  },
  {
    id: 'LIG-016',
    name: 'Myricetin Hexahydroxyflavone',
    formula: 'C15H10O8',
    molecularWeight: 318.24,
    smiles: 'C1=C(C=C(C(=C1O)O)O)C2=C(C(=O)C3=C(C=C(C=C3O2)O)O)O',
    rotatableBonds: 1,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 1.20,
    tpsa: 147.5,
    hbd: 6,
    hba: 8,
  },
  {
    id: 'LIG-017',
    name: 'Carmofur Pyrimidinedione',
    formula: 'C11H16FN3O3',
    molecularWeight: 257.26,
    smiles: 'CCCCCCN(C(=O)NC1=C(C(=O)NC1=O)F)',
    rotatableBonds: 6,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 1.15,
    tpsa: 67.4,
    hbd: 2,
    hba: 4,
  },
  {
    id: 'LIG-018',
    name: 'Tilorone Dihydrochloride Analog',
    formula: 'C25H34N2O3',
    molecularWeight: 410.55,
    smiles: 'CCN(CC)CCOC1=CC2=C(C=C1)C(=O)C3=C2C=C(C=C3)OCCN(CC)CC',
    rotatableBonds: 10,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 4.10,
    tpsa: 38.8,
    hbd: 0,
    hba: 4,
  },
  {
    id: 'LIG-019',
    name: 'Bithionol Bis-phenol',
    formula: 'C12H6Cl4O2S',
    molecularWeight: 356.05,
    smiles: 'C1=CC(=C(C(=C1)Cl)O)SC2=C(C=C(C=C2Cl)Cl)O',
    rotatableBonds: 2,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 4.95,
    tpsa: 40.5,
    hbd: 2,
    hba: 2,
  },
  {
    id: 'LIG-020',
    name: 'Niclosamide Salicylanilide',
    formula: 'C13H8Cl2N2O4',
    molecularWeight: 327.12,
    smiles: 'C1=CC(=C(C=C1Cl)NC(=O)C2=C(C=CC(=C2)Cl)O)[N+](=O)[O-]',
    rotatableBonds: 2,
    formalCharge: 0,
    status: 'Queued',
    dockingStatus: 'Ready',
    logP: 4.20,
    tpsa: 85.0,
    hbd: 2,
    hba: 4,
  },
];

export const initialProtocol: DockingProtocol = {
  engine: 'AutoDock Vina 1.2.5',
  searchMethod: 'Monte Carlo / Vina',
  exhaustiveness: 32,
  maxPoses: 10,
  energyCutoff: 3.0,
  randomSeed: 198402,
};

// Deterministic Poses for LIG-003
export const posesByLigand: Record<string, Pose[]> = {
  'LIG-003': [
    { id: 'P-001', rank: 1, ligandId: 'LIG-003', deltaG: -9.20, rmsd: 1.23, hBondsCount: 4, hydrophobicCount: 8, clashScore: 0.00, status: 'Optimal', conformerIndex: 1 },
    { id: 'P-002', rank: 2, ligandId: 'LIG-003', deltaG: -8.70, rmsd: 1.41, hBondsCount: 3, hydrophobicCount: 7, clashScore: 0.00, status: 'Active', conformerIndex: 2 },
    { id: 'P-003', rank: 3, ligandId: 'LIG-003', deltaG: -8.30, rmsd: 1.76, hBondsCount: 2, hydrophobicCount: 6, clashScore: 0.02, status: 'Active', conformerIndex: 3 },
    { id: 'P-004', rank: 4, ligandId: 'LIG-003', deltaG: -8.10, rmsd: 1.98, hBondsCount: 2, hydrophobicCount: 5, clashScore: 0.04, status: 'Active', conformerIndex: 4 },
    { id: 'P-005', rank: 5, ligandId: 'LIG-003', deltaG: -7.90, rmsd: 2.34, hBondsCount: 1, hydrophobicCount: 5, clashScore: 0.05, status: 'Active', conformerIndex: 5 },
    { id: 'P-006', rank: 6, ligandId: 'LIG-003', deltaG: -7.60, rmsd: 2.71, hBondsCount: 2, hydrophobicCount: 4, clashScore: 0.08, status: 'Active', conformerIndex: 6 },
    { id: 'P-007', rank: 7, ligandId: 'LIG-003', deltaG: -7.30, rmsd: 3.05, hBondsCount: 1, hydrophobicCount: 4, clashScore: 0.12, status: 'Sub-optimal', conformerIndex: 7 },
    { id: 'P-008', rank: 8, ligandId: 'LIG-003', deltaG: -7.00, rmsd: 3.42, hBondsCount: 1, hydrophobicCount: 3, clashScore: 0.15, status: 'Sub-optimal', conformerIndex: 8 },
    { id: 'P-009', rank: 9, ligandId: 'LIG-003', deltaG: -6.80, rmsd: 3.88, hBondsCount: 0, hydrophobicCount: 3, clashScore: 0.22, status: 'Sub-optimal', conformerIndex: 9 },
    { id: 'P-010', rank: 10, ligandId: 'LIG-003', deltaG: -6.40, rmsd: 4.15, hBondsCount: 0, hydrophobicCount: 2, clashScore: 0.31, status: 'Sub-optimal', conformerIndex: 10 },
  ],
  'LIG-001': [
    { id: 'P-101', rank: 1, ligandId: 'LIG-001', deltaG: -10.45, rmsd: 0.95, hBondsCount: 5, hydrophobicCount: 9, clashScore: 0.00, status: 'Optimal', conformerIndex: 1 },
    { id: 'P-102', rank: 2, ligandId: 'LIG-001', deltaG: -9.80, rmsd: 1.35, hBondsCount: 4, hydrophobicCount: 8, clashScore: 0.00, status: 'Active', conformerIndex: 2 },
    { id: 'P-103', rank: 3, ligandId: 'LIG-001', deltaG: -9.10, rmsd: 1.82, hBondsCount: 3, hydrophobicCount: 7, clashScore: 0.01, status: 'Active', conformerIndex: 3 },
    { id: 'P-104', rank: 4, ligandId: 'LIG-001', deltaG: -8.60, rmsd: 2.15, hBondsCount: 2, hydrophobicCount: 6, clashScore: 0.05, status: 'Active', conformerIndex: 4 },
    { id: 'P-105', rank: 5, ligandId: 'LIG-001', deltaG: -8.20, rmsd: 2.60, hBondsCount: 2, hydrophobicCount: 5, clashScore: 0.08, status: 'Active', conformerIndex: 5 },
  ],
  'LIG-002': [
    { id: 'P-201', rank: 1, ligandId: 'LIG-002', deltaG: -9.60, rmsd: 1.15, hBondsCount: 4, hydrophobicCount: 7, clashScore: 0.00, status: 'Optimal', conformerIndex: 1 },
    { id: 'P-202', rank: 2, ligandId: 'LIG-002', deltaG: -9.00, rmsd: 1.50, hBondsCount: 3, hydrophobicCount: 6, clashScore: 0.00, status: 'Active', conformerIndex: 2 },
    { id: 'P-203', rank: 3, ligandId: 'LIG-002', deltaG: -8.40, rmsd: 1.95, hBondsCount: 3, hydrophobicCount: 5, clashScore: 0.03, status: 'Active', conformerIndex: 3 },
  ],
};

// Deterministic interactions per pose
export const interactionsByPose: Record<string, Interaction[]> = {
  'P-001': [
    { id: 'int_1', poseId: 'P-001', residue: 'GLU166', chain: 'A', atom: 'N', ligandAtom: 'O1', type: 'Hydrogen Bond', distance: 2.10, energy: -1.84, color: '#48CAE4' },
    { id: 'int_2', poseId: 'P-001', residue: 'HIS41', chain: 'A', atom: 'NE2 (Ring)', ligandAtom: 'C4', type: 'Hydrophobic', distance: 3.85, energy: -1.36, color: '#2A9D8F' },
    { id: 'int_3', poseId: 'P-001', residue: 'GLY143', chain: 'A', atom: 'O (Backbone)', ligandAtom: 'N2', type: 'Hydrogen Bond', distance: 2.42, energy: -1.12, color: '#48CAE4' },
    { id: 'int_4', poseId: 'P-001', residue: 'CYS145', chain: 'A', atom: 'SG', ligandAtom: 'C=O', type: 'Hydrophobic', distance: 3.40, energy: -0.95, color: '#2A9D8F' },
    { id: 'int_5', poseId: 'P-001', residue: 'TYR122', chain: 'A', atom: 'OH', ligandAtom: 'N1', type: 'Hydrogen Bond', distance: 2.65, energy: -1.20, color: '#48CAE4' },
    { id: 'int_6', poseId: 'P-001', residue: 'ASP85', chain: 'A', atom: 'OD1', ligandAtom: 'NH', type: 'Salt Bridge', distance: 2.90, energy: -1.45, color: '#E9C46A' },
    { id: 'int_7', poseId: 'P-001', residue: 'PHE101', chain: 'A', atom: 'CZ (Ring)', ligandAtom: 'Phenyl', type: 'Pi-Stack', distance: 4.10, energy: -0.85, color: '#9DCAFF' },
    { id: 'int_8', poseId: 'P-001', residue: 'LEU98', chain: 'A', atom: 'CD1', ligandAtom: 'Alkyl', type: 'Hydrophobic', distance: 3.92, energy: -0.78, color: '#2A9D8F' },
  ],
  'P-002': [
    { id: 'int_21', poseId: 'P-002', residue: 'GLU166', chain: 'A', atom: 'OE1', ligandAtom: 'N1', type: 'Hydrogen Bond', distance: 2.35, energy: -1.55, color: '#48CAE4' },
    { id: 'int_22', poseId: 'P-002', residue: 'HIS41', chain: 'A', atom: 'ND1', ligandAtom: 'C3', type: 'Hydrophobic', distance: 3.92, energy: -1.10, color: '#2A9D8F' },
    { id: 'int_23', poseId: 'P-002', residue: 'GLY143', chain: 'A', atom: 'N', ligandAtom: 'O2', type: 'Hydrogen Bond', distance: 2.58, energy: -1.02, color: '#48CAE4' },
    { id: 'int_24', poseId: 'P-002', residue: 'MET165', chain: 'A', atom: 'SD', ligandAtom: 'C5', type: 'Hydrophobic', distance: 4.05, energy: -0.72, color: '#2A9D8F' },
    { id: 'int_25', poseId: 'P-002', residue: 'TYR122', chain: 'A', atom: 'OH', ligandAtom: 'O3', type: 'Hydrogen Bond', distance: 2.78, energy: -0.95, color: '#48CAE4' },
  ],
  'P-003': [
    { id: 'int_31', poseId: 'P-003', residue: 'GLU166', chain: 'A', atom: 'N', ligandAtom: 'O1', type: 'Hydrogen Bond', distance: 2.65, energy: -1.15, color: '#48CAE4' },
    { id: 'int_32', poseId: 'P-003', residue: 'HIS41', chain: 'A', atom: 'Ring', ligandAtom: 'Aryl', type: 'Hydrophobic', distance: 4.15, energy: -0.92, color: '#2A9D8F' },
    { id: 'int_33', poseId: 'P-003', residue: 'CYS145', chain: 'A', atom: 'SG', ligandAtom: 'C2', type: 'Hydrophobic', distance: 3.80, energy: -0.85, color: '#2A9D8F' },
    { id: 'int_34', poseId: 'P-003', residue: 'ASP85', chain: 'A', atom: 'OD2', ligandAtom: 'N2', type: 'Hydrogen Bond', distance: 2.92, energy: -0.90, color: '#48CAE4' },
  ],
  'P-004': [
    { id: 'int_41', poseId: 'P-004', residue: 'HIS41', chain: 'A', atom: 'NE2', ligandAtom: 'O1', type: 'Hydrogen Bond', distance: 2.75, energy: -1.10, color: '#48CAE4' },
    { id: 'int_42', poseId: 'P-004', residue: 'GLY143', chain: 'A', atom: 'N', ligandAtom: 'O2', type: 'Hydrogen Bond', distance: 2.85, energy: -0.88, color: '#48CAE4' },
    { id: 'int_43', poseId: 'P-004', residue: 'LEU98', chain: 'A', atom: 'CD2', ligandAtom: 'Alkyl', type: 'Hydrophobic', distance: 4.20, energy: -0.65, color: '#2A9D8F' },
  ],
  'P-005': [
    { id: 'int_51', poseId: 'P-005', residue: 'GLU166', chain: 'A', atom: 'OE2', ligandAtom: 'NH', type: 'Hydrogen Bond', distance: 2.85, energy: -0.95, color: '#48CAE4' },
    { id: 'int_52', poseId: 'P-005', residue: 'CYS145', chain: 'A', atom: 'CA', ligandAtom: 'C1', type: 'Hydrophobic', distance: 4.35, energy: -0.60, color: '#2A9D8F' },
  ],
};

// Deterministic Energy Decomposition profiles
export const energyProfilesByPose: Record<string, EnergyProfile> = {
  'P-001': {
    poseId: 'P-001',
    deltaG: -9.20,
    vdw: -7.14,
    electrostatic: -2.85,
    hBonding: -3.20,
    desolvation: 1.22,
    ligandStrain: 1.87,
  },
  'P-002': {
    poseId: 'P-002',
    deltaG: -8.70,
    vdw: -6.80,
    electrostatic: -2.45,
    hBonding: -2.75,
    desolvation: 1.35,
    ligandStrain: 1.95,
  },
  'P-003': {
    poseId: 'P-003',
    deltaG: -8.30,
    vdw: -6.25,
    electrostatic: -2.10,
    hBonding: -2.30,
    desolvation: 1.15,
    ligandStrain: 2.10,
  },
  'P-004': {
    poseId: 'P-004',
    deltaG: -8.10,
    vdw: -5.90,
    electrostatic: -1.95,
    hBonding: -2.10,
    desolvation: 1.05,
    ligandStrain: 2.30,
  },
  'P-005': {
    poseId: 'P-005',
    deltaG: -7.90,
    vdw: -5.60,
    electrostatic: -1.70,
    hBonding: -1.85,
    desolvation: 0.95,
    ligandStrain: 2.45,
  },
};

// Helper for dynamic pose lookup fallback
export function getEnergyProfileForPose(pose: Pose): EnergyProfile {
  if (energyProfilesByPose[pose.id]) {
    return energyProfilesByPose[pose.id];
  }
  const ratio = Math.abs(pose.deltaG) / 9.20;
  return {
    poseId: pose.id,
    deltaG: pose.deltaG,
    vdw: Number((-7.14 * ratio).toFixed(2)),
    electrostatic: Number((-2.85 * ratio).toFixed(2)),
    hBonding: Number((-0.8 * pose.hBondsCount).toFixed(2)),
    desolvation: Number((1.22 * (2 - ratio)).toFixed(2)),
    ligandStrain: Number((1.87 + (pose.rmsd * 0.4)).toFixed(2)),
  };
}

export function getInteractionsForPose(pose: Pose): Interaction[] {
  if (interactionsByPose[pose.id]) {
    return interactionsByPose[pose.id];
  }
  // Deterministic fallback for any pose
  const results: Interaction[] = [
    {
      id: `int_${pose.id}_1`,
      poseId: pose.id,
      residue: 'GLU166',
      chain: 'A',
      atom: 'OE1',
      ligandAtom: 'O1',
      type: 'Hydrogen Bond',
      distance: Number((2.10 + pose.rmsd * 0.35).toFixed(2)),
      energy: Number((-1.84 / (pose.rmsd + 0.5)).toFixed(2)),
      color: '#48CAE4',
    },
    {
      id: `int_${pose.id}_2`,
      poseId: pose.id,
      residue: 'HIS41',
      chain: 'A',
      atom: 'Ring',
      ligandAtom: 'C3',
      type: 'Hydrophobic',
      distance: Number((3.85 + pose.rmsd * 0.25).toFixed(2)),
      energy: Number((-1.36 / (pose.rmsd + 0.4)).toFixed(2)),
      color: '#2A9D8F',
    },
    {
      id: `int_${pose.id}_3`,
      poseId: pose.id,
      residue: 'TYR122',
      chain: 'A',
      atom: 'OH',
      ligandAtom: 'N2',
      type: 'Hydrogen Bond',
      distance: Number((2.60 + pose.rmsd * 0.3).toFixed(2)),
      energy: Number((-1.10 / (pose.rmsd + 0.5)).toFixed(2)),
      color: '#48CAE4',
    },
  ];
  return results;
}

export function getInterpretationForPose(pose: Pose, ligand: Ligand): string {
  if (pose.rank === 1) {
    return `Catalytic dyad HIS41/CYS145 properly engaged by ${ligand.id} (${ligand.name}). High affinity conformer ${pose.id} satisfies active pocket geometry with no steric clash (RMSD ${pose.rmsd} Å). Strong hydrogen-bond network with GLU166 and GLY143 anchors the pharmacophore.`;
  }
  if (pose.rank <= 3) {
    return `Conformer ${pose.id} maintains favorable contact with the S1/S2 sub-pocket. Slight rotational shift in the P2 moiety increases RMSD to ${pose.rmsd} Å, maintaining ${pose.hBondsCount} polar vectors with ΔG ${pose.deltaG} kcal/mol.`;
  }
  return `Conformation ${pose.id} exhibits sub-optimal geometry (RMSD ${pose.rmsd} Å, ΔG ${pose.deltaG} kcal/mol). Reduced hydrogen bonding and elevated torsional strain suggest lower thermodynamic occupancy in active site.`;
}

export function getAdmetForLigand(ligand: Ligand): AdmetPrediction {
  const isLipinski =
    ligand.molecularWeight <= 500 &&
    ligand.logP <= 5.0 &&
    ligand.hbd <= 5 &&
    ligand.hba <= 10 &&
    ligand.rotatableBonds <= 10;

  let violations = 0;
  if (ligand.molecularWeight > 500) violations++;
  if (ligand.logP > 5.0) violations++;
  if (ligand.hbd > 5) violations++;
  if (ligand.hba > 10) violations++;

  return {
    ligandId: ligand.id,
    absorption: ligand.tpsa < 90 ? 'High' : ligand.tpsa < 140 ? 'Moderate' : 'Low',
    distribution: ligand.logP > 2.0 && ligand.logP < 4.0 ? 'High' : 'Moderate',
    metabolism: ligand.rotatableBonds > 8 ? 'High' : 'Moderate',
    excretion: 'Moderate',
    toxicity: violations === 0 ? 'Low' : violations === 1 ? 'Moderate' : 'High',
    lipinskiPass: isLipinski,
    lipinskiViolations: violations,
    notes: isLipinski
      ? 'Optimal drug-like property space. Meets all standard Lipinski Rule of 5 and Veber bioavailability criteria.'
      : `Exhibits ${violations} Lipinski Rule of 5 violation(s). Consider optimization of polar surface area or molecular weight.`,
  };
}
