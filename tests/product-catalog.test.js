import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ProductCatalog, BASELINE_CATALOG, PRODUCT_STATUS } from '../src/core/product-catalog.js';

describe('Product Catalog & Validation Engine', () => {
  test('Loads baseline catalog with all 11 required pitches', () => {
    const catalog = new ProductCatalog(BASELINE_CATALOG);
    const pitches = [1.25, 1.5, 1.86, 2.0, 2.5, 3.076, 4.0, 5.0, 6.0, 8.0, 10.0];

    for (const p of pitches) {
      const match = catalog.findProductByPitch(p);
      assert.ok(match, `Must find product SKU for pitch ${p}`);
      assert.ok(match.cabinetWidthMm > 0);
      assert.ok(match.cabinetHeightMm > 0);
    }
  });

  test('Decouples Indoor and Outdoor from pitch rule (Outdoor P4 exists)', () => {
    const catalog = new ProductCatalog(BASELINE_CATALOG);
    const outdoorP4 = catalog.getProductById('JLED-OUT-400');
    assert.ok(outdoorP4, 'Outdoor P4 must exist in catalog');
    assert.equal(outdoorP4.actualPixelPitchMm, 4.0);
    assert.equal(outdoorP4.environment, 'outdoor');
    assert.equal(outdoorP4.cabinetWidthMm, 960);
    assert.equal(outdoorP4.ipRatingFront, 'IP65');

    const indoorP4 = catalog.getProductById('JLED-IND-400');
    assert.ok(indoorP4, 'Indoor P4 must exist in catalog');
    assert.equal(indoorP4.actualPixelPitchMm, 4.0);
    assert.equal(indoorP4.environment, 'indoor');
    assert.equal(indoorP4.cabinetWidthMm, 500);
  });

  test('Rejects invalid product registration with missing ID', () => {
    const catalog = new ProductCatalog();
    assert.throws(() => catalog.registerProduct({ displayName: 'No ID' }), /missing ID/);
  });

  test('Verified status flag is distinct from demo products', () => {
    const catalog = new ProductCatalog(BASELINE_CATALOG);
    const p25 = catalog.getProductById('JLED-IND-250');
    assert.equal(p25.status, PRODUCT_STATUS.VERIFIED);

    const p125 = catalog.getProductById('JLED-FP-125');
    assert.equal(p125.status, PRODUCT_STATUS.DEMO);
  });
});
