import { create } from 'zustand';
import { AppMode, Tensor3, MechanicsExample, AppSnapshot } from '../types';
import { createTensorFromComponents } from '../math/tensors';
import { DEFAULT_TENSOR_COMPONENTS } from '../constants';

// Simple ID generator fallback if crypto is unavailable (e.g. non-HTTPS context)
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

interface AppState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  
  // Sandbox
  sandboxTensor: Tensor3;
  updateSandboxComponent: (index: number, value: number) => void;

  // Mechanics
  mechanicsExample: MechanicsExample;
  setMechanicsExample: (ex: MechanicsExample) => void;
  beamLoad: number;
  setBeamLoad: (load: number) => void;
  
  // Animation & Trajectories
  loadFactor: number;
  setLoadFactor: (f: number) => void;
  isAnimating: boolean;
  setIsAnimating: (anim: boolean) => void;
  showStressTrajectories: boolean;
  setShowStressTrajectories: (show: boolean) => void;

  // Relativity
  metricType: 'flat' | 'curved';
  setMetricType: (t: 'flat' | 'curved') => void;
  gravityStrength: number;
  setGravityStrength: (g: number) => void;
  
  // Snapshots
  snapshots: AppSnapshot[];
  saveSnapshot: (label: string) => void;
  loadSnapshot: (id: string) => void;
  
  // Export/Import
  exportSnapshotJSON: (id: string) => string | null;
  importSnapshotJSON: (json: string) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  mode: AppMode.SANDBOX,
  setMode: (mode) => set({ mode }),

  sandboxTensor: createTensorFromComponents(DEFAULT_TENSOR_COMPONENTS),
  updateSandboxComponent: (index, value) => {
    const current = get().sandboxTensor.components;
    const next = [...current];
    next[index] = value;
    
    // Enforce symmetry
    if (index === 1) next[3] = value;
    if (index === 3) next[1] = value;
    if (index === 2) next[6] = value;
    if (index === 6) next[2] = value;
    if (index === 5) next[7] = value;
    if (index === 7) next[5] = value;

    set({ sandboxTensor: createTensorFromComponents(next) });
  },

  mechanicsExample: 'BEAM',
  setMechanicsExample: (mechanicsExample) => set({ mechanicsExample }),
  beamLoad: 1000,
  setBeamLoad: (beamLoad) => set({ beamLoad }),
  
  loadFactor: 1.0,
  setLoadFactor: (loadFactor) => set({ loadFactor }),
  isAnimating: false,
  setIsAnimating: (isAnimating) => set({ isAnimating }),
  showStressTrajectories: false,
  setShowStressTrajectories: (showStressTrajectories) => set({ showStressTrajectories }),

  metricType: 'flat',
  setMetricType: (metricType) => set({ metricType }),
  gravityStrength: 0.5,
  setGravityStrength: (gravityStrength) => set({ gravityStrength }),

  snapshots: [],
  
  saveSnapshot: (label) => {
    const state = get();
    const snap: AppSnapshot = {
        id: generateId(),
        label: label || `Snapshot ${state.snapshots.length + 1}`,
        date: Date.now(),
        mode: state.mode,
        data: {
            tensorComponents: state.sandboxTensor.components, 
            mechanicsExample: state.mechanicsExample,
            beamLoad: state.beamLoad,
            loadFactor: state.loadFactor,
            metricType: state.metricType,
            gravityStrength: state.gravityStrength,
            showStressTrajectories: state.showStressTrajectories
        }
    };
    set({ snapshots: [...state.snapshots, snap] });
  },

  loadSnapshot: (id) => {
      const snap = get().snapshots.find(s => s.id === id);
      if (!snap) return;
      
      const d = snap.data;
      
      // Update store based on snapshot mode to ensure consistency
      set({
          mode: snap.mode,
      });

      if (d.mechanicsExample) set({ mechanicsExample: d.mechanicsExample });
      if (typeof d.beamLoad === 'number') set({ beamLoad: d.beamLoad });
      if (typeof d.loadFactor === 'number') set({ loadFactor: d.loadFactor });
      if (d.metricType) set({ metricType: d.metricType });
      if (typeof d.gravityStrength === 'number') set({ gravityStrength: d.gravityStrength });
      if (typeof d.showStressTrajectories === 'boolean') set({ showStressTrajectories: d.showStressTrajectories });

      // Restore tensor if present
      if (d.tensorComponents) {
          set({ sandboxTensor: createTensorFromComponents(d.tensorComponents) });
      }
  },

  exportSnapshotJSON: (id: string) => {
      const snap = get().snapshots.find(s => s.id === id);
      if (!snap) return null;
      return JSON.stringify(snap, null, 2);
  },

  importSnapshotJSON: (jsonString: string) => {
      try {
          const parsed = JSON.parse(jsonString);
          
          // Guard: Basic validation
          if (!parsed.id || !parsed.mode || !parsed.data) {
              console.error("Invalid snapshot format");
              return false;
          }

          // Generate new ID to avoid collisions on import
          const newSnap = { ...parsed, id: generateId(), label: parsed.label + ' (Imported)' };
          
          set((state) => ({ snapshots: [...state.snapshots, newSnap] }));
          return true;
      } catch (e) {
          console.error("Failed to parse snapshot JSON", e);
          return false;
      }
  }
}));