import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateLeadContact,
  generateCrmPayload,
  generateLineMessage,
  buildLineDeepLink,
  CRM_STATUS
} from '../src/core/lead-crm.js';

describe('Lead CRM Pipeline', () => {
  const validContact = {
    name: 'Somchai Prasert',
    company: 'Nexus Tech Co., Ltd.',
    phone: '0819876543',
    email: 'somchai@nexustech.com',
    siteLocation: 'Bangkok, Silom',
    notes: 'Need installation within 3 weeks'
  };

  const mockState = {
    productId: 'JLED-IND-250',
    pitchMm: 2.5,
    sceneType: 'indoor-hall',
    mountType: 'wall',
    shapeType: 'flat',
    requestedWidthMm: 4800,
    requestedHeightMm: 2700,
    viewingDistanceM: 4
  };

  const mockSpecs = {
    buildableWidthMm: 4800,
    buildableHeightMm: 2700,
    totalAreaM2: 12.96,
    aspectRatioFormatted: '16:9',
    cabinetCount: 72,
    cabinetColumns: 12,
    cabinetRows: 6,
    resolutionX: 1920,
    resolutionY: 1080,
    totalPixels: 2073600,
    resolutionTier: { name: 'Full HD 1080p' },
    estimatedMaxPowerKw: 7.78,
    estimatedWeightKg: 468,
    estimatedAmps220V: 35.4
  };

  it('validates correct customer contact info', () => {
    const res = validateLeadContact(validContact);
    assert.equal(res.valid, true);
    assert.equal(Object.keys(res.errors).length, 0);
  });

  it('detects invalid contact fields', () => {
    const res = validateLeadContact({
      name: '',
      phone: '12345',
      email: 'not-an-email'
    });
    assert.equal(res.valid, false);
    assert.ok(res.errors.name);
    assert.ok(res.errors.phone);
    assert.ok(res.errors.email);
  });

  it('generates CRM-ready payload with unconfirmed price status', () => {
    const payload = generateCrmPayload(validContact, mockState, mockSpecs);
    assert.ok(payload.leadId.startsWith('LEAD-'));
    assert.equal(payload.status, CRM_STATUS);
    assert.equal(payload.priceConfirmed, false);
    assert.equal(payload.contact.name, 'Somchai Prasert');
    assert.equal(payload.screenConfiguration.productId, 'JLED-IND-250');
    assert.equal(payload.engineeringSpecs.cabinetCount, 72);
    assert.ok(payload.verificationNotice.includes('รอการตรวจสอบและอนุมัติราคา'));
  });

  it('generates LINE inquiry message and deep link URL', () => {
    const lineMsg = generateLineMessage(validContact, mockState, mockSpecs);
    assert.ok(lineMsg.includes('Somchai Prasert'));
    assert.ok(lineMsg.includes('JLED-IND-250'));
    assert.ok(lineMsg.includes('4.80 x 2.70 ม.'));
    assert.ok(lineMsg.includes('72 ตู้'));
    assert.ok(lineMsg.includes('รอฝ่ายขายตรวจสอบและยืนยันราคาทางการ'));

    const deepLink = buildLineDeepLink(validContact, mockState, mockSpecs);
    assert.ok(deepLink.startsWith('https://line.me/R/oaMessage/%40jled/?'));
    assert.ok(deepLink.includes(encodeURIComponent('Somchai Prasert')));
  });
});
