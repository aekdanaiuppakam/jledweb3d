import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildConcertStage, buildExhibitionBooth, buildRetailStore, buildCorporateLobby } from '../src/3d/environments/event.js';

// Record placements without WebGL. Visual quality still needs a rendered review.
class Vector {
  constructor(x = 0, y = 0, z = 0) { this.set(x, y, z); }
  set(x, y, z) { Object.assign(this, { x, y, z }); return this; }
  clone() { return new Vector(this.x, this.y, this.z); }
  copy(other) { return this.set(other.x, other.y, other.z); }
  add(other) { return this.set(this.x + other.x, this.y + other.y, this.z + other.z); }
  sub(other) { return this.set(this.x - other.x, this.y - other.y, this.z - other.z); }
  multiplyScalar(value) { return this.set(this.x * value, this.y * value, this.z * value); }
  length() { return Math.hypot(this.x, this.y, this.z); }
  normalize() { return this.multiplyScalar(1 / (this.length() || 1)); }
}
class Geometry {
  constructor(type, ...dimensions) { this.type = type; this.dimensions = dimensions; }
}
class Mesh {
  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.position = new Vector();
    this.rotation = new Vector();
    this.scale = new Vector(1, 1, 1);
    this.quaternion = { setFromUnitVectors() {} };
  }
}
class Material { constructor(options = {}) { Object.assign(this, options); } }
class Group {
  constructor() { this.children = []; this.userData = {}; }
  add(...items) { this.children.push(...items); }
}
const fakeThree = {
  Mesh, MeshStandardMaterial: Material, Vector3: Vector, DoubleSide: 2,
  BoxGeometry: class extends Geometry { constructor(...d) { super('box', ...d); } },
  PlaneGeometry: class extends Geometry { constructor(...d) { super('plane', ...d); } },
  CylinderGeometry: class extends Geometry { constructor(...d) { super('cylinder', ...d); } },
  SphereGeometry: class extends Geometry { constructor(...d) { super('sphere', ...d); } }
};

describe('Event scene screen and mount clearances', () => {
  for (const [name, build] of [
    ['concert', buildConcertStage], ['exhibition', buildExhibitionBooth],
    ['retail', buildRetailStore], ['lobby', buildCorporateLobby]
  ]) {
    it(`${name} leaves an unobstructed display and room for mounts at different sizes`, () => {
      const previousThree = globalThis.THREE;
      globalThis.THREE = fakeThree;
      try {
        for (const screen of [
          { w: 4, h: 2.5, bottom: 1 }, { w: 12, h: 4, bottom: 2 }, { w: 2, h: 7, bottom: 0.2 }
        ]) {
          for (const mountType of ['wall', 'hanging', 'truss']) {
            const group = new Group();
            build(group, { elevationMm: screen.bottom * 1000, mountType }, {
              actualWidthM: screen.w, actualHeightM: screen.h
            });
            assert.ok(group.children.length > 10, `${name} did not build the environment`);
            const ceiling = group.userData.sceneBounds?.height ?? group.userData.mountCeilingY;
            assert.ok(ceiling >= screen.bottom + screen.h + 0.7, `${name} needs clearance for the hanging rig`);
            if (group.userData.sceneBounds) {
              assert.ok(group.userData.sceneBounds.width > screen.w);
              assert.ok(group.userData.sceneBounds.depth > 6);
            }

            for (const item of group.children) {
              const geo = item.geometry;
              if (!geo || (geo.type !== 'box' && geo.type !== 'plane') || item.rotation.x || item.rotation.y || item.rotation.z) continue;
              const [w, h, d = 0] = geo.dimensions;
              const p = item.position;
              const overlapsX = p.x - w / 2 < screen.w / 2 - 0.01 && p.x + w / 2 > -screen.w / 2 + 0.01;
              const overlapsY = p.y - h / 2 < screen.bottom + screen.h - 0.01 && p.y + h / 2 > screen.bottom + 0.01;
              assert.ok(!(p.z + d / 2 > 0 && overlapsX && overlapsY), `${name} has geometry in front of the display`);

              if (mountType === 'truss' && geo.type === 'box' && h >= 0.02) {
                for (const x of [-screen.w / 2 - 0.22, screen.w / 2 + 0.22]) {
                  const footX = p.x - w / 2 < x + 0.45 && p.x + w / 2 > x - 0.45;
                  const footY = p.y - h / 2 < 0.08 && p.y + h / 2 > 0;
                  const footZ = p.z - d / 2 < 1.36 && p.z + d / 2 > -0.04;
                  assert.ok(!(footX && footY && footZ), `${name} intersects a truss baseplate`);
                }
              }
            }
          }
        }
      } finally {
        if (previousThree === undefined) delete globalThis.THREE;
        else globalThis.THREE = previousThree;
      }
    });
  }
});
