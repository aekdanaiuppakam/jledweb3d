/**
 * Outdoor architectural settings for the independent LED assembly.
 * World dimensions are metres. The display and its mounting hardware are built
 * elsewhere; these environments leave a clear opening in front of its face.
 */

function dimensions(state = {}, specs = {}) {
  return {
    width: Math.max(1, Number(specs.actualWidthM) || 4),
    height: Math.max(1, Number(specs.actualHeightM) || 2.5),
    elevation: Math.max(0, (Number(state.elevationMm ?? 1000) || 0) / 1000),
    x: (Number(state.positionXMm) || 0) / 1000,
    z: (Number(state.positionZMm) || 0) / 1000
  };
}

function surfaceTexture(kind) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = kind === 'brick' ? '#dedbd5' : '#e1e1df';
  ctx.fillRect(0, 0, 256, 256);
  let seed = kind === 'grass' ? 31 : kind === 'asphalt' ? 73 : 19;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  if (kind === 'brick') {
    ctx.strokeStyle = 'rgba(65,58,54,0.22)';
    ctx.lineWidth = 3;
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
      for (let x = (Math.floor(y / 32) % 2 ? -32 : 0); x < 256; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 32);
        ctx.stroke();
      }
    }
  }
  const marks = kind === 'grass' ? 2200 : 1100;
  for (let i = 0; i < marks; i++) {
    const alpha = kind === 'grass' ? 0.1 : 0.045;
    ctx.fillStyle = random() > 0.5 ? 'rgba(255,255,255,' + alpha + ')' : 'rgba(30,28,24,' + alpha + ')';
    const size = kind === 'grass' ? 2 + random() * 3 : 1 + random() * 2;
    ctx.fillRect(random() * 256, random() * 256, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === 'brick' ? 2 : 6, kind === 'brick' ? 2 : 6);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function materials() {
  const result = {
    stone: new THREE.MeshStandardMaterial({ color: 0x9a9c9b, roughness: 0.88 }),
    lightStone: new THREE.MeshStandardMaterial({ color: 0xb0b1aa, roughness: 0.84 }),
    darkStone: new THREE.MeshStandardMaterial({ color: 0x565e60, roughness: 0.9 }),
    paving: new THREE.MeshStandardMaterial({ color: 0x737b7d, roughness: 0.94 }),
    asphalt: new THREE.MeshStandardMaterial({ color: 0x30383d, roughness: 0.96 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x465c47, roughness: 1 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x66727a, roughness: 0.52, metalness: 0.65 }),
    darkSteel: new THREE.MeshStandardMaterial({ color: 0x303b40, roughness: 0.6, metalness: 0.5 }),
    brick: new THREE.MeshStandardMaterial({ color: 0x805e51, roughness: 0.94 }),
    warmWall: new THREE.MeshStandardMaterial({ color: 0xb5aa98, roughness: 0.9 }),
    glazing: new THREE.MeshStandardMaterial({ color: 0x526e7a, roughness: 0.33, metalness: 0.22 }),
    glassDark: new THREE.MeshStandardMaterial({ color: 0x3a5360, roughness: 0.3, metalness: 0.28 }),
    glassAlt: new THREE.MeshStandardMaterial({ color: 0x49636d, roughness: 0.38, metalness: 0.24 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x3e6048, roughness: 1 }),
    leafLight: new THREE.MeshStandardMaterial({ color: 0x577657, roughness: 1 }),
    bark: new THREE.MeshStandardMaterial({ color: 0x69594b, roughness: 1 }),
    marking: new THREE.MeshStandardMaterial({ color: 0xc8c9bd, roughness: 0.9 }),
    amberMarking: new THREE.MeshStandardMaterial({ color: 0xb9a267, roughness: 0.9 })
  };
  for (const kind of ['brick', 'paving', 'asphalt', 'grass']) {
    const texture = surfaceTexture(kind);
    if (texture) result[kind].map = texture;
  }
  return result;
}

function box(group, w, h, d, material, x, y, z, cast = false) {
  if (w <= 0 || h <= 0 || d <= 0) return null;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function cylinder(group, top, bottom, height, material, x, y, z, segments = 16, cast = false) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function horizontal(group, w, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function tree(group, m, x, z, scale = 1) {
  const trunkHeight = 2.7 * scale;
  cylinder(group, 0.12 * scale, 0.2 * scale, trunkHeight, m.bark, x, trunkHeight / 2, z, 10, true);
  const canopyGeo = new THREE.SphereGeometry(1, 12, 9);
  const clusters = [
    [-0.7, 3.2, 0, 1.25], [0.65, 3.35, 0.15, 1.15],
    [0, 4.15, -0.1, 1.35], [0, 3.4, 0.65, 1.05]
  ];
  clusters.forEach(([dx, dy, dz, radius], index) => {
    const mesh = new THREE.Mesh(canopyGeo, index % 2 ? m.leafLight : m.leaf);
    mesh.position.set(x + dx * scale, dy * scale, z + dz * scale);
    mesh.scale.set(radius * scale, radius * 0.78 * scale, radius * scale);
    mesh.castShadow = true;
    group.add(mesh);
  });
}

function lamp(group, m, x, z, height = 7) {
  cylinder(group, 0.07, 0.12, height, m.steel, x, height / 2, z, 12, true);
  box(group, 0.34, 0.09, 1.1, m.steel, x, height - 0.08, z + 0.5);
  box(group, 0.3, 0.055, 0.58, new THREE.MeshStandardMaterial({
    color: 0xc0c4bc, emissive: 0x605a4c, emissiveIntensity: 0.12, roughness: 0.8
  }), x, height - 0.16, z + 0.86);
}

function facadeWindow(group, m, x, y, z, w, h) {
  box(group, w + 0.1, h + 0.1, 0.07, m.darkSteel, x, y, z - 0.04);
  box(group, w, h, 0.04, m.glazing, x, y, z);
  box(group, 0.035, h, 0.04, m.steel, x, y, z + 0.025);
  box(group, w, 0.035, 0.04, m.steel, x, y, z + 0.026);
}

function wallAroundOpening(group, material, halfW, height, depth, z, left, right, bottom, top) {
  const l = Math.max(-halfW, left);
  const r = Math.min(halfW, right);
  const b = Math.max(0, Math.min(height, bottom));
  const t = Math.max(b, Math.min(height, top));
  box(group, l + halfW, height, depth, material, (l - halfW) / 2, height / 2, z, true);
  box(group, halfW - r, height, depth, material, (r + halfW) / 2, height / 2, z, true);
  box(group, r - l, b, depth, material, (l + r) / 2, b / 2, z, true);
  box(group, r - l, height - t, depth, material, (l + r) / 2, (height + t) / 2, z, true);
}

/** Roadside highway billboard with a rear monopole, service platform and road. */
export function buildBillboard(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const s = dimensions(state, specs);
  const m = materials();
  const siteW = Math.max(50, s.width + Math.abs(s.x) * 2 + 24 + s.elevation * 0.6);
  const leftClear = s.x - s.width / 2 - 1.4;
  const rightClear = s.x + s.width / 2 + 1.4;
  const groundDepth = Math.max(58, 58 + s.elevation * 1.0);

  horizontal(group, siteW, groundDepth, m.grass, 0, 0, 8);
  horizontal(group, siteW, 13.6, m.asphalt, 0, 0.015, 11);
  horizontal(group, siteW, 0.16, m.marking, 0, 0.025, 4.35);
  horizontal(group, siteW, 0.16, m.marking, 0, 0.025, 17.65);
  horizontal(group, siteW, 0.12, m.amberMarking, 0, 0.025, 11);
  for (let x = -siteW / 2 + 3; x < siteW / 2; x += 6) {
    horizontal(group, 3, 0.13, m.marking, x, 0.027, 7.6);
    horizontal(group, 3, 0.13, m.marking, x, 0.027, 14.4);
  }

  // The foundation, pole, and rear service deck remain behind the display.
  // When elevated up to 70m, the monopole scales gracefully for structural proportion.
  const pylonHeight = Math.max(1.2, s.elevation + s.height * 0.62);
  const supportX = s.x;
  const poleScale = Math.min(2.5, 1.0 + s.elevation * 0.022);
  const topRadius = 0.43 * poleScale;
  const bottomRadius = 0.65 * poleScale;
  cylinder(group, topRadius, bottomRadius, pylonHeight, m.darkSteel, supportX, pylonHeight / 2, s.z - 1.5, 24, true);
  cylinder(group, bottomRadius * 1.35, bottomRadius * 1.5, Math.max(0.5, 0.5 * poleScale), m.stone, supportX, (0.5 * poleScale) / 2, s.z - 1.5, 24);
  const deckY = Math.max(0.18, s.elevation - 0.22);
  box(group, s.width + 1.0, 0.12, 0.95, m.darkSteel, supportX, deckY, s.z - 1.2, true);
  box(group, s.width + 0.85, 0.055, 0.055, m.steel, supportX, deckY + 0.9, s.z - 1.62);
  for (let x = -s.width / 2; x <= s.width / 2 + 0.01; x += Math.max(0.9, s.width / 8)) {
    box(group, 0.045, 0.9, 0.045, m.steel, supportX + x, deckY + 0.45, s.z - 1.62);
  }

  // Guardrail wings keep a clear sightline even for a low screen.
  const makeGuardrail = (start, end) => {
    if (end - start < 0.5) return;
    box(group, end - start, 0.18, 0.08, m.steel, (start + end) / 2, 0.72, 3.75);
    for (let x = start + 0.3; x < end; x += 2.5) box(group, 0.07, 0.76, 0.08, m.darkSteel, x, 0.38, 3.75);
  };
  makeGuardrail(-siteW / 2, leftClear);
  makeGuardrail(rightClear, siteW / 2);
  const lampOffset = Math.max(8, s.width / 2 + Math.abs(s.x) + 4);
  lamp(group, m, -lampOffset, 3.8, 7.5);
  lamp(group, m, lampOffset, 3.8, 7.5);
  tree(group, m, -siteW / 2 + 3, -6, 0.85);
  tree(group, m, siteW / 2 - 3, -8, 1.0);
  tree(group, m, -siteW / 2 + 8, -13, 0.7);
  [-1, 1].forEach((side) => {
    const x = side * (Math.max(11, s.width / 2 + Math.abs(s.x) + 6));
    box(group, 5.5, 3.5, 4, m.darkStone, x, 1.75, -18);
    box(group, 5.7, 0.16, 4.2, m.stone, x, 3.58, -18);
    for (let dx = -1.8; dx <= 1.8; dx += 1.2) {
      facadeWindow(group, m, x + dx, 2.2, -15.96, 0.75, 1.15);
    }
  });
}

/** Campus entrance, masonry monument, railings and landscaped arrival plaza. */
export function buildSchoolEntrance(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const s = dimensions(state, specs);
  const m = materials();
  const openLeft = s.x - s.width / 2 - 1.1;
  const openRight = s.x + s.width / 2 + 1.1;
  const siteHalf = Math.max(11, Math.abs(s.x) + s.width / 2 + 7);
  const campusW = siteHalf * 2 + 3;

  horizontal(group, campusW + 8, 38, m.paving, 0, 0, 7);
  horizontal(group, 7.5, 23, m.asphalt, 0, 0.012, 10);
  for (let x = -3; x <= 3; x += 1.2) horizontal(group, 0.65, 2.8, m.marking, x, 0.025, 8.5);

  // A low school building provides context behind the sign wall.
  const buildingH = Math.max(6.5, s.elevation + s.height + 1.2);
  box(group, campusW, buildingH, 3, m.warmWall, 0, buildingH / 2, -9, true);
  box(group, campusW + 0.4, 0.35, 3.6, m.brick, 0, buildingH + 0.05, -9);
  box(group, campusW, 0.22, 3.1, m.lightStone, 0, 3.3, -9);
  const numWindows = Math.max(2, Math.floor((campusW - 3) / 2.6));
  for (let i = 0; i < numWindows; i++) {
    const x = -campusW / 2 + 1.5 + i * (campusW - 3) / Math.max(1, numWindows - 1);
    facadeWindow(group, m, x, 2.0, -7.45, 1.28, 1.9);
    facadeWindow(group, m, x, Math.min(buildingH - 1.2, 4.8), -7.45, 1.28, 1.65);
  }

  const monumentW = s.width + 1.6;
  const monumentH = Math.max(3.4, s.elevation + s.height + 0.6);
  box(group, monumentW, monumentH, 0.5, m.darkStone, s.x, monumentH / 2, s.z - 0.52, true);
  box(group, monumentW + 0.18, 0.12, 0.58, m.lightStone, s.x, monumentH + 0.06, s.z - 0.52);
  box(group, monumentW + 0.12, 0.16, 0.62, m.brick, s.x, 0.08, s.z - 0.52);

  // Gateway piers and open steel railings flank the display instead of covering it.
  [openLeft - 0.65, openRight + 0.65].forEach((x) => {
    box(group, 0.85, 3.25, 0.85, m.brick, x, 1.625, 1.5, true);
    box(group, 1.04, 0.18, 1.04, m.lightStone, x, 3.34, 1.5);
    box(group, 1.06, 0.18, 1.06, m.darkStone, x, 0.09, 1.5);
    cylinder(group, 0.15, 0.15, 0.22, m.lightStone, x, 3.53, 1.5, 12);
  });
  const fence = (start, end) => {
    if (end <= start) return;
    box(group, end - start, 0.055, 0.055, m.darkSteel, (start + end) / 2, 1.8, 1.5);
    box(group, end - start, 0.055, 0.055, m.darkSteel, (start + end) / 2, 0.38, 1.5);
    for (let x = start + 0.1; x < end; x += 0.22) box(group, 0.032, 1.75, 0.032, m.darkSteel, x, 0.96, 1.5);
  };
  fence(-siteHalf, openLeft - 1.1);
  fence(openRight + 1.1, siteHalf);
  [-siteHalf + 1.6, siteHalf - 1.6].forEach((x, index) => {
    box(group, 2.4, 0.45, 1.2, m.stone, x, 0.225, 3.3);
    box(group, 2.15, 0.5, 0.95, index ? m.leaf : m.leafLight, x, 0.68, 3.3);
    tree(group, m, x, -3.4, 0.7);
  });
  cylinder(group, 0.045, 0.075, 8, m.steel, siteHalf - 1.0, 4, 5, 12, true);
}

/** Civic facade with a clear central display bay and flanking entrances. */
export function buildGovBuilding(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const s = dimensions(state, specs);
  const m = materials();
  const halfW = Math.max(10.5, Math.abs(s.x) + s.width / 2 + 6);
  const buildingW = halfW * 2;
  const buildingH = Math.max(8.5, s.elevation + s.height + 1.8);
  const clearLeft = s.x - s.width / 2 - 1.3;
  const clearRight = s.x + s.width / 2 + 1.3;

  horizontal(group, buildingW + 20, 36, m.paving, 0, 0, 9);
  // Paving joints add scale without creating a large mesh per tile.
  for (let z = 3; z <= 19; z += 2.2) box(group, buildingW + 10, 0.008, 0.025, m.stone, 0, 0.01, z);
  for (let x = -halfW - 4; x <= halfW + 4; x += 2.2) box(group, 0.025, 0.008, 20, m.stone, x, 0.012, 10);

  const openingLeft = s.x - s.width / 2 - 0.8;
  const openingRight = s.x + s.width / 2 + 0.8;
  const openingBottom = Math.max(0, s.elevation - 0.35);
  const openingTop = s.elevation + s.height + 0.4;
  wallAroundOpening(group, m.darkStone, halfW, buildingH, 1.0, -1.0,
    openingLeft, openingRight, openingBottom, openingTop);
  box(group, buildingW + 0.4, 0.42, 1.5, m.lightStone, 0, buildingH - 0.21, -0.9);
  box(group, buildingW + 0.8, 0.28, 1.75, m.stone, 0, buildingH + 0.14, -0.9);
  box(group, s.width + 1.3, Math.max(2.8, s.elevation + s.height + 0.35), 0.06,
    m.stone, s.x, Math.max(2.8, s.elevation + s.height + 0.35) / 2, s.z - 0.43);

  // Symmetric stone columns are entirely outside the screen's opening.
  for (let side = -1; side <= 1; side += 2) {
    const edge = side < 0 ? clearLeft : clearRight;
    for (let n = 0; n < 3; n++) {
      const x = edge + side * (0.9 + n * 2.35);
      if (Math.abs(x) > halfW - 0.7) continue;
      const baseY = 0.16;
      const shaftH = buildingH - 1.0;
      cylinder(group, 0.31, 0.38, shaftH, m.lightStone, x, baseY + shaftH / 2, -0.05, 20, true);
      box(group, 0.88, 0.22, 0.86, m.stone, x, 0.11, -0.05);
      box(group, 0.9, 0.24, 0.9, m.lightStone, x, buildingH - 0.72, -0.05);
    }
  }

  // Entrance doors and shallow stair wings sit beside, rather than in front of, the LED.
  const sideEntrance = (start, end) => {
    const width = end - start;
    if (width < 2) return;
    const x = (start + end) / 2;
    const doorW = Math.min(2.8, width - 0.5);
    facadeWindow(group, m, x, 1.8, -0.43, doorW, 3.2);
    box(group, doorW + 0.4, 0.12, 0.3, m.lightStone, x, 3.48, -0.28);
    for (let n = 0; n < 3; n++) {
      const depth = 0.55;
      const height = 0.16 * (n + 1);
      box(group, width, height, depth, m.stone, x, height / 2, 2.0 - n * depth);
    }
  };
  sideEntrance(-halfW + 0.5, clearLeft - 0.2);
  sideEntrance(clearRight + 0.2, halfW - 0.5);
  [-halfW + 1.2, halfW - 1.2].forEach((x) => {
    cylinder(group, 0.045, 0.07, 8, m.steel, x, 4, 4.3, 12, true);
    cylinder(group, 0.28, 0.34, 0.25, m.stone, x, 0.125, 4.3, 16);
  });
}

/** Commercial glass facade with side entrance canopies and pedestrian street. */
export function buildBuildingFacade(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const s = dimensions(state, specs);
  const m = materials();
  const halfW = Math.max(11, Math.abs(s.x) + s.width / 2 + 6);
  const buildingW = halfW * 2;
  const buildingH = Math.max(13, s.elevation + s.height + 3);
  const clearLeft = s.x - s.width / 2 - 1.2;
  const clearRight = s.x + s.width / 2 + 1.2;
  const openingLeft = s.x - s.width / 2 - 0.6;
  const openingRight = s.x + s.width / 2 + 0.6;
  const openingBottom = Math.max(0, s.elevation - 0.4);
  const openingTop = s.elevation + s.height + 0.4;

  horizontal(group, buildingW + 20, 35, m.paving, 0, 0, 8);
  horizontal(group, buildingW + 20, 8, m.asphalt, 0, 0.015, 13);
  box(group, buildingW + 20, 0.14, 0.24, m.lightStone, 0, 0.07, 8.95);
  for (let x = -halfW - 7; x < halfW + 7; x += 6) horizontal(group, 3, 0.12, m.marking, x, 0.025, 13);

  // A muted glass curtain wall is behind the LED, with individual panes and mullions.
  wallAroundOpening(group, m.darkStone, halfW, buildingH, 1.0, -1.1,
    openingLeft, openingRight, openingBottom, openingTop);
  wallAroundOpening(group, m.glassDark, halfW - 0.15, buildingH - 0.25, 0.05, -0.56,
    openingLeft, openingRight, openingBottom, openingTop);
  for (let y = 1.65, row = 0; y < buildingH - 0.3; y += 3.3, row++) {
    for (let x = -halfW + 1.9, col = 0; x < halfW - 0.5; x += 2.25, col++) {
      const paneH = Math.min(3.13, buildingH - y + 1.5);
      if (x + 1.06 > openingLeft && x - 1.06 < openingRight &&
          y + paneH / 2 > openingBottom && y - paneH / 2 < openingTop) continue;
      box(group, 2.12, paneH, 0.025, (row + col) % 3 ? m.glassDark : m.glassAlt, x, y, -0.53);
    }
  }
  for (let x = -halfW + 0.8; x < halfW; x += 2.25) {
    if (x > openingLeft && x < openingRight) {
      box(group, 0.075, openingBottom, 0.08, m.darkSteel, x, openingBottom / 2, -0.5);
      box(group, 0.075, buildingH - openingTop, 0.08, m.darkSteel, x, (buildingH + openingTop) / 2, -0.5);
    } else {
      box(group, 0.075, buildingH, 0.08, m.darkSteel, x, buildingH / 2, -0.5);
    }
  }
  for (let y = 3.3; y < buildingH; y += 3.3) {
    if (y > openingBottom && y < openingTop) {
      box(group, openingLeft + halfW, 0.09, 0.08, m.darkSteel, (openingLeft - halfW) / 2, y, -0.5);
      box(group, halfW - openingRight, 0.09, 0.08, m.darkSteel, (openingRight + halfW) / 2, y, -0.5);
    } else {
      box(group, buildingW, 0.09, 0.08, m.darkSteel, 0, y, -0.5);
    }
  }
  box(group, s.width + 1.05, s.height + 0.9, 0.07, m.darkSteel,
    s.x, s.elevation + s.height / 2, s.z - 0.42);

  // Two individual entrance canopies leave the central display aperture clear.
  const entrance = (start, end) => {
    const w = end - start;
    if (w < 2.1) return;
    const x = (start + end) / 2;
    const doorW = Math.min(3.2, w - 0.5);
    facadeWindow(group, m, x, 1.7, -0.42, doorW, 3.1);
    box(group, w - 0.15, 0.12, 1.8, m.darkSteel, x, 3.35, 0.42, true);
    box(group, w - 0.3, 0.035, 1.6, m.glazing, x, 3.43, 0.42);
    for (const dx of [-doorW * 0.32, doorW * 0.32]) {
      box(group, 0.035, 0.55, 0.05, m.steel, x + dx, 1.15, -0.34);
    }
  };
  entrance(-halfW + 0.4, clearLeft);
  entrance(clearRight, halfW - 0.4);

  for (let x = -halfW + 1.5; x < halfW - 1; x += 3.2) {
    if (x > clearLeft && x < clearRight) continue;
    cylinder(group, 0.065, 0.075, 0.82, m.steel, x, 0.41, 7.8, 12, true);
  }
  [-halfW + 1.4, halfW - 1.4].forEach((x, index) => {
    box(group, 1.4, 0.46, 1.4, m.darkStone, x, 0.23, 5.1);
    tree(group, m, x, 5.1, index ? 0.65 : 0.7);
  });
}
