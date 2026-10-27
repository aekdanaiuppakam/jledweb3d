import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CinematicCameraManager, getSceneFramingDistance } from '../src/3d/cinematic-camera.js';
import { PRESENTATION_LIGHTING_PRESET } from '../src/3d/lighting-system.js';
import { StateStore } from '../src/core/state.js';

describe('Boardroom visual refinement', () => {
  const screen = { widthM: 4, heightM: 2.5, center: [0, 2.2, 0], viewingDistanceM: 5 };
  const bounds = { minX: -5, maxX: 5, minY: 0.85, maxY: 3.65, minZ: 0.66, maxZ: 12.45 };

  function manager() {
    const camera = { fov: 50, aspect: 1.5 };
    const result = new CinematicCameraManager(camera, null);
    result.setRoomBounds(bounds);
    return result;
  }

  it('keeps every camera preset inside the architectural envelope', () => {
    const camera = manager();
    for (const id of ['hero', 'front', 'humanEye', 'technical', 'side', 'detail']) {
      const pose = camera.getViewPose(id, screen);
      assert.ok(pose.position.every(Number.isFinite), `${id} has a nonfinite position`);
      assert.ok(pose.position[0] > bounds.minX && pose.position[0] < bounds.maxX, `${id} is outside room width`);
      assert.ok(pose.position[1] > bounds.minY && pose.position[1] < bounds.maxY, `${id} is outside room height`);
      assert.ok(pose.position[2] > bounds.minZ && pose.position[2] < bounds.maxZ, `${id} is outside room depth`);
    }
  });

  it('shows the room in Hero while keeping Front and Detail fit for inspection', () => {
    const camera = manager();
    const hero = camera.getViewPose('hero', screen);
    const front = camera.getViewPose('front', screen);
    const detail = camera.getViewPose('detail', screen);
    assert.ok(hero.position[2] > front.position[2] + 3, 'Hero needs space for furniture context');
    assert.ok(detail.position[2] < front.position[2], 'Detail should approach the cabinet');
    assert.equal(front.position[0], 0);
    assert.equal(camera.getViewPose('humanEye', screen).position[1], 1.65);
  });

  it('increases Hero framing distance for a wider assembled display', () => {
    const camera = manager();
    const standard = camera.getViewPose('hero', screen);
    camera.setRoomBounds({ ...bounds, minX: -12, maxX: 12, maxZ: 24 });
    const wide = camera.getViewPose('hero', { ...screen, widthM: 14 });
    assert.ok(wide.position[2] > standard.position[2]);
  });

  it('frames other venues near the display while respecting larger assemblies', () => {
    assert.equal(getSceneFramingDistance({ defaultDistanceM: 14, widthM: 4, heightM: 2.5 }), 9);
    assert.ok(getSceneFramingDistance({ defaultDistanceM: 9, widthM: 12, heightM: 4 }) > 9);
    const camera = manager();
    camera.setRoomBounds({ ...bounds, maxZ: 18, kind: 'venue' });
    const pose = camera.getViewPose('hero', { ...screen, viewingDistanceM: 8 });
    const offset = pose.position.map((value, i) => value - pose.target[i]);
    assert.ok(Math.abs(Math.hypot(...offset) - 8) < 0.001);
  });

  it('provides a restrained visual-only Presentation light grade', () => {
    assert.equal(PRESENTATION_LIGHTING_PRESET.id, 'presentation');
    assert.ok(PRESENTATION_LIGHTING_PRESET.ambientIntensity > 0);
    assert.ok(PRESENTATION_LIGHTING_PRESET.dirLightIntensity < 0.5);
    assert.ok(PRESENTATION_LIGHTING_PRESET.exposure > 0);

    const store = new StateStore();
    const before = store.getSpecs();
    store.update({ lightingPreset: 'presentation', screenBrightness: 1.5 });
    const after = store.getSpecs();
    assert.equal(after.actualWidthMm, before.actualWidthMm);
    assert.equal(after.actualHeightMm, before.actualHeightMm);
    assert.deepEqual(after.resolutionPx, before.resolutionPx);
    assert.equal(after.powerMaxKw, before.powerMaxKw);
    assert.equal(after.powerAvgKw, before.powerAvgKw);
  });
});
