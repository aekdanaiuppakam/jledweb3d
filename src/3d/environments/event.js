/**
 * JLED DESIGN STUDIO v4.1 — Event & Specialty 3D Environments (4 Environments)
 * 9. Mega Concert Stage
 * 10. Exhibition Trade Booth
 * 11. Retail Store / Transparent LED
 * 12. Corporate Lobby / LED Kiosk
 */

/**
 * 9. Mega Concert Stage (Arena / Festival Rock Stage)
 */
export function buildConcertStage(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Festival Arena Ground Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(85, 85),
    new THREE.MeshStandardMaterial({ color: 0x050811, roughness: 0.85 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Heavy Black Concert Stage Deck
  const stageW = Math.max(16, specs.actualWidthM + 6);
  const stageD = 9.5;
  const stageH = 1.6;

  const stage = new THREE.Mesh(
    new THREE.BoxGeometry(stageW, stageH, stageD),
    new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.6, metalness: 0.3 })
  );
  stage.position.set(0, stageH / 2, stageD / 2 - 1.2);
  stage.receiveShadow = true;
  group.add(stage);

  // Heavy Aluminum Box-Truss Superstructure Grid
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.9, wireframe: true });
  const trussH = 14;

  // 4 Main Vertical Corner Truss Pillars
  [
    [-stageW / 2 + 0.6, -1.0],
    [stageW / 2 - 0.6, -1.0],
    [-stageW / 2 + 0.6, stageD - 1.5],
    [stageW / 2 - 0.6, stageD - 1.5]
  ].forEach(([tx, tz]) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.85, trussH, 0.85), trussMat);
    pillar.position.set(tx, trussH / 2, tz);
    group.add(pillar);
  });

  // Overhead Box-Truss Roof Grid
  const roofTruss = new THREE.Mesh(new THREE.BoxGeometry(stageW + 1.2, 0.85, stageD + 0.8), trussMat);
  roofTruss.position.set(0, trussH, (stageD - 2.5) / 2);
  group.add(roofTruss);

  // Subwoofer Bass Speaker Stacks (Left & Right)
  const subMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });
  [-stageW / 2 + 1.8, stageW / 2 - 1.8].forEach((sx) => {
    for (let sy = 0; sy < 3; sy++) {
      const sub = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.85, 1.2), subMat);
      sub.position.set(sx, stageH + 0.45 + sy * 0.9, 0.8);
      sub.castShadow = true;
      group.add(sub);
    }
  });

  // Hanging Line-Array Speaker Curve Arrays
  [-stageW / 2 - 0.6, stageW / 2 + 0.6].forEach((lax) => {
    for (let i = 0; i < 5; i++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.7), subMat);
      box.rotation.x = (i * Math.PI) / 36; // J-curve tilt
      box.position.set(lax, trussH - 2.0 - i * 0.65, 3.5 + i * 0.15);
      group.add(box);
    }
  });

  // Moving Head Stage Lights & Colored Volumetric Cones
  const beamColors = [0x00e5ff, 0xa855f7, 0xff0055, 0x00e5ff, 0xffb800];
  for (let b = 0; b < 5; b++) {
    const bx = -stageW / 2 + 2.5 + b * ((stageW - 5) / 4);
    const color = beamColors[b];

    // Fixture Head
    const head = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.45, 10),
      new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.8 })
    );
    head.position.set(bx, trussH - 0.6, 2.5);
    group.add(head);

    // Translucent Colored Light Beam Cone
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 11, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    cone.position.set(bx, (trussH - 0.6) / 2, 2.5);
    cone.rotation.z = (b - 2) * 0.08; // Slight fanning
    group.add(cone);
  }
}

/**
 * 10. Exhibition Booth (20x20 Trade-Show Island Convention Booth)
 */
export function buildExhibitionBooth(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Convention Hall Base Floor
  const hallFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
  );
  hallFloor.rotation.x = -Math.PI / 2;
  hallFloor.receiveShadow = true;
  group.add(hallFloor);

  // Booth Platform Floor (Dark Charcoal Needle-Punch Carpet)
  const boothW = Math.max(10, specs.actualWidthM + 4);
  const boothD = 8.5;
  const booth = new THREE.Mesh(
    new THREE.BoxGeometry(boothW, 0.1, boothD),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 })
  );
  booth.position.set(0, 0.05, boothD / 2 - 1.0);
  booth.receiveShadow = true;
  group.add(booth);

  // Aluminum Transition Beveled Trim around Booth Edge
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.2, metalness: 0.9 });
  const trim = new THREE.Mesh(new THREE.BoxGeometry(boothW + 0.1, 0.04, boothD + 0.1), trimMat);
  trim.position.set(0, 0.02, boothD / 2 - 1.0);
  group.add(trim);

  // Booth Architectural Back Wall behind Screen
  const wallW = Math.max(8, specs.actualWidthM + 2.5);
  const wallH = Math.max(5.5, specs.actualHeightM + 2.0);
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallW, wallH, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 })
  );
  backWall.position.set(0, wallH / 2, -0.4);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Sleek Curved Reception Counter with Backlit JLED Cyan Edge
  const counterW = 2.4;
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(counterW, 1.05, 0.75),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.1 })
  );
  counter.position.set(boothW / 2 - 2.2, 0.55, 3.8);
  counter.castShadow = true;
  group.add(counter);

  // Glowing Cyan Backlit Edge Strip
  const glowStrip = new THREE.Mesh(
    new THREE.BoxGeometry(counterW + 0.02, 0.06, 0.06),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff })
  );
  glowStrip.position.set(boothW / 2 - 2.2, 0.98, 4.2);
  group.add(glowStrip);

  // Literature / Brochure Display Rack
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85 });
  const rack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.35, 0.4), rackMat);
  rack.position.set(-boothW / 2 + 1.8, 0.68, 3.5);
  rack.castShadow = true;
  group.add(rack);

  // Overhead 4-Sided Hanging Square Box-Truss Banner
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.9, wireframe: true });
  const bannerTruss = new THREE.Mesh(new THREE.BoxGeometry(boothW * 0.8, 0.45, boothD * 0.7), trussMat);
  bannerTruss.position.set(0, 6.8, boothD / 2 - 1.0);
  group.add(bannerTruss);

  // Hanging Steel Cables
  const cableMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
  [
    [-boothW * 0.38, -0.5],
    [boothW * 0.38, -0.5],
    [-boothW * 0.38, boothD - 1.5],
    [boothW * 0.38, boothD - 1.5]
  ].forEach(([cx, cz]) => {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 4.5, 6), cableMat);
    cable.position.set(cx, 9.05, cz);
    group.add(cable);
  });
}

/**
 * 11. Retail Store / Transparent LED (Luxury Boutique Storefront)
 */
export function buildRetailStore(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Boutique Chevron Light Oak Parquet Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(35, 35),
    new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.35, metalness: 0.1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Boutique Ceiling with Track Light Rails
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(35, 35),
    new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 0.85 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 6.5;
  group.add(ceiling);

  // Track Light Rails with Spotlights
  const railMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.9 });
  const spotMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
  for (let tz = 1; tz <= 7; tz += 2.8) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(22, 0.05, 0.05), railMat);
    rail.position.set(0, 6.44, tz);
    group.add(rail);

    for (let sx = -8; sx <= 8; sx += 3.2) {
      const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.22, 8), spotMat);
      spot.position.set(sx, 6.32, tz);
      group.add(spot);
    }
  }

  // Floor-to-Ceiling Ultra-Clear Glass Storefront Window
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.92,
    opacity: 0.35,
    transparent: true,
    roughness: 0.05,
    ior: 1.52,
    reflectivity: 0.9
  });
  const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(24, 6.5), glassMat);
  windowGlass.position.set(0, 3.25, 3.5);
  group.add(windowGlass);

  // Black Architectural Window Frame Mullions
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.2, metalness: 0.8 });
  [-12, 12].forEach((fx) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 6.5, 0.25), frameMat);
    post.position.set(fx, 3.25, 3.5);
    group.add(post);
  });

  // Minimalist Terrazzo Display Pedestals for Mannequins / Products
  const pedMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
  [-4.5, 4.5].forEach((px) => {
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.65, 20), pedMat);
    pedestal.position.set(px, 0.325, 1.8);
    pedestal.castShadow = true;
    group.add(pedestal);

    // Mannequin Torso Silhouette
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.75, 12),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 })
    );
    torso.position.set(px, 1.05, 1.8);
    torso.castShadow = true;
    group.add(torso);
  });

  // Minimalist Boutique Interior Feature Wall
  const wallW = Math.max(18, specs.actualWidthM + 6);
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallW, 6.5, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x182030, roughness: 0.5 })
  );
  backWall.position.set(0, 3.25, -0.4);
  backWall.receiveShadow = true;
  group.add(backWall);
}

/**
 * 12. Corporate Lobby / LED Kiosk (Double-Height HQ Reception)
 */
export function buildCorporateLobby(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Ultra-Luxury Bookmatched Marble Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(55, 55),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.18, metalness: 0.3 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Double-Height Lobby Ceiling (8.5m)
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(55, 55),
    new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.8 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 8.5;
  group.add(ceiling);

  // Bookmatched Italian Calacatta Marble Feature Wall
  const wallW = Math.max(24, specs.actualWidthM + 8);
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(wallW, 8.5, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x1a2436, roughness: 0.25, metalness: 0.2 })
  );
  wall.position.set(0, 4.25, -0.5);
  wall.receiveShadow = true;
  group.add(wall);

  // Fluted Architectural Columns (Circular with Metallic Trim)
  const colMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.7 });
  [-8.5, 8.5].forEach((cx) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 8.5, 24), colMat);
    col.position.set(cx, 4.25, 0.2);
    col.castShadow = true;
    group.add(col);
  });

  // Curved Reception Desk (White Marble with Brushed Brass Kickplate)
  const deskMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.85 });

  const deskGroup = new THREE.Group();
  const deskBody = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 1.2), deskMat);
  deskBody.position.y = 0.55;
  deskBody.castShadow = true;

  const brassTrim = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.15, 1.25), brassMat);
  brassTrim.position.y = 0.075;

  deskGroup.add(deskBody, brassTrim);
  deskGroup.position.set(0, 0, 7.5);
  group.add(deskGroup);

  // Optical Glass Turnstile Security Gates (4 Speed Gates)
  const gateMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.15, metalness: 0.9 });
  const wingGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x00e5ff,
    transmission: 0.9,
    transparent: true,
    opacity: 0.6,
    roughness: 0.05
  });

  for (let gx = -3.6; gx <= 3.6; gx += 1.8) {
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.05, 1.4), gateMat);
    pedestal.position.set(gx, 0.525, 11.5);
    pedestal.castShadow = true;

    // Optical Glowing Swing Glass Barrier
    const glassWing = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, 0.45), wingGlassMat);
    glassWing.position.set(gx < 0 ? gx + 0.35 : gx - 0.35, 0.75, 11.5);

    group.add(pedestal, glassWing);
  }

  // Indoor Architectural Ficus Tree Planter
  const potMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

  [-wallW / 2 + 1.8, wallW / 2 - 1.8].forEach((tx) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.5, 0.9, 16), potMat);
    pot.position.set(tx, 0.45, 1.8);

    const foliage = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), foliageMat);
    foliage.position.set(tx, 2.2, 1.8);

    group.add(pot, foliage);
  });
}
