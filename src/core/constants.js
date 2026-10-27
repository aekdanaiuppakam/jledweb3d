/**
 * JLED DESIGN STUDIO v4.0 — Core Constants & Conversions
 * Normalized physical units are in millimeters (mm).
 * Display conversions are provided for meters (m) and square meters (sqm).
 */

export const UNITS = {
  MM_PER_METER: 1000,
  M_TO_MM: (m) => Math.round(Number(m) * 1000),
  MM_TO_M: (mm) => Number(mm) / 1000,
  SQMM_TO_SQM: (sqmm) => Number(sqmm) / 1000000
};

export const DEFAULTS = {
  sceneType: 'boardroom',           // 'boardroom' | 'exhibition' | 'outdoor'
  mountType: 'wall',                // 'wall' | 'truss' | 'hanging'
  pitchMm: 2.5,                     // mm (1.25, 1.5, 1.8, 2, 2.5, 3, 4, 5, 6, 8, 10)
  viewingDistanceM: 5.0,            // meters (1.0 to 30.0)
  requestedWidthMm: 4000,           // 4.0 meters in mm
  requestedHeightMm: 2500,          // 2.5 meters in mm
  showHuman: true,
  showGrid: true,
  contentType: 'tech',              // 'tech' | 'conference' | 'promo' | 'custom-image' | 'custom-video'
  humanHeightMm: 1700               // 1.70 meters standard reference
};

export const SCENE_DEFINITIONS = {
  boardroom: {
    id: 'boardroom',
    nameTh: 'ห้องประชุมผู้บริหาร (Boardroom - Indoor)',
    nameEn: 'Executive Boardroom (Indoor)',
    category: 'indoor',
    icon: '💼',
    defaultElevationM: 0.95
  },
  exhibition: {
    id: 'exhibition',
    nameTh: 'บูธแสดงสินค้า / โถงห้าง (Exhibition / Mall - Indoor)',
    nameEn: 'Exhibition Hall / Mall (Indoor)',
    category: 'indoor',
    icon: '✨',
    defaultElevationM: 0.85
  },
  outdoor: {
    id: 'outdoor',
    nameTh: 'ป้ายหน้าอาคารริมถนน (Outdoor Billboard)',
    nameEn: 'Outdoor Street Billboard',
    category: 'outdoor',
    icon: '🌆',
    defaultElevationM: 1.8
  }
};

export const MOUNT_DEFINITIONS = {
  wall: {
    id: 'wall',
    nameTh: 'ยึดติดผนัง (Wall Mount)',
    nameEn: 'Wall Mount Bracket System',
    icon: '🧱'
  },
  truss: {
    id: 'truss',
    nameTh: 'ขาตั้งพื้น / โครงถัก (Ground Stack / Truss)',
    nameEn: 'Ground Stack / Aluminum Truss Rig',
    icon: '🏗️'
  },
  hanging: {
    id: 'hanging',
    nameTh: 'แขวนสลิงบนเพดาน/คาน (Hanging Rig)',
    nameEn: 'Overhead Flying / Hanging Bar Rig',
    icon: '⛓️'
  }
};

export const CONTENT_PRESETS = {
  tech: {
    id: 'tech',
    labelTh: '3D Motion',
    subtitleTh: 'JLED Cyber Ad',
    icon: '🚀'
  },
  conference: {
    id: 'conference',
    labelTh: 'งานสัมมนา',
    subtitleTh: 'Keynote Live',
    icon: '📊'
  },
  promo: {
    id: 'promo',
    labelTh: 'โปรโมชัน',
    subtitleTh: 'Vibrant Retail',
    icon: '🔥'
  }
};

export const PITCH_PRESETS_MM = [1.25, 1.5, 1.8, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0];

export const ASPECT_RATIO_PRESETS = [
  { id: '16:9', label: '16 : 9', sublabel: 'มาตรฐาน', widthMm: 4000, heightMm: 2250 },
  { id: '21:9', label: '21 : 9', sublabel: 'Banner', widthMm: 7000, heightMm: 3000 },
  { id: '9:16', label: '9 : 16', sublabel: 'Poster', widthMm: 2000, heightMm: 3500 }
];

export const BOUNDS = {
  MIN_WIDTH_MM: 1000,
  MAX_WIDTH_MM: 20000,
  MIN_HEIGHT_MM: 1000,
  MAX_HEIGHT_MM: 12000,
  MIN_DISTANCE_M: 1.0,
  MAX_DISTANCE_M: 30.0
};

// Formatting helpers
export function formatM(mm, decimals = 2) {
  const num = Number(mm) / UNITS.MM_PER_METER;
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
}

export function formatSqm(sqm, decimals = 2) {
  const num = Number(sqm);
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
}

export function formatKw(kw, decimals = 2) {
  const num = Number(kw);
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
}
