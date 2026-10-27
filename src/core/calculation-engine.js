/**
 * JLED DESIGN STUDIO v4.0 — Pure Calculation Engine
 * Completely decoupled from DOM and Three.js.
 * Handles cabinet layout, buildable dimensions, resolution, electrical load, weight,
 * viewing distance metrics, and strict resolution quality classification.
 */

import { UNITS } from './constants.js';
import { PRODUCT_STATUS } from './product-catalog.js';

/**
 * Calculates discrete cabinet count given a requested dimension and physical cabinet size.
 * @param {number} requestedMm 
 * @param {number} cabinetSizeMm 
 * @param {'nearest'|'floor'|'ceil'} policy 
 * @returns {number} Integer cabinet count (minimum 1)
 */
export function calculateCabinetCount(requestedMm, cabinetSizeMm, policy = 'nearest') {
  if (!Number.isFinite(requestedMm) || requestedMm <= 0) {
    throw new Error(`Invalid requested dimension: ${requestedMm}`);
  }
  if (!Number.isFinite(cabinetSizeMm) || cabinetSizeMm <= 0) {
    throw new Error(`Invalid cabinet size: ${cabinetSizeMm}`);
  }

  const raw = requestedMm / cabinetSizeMm;
  let count;
  if (policy === 'floor') {
    count = Math.floor(raw);
  } else if (policy === 'ceil') {
    count = Math.ceil(raw);
  } else {
    count = Math.round(raw);
  }
  return Math.max(1, count);
}

/**
 * Classifies resolution into standard industry quality tiers.
 * Both axes must meet the threshold (or rotated for vertical orientation).
 * 1600x1000 is correctly classified as HD READY, not Full HD.
 */
export function getQualityBadge(resW, resH) {
  const maxAxis = Math.max(resW, resH);
  const minAxis = Math.min(resW, resH);

  if (maxAxis >= 3840 && minAxis >= 2160) {
    return { label: '4K ULTRA HD', colorClass: 'from-[#FF6B00] to-[#FFB800]' };
  }
  if (maxAxis >= 2560 && minAxis >= 1440) {
    return { label: '2K QHD', colorClass: 'from-[#00E5FF] to-[#0077FF]' };
  }
  if (maxAxis >= 1920 && minAxis >= 1080) {
    return { label: 'FULL HD 1080p', colorClass: 'from-emerald-400 to-cyan-500' };
  }
  if (maxAxis >= 1280 && minAxis >= 720) {
    return { label: 'HD READY 720p', colorClass: 'from-sky-400 to-blue-500' };
  }
  return { label: 'STANDARD SD', colorClass: 'from-slate-400 to-slate-500' };
}

/**
 * Evaluates simulated viewing distance metrics.
 * @param {number} pitchMm Actual pixel pitch in mm
 * @param {number} viewingDistanceM Viewer distance in meters
 */
export function getPixelSimulationMetrics(pitchMm, viewingDistanceM) {
  if (!Number.isFinite(pitchMm) || pitchMm <= 0) {
    throw new Error(`Invalid pitch: ${pitchMm}`);
  }
  if (!Number.isFinite(viewingDistanceM) || viewingDistanceM <= 0) {
    throw new Error(`Invalid viewing distance: ${viewingDistanceM}`);
  }

  // Engineering rule of thumb: Optimal distance ~ pitch (mm) * 1.2 meters
  const optimalDistM = +(pitchMm * 1.2).toFixed(2);
  const ratio = viewingDistanceM / optimalDistM;

  let severity = 0;
  if (ratio < 1.0) {
    severity = Math.min(1.0, (1.0 - ratio) * 1.35 + (pitchMm / 18));
  } else {
    severity = Math.max(0, (pitchMm / 22) * (1 / Math.pow(ratio, 1.4)));
  }

  return {
    optimalDistanceM: optimalDistM,
    ratio: +ratio.toFixed(2),
    isOptimal: viewingDistanceM >= optimalDistM,
    severity: +severity.toFixed(3)
  };
}

/**
 * Performs full screen configuration calculations.
 * @param {Object} params
 * @param {number} params.requestedWidthMm Customer requested width in mm
 * @param {number} params.requestedHeightMm Customer requested height in mm
 * @param {Object} params.product Product profile object from ProductCatalog
 * @param {'nearest'|'floor'|'ceil'} [params.layoutPolicy='nearest']
 * @param {number} [params.viewingDistanceM=5.0]
 */
export function calculateScreenSpecs(params) {
  const {
    requestedWidthMm,
    requestedHeightMm,
    product,
    layoutPolicy = 'nearest',
    viewingDistanceM = 5.0
  } = params;

  if (!product) {
    throw new Error('Product profile is required for spec calculation');
  }

  const cabW = product.cabinetWidthMm;
  const cabH = product.cabinetHeightMm;
  const pitchMm = product.actualPixelPitchMm;

  // Calculate discrete cabinet layout
  const cols = calculateCabinetCount(requestedWidthMm, cabW, layoutPolicy);
  const rows = calculateCabinetCount(requestedHeightMm, cabH, layoutPolicy);
  const totalCabinets = cols * rows;

  // Actual physical buildable dimensions
  const actualWidthMm = cols * cabW;
  const actualHeightMm = rows * cabH;
  const actualWidthM = actualWidthMm / UNITS.MM_PER_METER;
  const actualHeightM = actualHeightMm / UNITS.MM_PER_METER;
  const actualAreaSqm = +(actualWidthM * actualHeightM).toFixed(3);

  const diffWidthMm = actualWidthMm - requestedWidthMm;
  const diffHeightMm = actualHeightMm - requestedHeightMm;

  // Resolution calculations
  const resW = cols * product.cabinetPixelWidth;
  const resH = rows * product.cabinetPixelHeight;
  const totalPixels = resW * resH;
  const totalPixelsM = +(totalPixels / 1000000).toFixed(2);

  // Aspect ratio calculation
  const actualAspectRatio = +(actualWidthMm / actualHeightMm).toFixed(2);
  let aspectLabel = `${actualAspectRatio} : 1 Custom`;
  if (Math.abs(actualAspectRatio - 16 / 9) < 0.08) aspectLabel = '16:9 Widescreen';
  else if (Math.abs(actualAspectRatio - 21 / 9) < 0.12) aspectLabel = '21:9 Ultra Banner';
  else if (Math.abs(actualAspectRatio - 9 / 16) < 0.08) aspectLabel = '9:16 Vertical Poster';

  // Distance metrics
  const distanceMetrics = getPixelSimulationMetrics(pitchMm, viewingDistanceM);
  const qualityBadge = getQualityBadge(resW, resH);

  // Electrical and Weight calculations
  // If product data is not verified or fields are null, flag as unavailable
  const hasVerifiedPower = product.avgPowerWPerCabinet != null && product.maxPowerWPerCabinet != null;
  const hasVerifiedWeight = product.weightKgPerCabinet != null;

  const powerAvgKw = hasVerifiedPower ? +((totalCabinets * product.avgPowerWPerCabinet) / 1000).toFixed(2) : null;
  const powerMaxKw = hasVerifiedPower ? +((totalCabinets * product.maxPowerWPerCabinet) / 1000).toFixed(2) : null;
  const totalWeightKg = hasVerifiedWeight ? +(totalCabinets * product.weightKgPerCabinet).toFixed(1) : null;

  // 3 Layout suggestions: nearest, floor, ceil
  const floorCols = calculateCabinetCount(requestedWidthMm, cabW, 'floor');
  const floorRows = calculateCabinetCount(requestedHeightMm, cabH, 'floor');
  const ceilCols = calculateCabinetCount(requestedWidthMm, cabW, 'ceil');
  const ceilRows = calculateCabinetCount(requestedHeightMm, cabH, 'ceil');

  const suggestions = {
    smaller: {
      cols: floorCols,
      rows: floorRows,
      totalCabinets: floorCols * floorRows,
      actualWidthM: (floorCols * cabW) / UNITS.MM_PER_METER,
      actualHeightM: (floorRows * cabH) / UNITS.MM_PER_METER
    },
    nearest: {
      cols,
      rows,
      totalCabinets,
      actualWidthM,
      actualHeightM
    },
    larger: {
      cols: ceilCols,
      rows: ceilRows,
      totalCabinets: ceilCols * ceilRows,
      actualWidthM: (ceilCols * cabW) / UNITS.MM_PER_METER,
      actualHeightM: (ceilRows * cabH) / UNITS.MM_PER_METER
    }
  };

  return {
    requestedWidthMm,
    requestedHeightMm,
    requestedWidthM: +(requestedWidthMm / UNITS.MM_PER_METER).toFixed(2),
    requestedHeightM: +(requestedHeightMm / UNITS.MM_PER_METER).toFixed(2),
    actualWidthMm,
    actualHeightMm,
    actualWidthM: +actualWidthM.toFixed(2),
    actualHeightM: +actualHeightM.toFixed(2),
    diffWidthMm,
    diffHeightMm,
    cols,
    rows,
    totalCabinets,
    actualAreaSqm,
    resolutionWidth: resW,
    resolutionHeight: resH,
    totalPixels,
    totalPixelsM,
    actualAspectRatio,
    aspectLabel,
    distanceMetrics,
    qualityBadge,
    powerAvgKw,
    powerMaxKw,
    totalWeightKg,
    hasVerifiedPower,
    hasVerifiedWeight,
    productStatus: product.status,
    suggestions,
    isOutdoor: product.environment === 'outdoor'
  };
}
