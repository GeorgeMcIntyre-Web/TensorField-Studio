
import { describe, it, expect } from 'vitest';
import { 
  createTensorFromComponents, 
  tensorTrace, 
  tensorDeterminant, 
  vonMisesStress,
  eigenDecompositionSymmetric
} from '../math/tensors';

describe('Tensor Math', () => {
    it('calculates trace correctly', () => {
        const t = createTensorFromComponents([1,0,0, 0,2,0, 0,0,3]);
        expect(tensorTrace(t)).toBe(6);
    });

    it('calculates determinant correctly', () => {
        const t = createTensorFromComponents([2,0,0, 0,2,0, 0,0,2]);
        expect(tensorDeterminant(t)).toBe(8);
    });

    it('calculates Von Mises stress for uniaxial tension', () => {
        const t = createTensorFromComponents([100,0,0, 0,0,0, 0,0,0]);
        expect(vonMisesStress(t)).toBeCloseTo(100, 4);
    });

    it('calculates eigenvalues for diagonal matrix', () => {
        const t = createTensorFromComponents([3,0,0, 0,1,0, 0,0,2]);
        const eigen = eigenDecompositionSymmetric(t);
        expect(eigen.values[0]).toBeCloseTo(3);
        expect(eigen.values[1]).toBeCloseTo(2); 
        expect(eigen.values[2]).toBeCloseTo(1);
    });
});