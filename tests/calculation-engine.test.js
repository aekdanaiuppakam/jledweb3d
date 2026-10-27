import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCabinetCount,
  calculateScreenSpecs,
  getQualityBadge,
  getPixelSimulationMetrics
} from '../src/core/calculation-engine.js';
import { defaultCatalog, PRODUCT_STATUS } from '../src/core/product-catalog.js';

describe('Calculation Engine - Cabinet Math & Resolutions', () => {
  const p25Product = defaultCatalog.getProductById('JLED-IND-250');
  const p6Product = defaultCatalog.getProductById('JLED-OUT-600');

  test('Case 1: 500x500mm cabinet, P2.5, 200x200px, request 4000x2500mm => 8x5=40 cabinets, 4.00x2.50m, 1600x1000px', () => {
    const specs = calculateScreenSpecs({
      requestedWidthMm: 4000,
      requestedHeightMm: 2500,
      product: p25Product,
      layoutPolicy: 'nearest',
      viewingDistanceM: 5.0
    });

    assert.equal(specs.cols, 8);
    assert.equal(specs.rows, 5);
    assert.equal(specs.totalCabinets, 40);
    assert.equal(specs.actualWidthM, 4.00);
    assert.equal(specs.actualHeightM, 2.50);
    assert.equal(specs.actualAreaSqm, 10.00);
    assert.equal(specs.resolutionWidth, 1600);
    assert.equal(specs.resolutionHeight, 1000);
    assert.equal(specs.totalPixels, 1600000);
    assert.equal(specs.diffWidthMm, 0);
    assert.equal(specs.diffHeightMm, 0);
  });

  test('Case 2: 960x960mm cabinet, P6.0, 160x160px, request 4000x2500mm, nearest => 4x3=12 cabinets, 3.84x2.88m, 640x480px', () => {
    const specs = calculateScreenSpecs({
      requestedWidthMm: 4000,
      requestedHeightMm: 2500,
      product: p6Product,
      layoutPolicy: 'nearest',
      viewingDistanceM: 5.0
    });

    assert.equal(specs.cols, 4);
    assert.equal(specs.rows, 3);
    assert.equal(specs.totalCabinets, 12);
    assert.equal(specs.actualWidthMm, 3840);
    assert.equal(specs.actualHeightMm, 2880);
    assert.equal(specs.actualWidthM, 3.84);
    assert.equal(specs.actualHeightM, 2.88);
    assert.equal(specs.resolutionWidth, 640);
    assert.equal(specs.resolutionHeight, 480);
    assert.equal(specs.totalPixels, 307200);
    // Differences from requested
    assert.equal(specs.diffWidthMm, -160);
    assert.equal(specs.diffHeightMm, 380);
  });

  test('Case 3: Rejection of zero, negative, and nonfinite inputs', () => {
    assert.throws(() => calculateCabinetCount(0, 500), /Invalid requested dimension/);
    assert.throws(() => calculateCabinetCount(-1000, 500), /Invalid requested dimension/);
    assert.throws(() => calculateCabinetCount(NaN, 500), /Invalid requested dimension/);
    assert.throws(() => calculateCabinetCount(4000, 0), /Invalid cabinet size/);
    assert.throws(() => calculateCabinetCount(4000, -500), /Invalid cabinet size/);
    assert.throws(() => getPixelSimulationMetrics(0, 5.0), /Invalid pitch/);
    assert.throws(() => getPixelSimulationMetrics(2.5, -1.0), /Invalid viewing distance/);
  });

  test('Case 4: Quality tier classification - 1600x1000 must NOT be called Full HD', () => {
    const badge1600x1000 = getQualityBadge(1600, 1000);
    assert.notEqual(badge1600x1000.label, 'FULL HD 1080p');
    assert.equal(badge1600x1000.label, 'HD READY 720p');

    const badge1920x1080 = getQualityBadge(1920, 1080);
    assert.equal(badge1920x1080.label, 'FULL HD 1080p');

    const badgeVerticalFHD = getQualityBadge(1080, 1920);
    assert.equal(badgeVerticalFHD.label, 'FULL HD 1080p');

    const badge4K = getQualityBadge(3840, 2160);
    assert.equal(badge4K.label, '4K ULTRA HD');
  });

  test('Case 5: Electrical power and weight calculation with unverified handling', () => {
    // Verified product (JLED-IND-250: 48W avg, 145W max per cabinet, 7.0kg)
    const specs = calculateScreenSpecs({
      requestedWidthMm: 4000,
      requestedHeightMm: 2500,
      product: p25Product,
      viewingDistanceM: 5.0
    });
    // 40 cabinets * 48W = 1920W = 1.92 kW
    assert.equal(specs.powerAvgKw, 1.92);
    // 40 cabinets * 145W = 5800W = 5.80 kW
    assert.equal(specs.powerMaxKw, 5.80);
    // 40 cabinets * 7.0kg = 280.0 kg
    assert.equal(specs.totalWeightKg, 280.0);

    // Incomplete mock product without verified power
    const incompleteProduct = {
      ...p25Product,
      id: 'MOCK-INCOMPLETE',
      status: PRODUCT_STATUS.INCOMPLETE,
      avgPowerWPerCabinet: null,
      maxPowerWPerCabinet: null,
      weightKgPerCabinet: null
    };
    const incompleteSpecs = calculateScreenSpecs({
      requestedWidthMm: 4000,
      requestedHeightMm: 2500,
      product: incompleteProduct
    });
    assert.equal(incompleteSpecs.hasVerifiedPower, false);
    assert.equal(incompleteSpecs.hasVerifiedWeight, false);
    assert.equal(incompleteSpecs.powerAvgKw, null);
    assert.equal(incompleteSpecs.powerMaxKw, null);
    assert.equal(incompleteSpecs.totalWeightKg, null);
  });
});
