export interface ScientificMetricInfo {
  id: string;
  name: string;
  symbol?: string;
  category: 'Energetics' | 'Conformation' | 'Interactions' | 'Efficiency' | 'ADMET';
  unit: string;
  unitConversion?: string;
  definition: string;
  physicalMeaning: string;
  interpretation?: string;
  targetBenchmark?: string;
  formula?: string;
  clinicalRelevance?: string;
}

export const SCIENTIFIC_METRICS: Record<string, ScientificMetricInfo> = {
  deltaG: {
    id: 'deltaG',
    name: 'Gibbs Free Energy of Binding',
    symbol: 'ΔG',
    category: 'Energetics',
    unit: 'kcal/mol',
    unitConversion: '1 kcal/mol = 4.184 kJ/mol',
    definition:
      'Thermodynamic change in Gibbs free energy upon non-covalent binding between the ligand and target receptor at standard state (298.15 K, 1 atm).',
    physicalMeaning:
      'More negative values denote thermodynamically favorable, spontaneous complex formation. Governed by the thermodynamic fundamental relation: ΔG = ΔH - TΔS.',
    interpretation:
      'Values ≤ -8.0 kcal/mol typically correspond to sub-micromolar affinity (Kd < 1 µM); ≤ -9.5 kcal/mol denotes potent nanomolar target engagement.',
    targetBenchmark: '≤ -7.5 kcal/mol (hit threshold), ≤ -9.0 kcal/mol (lead target)',
    formula: 'ΔG = -RT ln(Ka) = RT ln(Kd) = ΔH - TΔS',
    clinicalRelevance:
      'Dictates the thermodynamic equilibrium affinity and required systemic drug concentration for in vivo target receptor occupancy.',
  },

  rmsd: {
    id: 'rmsd',
    name: 'Root Mean Square Deviation',
    symbol: 'RMSD',
    category: 'Conformation',
    unit: 'Ångström (Å)',
    unitConversion: '1 Å = 10⁻¹⁰ m = 0.1 nm',
    definition:
      'Average measure of spatial deviation between the atomic coordinates of a docked ligand pose and a reference structure (either the co-crystallized native ligand or the Rank #1 pose).',
    physicalMeaning:
      'Quantifies structural reproducibility and conformational divergence across sampled docking poses.',
    interpretation:
      'RMSD ≤ 2.0 Å is the universally recognized gold-standard benchmark for successful crystallographic pose reproduction in computational docking.',
    targetBenchmark: '≤ 2.0 Å (native-like pose), 2.0–3.0 Å (moderate overlap), > 3.0 Å (distinct binding mode)',
    formula: 'RMSD = √[ (1/N) ∑ᵢ₌₁ᴺ || rᵢ,docked - rᵢ,ref ||² ]',
    clinicalRelevance:
      'Essential for reliable structure-based lead optimization; inaccurate binding poses lead to incorrect pharmacophore hypotheses.',
  },

  rmsdLowerBound: {
    id: 'rmsdLowerBound',
    name: 'RMSD Lower Bound',
    symbol: 'RMSD l.b.',
    category: 'Conformation',
    unit: 'Ångström (Å)',
    definition:
      'Lower-bound RMSD calculated by matching each atom of the docked pose with the closest atom of the identical element type in the reference conformation.',
    physicalMeaning:
      'Provides a theoretical lower limit that is mathematically invariant to atom indexing order and topological rotational symmetry.',
    interpretation:
      'Resolves artificial inflation of RMSD in symmetric chemical moieties (such as symmetrical phenyl rings or carboxylates).',
  },

  rmsdUpperBound: {
    id: 'rmsdUpperBound',
    name: 'RMSD Upper Bound',
    symbol: 'RMSD u.b.',
    category: 'Conformation',
    unit: 'Ångström (Å)',
    definition:
      'Upper-bound RMSD matching atoms strictly based on original input atom numbering and graph connectivity.',
    physicalMeaning:
      'Reflects exact coordinate correspondence without rotational symmetry simplification.',
    interpretation:
      'Represents maximum spatial divergence when preserving rigid atomic indices across conformations.',
  },

  hBonds: {
    id: 'hBonds',
    name: 'Intermolecular Hydrogen Bonds',
    symbol: 'H-Bonds',
    category: 'Interactions',
    unit: 'Count / Distance in Å',
    definition:
      'Directional non-covalent dipole interactions formed between an electronegative donor with a hydrogen atom (N-H, O-H) and an electronegative acceptor atom with lone pairs (O, N, S).',
    physicalMeaning:
      'Provides exquisite geometric and electrostatic specificity, anchoring the ligand into catalytic or allosteric subpockets with favorable binding enthalpy (ΔH).',
    interpretation:
      'Optimal heavy-atom distance is 1.8–3.2 Å with donor-H-acceptor angle > 120°. Each bond contributes approximately -1.0 to -3.5 kcal/mol to binding enthalpy.',
    targetBenchmark: '≥ 2 directional H-bonds with key pocket residues',
  },

  hydrophobic: {
    id: 'hydrophobic',
    name: 'Hydrophobic Surface Contacts',
    symbol: 'Lipophilic',
    category: 'Interactions',
    unit: 'Count (contacts < 4.0 Å)',
    definition:
      'Apolar contacts formed between non-polar carbon atoms of the ligand and lipophilic sidechains of the protein binding pocket.',
    physicalMeaning:
      'Drives binding affinity primarily through the classical hydrophobic effect: displacing structured, entropic water molecules from the cavity to bulk solvent.',
    interpretation:
      'Contributes substantial favorable entropic gain (-TΔS). However, excessive lipophilicity increases non-specific binding and metabolic clearance.',
    targetBenchmark: '3–8 balanced lipophilic contacts',
  },

  clashScore: {
    id: 'clashScore',
    name: 'Steric Clash Penalty',
    symbol: 'Clash',
    category: 'Energetics',
    unit: 'Normalized penalty',
    definition:
      'Evaluation of atomic van der Waals radius interpenetration between ligand atoms and receptor residues beyond allowable contact tolerances (< 0.4 Å overlap).',
    physicalMeaning:
      'Represents the steep 1/r¹² Pauli exchange repulsion term. High clash scores indicate physically impossible overlapping coordinates.',
    interpretation:
      '0.00 indicates a relaxed, steric clash-free binding geometry. Values > 1.0 indicate unacceptable steric clashes requiring energy minimization.',
    targetBenchmark: '0.00 (optimal), < 0.50 (tolerable)',
  },

  ligandEfficiency: {
    id: 'ligandEfficiency',
    name: 'Ligand Efficiency',
    symbol: 'LE',
    category: 'Efficiency',
    unit: 'kcal/mol / heavy atom (HA)',
    definition:
      'Normalized free energy of binding per non-hydrogen (heavy) atom in the small molecule.',
    physicalMeaning:
      'Evaluates binding potency independently of molecular weight, preventing the selection of artificially high-affinity compounds driven purely by large size (molecular obesity).',
    interpretation:
      'LE ≥ 0.30 kcal/mol/HA is the standard benchmark in structure-based drug design; values ≥ 0.40 kcal/mol/HA represent exceptional fragment hits.',
    targetBenchmark: '≥ 0.30 kcal/mol/HA (lead threshold), ≥ 0.40 (fragment hit)',
    formula: 'LE = -ΔG / N_heavy',
    clinicalRelevance:
      'Compounds with high LE maintain higher oral bioavailability and lower clearance as their molecular weight is elaborated during lead optimization.',
  },

  lipophilicEfficiency: {
    id: 'lipophilicEfficiency',
    name: 'Lipophilic Efficiency',
    symbol: 'LipE / LLE',
    category: 'Efficiency',
    unit: 'Logarithmic index',
    definition:
      'Index capturing binding potency normalized for lipophilicity: LipE = pIC50 - cLogP.',
    physicalMeaning:
      'Determines whether target affinity is driven by specific directional interactions rather than non-specific hydrophobic partitioning into cell membranes.',
    interpretation:
      'Molecules with LipE ≥ 5.0 demonstrate balanced drug-like profiles with lower risks of CYP enzyme inhibition, hERG cardiac toxicity, and plasma protein binding.',
    targetBenchmark: '≥ 5.0 (drug-like candidate), ≥ 7.0 (clinical candidate)',
    formula: 'LipE = -log₁₀(Kd) - cLogP',
    clinicalRelevance:
      'Higher LipE strongly correlates with clinical trial success and favorable safety margins.',
  },

  inhibitionConstant: {
    id: 'inhibitionConstant',
    name: 'Estimated Inhibition / Dissociation Constant',
    symbol: 'Ki / Kd',
    category: 'Energetics',
    unit: 'nM / µM',
    definition:
      'Thermodynamic equilibrium dissociation constant derived from the docking scoring function energy.',
    physicalMeaning:
      'The molar ligand concentration required to achieve 50% receptor occupancy at thermodynamic equilibrium.',
    interpretation:
      'Lower values correspond to higher potency. 1–100 nM represents high-affinity lead territory; 0.1–1 µM represents viable hit matter.',
    formula: 'Ki = exp(ΔG / (R · T)), with R = 1.9872 cal/(mol·K), T = 298.15 K',
  },

  vdwEnergy: {
    id: 'vdwEnergy',
    name: 'van der Waals Dispersion Energy',
    symbol: 'ΔG_vdW',
    category: 'Energetics',
    unit: 'kcal/mol',
    definition:
      'Sum of attractive London dispersion forces and short-range steric repulsion between non-bonded atomic electron clouds.',
    physicalMeaning:
      'Quantifies shape complementarity and packed surface area between the ligand and the binding pocket.',
    formula: 'E_vdW = ∑ᵢⱼ [ (Aᵢⱼ / rᵢⱼ¹²) - (Bᵢⱼ / rᵢⱼ⁶) ]',
    interpretation:
      'Negative values indicate favorable geometric fit with low steric strain.',
  },

  electrostaticEnergy: {
    id: 'electrostaticEnergy',
    name: 'Electrostatic (Coulombic) Energy',
    symbol: 'ΔG_elec',
    category: 'Energetics',
    unit: 'kcal/mol',
    definition:
      'Coulombic interaction energy between partial charges of the ligand and receptor atoms.',
    physicalMeaning:
      'Governs ionic salt bridges and dipole-dipole alignments, moderated by distance-dependent dielectric screening.',
    formula: 'E_elec = ∑ᵢⱼ (qᵢ · qⱼ) / (4πε₀ · ε(r) · rᵢⱼ)',
    interpretation:
      'Substantially negative in active sites with charged residues (e.g. Lys, Asp, Glu, Arg).',
  },

  desolvationEnergy: {
    id: 'desolvationEnergy',
    name: 'Hydrophobic Desolvation Energy',
    symbol: 'ΔG_desolv',
    category: 'Energetics',
    unit: 'kcal/mol',
    definition:
      'Thermodynamic cost of stripping coordinating hydration water molecules from polar and non-polar surfaces of the ligand and active site upon binding.',
    physicalMeaning:
      'Reflects the balance between the loss of solute-water hydrogen bonds and the entropic release of ordered water to bulk solvent.',
    interpretation:
      'Positive value represents an energetic penalty that must be overcome by favorable vdW and H-bonding interactions.',
  },

  torsionalStrain: {
    id: 'torsionalStrain',
    name: 'Torsional Free Energy Penalty',
    symbol: 'ΔG_tors',
    category: 'Energetics',
    unit: 'kcal/mol',
    definition:
      'Entropic conformational penalty resulting from the loss of torsional degrees of freedom (free rotation around single bonds) upon complexation.',
    physicalMeaning:
      'Freezing flexible rotatable bonds into a single bound conformation incurs an entropic cost (~0.3 kcal/mol per active rotatable bond).',
    formula: 'ΔG_tors ≈ N_tors × 0.31 kcal/mol',
    interpretation:
      'Pre-rigidifying a chemical scaffold (conformational restriction) minimizes this penalty and enhances net binding affinity.',
  },

  tpsa: {
    id: 'tpsa',
    name: 'Topological Polar Surface Area',
    symbol: 'TPSA',
    category: 'ADMET',
    unit: 'Ångström² (Å²)',
    definition:
      'Surface sum over all polar atoms (primarily oxygens, nitrogens, and their attached hydrogens) in the molecular graph.',
    physicalMeaning:
      'Key physicochemical parameter governing hydrogen-bonding capacity and cellular membrane permeation.',
    interpretation:
      'TPSA ≤ 140 Å² is required for good human oral bioavailability; TPSA ≤ 90 Å² is needed for blood-brain barrier (BBB) penetration.',
    targetBenchmark: '20–130 Å² (oral drugs), < 90 Å² (CNS active)',
    clinicalRelevance:
      'Excessive TPSA (> 140 Å²) prevents passive gastrointestinal absorption and intracellular entry.',
  },

  logP: {
    id: 'logP',
    name: 'Octanol-Water Partition Coefficient',
    symbol: 'cLogP',
    category: 'ADMET',
    unit: 'Log ratio (dimensionless)',
    definition:
      'Logarithm of the concentration ratio of neutral unionized compound between 1-octanol (lipid membrane mimic) and pure aqueous buffer.',
    physicalMeaning:
      'Fundamental metric of compound lipophilicity and membrane partitioning propensity.',
    interpretation:
      'Lipinski Rule of 5 limit: LogP ≤ 5.0. High LogP (> 4.5) correlates with poor aqueous solubility, non-specific binding, and CYP450 metabolic liability.',
    targetBenchmark: '1.0–3.5 (optimal oral drug range)',
  },

  molecularWeight: {
    id: 'molecularWeight',
    name: 'Molecular Weight',
    symbol: 'MW',
    category: 'ADMET',
    unit: 'g/mol (Da)',
    definition: 'Total molecular mass based on standard IUPAC atomic weights.',
    physicalMeaning:
      'Influences diffusion rates, membrane permeability, and binding site cavity volume occupancy.',
    interpretation:
      'Lipinski Rule of 5 benchmark: MW ≤ 500 g/mol for oral bioavailability; Rule of 3 benchmark: MW ≤ 300 g/mol for fragment-based discovery.',
    targetBenchmark: '≤ 500 g/mol (Lipinski Rule of 5)',
  },

  hbd_hba: {
    id: 'hbd_hba',
    name: 'H-Bond Donors & Acceptors',
    symbol: 'HBD / HBA',
    category: 'ADMET',
    unit: 'Count',
    definition:
      'Donors (HBD): O-H and N-H groups. Acceptors (HBA): Oxygen and nitrogen atoms with lone electron pairs.',
    physicalMeaning:
      'Influences desolvation penalty when crossing hydrophobic phospholipid bilayers.',
    interpretation:
      'Lipinski Rule of 5 thresholds: HBD ≤ 5 and HBA ≤ 10. Excess polar groups prevent passive cellular absorption.',
    targetBenchmark: 'HBD ≤ 5, HBA ≤ 10',
  },

  druggabilityScore: {
    id: 'druggabilityScore',
    name: 'Cavity Druggability Score',
    symbol: 'Dscore',
    category: 'Conformation',
    unit: 'Index (0.0 to 1.0)',
    definition:
      'Machine-learning derived index evaluating the likelihood that a protein surface pocket can bind small molecules with sub-micromolar potency.',
    physicalMeaning:
      'Evaluates pocket enclosure, hydrophobic balance, depth, and solvent exclusion volume.',
    interpretation:
      'Dscore ≥ 0.70 denotes highly druggable classical active sites; 0.50–0.69 denotes moderately druggable cavities; < 0.50 denotes shallow/difficult targets.',
    targetBenchmark: '≥ 0.70 (Highly Druggable), 0.50–0.69 (Druggable)',
  },

  contactDistance: {
    id: 'contactDistance',
    name: 'Interatomic Contact Distance',
    symbol: 'Dist (Å)',
    category: 'Interactions',
    unit: 'Ångström (Å)',
    definition:
      'Center-to-center Euclidean distance between the interacting ligand atom and receptor residue atom.',
    physicalMeaning:
      'Geometric proximity dictating non-covalent potential energies according to standard force field functions.',
    interpretation:
      'Strong H-bonds: 1.8–2.5 Å; Moderate H-bonds: 2.5–3.2 Å; Salt bridges: 2.5–4.0 Å; Hydrophobic contacts: 3.3–4.2 Å.',
  },

  exhaustiveness: {
    id: 'exhaustiveness',
    name: 'Global Search Exhaustiveness',
    symbol: 'Exhaustiveness',
    category: 'Conformation',
    unit: 'Integer (1–32)',
    definition:
      'Controls the thoroughness of the global Lamarckian Genetic Algorithm (LGA) / Monte Carlo conformational space search.',
    physicalMeaning:
      'Directly proportional to the number of independent search runs, random seeds, and evaluations of the scoring function.',
    interpretation:
      'Exhaustiveness 8 is standard screening speed; 16–32 provides comprehensive conformational sampling for flexible ligands (> 6 rotatable bonds).',
    targetBenchmark: '8 (standard screening), 16–32 (lead validation)',
  },

  maxPoses: {
    id: 'maxPoses',
    name: 'Maximum Output Poses',
    symbol: 'N_poses',
    category: 'Conformation',
    unit: 'Integer (1–20)',
    definition:
      'The upper bound on the number of distinct binding conformations retained and output after geometric clustering.',
    physicalMeaning:
      'Ensures diverse binding modes are retained without flooding analysis with near-identical redundant coordinate clusters.',
    interpretation:
      'Default of 9–10 poses provides sufficient ensemble diversity to assess alternate binding modes and stereoisomers.',
    targetBenchmark: '5–10 poses',
  },

  energyCutoff: {
    id: 'energyCutoff',
    name: 'Energy Window Cutoff',
    symbol: 'ΔE_cutoff',
    category: 'Energetics',
    unit: 'kcal/mol',
    definition:
      'Maximum allowable difference in binding free energy relative to the lowest-energy top-ranked pose (Rank 1).',
    physicalMeaning:
      'Poses with calculated energies exceeding the global minimum by more than this cutoff are discarded as thermodynamically unpopulated according to Boltzmann distribution.',
    interpretation:
      'At 298 K, a 3.0 kcal/mol difference corresponds to less than 0.6% relative Boltzmann equilibrium population.',
    targetBenchmark: '2.0–3.0 kcal/mol',
    formula: 'ΔΔG = ΔG_pose - ΔG_min ≤ Cutoff',
  },
};
