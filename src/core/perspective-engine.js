/**
 * JLED DESIGN STUDIO v4.0 — Real-Site Photo Perspective Warp Engine
 * Computes 2D/3D projective homography and bilinear mapping for 4-corner perspective pins.
 * All image operations run strictly client-side on HTML5 Canvas.
 */

/**
 * Solves a 3x3 projective transformation matrix (Homography) mapping
 * source unit square or rectangle [s0, s1, s2, s3] to target quad [d0, d1, d2, d3].
 * Each point is [x, y].
 * Points order: 0: Top-Left, 1: Top-Right, 2: Bottom-Right, 3: Bottom-Left
 */
export function computeHomography(srcPoints, dstPoints) {
  if (!srcPoints || srcPoints.length !== 4 || !dstPoints || dstPoints.length !== 4) {
    throw new Error('Both srcPoints and dstPoints must contain exactly 4 points [x, y]');
  }

  // Gaussian elimination to solve 8 linear equations for projective matrix H
  const a = [];
  const b = [];

  for (let i = 0; i < 4; i++) {
    const [sx, sy] = srcPoints[i];
    const [dx, dy] = dstPoints[i];

    a.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx]);
    b.push(dx);

    a.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy]);
    b.push(dy);
  }

  const h = solveLinearSystem(a, b);
  // Matrix H is [h0, h1, h2, h3, h4, h5, h6, h7, 1]
  return [...h, 1];
}

/**
 * Solves Ax = B using Gaussian elimination with partial pivoting.
 */
function solveLinearSystem(A, B) {
  const n = B.length;
  for (let i = 0; i < n; i++) {
    // Pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    const tempA = A[i];
    A[i] = A[maxRow];
    A[maxRow] = tempA;
    const tempB = B[i];
    B[i] = B[maxRow];
    B[maxRow] = tempB;

    if (Math.abs(A[i][i]) < 1e-12) {
      throw new Error('Singular matrix in perspective solution');
    }

    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      B[k] -= factor * B[i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += A[i][j] * x[j];
    }
    x[i] = (B[i] - sum) / A[i][i];
  }
  return x;
}

/**
 * Projects a 2D source point [x, y] through homography matrix H.
 */
export function projectPoint(H, [x, y]) {
  const px = H[0] * x + H[1] * y + H[2];
  const py = H[3] * x + H[4] * y + H[5];
  const pw = H[6] * x + H[7] * y + H[8];
  if (Math.abs(pw) < 1e-10) return [px, py];
  return [px / pw, py / pw];
}

/**
 * Generates default 4-corner perspective points centered within a container width/height.
 */
export function getDefaultCornerPins(width, height, insetFactor = 0.2) {
  const w = Math.max(100, width);
  const h = Math.max(100, height);
  const padX = w * insetFactor;
  const padY = h * insetFactor;

  return [
    [padX, padY], // TL
    [w - padX, padY], // TR
    [w - padX, h - padY], // BR
    [padX, h - padY] // BL
  ];
}

/**
 * Renders textured perspective mesh by subdividing unit rectangle into triangles
 * and drawing onto target canvas using 2D Affine slices.
 * Fast, pure HTML5 Canvas with no WebGL extensions required.
 */
export function renderWarpedCanvas(sourceCanvas, targetCtx, cornerPins, options = {}) {
  const {
    opacity = 1.0,
    blendMode = 'source-over',
    gridSubdivisions = 8
  } = options;

  const srcW = sourceCanvas.width;
  const srcH = sourceCanvas.height;
  const [tl, tr, br, bl] = cornerPins;

  targetCtx.save();
  targetCtx.globalAlpha = Math.max(0, Math.min(1, opacity));
  targetCtx.globalCompositeOperation = blendMode;

  const sub = Math.max(2, Math.min(16, gridSubdivisions));
  const step = 1 / sub;

  // Bilinear interpolation helper for arbitrary quad
  const interpolateQuad = (u, v) => {
    const topX = tl[0] + u * (tr[0] - tl[0]);
    const topY = tl[1] + u * (tr[1] - tl[1]);
    const botX = bl[0] + u * (br[0] - bl[0]);
    const botY = bl[1] + u * (br[1] - bl[1]);
    return [
      topX + v * (botX - topX),
      topY + v * (botY - topY)
    ];
  };

  for (let i = 0; i < sub; i++) {
    const u0 = i * step;
    const u1 = (i + 1) * step;
    const sx0 = u0 * srcW;
    const sx1 = u1 * srcW;
    const sw = sx1 - sx0;

    for (let j = 0; j < sub; j++) {
      const v0 = j * step;
      const v1 = (j + 1) * step;
      const sy0 = v0 * srcH;
      const sy1 = v1 * srcH;
      const sh = sy1 - sy0;

      const p00 = interpolateQuad(u0, v0);
      const p10 = interpolateQuad(u1, v0);
      const p11 = interpolateQuad(u1, v1);
      const p01 = interpolateQuad(u0, v1);

      // Triangle 1: p00, p10, p01
      drawTriangle(targetCtx, sourceCanvas,
        sx0, sy0, sx1, sy0, sx0, sy1,
        p00[0], p00[1], p10[0], p10[1], p01[0], p01[1]
      );

      // Triangle 2: p10, p11, p01
      drawTriangle(targetCtx, sourceCanvas,
        sx1, sy0, sx1, sy1, sx0, sy1,
        p10[0], p10[1], p11[0], p11[1], p01[0], p01[1]
      );
    }
  }

  targetCtx.restore();
}

/**
 * Affine texture mapper for a single triangle using canvas clipping and transformation.
 */
function drawTriangle(ctx, im, x0, y0, x1, y1, x2, y2, sx0, sy0, sx1, sy1, sx2, sy2) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(sx0, sy0);
  ctx.lineTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  ctx.closePath();
  ctx.clip();

  // Solve affine matrix mapping (x0, y0), (x1, y1), (x2, y2) to (sx0, sy0), (sx1, sy1), (sx2, sy2)
  const denom = (x0 * (y1 - y2) - y0 * (x1 - x2) + (x1 * y2 - x2 * y1));
  if (Math.abs(denom) < 1e-6) {
    ctx.restore();
    return;
  }

  const m11 = -(y0 * (sx1 - sx2) - y1 * sx0 + y2 * sx0 + (y1 * sx2 - y2 * sx1)) / denom;
  const m12 = (y0 * (sy1 - sy2) - y1 * sy0 + y2 * sy0 + (y1 * sy2 - y2 * sy1)) / denom;
  const m21 = (x0 * (sx1 - sx2) - x1 * sx0 + x2 * sx0 + (x1 * sx2 - x2 * sx1)) / denom;
  const m22 = -(x0 * (sy1 - sy2) - x1 * sy0 + x2 * sy0 + (x1 * sy2 - x2 * sy1)) / denom;
  const dx = (x0 * (y1 * sx2 - y2 * sx1) - y0 * (x1 * sx2 - x2 * sx1) + (x1 * y2 - x2 * y1) * sx0) / denom;
  const dy = (x0 * (y1 * sy2 - y2 * sy1) - y0 * (x1 * sy2 - x2 * sy1) + (x1 * y2 - x2 * y1) * sy0) / denom;

  ctx.transform(m11, m12, m21, m22, dx, dy);
  ctx.drawImage(im, 0, 0);
  ctx.restore();
}
