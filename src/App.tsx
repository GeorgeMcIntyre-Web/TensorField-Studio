import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { useAppStore } from './store/useAppStore';
import { AppMode } from './types';

import { TensorSandboxScene } from './scenes/TensorSandboxScene';
import { MechanicsScene } from './scenes/MechanicsScene';
import { RelativityScene } from './scenes/RelativityScene';

import { TensorSandbox } from './components/TensorSandbox';
import { MechanicsControls } from './components/MechanicsControls';
import { RelativityControls } from './components/RelativityControls';
import { InsightsPanel } from './components/InsightsPanel';
import { SnapshotControls } from './components/SnapshotControls';

class SceneErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error("Scene Render Error:", error); }
  render() {
    if (this.state.hasError) return <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-slate-900">Scene crashed. Check console.</div>;
    return this.props.children;
  }
}

const App: React.FC = () => {
  const mode = useAppStore((state) => state.mode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="text-white p-4">Booting TensorField Studio...</div>;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      <header className="bg-indigo-900 text-white text-center text-[10px] py-1 z-50 font-bold border-b border-indigo-700 uppercase tracking-widest">
        TensorField Studio – UI Loaded
      </header>

      <Navigation />
      
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-900">
            <SceneErrorBoundary>
              {mode === AppMode.SANDBOX && <TensorSandboxScene />}
              {mode === AppMode.MECHANICS && <MechanicsScene />}
              {mode === AppMode.RELATIVITY && <RelativityScene />}
            </SceneErrorBoundary>
        </div>

        <div className="relative z-10 w-full h-full pointer-events-none">
            <div className="pointer-events-auto">
                {mode === AppMode.SANDBOX && <TensorSandbox />}
                {mode === AppMode.MECHANICS && <MechanicsControls />}
                {mode === AppMode.RELATIVITY && <RelativityControls />}
            </div>

            <SnapshotControls />
            <InsightsPanel />
        </div>
      </div>
    </div>
  );
};

export default App;