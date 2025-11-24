
import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const RelativityControls: React.FC = () => {
  const { metricType, setMetricType, gravityStrength, setGravityStrength } = useAppStore();

  const triggerGeodesic = () => {
      // Logic handled in scene via event listener or shared state?
      // For simplicity in v0.1, let's use a custom event or just let the scene poll a "trigger" state.
      // Better: Store sets a flag "traceRequested"
      window.dispatchEvent(new CustomEvent('trace-geodesic'));
  };

  const clearGeodesics = () => {
      window.dispatchEvent(new CustomEvent('clear-geodesics'));
  };

  return (
    <div className="absolute top-20 left-4 w-72 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-xl text-sm">
      <h2 className="font-bold mb-4 text-indigo-300">Metric Playground</h2>
      
      <div className="flex gap-2 mb-4">
        <button 
            onClick={() => setMetricType('flat')}
            className={`flex-1 py-1 rounded text-xs border transition-colors ${metricType === 'flat' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600 text-slate-400 hover:text-white'}`}
        >
            Minkowski
        </button>
        <button 
            onClick={() => setMetricType('curved')}
            className={`flex-1 py-1 rounded text-xs border transition-colors ${metricType === 'curved' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600 text-slate-400 hover:text-white'}`}
        >
            Gravity Well
        </button>
      </div>

      {metricType === 'curved' && (
         <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1">Mass / Potential (GM)</label>
            <input 
              type="range" min="0" max="0.4" step="0.01"
              value={gravityStrength}
              onChange={(e) => setGravityStrength(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
         </div>
      )}

      <div className="border-t border-slate-700 pt-3 mb-3 space-y-2">
          <label className="text-xs text-slate-300 font-bold block">Geodesics</label>
          <div className="flex gap-2">
              <button 
                onClick={triggerGeodesic}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-1 rounded text-xs"
              >
                Trace Path
              </button>
              <button 
                onClick={clearGeodesics}
                className="bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded text-xs"
              >
                Clear
              </button>
          </div>
          <p className="text-[10px] text-slate-500">
             Traces a light-like particle from x=-10.
          </p>
      </div>

      <div className="bg-slate-800 rounded p-2 text-xs space-y-2">
         <p className="text-slate-500 leading-tight">
            {metricType === 'flat' 
             ? "Flat spacetime. Geodesics are straight lines." 
             : "Gravity bends the path. Note that we visualize a spatial slice, so the 'path' is the projection of the 4D geodesic."}
         </p>
      </div>
    </div>
  );
};