import { describe, it, expect } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { AppMode } from '../types';

describe('Snapshot System', () => {
    it('exports and imports snapshots correctly', () => {
        const store = useAppStore.getState();
        
        // Setup state
        store.setMode(AppMode.MECHANICS);
        store.setBeamLoad(4200);
        store.saveSnapshot("Test Snap");
        
        const snapshots = useAppStore.getState().snapshots;
        expect(snapshots.length).toBeGreaterThan(0);
        const lastSnap = snapshots[snapshots.length - 1];
        
        // Export
        const json = store.exportSnapshotJSON(lastSnap.id);
        expect(json).toBeTruthy();
        
        // Change state
        store.setBeamLoad(0);
        expect(useAppStore.getState().beamLoad).toBe(0);
        
        // Import (simulating re-importing the same string)
        const importSuccess = store.importSnapshotJSON(json!);
        expect(importSuccess).toBe(true);
        
        // Load the imported snapshot (last one in list)
        const allSnaps = useAppStore.getState().snapshots;
        const imported = allSnaps[allSnaps.length - 1];
        store.loadSnapshot(imported.id);
        
        expect(useAppStore.getState().beamLoad).toBe(4200);
        expect(useAppStore.getState().mode).toBe(AppMode.MECHANICS);
    });

    it('handles invalid json gracefully', () => {
        const store = useAppStore.getState();
        const success = store.importSnapshotJSON("{ broken json");
        expect(success).toBe(false);
    });
});
