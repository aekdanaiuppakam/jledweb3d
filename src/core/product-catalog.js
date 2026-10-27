/**
 * JLED DESIGN STUDIO v4.0 — Product Catalog & Compatibility Engine (Phase 02)
 * Comprehensive data model for JLED LED products, physical validation,
 * environment & mount compatibility checks, and JSON import/export validation.
 */

export const PRODUCT_STATUS = {
  VERIFIED: 'verified',     // Technical datasheet confirmed by JLED engineering
  DEMO: 'demo',             // Demo profile for visual simulation only
  INCOMPLETE: 'incomplete'  // Missing electrical/weight data (shows 'รอยืนยัน')
};

export const PRODUCT_ENVIRONMENT = {
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
  RENTAL: 'rental'
};

export const ALLOWED_MOUNTS = ['wall', 'truss', 'hanging'];
export const AVAILABLE_SHAPES = ['flat', 'curved', 'corner'];

/**
 * Validates a single SKU data object.
 * Enforces integer pixel counts, positive dimensions, and physical pitch/size consistency.
 * @param {Object} sku 
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateSku(sku) {
  const errors = [];
  const warnings = [];

  if (!sku || typeof sku !== 'object') {
    return { valid: false, errors: ['SKU data must be an object'], warnings: [] };
  }

  // Required text fields
  if (!sku.id || typeof sku.id !== 'string' || sku.id.trim() === '') {
    errors.push('SKU ID is required and must be a non-empty string');
  }
  if (!sku.displayName || typeof sku.displayName !== 'string' || sku.displayName.trim() === '') {
    errors.push('Display name is required and must be a non-empty string');
  }

  // Environment check
  const validEnvs = Object.values(PRODUCT_ENVIRONMENT);
  if (!validEnvs.includes(sku.environment)) {
    errors.push(`Invalid environment: "${sku.environment}". Allowed: ${validEnvs.join(', ')}`);
  }

  // Physical pitch (positive number in mm)
  if (!Number.isFinite(sku.actualPixelPitchMm) || sku.actualPixelPitchMm <= 0) {
    errors.push(`actualPixelPitchMm must be a positive number (received: ${sku.actualPixelPitchMm})`);
  }

  // Physical cabinet size (positive numbers in mm)
  if (!Number.isFinite(sku.cabinetWidthMm) || sku.cabinetWidthMm <= 0) {
    errors.push(`cabinetWidthMm must be a positive number (received: ${sku.cabinetWidthMm})`);
  }
  if (!Number.isFinite(sku.cabinetHeightMm) || sku.cabinetHeightMm <= 0) {
    errors.push(`cabinetHeightMm must be a positive number (received: ${sku.cabinetHeightMm})`);
  }

  // Cabinet pixel resolution MUST be positive integers
  if (!Number.isInteger(sku.cabinetPixelWidth) || sku.cabinetPixelWidth <= 0) {
    errors.push(`cabinetPixelWidth must be a positive integer (received: ${sku.cabinetPixelWidth})`);
  }
  if (!Number.isInteger(sku.cabinetPixelHeight) || sku.cabinetPixelHeight <= 0) {
    errors.push(`cabinetPixelHeight must be a positive integer (received: ${sku.cabinetPixelHeight})`);
  }

  // Physical size vs pixel pitch relationship check
  if (Number.isFinite(sku.cabinetWidthMm) && Number.isFinite(sku.actualPixelPitchMm) && Number.isInteger(sku.cabinetPixelWidth)) {
    const theoreticalWidth = sku.cabinetPixelWidth * sku.actualPixelPitchMm;
    const diffRatio = Math.abs(sku.cabinetWidthMm - theoreticalWidth) / sku.cabinetWidthMm;
    if (diffRatio > 0.06) {
      warnings.push(
        `ความกว้างตู้ (${sku.cabinetWidthMm}mm) ต่างจากการคำนวณพิกเซล*pitch (${theoreticalWidth.toFixed(1)}mm) เกิน ${(diffRatio * 100).toFixed(1)}% โปรดให้ฝ่ายเทคนิคตรวจสอบ`
      );
    }
  }

  // Allowed mounts validation
  if (Array.isArray(sku.allowedMounts)) {
    for (const m of sku.allowedMounts) {
      if (!ALLOWED_MOUNTS.includes(m)) {
        warnings.push(`Unrecognized mount type in allowedMounts: "${m}"`);
      }
    }
  } else {
    warnings.push('allowedMounts should be an array of mount strings');
  }

  // Status check
  const validStatuses = Object.values(PRODUCT_STATUS);
  if (!validStatuses.includes(sku.status)) {
    errors.push(`Invalid status: "${sku.status}". Allowed: ${validStatuses.join(', ')}`);
  }

  // Incomplete status check: if power or weight is null, status should not be VERIFIED
  if (sku.status === PRODUCT_STATUS.VERIFIED) {
    if (sku.avgPowerWPerCabinet == null || sku.maxPowerWPerCabinet == null || sku.weightKgPerCabinet == null) {
      warnings.push(`SKU ${sku.id} ติดสถานะ VERIFIED แต่ไม่มีข้อมูลกำลังไฟหรือน้ำหนักครบถ้วน`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Checks compatibility between a selected product SKU and the installation configuration (scene & mount).
 * @param {Object} product 
 * @param {Object} context
 * @param {string} context.sceneType 'boardroom' | 'exhibition' | 'outdoor'
 * @param {string} context.mountType 'wall' | 'truss' | 'hanging'
 * @returns {{ compatible: boolean, warnings: string[], errors: string[] }}
 */
export function checkCompatibility(product, { sceneType, mountType }) {
  const warnings = [];
  const errors = [];

  if (!product) {
    return { compatible: false, warnings: [], errors: ['No product selected'] };
  }

  // 1. Environment Compatibility Check
  const isOutdoorScene = ['outdoor', 'billboard', 'school-entrance', 'gov-building', 'building-facade'].includes(sceneType);
  const isCloseIndoorScene = ['boardroom', 'corporate-lobby', 'retail-store'].includes(sceneType);

  if (isOutdoorScene && product.environment === PRODUCT_ENVIRONMENT.INDOOR) {
    errors.push(`ข้อควรระวังสำคัญ: รุ่น ${product.displayName} ออกแบบสำหรับใช้ในอาคาร (Indoor) ไม่มีมาตรฐานกันน้ำ IP65 ไม่สามารถติดตั้งริมถนน/กลางแจ้งได้`);
  } else if (isCloseIndoorScene && product.environment === PRODUCT_ENVIRONMENT.OUTDOOR) {
    warnings.push(`ข้อแนะนำ: รุ่น ${product.displayName} มีความสว่างสูงมาก (${product.brightnessNits || 6000} Nits) และเม็ดพิกเซลห่าง เหมาะสำหรับภายนอกอาคารมากกว่าห้องประชุม`);
  }

  // 2. Mount Compatibility Check
  if (Array.isArray(product.allowedMounts) && mountType) {
    if (!product.allowedMounts.includes(mountType)) {
      if (mountType === 'hanging' && product.cabinetHeightMm >= 960) {
        errors.push(`ตู้ขนาดใหญ่ ${product.cabinetWidthMm}×${product.cabinetHeightMm} mm น้ำหนักมาก (${product.weightKgPerCabinet || 28}kg/ตู้) ไม่แนะนำให้แขวนสลิงมาตรฐาน`);
      } else {
        warnings.push(`รูปแบบการติดตั้ง "${mountType}" ไม่ได้ระบุไว้ในมาตรฐานที่แนะนำของรุ่นนี้ (รองรับ: ${product.allowedMounts.join(', ')})`);
      }
    }
  }

  return {
    compatible: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Baseline Product Catalog for JLED displays.
 * All physical cabinet dimensions are in millimeters (mm).
 */
export const BASELINE_CATALOG = [
  // Fine Pitch Indoor
  {
    id: 'JLED-FP-125',
    displayName: 'JLED FinePitch P1.25 Pro',
    series: 'FinePitch Pro',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 1.25,
    cabinetWidthMm: 600,
    cabinetHeightMm: 337.5,
    cabinetPixelWidth: 480,
    cabinetPixelHeight: 270,
    cabinetDepthMm: 55,
    moduleGrid: { cols: 4, rows: 2, moduleWidthMm: 150, moduleHeightMm: 168.75 },
    brightnessNits: 800,
    refreshHz: 3840,
    ipRatingFront: 'IP30',
    ipRatingBack: 'IP30',
    weightKgPerCabinet: 7.5,
    avgPowerWPerCabinet: 65,
    maxPowerWPerCabinet: 195,
    allowedMounts: ['wall', 'truss'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-FP125-REV1',
    revision: '2026.1'
  },
  {
    id: 'JLED-FP-150',
    displayName: 'JLED FinePitch P1.50 Pro',
    series: 'FinePitch Pro',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 1.5,
    cabinetWidthMm: 600,
    cabinetHeightMm: 337.5,
    cabinetPixelWidth: 400,
    cabinetPixelHeight: 225,
    cabinetDepthMm: 55,
    moduleGrid: { cols: 4, rows: 2, moduleWidthMm: 150, moduleHeightMm: 168.75 },
    brightnessNits: 800,
    refreshHz: 3840,
    ipRatingFront: 'IP30',
    ipRatingBack: 'IP30',
    weightKgPerCabinet: 7.5,
    avgPowerWPerCabinet: 60,
    maxPowerWPerCabinet: 180,
    allowedMounts: ['wall', 'truss'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-FP150-REV1',
    revision: '2026.1'
  },
  {
    id: 'JLED-FP-186',
    displayName: 'JLED FinePitch P1.86 Pro',
    series: 'FinePitch Pro',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 1.86,
    cabinetWidthMm: 640,
    cabinetHeightMm: 480,
    cabinetPixelWidth: 344,
    cabinetPixelHeight: 258,
    cabinetDepthMm: 60,
    moduleGrid: { cols: 2, rows: 3, moduleWidthMm: 320, moduleHeightMm: 160 },
    brightnessNits: 900,
    refreshHz: 3840,
    ipRatingFront: 'IP30',
    ipRatingBack: 'IP30',
    weightKgPerCabinet: 8.2,
    avgPowerWPerCabinet: 75,
    maxPowerWPerCabinet: 220,
    allowedMounts: ['wall', 'truss'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-FP186-REV1',
    revision: '2026.1'
  },
  // Standard Indoor (500x500mm J-Standard)
  {
    id: 'JLED-IND-200',
    displayName: 'JLED Indoor P2.0 J-Standard',
    series: 'J-Standard',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 2.0,
    cabinetWidthMm: 500,
    cabinetHeightMm: 500,
    cabinetPixelWidth: 250,
    cabinetPixelHeight: 250,
    cabinetDepthMm: 75,
    moduleGrid: { cols: 2, rows: 2, moduleWidthMm: 250, moduleHeightMm: 250 },
    brightnessNits: 1000,
    refreshHz: 3840,
    ipRatingFront: 'IP40',
    ipRatingBack: 'IP20',
    weightKgPerCabinet: 7.0,
    avgPowerWPerCabinet: 50,
    maxPowerWPerCabinet: 150,
    allowedMounts: ['wall', 'truss', 'hanging'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-IND200-REV1',
    revision: '2026.1'
  },
  {
    id: 'JLED-IND-250',
    displayName: 'JLED Indoor P2.5 J-Standard (Official)',
    series: 'J-Standard',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 2.5,
    cabinetWidthMm: 500,
    cabinetHeightMm: 500,
    cabinetPixelWidth: 200,
    cabinetPixelHeight: 200,
    cabinetDepthMm: 75,
    moduleGrid: { cols: 2, rows: 2, moduleWidthMm: 250, moduleHeightMm: 250 },
    brightnessNits: 1000,
    refreshHz: 3840,
    ipRatingFront: 'IP40',
    ipRatingBack: 'IP20',
    weightKgPerCabinet: 7.0,
    avgPowerWPerCabinet: 48,
    maxPowerWPerCabinet: 145,
    allowedMounts: ['wall', 'truss', 'hanging'],
    availableShapes: ['flat', 'curved'],
    status: PRODUCT_STATUS.VERIFIED,
    datasheetRef: 'JLED-DS-IND250-VERIFIED-2026',
    revision: '2026.1'
  },
  {
    id: 'JLED-IND-300',
    displayName: 'JLED Indoor P3.0 J-Standard',
    series: 'J-Standard',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 3.076,
    cabinetWidthMm: 500,
    cabinetHeightMm: 500,
    cabinetPixelWidth: 162,
    cabinetPixelHeight: 162,
    cabinetDepthMm: 75,
    moduleGrid: { cols: 2, rows: 2, moduleWidthMm: 250, moduleHeightMm: 250 },
    brightnessNits: 1100,
    refreshHz: 3840,
    ipRatingFront: 'IP40',
    ipRatingBack: 'IP20',
    weightKgPerCabinet: 6.8,
    avgPowerWPerCabinet: 45,
    maxPowerWPerCabinet: 140,
    allowedMounts: ['wall', 'truss', 'hanging'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-IND300-REV1',
    revision: '2026.1'
  },
  {
    id: 'JLED-IND-400',
    displayName: 'JLED Indoor P4.0 J-Standard',
    series: 'J-Standard',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 4.0,
    cabinetWidthMm: 500,
    cabinetHeightMm: 500,
    cabinetPixelWidth: 125,
    cabinetPixelHeight: 125,
    cabinetDepthMm: 75,
    moduleGrid: { cols: 2, rows: 2, moduleWidthMm: 250, moduleHeightMm: 250 },
    brightnessNits: 1200,
    refreshHz: 3840,
    ipRatingFront: 'IP40',
    ipRatingBack: 'IP20',
    weightKgPerCabinet: 6.8,
    avgPowerWPerCabinet: 42,
    maxPowerWPerCabinet: 135,
    allowedMounts: ['wall', 'truss', 'hanging'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-IND400-REV1',
    revision: '2026.1'
  },
  // Rental Series (Die-cast Aluminum, Fast Rigging)
  {
    id: 'JLED-RENT-297',
    displayName: 'JLED Rental P2.97 Event Pro',
    series: 'Rental Carbon',
    environment: PRODUCT_ENVIRONMENT.RENTAL,
    actualPixelPitchMm: 2.97,
    cabinetWidthMm: 500,
    cabinetHeightMm: 500,
    cabinetPixelWidth: 168,
    cabinetPixelHeight: 168,
    cabinetDepthMm: 70,
    moduleGrid: { cols: 2, rows: 2, moduleWidthMm: 250, moduleHeightMm: 250 },
    brightnessNits: 1200,
    refreshHz: 3840,
    ipRatingFront: 'IP40',
    ipRatingBack: 'IP20',
    weightKgPerCabinet: 7.2,
    avgPowerWPerCabinet: 52,
    maxPowerWPerCabinet: 155,
    allowedMounts: ['truss', 'hanging'],
    availableShapes: ['flat', 'curved'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-RENT297-REV1',
    revision: '2026.1'
  },
  {
    id: 'JLED-RENT-391',
    displayName: 'JLED Rental P3.91 All-Weather',
    series: 'Rental Carbon',
    environment: PRODUCT_ENVIRONMENT.RENTAL,
    actualPixelPitchMm: 3.91,
    cabinetWidthMm: 500,
    cabinetHeightMm: 500,
    cabinetPixelWidth: 128,
    cabinetPixelHeight: 128,
    cabinetDepthMm: 75,
    moduleGrid: { cols: 2, rows: 2, moduleWidthMm: 250, moduleHeightMm: 250 },
    brightnessNits: 4500,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 7.8,
    avgPowerWPerCabinet: 65,
    maxPowerWPerCabinet: 190,
    allowedMounts: ['truss', 'hanging'],
    availableShapes: ['flat', 'curved'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-RENT391-REV1',
    revision: '2026.1'
  },
  // Commercial Outdoor Waterproof (960x960mm IP65)
  {
    id: 'JLED-OUT-400',
    displayName: 'JLED Outdoor P4.0 High-Bright',
    series: 'Commercial Outdoor',
    environment: PRODUCT_ENVIRONMENT.OUTDOOR,
    actualPixelPitchMm: 4.0,
    cabinetWidthMm: 960,
    cabinetHeightMm: 960,
    cabinetPixelWidth: 240,
    cabinetPixelHeight: 240,
    cabinetDepthMm: 140,
    moduleGrid: { cols: 3, rows: 3, moduleWidthMm: 320, moduleHeightMm: 320 },
    brightnessNits: 5500,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 28.0,
    avgPowerWPerCabinet: 260,
    maxPowerWPerCabinet: 780,
    allowedMounts: ['wall', 'truss'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-OUT400-REV1',
    revision: '2026.1'
  },
  {
    id: 'JLED-OUT-500',
    displayName: 'JLED Outdoor P5.0 High-Bright',
    series: 'Commercial Outdoor',
    environment: PRODUCT_ENVIRONMENT.OUTDOOR,
    actualPixelPitchMm: 5.0,
    cabinetWidthMm: 960,
    cabinetHeightMm: 960,
    cabinetPixelWidth: 192,
    cabinetPixelHeight: 192,
    cabinetDepthMm: 140,
    moduleGrid: { cols: 3, rows: 3, moduleWidthMm: 320, moduleHeightMm: 320 },
    brightnessNits: 6500,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 28.0,
    avgPowerWPerCabinet: 250,
    maxPowerWPerCabinet: 750,
    allowedMounts: ['wall', 'truss'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-OUT500-REV1',
    revision: '2026.1'
  },
  {
    id: 'JLED-OUT-600',
    displayName: 'JLED Outdoor P6.0 High-Bright',
    series: 'Commercial Outdoor',
    environment: PRODUCT_ENVIRONMENT.OUTDOOR,
    actualPixelPitchMm: 6.0,
    cabinetWidthMm: 960,
    cabinetHeightMm: 960,
    cabinetPixelWidth: 160,
    cabinetPixelHeight: 160,
    cabinetDepthMm: 140,
    moduleGrid: { cols: 3, rows: 3, moduleWidthMm: 320, moduleHeightMm: 320 },
    brightnessNits: 6500,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 28.0,
    avgPowerWPerCabinet: 240,
    maxPowerWPerCabinet: 720,
    allowedMounts: ['wall', 'truss'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-OUT600-REV1',
    revision: '2026.1'
  },
  {
    id: 'JLED-OUT-800',
    displayName: 'JLED Outdoor P8.0 Billboard',
    series: 'Commercial Outdoor',
    environment: PRODUCT_ENVIRONMENT.OUTDOOR,
    actualPixelPitchMm: 8.0,
    cabinetWidthMm: 960,
    cabinetHeightMm: 960,
    cabinetPixelWidth: 120,
    cabinetPixelHeight: 120,
    cabinetDepthMm: 140,
    moduleGrid: { cols: 3, rows: 3, moduleWidthMm: 320, moduleHeightMm: 320 },
    brightnessNits: 7000,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 29.0,
    avgPowerWPerCabinet: 230,
    maxPowerWPerCabinet: 700,
    allowedMounts: ['wall', 'truss'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-OUT800-REV1',
    revision: '2026.1'
  },
  {
    id: 'JLED-OUT-1000',
    displayName: 'JLED Outdoor P10.0 Billboard',
    series: 'Commercial Outdoor',
    environment: PRODUCT_ENVIRONMENT.OUTDOOR,
    actualPixelPitchMm: 10.0,
    cabinetWidthMm: 960,
    cabinetHeightMm: 960,
    cabinetPixelWidth: 96,
    cabinetPixelHeight: 96,
    cabinetDepthMm: 140,
    moduleGrid: { cols: 3, rows: 3, moduleWidthMm: 320, moduleHeightMm: 320 },
    brightnessNits: 7500,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 30.0,
    avgPowerWPerCabinet: 220,
    maxPowerWPerCabinet: 680,
    allowedMounts: ['wall', 'truss'],
    availableShapes: ['flat'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-OUT1000-REV1',
    revision: '2026.1'
  }
];

export class ProductCatalog {
  constructor(initialCatalog = BASELINE_CATALOG) {
    this.products = new Map();
    for (const item of initialCatalog) {
      this.registerProduct(item);
    }
  }

  registerProduct(product) {
    const valResult = validateSku(product);
    if (!valResult.valid) {
      throw new Error(`Invalid product "${product?.id || 'unknown'}": ${valResult.errors.join('; ')}`);
    }
    this.products.set(product.id, { ...product });
  }

  getProductById(id) {
    return this.products.get(id) || null;
  }

  /**
   * Find nearest product SKU matching target pitch in mm and optional environment preference.
   */
  findProductByPitch(pitchMm, preferredEnv = null) {
    let candidates = Array.from(this.products.values());
    if (preferredEnv) {
      const envFiltered = candidates.filter(p => p.environment === preferredEnv);
      if (envFiltered.length > 0) candidates = envFiltered;
    }

    let closest = candidates[0];
    let minDiff = Math.abs(closest.actualPixelPitchMm - pitchMm);

    for (const p of candidates) {
      const diff = Math.abs(p.actualPixelPitchMm - pitchMm);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    }
    return closest;
  }

  getAllProducts(filterEnv = null) {
    const all = Array.from(this.products.values());
    if (!filterEnv || filterEnv === 'all') return all;
    return all.filter(p => p.environment === filterEnv);
  }

  /**
   * Validates and imports catalog from a JSON string.
   * @param {string} jsonStr 
   * @returns {{ success: boolean, importedCount: number, errors: string[] }}
   */
  importCatalogJson(jsonStr) {
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (err) {
      return { success: false, importedCount: 0, errors: [`JSON Parse Error: ${err.message}`] };
    }

    const items = Array.isArray(parsed) ? parsed : parsed.products;
    if (!Array.isArray(items) || items.length === 0) {
      return { success: false, importedCount: 0, errors: ['JSON must contain an array of product SKUs'] };
    }

    const validationErrors = [];
    const validatedProducts = [];

    items.forEach((item, idx) => {
      const res = validateSku(item);
      if (!res.valid) {
        validationErrors.push(`[Item ${idx + 1} (${item?.id || 'No ID'})] ${res.errors.join('; ')}`);
      } else {
        validatedProducts.push(item);
      }
    });

    if (validationErrors.length > 0) {
      return {
        success: false,
        importedCount: 0,
        errors: validationErrors
      };
    }

    // Replace catalog
    this.products.clear();
    for (const p of validatedProducts) {
      this.products.set(p.id, { ...p });
    }

    return {
      success: true,
      importedCount: validatedProducts.length,
      errors: []
    };
  }

  /**
   * Exports catalog to formatted JSON string.
   */
  exportCatalogJson() {
    return JSON.stringify({
      schemaVersion: '4.0.0',
      exportedAt: new Date().toISOString(),
      productsCount: this.products.size,
      products: Array.from(this.products.values())
    }, null, 2);
  }

  /**
   * Resets catalog back to baseline.
   */
  resetToBaseline() {
    this.products.clear();
    for (const item of BASELINE_CATALOG) {
      this.products.set(item.id, { ...item });
    }
  }
}

export const defaultCatalog = new ProductCatalog();
