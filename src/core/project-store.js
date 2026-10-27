/**
 * JLED DESIGN STUDIO v4.0 — Project Store & Export Engine
 * Handles project serialization/deserialization (.jled.json),
 * schema validation, integrity checking, and proposal generation.
 */

export const CURRENT_SCHEMA_VERSION = '4.0.0';
export const APP_IDENTIFIER = 'JLED DESIGN STUDIO';

/**
 * Creates an exportable project data structure from current state and specs.
 * @param {Object} state - Current StateStore state
 * @param {Object} specs - Computed ScreenSpecs
 * @param {Object} [metadata={}] - Optional metadata (projectName, customerInfo, notes)
 * @returns {Object} Clean project JSON object
 */
export function createProjectData(state, specs, metadata = {}) {
  if (!state || !specs) {
    throw new Error('createProjectData requires both state and specs');
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    app: APP_IDENTIFIER,
    exportedAt: new Date().toISOString(),
    project: {
      name: metadata.projectName?.trim() || 'JLED Display Project',
      client: {
        name: metadata.client?.name?.trim() || '',
        company: metadata.client?.company?.trim() || '',
        phone: metadata.client?.phone?.trim() || '',
        email: metadata.client?.email?.trim() || '',
        siteLocation: metadata.client?.siteLocation?.trim() || '',
        notes: metadata.client?.notes?.trim() || ''
      }
    },
    configuration: {
      sceneType: state.sceneType || 'indoor-hall',
      mountType: state.mountType || 'wall',
      productId: state.productId || 'JLED-IND-250',
      pitchMm: state.pitchMm || 2.5,
      viewingDistanceM: state.viewingDistanceM || 4,
      requestedWidthMm: state.requestedWidthMm || 4800,
      requestedHeightMm: state.requestedHeightMm || 2700,
      layoutPolicy: state.layoutPolicy || 'nearest',
      orientation: state.orientation || 'landscape',
      targetAspectKey: state.targetAspectKey || '16:9',
      shapeType: state.shapeType || 'flat',
      mediaFitMode: state.mediaFitMode || 'fit',
      elevationMm: state.elevationMm ?? 950,
      positionXMm: state.positionXMm ?? 0,
      positionZMm: state.positionZMm ?? 0,
      rotationYDeg: state.rotationYDeg ?? 0,
      showHuman: !!state.showHuman,
      showGrid: !!state.showGrid,
      showMeasurements: state.showMeasurements !== false
    },
    specsSummary: {
      buildableWidthMm: specs.buildableWidthMm,
      buildableHeightMm: specs.buildableHeightMm,
      totalAreaM2: specs.totalAreaM2,
      aspectRatioFormatted: specs.aspectRatioFormatted,
      aspectRatioDiffPercent: specs.aspectRatioDiffPercent,
      cabinetCount: specs.cabinetCount,
      cabinetColumns: specs.cabinetColumns,
      cabinetRows: specs.cabinetRows,
      cabinetWidthMm: specs.cabinetWidthMm,
      cabinetHeightMm: specs.cabinetHeightMm,
      resolutionX: specs.resolutionX,
      resolutionY: specs.resolutionY,
      totalPixels: specs.totalPixels,
      resolutionTierName: specs.resolutionTier?.name || '',
      estimatedMaxPowerKw: specs.estimatedMaxPowerKw,
      estimatedTypicalPowerKw: specs.estimatedTypicalPowerKw,
      estimatedAmps220V: specs.estimatedAmps220V,
      estimatedWeightKg: specs.estimatedWeightKg,
      estimatedWeightWithStructureKg: specs.estimatedWeightWithStructureKg,
      optimalViewingDistanceM: specs.optimalViewingDistanceM
    },
    disclaimer: 'ข้อมูลเบื้องต้นเพื่อประกอบการออกแบบ — ต้องให้วิศวกรโครงสร้างและทีมเทคนิค JLED ตรวจสอบหน้างานจริงก่อนสั่งผลิตหรือเริ่มติดตั้ง เอกสารนี้ไม่ใช่ใบยืนยันการสั่งซื้อหรือใบเสนอราคาทางการ'
  };
}

/**
 * Validates an unknown project object or JSON string.
 * @param {string|Object} input - JSON string or parsed object
 * @returns {{ valid: boolean, errors: string[], project: Object|null }}
 */
export function validateProjectJson(input) {
  const errors = [];
  let data = null;

  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch (e) {
      return { valid: false, errors: ['รูปแบบไฟล์ JSON ไม่ถูกต้อง: ' + e.message], project: null };
    }
  } else if (typeof input === 'object' && input !== null) {
    data = input;
  } else {
    return { valid: false, errors: ['ข้อมูลโครงการต้องเป็น JSON string หรือ object'], project: null };
  }

  if (!data.schemaVersion) {
    errors.push('ไม่พบ schemaVersion ในไฟล์โครงการ');
  } else if (!data.schemaVersion.startsWith('4.')) {
    errors.push(`เวอร์ชัน schema (${data.schemaVersion}) ไม่ตรงกับ JLED DESIGN STUDIO v4.x`);
  }

  if (!data.configuration || typeof data.configuration !== 'object') {
    errors.push('ไม่พบ configuration ในไฟล์โครงการ');
  } else {
    const c = data.configuration;
    if (typeof c.requestedWidthMm !== 'number' || c.requestedWidthMm <= 0) {
      errors.push('requestedWidthMm ต้องเป็นตัวเลขบวก');
    }
    if (typeof c.requestedHeightMm !== 'number' || c.requestedHeightMm <= 0) {
      errors.push('requestedHeightMm ต้องเป็นตัวเลขบวก');
    }
    if (typeof c.pitchMm !== 'number' || c.pitchMm <= 0) {
      errors.push('pitchMm ต้องเป็นตัวเลขบวก');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    project: errors.length === 0 ? data : null
  };
}

/**
 * Exports project as a downloadable .jled.json string.
 */
export function serializeProject(state, specs, metadata = {}) {
  const data = createProjectData(state, specs, metadata);
  return JSON.stringify(data, null, 2);
}

/**
 * Generates branded Proposal Document HTML suitable for printing or PDF export.
 * @param {Object} projectData - Exported project data
 * @param {Object} product - Product detail object
 * @param {string} [snapshotDataUrl] - Optional base64 snapshot image
 * @returns {string} Clean HTML string with print-optimized CSS
 */
export function generateProposalHtml(projectData, product, snapshotDataUrl = '') {
  const p = projectData.project || {};
  const c = projectData.configuration || {};
  const s = projectData.specsSummary || {};
  const client = p.client || {};

  const widthM = (s.buildableWidthMm / 1000).toFixed(2);
  const heightM = (s.buildableHeightMm / 1000).toFixed(2);
  const areaM2 = s.totalAreaM2 != null ? s.totalAreaM2.toFixed(2) : '-';

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>JLED Design Proposal — ${p.name || 'LED Display'}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Prompt', 'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #ffffff; color: #1e293b; line-height: 1.5; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2px solid #00E5FF; margin-bottom: 16px; }
    .brand-title { font-size: 22px; font-weight: 800; color: #060911; letter-spacing: -0.5px; }
    .brand-title span { color: #00E5FF; }
    .brand-subtitle { font-size: 11px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
    .meta-box { text-align: right; font-size: 11px; color: #475569; }
    .meta-box strong { color: #0f172a; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; background: #e0f2fe; color: #0369a1; text-transform: uppercase; }
    .badge-demo { background: #fef3c7; color: #92400e; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
    .card h3 { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    
    .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
    .row .label { color: #64748b; }
    .row .val { font-weight: 600; color: #0f172a; text-align: right; }
    .val-highlight { color: #0284c7; }
    
    .spec-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 12px; }
    .spec-table th, .spec-table td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    .spec-table th { background: #f1f5f9; color: #475569; font-weight: 600; }
    .spec-table td.right { text-align: right; font-weight: 600; }

    .snapshot-wrap { margin-bottom: 16px; text-align: center; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1; background: #060911; }
    .snapshot-img { max-width: 100%; max-height: 280px; object-fit: contain; display: block; margin: 0 auto; }
    
    .disclaimer { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 4px; font-size: 11px; color: #92400e; line-height: 1.5; margin-top: 14px; }
    .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
    
    @media print {
      body { background: white !important; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-title">JLED <span>DESIGN STUDIO</span></div>
      <div class="brand-subtitle">Professional LED Screen Configuration & Proposal</div>
    </div>
    <div class="meta-box">
      <div><strong>เลขที่เอกสารแบบร่าง:</strong> JLED-PROP-${Date.now().toString(36).toUpperCase()}</div>
      <div><strong>วันที่ออกเอกสาร:</strong> ${new Date(projectData.exportedAt || Date.now()).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div><strong>สถานะ:</strong> <span class="badge badge-demo">แบบร่างเพื่อการพิจารณา (Draft Proposal)</span></div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3>ข้อมูลลูกค้า / โครงการ</h3>
      <div class="row"><span class="label">ชื่อโครงการ:</span><span class="val">${escapeHtml(p.name || 'JLED Display Project')}</span></div>
      <div class="row"><span class="label">ผู้ติดต่อ / ลูกค้า:</span><span class="val">${escapeHtml(client.name || '-')}</span></div>
      <div class="row"><span class="label">บริษัท / องค์กร:</span><span class="val">${escapeHtml(client.company || '-')}</span></div>
      <div class="row"><span class="label">เบอร์โทรศัพท์:</span><span class="val">${escapeHtml(client.phone || '-')}</span></div>
      <div class="row"><span class="label">อีเมล:</span><span class="val">${escapeHtml(client.email || '-')}</span></div>
      <div class="row"><span class="label">สถานที่ติดตั้ง:</span><span class="val">${escapeHtml(client.siteLocation || '-')}</span></div>
    </div>
    <div class="card">
      <h3>สเปกสินค้าที่เลือก</h3>
      <div class="row"><span class="label">รุ่นสินค้า:</span><span class="val val-highlight">${escapeHtml(product?.name || c.productId || 'JLED Display')}</span></div>
      <div class="row"><span class="label">รหัส SKU:</span><span class="val">${escapeHtml(c.productId || '-')}</span></div>
      <div class="row"><span class="label">Pixel Pitch:</span><span class="val">P${c.pitchMm} mm</span></div>
      <div class="row"><span class="label">สภาพแวดล้อม:</span><span class="val">${c.sceneType === 'outdoor' ? 'Outdoor ภายนอกอาคาร' : 'Indoor ภายในอาคาร'}</span></div>
      <div class="row"><span class="label">ประเภทตู้ Cabinet:</span><span class="val">${s.cabinetWidthMm || '-'} x ${s.cabinetHeightMm || '-'} mm</span></div>
      <div class="row"><span class="label">รูปแบบติดตั้ง:</span><span class="val">${c.mountType === 'wall' ? 'ติดผนัง (Wall)' : c.mountType === 'stand' ? 'ขาตั้งโครงเหล็ก (Floor Stand)' : 'แขวนโครงสร้าง (Hanging)'}</span></div>
    </div>
  </div>

  ${snapshotDataUrl ? `
  <div class="snapshot-wrap">
    <img src="${snapshotDataUrl}" class="snapshot-img" alt="3D Simulation Mockup" />
  </div>
  ` : ''}

  <div class="card" style="margin-bottom: 16px;">
    <h3>ข้อกำหนดขนาดและการแสดงผล (Display Engineering Specifications)</h3>
    <table class="spec-table">
      <thead>
        <tr>
          <th>พารามิเตอร์</th>
          <th class="right">ขนาดที่ประกอบได้จริง (Buildable)</th>
          <th class="right">ขนาดที่ร้องขอ (Requested)</th>
          <th class="right">หมายเหตุวิศวกรรม</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>ขนาดจอแสดงผล (กว้าง x สูง)</td>
          <td class="right"><strong>${widthM} x ${heightM} m</strong> (${s.buildableWidthMm} x ${s.buildableHeightMm} mm)</td>
          <td class="right">${(c.requestedWidthMm / 1000).toFixed(2)} x ${(c.requestedHeightMm / 1000).toFixed(2)} m</td>
          <td class="right">${s.aspectRatioDiffPercent > 0 ? `ปรับเข้าโมดูลาร์ (${s.aspectRatioDiffPercent}% diff)` : 'ตรงตามโมดูลาร์'}</td>
        </tr>
        <tr>
          <td>พื้นที่จอรวม / สัดส่วนภาพ</td>
          <td class="right"><strong>${areaM2} ตร.ม.</strong> (${s.aspectRatioFormatted || '-'})</td>
          <td class="right">${((c.requestedWidthMm * c.requestedHeightMm) / 1e6).toFixed(2)} ตร.ม.</td>
          <td class="right">เป้าหมาย ${c.targetAspectKey || '16:9'}</td>
        </tr>
        <tr>
          <td>จำนวน Cabinet ประกอบ</td>
          <td class="right"><strong>${s.cabinetCount || 0} ตู้</strong> (${s.cabinetColumns || 0} คอลัมน์ x ${s.cabinetRows || 0} แถว)</td>
          <td class="right">-</td>
          <td class="right">ระบบจัดวางแบบ ${c.layoutPolicy || 'nearest'}</td>
        </tr>
        <tr>
          <td>ความละเอียดรวม (Resolution)</td>
          <td class="right"><strong>${s.resolutionX || 0} x ${s.resolutionY || 0} px</strong></td>
          <td class="right">${s.totalPixels ? (s.totalPixels / 1e6).toFixed(2) + ' Mpx' : '-'}</td>
          <td class="right"><span class="badge">${s.resolutionTierName || 'Custom'}</span></td>
        </tr>
        <tr>
          <td>การใช้พลังงานไฟฟ้าสูงสุด / ทั่วไป</td>
          <td class="right"><strong>${s.estimatedMaxPowerKw || '-'} kW</strong> (สูงสุด) / ${s.estimatedTypicalPowerKw || '-'} kW (เฉลี่ย)</td>
          <td class="right">~${s.estimatedAmps220V || '-'} A (220V 1-Phase)</td>
          <td class="right">ประเมินที่ 50% average video content</td>
        </tr>
        <tr>
          <td>น้ำหนักจอรวม / รวมโครงสร้างเหล็ก</td>
          <td class="right"><strong>${s.estimatedWeightKg || '-'} kg</strong> (จอล้วน)</td>
          <td class="right">~${s.estimatedWeightWithStructureKg || '-'} kg (รวมโครง)</td>
          <td class="right">รวม Safety Margin โครงเหล็ก ~25%</td>
        </tr>
        <tr>
          <td>ระยะสายตาเหมาะสม (Viewing Distance)</td>
          <td class="right"><strong>${s.optimalViewingDistanceM || '-'} เมตรขึ้นไป</strong></td>
          <td class="right">ระยะจำลอง ${c.viewingDistanceM || 4} m</td>
          <td class="right">คำนวณตามมาตรฐาน 1.5x - 2.5x Pixel Pitch</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="disclaimer">
    <strong>ข้อสงวนสิทธิ์ทางวิศวกรรม (Engineering Disclaimer):</strong><br>
    ${escapeHtml(projectData.disclaimer)}
    ระบบไฟฟ้าและโครงสร้างรับน้ำหนักต้องได้รับการคำนวณและรับรองโดยวิศวกรโยธา/วิศวกรไฟฟ้าที่ได้รับใบอนุญาตตามข้อกำหนดของอาคารสถานที่
  </div>

  <div class="footer">
    <div>JLED CO., LTD. — ผู้นำนวัตกรรมจอแสดงผล LED ครบวงจร | Tel: 02-xxx-xxxx | LINE: @jled | Website: www.jled.co.th</div>
    <div>หน้า 1 / 1 (JLED DESIGN STUDIO v4.0)</div>
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
