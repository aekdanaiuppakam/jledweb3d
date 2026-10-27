import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateDimensionCoordinates } from '../src/core/measurements.js';

describe('Phase 04: 3D Measurement & Spatial Math Engine', () => {
  test('Calculates width, height, elevation and distance dimensions accurately', () => {
    const res = calculateDimensionCoordinates({
      actualWidthM: 4.00,
      actualHeightM: 2.50,
      elevationM: 1.20,
      viewingDistanceM: 5.0
    });

    assert.equal(res.screenCenterY, 1.20 + 2.50 / 2); // 2.45m
    assert.equal(res.widthDimension.text, 'กว้าง 4.00 ม.');
    assert.equal(res.widthDimension.start[0], -2.0);
    assert.equal(res.widthDimension.end[0], 2.0);

    assert.equal(res.heightDimension.text, 'สูง 2.50 ม.');
    assert.equal(res.heightDimension.start[1], 1.20);
    assert.equal(res.heightDimension.end[1], 3.70);

    assert.equal(res.elevationDimension.text, 'ยกสูง 1.20 ม.');
    assert.equal(res.elevationDimension.start[1], 0);
    assert.equal(res.elevationDimension.end[1], 1.20);

    assert.equal(res.distanceDimension.text, 'ระยะรับชม 5.0 ม.');
    assert.equal(res.distanceDimension.end[2], 5.0);
  });

  test('Clamps negative or missing values to robust positive defaults', () => {
    const res = calculateDimensionCoordinates({
      actualWidthM: -4.00,
      actualHeightM: 0,
      elevationM: -2.0,
      viewingDistanceM: -1
    });

    assert.ok(res.screenCenterY > 0);
    assert.equal(res.elevationDimension.text, 'ยกสูง 0.00 ม.');
    assert.ok(res.widthDimension.end[0] > 0);
    assert.ok(res.distanceDimension.end[2] >= 0.5);
  });
});
