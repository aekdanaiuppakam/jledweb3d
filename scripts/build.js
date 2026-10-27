/**
 * JLED DESIGN STUDIO v4.0 — Release Builder & Validation Script
 * Verifies all modules, runs test suite, checks integrity, and produces release info.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('======================================================');
console.log('   JLED DESIGN STUDIO v4.0 — Build & Verify Pipeline  ');
console.log('======================================================\n');

// 1. Run Automated Tests
console.log('▶ [Step 1/3] Running Automated Unit Tests...');
try {
  execSync('node --test tests/**/*.test.js', { stdio: 'inherit', cwd: ROOT_DIR });
  console.log('  ✔ All tests passed successfully.\n');
} catch (err) {
  console.error('  ✖ Test suite failed! Aborting build.');
  process.exit(1);
}

// 2. Verify File Integrity
console.log('▶ [Step 2/3] Verifying Module Files & Asset Integrity...');
const requiredFiles = [
  'index.html',
  'package.json',
  'src/core/constants.js',
  'src/core/state.js',
  'src/core/calculation-engine.js',
  'src/core/product-catalog.js',
  'src/core/measurements.js',
  'src/core/perspective-engine.js',
  'src/core/pitch-comparison.js',
  'src/core/shape-engine.js',
  'src/core/media-pipeline.js',
  'src/core/project-store.js',
  'src/core/lead-crm.js',
  'src/core/disposal.js',
  'docs/AUDIT_AND_ARCHITECTURE.md',
  'backup/jled_3d_screen_simulator_configurator_led_v3.5_original.html'
];

for (const relPath of requiredFiles) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`  ✖ Missing critical file: ${relPath}`);
    process.exit(1);
  }
  const stat = fs.statSync(fullPath);
  console.log(`  ✔ Found: ${relPath} (${stat.size} bytes)`);
}

// 3. Write Release Metadata
console.log('\n▶ [Step 3/3] Generating Release Metadata...');
const releaseInfo = {
  version: '4.0.0',
  title: 'JLED DESIGN STUDIO v4.0 PRO',
  phase: 'Phase 12: Production Release, Testing, A11y, Security, WebGL Fallback & CRM Delivery',
  timestamp: new Date().toISOString(),
  testStatus: 'PASS',
  allPhasesCompleted: [
    'Phase 01: Audit, Refactor & Regression Baseline',
    'Phase 02: Real Product SKU Catalog & Validation Engine',
    'Phase 03: Discrete Cabinet Layout, Resolution Tiering & 2D Blueprint',
    'Phase 04: 3D Spatial Position, Elevation, Rotation & Vector Measurements',
    'Phase 05: Real-Site Photo Mockup with 4-Corner Perspective Pinning',
    'Phase 06: Pixel Pitch Comparison Lab with Split Screen & Loupe',
    'Phase 07: Advanced Shapes (L-Shape 90° & Arc Curved Screen) with Hardware Validation',
    'Phase 08: Customer Mode vs Sales-Engineer Mode Presentation Switching',
    'Phase 09: Media Pipeline (Aspect Fit/Cover/Stretch & Calibration Test Patterns)',
    'Phase 10: Project Store (.jled.json v4.0.0), 3D Snapshot PNG & Branded Proposal PDF',
    'Phase 11: Request Quotation, Customer Lead Validation, LINE OA Deep-Link & CRM Payload',
    'Phase 12: Production Hardening, Accessibility (Escape/ARIA), WebGL Fallback & Build Verification'
  ],
  modules: [
    'src/core/constants.js',
    'src/core/state.js',
    'src/core/calculation-engine.js',
    'src/core/product-catalog.js',
    'src/core/measurements.js',
    'src/core/perspective-engine.js',
    'src/core/pitch-comparison.js',
    'src/core/shape-engine.js',
    'src/core/media-pipeline.js',
    'src/core/project-store.js',
    'src/core/lead-crm.js',
    'src/core/disposal.js'
  ]
};

fs.writeFileSync(
  path.join(ROOT_DIR, 'release-info.json'),
  JSON.stringify(releaseInfo, null, 2),
  'utf-8'
);

console.log('  ✔ release-info.json generated.');
console.log('\n======================================================');
console.log('   BUILD SUCCESSFUL: JLED DESIGN STUDIO v4.0 (COMPLETE) ');
console.log('======================================================\n');
