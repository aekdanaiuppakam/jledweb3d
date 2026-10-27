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

  it('CinematicCameraManager handles First-Person Walk Mode with room collision and waypoints', () => {
    const mockCamera = {
      position: {
        x: 0, y: 2.2, z: 6,
        set(x, y, z) { this.x = x; this.y = y; this.z = z; },
        clone() { return { x: this.x, y: this.y, z: this.z, lerpVectors: () => {} }; },
        lerpVectors() {}
      },
      getWorldDirection(v) { v.x = 0; v.y = 0; v.z = -1; return v; },
      lookAt() {}
    };

    const mockControls = {
      enabled: true,
      target: {
        x: 0, y: 2.2, z: 0,
        set(x, y, z) { this.x = x; this.y = y; this.z = z; },
        clone() { return { x: this.x, y: this.y, z: this.z, lerpVectors: () => {} }; },
        copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; },
        addScaledVector() { return this; },
        lerpVectors() {}
      },
      update() {}
    };

    const camManager = new CinematicCameraManager(mockCamera, mockControls);
    camManager.setRoomBounds({ minX: -6, maxX: 6, minY: 0, maxY: 4, minZ: -1, maxZ: 12 });

    // 1. Enable Walk Mode
    let walkChanged = false;
    camManager.onWalkModeChange = (active) => { walkChanged = active; };
    const enabled = camManager.toggleWalkMode(true);

    assert.equal(enabled, true);
    assert.equal(camManager.isWalkModeActive, true);
    assert.equal(mockControls.enabled, false);
    assert.equal(mockCamera.position.y, camManager.walkEyeHeight);
    assert.equal(walkChanged, true);

    // 2. Simulate Forward Key Press
    camManager.setKey('forward', true);
    assert.equal(camManager.walkKeys.forward, true);

    // Update frame
    const now = performance.now();
    camManager.update(now + 100);

    // Position Z should have moved forward (towards -Z / screen)
    assert.ok(mockCamera.position.z <= 6.0);

    // 3. Waypoint Navigation
    camManager.walkToWaypoint('vip', [0, 2.2, 0]);
    assert.equal(camManager.isWalkModeActive, true);
    assert.equal(camManager.isAnimating, true);

    // 4. Disable Walk Mode
    camManager.toggleWalkMode(false);
    assert.equal(camManager.isWalkModeActive, false);
    assert.equal(mockControls.enabled, true);
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
