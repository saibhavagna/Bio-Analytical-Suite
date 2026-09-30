import { DockingSession } from '@/types/docking';
import {
  initialProject,
  initialReceptor,
  initialBindingSite,
  initialLigands,
  initialProtocol,
  posesByLigand,
} from '@/data/initialData';

const DB_NAME = 'BioAnalyticalDocking_DB';
const DB_VERSION = 1;
const STORE_NAME = 'docking_sessions';
const FALLBACK_KEY = 'bioanalytical_docking_sessions_backup';

/**
 * Check if IndexedDB is available in the current browser/environment
 */
export function isIndexedDBAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return typeof window.indexedDB !== 'undefined' && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Open or initialize IndexedDB connection
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB is not supported or accessible in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('targetPdb', 'metadata.targetPdb', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB.'));
    };
  });
}

/**
 * Fallback storage helper using localStorage
 */
function getFallbackSessions(): DockingSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? (JSON.parse(raw) as DockingSession[]) : [];
  } catch (err) {
    console.error('LocalStorage fallback read error:', err);
    return [];
  }
}

function saveFallbackSessions(sessions: DockingSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('LocalStorage fallback write error:', err);
  }
}

/**
 * Retrieve all saved docking sessions, sorted newest first
 */
export async function getAllSessions(): Promise<DockingSession[]> {
  if (!isIndexedDBAvailable()) {
    const fallback = getFallbackSessions();
    return fallback.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const list = (request.result as DockingSession[]) || [];
        list.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(list);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to retrieve sessions from IndexedDB.'));
      };
    });
  } catch {
    // If IndexedDB errors out unexpectedly, gracefully read fallback
    return getFallbackSessions().sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

/**
 * Retrieve a specific docking session by ID
 */
export async function getSessionById(id: string): Promise<DockingSession | null> {
  if (!isIndexedDBAvailable()) {
    const fallback = getFallbackSessions();
    return fallback.find((s) => s.id === id) || null;
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve((request.result as DockingSession) || null);
      };

      request.onerror = () => {
        reject(request.error || new Error(`Failed to retrieve session ${id}.`));
      };
    });
  } catch {
    const fallback = getFallbackSessions();
    return fallback.find((s) => s.id === id) || null;
  }
}

/**
 * Save or update a session in IndexedDB
 */
export async function saveSessionToStorage(session: DockingSession): Promise<void> {
  // Always update the fallback so data is mirrored
  const fallback = getFallbackSessions();
  const existingIdx = fallback.findIndex((s) => s.id === session.id);
  if (existingIdx >= 0) {
    fallback[existingIdx] = session;
  } else {
    fallback.push(session);
  }
  saveFallbackSessions(fallback);

  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(session);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error || new Error(`Failed to save session ${session.id} to IndexedDB.`));
      };
    });
  } catch (err) {
    console.warn('Saved to localStorage fallback due to IndexedDB error:', err);
  }
}

/**
 * Delete a session by ID
 */
export async function deleteSessionFromStorage(id: string): Promise<void> {
  const fallback = getFallbackSessions().filter((s) => s.id !== id);
  saveFallbackSessions(fallback);

  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error || new Error(`Failed to delete session ${id}.`));
      };
    });
  } catch (err) {
    console.warn('Deleted from localStorage fallback, IndexedDB error:', err);
  }
}

/**
 * Duplicate an existing session with a new ID and timestamp
 */
export async function duplicateSession(id: string, newTitle?: string): Promise<DockingSession | null> {
  const original = await getSessionById(id);
  if (!original) return null;

  const timestamp = Date.now();
  const clone: DockingSession = {
    ...original,
    id: `session-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
    name: newTitle || `${original.name} (Copy)`,
    createdAt: timestamp,
    updatedAt: timestamp,
    isPreset: false,
    project: {
      ...original.project,
      name: newTitle || `${original.project.name} (Copy)`,
      runName: `Run_${new Date(timestamp).toISOString().slice(11, 19).replace(/:/g, '')}`,
      uuid: `PROJ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    },
  };

  await saveSessionToStorage(clone);
  return clone;
}

/**
 * Export session as a downloadable .json file
 */
export function exportSessionToFile(session: DockingSession): void {
  const jsonStr = JSON.stringify(session, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = session.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `${safeName}_${session.metadata.targetPdb}.biodock.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import a session from a JSON string or file content
 */
export async function importSessionFromJson(jsonStr: string): Promise<DockingSession> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Invalid JSON format. Could not parse docking session payload.');
  }

  const s = parsed as Partial<DockingSession>;
  if (!s.project || !s.receptor || !s.bindingSite || !s.ligands) {
    throw new Error('Incomplete session schema. Missing required receptor, ligand, or coordinate definitions.');
  }

  const timestamp = Date.now();
  const importedSession: DockingSession = {
    id: `session-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
    name: s.name ? `${s.name} (Imported)` : `Imported Docking Session ${new Date(timestamp).toLocaleDateString()}`,
    description: s.description || 'Imported molecular docking session snapshot.',
    createdAt: timestamp,
    updatedAt: timestamp,
    tags: Array.isArray(s.tags) && s.tags.length > 0 ? s.tags : ['Imported', 'JSON-Archive'],
    isPreset: false,
    metadata: {
      targetPdb: s.metadata?.targetPdb || s.receptor.filename || 'Custom.pdb',
      targetName: s.metadata?.targetName || s.receptor.name || 'Imported Macromolecule',
      bestDeltaG: s.metadata?.bestDeltaG ?? -8.5,
      ligandCount: s.ligands.length,
      posesCount: s.poses?.length || 5,
      engine: s.metadata?.engine || s.dockingProtocol?.engine || 'AutoDock Vina 1.2.5',
      status: 'Completed',
    },
    project: s.project,
    receptor: s.receptor,
    bindingSite: s.bindingSite,
    ligands: s.ligands,
    dockingProtocol: s.dockingProtocol || initialProtocol,
    dockingRun: s.dockingRun || {
      status: 'completed',
      progress: 100,
      currentPhaseText: 'Docking run completed (Imported)',
      runId: `IMP-${timestamp}`,
      savedTimestamp: new Date(timestamp).toISOString(),
    },
    selectedLigandId: s.selectedLigandId || s.ligands[0]?.id || 'LIG-001',
    selectedPoseId: s.selectedPoseId || s.poses?.[0]?.id || 'P-001',
    poses: s.poses || posesByLigand['LIG-003'] || [],
    posesByLigand: s.posesByLigand || posesByLigand,
    logs: s.logs || [],
  };

  await saveSessionToStorage(importedSession);
  return importedSession;
}

/**
 * Calculate storage footprint and record count
 */
export async function getStorageFootprint(): Promise<{
  count: number;
  estimatedKb: number;
  engine: 'IndexedDB' | 'LocalStorage';
}> {
  const sessions = await getAllSessions();
  const jsonStr = JSON.stringify(sessions);
  const bytes = new Blob([jsonStr]).size;
  const estimatedKb = Math.round((bytes / 1024) * 10) / 10;
  return {
    count: sessions.length,
    estimatedKb,
    engine: isIndexedDBAvailable() ? 'IndexedDB' : 'LocalStorage',
  };
}

/**
 * Seed 3 curated default benchmark sessions if storage is empty
 */
export async function seedPresetSessionsIfEmpty(): Promise<DockingSession[]> {
  const existing = await getAllSessions();
  if (existing.length > 0) {
    return existing;
  }

  const now = Date.now();

  const presets: DockingSession[] = [
    {
      id: 'session-preset-5ew8',
      name: 'Kinase Catalytic Domain (5EW8) — Staurosporine Optimization',
      description: 'ATP-binding hinge pocket characterization targeting TYR-122 and ASP-85 with 10 candidate poses and full thermodynamic decomposition.',
      createdAt: now - 3600 * 1000 * 24, // 1 day ago
      updatedAt: now - 3600 * 1000 * 4,  // 4 hours ago
      tags: ['Kinase', 'Lead-Opt', 'ATP-Hinge', 'Benchmark', 'Vina 1.2.5'],
      isPreset: true,
      metadata: {
        targetPdb: '5EW8.pdb',
        targetName: 'Kinase Catalytic Domain (5EW8)',
        bestDeltaG: -9.20,
        ligandCount: 20,
        posesCount: 10,
        engine: 'AutoDock Vina 1.2.5',
        status: 'Completed',
      },
      project: {
        ...initialProject,
        name: 'Kinase Lead Optimization Campaign',
        runName: 'Run_5EW8_HighExhaustiveness_32',
      },
      receptor: initialReceptor,
      bindingSite: initialBindingSite,
      ligands: initialLigands,
      dockingProtocol: {
        ...initialProtocol,
        exhaustiveness: 32,
      },
      dockingRun: {
        status: 'completed',
        progress: 100,
        currentPhaseText: 'Optimization complete. 10 energy minima identified.',
        runId: 'RUN-5EW8-B01',
        savedTimestamp: new Date(now - 3600 * 1000 * 4).toISOString(),
      },
      selectedLigandId: 'LIG-003',
      selectedPoseId: 'P-001',
      poses: posesByLigand['LIG-003'] || [],
      posesByLigand,
      logs: [
        { id: 'log-1', timestamp: '10:14:02', level: 'INFO', message: 'Target 5EW8.pdb loaded. Resolution: 1.85 Å.' },
        { id: 'log-2', timestamp: '10:14:15', level: 'SUCCESS', message: 'Search grid box parameterized: 9,680 Å³ volume.' },
        { id: 'log-3', timestamp: '10:15:30', level: 'SUCCESS', message: 'AutoDock Vina finished with top pose ΔG = -9.20 kcal/mol.' },
      ],
    },
    {
      id: 'session-preset-6lu7',
      name: 'SARS-CoV-2 Mpro (6LU7) — Antiviral Protease Dyad Screen',
      description: 'Screening peptidomimetic inhibitor library against the catalytic dyad (HIS-41 / CYS-145) and the oxyanion subsite.',
      createdAt: now - 3600 * 1000 * 48,
      updatedAt: now - 3600 * 1000 * 12,
      tags: ['Antiviral', 'COVID-19', 'Protease', 'Covalent-Dyad', 'Benchmark'],
      isPreset: true,
      metadata: {
        targetPdb: '6LU7.pdb',
        targetName: 'SARS-CoV-2 Main Protease (6LU7)',
        bestDeltaG: -10.45,
        ligandCount: 20,
        posesCount: 5,
        engine: 'AutoDock Vina 1.2.5',
        status: 'Completed',
      },
      project: {
        name: 'Mpro Antiviral Screening Program',
        stage: 'Hit Validation',
        runName: 'Run_6LU7_Dimeric_01',
        description: 'Screening peptidomimetic inhibitor library against the catalytic dyad (HIS-41 / CYS-145).',
        workspaceDir: '/data/runs/6LU7_Mpro_Screen',
        uuid: 'PROJ-6LU7-DYAD',
        isoDate: new Date(now - 3600 * 1000 * 12).toISOString(),
      },
      receptor: {
        id: 'rec_6lu7',
        filename: '6LU7.pdb',
        name: 'SARS-CoV-2 Main Protease (6LU7)',
        chain: 'A',
        resolution: 2.16,
        atomCount: 2548,
        residuesCount: 306,
        preparationOptions: initialReceptor.preparationOptions,
        preparationStatus: 'prepared',
        progress: 100,
      },
      bindingSite: {
        id: 'site_6lu7',
        name: 'Catalytic Dyad (HIS-41 / CYS-145)',
        center: { x: -10.8, y: 12.5, z: 68.2 },
        size: { x: 22.5, y: 22.5, z: 22.5 },
        spacing: 0.375,
        volume: 11390,
        showGrid: true,
        referenceResidues: ['HIS-41', 'CYS-145', 'GLU-166', 'GLY-143', 'MET-165'],
      },
      ligands: initialLigands,
      dockingProtocol: {
        ...initialProtocol,
        exhaustiveness: 24,
      },
      dockingRun: {
        status: 'completed',
        progress: 100,
        currentPhaseText: 'Vina convergence achieved. High-affinity peptidomimetic poses docked.',
        runId: 'RUN-6LU7-A02',
        savedTimestamp: new Date(now - 3600 * 1000 * 12).toISOString(),
      },
      selectedLigandId: 'LIG-001',
      selectedPoseId: 'P-101',
      poses: posesByLigand['LIG-001'] || [],
      posesByLigand,
      logs: [
        { id: 'log-m1', timestamp: '08:20:00', level: 'INFO', message: 'Target 6LU7.pdb loaded. Resolution: 2.16 Å.' },
        { id: 'log-m2', timestamp: '08:20:45', level: 'SUCCESS', message: 'Dyad cavity (HIS-41/CYS-145) parameterized.' },
        { id: 'log-m3', timestamp: '08:22:10', level: 'SUCCESS', message: 'Top pose docked with ΔG = -10.45 kcal/mol.' },
      ],
    },
    {
      id: 'session-preset-1m17',
      name: 'EGFR Kinase (1M17) — Quinazoline Gatekeeper Pocket Lead',
      description: 'Evaluation of quinazoline-based Erlotinib analogs around gatekeeper residue THR-766 and hinge region MET-769.',
      createdAt: now - 3600 * 1000 * 72,
      updatedAt: now - 3600 * 1000 * 20,
      tags: ['EGFR', 'Oncology', 'Kinase', 'Quinazoline', 'Benchmark'],
      isPreset: true,
      metadata: {
        targetPdb: '1M17.pdb',
        targetName: 'EGFR Tyrosine Kinase (1M17)',
        bestDeltaG: -8.80,
        ligandCount: 20,
        posesCount: 8,
        engine: 'AutoDock Vina 1.2.5',
        status: 'Completed',
      },
      project: {
        name: 'EGFR Tyrosine Kinase Discovery',
        stage: 'Lead Generation',
        runName: 'Run_1M17_Gatekeeper_THR766',
        description: 'Evaluation of quinazoline-based Erlotinib analogs around gatekeeper residue THR-766.',
        workspaceDir: '/data/runs/1M17_EGFR',
        uuid: 'PROJ-1M17-EGFR',
        isoDate: new Date(now - 3600 * 1000 * 20).toISOString(),
      },
      receptor: {
        id: 'rec_1m17',
        filename: '1M17.pdb',
        name: 'EGFR Tyrosine Kinase Domain (1M17)',
        chain: 'A',
        resolution: 2.60,
        atomCount: 2750,
        residuesCount: 332,
        preparationOptions: initialReceptor.preparationOptions,
        preparationStatus: 'prepared',
        progress: 100,
      },
      bindingSite: {
        id: 'site_1m17',
        name: 'Erlotinib Binding Pocket',
        center: { x: 22.0, y: 0.5, z: 52.0 },
        size: { x: 20.0, y: 20.0, z: 20.0 },
        spacing: 0.375,
        volume: 8000,
        showGrid: true,
        referenceResidues: ['MET-769', 'LYS-721', 'THR-766', 'LEU-694', 'ALA-719'],
      },
      ligands: initialLigands,
      dockingProtocol: {
        ...initialProtocol,
        exhaustiveness: 16,
      },
      dockingRun: {
        status: 'completed',
        progress: 100,
        currentPhaseText: 'Docking run completed. Quinazoline scaffold energy scored.',
        runId: 'RUN-1M17-C03',
        savedTimestamp: new Date(now - 3600 * 1000 * 20).toISOString(),
      },
      selectedLigandId: 'LIG-003',
      selectedPoseId: 'P-001',
      poses: posesByLigand['LIG-003'] || [],
      posesByLigand,
      logs: [
        { id: 'log-e1', timestamp: '14:02:11', level: 'INFO', message: 'Target 1M17.pdb loaded. Resolution: 2.60 Å.' },
        { id: 'log-e2', timestamp: '14:03:00', level: 'SUCCESS', message: 'Receptor prepared with Kollman charges.' },
        { id: 'log-e3', timestamp: '14:04:15', level: 'SUCCESS', message: 'Docking completed with ΔG = -8.80 kcal/mol.' },
      ],
    },
  ];

  for (const preset of presets) {
    await saveSessionToStorage(preset);
  }

  return presets;
}
