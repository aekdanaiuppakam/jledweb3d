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
  // Indoor Environments (4)
  boardroom: {
    id: 'boardroom',
    nameTh: 'ห้องประชุมผู้บริหาร (Executive Boardroom)',
    nameEn: 'Executive Boardroom (Indoor)',
    category: 'indoor',
    icon: '💼',
    defaultElevationM: 0.95,
    defaultViewingDistanceM: 4.5,
    recommendedMount: 'wall',
    defaultLighting: 'cool',
    descriptionTh: 'ห้องประชุมระดับ C-Level โต๊ะประชุมไม้พรีเมียม ผนังระแนงไม้ และเก้าอี้เพื่อสุขภาพ'
  },
  auditorium: {
    id: 'auditorium',
    nameTh: 'หอประชุมโรงเรียน / มหาวิทยาลัย (School Auditorium)',
    nameEn: 'School Auditorium (Indoor)',
    category: 'indoor',
    icon: '🎓',
    defaultElevationM: 1.4,
    defaultViewingDistanceM: 8.0,
    recommendedMount: 'wall',
    defaultLighting: 'warm',
    descriptionTh: 'หอประชุมใหญ่ ที่นั่งสโลปหลายแถว เวทีไม้พาเกต์ ม่านกำมะหยี่ และแผงอคูสติก'
  },
  ballroom: {
    id: 'ballroom',
    nameTh: 'ห้องบอลรูมโรงแรมหรู (Luxury Hotel Ballroom)',
    nameEn: 'Luxury Hotel Ballroom (Indoor)',
    category: 'indoor',
    icon: '👑',
    defaultElevationM: 1.2,
    defaultViewingDistanceM: 7.0,
    recommendedMount: 'truss',
    defaultLighting: 'warm',
    descriptionTh: 'ห้องจัดเลี้ยง 5 ดาว แชนเดอเลียร์คริสตัลระยิบระยับ โต๊ะจีนจัดเลี้ยง และพรมลายหลุยส์'
  },
  'mall-atrium': {
    id: 'mall-atrium',
    nameTh: 'โถงกลางศูนย์การค้า (Shopping Mall Atrium)',
    nameEn: 'Shopping Mall Atrium (Indoor)',
    category: 'indoor',
    icon: '🛍️',
    defaultElevationM: 2.2,
    defaultViewingDistanceM: 9.0,
    recommendedMount: 'hanging',
    defaultLighting: 'cool',
    descriptionTh: 'โถงอาคารพาณิชย์เพดานสูง บันไดเลื่อนไขว้ ระเบียงราวกระจก 3 ชั้น และพื้นหินอ่อนเงาวับ'
  },

  // Outdoor Environments (4)
  billboard: {
    id: 'billboard',
    nameTh: 'ป้ายโฆษณา LED ริมทางหลวง (Roadside LED Billboard)',
    nameEn: 'Roadside Highway Billboard (Outdoor)',
    category: 'outdoor',
    icon: '🛣️',
    defaultElevationM: 4.5,
    defaultViewingDistanceM: 14.0,
    recommendedMount: 'truss',
    defaultLighting: 'night',
    descriptionTh: 'ถนนทางหลวง 4 เลน เสาป้ายทาวเวอร์เดี่ยวเหล็กกล้า ราวการ์ดเรล และไฟส่องถนน'
  },
  'school-entrance': {
    id: 'school-entrance',
    nameTh: 'ซุ้มประตูทางเข้าโรงเรียน (School Entrance Gate)',
    nameEn: 'School Entrance Plaza (Outdoor)',
    category: 'outdoor',
    icon: '🏫',
    defaultElevationM: 1.8,
    defaultViewingDistanceM: 6.5,
    recommendedMount: 'wall',
    defaultLighting: 'daylight',
    descriptionTh: 'ซุ้มประตูด้านหน้า เสาธงชาติ ซุ้มอิฐป้ายชื่อสถาบัน ทางคนข้าม และไม้พุ่มตกแต่ง'
  },
  'gov-building': {
    id: 'gov-building',
    nameTh: 'ลานหน้าอาคารศูนย์ราชการ (Government Building)',
    nameEn: 'Government Civic Plaza (Outdoor)',
    category: 'outdoor',
    icon: '🏛️',
    defaultElevationM: 2.0,
    defaultViewingDistanceM: 10.0,
    recommendedMount: 'wall',
    defaultLighting: 'daylight',
    descriptionTh: 'ลานหน้าอาคารสถาปัตยกรรมเสาโอ่อ่า บันไดหินแกรนิต ลานพิธีการ และเสาธงคู่'
  },
  'building-facade': {
    id: 'building-facade',
    nameTh: 'ฟาซาดอาคารพาณิชย์กระจกสูง (Commercial Building Facade)',
    nameEn: 'Commercial Skyscraper Facade (Outdoor)',
    category: 'outdoor',
    icon: '🏢',
    defaultElevationM: 3.5,
    defaultViewingDistanceM: 12.0,
    recommendedMount: 'wall',
    defaultLighting: 'sunset',
    descriptionTh: 'ฐานตึกระฟ้าม่านกระจกสะท้อน ชายคากันสาดเหล็กโมเดิร์น ทางเท้าคนเดิน และขอบถนน'
  },

  // Event & Specialty Environments (4)
  'concert-stage': {
    id: 'concert-stage',
    nameTh: 'เวทีคอนเสิร์ตและเฟสติวัล (Mega Concert Stage)',
    nameEn: 'Mega Concert Stage (Event)',
    category: 'event',
    icon: '🎸',
    defaultElevationM: 1.8,
    defaultViewingDistanceM: 10.0,
    recommendedMount: 'truss',
    defaultLighting: 'night',
    descriptionTh: 'โครงทรัสอะลูมิเนียมขนาดใหญ่ ลำโพงไลน์อาร์เรย์ ไฟมูฟวิ่งเฮดพุ่งลำแสง และเวทีซับวูฟเฟอร์'
  },
  'exhibition-booth': {
    id: 'exhibition-booth',
    nameTh: 'บูธงานแสดงสินค้านานาชาติ (Exhibition Booth)',
    nameEn: 'Exhibition Trade Booth (Event)',
    category: 'event',
    icon: '✨',
    defaultElevationM: 0.85,
    defaultViewingDistanceM: 4.5,
    recommendedMount: 'wall',
    defaultLighting: 'cool',
    descriptionTh: 'บูธนิทรรศการพรีเมียม พื้นพรมเทา เคาน์เตอร์ไฟนีออนเรืองแสง JLED ป้ายแขวนลอย'
  },
  'retail-store': {
    id: 'retail-store',
    nameTh: 'หน้าร้านค้ากระจก / จอโปร่งแสง (Retail Store / Transparent)',
    nameEn: 'Retail Storefront / Transparent LED (Specialty)',
    category: 'event',
    icon: '💎',
    defaultElevationM: 1.0,
    defaultViewingDistanceM: 4.0,
    recommendedMount: 'hanging',
    defaultLighting: 'warm',
    descriptionTh: 'หน้าร้านบูทีคกระจกใสบานใหญ่ หุ่นโชว์สินค้า ไฟแทร็กไลท์สปอตไลท์ และพื้นไม้ก้างปลา'
  },
  'corporate-lobby': {
    id: 'corporate-lobby',
    nameTh: 'ล็อบบี้สำนักงานใหญ่ / ป้าย Kiosk (Corporate Lobby / Kiosk)',
    nameEn: 'Corporate HQ Reception Lobby (Specialty)',
    category: 'event',
    icon: '🛎️',
    defaultElevationM: 0.6,
    defaultViewingDistanceM: 5.0,
    recommendedMount: 'wall',
    defaultLighting: 'cool',
    descriptionTh: 'โถงต้อนรับหรูหรา 2 ชั้น ผนังหินอ่อนลายบุ๊คแมตช์ ประตูหมุนกั้นทางเข้า และเสากลมขนาดใหญ่'
  },

  // Legacy Aliases for 100% Backward Compatibility
  exhibition: {
    id: 'exhibition',
    aliasOf: 'exhibition-booth',
    nameTh: 'บูธแสดงสินค้า / โถงห้าง (Exhibition Hall)',
    nameEn: 'Exhibition Hall (Legacy)',
    category: 'indoor',
    icon: '✨',
    defaultElevationM: 0.85,
    defaultViewingDistanceM: 5.0,
    recommendedMount: 'wall',
    defaultLighting: 'cool'
  },
  outdoor: {
    id: 'outdoor',
    aliasOf: 'billboard',
    nameTh: 'ป้ายหน้าอาคารริมถนน (Outdoor Billboard)',
    nameEn: 'Outdoor Street Billboard (Legacy)',
    category: 'outdoor',
    icon: '🌆',
    defaultElevationM: 3.5,
    defaultViewingDistanceM: 12.0,
    recommendedMount: 'truss',
    defaultLighting: 'night'
  }
};

export const LIGHTING_PRESETS = {
  daylight: {
    id: 'daylight',
    nameTh: 'แสงกลางวันธรรมชาติ',
    nameEn: 'Daylight',
    icon: '☀️',
    skyColor: 0x87ceeb,
    groundColor: 0x1e293b,
    ambientColor: 0xdbeafe,
    ambientIntensity: 0.85,
    dirLightColor: 0xfffbeb,
    dirLightIntensity: 1.35,
    dirLightPos: [16, 26, 18],
    fogColor: 0x87ceeb,
    fogDensity: 0.005,
    exposure: 1.05
  },
  sunset: {
    id: 'sunset',
    nameTh: 'แสงอาทิตย์อัสดง',
    nameEn: 'Sunset',
    icon: '🌅',
    skyColor: 0x3d1c24,
    groundColor: 0x181014,
    ambientColor: 0xfda4af,
    ambientIntensity: 0.65,
    dirLightColor: 0xff7733,
    dirLightIntensity: 1.55,
    dirLightPos: [-22, 10, 15],
    fogColor: 0x3d1c24,
    fogDensity: 0.008,
    exposure: 1.15
  },
  night: {
    id: 'night',
    nameTh: 'กลางคืนและไฟส่องสว่าง',
    nameEn: 'Night',
    icon: '🌙',
    skyColor: 0x03060f,
    groundColor: 0x050811,
    ambientColor: 0x1e293b,
    ambientIntensity: 0.35,
    dirLightColor: 0x38bdf8,
    dirLightIntensity: 0.45,
    dirLightPos: [10, 16, 12],
    fogColor: 0x03060f,
    fogDensity: 0.012,
    exposure: 1.25
  },
  warm: {
    id: 'warm',
    nameTh: 'ไฟวอร์มไวท์ 3000K',
    nameEn: 'Warm 3000K',
    icon: '🕯️',
    skyColor: 0x140f0b,
    groundColor: 0x0f0b08,
    ambientColor: 0xfef3c7,
    ambientIntensity: 0.6,
    dirLightColor: 0xfbbf24,
    dirLightIntensity: 0.95,
    dirLightPos: [8, 14, 10],
    fogColor: 0x140f0b,
    fogDensity: 0.006,
    exposure: 1.1
  },
  cool: {
    id: 'cool',
    nameTh: 'ไฟขาวโมเดิร์น 5000K',
    nameEn: 'Cool 5000K',
    icon: '💡',
    skyColor: 0x090e1a,
    groundColor: 0x060911,
    ambientColor: 0xe2e8f0,
    ambientIntensity: 0.7,
    dirLightColor: 0xf8fafc,
    dirLightIntensity: 1.1,
    dirLightPos: [10, 16, 12],
    fogColor: 0x090e1a,
    fogDensity: 0.005,
    exposure: 1.0
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
