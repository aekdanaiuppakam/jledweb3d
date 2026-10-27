/**
 * JLED DESIGN STUDIO v4.0 — Media Pipeline & Calibration Patterns Engine
 * Aspect ratio mapping (Fit, Cover, Stretch) and Engineering Test Patterns
 * (SMPTE Color Bars, Alignment Grid, Grayscale Ramp, Uniformity Solid Colors).
 */

export const FIT_MODES = {
  FIT: 'fit',
  COVER: 'cover',
  STRETCH: 'stretch'
};

export const TEST_PATTERNS = {
  COLOR_BARS: 'colorbars',
  GRID: 'grid',
  GRAYSCALE: 'grayscale',
  WHITE: 'white',
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue'
};

/**
 * Calculates (sx, sy, sw, sh) and (dx, dy, dw, dh) for canvas drawImage mapping.
 */
export function calculateMediaTransform({
  mediaWidth,
  mediaHeight,
  targetWidth,
  targetHeight,
  fitMode = FIT_MODES.FIT
}) {
  const mw = Math.max(1, Number(mediaWidth) || 1920);
  const mh = Math.max(1, Number(mediaHeight) || 1080);
  const tw = Math.max(1, Number(targetWidth) || 1024);
  const th = Math.max(1, Number(targetHeight) || 576);

  if (fitMode === FIT_MODES.STRETCH) {
    return {
      sx: 0, sy: 0, sw: mw, sh: mh,
      dx: 0, dy: 0, dw: tw, dh: th
    };
  }

  const mediaAspect = mw / mh;
  const targetAspect = tw / th;

  if (fitMode === FIT_MODES.COVER) {
    // Fill target completely, crop excess
    let sw, sh, sx, sy;
    if (mediaAspect > targetAspect) {
      sh = mh;
      sw = mh * targetAspect;
      sx = (mw - sw) / 2;
      sy = 0;
    } else {
      sw = mw;
      sh = mw / targetAspect;
      sx = 0;
      sy = (mh - sh) / 2;
    }
    return {
      sx: Math.round(sx),
      sy: Math.round(sy),
      sw: Math.round(sw),
      sh: Math.round(sh),
      dx: 0, dy: 0, dw: tw, dh: th
    };
  }

  // Default: FIT (Letterbox / Pillarbox)
  let dw, dh, dx, dy;
  if (mediaAspect > targetAspect) {
    dw = tw;
    dh = tw / mediaAspect;
    dx = 0;
    dy = (th - dh) / 2;
  } else {
    dh = th;
    dw = th * mediaAspect;
    dx = (tw - dw) / 2;
    dy = 0;
  }

  return {
    sx: 0, sy: 0, sw: mw, sh: mh,
    dx: Math.round(dx),
    dy: Math.round(dy),
    dw: Math.round(dw),
    dh: Math.round(dh)
  };
}

/**
 * Renders calibration test pattern onto a 2D canvas context.
 */
export function drawTestPattern(ctx, width, height, patternType) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  switch (patternType) {
    case TEST_PATTERNS.COLOR_BARS: {
      // 8 Standard EBU color bars: White, Yellow, Cyan, Green, Magenta, Red, Blue, Black
      const colors = ['#ffffff', '#ffff00', '#00ffff', '#00ff00', '#ff00ff', '#ff0000', '#0000ff', '#000000'];
      const barW = width / colors.length;
      colors.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(idx * barW, 0, barW, height * 0.75);
      });
      // Bottom test bar: -I, White, +Q, Black, 4-step gray ramp
      const botH = height * 0.25;
      const botColors = ['#002144', '#ffffff', '#32006a', '#131313', '#202020', '#404040', '#606060', '#000000'];
      const botW = width / botColors.length;
      botColors.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(idx * botW, height * 0.75, botW, botH);
      });
      break;
    }
    case TEST_PATTERNS.GRID: {
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      const step = 32;
      for (let x = 0; x <= width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Crosshair in center
      ctx.strokeStyle = '#ff6b00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
      ctx.stroke();
      break;
    }
    case TEST_PATTERNS.GRAYSCALE: {
      const steps = 16;
      const barW = width / steps;
      for (let i = 0; i < steps; i++) {
        const val = Math.round((i / (steps - 1)) * 255);
        ctx.fillStyle = `rgb(${val},${val},${val})`;
        ctx.fillRect(i * barW, 0, barW, height);
      }
      break;
    }
    case TEST_PATTERNS.WHITE:
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      break;
    case TEST_PATTERNS.RED:
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, width, height);
      break;
    case TEST_PATTERNS.GREEN:
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(0, 0, width, height);
      break;
    case TEST_PATTERNS.BLUE:
      ctx.fillStyle = '#0000ff';
      ctx.fillRect(0, 0, width, height);
      break;
    default:
      ctx.fillStyle = '#060911';
      ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}
