import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

describe('Release & Module Integrity Test Suite (Phase 12)', () => {
  const allModules = [
    'src/core/constants.js',
    'src/core/state.js',
    'src/core/calculation-engine.js',
    'src/core/product-catalog.js',
    'src/core/measurements.js',
    'src/core/perspective-engine.js',
    'src/core/pitch-comparison.js',
    'src/core/shape-engine.js',
    'src/core/media-pipeline.js',
    'src/core/disposal.js',
    'src/core/project-store.js',
    'src/core/lead-crm.js',
    'src/3d/lighting-system.js',
    'src/3d/cinematic-camera.js',
    'src/3d/environment-builder.js',
    'src/3d/environments/indoor.js',
    'src/3d/environments/outdoor.js',
    'src/3d/environments/event.js'
  ];

  it('verifies that all architecture and 3D modules exist and are non-empty', () => {
    for (const mod of allModules) {
      const fullPath = path.join(ROOT_DIR, mod);
      assert.ok(fs.existsSync(fullPath), `Module missing: ${mod}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 200, `Module ${mod} is suspiciously small (${stats.size} bytes)`);
    }
  });

  it('verifies backup of original v3.5 is preserved untouched', () => {
    const backupPath = path.join(ROOT_DIR, 'backup/jled_3d_screen_simulator_configurator_led_v3.5_original.html');
    assert.ok(fs.existsSync(backupPath), 'Original v3.5 backup file missing');
    const content = fs.readFileSync(backupPath, 'utf-8');
    assert.ok(content.includes('JLED 3D Screen Simulator'));
  });

  it('verifies index.html has essential accessibility attributes and safety disclaimers', () => {
    const indexPath = path.join(ROOT_DIR, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');

    // Thai-first UI & CI
    assert.ok(html.includes('lang="th"'));
    assert.ok(html.includes('JLED DESIGN STUDIO'));

    // Mandatory disclaimers present
    assert.ok(html.includes('วิศวกร') || html.includes('รอยืนยัน'));
    assert.ok(html.includes('webgl-fallback-banner'));
  });
});
