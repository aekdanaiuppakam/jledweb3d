/**
 * JLED DESIGN STUDIO v4.0 — Advanced LED Screen Shapes Engine
 * Computes 3D geometry parameters and texture UV mappings for:
 * 1. Flat Plane
 * 2. L-Shape 90-degree Corner (Inward & Outward)
 * 3. Curved Display (Arc / Cylinder segment) with hardware validation
 */

export const SHAPE_TYPES = {
  FLAT: 'flat',
  L_SHAPE_INNER: 'l-shape-inner',
  L_SHAPE_OUTER: 'l-shape-outer',
  CURVED_CONCAVE: 'curved-concave',
  CURVED_CONVEX: 'curved-convex'
};

/**
 * Checks if a given product SKU supports the requested shape.
 * Flat-only cabinets cannot be physically bent into curves without angle-lock mechanisms.
 */
export function validateShapeCompatibility(product, shapeType) {
  if (!shapeType || shapeType === SHAPE_TYPES.FLAT) {
    return { supported: true, warning: null };
  }

  const allowed = product?.availableShapes || [SHAPE_TYPES.FLAT];

  if (shapeType.startsWith('curved')) {
    const supportsCurve = allowed.includes('curved') ||
      allowed.includes(SHAPE_TYPES.CURVED_CONCAVE) ||
      allowed.includes(SHAPE_TYPES.CURVED_CONVEX) ||
      product?.series?.toLowerCase().includes('rental');

    if (!supportsCurve) {
      return {
        supported: false,
        warning: `รุ่น ${product ? product.displayName : 'มาตรฐาน'} เป็นตู้ตรง (Flat) ไม่รองรับการดัดโค้ง ต้องเลือกรุ่น Rental Flex Series ที่มี Curve Angle Lock (-10° ถึง +10°)`
      };
    }
  }

  return { supported: true, warning: null };
}

/**
 * Calculates parameters for an L-Shape 90-Degree Screen.
 * Face 1: Main front facade (width w1)
 * Face 2: Side perpendicular wing (width w2)
 */
export function calculateLCornerParameters({
  totalWidthM = 4.0,
  splitRatio = 0.65, // Face 1 ratio (e.g. 65% front, 35% side)
  heightM = 2.5,
  cornerType = SHAPE_TYPES.L_SHAPE_OUTER,
  depthM = 0.08
}) {
  const w1 = Number((totalWidthM * splitRatio).toFixed(2));
  const w2 = Number((totalWidthM * (1 - splitRatio)).toFixed(2));
  const isOuter = cornerType === SHAPE_TYPES.L_SHAPE_OUTER;

  // Face 1 (Front): Centered along X from -w1 to 0, at Z = 0
  // Face 2 (Side): Perpendicular along Z from 0 to (isOuter ? -w2 : w2), at X = 0
  return {
    w1,
    w2,
    heightM,
    cornerType,
    isOuter,
    face1: {
      widthM: w1,
      heightM,
      position: [-w1 / 2, heightM / 2, 0],
      rotationY: 0
    },
    face2: {
      widthM: w2,
      heightM,
      position: [0, heightM / 2, isOuter ? -w2 / 2 : w2 / 2],
      rotationY: isOuter ? Math.PI / 2 : -Math.PI / 2
    }
  };
}

/**
 * Calculates curved arc parameters.
 */
export function calculateCurveParameters({
  widthM = 4.0,
  heightM = 2.5,
  arcDegrees = 45, // 15° to 90°
  isConcave = true
}) {
  const arcRad = (Math.max(10, Math.min(120, arcDegrees)) * Math.PI) / 180;
  // Arc length = Radius * theta => Radius = Width / theta
  const radius = widthM / arcRad;

  return {
    widthM,
    heightM,
    arcDegrees,
    arcRad,
    radius,
    isConcave,
    chordLength: 2 * radius * Math.sin(arcRad / 2),
    sagitta: radius * (1 - Math.cos(arcRad / 2))
  };
}
