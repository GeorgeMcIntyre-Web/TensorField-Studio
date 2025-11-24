
import { describe, it, expect } from 'vitest';
import { calculateBeamStress } from '../math/mechanics';

describe('Mechanics Math', () => {
    it('Beam stress is higher at fixed end', () => {
        const P = 1000;
        const L = 10;
        const I = 1;
        const h = 1;
        const tFixed = calculateBeamStress(0, 0.5, P, L, I, h);
        const tFree = calculateBeamStress(L, 0.5, P, L, I, h);
        
        expect(Math.abs(tFixed.components[0])).toBeGreaterThan(Math.abs(tFree.components[0]));
        expect(tFree.components[0]).toBeCloseTo(0);
    });
});