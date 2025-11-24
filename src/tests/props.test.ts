
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { createTensorFromComponents, tensorTrace } from '../math/tensors';

describe('Property Tests', () => {
  it('Trace is sum of diagonal elements', () => {
    fc.assert(
      fc.property(fc.array(fc.float(), { minLength: 9, maxLength: 9 }), (data) => {
        const t = createTensorFromComponents(data);
        const diagSum = t.components[0] + t.components[4] + t.components[8];
        return Math.abs(tensorTrace(t) - diagSum) < 1e-6;
      })
    );
  });
});