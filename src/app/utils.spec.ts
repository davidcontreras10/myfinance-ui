import { Utils } from './utils';

describe('Utils.roundToCents', () => {
  it('rounds 10 + 5.53 to exactly 15.53 despite the floating point addition error', () => {
    const sum = 10 + 5.53; // 15.530000000000001 in JS, !== 15.53 by strict equality
    expect(sum === 15.53).toBe(false); // sanity check that the bug this guards against is real
    expect(Utils.roundToCents(sum)).toBe(15.53);
  });

  it('is a no-op for values already at cent precision', () => {
    expect(Utils.roundToCents(15.53)).toBe(15.53);
    expect(Utils.roundToCents(100)).toBe(100);
  });

  it('rounds 1.005 up to 1.01 (a value that naive Math.round rounds down to 1 due to float representation)', () => {
    expect(Utils.roundToCents(1.005)).toBe(1.01);
  });
});
