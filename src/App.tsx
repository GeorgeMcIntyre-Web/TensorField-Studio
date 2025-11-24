import React from 'react';
import { useAppStore } from './store/useAppStore';
import { Navigation } from './components/Navigation';
import { TensorSandboxScene } from './scenes/TensorSandboxScene';
import { MechanicsScene } from './scenes/MechanicsScene';
import { RelativityScene } from './scenes/RelativityScene';
import { TensorSandbox } from './components/TensorSandbox';
import { MechanicsControls } from './components/MechanicsControls';
import { RelativityControls } from './components/RelativityControls';
import { InsightsPanel } from './components/InsightsPanel';
import { SnapshotControls } from './components/SnapshotControls';
import { AppMode } from './types';

const App: React.FC = () => {
  const mode = useAppStore((state) => state.mode);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Navigation />
      
      <main className="flex-1 relative overflow-hidden">
        {/* 3D Scene Layer */}
        <div className="absolute inset-0 z-0">
          {mode === AppMode.SANDBOX && <TensorSandboxScene />}
          {mode === AppMode.MECHANICS && <MechanicsScene />}
          {mode === AppMode.RELATIVITY && <RelativityScene />}
        </div>

        {/* UI Overlay Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Controls are pointer-events-auto via their internal classes usually, but we ensure wrapper allows click-through */}
          
          <div className="pointer-events-auto">
             {mode === AppMode.SANDBOX && <TensorSandbox />}
             {mode === AppMode.MECHANICS && <MechanicsControls />}
             {mode === AppMode.RELATIVITY && <RelativityControls />}
          </div>
          
          <SnapshotControls />
          <InsightsPanel />
        </div>
      </main>
    </div>
  );
};

export default App;