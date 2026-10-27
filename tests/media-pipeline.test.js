import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  FIT_MODES,
  calculateMediaTransform
} from '../src/core/media-pipeline.js';

describe('Phase 09: Media Pipeline & Aspect Mapping Engine', () => {
  test('FIT mode calculates letterbox for wider aspect media', () => {
    // 16:9 media (1920x1080) into 4:3 target (800x600)
    const t = calculateMediaTransform({
      mediaWidth: 1920,
      mediaHeight: 1080,
      targetWidth: 800,
      targetHeight: 600,
      fitMode: FIT_MODES.FIT
    });

    // Target width is full 800, height letterboxed to 800 / (16/9) = 450
    assert.equal(t.dw, 800);
    assert.equal(t.dh, 450);
    assert.equal(t.dx, 0);
    assert.equal(t.dy, 75); // Centered vertically (600 - 450)/2 = 75
  });

  test('COVER mode fills target and crops excess media', () => {
    // 16:9 media (1920x1080) into 4:3 target (800x600)
    const t = calculateMediaTransform({
      mediaWidth: 1920,
      mediaHeight: 1080,
      targetWidth: 800,
      targetHeight: 600,
      fitMode: FIT_MODES.COVER
    });

    // Fills entire target
    assert.equal(t.dw, 800);
    assert.equal(t.dh, 600);
    assert.equal(t.dx, 0);
    assert.equal(t.dy, 0);
    // Source width cropped from 1920 down to 1080 * (4/3) = 1440
    assert.equal(t.sw, 1440);
    assert.equal(t.sh, 1080);
    assert.equal(t.sx, 240); // (1920 - 1440)/2 = 240
  });

  test('STRETCH mode maps entire media to target dimensions without cropping', () => {
    const t = calculateMediaTransform({
      mediaWidth: 1920,
      mediaHeight: 1080,
      targetWidth: 800,
      targetHeight: 600,
      fitMode: FIT_MODES.STRETCH
    });

    assert.equal(t.sx, 0);
    assert.equal(t.sy, 0);
    assert.equal(t.sw, 1920);
    assert.equal(t.sh, 1080);
    assert.equal(t.dx, 0);
    assert.equal(t.dy, 0);
    assert.equal(t.dw, 800);
    assert.equal(t.dh, 600);
  });
});
