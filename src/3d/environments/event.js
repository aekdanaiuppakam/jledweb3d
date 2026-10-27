/**
 * Event and specialty environments. Dimensions use metres; the LED assembly is
 * built independently at z = 0. All scene structures leave its face clear.
 */

function makeBox(group, material, size, position, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = !!options.cast;
  mesh.receiveShadow = options.receive !== false;
  if (options.rotationY) mesh.rotation.y = options.rotationY;
  group.add(mesh);
  return mesh;
}

function makeCylinder(group, material, topRadius, bottomRadius, height, position, segments = 16) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(topRadius, bottomRadius, height, segments), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function floorMaterial(kind) {
  const shades = {
    concrete: ['#40444a', '#353a40', '#484d53'],
    carpet: ['#51565a', '#4c5156', '#5a5e60'],
    timber: ['#98785c', '#8b6c53', '#a58262'],
    stone: ['#a4a39e', '#999b98', '#adaaa4']
  };
  const colors = shades[kind] || shades.concrete;
  let texture = null;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = colors[0];
      ctx.fillRect(0, 0, 256, 256);
      if (kind === 'timber') {
        for (let y = 0; y < 256; y += 32) {
          ctx.fillStyle = colors[(y / 32) % 3];
          ctx.fillRect(0, y + 1, 256, 30);
          ctx.strokeStyle = 'rgba(48,33,24,.28)';
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(256, y);
          ctx.moveTo((y / 32 % 2) * 128, y);
          ctx.lineTo((y / 32 % 2) * 128, y + 32);
          ctx.stroke();
        }
      } else if (kind === 'stone') {
        ctx.strokeStyle = 'rgba(68,70,71,.23)';
        ctx.lineWidth = 2;
        for (let x = 0; x <= 256; x += 64) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
        }
        for (let y = 0; y <= 256; y += 64) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(240,240,230,.12)';
        for (let i = 0; i < 9; i++) {
          ctx.beginPath();
          ctx.moveTo((i * 79) % 256, 0);
          ctx.lineTo((i * 79 + 44) % 256, 256);
          ctx.stroke();
        }
      } else {
        for (let y = 0; y < 256; y += 16) {
          ctx.strokeStyle = kind === 'carpet' ? 'rgba(200,205,205,.035)' : 'rgba(10,12,14,.14)';
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
        }
      }
      texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 5);
      texture.encoding = THREE.sRGBEncoding;
    }
  }
  return new THREE.MeshStandardMaterial({
    color: texture ? 0xffffff : colors[0],
    map: texture,
    roughness: kind === 'stone' ? 0.58 : 0.86,
    metalness: kind === 'stone' ? 0.05 : 0
  });
}

function addFloor(group, width, depth, kind, zCenter = depth / 2 - 0.3) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMaterial(kind));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, zCenter);
  floor.receiveShadow = true;
  group.add(floor);
}

function screenDimensions(state, specs) {
  const width = Math.max(1, Number(specs.actualWidthM) || 4);
  const height = Math.max(1, Number(specs.actualHeightM) || 2.5);
  const elevation = Math.max(0, (Number(state.elevationMm) || 0) / 1000);
  return { width, height, elevation, top: elevation + height };
}

function addPlant(group, x, z, scale = 1, baseY = 0) {
  const potMat = new THREE.MeshStandardMaterial({ color: 0x3e4647, roughness: 0.83 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x67523e, roughness: 0.95 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x526c54, roughness: 0.94 });
  makeCylinder(group, potMat, 0.27 * scale, 0.21 * scale, 0.45 * scale, [x, baseY + 0.225 * scale, z]);
  makeCylinder(group, stemMat, 0.035 * scale, 0.045 * scale, 1.25 * scale, [x, baseY + 1.02 * scale, z], 8);
  for (const [dx, dy, dz, radius] of [
    [0, 1.75, 0, 0.48], [-0.3, 1.48, 0.08, 0.36],
    [0.3, 1.53, -0.05, 0.38], [-0.12, 1.98, -0.12, 0.34],
    [0.16, 1.92, 0.12, 0.36]
  ]) {
    const crown = new THREE.Mesh(new THREE.SphereGeometry(radius * scale, 12, 8), foliageMat);
    crown.position.set(x + dx * scale, baseY + dy * scale, z + dz * scale);
    crown.scale.set(1, 0.83, 0.82);
    crown.castShadow = true;
    group.add(crown);
  }
}

function addLinearLight(group, x, y, z, length, metal, diffuser) {
  makeBox(group, metal, [length, 0.055, 0.14], [x, y, z]);
  makeBox(group, diffuser, [length - 0.08, 0.012, 0.07], [x, y - 0.035, z]);
}

function addTubeBetween(group, material, start, end, radius = 0.025) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const direction = b.clone().sub(a);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 6), material);
  tube.position.copy(a.add(b).multiplyScalar(0.5));
  tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  group.add(tube);
}

/** Concert stage, with rigging and loudspeakers outside the screen silhouette. */
export function buildConcertStage(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const { width, elevation, top } = screenDimensions(state, specs);
  const stageWidth = Math.max(9.5, width + 5);
  const stageDepth = 7.4;
  const stageStart = state.mountType === 'truss' ? 1.45 : 0.3;
  const rigHeight = Math.max(5.3, top + 1.65);
  group.userData.mountCeilingY = rigHeight;
  const deckHeight = Math.max(0.02, Math.min(0.75, elevation - 0.1));
  const dark = new THREE.MeshStandardMaterial({ color: 0x24282c, roughness: 0.88 });
  const deck = new THREE.MeshStandardMaterial({ color: 0x303239, roughness: 0.78 });
  const fascia = new THREE.MeshStandardMaterial({ color: 0x171b1e, roughness: 0.88 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x6e777b, roughness: 0.42, metalness: 0.68 });
  const speaker = new THREE.MeshStandardMaterial({ color: 0x202529, roughness: 0.84 });
  const grille = new THREE.MeshStandardMaterial({ color: 0x30383c, roughness: 0.94 });
  const lens = new THREE.MeshStandardMaterial({ color: 0xc5c8c2, emissive: 0x8d8c7e, emissiveIntensity: 0.26, roughness: 0.6 });

  addFloor(group, Math.max(stageWidth + 12, 24), 25, 'concrete', 9);
  // The deck starts in front of the screen plane and never crosses it.
  makeBox(group, deck, [stageWidth, deckHeight, stageDepth], [0, deckHeight / 2, stageDepth / 2 + stageStart], { cast: true });
  makeBox(group, fascia, [stageWidth, Math.max(0.03, deckHeight * 0.82), 0.08],
    [0, Math.max(0.015, deckHeight * 0.41), stageDepth + stageStart + 0.04]);
  makeBox(group, dark, [stageWidth, rigHeight, 0.18], [0, rigHeight / 2, -0.34]);
  const sideX = width / 2 + 1.15;
  for (const side of [-1, 1]) {
    const x = side * sideX;
    // Four tube uprights and alternating braces read as a real box truss.
    for (const dx of [-0.17, 0.17]) {
      for (const dz of [-0.15, 0.15]) {
        addTubeBetween(group, metal, [x + dx, 0, dz - 0.1], [x + dx, rigHeight, dz - 0.1]);
      }
    }
    for (let y = 0.4; y < rigHeight - 0.35; y += 0.7) {
      addTubeBetween(group, metal, [x - 0.17, y, 0.05], [x + 0.17, Math.min(y + 0.7, rigHeight), 0.05], 0.017);
      addTubeBetween(group, metal, [x - 0.17, y, 0.05], [x + 0.17, y, 0.05], 0.017);
    }
    const stackX = side * (width / 2 + 2.0);
    for (let i = 0; i < 3; i++) {
      const y = deckHeight + 0.31 + i * 0.62;
      makeBox(group, speaker, [0.72, 0.62, 0.58], [stackX, y, stageStart + 0.65], { cast: true });
      makeBox(group, grille, [0.62, 0.52, 0.018], [stackX, y, stageStart + 0.949]);
    }
  }
  for (const dz of [-0.12, 0.16]) {
    addTubeBetween(group, metal, [-sideX, rigHeight, dz], [sideX, rigHeight, dz]);
    addTubeBetween(group, metal, [-sideX, rigHeight - 0.34, dz], [sideX, rigHeight - 0.34, dz]);
  }
  for (let x = -sideX + 0.7; x <= sideX - 0.6; x += 1.4) {
    addTubeBetween(group, metal, [x, rigHeight - 0.34, 0.16], [x + 0.7, rigHeight, 0.16], 0.016);
  }
  for (let i = -2; i <= 2; i++) {
    const x = i * Math.min(1.55, stageWidth / 8);
    makeBox(group, speaker, [0.23, 0.2, 0.26], [x, rigHeight - 0.5, 0.3]);
    const lamp = makeCylinder(group, lens, 0.075, 0.075, 0.03, [x, rigHeight - 0.62, 0.32], 10);
    lamp.rotation.x = Math.PI / 2;
  }
  // Stage monitors and stairs occupy the wings, leaving the LED sightline open.
  for (const side of [-1, 1]) {
    makeBox(group, speaker, [0.72, 0.22, 0.46], [side * (width / 2 + 1.1), deckHeight + 0.11, 5.3], { cast: true });
    if (deckHeight > 0.2) {
      makeBox(group, deck, [1.15, deckHeight / 2, 0.7],
        [side * (stageWidth / 2 - 0.65), deckHeight / 4, stageDepth + stageStart + 0.35]);
    }
  }
}

/** Exhibition booth with architectural back wall, literature and a reception desk. */
export function buildExhibitionBooth(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const { width, height, top } = screenDimensions(state, specs);
  const boothWidth = Math.max(9.5, width + 5.4);
  const wallHeight = Math.max(3.7, top + 0.8);
  const boothDepth = 7.5;
  const platformStart = state.mountType === 'truss' ? 1.45 : 0.1;
  const platformDepth = boothDepth + 0.1 - platformStart;
  const hallWidth = boothWidth + 10;
  const hallHeight = wallHeight + 3;
  const hallDepth = Math.max(15, width * 0.7 + 5, height * 1.55 + 4);
  group.userData.sceneBounds = { width: hallWidth, height: hallHeight, depth: hallDepth, frontZ: -0.25 };
  const wall = new THREE.MeshStandardMaterial({ color: 0x38444b, roughness: 0.87 });
  const panel = new THREE.MeshStandardMaterial({ color: 0x52636a, roughness: 0.8 });
  const accent = new THREE.MeshStandardMaterial({ color: 0x667f89, roughness: 0.72 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x222a2e, roughness: 0.78 });
  const pale = new THREE.MeshStandardMaterial({ color: 0xc2c2b9, roughness: 0.74 });
  const timber = new THREE.MeshStandardMaterial({ color: 0x80654d, roughness: 0.74 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x657177, roughness: 0.48, metalness: 0.55 });
  const diffuser = new THREE.MeshStandardMaterial({ color: 0xd6d6c9, emissive: 0x7e8179, emissiveIntensity: 0.16 });

  addFloor(group, hallWidth, hallDepth + 2, 'concrete', hallDepth / 2);
  makeBox(group, dark, [hallWidth, 0.15, hallDepth + 0.5], [0, hallHeight + 0.075, hallDepth / 2 - 0.25]);
  for (const side of [-1, 1]) {
    makeBox(group, wall, [0.16, hallHeight, hallDepth], [side * (hallWidth / 2 + 0.08), hallHeight / 2, hallDepth / 2]);
  }
  makeBox(group, dark, [boothWidth, 0.05, platformDepth], [0, 0.025, platformStart + platformDepth / 2]);
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(boothWidth - 0.1, platformDepth - 0.1), floorMaterial('carpet'));
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0, 0.052, platformStart + platformDepth / 2);
  carpet.receiveShadow = true;
  group.add(carpet);
  makeBox(group, wall, [boothWidth, wallHeight, 0.22], [0, wallHeight / 2, -0.35]);
  for (const side of [-1, 1]) {
    const x = side * (width / 2 + 0.7);
    makeBox(group, panel, [0.68, wallHeight - 0.28, 0.06], [x, wallHeight / 2, -0.205]);
    makeBox(group, accent, [0.05, wallHeight - 0.5, 0.06], [side * (width / 2 + 1.1), wallHeight / 2, -0.17]);
    makeBox(group, wall, [0.15, wallHeight * 0.8, 2.2],
      [side * (boothWidth / 2 - 0.08), wallHeight * 0.4, 0.9]);
  }
  makeBox(group, dark, [boothWidth, 0.22, 0.25], [0, wallHeight - 0.11, -0.18]);
  addLinearLight(group, 0, wallHeight - 0.28, 0.28, Math.min(boothWidth - 1, 7), metal, diffuser);

  const counterX = boothWidth / 2 - 1.0;
  makeBox(group, dark, [1.7, 0.08, 0.72], [counterX, 0.09, 4.15]);
  makeBox(group, pale, [1.7, 0.96, 0.7], [counterX, 0.61, 4.15], { cast: true });
  makeBox(group, timber, [1.76, 0.065, 0.77], [counterX, 1.125, 4.15]);
  makeBox(group, accent, [0.045, 0.76, 0.025], [counterX - 0.68, 0.62, 4.51]);

  const rackX = -boothWidth / 2 + 0.75;
  for (const dx of [-0.28, 0.28]) {
    makeBox(group, metal, [0.035, 1.42, 0.035], [rackX + dx, 0.76, 3.75]);
  }
  for (let y = 0.38; y <= 1.28; y += 0.3) {
    makeBox(group, pale, [0.63, 0.035, 0.3], [rackX, y, 3.75]);
    for (let i = -1; i <= 1; i++) {
      makeBox(group, panel, [0.12, 0.2, 0.02], [rackX + i * 0.16, y + 0.11, 3.79]);
    }
  }
  addPlant(group, -boothWidth / 2 + 0.75, 1.8, 0.75, 0.05);
}

/** Boutique storefront: glazing and merchandising sit outside the screen opening. */
export function buildRetailStore(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const { width, height, top } = screenDimensions(state, specs);
  const shopWidth = Math.max(9.5, width + 5.0);
  const shopHeight = Math.max(3.8, top + 1.2);
  const depth = Math.max(9, width * 0.7 + 4, height * 1.55 + 3);
  group.userData.sceneBounds = { width: shopWidth, height: shopHeight, depth, frontZ: -0.25 };
  const wall = new THREE.MeshStandardMaterial({ color: 0x656661, roughness: 0.9 });
  const inset = new THREE.MeshStandardMaterial({ color: 0x3d4546, roughness: 0.85 });
  const cabinetry = new THREE.MeshStandardMaterial({ color: 0x776759, roughness: 0.75 });
  const shelf = new THREE.MeshStandardMaterial({ color: 0xb8afa0, roughness: 0.77 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2c3233, roughness: 0.55, metalness: 0.35 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x9bb4b6, transparent: true, opacity: 0.18, roughness: 0.14, metalness: 0.08, depthWrite: false, side: THREE.DoubleSide });
  const diffuser = new THREE.MeshStandardMaterial({ color: 0xd7d0bc, emissive: 0xb7a98a, emissiveIntensity: 0.16 });

  addFloor(group, shopWidth, depth + 1.5, 'timber', depth / 2 - 0.1);
  makeBox(group, wall, [shopWidth, shopHeight, 0.22], [0, shopHeight / 2, -0.34]);
  makeBox(group, inset, [width + 0.45, Math.min(shopHeight - 0.2, top + 0.3), 0.045],
    [0, Math.min(shopHeight - 0.2, top + 0.3) / 2 + 0.05, -0.205]);
  makeBox(group, wall, [shopWidth, 0.16, depth + 0.5], [0, shopHeight + 0.08, depth / 2 - 0.25]);
  for (const side of [-1, 1]) {
    const wallX = side * (shopWidth / 2 - 0.06);
    makeBox(group, wall, [0.12, shopHeight, depth], [wallX, shopHeight / 2, depth / 2]);
    // Glass belongs to the two outer storefront bays, never across the display.
    const glassWidth = Math.max(0.6, (shopWidth - width - 1.6) / 2);
    const glassX = side * (width / 2 + 0.8 + glassWidth / 2);
    const window = new THREE.Mesh(new THREE.PlaneGeometry(glassWidth, Math.min(3.2, shopHeight - 0.35)), glass);
    window.position.set(glassX, Math.min(3.2, shopHeight - 0.35) / 2 + 0.1, 0.45);
    group.add(window);
    for (const edgeX of [width / 2 + 0.78, shopWidth / 2 - 0.18]) {
      makeBox(group, dark, [0.055, Math.min(3.4, shopHeight - 0.2), 0.09],
        [side * edgeX, Math.min(3.4, shopHeight - 0.2) / 2 + 0.05, 0.48]);
    }
    const shelfX = side * (shopWidth / 2 - 0.55);
    makeBox(group, cabinetry, [0.65, 2.2, 2.35], [shelfX, 1.1, 3.1]);
    for (let y = 0.45; y <= 1.95; y += 0.5) {
      makeBox(group, shelf, [0.69, 0.035, 2.28], [shelfX, y, 3.1]);
      for (let z = 2.35; z <= 3.85; z += 0.75) {
        makeBox(group, dark, [0.15, 0.19, 0.22], [shelfX, y + 0.11, z]);
      }
    }
    makeBox(group, shelf, [0.7, 0.62, 0.7], [side * (width / 2 + 1.35), 0.31, 2.35], { cast: true });
    makeCylinder(group, cabinetry, 0.17, 0.14, 0.32, [side * (width / 2 + 1.35), 0.79, 2.35]);
  }
  for (const z of [2.5, 5.5]) {
    addLinearLight(group, 0, shopHeight - 0.12, z, shopWidth - 1.1, dark, diffuser);
  }
}

/** Corporate reception lobby with side desk, stone flooring and seating. */
export function buildCorporateLobby(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const { width, height, top } = screenDimensions(state, specs);
  const lobbyWidth = Math.max(12.5, width + 7.6);
  const lobbyHeight = Math.max(4.6, top + 1.4);
  const depth = Math.max(11, width * 0.65 + 4, height * 1.55 + 4);
  group.userData.sceneBounds = { width: lobbyWidth, height: lobbyHeight, depth, frontZ: -0.25 };
  const wall = new THREE.MeshStandardMaterial({ color: 0x747a78, roughness: 0.82 });
  const feature = new THREE.MeshStandardMaterial({ color: 0x4e5a5e, roughness: 0.82 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x777f7c, roughness: 0.4, metalness: 0.6 });
  const deskMat = new THREE.MeshStandardMaterial({ color: 0xc1b9ac, roughness: 0.62 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x806756, roughness: 0.72 });
  const upholstery = new THREE.MeshStandardMaterial({ color: 0x566569, roughness: 0.92 });
  const black = new THREE.MeshStandardMaterial({ color: 0x2c3438, roughness: 0.65 });
  const diffuser = new THREE.MeshStandardMaterial({ color: 0xcfcfc4, emissive: 0xa4a38d, emissiveIntensity: 0.16 });

  addFloor(group, lobbyWidth, depth + 0.8, 'stone', depth / 2);
  makeBox(group, wall, [lobbyWidth, lobbyHeight, 0.22], [0, lobbyHeight / 2, -0.34]);
  makeBox(group, feature, [width + 0.8, Math.min(lobbyHeight - 0.25, top + 0.45), 0.06],
    [0, Math.min(lobbyHeight - 0.25, top + 0.45) / 2 + 0.08, -0.205]);
  makeBox(group, wall, [lobbyWidth, 0.15, depth + 0.5], [0, lobbyHeight + 0.075, depth / 2 - 0.25]);
  for (const side of [-1, 1]) {
    const x = side * (lobbyWidth / 2 - 0.06);
    makeBox(group, wall, [0.12, lobbyHeight, depth], [x, lobbyHeight / 2, depth / 2]);
    const panelX = side * (width / 2 + 0.8);
    makeBox(group, wood, [0.85, lobbyHeight - 0.3, 0.055], [panelX, lobbyHeight / 2, -0.205]);
    for (let offset = -0.3; offset <= 0.31; offset += 0.15) {
      makeBox(group, black, [0.018, lobbyHeight - 0.5, 0.018], [panelX + offset, lobbyHeight / 2, -0.17]);
    }
    addPlant(group, side * (lobbyWidth / 2 - 0.75), 1.5, 0.95);
  }
  for (const z of [3, 7]) {
    addLinearLight(group, 0, lobbyHeight - 0.1, z, lobbyWidth - 1.5, metal, diffuser);
  }

  const deskX = lobbyWidth / 2 - 1.65;
  makeBox(group, black, [2.6, 0.1, 0.9], [deskX, 0.05, 4.1]);
  makeBox(group, deskMat, [2.6, 0.98, 0.9], [deskX, 0.59, 4.1], { cast: true });
  makeBox(group, wood, [2.68, 0.06, 0.96], [deskX, 1.11, 4.1]);
  makeBox(group, metal, [2.35, 0.025, 0.02], [deskX, 0.33, 4.56]);

  const seatX = -lobbyWidth / 2 + 1.45;
  for (const z of [3.5, 5.15]) {
    makeBox(group, black, [0.92, 0.08, 0.82], [seatX, 0.17, z]);
    makeBox(group, upholstery, [0.92, 0.29, 0.82], [seatX, 0.37, z], { cast: true });
    makeBox(group, upholstery, [0.92, 0.5, 0.16], [seatX, 0.72, z - 0.33], { cast: true });
    for (const dx of [-0.39, 0.39]) {
      makeBox(group, upholstery, [0.12, 0.32, 0.8], [seatX + dx, 0.57, z]);
    }
  }
  makeCylinder(group, metal, 0.025, 0.025, 0.42, [seatX + 1.35, 0.21, 4.3], 10);
  makeCylinder(group, wood, 0.48, 0.48, 0.045, [seatX + 1.35, 0.44, 4.3], 24);
}
