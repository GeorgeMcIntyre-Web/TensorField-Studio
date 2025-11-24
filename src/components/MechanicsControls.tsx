
import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Play, Pause, Save, RotateCcw } from 'lucide-react';
import { MohrsCirclePanel } from './MohrsCirclePanel';
import { createTensorFromComponents } from '../math/tensors';

export const MechanicsControls: React.FC = () => {
  const { 
    mechanicsExample, setMechanicsExample,
    beamLoad, setBeamLoad,
    loadFactor, setLoadFactor,
    isAnimating, setIsAnimating,
    showStressTrajectories, setShowStressTrajectories,
    saveSnapshot, snapshots, loadSnapshot
  } = useAppStore();

  useEffect(() => {
    let handle: number;
    if (isAnimating) {
        const start = Date.now();
        const animate = () => {
            const now = Date.now();
            // Oscillate 0 to 2 over 2 seconds
            const val = 1 + Math.sin((now - start) / 500);
            setLoadFactor(val);
            handle = requestAnimationFrame(animate);
        };
        handle = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(handle);
  }, [isAnimating, setLoadFactor]);

  // Dummy tensor for Mohr's circle preview (normally would pick from scene)
  // For v0.1 we can just show the tensor at the fixed end of beam
  // P=load, L=6, I=1/12, h=1. y=0.5 (top fiber)
  const dummyStress = createTensorFromComponents([
      (beamLoad * loadFactor * 6 * 0.5) / (1/12), 0, 0,
      0, 0, 0,
      0, 0, 0
  ]);

  return (
    <div className="absolute top-20 left-4 w-72 flex flex-col gap-4">
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-xl text-sm">
        <h2 className="font-bold mb-4 text-indigo-300">Mechanics Mode</h2>

        <div className="flex mb-4 bg-slate-800 rounded p-1">
          <button 
            onClick={() => setMechanicsExample('BEAM')}
            className={`flex-1 py-1 text-xs rounded transition-colors ${mechanicsExample === 'BEAM' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Beam
          </button>
          <button 
            onClick={() => setMechanicsExample('PLATE_HOLE')}
            className={`flex-1 py-1 text-xs rounded transition-colors ${mechanicsExample === 'PLATE_HOLE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Plate w/ Hole
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
             <label className="block text-xs text-slate-400 mb-1">
                {mechanicsExample === 'BEAM' ? 'End Load (P)' : 'Remote Tension (S)'}
             </label>
             <input 
               type="range" min="100" max="5000" step="100"
               value={beamLoad}
               onChange={(e) => setBeamLoad(Number(e.target.value))}
               className="w-full accent-indigo-500"
             />
             <div className="text-right font-mono text-xs">{beamLoad}</div>
          </div>

          <div className="border-t border-slate-700 pt-3">
             <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400">Load Factor</label>
                <button onClick={() => setIsAnimating(!isAnimating)} className="text-indigo-400 hover:text-white">
                    {isAnimating ? <Pause size={14} /> : <Play size={14} />}
                </button>
             </div>
             <input 
               type="range" min="0" max="2" step="0.05"
               value={loadFactor}
               onChange={(e) => setLoadFactor(Number(e.target.value))}
               className="w-full accent-indigo-500"
             />
             <div className="text-right font-mono text-xs">{loadFactor.toFixed(2)}x</div>
          </div>

          <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="traj" 
                checked={showStressTrajectories} 
                onChange={(e) => setShowStressTrajectories(e.target.checked)}
                className="accent-indigo-500"
              />
              <label htmlFor="traj" className="text-xs text-slate-300">Show Stress Trajectories</label>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-700">
             <button onClick={() => saveSnapshot('Quick Save')} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300">
                <Save size={12} /> Save
             </button>
             <div className="text-xs text-slate-500">{snapshots.length} saved</div>
          </div>
        </div>
      </div>

      <MohrsCirclePanel tensor={dummyStress} pointLabel="Ref Point (Max)" />
    </div>
  );
};