
import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { tensorTrace, tensorDeterminant, vonMisesStress, eigenDecompositionSymmetric } from '../math/tensors';

export const TensorSandbox: React.FC = () => {
  const { sandboxTensor, updateSandboxComponent } = useAppStore();
  
  const labels = ['xx', 'xy', 'xz', 'yx', 'yy', 'yz', 'zx', 'zy', 'zz'];
  const matrixIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  const trace = tensorTrace(sandboxTensor);
  const det = tensorDeterminant(sandboxTensor);
  const eigen = eigenDecompositionSymmetric(sandboxTensor);
  
  // Determine "Health" or Definiteness
  const evs = eigen.values;
  let health = "Indefinite";
  if (evs[0] > 0 && evs[1] > 0 && evs[2] > 0) health = "Positive Definite";
  if (evs[0] < 0 && evs[1] < 0 && evs[2] < 0) health = "Negative Definite";

  return (
    <div className="absolute top-20 left-4 w-80 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-xl text-sm">
      <h2 className="font-bold mb-4 text-indigo-300">Tensor Components</h2>
      
      <div className="grid grid-cols-3 gap-2 mb-6">
        {matrixIndices.map((idx) => (
          <div key={idx} className="flex flex-col">
            <label className="text-[10px] uppercase text-slate-500 mb-1 font-mono text-center">
              {labels[idx]}
            </label>
            <input
              type="number"
              value={sandboxTensor.components[idx]}
              onChange={(e) => updateSandboxComponent(idx, parseFloat(e.target.value) || 0)}
              className="bg-slate-800 border border-slate-600 rounded px-1 py-1 text-center text-xs focus:border-indigo-500 outline-none focus:ring-1 ring-indigo-500 transition-all"
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-slate-700 pt-4">
        <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">Scalar Invariants</h3>
        <div className="grid grid-cols-2 gap-y-1 text-xs">
            <span className="text-slate-400">Trace</span>
            <span className="font-mono text-right text-emerald-400">{trace.toFixed(2)}</span>
            
            <span className="text-slate-400">Determinant</span>
            <span className="font-mono text-right text-emerald-400">{det.toExponential(2)}</span>
            
            <span className="text-slate-400">Von Mises</span>
            <span className="font-mono text-right text-emerald-400">{vonMisesStress(sandboxTensor).toFixed(2)}</span>
        </div>

        <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider mt-2">Eigenstructure</h3>
        <div className="bg-slate-800 rounded p-2">
           <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">λ₁</span>
              <span className="font-mono">{evs[0].toFixed(2)}</span>
           </div>
           <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">λ₂</span>
              <span className="font-mono">{evs[1].toFixed(2)}</span>
           </div>
           <div className="flex justify-between text-xs">
              <span className="text-slate-400">λ₃</span>
              <span className="font-mono">{evs[2].toFixed(2)}</span>
           </div>
        </div>
        
        <div className="text-xs text-center text-slate-500 italic">
           {health}
        </div>
      </div>
    </div>
  );
};
