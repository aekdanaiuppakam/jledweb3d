/**
 * JLED DESIGN STUDIO v4.0 — 3D Measurement & Spatial Math Engine
 * Pure mathematical functions for calculating 3D dimension lines, ticks,
 * and text sprite anchors for screen width, height, elevation, and viewing distance.
 */

/**
 * Calculates world coordinates for 3D measurement dimension lines.
 * @param {Object} params
 * @param {number} params.actualWidthM Screen width in meters
 * @param {number} params.actualHeightM Screen height in meters
 * @param {number} params.elevationM Height of screen bottom above floor in meters
 * @param {number} [params.positionXM=0] Horizontal position offset in meters
 * @param {number} [params.positionZM=0] Depth position offset in meters
 * @param {number} [params.viewingDistanceM=5.0] Viewing distance in meters
 * @returns {Object} Structured line segments and text badge coordinates
 */
export function calculateDimensionCoordinates({
  actualWidthM,
  actualHeightM,
  elevationM = 1.0,
  positionXM = 0,
  positionZM = 0,
  viewingDistanceM = 5.0
}) {
  const w = Math.max(0.1, Number(actualWidthM) || 4.0);
  const h = Math.max(0.1, Number(actualHeightM) || 2.5);
  const elev = Math.max(0, Number(elevationM) || 0);
  const bottomY = elev;
  const topY = elev + h;
  const centerY = elev + h / 2;
  const halfW = w / 2;

  // 1. Width Dimension Line (placed above screen top)
  const widthLineY = topY + 0.18;
  const widthDimension = {
    start: [-halfW, widthLineY, 0.02],
    end: [halfW, widthLineY, 0.02],
    tickLeft: [
      [-halfW, widthLineY - 0.06, 0.02],
      [-halfW, widthLineY + 0.06, 0.02]
    ],
    tickRight: [
      [halfW, widthLineY - 0.06, 0.02],
      [halfW, widthLineY + 0.06, 0.02]
    ],
    badgePosition: [0, widthLineY + 0.14, 0.04],
    text: `กว้าง ${w.toFixed(2)} ม.`
  };

  // 2. Height Dimension Line (placed to the right of screen)
  const heightLineX = halfW + 0.20;
  const heightDimension = {
    start: [heightLineX, bottomY, 0.02],
    end: [heightLineX, topY, 0.02],
    tickBottom: [
      [heightLineX - 0.06, bottomY, 0.02],
      [heightLineX + 0.06, bottomY, 0.02]
    ],
    tickTop: [
      [heightLineX - 0.06, topY, 0.02],
      [heightLineX + 0.06, topY, 0.02]
    ],
    badgePosition: [heightLineX + 0.35, centerY, 0.04],
    text: `สูง ${h.toFixed(2)} ม.`
  };

  // 3. Elevation Dimension Line (floor Y=0 to screen bottom)
  const elevLineX = -halfW - 0.20;
  const elevationDimension = {
    start: [elevLineX, 0, 0.02],
    end: [elevLineX, bottomY, 0.02],
    tickFloor: [
      [elevLineX - 0.06, 0.01, 0.02],
      [elevLineX + 0.06, 0.01, 0.02]
    ],
    tickScreenBottom: [
      [elevLineX - 0.06, bottomY, 0.02],
      [elevLineX + 0.06, bottomY, 0.02]
    ],
    badgePosition: [elevLineX - 0.38, Math.max(0.2, bottomY / 2), 0.04],
    text: `ยกสูง ${bottomY.toFixed(2)} ม.`
  };

  // 4. Viewing Distance Line on Floor (from screen plane Z=0 to viewer distance)
  const dist = Math.max(0.5, Number(viewingDistanceM) || 5.0);
  const distanceDimension = {
    start: [0, 0.02, 0.1],
    end: [0, 0.02, dist],
    badgePosition: [0, 0.12, dist / 2],
    text: `ระยะรับชม ${dist.toFixed(1)} ม.`
  };

  return {
    screenCenterY: centerY,
    widthDimension,
    heightDimension,
    elevationDimension,
    distanceDimension
  };
}
