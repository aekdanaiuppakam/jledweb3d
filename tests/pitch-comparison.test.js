import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { comparePixelPitches } from '../src/core/pitch-comparison.js';

describe('Phase 06: Pixel Pitch Comparison Lab Engine', () => {
  test('Compares 3 pitches accurately on 4x2.5m screen', () => {
    const res = comparePixelPitches({
      requestedWidthMm: 4000,
      requestedHeightMm: 2500,
      pitchList: [1.86, 2.5, 4.0],
      viewingDistanceM: 4.0
    });

    assert.equal(res.length, 3);

    const [p18, p25, p40] = res;
    // Pixel density (dots/m²) must decrease as pitch increases
    assert.ok(p18.pixelsPerSqm > p25.pixelsPerSqm);
    assert.ok(p25.pixelsPerSqm > p40.pixelsPerSqm);

    // Recommended optimal distance increases with larger pitch
    assert.ok(p18.optimalDistanceM < p25.optimalDistanceM);
    assert.ok(p25.optimalDistanceM < p40.optimalDistanceM);

    // Total pixels decreases with larger pitch
    assert.ok(p18.totalPixels > p25.totalPixels);
    assert.ok(p25.totalPixels > p40.totalPixels);

    // Optimal status at 4.0m
    // For P1.86 (opt ~2.2m) => optimal (true)
    // For P2.5 (opt 3.0m) => optimal (true)
    // For P4.0 (opt 4.8m) => too close (false)
    assert.equal(p18.isOptimalAtDistance, true);
    assert.equal(p25.isOptimalAtDistance, true);
    assert.equal(p40.isOptimalAtDistance, false);
  });
});
