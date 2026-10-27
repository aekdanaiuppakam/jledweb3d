import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCabinetCount,
  calculateScreenSpecs,
  getQualityBadge,
  getPixelSimulationMetrics,
  analyzeAspectRatio
} from '../src/core/calculation-engine.js';
import { defaultCatalog, PRODUCT_STATUS } from '../src/core/product-catalog.js';

describe('Phase 03: Calculation Engine - Cabinet Math, Layout Policies & Electrical Load', () => {
  const p25Product = defaultCatalog.getProductById('JLED-IND-250');
  const p6Product = defaultCatalog.getProductById('JLED-OUT-600');

  test('Unit Test 1: 500x500mm cabinet, P2.5, 200x200px, request 4000x2500mm => 8x5=40 cabinets, actual 4.00x2.50m, 1600x1000px', () => {
    const specs = calculateScreenSpecs({
      requestedWidthMm: 4000,
      requestedHeightMm: 2500,
      product: p25Product,
      layoutPolicy: 'nearest',
      viewingDistanceM: 5.0
    });

    assert.equal(specs.countX, 8);
    assert.equal(specs.countY, 5);
    assert.equal(specs.totalCabinets, 40);
    assert.equal(specs.actualWidthM, 4.00);
    assert.equal(specs.actualHeightM, 2.50);
    assert.equal(specs.actualAreaSqm, 10.00);
    assert.equal(specs.resolutionWidth, 1600);
    assert.equal(specs.resolutionHeight, 1000);
    assert.equal(specs.resolutionPx.total, 1600000);
    assert.equal(specs.gapMm.widthMm, 0);
    assert.equal(specs.gapMm.heightMm, 0);
  });

  test('Unit Test 2: 960x960mm cabinet, P6.0, 160x160px, request 4000x2500mm, nearest => 4x3=12 cabinets, actual 3.84x2.88m, 640x480px', () => {
    const specs = calculateScreenSpecs({
      requestedWidthMm: 4000,
      requestedHeightMm: 2500,
      product: p6Product,
      layoutPolicy: 'nearest',
      viewingDistanceM: 5.0
    });

    assert.equal(specs.countX, 4);
    assert.equal(specs.countY, 3);
    assert.equal(specs.totalCabinets, 12);
    assert.equal(specs.actualWidthMm, 3840);
    assert.equal(specs.actualHeightMm, 2880);
    assert.equal(specs.actualWidthM, 3.84);
    assert.equal(specs.actualHeightM, 2.88);
    assert.equal(specs.resolutionWidth, 640);
    assert.equal(specs.resolutionHeight, 480);
    assert.equal(specs.resolutionPx.total, 307200);
    assert.equal(specs.gapMm.widthMm, -160);
    assert.equal(specs.gapMm.heightMm, 380);
  });

  test('Unit Test 3: 3 Layout Suggestions (Smaller / Nearest / Larger) for 960x960mm cabinet at 4000x2500mm', () => {
    const specs = calculateScreenSpecs({
      requestedWidthMm: 4000,
      requestedHeightMm: 2500,
      product: p6Product,
      layoutPolicy: 'nearest'
    });

    const s = specs.suggestions;
    assert.ok(s.smaller && s.nearest && s.larger);

    // Smaller (Floor): 4x2 = 8 cabinets (3.84 x 1.92 m)
    assert.equal(s.smaller.countX, 4);
    assert.equal(s.smaller.countY, 2);
    assert.equal(s.smaller.totalCabinets, 8);
    assert.equal(s.smaller.actualWidthM, 3.84);
    assert.equal(s.smaller.actualHeightM, 1.92);

    // Nearest: 4x3 = 12 cabinets (3.84 x 2.88 m)
    assert.equal(s.nearest.countX, 4);
    assert.equal(s.nearest.countY, 3);
    assert.equal(s.nearest.totalCabinets, 12);
    assert.equal(s.nearest.actualWidthM, 3.84);
    assert.equal(s.nearest.actualHeightM, 2.88);

    // Larger (Ceil): 5x3 = 15 cabinets (4.80 x 2.88 m)
    assert.equal(s.larger.countX, 5);
    assert.equal(s.larger.countY, 3);
    assert.equal(s.larger.totalCabinets, 15);
    assert.equal(s.larger.actualWidthM, 4.80);
    assert.equal(s.larger.actualHeightM, 2.88);
  });

  test('Unit Test 4: Rejection of zero, negative, and nonfinite inputs', () => {
    assert.throws(() => calculateCabinetCount(0, 500), /Invalid requested dimension/);
    assert.throws(() => calculateCabinetCount(-1000, 500), /Invalid requested dimension/);
    assert.throws(() => calculateCabinetCount(NaN, 500), /Invalid requested dimension/);
    assert.throws(() => calculateCabinetCount(4000, 0), /Invalid cabinet size/);
    assert.throws(() => calculateCabinetCount(4000, -500), /Invalid cabinet size/);
    assert.throws(() => calculateCabinetCount(4000, Infinity), /Invalid cabinet size/);
  });

  test('Unit Test 5: Incomplete SKU handling - Power and Weight must be unavailable without fake numbers', () => {
    const incompleteProduct = {
      ...p25Product,
      id: 'MOCK-INCOMPLETE-P3',
      status: PRODUCT_STATUS.INCOMPLETE,
      avgPowerWPerCabinet: null,
      maxPowerWPerCabinet: null,
      weightKgPerCabinet: null
    };

    const specs = calculateScreenSpecs({
      requestedWidthMm: 4000,
      requestedHeightMm: 2500,
      product: incompleteProduct
    });

    assert.equal(specs.hasVerifiedPower, false);
    assert.equal(specs.hasVerifiedWeight, false);
    assert.equal(specs.powerAvgKw, null);
    assert.equal(specs.powerMaxKw, null);
    assert.equal(specs.totalWeightKg, null);
    assert.equal(specs.estimatedAmps220V, null);
    assert.ok(specs.warnings.some(w => w.includes('รอยืนยัน')));
  });

  test('Unit Test 6: Aspect Ratio Discrepancy Analysis (Never pretend non-standard is exact 16:9)', () => {
    // 4000x2500mm = 1.60:1 ratio. 16:9 is 1.778:1.
    const aspect = analyzeAspectRatio(4000, 2500, '16:9');
    assert.equal(aspect.numericRatio, 1.6);
    assert.equal(aspect.isExact, false);
    assert.equal(aspect.diffPercent, -10.0);
    assert.ok(aspect.discrepancyNote.includes('-10%'));

    // Exact 16:9 (e.g. 3840x2160)
    const exactAspect = analyzeAspectRatio(3840, 2160, '16:9');
    assert.equal(exactAspect.isExact, true);
    assert.ok(exactAspect.discrepancyNote.includes('ตรงตามมาตรฐาน 16:9'));
  });

  test('Unit Test 7: Orientation toggle support', () => {
    const rectangularProduct = defaultCatalog.getProductById('JLED-FP-125'); // 600 x 337.5 mm
    // Landscape orientation: 600mm W x 337.5mm H
    const landscapeSpecs = calculateScreenSpecs({
      requestedWidthMm: 2400,
      requestedHeightMm: 1350,
      product: rectangularProduct,
      orientation: 'landscape'
    });
    assert.equal(landscapeSpecs.countX, 4); // 2400 / 600 = 4
    assert.equal(landscapeSpecs.countY, 4); // 1350 / 337.5 = 4

    // Portrait orientation: 337.5mm W x 600mm H
    const portraitSpecs = calculateScreenSpecs({
      requestedWidthMm: 2400,
      requestedHeightMm: 1350,
      product: rectangularProduct,
      orientation: 'portrait'
    });
    assert.equal(portraitSpecs.countX, 7); // 2400 / 337.5 = 7.11 -> 7
    assert.equal(portraitSpecs.countY, 2); // 1350 / 600 = 2.25 -> 2
  });
});
