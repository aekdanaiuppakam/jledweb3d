import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeHomography,
  projectPoint,
  getDefaultCornerPins
} from '../src/core/perspective-engine.js';

describe('Phase 05: Real-Site Photo Perspective Engine', () => {
  test('Solves identity homography for identical quads', () => {
    const square = [[0, 0], [100, 0], [100, 100], [0, 100]];
    const H = computeHomography(square, square);

    // Project corners through H
    const p0 = projectPoint(H, [0, 0]);
    const p1 = projectPoint(H, [100, 0]);
    const p2 = projectPoint(H, [100, 100]);
    const p3 = projectPoint(H, [0, 100]);

    assert.ok(Math.abs(p0[0] - 0) < 1e-3 && Math.abs(p0[1] - 0) < 1e-3);
    assert.ok(Math.abs(p1[0] - 100) < 1e-3 && Math.abs(p1[1] - 0) < 1e-3);
    assert.ok(Math.abs(p2[0] - 100) < 1e-3 && Math.abs(p2[1] - 100) < 1e-3);
    assert.ok(Math.abs(p3[0] - 0) < 1e-3 && Math.abs(p3[1] - 100) < 1e-3);
  });

  test('Computes perspective warp for trapezoid (keystone/wall perspective)', () => {
    const src = [[0, 0], [100, 0], [100, 100], [0, 100]];
    // Wall tilted backwards: top narrower than bottom
    const dst = [[20, 10], [80, 10], [90, 90], [10, 90]];
    const H = computeHomography(src, dst);

    const projectedTL = projectPoint(H, [0, 0]);
    const projectedBR = projectPoint(H, [100, 100]);

    assert.ok(Math.abs(projectedTL[0] - 20) < 1e-2);
    assert.ok(Math.abs(projectedTL[1] - 10) < 1e-2);
    assert.ok(Math.abs(projectedBR[0] - 90) < 1e-2);
    assert.ok(Math.abs(projectedBR[1] - 90) < 1e-2);
  });

  test('Generates inset default pins within canvas bounds', () => {
    const pins = getDefaultCornerPins(800, 600, 0.2);
    assert.equal(pins.length, 4);
    assert.deepEqual(pins[0], [160, 120]); // TL
    assert.deepEqual(pins[1], [640, 120]); // TR
    assert.deepEqual(pins[2], [640, 480]); // BR
    assert.deepEqual(pins[3], [160, 480]); // BL
  });

  test('Validates input points count', () => {
    assert.throws(() => {
      computeHomography([[0, 0]], [[1, 1]]);
    }, /must contain exactly 4 points/);
  });
});
