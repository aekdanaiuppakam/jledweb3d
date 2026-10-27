import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createProjectData,
  validateProjectJson,
  serializeProject,
  generateProposalHtml,
  CURRENT_SCHEMA_VERSION
} from '../src/core/project-store.js';

describe('Project Store & Export Engine', () => {
  const mockState = {
    sceneType: 'indoor-hall',
    mountType: 'wall',
    productId: 'JLED-IND-250',
    pitchMm: 2.5,
    viewingDistanceM: 4.5,
    requestedWidthMm: 4800,
    requestedHeightMm: 2700,
    layoutPolicy: 'nearest',
    orientation: 'landscape',
    targetAspectKey: '16:9',
    shapeType: 'flat',
    mediaFitMode: 'fit',
    elevationMm: 1200,
    positionXMm: 100,
    positionZMm: -50,
    rotationYDeg: 15,
    showHuman: true,
    showGrid: false,
    showMeasurements: true
  };

  const mockSpecs = {
    buildableWidthMm: 4800,
    buildableHeightMm: 2700,
    totalAreaM2: 12.96,
    aspectRatioFormatted: '16:9',
    aspectRatioDiffPercent: 0,
    cabinetCount: 72,
    cabinetColumns: 12,
    cabinetRows: 6,
    cabinetWidthMm: 400,
    cabinetHeightMm: 450,
    resolutionX: 1920,
    resolutionY: 1080,
    totalPixels: 2073600,
    resolutionTier: { name: 'Full HD 1080p' },
    estimatedMaxPowerKw: 7.78,
    estimatedTypicalPowerKw: 2.59,
    estimatedAmps220V: 35.4,
    estimatedWeightKg: 468,
    estimatedWeightWithStructureKg: 585,
    optimalViewingDistanceM: 3.75
  };

  it('serializes state and specs into valid 4.0.0 schema data structure', () => {
    const projectData = createProjectData(mockState, mockSpecs, {
      projectName: 'Bangkok Mall Video Wall',
      client: {
        name: 'Somchai Jaidee',
        company: 'Siam Retail Group',
        phone: '0812345678',
        email: 'somchai@siamretail.co.th',
        siteLocation: 'Floor 1 Main Atrium'
      }
    });

    assert.equal(projectData.schemaVersion, CURRENT_SCHEMA_VERSION);
    assert.equal(projectData.app, 'JLED DESIGN STUDIO');
    assert.equal(projectData.project.name, 'Bangkok Mall Video Wall');
    assert.equal(projectData.project.client.name, 'Somchai Jaidee');
    assert.equal(projectData.configuration.pitchMm, 2.5);
    assert.equal(projectData.specsSummary.cabinetCount, 72);
    assert.equal(projectData.specsSummary.resolutionX, 1920);
    assert.ok(projectData.disclaimer.includes('วิศวกรโครงสร้างและทีมเทคนิค JLED ตรวจสอบ'));
  });

  it('validates project JSON correctly', () => {
    const jsonStr = serializeProject(mockState, mockSpecs);
    const result = validateProjectJson(jsonStr);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.project.schemaVersion, '4.0.0');
    assert.equal(result.project.configuration.requestedWidthMm, 4800);
  });

  it('rejects invalid or incompatible JSON files', () => {
    // Malformed JSON
    const malformed = validateProjectJson('{ invalid json');
    assert.equal(malformed.valid, false);

    // Missing schema version
    const missingVersion = validateProjectJson(JSON.stringify({ configuration: { requestedWidthMm: 100 } }));
    assert.equal(missingVersion.valid, false);
    assert.ok(missingVersion.errors[0].includes('schemaVersion'));

    // Incompatible schema version
    const wrongVersion = validateProjectJson(JSON.stringify({ schemaVersion: '3.0.0', configuration: {} }));
    assert.equal(wrongVersion.valid, false);
    assert.ok(wrongVersion.errors[0].includes('เวอร์ชัน schema'));

    // Non-positive dimensions
    const invalidDims = validateProjectJson(JSON.stringify({
      schemaVersion: '4.0.0',
      configuration: { requestedWidthMm: -500, requestedHeightMm: 2000, pitchMm: 2.5 }
    }));
    assert.equal(invalidDims.valid, false);
    assert.ok(invalidDims.errors.some(e => e.includes('requestedWidthMm')));
  });

  it('generates proposal HTML with JLED branding and engineering disclaimers', () => {
    const projectData = createProjectData(mockState, mockSpecs, {
      projectName: 'Auditorium Display',
      client: { name: 'K. Somkiat', company: 'ABC Corp' }
    });

    const html = generateProposalHtml(projectData, { name: 'JLED Standard Indoor P2.5' });
    assert.ok(html.includes('JLED DESIGN STUDIO'));
    assert.ok(html.includes('Auditorium Display'));
    assert.ok(html.includes('K. Somkiat'));
    assert.ok(html.includes('1920 x 1080 px'));
    assert.ok(html.includes('ข้อสงวนสิทธิ์ทางวิศวกรรม'));
    assert.ok(html.includes('ใบยืนยันการสั่งซื้อหรือใบเสนอราคาทางการ'));
  });
});
