/**
 * JLED DESIGN STUDIO v4.1 — Outdoor 3D Environments (4 Environments)
 * 5. Roadside LED Billboard
 * 6. School Entrance
 * 7. Government Building
 * 8. Commercial Building Facade
 */

/**
 * 5. Roadside LED Billboard (Expressway / Highway Monopole Pylon)
 */
export function buildBillboard(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Ground Grass & Shoulder Terrain
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshStandardMaterial({ color: 0x0c130e, roughness: 0.9 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  // 4-Lane Asphalt Highway Roadway
  const roadW = 120;
  const roadD = 16;
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(roadW, roadD),
    new THREE.MeshStandardMaterial({ color: 0x111620, roughness: 0.75, metalness: 0.1 })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.02, 14);
  road.receiveShadow = true;
  group.add(road);

  // Highway Yellow Dashed Center Line
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  for (let rx = -50; rx <= 50; rx += 7.5) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 0.22), lineMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(rx, 0.04, 14);
    group.add(dash);
  }

  // White Shoulder Road Markings
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  [-7.5, 7.5].forEach((offsetZ) => {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(roadW, 0.25), whiteMat);
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(0, 0.035, 14 + offsetZ);
    group.add(edge);
  });

  // Corrugated Galvanized Steel Guardrails
  const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.85 });
  const railBeam = new THREE.Mesh(new THREE.BoxGeometry(roadW, 0.35, 0.08), railMat);
  railBeam.position.set(0, 0.75, 5.8);
  group.add(railBeam);

  for (let postX = -55; postX <= 55; postX += 3.5) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.12), railMat);
    post.position.set(postX, 0.42, 5.8);
    group.add(post);
  }

  // Heavy-Duty Monopole Billboard Steel Pylon Structure
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.75 });
  const pylonH = Math.max(7.5, (state.elevationMm || 3500) / 1000 + specs.actualHeightM * 0.4);

  const mainPole = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.95, pylonH, 20), pylonMat);
  mainPole.position.set(0, pylonH / 2, -0.6);
  mainPole.castShadow = true;
  group.add(mainPole);

  // Concrete Pylon Foundation Pedestal
  const foot = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.6, 0.6, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
  );
  foot.position.set(0, 0.3, -0.6);
  group.add(foot);

  // Billboard Maintenance Catwalk & Safety Cage behind Screen
  const catwalkW = specs.actualWidthM + 1.6;
  const catwalkY = (state.elevationMm || 3500) / 1000 - 0.25;

  const catwalk = new THREE.Mesh(
    new THREE.BoxGeometry(catwalkW, 0.15, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 })
  );
  catwalk.position.set(0, catwalkY, -0.6);
  group.add(catwalk);

  // Catwalk Safety Handrail
  const cageRail = new THREE.Mesh(new THREE.BoxGeometry(catwalkW, 0.95, 0.06), railMat);
  cageRail.position.set(0, catwalkY + 0.55, -1.18);
  group.add(cageRail);

  // Highway LED Luminaire Lighting Poles
  const lumPoleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
  [-16, 16].forEach((lx) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 9.5, 10), lumPoleMat);
    pole.position.set(lx, 4.75, 5.5);
    pole.castShadow = true;

    // Curved Arm & Lamp Head
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.08), lumPoleMat);
    arm.position.set(lx < 0 ? lx + 0.8 : lx - 0.8, 9.4, 6.2);

    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffedd5 }));
    lamp.position.set(lx < 0 ? lx + 1.6 : lx - 1.6, 9.35, 6.2);

    group.add(pole, arm, lamp);
  });
}

/**
 * 6. School Entrance (Academic Institution Gateway Plaza)
 */
export function buildSchoolEntrance(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Paved Driveway & Entrance Plaza Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // White Painted Pedestrian Crosswalk
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  for (let z = 6.5; z <= 11.5; z += 1.1) {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.55), whiteMat);
    bar.rotation.x = -Math.PI / 2;
    bar.position.set(0, 0.025, z);
    group.add(bar);
  }

  // Grand Entrance Gateway Pillars (Brick & White Stone Caps)
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.7 }); // Red Brick
  const capMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 }); // Stone Cap

  const gateW = Math.max(12, specs.actualWidthM + 4);
  [-gateW / 2, gateW / 2].forEach((gx) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.5, 1.4), pillarMat);
    pillar.position.set(gx, 2.75, 1.5);
    pillar.castShadow = true;

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.35, 1.65), capMat);
    cap.position.set(gx, 5.65, 1.5);

    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), capMat);
    globe.position.set(gx, 6.05, 1.5);

    group.add(pillar, cap, globe);
  });

  // Wrought Iron Security Gate Wings (Dark Cast Iron)
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.85 });
  const gateLeft = new THREE.Mesh(new THREE.BoxGeometry(gateW / 2 - 1.2, 3.2, 0.08), ironMat);
  gateLeft.position.set(-gateW / 4, 1.6, 1.5);
  const gateRight = new THREE.Mesh(new THREE.BoxGeometry(gateW / 2 - 1.2, 3.2, 0.08), ironMat);
  gateRight.position.set(gateW / 4, 1.6, 1.5);
  group.add(gateLeft, gateRight);

  // Institution Monument LED Display Wall (Backing behind the LED screen)
  const monumentW = Math.max(8, specs.actualWidthM + 2.4);
  const monumentH = Math.max(5, specs.actualHeightM + 2.0);
  const monument = new THREE.Mesh(
    new THREE.BoxGeometry(monumentW, monumentH, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
  );
  monument.position.set(0, monumentH / 2, -0.6);
  monument.castShadow = true;
  group.add(monument);

  // National Flagpole Pedestal with Tiered Marble Base & Brass Pole
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 2.0), marbleMat);
  base1.position.set(gateW / 2 + 3.5, 0.125, 4.5);
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.4), marbleMat);
  base2.position.set(gateW / 2 + 3.5, 0.4, 4.5);

  const brassPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.075, 11, 16),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.9 })
  );
  brassPole.position.set(gateW / 2 + 3.5, 5.8, 4.5);
  group.add(base1, base2, brassPole);

  // Landscaped Green Planter Boxes & Hedges
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 });
  [-gateW / 2 - 2.5, gateW / 2 + 1.2].forEach((hx) => {
    const hedge = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.9, 1.2), bushMat);
    hedge.position.set(hx, 0.45, 2.8);
    group.add(hedge);
  });
}

/**
 * 7. Government Building (Majestic Neoclassical Civic Colonnade)
 */
export function buildGovBuilding(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // Broad Civic Plaza Granite Paver Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.15 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // Broad Monumental Granite Grand Staircase (6 Tiers)
  const stepMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.45 });
  const stepCount = 6;
  for (let s = 0; s < stepCount; s++) {
    const stepH = 0.22;
    const stepY = (s + 0.5) * stepH;
    const stepD = 1.0;
    const stepZ = (stepCount - 1 - s) * stepD + 0.5;

    const step = new THREE.Mesh(new THREE.BoxGeometry(36, stepH, stepD), stepMat);
    step.position.set(0, stepY, stepZ);
    step.receiveShadow = true;
    group.add(step);
  }

  // Neoclassical Fluted Colonnade (8 Tall Columns)
  const colMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 });
  const colH = 11.5;
  const colY = 1.32 + colH / 2;

  for (let cx = -15; cx <= 15; cx += 4.28) {
    // Avoid blocking screen directly if small
    if (Math.abs(cx) < specs.actualWidthM / 2 - 0.4) continue;

    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, colH, 24), colMat);
    column.position.set(cx, colY, 0.2);
    column.castShadow = true;

    // Capital & Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), colMat);
    base.position.set(cx, 1.52, 0.2);
    const capital = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.45, 1.45), colMat);
    capital.position.set(cx, colY + colH / 2, 0.2);

    group.add(column, base, capital);
  }

  // Monumental Pediment & Entablature Beam
  const entablature = new THREE.Mesh(new THREE.BoxGeometry(38, 1.6, 1.8), colMat);
  entablature.position.set(0, 1.32 + colH + 0.8, 0.2);
  group.add(entablature);

  // Massive Granite Back Facade Wall
  const facade = new THREE.Mesh(
    new THREE.BoxGeometry(38, 15, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
  );
  facade.position.set(0, 7.5, -1.2);
  facade.receiveShadow = true;
  group.add(facade);

  // Civic Flagpole Monuments Left & Right
  const flagMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 });
  [-16, 16].forEach((fx) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 12, 16), flagMat);
    pole.position.set(fx, 6.0, 7.5);
    group.add(pole);
  });
}

/**
 * 8. Commercial Building Facade (Glass Curtain-Wall High-Rise Tower)
 */
export function buildBuildingFacade(group, state, specs) {
  if (typeof THREE === 'undefined') return;

  // City Sidewalk & Pavement
  const sidewalk = new THREE.Mesh(
    new THREE.PlaneGeometry(75, 75),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.55 })
  );
  sidewalk.rotation.x = -Math.PI / 2;
  sidewalk.receiveShadow = true;
  group.add(sidewalk);

  // Granite Sidewalk Curb & Street Asphalt
  const street = new THREE.Mesh(
    new THREE.PlaneGeometry(75, 18),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
  );
  street.rotation.x = -Math.PI / 2;
  street.position.set(0, 0.02, 15);
  street.receiveShadow = true;
  group.add(street);

  const curb = new THREE.Mesh(
    new THREE.BoxGeometry(75, 0.2, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 })
  );
  curb.position.set(0, 0.1, 5.8);
  group.add(curb);

  // High-Rise Skyscraper Glass Curtain Wall Facade
  const bldgW = Math.max(32, specs.actualWidthM + 12);
  const bldgH = 22;

  // Main Core Wall behind Glass
  const coreWall = new THREE.Mesh(
    new THREE.BoxGeometry(bldgW, bldgH, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.7 })
  );
  coreWall.position.set(0, bldgH / 2, -1.8);
  group.add(coreWall);

  // Reflective Architectural Glass Panels & Structural Steel Mullions
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.7,
    roughness: 0.1,
    metalness: 0.8,
    ior: 1.52,
    reflectivity: 0.95
  });
  const glassFacade = new THREE.Mesh(new THREE.PlaneGeometry(bldgW, bldgH), glassMat);
  glassFacade.position.set(0, bldgH / 2, -0.45);
  group.add(glassFacade);

  // Structural Steel Vertical Mullions
  const mullionMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
  for (let mx = -bldgW / 2 + 1.8; mx <= bldgW / 2 - 1.8; mx += 2.8) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.12, bldgH, 0.15), mullionMat);
    mullion.position.set(mx, bldgH / 2, -0.38);
    group.add(mullion);
  }

  // Modern Cantilevered Steel & Glass Entrance Canopy / Portico
  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(bldgW * 0.75, 0.35, 4.2),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.85 })
  );
  canopy.position.set(0, 4.6, 1.8);
  canopy.castShadow = true;
  group.add(canopy);

  // Urban Stainless Steel Pedestrian Bollards on Sidewalk
  const bollardMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.15, metalness: 0.95 });
  for (let bx = -25; bx <= 25; bx += 4.5) {
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 14), bollardMat);
    bollard.position.set(bx, 0.45, 5.4);
    group.add(bollard);
  }
}
