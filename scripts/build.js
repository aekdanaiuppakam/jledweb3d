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
  version: '4.0.0-phase03',
  phase: 'Phase 03: Real Cabinet Layout, Aspect Discrepancy, 2D Blueprint & Electrical Engine',
  timestamp: new Date().toISOString(),
  testStatus: 'PASS',
  modules: [
    'src/core/constants.js',
    'src/core/state.js',
    'src/core/calculation-engine.js',
    'src/core/product-catalog.js',
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
console.log('   BUILD SUCCESSFUL: JLED Design Studio v4.0 Phase 03 ');
console.log('======================================================\n');
