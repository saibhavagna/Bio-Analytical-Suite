import { BindingPocket, GridSearchParams, PocketSearchStats, Receptor, Vector3D, ProbePoint } from '@/types/docking';

export const DEFAULT_GRID_SEARCH_PARAMS: GridSearchParams = {
  gridSpacing: 0.8,
  probeRadius: 1.4,
  minVolumeCutoff: 180,
  burialThreshold: 0.65,
  algorithm: 'fpocket Alpha-Spheres',
};

/**
 * Generate synthetic probe points distributed inside an ellipsoidal pocket cavity
 */
function generateCavityProbePoints(center: Vector3D, size: Vector3D, count: number = 60): ProbePoint[] {
  const points: ProbePoint[] = [];
  const rx = (size.x * 0.42);
  const ry = (size.y * 0.42);
  const rz = (size.z * 0.42);

  // Seeded deterministic generation based on center coordinates
  const seedBase = Math.abs(Math.sin(center.x * 12.9898 + center.y * 78.233 + center.z * 37.719));

  for (let i = 0; i < count; i++) {
    const u = ((seedBase * 1000 + i * 19.3) % 1);
    const v = ((seedBase * 2000 + i * 37.7) % 1);
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    // Radial distribution concentrated slightly toward interior
    const rFrac = Math.cbrt(((seedBase * 3000 + i * 53.1) % 1) * 0.95 + 0.05);

    const px = center.x + rFrac * rx * Math.sin(phi) * Math.cos(theta);
    const py = center.y + rFrac * ry * Math.sin(phi) * Math.sin(theta);
    const pz = center.z + rFrac * rz * Math.cos(phi);

    const typeRoll = ((seedBase * 4000 + i * 17.1) % 1);
    let probeType: 'apolar' | 'polar' | 'h-bond-donor' | 'h-bond-acceptor' = 'apolar';
    if (typeRoll > 0.65) probeType = 'polar';
    else if (typeRoll > 0.50) probeType = 'h-bond-donor';
    else if (typeRoll > 0.38) probeType = 'h-bond-acceptor';

    points.push({
      x: Number(px.toFixed(2)),
      y: Number(py.toFixed(2)),
      z: Number(pz.toFixed(2)),
      type: probeType,
      alphaRadius: Number((1.2 + ((seedBase * 5000 + i * 11) % 1) * 1.6).toFixed(2)),
    });
  }

  return points;
}

/**
 * Benchmark pocket templates for 5EW8 Kinase Catalytic Domain
 */
const KINASE_5EW8_POCKETS: BindingPocket[] = [
  {
    id: 'pkt-5ew8-01',
    rank: 1,
    name: 'ATP Hinge Binding Cleft (Orthosteric Active Site)',
    type: 'Catalytic Active Site',
    center: { x: 12.40, y: -4.20, z: 8.15 },
    suggestedDimensions: { x: 22.0, y: 22.0, z: 20.0 },
    volume: 980,
    surfaceArea: 485,
    druggabilityScore: 0.89,
    burialRatio: 82,
    hydrophobicRatio: 64,
    liningResidues: ['TYR-122', 'ASP-85', 'LEU-98', 'PHE-101', 'HIS-41', 'CYS-145', 'GLU-166', 'GLY-143'],
    keyInteractions: ['Hinge backbone H-bonds (Met120/Glu88)', 'Gatekeeper hydrophobic pocket', 'Catalytic Lys70-Glu88 salt bridge'],
    suggestedLigandTypes: ['Type I ATP-competitive kinase inhibitors', 'Aminopyrimidine scaffolds', 'Heterocyclic hinge mimetics'],
    probePointsCount: 114,
    meanCurvature: 0.44,
    description: 'Primary catalytic cleft between N-lobe and C-lobe. High concavity and ideal lipophilic balance for competitive ligand binding.',
  },
  {
    id: 'pkt-5ew8-02',
    rank: 2,
    name: 'DFG-Out Allosteric Back Pocket (Type II Site)',
    type: 'Allosteric Pocket',
    center: { x: 16.80, y: -0.90, z: 4.30 },
    suggestedDimensions: { x: 20.0, y: 18.0, z: 18.0 },
    volume: 620,
    surfaceArea: 340,
    druggabilityScore: 0.76,
    burialRatio: 74,
    hydrophobicRatio: 72,
    liningResidues: ['PHE-140', 'ARG-188', 'LEU-167', 'VAL-186', 'ILE-136', 'PRO-168'],
    keyInteractions: ['Apolar packing against αC-helix', 'DFG Phe displacement cavity', 'Allosteric pocket hydrogen bonding'],
    suggestedLigandTypes: ['Type II kinase inhibitors (e.g. Sorafenib-like diaryl ureas)', 'Conformation-specific allosteric modulators'],
    probePointsCount: 78,
    meanCurvature: 0.38,
    description: 'Cryptic allosteric pocket exposed during activation loop transition. Highly apolar with strong subtype selectivity potential.',
  },
  {
    id: 'pkt-5ew8-03',
    rank: 3,
    name: 'Substrate Peptide Binding Groove',
    type: 'Secondary Groove',
    center: { x: 7.20, y: -8.60, z: 12.40 },
    suggestedDimensions: { x: 18.0, y: 16.0, z: 16.0 },
    volume: 450,
    surfaceArea: 290,
    druggabilityScore: 0.62,
    burialRatio: 58,
    hydrophobicRatio: 48,
    liningResidues: ['GLU-166', 'ARG-133', 'ASP-190', 'GLY-135', 'SER-137'],
    keyInteractions: ['Electrostatic substrate anchoring', 'Solvent-accessible hydrogen bonds'],
    suggestedLigandTypes: ['Peptidomimetic macrocycles', 'Charge-balanced fragment leads'],
    probePointsCount: 54,
    meanCurvature: 0.31,
    description: 'Solvent-accessible groove guiding protein substrate phosphorylation. Moderate druggability requiring polar fragment anchors.',
  },
  {
    id: 'pkt-5ew8-04',
    rank: 4,
    name: 'N-Lobe Lipophilic Regulatory Patch',
    type: 'Interface Cavity',
    center: { x: 2.50, y: 4.80, z: -2.10 },
    suggestedDimensions: { x: 16.0, y: 14.0, z: 14.0 },
    volume: 290,
    surfaceArea: 210,
    druggabilityScore: 0.48,
    burialRatio: 44,
    hydrophobicRatio: 68,
    liningResidues: ['LEU-38', 'VAL-46', 'ALA-58', 'PHE-74', 'ILE-62'],
    keyInteractions: ['Surface hydrophobic patch', 'Inter-domain interaction interface'],
    suggestedLigandTypes: ['Fragment-based hydrophobic probes', 'Protein-protein interaction disruptors'],
    probePointsCount: 38,
    meanCurvature: 0.26,
    description: 'Shallow hydrophobic surface depression. Low intrinsic druggability, suited for fragment screening or PPI modulation.',
  },
];

/**
 * Benchmark pocket templates for 6LU7 SARS-CoV-2 Main Protease (Mpro)
 */
const MPRO_6LU7_POCKETS: BindingPocket[] = [
  {
    id: 'pkt-6lu7-01',
    rank: 1,
    name: 'Catalytic Dyad Subsite (Cys145-His41 Active Site)',
    type: 'Catalytic Active Site',
    center: { x: -10.80, y: 12.50, z: 68.90 },
    suggestedDimensions: { x: 24.0, y: 22.0, z: 22.0 },
    volume: 1140,
    surfaceArea: 530,
    druggabilityScore: 0.94,
    burialRatio: 86,
    hydrophobicRatio: 58,
    liningResidues: ['HIS-41', 'CYS-145', 'GLU-166', 'GLY-143', 'MET-49', 'ASN-142', 'GLN-189', 'THR-25'],
    keyInteractions: ['Covalent nucleophilic attack by Cys145', 'Oxyanion hole (Gly143/Ser144/Cys145)', 'S1 Glu166 specificity pocket'],
    suggestedLigandTypes: ['Covalent peptidomimetics (Nirmatrelvir/Boceprevir analogs)', 'Michael acceptor warheads', 'Ketoamides'],
    probePointsCount: 132,
    meanCurvature: 0.48,
    description: 'Deep, highly validated catalytic cleft with canonical oxyanion hole and S1/S2/S4 substrate subpockets.',
  },
  {
    id: 'pkt-6lu7-02',
    rank: 2,
    name: 'Dimerization Interface Cryptic Cavity',
    type: 'Interface Cavity',
    center: { x: -2.40, y: 21.60, z: 54.20 },
    suggestedDimensions: { x: 18.0, y: 18.0, z: 16.0 },
    volume: 640,
    surfaceArea: 360,
    druggabilityScore: 0.72,
    burialRatio: 70,
    hydrophobicRatio: 65,
    liningResidues: ['ARG-4', 'SER-1', 'PHE-140', 'GLU-166', 'VAL-297'],
    keyInteractions: ['N-finger salt bridge disruption', 'Inter-protomer hydrophobic packing'],
    suggestedLigandTypes: ['Allosteric dimerization disruptors', 'Non-peptidic small molecules'],
    probePointsCount: 76,
    meanCurvature: 0.36,
    description: 'Interface junction between Protomer A and Protomer B essential for enzymatic catalytic competency.',
  },
  {
    id: 'pkt-6lu7-03',
    rank: 3,
    name: 'Domain III Allosteric Hydrophobic Pocket',
    type: 'Allosteric Pocket',
    center: { x: 14.20, y: 5.80, z: 41.50 },
    suggestedDimensions: { x: 16.0, y: 16.0, z: 16.0 },
    volume: 410,
    surfaceArea: 270,
    druggabilityScore: 0.59,
    burialRatio: 54,
    hydrophobicRatio: 75,
    liningResidues: ['TRP-207', 'LEU-208', 'PHE-223', 'ILE-249', 'TYR-239'],
    keyInteractions: ['Aromatic pi-stacking with Trp207', 'Lipophilic core burial'],
    suggestedLigandTypes: ['Lipophilic fragment hits', 'Allosteric channel binders'],
    probePointsCount: 52,
    meanCurvature: 0.32,
    description: 'Helical bundle cleft in Domain III. Rich in apolar residues with moderate solvent accessibility.',
  },
];

/**
 * Benchmark pocket templates for 1M17 EGFR Tyrosine Kinase
 */
const EGFR_1M17_POCKETS: BindingPocket[] = [
  {
    id: 'pkt-1m17-01',
    rank: 1,
    name: 'ATP Binding Hinge Pocket (Gefitinib / Erlotinib Site)',
    type: 'Catalytic Active Site',
    center: { x: 22.10, y: 0.40, z: 52.80 },
    suggestedDimensions: { x: 22.0, y: 22.0, z: 20.0 },
    volume: 990,
    surfaceArea: 490,
    druggabilityScore: 0.92,
    burialRatio: 84,
    hydrophobicRatio: 66,
    liningResidues: ['MET-793', 'LEU-718', 'ALA-743', 'LYS-745', 'THR-790', 'ASP-855', 'GLU-762'],
    keyInteractions: ['Met793 hinge donor-acceptor pair', 'Gatekeeper Thr790 hydrophobics', 'Lys745-Glu762 catalytic ion pair'],
    suggestedLigandTypes: ['Quinazoline derivatives (Gefitinib, Erlotinib)', '4-Anilinoquinazoline scaffolds'],
    probePointsCount: 118,
    meanCurvature: 0.46,
    description: 'Canonical kinase active site with deep adenine cleft and hydrophobic selectivity pocket behind Thr790.',
  },
  {
    id: 'pkt-1m17-02',
    rank: 2,
    name: 'C-Helix Adjacent Allosteric Pocket',
    type: 'Allosteric Pocket',
    center: { x: 15.60, y: 6.20, z: 47.90 },
    suggestedDimensions: { x: 18.0, y: 16.0, z: 16.0 },
    volume: 530,
    surfaceArea: 310,
    druggabilityScore: 0.70,
    burialRatio: 68,
    hydrophobicRatio: 70,
    liningResidues: ['PHE-723', 'VAL-726', 'LEU-777', 'MET-766', 'ILE-759'],
    keyInteractions: ['C-helix regulatory conformation stabilization', 'Hydrophobic core packing'],
    suggestedLigandTypes: ['Allosteric kinase modulators (e.g. EAI045 analogs)'],
    probePointsCount: 64,
    meanCurvature: 0.35,
    description: 'Cryptic site adjacent to the αC-helix used by fourth-generation mutant-selective allosteric EGFR inhibitors.',
  },
];

/**
 * Compute initial or detected pockets for any receptor
 */
export function getInitialPocketsForReceptor(receptor: Receptor, params: GridSearchParams = DEFAULT_GRID_SEARCH_PARAMS): BindingPocket[] {
  const filename = receptor.filename.toLowerCase();
  let basePockets: BindingPocket[] = [];

  if (filename.includes('6lu7') || filename.includes('mpro')) {
    basePockets = MPRO_6LU7_POCKETS;
  } else if (filename.includes('1m17') || filename.includes('egfr')) {
    basePockets = EGFR_1M17_POCKETS;
  } else {
    // Default to 5EW8 Kinase pockets
    basePockets = KINASE_5EW8_POCKETS;
  }

  // Adjust parameters dynamically based on search params (grid spacing, probe radius, algorithm)
  return basePockets.map((pkt) => {
    // Scale volume slightly based on probe radius
    const probeFactor = 1.4 / params.probeRadius;
    const adjustedVolume = Math.round(pkt.volume * Math.pow(probeFactor, 0.4));
    const probeCount = Math.round((adjustedVolume / 8.5) * (1.0 / params.gridSpacing));

    // Generate accurate 3D cavity probe points for 3D visualization
    const probePoints = generateCavityProbePoints(pkt.center, pkt.suggestedDimensions, Math.min(probeCount, 120));

    return {
      ...pkt,
      volume: adjustedVolume,
      probePointsCount: probePoints.length,
      probePoints,
    };
  });
}

/**
 * Execute simulated grid-based protein surface search with realistic multi-step telemetry
 */
export async function executeGridSurfaceSearch(
  receptor: Receptor,
  params: GridSearchParams,
  onProgress?: (progress: number, phaseText: string) => void
): Promise<{ pockets: BindingPocket[]; stats: PocketSearchStats }> {
  const startTime = Date.now();

  // Phase 1: Discretization
  onProgress?.(15, `Generating 3D spatial grid envelope (${params.gridSpacing} Å probe resolution)...`);
  await new Promise((r) => setTimeout(r, 350));

  // Phase 2: Ray-tracing & Concavity
  onProgress?.(45, `Casting ray-probe intersections across solvent-accessible surface (SAS)...`);
  await new Promise((r) => setTimeout(r, 450));

  // Phase 3: Probe Density Clustering
  onProgress?.(75, `DBSCAN spatial clustering of high-concavity probes (cutoff ${params.minVolumeCutoff} Å³)...`);
  await new Promise((r) => setTimeout(r, 400));

  // Phase 4: Druggability Scoring & Residue Extraction
  onProgress?.(95, `Calculating Dscore indices & identifying lining residue microenvironments...`);
  await new Promise((r) => setTimeout(r, 300));

  // Retrieve receptor pockets with current parameters
  const pockets = getInitialPocketsForReceptor(receptor, params);

  const duration = Date.now() - startTime;
  const gridPointDensity = Math.round(48000 / Math.pow(params.gridSpacing, 2.5));
  const surfaceProbes = Math.round(gridPointDensity * 0.32);

  const stats: PocketSearchStats = {
    totalGridPoints: gridPointDensity,
    proteinSurfaceProbes: surfaceProbes,
    cavityClustersIdentified: pockets.length,
    executionDurationMs: duration,
    timestamp: new Date().toLocaleTimeString(),
  };

  onProgress?.(100, `Grid search complete: ${pockets.length} potential binding pockets identified.`);

  return { pockets, stats };
}
