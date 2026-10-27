import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ProductCatalog,
  BASELINE_CATALOG,
  PRODUCT_STATUS,
  PRODUCT_ENVIRONMENT,
  validateSku,
  checkCompatibility
} from '../src/core/product-catalog.js';

describe('Phase 02: Product Catalog & Validation Engine', () => {
  test('Loads baseline catalog with Indoor, Outdoor, and Rental products', () => {
    const catalog = new ProductCatalog(BASELINE_CATALOG);
    const all = catalog.getAllProducts();
    assert.ok(all.length >= 12, 'Catalog should have at least 12 products');

    const indoor = catalog.getAllProducts('indoor');
    const outdoor = catalog.getAllProducts('outdoor');
    const rental = catalog.getAllProducts('rental');

    assert.ok(indoor.length > 0, 'Must have indoor products');
    assert.ok(outdoor.length > 0, 'Must have outdoor products');
    assert.ok(rental.length > 0, 'Must have rental products');
  });

  test('Decouples Indoor and Outdoor from pitch rule (Outdoor P4 vs Indoor P4)', () => {
    const catalog = new ProductCatalog(BASELINE_CATALOG);
    const outdoorP4 = catalog.getProductById('JLED-OUT-400');
    assert.ok(outdoorP4);
    assert.equal(outdoorP4.actualPixelPitchMm, 4.0);
    assert.equal(outdoorP4.environment, PRODUCT_ENVIRONMENT.OUTDOOR);
    assert.equal(outdoorP4.cabinetWidthMm, 960);
    assert.equal(outdoorP4.ipRatingFront, 'IP65');

    const indoorP4 = catalog.getProductById('JLED-IND-400');
    assert.ok(indoorP4);
    assert.equal(indoorP4.actualPixelPitchMm, 4.0);
    assert.equal(indoorP4.environment, PRODUCT_ENVIRONMENT.INDOOR);
    assert.equal(indoorP4.cabinetWidthMm, 500);
  });

  test('Validates integer pixel width and height requirements', () => {
    const validSku = {
      id: 'TEST-SKU-1',
      displayName: 'Test Valid SKU',
      environment: PRODUCT_ENVIRONMENT.INDOOR,
      actualPixelPitchMm: 2.5,
      cabinetWidthMm: 500,
      cabinetHeightMm: 500,
      cabinetPixelWidth: 200, // Valid integer
      cabinetPixelHeight: 200, // Valid integer
      status: PRODUCT_STATUS.DEMO
    };
    const validRes = validateSku(validSku);
    assert.equal(validRes.valid, true);

    const nonIntSku = {
      ...validSku,
      id: 'TEST-SKU-NONINT',
      cabinetPixelWidth: 200.5 // Non-integer!
    };
    const invalidRes = validateSku(nonIntSku);
    assert.equal(invalidRes.valid, false);
    assert.ok(invalidRes.errors.some(e => e.includes('positive integer')));
  });

  test('Detects physical size / pitch discrepancy conflict warnings', () => {
    const conflictingSku = {
      id: 'TEST-SKU-CONFLICT',
      displayName: 'Test Conflicting SKU',
      environment: PRODUCT_ENVIRONMENT.INDOOR,
      actualPixelPitchMm: 2.5,
      cabinetWidthMm: 500,
      cabinetHeightMm: 500,
      cabinetPixelWidth: 100, // 100 * 2.5 = 250mm, but cabinet is 500mm (50% discrepancy!)
      cabinetPixelHeight: 100,
      status: PRODUCT_STATUS.DEMO
    };
    const res = validateSku(conflictingSku);
    assert.equal(res.valid, true); // Still valid object, but has warnings
    assert.ok(res.warnings.some(w => w.includes('ต่างจากการคำนวณพิกเซล*pitch')));
  });

  test('Compatibility Engine checks environment and mount constraints', () => {
    const indoorProduct = BASELINE_CATALOG.find(p => p.id === 'JLED-IND-250');
    const outdoorProduct = BASELINE_CATALOG.find(p => p.id === 'JLED-OUT-500');

    // Indoor product in outdoor scene
    const res1 = checkCompatibility(indoorProduct, { sceneType: 'outdoor', mountType: 'wall' });
    assert.equal(res1.compatible, false);
    assert.ok(res1.errors.some(e => e.includes('Indoor')));

    // Outdoor product in boardroom scene
    const res2 = checkCompatibility(outdoorProduct, { sceneType: 'boardroom', mountType: 'wall' });
    assert.ok(res2.warnings.some(w => w.includes('ความสว่างสูงมาก')));

    // Hanging rig on heavy 960mm outdoor cabinet
    const res3 = checkCompatibility(outdoorProduct, { sceneType: 'outdoor', mountType: 'hanging' });
    assert.equal(res3.compatible, false);
    assert.ok(res3.errors.some(e => e.includes('ไม่แนะนำให้แขวนสลิง')));
  });

  test('JSON Catalog Export & Import round-trip with schema validation', () => {
    const catalog = new ProductCatalog(BASELINE_CATALOG);
    const exportedJson = catalog.exportCatalogJson();
    assert.ok(typeof exportedJson === 'string');

    // Test successful import of exported JSON
    const importCatalog = new ProductCatalog([]);
    const importRes = importCatalog.importCatalogJson(exportedJson);
    assert.equal(importRes.success, true);
    assert.equal(importRes.importedCount, catalog.getAllProducts().length);

    // Test rejection of malformed JSON
    const badJsonRes = importCatalog.importCatalogJson('{ broken json');
    assert.equal(badJsonRes.success, false);
    assert.ok(badJsonRes.errors[0].includes('JSON Parse Error'));

    // Test rejection of invalid schema items
    const invalidSchemaJson = JSON.stringify([
      { id: 'BAD-SKU', displayName: 'Missing essential fields' }
    ]);
    const invalidSchemaRes = importCatalog.importCatalogJson(invalidSchemaJson);
    assert.equal(invalidSchemaRes.success, false);
    assert.ok(invalidSchemaRes.errors.length > 0);
  });
});
