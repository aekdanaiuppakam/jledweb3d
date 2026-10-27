/**
 * JLED DESIGN STUDIO v4.0 — Product Catalog & Compatibility Model
 * Baseline catalog with verified vs demo status flags, physical cabinet dimensions,
 * power & weight specifications.
 * Decoupled from arbitrary pitch rules.
 */

export const PRODUCT_STATUS = {
  VERIFIED: 'verified',     // Technical datasheet confirmed
  DEMO: 'demo',             // Demo profile for visual simulation only
  INCOMPLETE: 'incomplete'  // Missing electrical/weight data
};

export const PRODUCT_ENVIRONMENT = {
  INDOOR: 'indoor',
  OUTDOOR: 'outdoor',
  RENTAL: 'rental'
};

/**
 * Baseline Product Catalog for JLED displays.
 * All physical cabinet dimensions are in millimeters (mm).
 */
export const BASELINE_CATALOG = [
  // Fine Pitch Indoor
  {
    id: 'JLED-FP-125',
    displayName: 'JLED FinePitch P1.25 Pro',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 1.25,
    cabinetWidthMm: 600,
    cabinetHeightMm: 337.5,
    cabinetPixelWidth: 480,
    cabinetPixelHeight: 270,
    cabinetDepthMm: 55,
    brightnessNits: 800,
    refreshHz: 3840,
    ipRatingFront: 'IP30',
    ipRatingBack: 'IP30',
    weightKgPerCabinet: 7.5,
    avgPowerWPerCabinet: 65,
    maxPowerWPerCabinet: 195,
    allowedMounts: ['wall', 'truss'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-FP125-REV1'
  },
  {
    id: 'JLED-FP-150',
    displayName: 'JLED FinePitch P1.50 Pro',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 1.5,
    cabinetWidthMm: 600,
    cabinetHeightMm: 337.5,
    cabinetPixelWidth: 400,
    cabinetPixelHeight: 225,
    cabinetDepthMm: 55,
    brightnessNits: 800,
    refreshHz: 3840,
    ipRatingFront: 'IP30',
    ipRatingBack: 'IP30',
    weightKgPerCabinet: 7.5,
    avgPowerWPerCabinet: 60,
    maxPowerWPerCabinet: 180,
    allowedMounts: ['wall', 'truss'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-FP150-REV1'
  },
  {
    id: 'JLED-FP-186',
    displayName: 'JLED FinePitch P1.86 Pro',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 1.86,
    cabinetWidthMm: 640,
    cabinetHeightMm: 480,
    cabinetPixelWidth: 344,
    cabinetPixelHeight: 258,
    cabinetDepthMm: 60,
    brightnessNits: 900,
    refreshHz: 3840,
    ipRatingFront: 'IP30',
    ipRatingBack: 'IP30',
    weightKgPerCabinet: 8.2,
    avgPowerWPerCabinet: 75,
    maxPowerWPerCabinet: 220,
    allowedMounts: ['wall', 'truss'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-FP186-REV1'
  },
  // Standard Indoor (500x500mm / 0.5x0.5m)
  {
    id: 'JLED-IND-200',
    displayName: 'JLED Indoor P2.0 Standard',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 2.0,
    cabinetWidthMm: 500,
    cabinetHeightMm: 500,
    cabinetPixelWidth: 250,
    cabinetPixelHeight: 250,
    cabinetDepthMm: 75,
    brightnessNits: 1000,
    refreshHz: 3840,
    ipRatingFront: 'IP40',
    ipRatingBack: 'IP20',
    weightKgPerCabinet: 7.0,
    avgPowerWPerCabinet: 50,
    maxPowerWPerCabinet: 150,
    allowedMounts: ['wall', 'truss', 'hanging'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-IND200-REV1'
  },
  {
    id: 'JLED-IND-250',
    displayName: 'JLED Indoor P2.5 Standard',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 2.5,
    cabinetWidthMm: 500,
    cabinetHeightMm: 500,
    cabinetPixelWidth: 200,
    cabinetPixelHeight: 200,
    cabinetDepthMm: 75,
    brightnessNits: 1000,
    refreshHz: 3840,
    ipRatingFront: 'IP40',
    ipRatingBack: 'IP20',
    weightKgPerCabinet: 7.0,
    avgPowerWPerCabinet: 48,
    maxPowerWPerCabinet: 145,
    allowedMounts: ['wall', 'truss', 'hanging'],
    status: PRODUCT_STATUS.VERIFIED,
    datasheetRef: 'JLED-DS-IND250-VERIFIED-2026'
  },
  {
    id: 'JLED-IND-300',
    displayName: 'JLED Indoor P3.0 Standard',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 3.076,
    cabinetWidthMm: 500,
    cabinetHeightMm: 500,
    cabinetPixelWidth: 162,
    cabinetPixelHeight: 162,
    cabinetDepthMm: 75,
    brightnessNits: 1100,
    refreshHz: 3840,
    ipRatingFront: 'IP40',
    ipRatingBack: 'IP20',
    weightKgPerCabinet: 6.8,
    avgPowerWPerCabinet: 45,
    maxPowerWPerCabinet: 140,
    allowedMounts: ['wall', 'truss', 'hanging'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-IND300-REV1'
  },
  {
    id: 'JLED-IND-400',
    displayName: 'JLED Indoor P4.0 Standard',
    environment: PRODUCT_ENVIRONMENT.INDOOR,
    actualPixelPitchMm: 4.0,
    cabinetWidthMm: 500,
    cabinetHeightMm: 500,
    cabinetPixelWidth: 125,
    cabinetPixelHeight: 125,
    cabinetDepthMm: 75,
    brightnessNits: 1200,
    refreshHz: 3840,
    ipRatingFront: 'IP40',
    ipRatingBack: 'IP20',
    weightKgPerCabinet: 6.8,
    avgPowerWPerCabinet: 42,
    maxPowerWPerCabinet: 135,
    allowedMounts: ['wall', 'truss', 'hanging'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-IND400-REV1'
  },
  // Outdoor Waterproof (960x960mm iron/aluminum cabinet)
  {
    id: 'JLED-OUT-400',
    displayName: 'JLED Outdoor P4.0 High-Bright',
    environment: PRODUCT_ENVIRONMENT.OUTDOOR,
    actualPixelPitchMm: 4.0,
    cabinetWidthMm: 960,
    cabinetHeightMm: 960,
    cabinetPixelWidth: 240,
    cabinetPixelHeight: 240,
    cabinetDepthMm: 140,
    brightnessNits: 5500,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 28.0,
    avgPowerWPerCabinet: 260,
    maxPowerWPerCabinet: 780,
    allowedMounts: ['wall', 'truss'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-OUT400-REV1'
  },
  {
    id: 'JLED-OUT-500',
    displayName: 'JLED Outdoor P5.0 High-Bright',
    environment: PRODUCT_ENVIRONMENT.OUTDOOR,
    actualPixelPitchMm: 5.0,
    cabinetWidthMm: 960,
    cabinetHeightMm: 960,
    cabinetPixelWidth: 192,
    cabinetPixelHeight: 192,
    cabinetDepthMm: 140,
    brightnessNits: 6500,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 28.0,
    avgPowerWPerCabinet: 250,
    maxPowerWPerCabinet: 750,
    allowedMounts: ['wall', 'truss'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-OUT500-REV1'
  },
  {
    id: 'JLED-OUT-600',
    displayName: 'JLED Outdoor P6.0 High-Bright',
    environment: PRODUCT_ENVIRONMENT.OUTDOOR,
    actualPixelPitchMm: 6.0,
    cabinetWidthMm: 960,
    cabinetHeightMm: 960,
    cabinetPixelWidth: 160,
    cabinetPixelHeight: 160,
    cabinetDepthMm: 140,
    brightnessNits: 6500,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 28.0,
    avgPowerWPerCabinet: 240,
    maxPowerWPerCabinet: 720,
    allowedMounts: ['wall', 'truss'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-OUT600-REV1'
  },
  {
    id: 'JLED-OUT-800',
    displayName: 'JLED Outdoor P8.0 Billboard',
    environment: PRODUCT_ENVIRONMENT.OUTDOOR,
    actualPixelPitchMm: 8.0,
    cabinetWidthMm: 960,
    cabinetHeightMm: 960,
    cabinetPixelWidth: 120,
    cabinetPixelHeight: 120,
    cabinetDepthMm: 140,
    brightnessNits: 7000,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 29.0,
    avgPowerWPerCabinet: 230,
    maxPowerWPerCabinet: 700,
    allowedMounts: ['wall', 'truss'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-OUT800-REV1'
  },
  {
    id: 'JLED-OUT-1000',
    displayName: 'JLED Outdoor P10.0 Billboard',
    environment: PRODUCT_ENVIRONMENT.OUTDOOR,
    actualPixelPitchMm: 10.0,
    cabinetWidthMm: 960,
    cabinetHeightMm: 960,
    cabinetPixelWidth: 96,
    cabinetPixelHeight: 96,
    cabinetDepthMm: 140,
    brightnessNits: 7500,
    refreshHz: 3840,
    ipRatingFront: 'IP65',
    ipRatingBack: 'IP54',
    weightKgPerCabinet: 30.0,
    avgPowerWPerCabinet: 220,
    maxPowerWPerCabinet: 680,
    allowedMounts: ['wall', 'truss'],
    status: PRODUCT_STATUS.DEMO,
    datasheetRef: 'JLED-DS-OUT1000-REV1'
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
    if (!product || !product.id) {
      throw new Error('Invalid product: missing ID');
    }
    this.products.set(product.id, { ...product });
  }

  getProductById(id) {
    return this.products.get(id) || null;
  }

  /**
   * Find nearest product SKU matching a target pitch in mm and optional environment preference.
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

  getAllProducts() {
    return Array.from(this.products.values());
  }
}

export const defaultCatalog = new ProductCatalog();
