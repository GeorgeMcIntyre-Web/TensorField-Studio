
import { MetricTensor, LightConeConfig } from '../types';

export const metricDeterminant = (m: MetricTensor): number => {
    return m.components[0] * m.components[5] * m.components[10] * m.components[15];
};

export const createMinkowskiMetric = (): MetricTensor => {
  return {
    components: [
      -1, 0, 0, 0,
       0, 1, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1
    ],
    signature: '(-, +, +, +)',
    determinant: -1
  };
};

export const createToyCurvedMetric = (x: number, y: number, z: number, strength: number): MetricTensor => {
  const r = Math.sqrt(x*x + y*y + z*z);
  const r_eff = Math.max(r, 0.5);
  const phi = -strength / r_eff;
  const safePhi = Math.max(phi, -0.4);

  const g_tt = -(1 + 2 * safePhi);
  const g_space = 1 - 2 * safePhi;

  return {
    components: [
      g_tt, 0, 0, 0,
      0, g_space, 0, 0,
      0, 0, g_space, 0,
      0, 0, 0, g_space
    ],
    signature: '(-, +, +, +)',
    determinant: g_tt * Math.pow(g_space, 3)
  };
};

export const getLightConeConfig = (m: MetricTensor): LightConeConfig => {
    const g_tt = m.components[0];
    const g_xx = m.components[5]; 

    if (g_tt >= 0 || g_xx <= 0) {
        return { slope: 0 };
    }
    const slopeSq = -g_xx / g_tt;
    return { slope: Math.sqrt(slopeSq) };
};

// --- GEODESIC INTEGRATOR ---

// 4-vector type: [t, x, y, z]
type Vec4 = [number, number, number, number];

// Christoffel Symbols Gamma^lambda_mu_nu
// For our diagonal metric g = diag(A, B, B, B), calculation is simplified.
// Returns array [Gamma^0, Gamma^1, Gamma^2, Gamma^3] where each is a 4x4 matrix
const getChristoffelDiagonal = (pos: Vec4, strength: number, isFlat: boolean): number[][][] => {
    if (isFlat) {
        // All zero for Minkowski
        const zero4x4 = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
        return [zero4x4, zero4x4, zero4x4, zero4x4];
    }

    // Metric derivatives
    // phi = -strength / r.
    // dphi/dr = strength / r^2.
    // dr/dx = x/r.
    // dphi/dx = (strength/r^2) * (x/r) = strength*x / r^3.
    const x = pos[1], y = pos[2], z = pos[3];
    const r2 = x*x + y*y + z*z;
    const r = Math.sqrt(r2);
    const r_eff = Math.max(r, 0.5);
    
    // Gradient of phi
    const dPhiFactor = strength / Math.pow(r_eff, 3);
    const dphi_dx = dPhiFactor * x;
    const dphi_dy = dPhiFactor * y;
    const dphi_dz = dPhiFactor * z;

    // Metric functions
    const phi = -strength / r_eff;
    const safePhi = Math.max(phi, -0.4);
    const A = -(1 + 2 * safePhi); // g_tt
    const B = 1 - 2 * safePhi;    // g_xx = g_yy = g_zz

    // Derivatives of metric components
    // dA/dx = -2 * dphi/dx
    // dB/dx = -2 * dphi/dx
    const dA = [-2 * dphi_dx, -2 * dphi_dy, -2 * dphi_dz]; 
    const dB = [-2 * dphi_dx, -2 * dphi_dy, -2 * dphi_dz];

    // Initialize 4x4x4 array
    const G = Array(4).fill(0).map(() => Array(4).fill(0).map(() => Array(4).fill(0)));

    // Analytic formulas for diagonal metric Gamma^L_MN
    // Gamma^L_MN = 0.5 * g^LL * (d_M g_NL + d_N g_ML - d_L g_MN) (no sum on L)
    
    const invA = 1/A;
    const invB = 1/B;
    const metricDiag = [A, B, B, B];
    const invMetricDiag = [invA, invB, invB, invB];
    const metricDerivs = [ 
       [0,0,0], // dt is zero (static)
       dA,      // dx
       dB       // dy (actually just dB reused per component direction)
    ]; 
    // Wait, metricDerivs structure: d_alpha g_beta_beta
    // d_0 (t) derivatives are 0.
    // d_1 (x) derivatives: dA[0] for g00, dB[0] for g11...
    
    const getDg = (componentIdx: number, derivativeIdx: number) => {
        if (derivativeIdx === 0) return 0; // Static
        const derivVec = componentIdx === 0 ? dA : dB;
        // derivativeIdx 1->x(0), 2->y(1), 3->z(2)
        return derivVec[derivativeIdx - 1]; 
    };

    for (let lam = 0; lam < 4; lam++) {
        for (let mu = 0; mu < 4; mu++) {
            for (let nu = 0; nu < 4; nu++) {
                const term1 = getDg(nu, mu); // d_mu g_nu_lambda ? No.
                // d_mu g_nu_lam
                // Since diagonal, g_nu_lam is 0 unless nu=lam.
                const d_mu_g_nu_lam = (nu === lam) ? getDg(nu, mu) : 0;
                const d_nu_g_mu_lam = (mu === lam) ? getDg(mu, nu) : 0;
                const d_lam_g_mu_nu = (mu === nu) ? getDg(mu, lam) : 0;
                
                G[lam][mu][nu] = 0.5 * invMetricDiag[lam] * (d_mu_g_nu_lam + d_nu_g_mu_lam - d_lam_g_mu_nu);
            }
        }
    }
    return G;
};

export const stepGeodesic = (
    pos: Vec4,
    vel: Vec4,
    strength: number,
    isFlat: boolean,
    dt: number
): { pos: Vec4, vel: Vec4 } => {
    // RK4 Integration
    // State Y = [pos, vel] (8 components)
    // dY/dt = [vel, -Gamma * vel * vel]
    
    const getDeriv = (p: Vec4, v: Vec4) => {
        const Gammas = getChristoffelDiagonal(p, strength, isFlat);
        const acc: Vec4 = [0,0,0,0];
        
        for (let lam = 0; lam < 4; lam++) {
            let sum = 0;
            for (let mu = 0; mu < 4; mu++) {
                for (let nu = 0; nu < 4; nu++) {
                    sum += Gammas[lam][mu][nu] * v[mu] * v[nu];
                }
            }
            acc[lam] = -sum;
        }
        return acc;
    };

    // k1
    const v1 = [...vel] as Vec4;
    const a1 = getDeriv(pos, vel);
    
    // k2
    const p2 = pos.map((val, i) => val + v1[i] * dt * 0.5) as Vec4;
    const v2_state = vel.map((val, i) => val + a1[i] * dt * 0.5) as Vec4;
    const a2 = getDeriv(p2, v2_state);

    // k3
    const p3 = pos.map((val, i) => val + v2_state[i] * dt * 0.5) as Vec4;
    const v3_state = vel.map((val, i) => val + a2[i] * dt * 0.5) as Vec4;
    const a3 = getDeriv(p3, v3_state);

    // k4
    const p4 = pos.map((val, i) => val + v3_state[i] * dt) as Vec4;
    const v4_state = vel.map((val, i) => val + a3[i] * dt) as Vec4;
    const a4 = getDeriv(p4, v4_state);

    // Combine
    const nextPos = pos.map((x, i) => x + (dt/6)*(v1[i] + 2*v2_state[i] + 2*v3_state[i] + v4_state[i])) as Vec4;
    const nextVel = vel.map((v, i) => v + (dt/6)*(a1[i] + 2*a2[i] + 2*a3[i] + a4[i])) as Vec4;

    return { pos: nextPos, vel: nextVel };
};