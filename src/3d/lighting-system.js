/**
 * JLED DESIGN STUDIO v4.1 — Lighting System & Atmosphere Engine
 * Realistic Day/Night environments, soft directional shadows,
 * tone mapping, atmospheric fog, and ambient color grading.
 */

import { LIGHTING_PRESETS } from '../core/constants.js';

// Boardroom grades are intentionally restrained. They affect only scene light,
// atmosphere and renderer exposure; LED brightness and power stay in core state.
const BOARDROOM_GRADES = {
  daylight: { skyColor: 0xbac7d1, fogColor: 0xbac7d1, fogDensity: 0.0015, ambientColor: 0xe8eff8, groundColor: 0x555967, ambientIntensity: 0.67, dirLightColor: 0xfff6e6, dirLightIntensity: 0.84, dirLightPos: [5, 9, 8], exposure: 1.04, ceilingIntensity: 0.13 },
  sunset: { skyColor: 0x30292c, fogColor: 0x30292c, fogDensity: 0.0015, ambientColor: 0xf0d9cb, groundColor: 0x403636, ambientIntensity: 0.54, dirLightColor: 0xffc8a0, dirLightIntensity: 0.67, dirLightPos: [4, 7, 6], exposure: 1.04, ceilingIntensity: 0.14 },
  night: { skyColor: 0x11151d, fogColor: 0x11151d, fogDensity: 0.0015, ambientColor: 0xc6d5e5, groundColor: 0x232b35, ambientIntensity: 0.36, dirLightColor: 0xdbe8f3, dirLightIntensity: 0.32, dirLightPos: [4, 8, 6], exposure: 1.0, ceilingIntensity: 0.12 },
  warm: { skyColor: 0x17151a, fogColor: 0x17151a, fogDensity: 0.0015, ambientColor: 0xffe2c5, groundColor: 0x383030, ambientIntensity: 0.55, dirLightColor: 0xffd6a5, dirLightIntensity: 0.68, dirLightPos: [5, 8, 6], exposure: 1.06, ceilingIntensity: 0.18 },
  cool: { skyColor: 0x151b25, fogColor: 0x151b25, fogDensity: 0.0015, ambientColor: 0xe1eaf4, groundColor: 0x303a46, ambientIntensity: 0.58, dirLightColor: 0xf2f6ff, dirLightIntensity: 0.72, dirLightPos: [5, 8, 7], exposure: 1.04, ceilingIntensity: 0.15 },
  presentation: { skyColor: 0x0b1019, fogColor: 0x0b1019, fogDensity: 0.0015, ambientColor: 0xc8d6e8, groundColor: 0x202a38, ambientIntensity: 0.38, dirLightColor: 0xe4ebf5, dirLightIntensity: 0.34, dirLightPos: [4, 7, 5], exposure: 1.0, ceilingIntensity: 0.08 }
};

export const PRESENTATION_LIGHTING_PRESET = {
  id: 'presentation', nameEn: 'Presentation', nameTh: 'โหมดนำเสนอ', ...BOARDROOM_GRADES.presentation
};

export class LightingSystem {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    // Configure renderer tone mapping for cinema-grade visuals
    if (this.renderer && typeof THREE !== 'undefined') {
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.04;
      // Three r128 uses outputEncoding; this prevents washed-out sRGB textures.
      if ('outputEncoding' in this.renderer) this.renderer.outputEncoding = THREE.sRGBEncoding;
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
    this.sceneId = 'boardroom';
    this.transition = null;
    this.lastFrameTime = 0;
    this.prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (event) => {
        this.prefersReducedMotion = event.matches;
        if (event.matches && this.transition) {
          this.assignLightState(this.transition.target);
          this.transition = null;
        }
      });
    }
  }

  initLights(existingAmbient = null, existingDir = null) {
    if (typeof THREE === 'undefined') return;

    // Use or create Ambient Light
    this.lights.ambient = existingAmbient || new THREE.AmbientLight(0xdbeafe, 0.6);
    if (!this.scene.children.includes(this.lights.ambient)) {
      this.scene.add(this.lights.ambient);
    }

    // Hemisphere Light for natural ambient color bounce (sky vs ground)
    if (!this.lights.hemisphere) {
      this.lights.hemisphere = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.22);
      this.lights.hemisphere.position.set(0, 20, 0);
      this.scene.add(this.lights.hemisphere);
    }

    // Main Directional Light (Sun / Key Light)
    this.lights.directional = existingDir || new THREE.DirectionalLight(0xfffbeb, 1.1);
    this.lights.directional.position.set(12, 22, 16);
    this.lights.directional.castShadow = true;
    this.lights.directional.shadow.mapSize.width = 1024;
    this.lights.directional.shadow.mapSize.height = 1024;
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

    // Low-intensity practical ceiling fill. No shadows: four lamps are cheap to render.
    if (this.lights.pointLights.length === 0) {
      for (const x of [-2.4, 2.4]) {
        for (const z of [3, 7]) {
          const light = new THREE.PointLight(0xfff1df, 0.15, 6.5, 1.8);
          light.position.set(x, 3.45, z);
          light.castShadow = false;
          this.lights.pointLights.push(light);
          this.scene.add(light);
        }
      }
    }
  }

  /** Enable practical lighting only in the boardroom and fit it to its ceiling. */
  setEnvironment(sceneId, room = {}) {
    this.sceneId = sceneId;
    const isBoardroom = sceneId === 'boardroom';
    const height = Number(room.height) || 3.9;
    const depth = Number(room.depth) || 12.8;
    const width = Number(room.width) || 10;
    const xs = [-Math.min(2.4, width * 0.23), Math.min(2.4, width * 0.23)];
    const zs = [Math.min(3, depth * 0.27), Math.min(7, depth * 0.56)];
    if (this.lights.directional && this.lights.directional.shadow) {
      const shadowCamera = this.lights.directional.shadow.camera;
      const extent = isBoardroom ? Math.max(width, depth) * 0.58 : 18;
      shadowCamera.left = -extent;
      shadowCamera.right = extent;
      shadowCamera.top = extent;
      shadowCamera.bottom = -extent;
      shadowCamera.updateProjectionMatrix();
    }
    this.lights.pointLights.forEach((light, index) => {
      light.position.set(xs[Math.floor(index / 2)], height - 0.42, zs[index % 2]);
      light.visible = isBoardroom;
    });
    this.applyPreset(this.currentPresetId, 0);
  }

  applyPreset(presetId, durationMs = 380) {
    if (typeof THREE === 'undefined') return;
    const id = presetId === 'day' ? 'daylight'
      : presetId === 'warm-interior' ? 'warm'
        : presetId === 'cool-interior' ? 'cool' : presetId;
    const base = LIGHTING_PRESETS[id] || (id === 'presentation' ? PRESENTATION_LIGHTING_PRESET : LIGHTING_PRESETS.cool);
    const p = this.sceneId === 'boardroom' && BOARDROOM_GRADES[base.id]
      ? { ...base, ...BOARDROOM_GRADES[base.id] } : base;
    this.currentPresetId = p.id;
    const snapshot = this.captureLightState();
    const target = {
      background: new THREE.Color(p.skyColor),
      fog: new THREE.Color(p.fogColor),
      fogDensity: p.fogDensity,
      ambient: new THREE.Color(p.ambientColor),
      ground: new THREE.Color(p.groundColor),
      ambientIntensity: p.ambientIntensity,
      hemisphereIntensity: p.ambientIntensity * 0.4,
      directional: new THREE.Color(p.dirLightColor),
      directionalIntensity: p.dirLightIntensity,
      directionalPosition: p.dirLightPos,
      ceilingColor: new THREE.Color(p.id === 'warm' ? 0xffdfb4 : 0xe9f0f9),
      ceilingIntensity: this.sceneId === 'boardroom' ? (p.ceilingIntensity || 0.12) : 0,
      exposure: p.exposure || 1
    };
    if (!snapshot || durationMs <= 0 || !this.lastFrameTime || this.prefersReducedMotion) {
      this.assignLightState(target);
      this.transition = null;
    } else {
      this.transition = { start: snapshot, target, startTime: performance.now(), durationMs };
    }
  }

  captureLightState() {
    const { ambient, hemisphere, directional, pointLights } = this.lights;
    if (!ambient || !hemisphere || !directional || !this.scene.background) return null;
    return {
      background: this.scene.background.clone(),
      fog: this.scene.fog ? this.scene.fog.color.clone() : this.scene.background.clone(),
      fogDensity: this.scene.fog ? this.scene.fog.density : 0,
      ambient: ambient.color.clone(), ground: hemisphere.groundColor.clone(),
      ambientIntensity: ambient.intensity,
      hemisphereIntensity: hemisphere.intensity,
      directional: directional.color.clone(),
      directionalIntensity: directional.intensity,
      directionalPosition: [directional.position.x, directional.position.y, directional.position.z],
      ceilingColor: pointLights[0] ? pointLights[0].color.clone() : new THREE.Color(0xffffff),
      ceilingIntensity: pointLights[0] ? pointLights[0].intensity : 0,
      exposure: this.renderer ? this.renderer.toneMappingExposure : 1
    };
  }

  assignLightState(s) {
    if (!this.scene.background || !this.scene.background.isColor) this.scene.background = s.background.clone();
    else this.scene.background.copy(s.background);
    if (!this.scene.fog || !this.scene.fog.isFogExp2) this.scene.fog = new THREE.FogExp2(s.fog, s.fogDensity);
    else {
      this.scene.fog.color.copy(s.fog);
      this.scene.fog.density = s.fogDensity;
    }
    const { ambient, hemisphere, directional, pointLights } = this.lights;
    if (ambient) { ambient.color.copy(s.ambient); ambient.intensity = s.ambientIntensity; }
    if (hemisphere) {
      hemisphere.color.copy(s.ambient);
      hemisphere.groundColor.copy(s.ground);
      hemisphere.intensity = s.hemisphereIntensity;
    }
    if (directional) {
      directional.color.copy(s.directional);
      directional.intensity = s.directionalIntensity;
      directional.position.set(...s.directionalPosition);
    }
    for (const light of pointLights) {
      light.color.copy(s.ceilingColor);
      light.intensity = this.sceneId === 'boardroom' ? s.ceilingIntensity : 0;
    }
    if (this.renderer) this.renderer.toneMappingExposure = s.exposure;
  }

  update(now = performance.now()) {
    this.lastFrameTime = now;
    if (!this.transition) return;
    const { start, target, startTime, durationMs } = this.transition;
    const t = Math.min(1, (now - startTime) / durationMs);
    const ease = t * t * (3 - 2 * t);
    const color = (a, b) => a.clone().lerp(b, ease);
    const scalar = (a, b) => a + (b - a) * ease;
    this.assignLightState({
      background: color(start.background, target.background),
      fog: color(start.fog, target.fog),
      fogDensity: scalar(start.fogDensity, target.fogDensity),
      ambient: color(start.ambient, target.ambient),
      ground: color(start.ground, target.ground),
      ambientIntensity: scalar(start.ambientIntensity, target.ambientIntensity),
      hemisphereIntensity: scalar(start.hemisphereIntensity, target.hemisphereIntensity),
      directional: color(start.directional, target.directional),
      directionalIntensity: scalar(start.directionalIntensity, target.directionalIntensity),
      directionalPosition: start.directionalPosition.map((v, i) => scalar(v, target.directionalPosition[i])),
      ceilingColor: color(start.ceilingColor, target.ceilingColor),
      ceilingIntensity: scalar(start.ceilingIntensity, target.ceilingIntensity),
      exposure: scalar(start.exposure, target.exposure)
    });
    if (t >= 1) this.transition = null;
  }

  getCurrentPreset() {
    return LIGHTING_PRESETS[this.currentPresetId] ||
      (this.currentPresetId === 'presentation' ? PRESENTATION_LIGHTING_PRESET : LIGHTING_PRESETS.cool);
  }
}
