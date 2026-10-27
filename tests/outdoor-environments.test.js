import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBillboard, buildSchoolEntrance, buildGovBuilding, buildBuildingFacade
} from '../src/3d/environments/outdoor.js';

// A small geometry stand-in lets the scene builders run without a WebGL context.
class Vector {
  constructor(x = 0, y = 0, z = 0) { this.set(x, y, z); }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
}
class BoxGeometry {
  constructor(width, height, depth) { this.size = [width, height, depth]; }
}
class PlaneGeometry {
  constructor(width, height) { this.size = [width, height, 0]; this.isPlane = true; }
}
class CylinderGeometry {
  constructor(top, bottom, height) { this.size = [2 * Math.max(top, bottom), height, 2 * Math.max(top, bottom)]; }
}
class SphereGeometry {
  constructor(radius) { this.size = [radius * 2, radius * 2, radius * 2]; }
}
class Mesh {
  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.position = new Vector();
    this.rotation = new Vector();
    this.scale = new Vector(1, 1, 1);
  }
}
class Material { constructor(options) { Object.assign(this, options); } }

const builders = [
  ['billboard', buildBillboard], ['school entrance', buildSchoolEntrance],
  ['civic plaza', buildGovBuilding], ['building facade', buildBuildingFacade]
];

describe('Outdoor display sightlines', () => {
  it('keeps environment geometry out of the screen opening for different sizes and positions', () => {
    const originalThree = globalThis.THREE;
    globalThis.THREE = { BoxGeometry, PlaneGeometry, CylinderGeometry, SphereGeometry, Mesh, MeshStandardMaterial: Material };
    try {
      for (const [name, build] of builders) {
        for (const sample of [
          { width: 4, height: 2.5, elevation: 2, x: 0, z: 0 },
          { width: 7, height: 4, elevation: 0.5, x: 2, z: -3 }
        ]) {
          const group = { children: [], add(...objects) { this.children.push(...objects); } };
          build(group, { elevationMm: sample.elevation * 1000, positionXMm: sample.x * 1000, positionZMm: sample.z * 1000 }, {
            actualWidthM: sample.width, actualHeightM: sample.height
          });
          assert.ok(group.children.length > 10, name + ' did not build a scene');
          for (const mesh of group.children) {
            let [w, h, d] = mesh.geometry.size;
            if (mesh.geometry.isPlane && Math.abs(mesh.rotation.x + Math.PI / 2) < 0.001) [h, d] = [d, h];
            w *= mesh.scale.x; h *= mesh.scale.y; d *= mesh.scale.z;
            const p = mesh.position;
            const overlapsX = p.x + w / 2 > sample.x - sample.width / 2 + 0.02 &&
              p.x - w / 2 < sample.x + sample.width / 2 - 0.02;
            const overlapsY = p.y + h / 2 > sample.elevation + 0.02 &&
              p.y - h / 2 < sample.elevation + sample.height - 0.02;
            assert.ok(!(p.z + d / 2 > sample.z + 0.01 && overlapsX && overlapsY),
              name + ' has foreground geometry in the display opening');
          }
        }
      }

      // Explicit verification for 70m high-elevation billboard
      const billboardGroup = { children: [], add(...objects) { this.children.push(...objects); } };
      buildBillboard(billboardGroup, { elevationMm: 70000, positionXMm: 0, positionZMm: 0 }, {
        actualWidthM: 16, actualHeightM: 8
      });
      assert.ok(billboardGroup.children.length > 10, '70m billboard scene built successfully');
      const pylonMesh = billboardGroup.children.find(c => c.geometry instanceof CylinderGeometry && c.geometry.size[1] > 60);
      assert.ok(pylonMesh, '70m billboard created structural monopole taller than 60m');
    } finally {
      globalThis.THREE = originalThree;
    }
  });
});
