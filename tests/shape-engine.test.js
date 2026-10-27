import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  SHAPE_TYPES,
  validateShapeCompatibility,
  calculateLCornerParameters,
  calculateCurveParameters
} from '../src/core/shape-engine.js';

describe('Phase 07: Advanced Shapes Engine (L-shape, Curved & Hardware Validation)', () => {
  test('Validates curved screen compatibility against product hardware capabilities', () => {
    const flatProduct = {
      id: 'JLED-IND-250',
      displayName: 'FinePitch Pro P2.5',
      series: 'FinePitch Pro',
      availableShapes: [SHAPE_TYPES.FLAT]
    };

    const curveProduct = {
      id: 'JLED-RNT-390',
      displayName: 'Rental Carbon P3.9',
      series: 'Rental Carbon',
      availableShapes: [SHAPE_TYPES.FLAT, SHAPE_TYPES.CURVED_CONCAVE, SHAPE_TYPES.CURVED_CONVEX]
    };

    // Flat product attempting curved screen
    const check1 = validateShapeCompatibility(flatProduct, SHAPE_TYPES.CURVED_CONCAVE);
    assert.equal(check1.supported, false);
    assert.ok(check1.warning.includes('ไม่รองรับการดัดโค้ง'));

    // Curve capable rental product
    const check2 = validateShapeCompatibility(curveProduct, SHAPE_TYPES.CURVED_CONCAVE);
    assert.equal(check2.supported, true);
    assert.equal(check2.warning, null);

    // Standard flat shape is always supported
    const check3 = validateShapeCompatibility(flatProduct, SHAPE_TYPES.FLAT);
    assert.equal(check3.supported, true);
  });

  test('Computes L-Shape corner dimensions and face positions', () => {
    const lshape = calculateLCornerParameters({
      totalWidthM: 5.0,
      splitRatio: 0.6,
      heightM: 2.5,
      cornerType: SHAPE_TYPES.L_SHAPE_OUTER
    });

    assert.equal(lshape.w1, 3.0);
    assert.equal(lshape.w2, 2.0);
    assert.equal(lshape.isOuter, true);
    assert.equal(lshape.face1.widthM, 3.0);
    assert.equal(lshape.face2.widthM, 2.0);
    assert.equal(lshape.face2.rotationY, Math.PI / 2);
  });

  test('Computes curved arc radius and geometry metrics accurately', () => {
    const curve = calculateCurveParameters({
      widthM: 4.0,
      heightM: 2.5,
      arcDegrees: 60,
      isConcave: true
    });

    // 60 deg = PI/3 rad (~1.047)
    // Radius = 4 / (PI/3) = 12 / PI ~ 3.82m
    assert.ok(Math.abs(curve.radius - (4.0 / (Math.PI / 3))) < 1e-3);
    assert.ok(curve.chordLength < 4.0); // Chord is strictly shorter than arc length
    assert.ok(curve.sagitta > 0);
  });
});
