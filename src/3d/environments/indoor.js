/**
 * JLED DESIGN STUDIO v4.1 — Indoor 3D Environments (4 Environments)
 * 1. Executive Boardroom
 * 2. School Auditorium
 * 3. Luxury Hotel Ballroom
 * 4. Shopping Mall Atrium
 */

/**
 * 1. Executive Boardroom (Indoor C-Level Suite)
 */
export function buildBoardroom(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Dimensions are in metres. Keep the architecture around the independent LED
  // assembly; unusually large configured displays expand the room, not furniture.
  const screenW = Math.max(1, specs.actualWidthM);
  const screenH = Math.max(1, specs.actualHeightM);
  const elevation = (state.elevationMm ?? 950) / 1000;
  const roomW = Math.max(10, screenW + 3.2);
  const roomH = Math.max(3.9, elevation + screenH + 0.65);
  const roomD = Math.max(12.8, screenW * 0.7 + 9, screenH * 1.55 + 4);
  const halfW = roomW / 2;
  group.userData.boardroomBounds = { width: roomW, height: roomH, depth: roomD, frontZ: -0.25 };

  const plaster = new THREE.MeshStandardMaterial({ color: 0x2b3033, roughness: 0.86 });
  const graphite = new THREE.MeshStandardMaterial({ color: 0x20262b, roughness: 0.83 });
  const wallPanel = new THREE.MeshStandardMaterial({ color: 0x30383c, roughness: 0.9 });
  const walnut = new THREE.MeshStandardMaterial({ color: 0x49362a, roughness: 0.55 });
  const walnutDark = new THREE.MeshStandardMaterial({ color: 0x35271f, roughness: 0.64 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x333b42, roughness: 0.42, metalness: 0.6 });
  const satinMetal = new THREE.MeshStandardMaterial({ color: 0x737c80, roughness: 0.34, metalness: 0.72 });
  const leather = new THREE.MeshStandardMaterial({ color: 0x252d32, roughness: 0.88 });
  const leatherEdge = new THREE.MeshStandardMaterial({ color: 0x3c464b, roughness: 0.84 });

  const box = (width, height, depth, material, x, y, z, cast = false, receive = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    group.add(mesh);
    return mesh;
  };

  // A restrained, seeded plank texture gives scale and variation without hundreds
  // of individual boards or an external asset dependency.
  let floorMap = null;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#322a24';
      ctx.fillRect(0, 0, 512, 512);
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 4; col++) {
          const x = col * 128 - (row % 2) * 64;
          const y = row * 64;
          const shade = 43 + ((row * 13 + col * 17) % 13);
          ctx.fillStyle = `rgb(${shade + 11},${shade + 3},${shade - 4})`;
          ctx.fillRect(x + 2, y + 2, 124, 60);
          ctx.strokeStyle = 'rgba(18,13,11,0.36)';
          ctx.strokeRect(x + 1, y + 1, 126, 62);
          ctx.strokeStyle = 'rgba(154,125,95,0.11)';
          for (let grain = 0; grain < 5; grain++) {
            const gy = y + 10 + grain * 10 + ((row + col + grain) % 3);
            ctx.beginPath();
            ctx.moveTo(x + 8, gy);
            ctx.lineTo(x + 113 - grain * 3, gy + ((grain % 2) ? 1 : -1));
            ctx.stroke();
          }
        }
      }
      floorMap = new THREE.CanvasTexture(canvas);
      floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
      floorMap.repeat.set(roomW / 4, roomD / 1.2);
      floorMap.encoding = THREE.sRGBEncoding;
    }
  }
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomW, roomD + 0.8),
    new THREE.MeshStandardMaterial({ map: floorMap, color: floorMap ? 0xffffff : 0x3b3028, roughness: 0.76 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = roomD / 2 - 0.2;
  floor.receiveShadow = true;
  group.add(floor);

  // A shallow ceiling and full-height finishes make the default 4 m installation
  // read as a real boardroom rather than a cavernous exhibition hall.
  box(roomW, 0.18, roomD + 0.5, plaster, 0, roomH + 0.09, roomD / 2 - 0.25);
  box(roomW, roomH, 0.32, graphite, 0, roomH / 2, -0.41);
  box(roomW, 0.13, 0.18, walnutDark, 0, 0.065, -0.17);
  box(roomW, 0.12, 0.22, walnutDark, 0, roomH - 0.06, -0.17);

  // Side walls stop short of the display wall so oblique camera presets retain a
  // clean sightline to the screen. Their lower rails and vertical joints add scale.
  const sideStart = 2.5;
  const sideDepth = roomD - sideStart;
  for (const side of [-1, 1]) {
    box(0.17, roomH, sideDepth, wallPanel, side * (halfW + 0.085), roomH / 2, (roomD + sideStart) / 2);
    box(0.07, 0.13, sideDepth, walnutDark, side * (halfW - 0.02), 0.075, (roomD + sideStart) / 2);
    box(0.08, 0.1, sideDepth, walnutDark, side * (halfW - 0.02), roomH - 0.07, (roomD + sideStart) / 2);
    for (let z = 3.1; z < roomD - 0.3; z += 2.7) {
      box(0.025, roomH - 0.36, 0.025, satinMetal, side * (halfW - 0.07), roomH / 2, z);
    }
  }
  box(roomW, roomH, 0.16, plaster, 0, roomH / 2, roomD + 0.08);

  // The darker inset frames the display while leaving its own mesh, mount, and
  // dimensions entirely untouched by the room builder.
  const insetW = Math.min(roomW - 1.5, screenW + 0.9);
  const insetH = Math.min(roomH - 0.35, elevation + screenH + 0.3);
  box(insetW, insetH, 0.055, new THREE.MeshStandardMaterial({ color: 0x171d23, roughness: 0.92 }),
    0, insetH / 2 + 0.09, -0.216);
  const slatStart = screenW / 2 + 0.6;
  for (let x = slatStart; x < halfW - 0.32; x += 0.19) {
    for (const side of [-1, 1]) {
      // Reserve the right-hand wing for a correctly scaled door.
      if (side === 1 && x > halfW - 1.52) continue;
      box(0.055, roomH - 0.43, 0.065, walnut, side * x, roomH / 2, -0.205, true);
    }
  }

  const doorX = halfW - 0.9;
  const doorH = Math.min(2.28, roomH - 0.5);
  box(1.04, doorH, 0.06, walnutDark, doorX, doorH / 2 + 0.035, -0.199);
  box(0.045, doorH + 0.1, 0.09, satinMetal, doorX - 0.54, doorH / 2 + 0.035, -0.15);
  box(0.045, doorH + 0.1, 0.09, satinMetal, doorX + 0.54, doorH / 2 + 0.035, -0.15);
  box(1.14, 0.045, 0.09, satinMetal, doorX, doorH + 0.085, -0.15);
  box(0.025, 0.16, 0.06, satinMetal, doorX - 0.37, 1.0, -0.12);

  // Recessed linear luminaires: small warm diffusers rather than luminous slabs.
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x171b1e, roughness: 0.72 });
  const diffuserMat = new THREE.MeshStandardMaterial({
    color: 0xa9a69a, emissive: 0x514b3b, emissiveIntensity: 0.22, roughness: 0.88
  });
  for (const x of [-2.35, 2.35]) {
    box(0.16, 0.025, 6.9, trimMat, x, roomH - 0.012, 6.0);
    box(0.07, 0.012, 6.65, diffuserMat, x, roomH - 0.029, 6.0);
  }

  // A low-pile rug grounds the seating group. Furniture keeps human dimensions
  // even when the architectural envelope grows for an oversized LED wall.
  const tableW = 2.14;
  const tableL = 5.4;
  const tableZ = Math.max(6.6, Math.min(8.2, roomD * 0.51));
  const rugMat = new THREE.MeshStandardMaterial({ color: 0x30363a, roughness: 0.98 });
  const rugEdge = new THREE.MeshStandardMaterial({ color: 0x596064, roughness: 0.94 });
  box(4.15, 0.012, 8.25, rugEdge, 0, 0.006, tableZ);
  box(4.07, 0.013, 8.17, rugMat, 0, 0.013, tableZ);

  // Rounded, bevelled timber top, a leather cable spine, and two recessed
  // pedestal bases replace the monolithic slab-and-pillar table.
  const roundedSlab = (w, l, radius, thickness) => {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const z = -l / 2;
    shape.moveTo(x + radius, z);
    shape.lineTo(x + w - radius, z);
    shape.quadraticCurveTo(x + w, z, x + w, z + radius);
    shape.lineTo(x + w, z + l - radius);
    shape.quadraticCurveTo(x + w, z + l, x + w - radius, z + l);
    shape.lineTo(x + radius, z + l);
    shape.quadraticCurveTo(x, z + l, x, z + l - radius);
    shape.lineTo(x, z + radius);
    shape.quadraticCurveTo(x, z, x + radius, z);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness, bevelEnabled: true, bevelThickness: 0.009,
      bevelSize: 0.013, bevelSegments: 2, curveSegments: 5, steps: 1
    });
    geo.rotateX(Math.PI / 2);
    return geo;
  };
  const top = new THREE.Mesh(roundedSlab(tableW, tableL, 0.18, 0.07), walnut);
  top.position.set(0, 0.79, tableZ);
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);
  box(1.74, 0.13, tableL - 0.42, walnutDark, 0, 0.66, tableZ, true);
  const inlay = new THREE.Mesh(roundedSlab(0.42, tableL - 1.05, 0.08, 0.004), leather);
  inlay.position.set(0, 0.794, tableZ);
  group.add(inlay);
  for (const zOffset of [-1.45, 1.45]) {
    box(0.82, 0.66, 0.47, darkMetal, 0, 0.35, tableZ + zOffset, true);
    box(1.05, 0.045, 0.68, satinMetal, 0, 0.0225, tableZ + zOffset, true);
    box(0.42, 0.012, 0.16, satinMetal, 0, 0.794, tableZ + zOffset);
  }

  // Upholstered swivel chairs face the table. Five discrete spokes and low
  // casters make the seats read as office furniture rather than box placeholders.
  const makeChair = () => {
    const chair = new THREE.Group();
    const part = (geometry, material, x, y, z, cast = false) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = cast;
      mesh.receiveShadow = true;
      chair.add(mesh);
      return mesh;
    };
    part(roundedSlab(0.58, 0.53, 0.09, 0.08), leather, 0, 0.53, 0.03, true);
    part(new THREE.BoxGeometry(0.57, 0.64, 0.085), leather, 0, 0.84, -0.285, true);
    part(new THREE.BoxGeometry(0.46, 0.09, 0.075), leatherEdge, 0, 1.17, -0.284, true);
    for (const x of [-0.265, 0.265]) {
      part(new THREE.BoxGeometry(0.055, 0.34, 0.055), satinMetal, x, 0.66, -0.08);
      part(new THREE.BoxGeometry(0.075, 0.05, 0.31), leatherEdge, x, 0.75, 0.03, true);
      part(new THREE.BoxGeometry(0.035, 0.45, 0.065), leatherEdge, x, 0.89, -0.255);
    }
    part(new THREE.CylinderGeometry(0.045, 0.047, 0.42, 10), darkMetal, 0, 0.27, 0);
    for (let spoke = 0; spoke < 5; spoke++) {
      const a = spoke * Math.PI * 2 / 5;
      const arm = part(new THREE.BoxGeometry(0.055, 0.035, 0.3), satinMetal,
        Math.sin(a) * 0.145, 0.075, Math.cos(a) * 0.145);
      arm.rotation.y = a;
      part(new THREE.CylinderGeometry(0.033, 0.033, 0.045, 8), darkMetal,
        Math.sin(a) * 0.28, 0.0225, Math.cos(a) * 0.28);
    }
    return chair;
  };
  const chairTemplate = makeChair();
  for (let index = 0; index < 4; index++) {
    const z = tableZ - 1.78 + index * 1.18;
    for (const side of [-1, 1]) {
      const chair = chairTemplate.clone();
      chair.position.set(side * 1.59, 0, z);
      chair.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
      group.add(chair);
    }
  }
  const headChair = chairTemplate.clone();
  headChair.position.set(0, 0, tableZ + tableL / 2 + 0.55);
  headChair.rotation.y = Math.PI;
  group.add(headChair);
}

// Helpers for screen-adaptive interiors. All dimensions are metres and the
// display remains a separate assembly in front of the feature wall.
function indoorScene(group, state, specs, minimum) {
  const screenW = Math.max(1, specs.actualWidthM);
  const screenH = Math.max(1, specs.actualHeightM);
  const elevation = Math.max(0, (state.elevationMm ?? 1000) / 1000);
  const width = Math.max(minimum.width, screenW + minimum.wing * 2);
  const rigClearance = state.mountType === 'hanging' ? 3.2 : 1.05;
  const height = Math.max(minimum.height, elevation + screenH + rigClearance);
  const depth = Math.max(minimum.depth, screenW * 0.8 + 9, screenH * 1.5 + 5);
  group.userData.sceneBounds = { width, height, depth, frontZ: -0.25 };

  const mat = (color, roughness = 0.8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const box = (parent, w, h, d, material, x, y, z, cast = false) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const cylinder = (parent, top, bottom, h, material, x, y, z, segments = 16) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, h, segments), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const floor = (material) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth + 0.6), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.z = (depth - 0.6) / 2;
    mesh.receiveShadow = true;
    group.add(mesh);
  };
  return { width, height, depth, screenW, screenH, elevation, mat, box, cylinder, floor };
}

/** School auditorium with a clear stage, realistic seats and acoustic finishes. */
export function buildAuditorium(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const s = indoorScene(group, state, specs, { width: 14, height: 6.2, depth: 19, wing: 3.1 });
  const { width: w, height: h, depth: d, screenW, screenH, elevation, mat, box, floor } = s;
  const plaster = mat(0x3b3c41, 0.9), acoustic = mat(0x3e3032, 0.95), charcoal = mat(0x25272b, 0.9);
  const oak = mat(0x594536, 0.68), carpet = mat(0x353038, 0.98), fabric = mat(0x753b43, 0.94);
  const fabricEdge = mat(0x4a292f, 0.95), metal = mat(0x353a3e, 0.5, 0.55), light = mat(0xb0a99a, 0.9);
  floor(carpet);
  box(group, w, h, 0.3, charcoal, 0, h / 2, -0.42);
  box(group, w, 0.14, d, plaster, 0, h + 0.07, d / 2);
  for (const side of [-1, 1]) {
    box(group, 0.16, h, d - 2.2, acoustic, side * (w / 2 + 0.08), h / 2, (d + 2.2) / 2);
    box(group, 0.08, 0.15, d - 2.2, oak, side * (w / 2 - 0.04), 0.075, (d + 2.2) / 2);
    for (let z = 3.3; z < d - 0.5; z += 2.4) {
      box(group, 0.045, h - 0.5, 0.065, oak, side * (w / 2 - 0.07), h / 2, z);
    }
  }
  // The dark proscenium surrounds the LED without crossing its physical area.
  const portalW = Math.min(w - 1.0, screenW + 1.4);
  const portalH = Math.min(h - 0.4, elevation + screenH + 0.45);
  box(group, portalW, portalH, 0.055, mat(0x171a1f, 0.97), 0, portalH / 2 + 0.08, -0.235);
  const curtainW = Math.max(0.5, (w - portalW) / 2 - 0.3);
  for (const side of [-1, 1]) {
    const cx = side * (portalW / 2 + curtainW / 2 + 0.16);
    box(group, curtainW, h - 0.5, 0.12, fabricEdge, cx, h / 2, -0.11);
    for (let x = -curtainW / 2 + 0.12; x < curtainW / 2; x += 0.25) {
      box(group, 0.055, h - 0.58, 0.05, fabric, cx + x, h / 2, -0.025);
    }
  }
  const stageZ = state.mountType === 'truss' ? 3.0 : 2.05;
  box(group, w - 0.6, 0.42, 2.9, oak, 0, 0.21, stageZ, true);
  box(group, w - 0.5, 0.12, 0.08, charcoal, 0, 0.12, stageZ + 1.47);
  for (let z = 4.6; z < d - 1; z += 3.3) {
    for (const x of [-w * 0.28, w * 0.28]) {
      box(group, 0.13, 0.025, 1.6, light, x, h - 0.02, z);
    }
  }
  const seat = new THREE.Group();
  box(seat, 0.55, 0.12, 0.55, fabric, 0, 0.49, 0, true);
  box(seat, 0.55, 0.61, 0.10, fabric, 0, 0.79, 0.25, true);
  for (const x of [-0.27, 0.27]) {
    box(seat, 0.035, 0.46, 0.035, metal, x, 0.23, 0.16);
    box(seat, 0.045, 0.045, 0.46, fabricEdge, x, 0.66, 0.02);
  }
  const rowCount = Math.min(6, Math.max(4, Math.floor((d - 7) / 1.65)));
  const block = Math.min(4, Math.max(2, Math.floor((w / 2 - 1.4) / 0.7)));
  for (let row = 0; row < rowCount; row++) {
    const z = 6.0 + row * 1.6, rise = row * 0.13;
    box(group, w - 0.8, Math.max(0.08, rise + 0.08), 1.52, charcoal, 0, Math.max(0.08, rise + 0.08) / 2, z);
    for (const side of [-1, 1]) for (let i = 0; i < block; i++) {
      const chair = seat.clone();
      chair.position.set(side * (1.25 + i * 0.68), rise + 0.08, z);
      group.add(chair);
    }
  }
}

/** Hotel ballroom with a central aisle, dressed tables and restrained lighting. */
export function buildBallroom(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const s = indoorScene(group, state, specs, { width: 16, height: 5.6, depth: 18, wing: 3.6 });
  const { width: w, height: h, depth: d, screenW, screenH, elevation, mat, box, cylinder, floor } = s;
  const wall = mat(0x655b55, 0.88), panel = mat(0x75675d, 0.8), trim = mat(0x99816a, 0.52, 0.3);
  const carpet = mat(0x453a3b, 0.98), stageMat = mat(0x3b3030, 0.9), linen = mat(0xc9c1b5, 0.92);
  const chairMat = mat(0x4d4543, 0.85), metal = mat(0x70665b, 0.48, 0.6);
  floor(carpet);
  box(group, w, h, 0.3, wall, 0, h / 2, -0.42);
  box(group, w, 0.16, d, wall, 0, h + 0.08, d / 2);
  for (const side of [-1, 1]) {
    box(group, 0.16, h, d - 2.3, panel, side * (w / 2 + 0.08), h / 2, (d + 2.3) / 2);
    for (let z = 3.2; z < d - 0.4; z += 3.0) {
      box(group, 0.04, h - 0.5, 0.055, trim, side * (w / 2 - 0.04), h / 2, z);
    }
    box(group, 0.09, 0.14, d - 2.3, trim, side * (w / 2 - 0.04), 0.09, (d + 2.3) / 2);
  }
  const featureW = Math.min(w - 0.7, screenW + 1.3);
  const featureH = Math.min(h - 0.4, elevation + screenH + 0.5);
  box(group, featureW, featureH, 0.06, mat(0x393335, 0.9), 0, featureH / 2 + 0.07, -0.235);
  for (const side of [-1, 1]) {
    const x = side * (screenW / 2 + 0.75);
    box(group, 0.055, h - 0.6, 0.045, trim, x, h / 2, -0.19);
  }
  const stageZ = state.mountType === 'truss' ? 2.95 : 1.95;
  box(group, w - 1.0, 0.34, 2.7, stageMat, 0, 0.17, stageZ, true);
  box(group, w - 1.0, 0.045, 2.7, panel, 0, 0.362, stageZ);
  // Ceiling coffers and pendant discs stay above the screen sightline.
  for (let z = 4.6; z < d - 0.5; z += 4.3) {
    box(group, w - 0.5, 0.10, 0.10, trim, 0, h - 0.08, z);
    for (const side of [-1, 1]) {
      const x = side * Math.min(w * 0.28, 4.7);
      cylinder(group, 0.018, 0.018, 0.55, metal, x, h - 0.34, z, 8);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.035, 8, 32), trim);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, h - 0.62, z);
      group.add(ring);
      const diffuser = mat(0xb6a998, 0.9);
      diffuser.emissive = new THREE.Color(0x4d3d2e);
      diffuser.emissiveIntensity = 0.3;
      cylinder(group, 0.34, 0.34, 0.045, diffuser, x, h - 0.64, z, 24);
    }
  }
  const chair = new THREE.Group();
  box(chair, 0.46, 0.09, 0.44, chairMat, 0, 0.48, 0, true);
  box(chair, 0.45, 0.55, 0.08, chairMat, 0, 0.77, 0.22, true);
  for (const x of [-0.19, 0.19]) for (const z of [-0.17, 0.17]) {
    box(chair, 0.035, 0.44, 0.035, metal, x, 0.22, z);
  }
  const sideX = Math.max(4.1, Math.min(w / 2 - 2.2, 5.1));
  for (const z of [6.8, 11.6]) for (const side of [-1, 1]) {
    const x = side * sideX;
    cylinder(group, 0.95, 0.95, 0.06, linen, x, 0.75, z, 32);
    cylinder(group, 0.72, 0.82, 0.69, linen, x, 0.37, z, 32);
    cylinder(group, 0.10, 0.07, 0.18, trim, x, 0.87, z, 12);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const item = chair.clone();
      item.position.set(x + Math.sin(a) * 1.42, 0, z + Math.cos(a) * 1.42);
      item.rotation.y = a;
      group.add(item);
    }
  }
}

/** Mall atrium with connected galleries, shopfronts and side escalators. */
export function buildMallAtrium(group, state, specs) {
  if (typeof THREE === 'undefined') return;
  const s = indoorScene(group, state, specs, { width: 15, height: 8, depth: 19, wing: 3.75 });
  const { width: w, height: h, depth: d, screenW, screenH, elevation, mat, box, floor } = s;
  const stone = mat(0x989b99, 0.7), wall = mat(0x737c7e, 0.88), accent = mat(0x3a454a, 0.82);
  const dark = mat(0x283338, 0.72), rail = mat(0x9aa7a6, 0.38, 0.65), floorMat = mat(0xb7b9b5, 0.54);
  const glass = new THREE.MeshStandardMaterial({ color: 0x7b9a9c, transparent: true, opacity: 0.4, roughness: 0.2, metalness: 0.1, side: THREE.DoubleSide });
  floor(floorMat);
  // Fine expansion joints supply scale without creating hundreds of floor tiles.
  const joint = mat(0x8a9290, 0.9);
  for (let x = -w / 2 + 1.5; x < w / 2; x += 1.5) box(group, 0.014, 0.004, d, joint, x, 0.003, d / 2);
  for (let z = 1.5; z < d; z += 1.5) box(group, w, 0.004, 0.014, joint, 0, 0.003, z);
  box(group, w, h, 0.30, wall, 0, h / 2, -0.42);
  box(group, w, 0.14, d, stone, 0, h + 0.07, d / 2);
  const featureW = Math.min(w - 0.8, screenW + 1.5);
  const featureH = Math.min(h - 0.35, elevation + screenH + 0.55);
  box(group, featureW, featureH, 0.06, accent, 0, featureH / 2 + 0.08, -0.235);
  // Shop entrances sit in the wings, outside the configurable screen width.
  const wingW = Math.max(1.8, (w - featureW) / 2 - 0.35);
  for (const side of [-1, 1]) {
    const x = side * (featureW / 2 + wingW / 2 + 0.18);
    box(group, wingW, 3.3, 0.08, dark, x, 1.65, -0.18);
    box(group, wingW - 0.18, 2.55, 0.03, glass, x, 1.36, -0.12);
    box(group, wingW - 0.18, 0.30, 0.04, stone, x, 3.0, -0.1);
    for (const dx of [-wingW * 0.24, wingW * 0.24]) box(group, 0.035, 2.55, 0.035, rail, x + dx, 1.36, -0.095);
  }
  const galleryY = 4.05, wingDepth = d - 3.0, wingWidth = 2.4;
  for (const side of [-1, 1]) {
    const outer = side * (w / 2 - wingWidth / 2);
    const inner = side * (w / 2 - wingWidth);
    box(group, 0.16, h, wingDepth, wall, side * (w / 2 + 0.08), h / 2, (d + 3.0) / 2);
    box(group, wingWidth, 0.20, wingDepth, stone, outer, galleryY - 0.1, (d + 3.0) / 2);
    box(group, 0.035, 0.95, wingDepth, glass, inner, galleryY + 0.52, (d + 3.0) / 2);
    box(group, 0.07, 0.06, wingDepth, rail, inner, galleryY + 1.02, (d + 3.0) / 2);
    for (let z = 3.3; z < d; z += 1.5) box(group, 0.045, 1.0, 0.045, rail, inner, galleryY + 0.5, z);

    // A stair-stepped escalator links the floor to the upper gallery; all
    // structure stays in the side wing and clears the central LED sightline.
    const x = side * (w / 2 - 1.15), z0 = 5.0, run = 6.25, rise = galleryY;
    const angle = Math.atan2(rise, run), length = Math.hypot(run, rise);
    const base = box(group, 1.02, 0.18, length, dark, x, rise / 2, z0 + run / 2, true);
    base.rotation.x = -angle;
    for (const dx of [-0.53, 0.53]) {
      const handrail = box(group, 0.065, 0.07, length, rail, x + dx, rise / 2 + 0.88, z0 + run / 2);
      handrail.rotation.x = -angle;
      const sidePanel = box(group, 0.045, 0.72, length, glass, x + dx, rise / 2 + 0.46, z0 + run / 2);
      sidePanel.rotation.x = -angle;
    }
    for (let i = 0; i < 24; i++) {
      const t = (i + 0.5) / 24;
      box(group, 0.91, 0.045, run / 24 + 0.01, stone, x, 0.08 + rise * t, z0 + run * t);
    }
  }
  // Discrete recessed strips create a softer ceiling than flat luminous panels.
  const diffuser = mat(0xc4c8c1, 0.9);
  diffuser.emissive = new THREE.Color(0x4a514b);
  diffuser.emissiveIntensity = 0.25;
  for (const x of [-w * 0.28, w * 0.28]) for (let z = 4.0; z < d - 1.0; z += 4.0) {
    box(group, 0.12, 0.025, 2.2, diffuser, x, h - 0.02, z);
  }
}
