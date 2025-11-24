
import React from 'react';
import { Tensor3 } from '../types';

interface Props {
  tensor: Tensor3;
  pointLabel?: string;
}

export const MohrsCirclePanel: React.FC<Props> = ({ tensor, pointLabel = "Selected Point" }) => {
  // Extract 2D plane stress components (assuming xy plane dominance for these examples)
  // sigma_x = t[0], sigma_y = t[4], tau_xy = t[1]
  const sx = tensor.components[0];
  const sy = tensor.components[4];
  const txy = tensor.components[1];

  const center = (sx + sy) / 2;
  const radius = Math.sqrt(Math.pow((sx - sy) / 2, 2) + Math.pow(txy, 2));
  
  const s1 = center + radius;
  const s2 = center - radius;
  const maxShear = radius;

  // SVG Scaling
  const padding = 20;
  const size = 200;
  // Determine scale range
  const maxVal = Math.max(Math.abs(s1), Math.abs(s2), Math.abs(maxShear)) * 1.2 || 100;
  
  const scale = (val: number) => (size / 2) + (val / maxVal) * (size / 2 - padding);
  const yScale = (val: number) => (size / 2) - (val / maxVal) * (size / 2 - padding); // SVG Y is down

  return (
    <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-lg shadow-xl w-64 mt-4">
       <h3 className="font-bold text-xs text-indigo-300 mb-2 uppercase tracking-wider">Mohr's Circle ({pointLabel})</h3>
       
       <svg width={size} height={size} className="bg-slate-800 rounded mb-2">
          {/* Axes */}
          <line x1={0} y1={size/2} x2={size} y2={size/2} stroke="#64748b" strokeWidth="1" />
          <line x1={size/2} y1={0} x2={size/2} y2={size} stroke="#64748b" strokeWidth="1" />
          
          {/* Circle */}
          <circle 
            cx={scale(center)} 
            cy={size/2} 
            r={(radius / maxVal) * (size / 2 - padding)} 
            fill="none" 
            stroke="#818cf8" 
            strokeWidth="2" 
          />

          {/* Points */}
          <circle cx={scale(sx)} cy={yScale(txy)} r="3" fill="#34d399" />
          <text x={scale(sx)} y={yScale(txy)-5} fill="#34d399" fontSize="10" textAnchor="middle">X</text>
          
          <circle cx={scale(sy)} cy={yScale(-txy)} r="3" fill="#f472b6" />
          <text x={scale(sy)} y={yScale(-txy)+10} fill="#f472b6" fontSize="10" textAnchor="middle">Y</text>
       </svg>

       <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-400">
          <span>σ₁ (Max Principal)</span>
          <span className="text-right font-mono text-white">{s1.toFixed(1)}</span>
          
          <span>σ₂ (Min Principal)</span>
          <span className="text-right font-mono text-white">{s2.toFixed(1)}</span>
          
          <span>τ_max</span>
          <span className="text-right font-mono text-white">{maxShear.toFixed(1)}</span>
       </div>
    </div>
  );
};