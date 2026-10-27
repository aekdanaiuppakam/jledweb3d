/**
 * JLED DESIGN STUDIO v4.0 — Pixel Pitch Comparison Lab Engine
 * Pure calculations for comparing multiple LED pixel pitches side-by-side
 * on identical physical screen dimensions.
 */

import { calculateScreenSpecs } from './calculation-engine.js';
import { defaultCatalog } from './product-catalog.js';

/**
 * Generates a comparison matrix for 2 or 3 pixel pitches.
 * @param {Object} params
 * @param {number} params.requestedWidthMm Physical width in mm
 * @param {number} params.requestedHeightMm Physical height in mm
 * @param {Array<string|number>} params.pitchList List of pitch values (e.g. [1.86, 2.5, 4.0]) or product IDs
 * @param {number} [params.viewingDistanceM=5.0]
 * @returns {Array<Object>} Comparison data per pitch
 */
export function comparePixelPitches({
  requestedWidthMm = 4000,
  requestedHeightMm = 2500,
  pitchList = [1.86, 2.5, 4.0],
  viewingDistanceM = 5.0
}) {
  const catalog = defaultCatalog;

  return pitchList.map((pitchOrId) => {
    let product = null;
    let pitchMm = typeof pitchOrId === 'number' ? pitchOrId : parseFloat(pitchOrId);

    if (typeof pitchOrId === 'string' && isNaN(pitchMm)) {
      product = catalog.getProductById(pitchOrId);
      if (product) pitchMm = product.actualPixelPitchMm;
    }

    if (!product) {
      product = catalog.findProductByPitch(pitchMm);
    }

    const specs = calculateScreenSpecs({
      requestedWidthMm,
      requestedHeightMm,
      product,
      viewingDistanceM
    });

    // Pixels per square meter: 1,000,000 / (pitchMm * pitchMm)
    const pixelsPerSqm = Math.round(1000000 / (pitchMm * pitchMm));

    return {
      pitchMm,
      productId: product ? product.id : `P${pitchMm}`,
      productName: product ? product.displayName : `JLED Standard P${pitchMm}`,
      actualWidthM: specs.actualWidthM,
      actualHeightM: specs.actualHeightM,
      actualAreaSqm: specs.actualAreaSqm,
      totalCabinets: specs.totalCabinets,
      resolutionWidth: specs.resolutionWidth,
      resolutionHeight: specs.resolutionHeight,
      totalPixels: specs.totalPixels,
      totalPixelsM: specs.totalPixelsM,
      pixelsPerSqm,
      qualityTier: specs.qualityBadge.label,
      optimalDistanceM: specs.distanceMetrics.optimalDistanceM,
      isOptimalAtDistance: specs.distanceMetrics.isOptimal,
      powerAvgKw: specs.powerAvgKw,
      powerMaxKw: specs.powerMaxKw,
      estimatedAmps220V: specs.estimatedAmps220V,
      totalWeightKg: specs.totalWeightKg
    };
  });
}
