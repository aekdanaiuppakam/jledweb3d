/**
 * JLED DESIGN STUDIO v4.1 — Lighting System & Atmosphere Engine
 * Realistic Day/Night environments, soft directional shadows,
 * tone mapping, atmospheric fog, and ambient color grading.
 */

import { LIGHTING_PRESETS } from '../core/constants.js';

export class LightingSystem {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    // Configure renderer tone mapping for cinema-grade visuals
    if (this.renderer && typeof THREE !== 'undefined') {
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.lights = {
      ambient: null,
      directional: null,
      hemisphere: null,
      pointLights: []
    };

    this.currentPresetId = 'cool';
  }

  initLights(existingAmbient = null, existingDir = null) {
    if (typeof THREE === 'undefined') return;

    // Use or create Ambient Light
    this.lights.ambient = existingAmbient || new THREE.AmbientLight(0xdbeafe, 0.6);
    if (!this.scene.children.includes(this.lights.ambient)) {
      this.scene.add(this.lights.ambient);
    }

    // Hemisphere Light for natural ambient color bounce (sky vs ground)
    this.lights.hemisphere = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.4);
    this.lights.hemisphere.position.set(0, 20, 0);
    this.scene.add(this.lights.hemisphere);

    // Main Directional Light (Sun / Key Light)
    this.lights.directional = existingDir || new THREE.DirectionalLight(0xfffbeb, 1.1);
    this.lights.directional.position.set(12, 22, 16);
    this.lights.directional.castShadow = true;
    this.lights.directional.shadow.mapSize.width = 2048;
    this.lights.directional.shadow.mapSize.height = 2048;
    this.lights.directional.shadow.camera.near = 0.5;
    this.lights.directional.shadow.camera.far = 80;
    this.lights.directional.shadow.camera.left = -18;
    this.lights.directional.shadow.camera.right = 18;
    this.lights.directional.shadow.camera.top = 18;
    this.lights.directional.shadow.camera.bottom = -18;
    this.lights.directional.shadow.bias = -0.0004;

    if (!this.scene.children.includes(this.lights.directional)) {
      this.scene.add(this.lights.directional);
    }
  }

  applyPreset(presetId) {
    if (typeof THREE === 'undefined') return;
    const p = LIGHTING_PRESETS[presetId] || LIGHTING_PRESETS.cool;
    this.currentPresetId = p.id;

    // Sky Background & Atmosphere Fog
    this.scene.background = new THREE.Color(p.skyColor);
    this.scene.fog = new THREE.FogExp2(p.fogColor, p.fogDensity);

    // Ambient & Hemisphere
    if (this.lights.ambient) {
      this.lights.ambient.color.setHex(p.ambientColor);
      this.lights.ambient.intensity = p.ambientIntensity;
    }
    if (this.lights.hemisphere) {
      this.lights.hemisphere.color.setHex(p.ambientColor);
      this.lights.hemisphere.groundColor.setHex(p.groundColor);
      this.lights.hemisphere.intensity = p.ambientIntensity * 0.5;
    }

    // Directional (Sun / Stage Key)
    if (this.lights.directional) {
      this.lights.directional.color.setHex(p.dirLightColor);
      this.lights.directional.intensity = p.dirLightIntensity;
      const [px, py, pz] = p.dirLightPos;
      this.lights.directional.position.set(px, py, pz);
    }

    // Tone Mapping Exposure
    if (this.renderer) {
      this.renderer.toneMappingExposure = p.exposure || 1.0;
    }
  }

  getCurrentPreset() {
    return LIGHTING_PRESETS[this.currentPresetId] || LIGHTING_PRESETS.cool;
  }
}
