
import { createTensorFromComponents, eigenDecompositionSymmetric } from './tensors';
import { Tensor3 } from '../types';

/**
 * Cantilever Beam (Euler-Bernoulli)
 */
export const calculateBeamStress = (
  x: number, 
  y: number, 
  P: number, 
  L: number, 
  I: number,
  h: number
): Tensor3 => {
  const sigma_xx = (P * (L - x) * y) / I;
  const tau_xy = (-P / (2 * I)) * ((h * h) / 4 - y * y);

  return createTensorFromComponents([
    sigma_xx, tau_xy, 0,
    tau_xy,   0,      0,
    0,        0,      0
  ]);
};

/**
 * Infinite Plate with Circular Hole (Kirsch Solution)
 */
export const calculatePlateHoleStress = (
  r: number,
  theta: number,
  S: number,
  a: number
): Tensor3 => {
  if (r < a) {
    return createTensorFromComponents([0,0,0, 0,0,0, 0,0,0]);
  }

  const a2_r2 = (a * a) / (r * r);
  const a4_r4 = a2_r2 * a2_r2;

  const cos2t = Math.cos(2 * theta);
  const sin2t = Math.sin(2 * theta);

  const sigma_rr = (S / 2) * (1 - a2_r2) + (S / 2) * (1 - 4 * a2_r2 + 3 * a4_r4) * cos2t;
  const sigma_tt = (S / 2) * (1 + a2_r2) - (S / 2) * (1 + 3 * a4_r4) * cos2t;
  const tau_rt = -(S / 2) * (1 + 2 * a2_r2 - 3 * a4_r4) * sin2t;

  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const c2 = c * c;
  const s2 = s * s;
  const cs = c * s;

  const sigma_xx = sigma_rr * c2 + sigma_tt * s2 - 2 * tau_rt * cs;
  const sigma_yy = sigma_rr * s2 + sigma_tt * c2 + 2 * tau_rt * cs;
  const sigma_xy = (sigma_rr - sigma_tt) * cs + tau_rt * (c2 - s2);

  return createTensorFromComponents([
    sigma_xx, sigma_xy, 0,
    sigma_xy, sigma_yy, 0,
    0,        0,        0
  ]);
};

/**
 * Calculates principal stress directions and values.
 * Returns values sorted descending, and vectors.
 */
export const getPrincipalStressesAndDirections = (t: Tensor3) => {
    return eigenDecompositionSymmetric(t);
};

/**
 * Generates a streamline for the maximum principal stress.
 * Integrates dx/ds = v1(x), where v1 is the eigenvector for sigma_1.
 */
export const calculateStressTrajectory = (
    seed: { x: number, y: number },
    steps: number,
    stepSize: number,
    fieldFn: (x: number, y: number) => Tensor3,
    direction: 'max' | 'min' = 'max'
): { x: number, y: number }[] => {
    const path = [{ ...seed }];
    let current = { ...seed };
    
    // Track previous vector to align direction (avoid sign flips)
    let prevVec = { x: 0, y: 0 };

    for (let i = 0; i < steps; i++) {
        const tensor = fieldFn(current.x, current.y);
        const eigen = eigenDecompositionSymmetric(tensor);
        
        // 0 is max, 2 is min (sorted descending)
        // Vectors are [ [x,y,z], ... ]
        const idx = direction === 'max' ? 0 : 2;
        const v3 = eigen.vectors[idx];
        
        // Project to 2D
        let vx = v3[0];
        let vy = v3[1];
        const len = Math.sqrt(vx*vx + vy*vy);

        if (len < 1e-6) break; // Singularity or zero stress state

        vx /= len;
        vy /= len;

        // Alignment check
        if (i > 0) {
            const dot = vx * prevVec.x + vy * prevVec.y;
            if (dot < 0) {
                vx = -vx;
                vy = -vy;
            }
        } else {
            prevVec = { x: vx, y: vy };
        }
        
        prevVec = { x: vx, y: vy };
        
        current = {
            x: current.x + vx * stepSize,
            y: current.y + vy * stepSize
        };
        path.push(current);
    }
    return path;
};