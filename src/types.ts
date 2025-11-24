
export type Vector3Tuple = [number, number, number];

// 3x3 Symmetric Tensor
export interface Tensor3 {
  // Components: xx, xy, xz, yx, yy, yz, zx, zy, zz
  // Row-major order
  components: [number, number, number, number, number, number, number, number, number];
  isSymmetric: boolean;
}

export interface EigenDecomposition {
  values: Vector3Tuple; // Sorted descending
  vectors: [Vector3Tuple, Vector3Tuple, Vector3Tuple]; // Corresponding vectors
}

export enum AppMode {
  SANDBOX = 'SANDBOX',
  MECHANICS = 'MECHANICS',
  RELATIVITY = 'RELATIVITY',
}

export type MechanicsExample = 'BEAM' | 'PLATE_HOLE';

export interface MetricTensor {
  // 4x4 metric components, flattened row-major
  // Convention: (t, x, y, z)
  components: number[]; 
  signature: string;
  determinant: number;
}

export interface LightConeConfig {
  slope: number;
  tippingVector?: Vector3Tuple;
}

export interface GeodesicState {
  position: Vector3Tuple; // (t, x, y) or (t, r, theta) depending on metric usage, usually x,y,z spatial for viz
  velocity: Vector3Tuple; // 4-velocity spatial components? Or full 4-vector? We'll track 4-vector (t,x,y,z)
  properTime: number;
}

export interface AppSnapshot {
  id: string;
  label: string;
  date: number;
  mode: AppMode;
  data: {
    tensorComponents?: number[];
    mechanicsExample?: MechanicsExample;
    beamLoad?: number;
    loadFactor?: number;
    metricType?: 'flat' | 'curved';
    gravityStrength?: number;
    showStressTrajectories?: boolean;
  }; 
}
