/**
 * JLED DESIGN STUDIO v4.0 — Lead Capture & CRM Pipeline
 * Validates customer contact, builds CRM-ready lead payload,
 * and formats official LINE OA inquiry messages with direct deep-links.
 */

export const LINE_OA_ID = '@jled';
export const CRM_STATUS = 'PENDING_SALES_VERIFICATION';

/**
 * Validates lead contact info.
 * @param {Object} contact
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateLeadContact(contact = {}) {
  const errors = {};

  const name = contact.name?.trim() || '';
  if (!name) {
    errors.name = 'กรุณาระบุชื่อผู้ติดต่อ';
  } else if (name.length < 2) {
    errors.name = 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร';
  }

  const phone = contact.phone?.trim().replace(/[-\s]/g, '') || '';
  if (!phone) {
    errors.phone = 'กรุณาระบุเบอร์โทรศัพท์ติดต่อ';
  } else if (!/^0\d{8,9}$/.test(phone)) {
    errors.phone = 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0 และมี 9-10 หลัก)';
  }

  const email = contact.email?.trim() || '';
  if (!email) {
    errors.email = 'กรุณาระบุอีเมล';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Builds CRM-ready lead payload.
 * Strictly marks priceConfirmed: false and includes explicit disclaimer.
 * @param {Object} contact - Customer contact details
 * @param {Object} state - Current StateStore state
 * @param {Object} specs - ScreenSpecs calculated
 * @returns {Object} Structured CRM ingestion record
 */
export function generateCrmPayload(contact, state, specs) {
  const leadId = 'LEAD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    leadId,
    timestamp: new Date().toISOString(),
    channel: 'JLED_DESIGN_STUDIO_V4',
    status: CRM_STATUS,
    priceConfirmed: false,
    verificationNotice: 'รอการตรวจสอบและอนุมัติราคาจากฝ่ายขาย JLED — ระบบไม่ยืนยันราคาขายอัตโนมัติ',
    contact: {
      name: contact.name?.trim() || '',
      company: contact.company?.trim() || '',
      phone: contact.phone?.trim() || '',
      email: contact.email?.trim() || '',
      siteLocation: contact.siteLocation?.trim() || '',
      expectedInstallDate: contact.expectedInstallDate || null,
      notes: contact.notes?.trim() || ''
    },
    screenConfiguration: {
      productId: state.productId,
      pixelPitchMm: state.pitchMm,
      sceneType: state.sceneType,
      mountType: state.mountType,
      shapeType: state.shapeType || 'flat',
      requestedDimensionsMm: {
        width: state.requestedWidthMm,
        height: state.requestedHeightMm
      },
      viewingDistanceM: state.viewingDistanceM
    },
    engineeringSpecs: {
      buildableDimensionsMm: {
        width: specs.buildableWidthMm,
        height: specs.buildableHeightMm
      },
      aspectRatio: specs.aspectRatioFormatted,
      cabinetCount: specs.cabinetCount,
      cabinetMatrix: `${specs.cabinetColumns}x${specs.cabinetRows}`,
      resolution: `${specs.resolutionX}x${specs.resolutionY}`,
      totalPixels: specs.totalPixels,
      resolutionTier: specs.resolutionTier?.name || '',
      estimatedMaxPowerKw: specs.estimatedMaxPowerKw,
      estimatedWeightKg: specs.estimatedWeightKg,
      estimatedAmps220V: specs.estimatedAmps220V
    }
  };
}

/**
 * Formats a clean, readable text message for LINE OA inquiry.
 */
export function generateLineMessage(contact, state, specs) {
  const widthM = (specs.buildableWidthMm / 1000).toFixed(2);
  const heightM = (specs.buildableHeightMm / 1000).toFixed(2);
  const areaM2 = specs.totalAreaM2 != null ? specs.totalAreaM2.toFixed(2) : '-';

  return `[ขอใบเสนอราคาจอ LED — JLED DESIGN STUDIO v4.0]
━━━━━━━━━━━━━━━━━━━━
👤 ลูกค้า: ${contact.name || '-'}
🏢 บริษัท: ${contact.company || '-'}
📞 เบอร์: ${contact.phone || '-'}
📧 อีเมล: ${contact.email || '-'}
📍 สถานที่: ${contact.siteLocation || '-'}
━━━━━━━━━━━━━━━━━━━━
🖥 สเปกจอ LED ที่จัดไว้:
- รุ่น: ${state.productId} (Pixel Pitch P${state.pitchMm})
- ติดตั้ง: ${state.sceneType === 'outdoor' ? 'Outdoor' : 'Indoor'} | ${state.mountType}
- ขนาดจอจริง: ${widthM} x ${heightM} ม. (${specs.buildableWidthMm} x ${specs.buildableHeightMm} มม.)
- พื้นที่: ${areaM2} ตร.ม. | สัดส่วน ${specs.aspectRatioFormatted}
- จำนวนตู้ Cabinet: ${specs.cabinetCount} ตู้ (${specs.cabinetColumns}x${specs.cabinetRows})
- ความละเอียด: ${specs.resolutionX} x ${specs.resolutionY} px (${specs.resolutionTier?.name || 'Custom'})
- ระบบไฟประมาณ: ${specs.estimatedMaxPowerKw} kW (~${specs.estimatedAmps220V} A @220V)
- น้ำหนักจอประมาณ: ${specs.estimatedWeightKg} kg
━━━━━━━━━━━━━━━━━━━━
💬 หมายเหตุ: ${contact.notes || '-'}
⚠️ สเปกเบื้องต้น รอฝ่ายขายตรวจสอบและยืนยันราคาทางการ`;
}

/**
 * Builds official LINE OA deep-link URL.
 * Format: https://line.me/R/oaMessage/{lineId}/?{encodedMessage}
 */
export function buildLineDeepLink(contact, state, specs, lineId = LINE_OA_ID) {
  const message = generateLineMessage(contact, state, specs);
  return `https://line.me/R/oaMessage/${encodeURIComponent(lineId)}/?${encodeURIComponent(message)}`;
}
