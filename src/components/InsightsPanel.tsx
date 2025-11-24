import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppMode } from '../types';
import { eigenDecompositionSymmetric, tensorTrace } from '../math/tensors';

export const InsightsPanel: React.FC = () => {
  const { 
    mode, 
    sandboxTensor,
    mechanicsExample, beamLoad, loadFactor,
    metricType, gravityStrength 
  } = useAppStore();

  const renderSandboxInsights = () => {
    const eigen = eigenDecompositionSymmetric(sandboxTensor);
    const trace = tensorTrace(sandboxTensor);
    const evs = eigen.values;
    
    // Determine definiteness
    let defType = "Indefinite";
    if (evs.every(v => v > 0)) defType = "Positive Definite";
    else if (evs.every(v => v < 0)) defType = "Negative Definite";

    return (
      <>
        <h3 className="text-indigo-300 font-bold mb-1">Tensor Analysis</h3>
        <p className="mb-2">
          The tensor is <strong>{defType}</strong>. Its trace (invariant) is <span className="font-mono text-emerald-300">{trace.toFixed(2)}</span>.
        </p>
        <p>
          The 3D glyph represents the magnitude and direction of the principal components (eigenvalues/vectors).
          { Math.abs(evs[0] - evs[1]) < 0.1 ? " The shape is roughly symmetric (spheroid)." : " The shape is anisotropic (ellipsoid)."}
        </p>
      </>
    );
  };

  const renderMechanicsInsights = () => {
    const effectiveLoad = beamLoad * loadFactor;
    if (mechanicsExample === 'BEAM') {
        return (
            <>
                <h3 className="text-indigo-300 font-bold mb-1">Cantilever Beam</h3>
                <p className="mb-2">
                    Visualizing <strong>Euler-Bernoulli</strong> beam stress. 
                    The effective tip load is <span className="font-mono text-emerald-300">{effectiveLoad.toFixed(0)} N</span>.
                </p>
                <p>
                    Max bending stress occurs at the fixed wall (x=0). Shear stress is parabolic through the thickness.
                    Trajectories follow principal stress lines (isostatics).
                </p>
            </>
        );
    }
    return (
        <>
            <h3 className="text-indigo-300 font-bold mb-1">Plate with Hole</h3>
            <p className="mb-2">
                <strong>Kirsch Solution</strong> for an infinite plate under remote tension S = <span className="font-mono text-emerald-300">{(effectiveLoad/10).toFixed(0)} MPa</span>.
            </p>
            <p>
                Notice the Stress Concentration Factor (SCF) near the hole is exactly <strong>3.0</strong>.
                The hoop stress at the hole edge is maximal.
            </p>
        </>
    );
  };

  const renderRelativityInsights = () => {
      if (metricType === 'flat') {
          return (
              <>
                <h3 className="text-indigo-300 font-bold mb-1">Minkowski Spacetime</h3>
                <p className="mb-2">
                    Flat spacetime (Special Relativity). The metric is constant everywhere: diag(-1, 1, 1, 1).
                </p>
                <p>
                    Light cones are perfect 45° cones. Geodesics are straight lines because Christoffel symbols are zero.
                </p>
              </>
          );
      }
      return (
          <>
             <h3 className="text-indigo-300 font-bold mb-1">Curved Spacetime</h3>
             <p className="mb-2">
                 Toy static metric with potential Φ = -GM/r. Strength: <span className="font-mono text-emerald-300">{gravityStrength}</span>.
             </p>
             <p>
                 Light cones "close up" near the center due to gravitational time dilation. 
                 Light-like geodesics bend towards the mass (lensing effect).
             </p>
          </>
      );
  };

  return (
    <div className="absolute bottom-4 right-4 w-80 bg-slate-900/95 border border-slate-700 p-4 rounded-lg shadow-2xl text-xs text-slate-300 backdrop-blur-sm pointer-events-auto">
       {mode === AppMode.SANDBOX && renderSandboxInsights()}
       {mode === AppMode.MECHANICS && renderMechanicsInsights()}
       {mode === AppMode.RELATIVITY && renderRelativityInsights()}
    </div>
  );
};
