import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SCENE_DEFINITIONS, LIGHTING_PRESETS } from '../src/core/constants.js';
import { getCanonicalSceneId } from '../src/3d/environment-builder.js';
import { CinematicCameraManager } from '../src/3d/cinematic-camera.js';
import { StateStore } from '../src/core/state.js';

describe('JLED v4.1: 3D Environments & Visual Atmosphere Suite', () => {
  it('verifies all 12 interactive 3D environments are defined with complete metadata', () => {
    const requiredScenes = [
      'boardroom', 'auditorium', 'ballroom', 'mall-atrium',
      'billboard', 'school-entrance', 'gov-building', 'building-facade',
      'concert-stage', 'exhibition-booth', 'retail-store', 'corporate-lobby'
    ];

    for (const id of requiredScenes) {
      const def = SCENE_DEFINITIONS[id];
      assert.ok(def, `Missing scene definition for ${id}`);
      assert.ok(def.nameTh, `Missing Thai name for ${id}`);
      assert.ok(def.nameEn, `Missing English name for ${id}`);
      assert.ok(def.category, `Missing category for ${id}`);
      assert.ok(typeof def.defaultElevationM === 'number', `Missing elevation for ${id}`);
      assert.ok(def.defaultLighting, `Missing default lighting for ${id}`);
    }
  });

  it('maps legacy scene aliases cleanly for 100% backward compatibility', () => {
    assert.equal(getCanonicalSceneId('exhibition'), 'exhibition-booth');
    assert.equal(getCanonicalSceneId('outdoor'), 'billboard');
    assert.equal(getCanonicalSceneId('boardroom'), 'boardroom');
    assert.equal(getCanonicalSceneId('mall-atrium'), 'mall-atrium');
  });

  it('verifies Day/Night lighting presets exist with required properties', () => {
    const requiredPresets = ['daylight', 'sunset', 'night', 'warm', 'cool'];
    for (const p of requiredPresets) {
      const preset = LIGHTING_PRESETS[p];
      assert.ok(preset, `Missing lighting preset: ${p}`);
      assert.ok(preset.skyColor != null);
      assert.ok(preset.ambientIntensity > 0);
      assert.ok(preset.dirLightIntensity > 0);
      assert.equal(preset.dirLightPos.length, 3);
      assert.ok(preset.exposure > 0);
    }
  });

  it('CinematicCameraManager handles showcase auto-orbit and boot sequence correctly', () => {
    const mockCamera = { position: { x: 0, y: 2, z: 8, distanceTo: () => 8 } };
    const mockControls = { target: { x: 0, y: 1.5, z: 0 }, update: () => {} };

    const camManager = new CinematicCameraManager(mockCamera, mockControls);
    assert.equal(camManager.isShowcaseActive, false);

    // Toggle showcase auto-orbit
    const active = camManager.toggleShowcase(true);
    assert.equal(active, true);
    assert.equal(camManager.isShowcaseActive, true);

    // Trigger LED Power-On Boot Animation
    camManager.triggerPowerOn();
    assert.equal(camManager.isBooting, true);
    assert.equal(camManager.bootProgress, 0.0);

    // Update with timestamp after boot duration
    const state = camManager.update(camManager.bootStartTime + 1000);
    assert.equal(state.bootProgress, 1.0);
    assert.equal(camManager.isBooting, false);
  });

  it('StateStore defaults include v4.1 visual properties with reactive notification', () => {
    const store = new StateStore();
    const st = store.getState();

    assert.ok(st.lightingPreset);
    assert.equal(st.showcaseOrbit, false);
    assert.equal(st.visualQuality, 'high');
    assert.equal(st.screenBrightness, 1.0);
    assert.equal(st.sceneCategoryFilter, 'all');

    let notified = false;
    store.subscribe((state) => {
      if (state.lightingPreset === 'sunset') notified = true;
    });

    store.update({ lightingPreset: 'sunset' });
    assert.equal(notified, true);
    assert.equal(store.getState().lightingPreset, 'sunset');
  });
});
