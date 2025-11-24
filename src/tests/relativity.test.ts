
import { describe, it, expect } from 'vitest';
import { createToyCurvedMetric, metricDeterminant, getLightConeConfig, stepGeodesic } from '../math/relativity';

describe('Relativity Math', () => {
    it('Toy metric has Lorentzian determinant', () => {
        const m = createToyCurvedMetric(5, 0, 0, 0.1);
        const det = metricDeterminant(m);
        expect(det).toBeLessThan(0); 
    });

    it('Light cones close up near gravity source', () => {
        const mFar = createToyCurvedMetric(100, 0, 0, 0.2);
        const mNear = createToyCurvedMetric(1, 0, 0, 0.2);
        const slopeFar = getLightConeConfig(mFar).slope;
        const slopeNear = getLightConeConfig(mNear).slope;
        expect(slopeNear).toBeGreaterThan(slopeFar);
    });

    it('Flat geodesic remains straight', () => {
        const startPos: [number, number, number, number] = [0, 0, 0, 0];
        const startVel: [number, number, number, number] = [1, 1, 0, 0];
        const next = stepGeodesic(startPos, startVel, 0, true, 1.0);
        // x should be x0 + v*t = 1
        expect(next.pos[1]).toBeCloseTo(1);
        // Velocity constant
        expect(next.vel[1]).toBeCloseTo(1);
    });
});