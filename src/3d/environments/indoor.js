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

  // Floor: Luxury Dark Oak Parquet
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 36),
    new THREE.MeshStandardMaterial({ color: 0x181411, roughness: 0.28, metalness: 0.15 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Ceiling: Acoustic Tile Grid with Recessed LED Troffers
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 36),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 8.5;
  group.add(ceiling);

  // Recessed LED Troffer Light Fixtures on Ceiling
  const trofferMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  for (let tz = 2; tz <= 12; tz += 3.5) {
    [-3.5, 3.5].forEach((tx) => {
      const troffer = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 2.4), trofferMat);
      troffer.position.set(tx, 8.46, tz);
      group.add(troffer);
    });
  }

  // Feature Wall behind Screen: Dark Slate Acoustic Wall
  const wallW = Math.max(28, specs.actualWidthM + 12);
  const wallH = 8.5;
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallW, wallH, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6, metalness: 0.1 })
  );
  backWall.position.set(0, wallH / 2, -0.35);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Decorative Fluted Wood Slats on Wall Wings
  const slatMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.45, metalness: 0.05 });
  const slatLimit = wallW / 2 - 0.5;
  const screenAvoid = (specs.actualWidthM / 2) + 0.8;
  for (let s = -slatLimit; s <= slatLimit; s += 0.35) {
    if (Math.abs(s) < screenAvoid) continue;
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.14, 7.8, 0.1), slatMat);
    slat.position.set(s, 4.0, -0.12);
    slat.receiveShadow = true;
    group.add(slat);
  }

  // Modern Executive Boardroom Table (Mahogany with Center Inset)
  const tableW = 2.4;
  const tableL = Math.max(6.5, Math.min(10, specs.actualWidthM * 1.3));
  const tableZ = Math.max(4.8, specs.actualWidthM * 0.9);

  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(tableW, 0.09, tableL),
    new THREE.MeshStandardMaterial({ color: 0x22150f, roughness: 0.22, metalness: 0.2 })
  );
  tableTop.position.set(0, 0.76, tableZ);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  group.add(tableTop);

  // Table Center Inset Power Strip
  const centerStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.01, tableL - 1.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.8 })
  );
  centerStrip.position.set(0, 0.81, tableZ);
  group.add(centerStrip);

  // Heavy Base Pillars for Table
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0a0e17, roughness: 0.3, metalness: 0.8 });
  [-tableL * 0.3, tableL * 0.3].forEach((pz) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.72, 0.45), pillarMat);
    pillar.position.set(0, 0.36, tableZ + pz);
    pillar.castShadow = true;
    group.add(pillar);
  });

  // Executive High-Back Ergonomic Chairs
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.1 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.15, metalness: 0.9 });

  const numChairs = Math.max(6, Math.floor(tableL / 1.15));
  const spacing = (tableL - 1.4) / (numChairs - 1);
  const startZ = tableZ - (tableL - 1.4) / 2;

  for (let i = 0; i < numChairs; i++) {
    const cz = startZ + i * spacing;
    [-1.55, 1.55].forEach((cx) => {
      const chairGroup = new THREE.Group();

      // Seat Cushion
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.54), chairMat);
      seat.position.y = 0.48;
      seat.castShadow = true;

      // Curved Backrest
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, 0.52), chairMat);
      back.position.set(cx < 0 ? -0.24 : 0.24, 0.82, 0);
      back.castShadow = true;

      // Chrome Pedestal Leg
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.44, 8), chromeMat);
      post.position.y = 0.22;

      // 5-Star Caster Base
      const starBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 5), chromeMat);
      starBase.position.y = 0.04;

      chairGroup.add(seat, back, post, starBase);
      chairGroup.position.set(cx, 0, cz);
      group.add(chairGroup);
    });
  }

  // Frosted Acoustic Glass Wall on Left Side
  const glassWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 8.5, 20),
    new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transmission: 0.85,
      opacity: 0.65,
      transparent: true,
      roughness: 0.25,
      ior: 1.5
    })
  );
  glassWall.position.set(-wallW / 2 + 0.1, 4.25, 8);
  group.add(glassWall);
}

/**
 * 2. School Auditorium (Assembly & Performance Hall)
 */
export function buildAuditorium(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Auditorium Main Hall Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(45, 55),
    new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.6 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Elevated Parquet Stage Deck
  const stageW = Math.max(14, specs.actualWidthM + 6);
  const stageD = 7.5;
  const stageH = 1.1;

  const stage = new THREE.Mesh(
    new THREE.BoxGeometry(stageW, stageH, stageD),
    new THREE.MeshStandardMaterial({ color: 0x2e1d13, roughness: 0.35, metalness: 0.1 })
  );
  stage.position.set(0, stageH / 2, stageD / 2 - 1.2);
  stage.receiveShadow = true;
  group.add(stage);

  // Stage Front Skirting & Fascia (Dark Charcoal)
  const fascia = new THREE.Mesh(
    new THREE.BoxGeometry(stageW + 0.1, stageH, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 0.8 })
  );
  fascia.position.set(0, stageH / 2, stageD - 1.12);
  group.add(fascia);

  // Proscenium Arch & Deep Crimson Velvet Curtains
  const archH = 9.5;
  const archMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(stageW + 2, 1.4, 0.4), archMat);
  archTop.position.set(0, archH, 0.2);
  group.add(archTop);

  // Velvet Curtains Left & Right (Crimson with Folds)
  const curtainMat = new THREE.MeshStandardMaterial({ color: 0x660708, roughness: 0.75 });
  [-stageW / 2 + 0.8, stageW / 2 - 0.8].forEach((cx) => {
    const curtain = new THREE.Mesh(new THREE.BoxGeometry(2.4, archH - 0.5, 0.3), curtainMat);
    curtain.position.set(cx, (archH - 0.5) / 2 + 0.2, 0.4);
    curtain.castShadow = true;
    group.add(curtain);

    // Golden Curtain Tieback
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 });
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 16), goldMat);
    tie.position.set(cx, 3.2, 0.56);
    group.add(tie);
  });

  // Stage Backdrop Wall behind LED Screen
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(stageW + 4, 10, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 })
  );
  backWall.position.set(0, 5, -0.4);
  backWall.receiveShadow = true;
  group.add(backWall);

  // 4 Stepped Inclined Seating Riser Tiers for Audience
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6 }); // Crimson Red Velvet
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 });

  const numTiers = 4;
  for (let t = 0; t < numTiers; t++) {
    const tierZ = 8.5 + t * 2.8;
    const tierH = (t + 1) * 0.35;

    // Concrete Step Riser
    const riser = new THREE.Mesh(
      new THREE.BoxGeometry(22, tierH, 2.7),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    riser.position.set(0, tierH / 2, tierZ);
    riser.receiveShadow = true;
    group.add(riser);

    // Audience Seats on this Tier
    for (let sx = -9; sx <= 9; sx += 1.35) {
      if (Math.abs(sx) < 1.0) continue; // Center aisle aisle
      const seatGroup = new THREE.Group();

      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.1, 0.48), seatMat);
      cushion.position.y = tierH + 0.42;

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.09), seatMat);
      backrest.position.set(0, tierH + 0.7, -0.2);

      const stanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 8), frameMat);
      stanchion.position.y = tierH + 0.2;

      seatGroup.add(cushion, backrest, stanchion);
      seatGroup.position.set(sx, 0, tierZ);
      group.add(seatGroup);
    }
  }

  // Overhead Stage Lighting Pipe Battens
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 });
  [1.5, 4.0].forEach((pz) => {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, stageW, 12), pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, archH - 0.8, pz);
    group.add(pipe);

    // Hanging Par Cans / Stage Lights
    for (let lx = -stageW / 2 + 2; lx <= stageW / 2 - 2; lx += 2.8) {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.35, 10), frameMat);
      can.position.set(lx, archH - 1.1, pz);
      group.add(can);
    }
  });
}

/**
 * 3. Luxury Hotel Ballroom (5-Star Grand Gala Ballroom)
 */
export function buildBallroom(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Luxurious Damask Patterned Carpet Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x241416, roughness: 0.65, metalness: 0.1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Ornate Coffered Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x140e0e, roughness: 0.75 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 8.8;
  group.add(ceiling);

  // Coffered Ceiling Grid Beams (Warm Ivory & Gold)
  const beamMat = new THREE.MeshStandardMaterial({ color: 0x2e1b12, roughness: 0.4 });
  for (let bx = -18; bx <= 18; bx += 6) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 48), beamMat);
    beam.position.set(bx, 8.6, 12);
    group.add(beam);
  }
  for (let bz = -6; bz <= 30; bz += 6) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(48, 0.45, 0.35), beamMat);
    beam.position.set(0, 8.6, bz);
    group.add(beam);
  }

  // Ballroom Backdrop Feature Wall (Champagne Panels with Gold Molding)
  const wallW = Math.max(26, specs.actualWidthM + 10);
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(wallW, 8.8, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x261918, roughness: 0.5, metalness: 0.15 })
  );
  wall.position.set(0, 4.4, -0.35);
  wall.receiveShadow = true;
  group.add(wall);

  // 3 Ornate Crystal Chandeliers (Emitting Warm Glow)
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25, metalness: 0.85 });
  const crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xffedd5,
    transmission: 0.9,
    roughness: 0.1,
    ior: 1.6
  });

  [-8, 0, 8].forEach((cx) => {
    const chanGroup = new THREE.Group();

    // Central Brass Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.0, 8), brassMat);
    stem.position.y = 7.6;

    // Multi-tier Crystal Tiers
    const tier1 = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 8, 24), crystalMat);
    tier1.rotation.x = Math.PI / 2;
    tier1.position.y = 6.6;

    const tier2 = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.06, 8, 20), crystalMat);
    tier2.rotation.x = Math.PI / 2;
    tier2.position.y = 6.2;

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    bulb.position.y = 6.4;

    chanGroup.add(stem, tier1, tier2, bulb);
    chanGroup.position.set(cx, 0, 7.5);
    group.add(chanGroup);
  });

  // 4 Elegant Banquet Round Tables (Ivory Cloths with 16 Chiavari Chairs)
  const linenMat = new THREE.MeshStandardMaterial({ color: 0xfaf5ef, roughness: 0.5 });
  const goldChairMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });

  const tableCoords = [
    [-4.5, 6.5],
    [4.5, 6.5],
    [-5.5, 12.0],
    [5.5, 12.0]
  ];

  tableCoords.forEach(([tx, tz]) => {
    const table = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.76, 24), linenMat);
    table.position.set(tx, 0.38, tz);
    table.castShadow = true;
    table.receiveShadow = true;
    group.add(table);

    // Centerpiece Vase
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.45, 12), brassMat);
    vase.position.set(tx, 0.98, tz);
    group.add(vase);

    // 4 Chiavari Chairs around Table
    for (let a = 0; a < 4; a++) {
      const angle = (a * Math.PI) / 2 + Math.PI / 4;
      const chairX = tx + Math.cos(angle) * 1.45;
      const chairZ = tz + Math.sin(angle) * 1.45;

      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.42), goldChairMat);
      chair.position.set(chairX, 0.225, chairZ);
      chair.castShadow = true;
      group.add(chair);
    }
  });
}

/**
 * 4. Shopping Mall Atrium (Multi-Tier Commercial Atrium)
 */
export function buildMallAtrium(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Ultra-High Polish Reflective White Marble Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.12, metalness: 0.25 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Architectural Columns with Stainless Steel / Metallic Sheen
  const colMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.85 });
  [-9, 9].forEach((cx) => {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 16, 24), colMat);
    column.position.set(cx, 8, -0.6);
    column.castShadow = true;
    group.add(column);
  });

  // Feature Back Wall behind LED Display
  const wallW = Math.max(22, specs.actualWidthM + 8);
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(wallW, 16, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.2 })
  );
  wall.position.set(0, 8, -0.9);
  wall.receiveShadow = true;
  group.add(wall);

  // 2-Tier Curved Balcony Mezzanines (Tier 1 @ 5m, Tier 2 @ 10m)
  const railMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.1, metalness: 0.9 });
  const glassRailMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transmission: 0.85,
    opacity: 0.5,
    transparent: true,
    roughness: 0.1
  });

  [5.0, 10.0].forEach((tierY) => {
    [-13, 13].forEach((bx) => {
      // Mezzanine Slab
      const slab = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 24), colMat);
      slab.position.set(bx, tierY, 8);
      group.add(slab);

      // Glass Guardrail
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 24), glassRailMat);
      rail.position.set(bx < 0 ? bx + 3.9 : bx - 3.9, tierY + 0.72, 8);
      group.add(rail);

      // Chrome Top Rail Handrail
      const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 24), railMat);
      handrail.position.set(bx < 0 ? bx + 3.9 : bx - 3.9, tierY + 1.25, 8);
      group.add(handrail);
    });
  });

  // Twin Criss-Crossing Diagonal Escalators
  const escTrussMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
  const handrailBeltMat = new THREE.MeshBasicMaterial({ color: 0x020617 });

  const esc1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 9.5), escTrussMat);
  esc1.rotation.x = Math.PI / 6; // 30-degree incline
  esc1.position.set(-5.5, 2.5, 9.5);
  group.add(esc1);

  const esc2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 9.5), escTrussMat);
  esc2.rotation.x = -Math.PI / 6;
  esc2.position.set(5.5, 2.5, 9.5);
  group.add(esc2);

  // Skylight Glass Truss Canopy at High Ceiling (15m)
  const roofTruss = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 36),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7, wireframe: true })
  );
  roofTruss.rotation.x = Math.PI / 2;
  roofTruss.position.y = 15;
  group.add(roofTruss);
}
