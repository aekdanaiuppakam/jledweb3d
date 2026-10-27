import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildAuditorium, buildBallroom, buildMallAtrium } from '../src/3d/environments/indoor.js';

// A small geometry recorder checks placement against the display plane without
// depending on WebGL. It does not attempt to judge the rendered appearance.
class Vector {
  constructor() { this.x = 0; this.y = 0; this.z = 0; }
  set(x, y, z) { Object.assign(this, { x, y, z }); return this; }
}
class Group {
  constructor() { this.children = []; this.position = new Vector(); this.rotation = new Vector(); this.userData = {}; }
  add(...items) { this.children.push(...items); }
  clone() { const copy = new Group(); copy.children = this.children.map(item => item.clone()); return copy; }
}
class Geometry {
  constructor(type, ...dimensions) { this.type = type; this.dimensions = dimensions; }
}
class Mesh extends Group {
  constructor(geometry, material) { super(); this.geometry = geometry; this.material = material; }
  clone() {
    const copy = new Mesh(this.geometry, this.material);
    copy.position.set(this.position.x, this.position.y, this.position.z);
    copy.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    return copy;
  }
}
class Material { constructor(options = {}) { Object.assign(this, options); } }
const fakeThree = {
  Group, Mesh, MeshStandardMaterial: Material, Color: class { constructor(value) { this.value = value; } },
  BoxGeometry: class extends Geometry { constructor(...d) { super('box', ...d); } },
  CylinderGeometry: class extends Geometry { constructor(...d) { super('cylinder', ...d); } },
  PlaneGeometry: class extends Geometry { constructor(...d) { super('plane', ...d); } },
  TorusGeometry: class extends Geometry { constructor(...d) { super('torus', ...d); } },
  DoubleSide: 2
};

describe('Indoor scene screen clearance', () => {
  for (const [name, build] of [['auditorium', buildAuditorium], ['ballroom', buildBallroom], ['mall', buildMallAtrium]]) {
    it(`${name} keeps the screen plane clear as the assembled size changes`, () => {
      globalThis.THREE = fakeThree;
      try {
        for (const screen of [{ w: 4, h: 2.5, bottom: 1 }, { w: 12, h: 4, bottom: 2 }, { w: 2, h: 7, bottom: 0.2 }]) {
          const group = new Group();
          build(group, { elevationMm: screen.bottom * 1000 }, { actualWidthM: screen.w, actualHeightM: screen.h });
          assert.ok(group.userData.sceneBounds.width > screen.w);
          assert.ok(group.userData.sceneBounds.height > screen.bottom + screen.h);
          // Only root meshes can reach the wall; seating groups live well in front.
          for (const item of group.children) {
            if (item.geometry?.type !== 'box' || item.rotation.x || item.rotation.y || item.rotation.z) continue;
            const [width, height, depth] = item.geometry.dimensions;
            const { x, y, z } = item.position;
            const crossesPlane = z - depth / 2 < 0.005 && z + depth / 2 > 0.005;
            const overlapsX = x - width / 2 < screen.w / 2 && x + width / 2 > -screen.w / 2;
            const overlapsY = y - height / 2 < screen.bottom + screen.h && y + height / 2 > screen.bottom;
            assert.ok(!(crossesPlane && overlapsX && overlapsY), `${name} blocks a ${screen.w} × ${screen.h} m display`);
          }
          const hanging = new Group();
          build(hanging, { elevationMm: screen.bottom * 1000, mountType: 'hanging' }, { actualWidthM: screen.w, actualHeightM: screen.h });
          assert.ok(hanging.userData.sceneBounds.height >= screen.bottom + screen.h + 3.2, `${name} needs space above a hanging rig`);

          const truss = new Group();
          build(truss, { elevationMm: screen.bottom * 1000, mountType: 'truss' }, { actualWidthM: screen.w, actualHeightM: screen.h });
          for (const baseX of [-screen.w / 2 - 0.22, screen.w / 2 + 0.22]) {
            for (const item of truss.children) {
              if (item.geometry?.type !== 'box' || item.rotation.x || item.rotation.y || item.rotation.z) continue;
              const [width, height, depth] = item.geometry.dimensions;
              if (height < 0.02) continue; // Thin floor finish and joints can meet a baseplate.
              const { x, y, z } = item.position;
              const overlapsX = x - width / 2 < baseX + 0.45 && x + width / 2 > baseX - 0.45;
              const overlapsY = y - height / 2 < 0.08 && y + height / 2 > 0;
              const overlapsZ = z - depth / 2 < 1.35 && z + depth / 2 > -0.04;
              assert.ok(!(overlapsX && overlapsY && overlapsZ), `${name} intersects a truss baseplate`);
            }
          }
        }
      } finally { delete globalThis.THREE; }
    });
  }
});
