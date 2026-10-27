/**
 * JLED DESIGN STUDIO v4.0 — Real Cabinet Layout, Resolution, Power & Weight Engine (Phase 03)
 * Pure, testable engineering domain calculation engine.
 * Computes buildable dimensions strictly from discrete physical cabinets (no fractional cutting).
 * Provides 3 layout suggestions (Smaller, Nearest, Larger), exact aspect ratio deviation metrics,
 * verified electrical & structural load estimations, and strict resolution quality tiers.
 */

import { UNITS } from './constants.js';
import { PRODUCT_STATUS } from './product-catalog.js';

/**
 * Calculates discrete cabinet count given a requested dimension and physical cabinet size.
 * @param {number} requestedMm Positive dimension in mm
 * @param {number} cabinetSizeMm Physical cabinet size in mm
 * @param {'nearest'|'floor'|'ceil'} policy Rounding strategy
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
 * Note: 1600x1000 is correctly classified as HD READY, not Full HD.
 * @param {number} resW Resolution width in pixels
 * @param {number} resH Resolution height in pixels
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
 * Evaluates simulated viewing distance metrics based on pixel pitch.
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

  // Engineering guideline: Optimal viewing distance ~ pitch (mm) * 1.2 meters
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
 * Computes exact aspect ratio analysis and deviation from target ratio.
 * @param {number} actualWidthMm 
 * @param {number} actualHeightMm 
 * @param {string} [targetRatioKey='16:9'] Optional target preset key
 */
export function analyzeAspectRatio(actualWidthMm, actualHeightMm, targetRatioKey = null) {
  const numericRatio = actualWidthMm / actualHeightMm;
  const standardRatios = [
    { key: '16:9', value: 16 / 9, label: '16:9 Widescreen' },
    { key: '21:9', value: 21 / 9, label: '21:9 Ultra-Wide Banner' },
    { key: '9:16', value: 9 / 16, label: '9:16 Vertical Poster' },
    { key: '4:3', value: 4 / 3, label: '4:3 Standard' },
    { key: '1:1', value: 1.0, label: '1:1 Square' }
  ];

  let closest = standardRatios[0];
  let minDiff = Math.abs(numericRatio - closest.value);
  for (const sr of standardRatios) {
    const diff = Math.abs(numericRatio - sr.value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = sr;
    }
  }

  const target = targetRatioKey
    ? standardRatios.find(r => r.key === targetRatioKey) || closest
    : closest;

  const diffPercent = +(((numericRatio - target.value) / target.value) * 100).toFixed(1);
  const isExact = Math.abs(diffPercent) < 0.5;

  return {
    numericRatio: +numericRatio.toFixed(2),
    label: isExact ? target.label : `${numericRatio.toFixed(2)} : 1 (Custom)`,
    closestStandardLabel: closest.label,
    targetKey: target.key,
    diffPercent,
    isExact,
    discrepancyNote: isExact
      ? `อัตราส่วนตรงตามมาตรฐาน ${target.key}`
      : `อัตราส่วนจริง ${numericRatio.toFixed(2)}:1 (ต่างจาก ${target.key} อยู่ ${diffPercent > 0 ? '+' : ''}${diffPercent}%)`
  };
}

/**
 * Performs full screen configuration calculations.
 * @param {Object} params
 * @param {number} params.requestedWidthMm Customer requested width in mm
 * @param {number} params.requestedHeightMm Customer requested height in mm
 * @param {Object} params.product Product profile object from ProductCatalog
 * @param {'nearest'|'floor'|'ceil'} [params.layoutPolicy='nearest']
 * @param {'landscape'|'portrait'} [params.orientation='landscape']
 * @param {number} [params.viewingDistanceM=5.0]
 * @param {string} [params.targetAspectKey='16:9']
 */
export function calculateScreenSpecs(params) {
  const {
    requestedWidthMm,
    requestedHeightMm,
    product,
    layoutPolicy = 'nearest',
    orientation = 'landscape',
    viewingDistanceM = 5.0,
    targetAspectKey = null
  } = params;

  if (!product) {
    throw new Error('Product profile is required for spec calculation');
  }

  // Determine effective cabinet dimensions based on orientation
  let cabW = product.cabinetWidthMm;
  let cabH = product.cabinetHeightMm;
  let cabPixelW = product.cabinetPixelWidth;
  let cabPixelH = product.cabinetPixelHeight;

  if (orientation === 'portrait' && cabW !== cabH) {
    // Swap dimensions if cabinet is rectangular and oriented portrait
    cabW = product.cabinetHeightMm;
    cabH = product.cabinetWidthMm;
    cabPixelW = product.cabinetPixelHeight;
    cabPixelH = product.cabinetPixelWidth;
  }

  const pitchMm = product.actualPixelPitchMm;

  // 1. Calculate discrete cabinet count for chosen policy
  const countX = calculateCabinetCount(requestedWidthMm, cabW, layoutPolicy);
  const countY = calculateCabinetCount(requestedHeightMm, cabH, layoutPolicy);
  const totalCabinets = countX * countY;

  // 2. Physical buildable dimensions
  const actualWidthMm = countX * cabW;
  const actualHeightMm = countY * cabH;
  const actualWidthM = actualWidthMm / UNITS.MM_PER_METER;
  const actualHeightM = actualHeightMm / UNITS.MM_PER_METER;
  const actualAreaSqm = +(actualWidthM * actualHeightM).toFixed(3);

  // Gaps / differences from requested
  const gapWidthMm = actualWidthMm - requestedWidthMm;
  const gapHeightMm = actualHeightMm - requestedHeightMm;

  // 3. Resolution calculations
  const resolutionWidth = countX * cabPixelW;
  const resolutionHeight = countY * cabPixelH;
  const totalPixels = resolutionWidth * resolutionHeight;
  const totalPixelsM = +(totalPixels / 1000000).toFixed(2);

  // 4. Aspect ratio analysis
  const aspectRatio = analyzeAspectRatio(actualWidthMm, actualHeightMm, targetAspectKey);

  // 5. Distance and Quality Metrics
  const distanceMetrics = getPixelSimulationMetrics(pitchMm, viewingDistanceM);
  const qualityBadge = getQualityBadge(resolutionWidth, resolutionHeight);

  // 6. Verified Electrical and Structural Load Calculations
  const hasVerifiedPower = product.avgPowerWPerCabinet != null && product.maxPowerWPerCabinet != null;
  const hasVerifiedWeight = product.weightKgPerCabinet != null;

  const powerAvgKw = hasVerifiedPower ? +((totalCabinets * product.avgPowerWPerCabinet) / 1000).toFixed(2) : null;
  const powerMaxKw = hasVerifiedPower ? +((totalCabinets * product.maxPowerWPerCabinet) / 1000).toFixed(2) : null;
  const totalWeightKg = hasVerifiedWeight ? +(totalCabinets * product.weightKgPerCabinet).toFixed(1) : null;

  // Estimated Single Phase / Three Phase Amps at 220V/380V (Reference only)
  const estimatedAmps220V = powerMaxKw != null ? +((powerMaxKw * 1000) / 220).toFixed(1) : null;

  // 7. Compute 3 Layout Suggestions (Smaller / Nearest / Larger)
  const floorX = calculateCabinetCount(requestedWidthMm, cabW, 'floor');
  const floorY = calculateCabinetCount(requestedHeightMm, cabH, 'floor');
  const ceilX = calculateCabinetCount(requestedWidthMm, cabW, 'ceil');
  const ceilY = calculateCabinetCount(requestedHeightMm, cabH, 'ceil');
  const nearestX = calculateCabinetCount(requestedWidthMm, cabW, 'nearest');
  const nearestY = calculateCabinetCount(requestedHeightMm, cabH, 'nearest');

  function makeSuggestion(cx, cy, policyName) {
    const wMm = cx * cabW;
    const hMm = cy * cabH;
    const wM = +(wMm / UNITS.MM_PER_METER).toFixed(2);
    const hM = +(hMm / UNITS.MM_PER_METER).toFixed(2);
    const total = cx * cy;
    const pAvg = hasVerifiedPower ? +((total * product.avgPowerWPerCabinet) / 1000).toFixed(2) : null;
    return {
      policy: policyName,
      countX: cx,
      countY: cy,
      totalCabinets: total,
      actualWidthMm: wMm,
      actualHeightMm: hMm,
      actualWidthM: wM,
      actualHeightM: hM,
      actualAreaSqm: +(wM * hM).toFixed(2),
      resolutionWidth: cx * cabPixelW,
      resolutionHeight: cy * cabPixelH,
      powerAvgKw: pAvg,
      diffWidthMm: wMm - requestedWidthMm,
      diffHeightMm: hMm - requestedHeightMm
    };
  }

  const suggestions = {
    smaller: makeSuggestion(floorX, floorY, 'floor'),
    nearest: makeSuggestion(nearestX, nearestY, 'nearest'),
    larger: makeSuggestion(ceilX, ceilY, 'ceil')
  };

  // Warnings collection
  const warnings = [];
  if (!aspectRatio.isExact && targetAspectKey) {
    warnings.push(aspectRatio.discrepancyNote);
  }
  if (!distanceMetrics.isOptimal) {
    warnings.push(`ระยะยืนดู ${viewingDistanceM.toFixed(1)} ม. ใกล้กว่าระยะแนะนำสำหรับ P${pitchMm} (≥ ${distanceMetrics.optimalDistanceM.toFixed(1)} ม.)`);
  }
  if (!hasVerifiedPower || !hasVerifiedWeight) {
    warnings.push('ข้อมูลกำลังไฟหรือน้ำหนักบางส่วนยังไม่ได้รับการรับรองจากวิศวกร (แสดงเป็น "รอยืนยัน")');
  }

  return {
    requestedDimensions: {
      widthMm: requestedWidthMm,
      heightMm: requestedHeightMm,
      widthM: +(requestedWidthMm / UNITS.MM_PER_METER).toFixed(2),
      heightM: +(requestedHeightMm / UNITS.MM_PER_METER).toFixed(2)
    },
    actualDimensions: {
      widthMm: actualWidthMm,
      heightMm: actualHeightMm,
      widthM: actualWidthM,
      heightM: actualHeightM
    },
    // Backward-compatible top level properties
    requestedWidthMm,
    requestedHeightMm,
    requestedWidthM: +(requestedWidthMm / UNITS.MM_PER_METER).toFixed(2),
    requestedHeightM: +(requestedHeightMm / UNITS.MM_PER_METER).toFixed(2),
    actualWidthMm,
    actualHeightMm,
    actualWidthM,
    actualHeightM,
    diffWidthMm: gapWidthMm,
    diffHeightMm: gapHeightMm,
    gapMm: {
      widthMm: gapWidthMm,
      heightMm: gapHeightMm
    },
    countX,
    countY,
    cols: countX,
    rows: countY,
    totalCabinets,
    actualAreaSqm,
    resolutionPx: {
      width: resolutionWidth,
      height: resolutionHeight,
      total: totalPixels,
      totalM: totalPixelsM
    },
    resolutionWidth,
    resolutionHeight,
    totalPixels,
    totalPixelsM,
    aspectRatio,
    actualAspectRatio: aspectRatio.numericRatio,
    aspectLabel: aspectRatio.label,
    distanceMetrics,
    qualityBadge,
    powerAvgKw,
    powerMaxKw,
    totalWeightKg,
    estimatedAmps220V,
    hasVerifiedPower,
    hasVerifiedWeight,
    productStatus: product.status,
    layoutPolicy,
    orientation,
    suggestions,
    isOutdoor: product.environment === 'outdoor',
    warnings
  };
}
