/**
 * JLED DESIGN STUDIO v4.1 — Cinematic Camera & Showcase Motion Engine
 * Handles smooth animated transitions, showcase 360° orbit,
 * LED screen power-on boot sequence, and motion accessibility.
 */

export class CinematicCameraManager {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;

    this.isAnimating = false;
    this.animStartTime = 0;
    this.animDuration = 1000; // ms
    this.startCamPos = null;
    this.targetCamPos = null;
    this.startTargetPos = null;
    this.targetTargetPos = null;

    // Showcase 360 Auto-Orbit
    this.isShowcaseActive = false;
    this.orbitSpeed = 0.35; // rad/sec
    this.orbitRadius = 8;
    this.orbitElevation = 2.0;

    // LED Power-on sequence state
    this.isBooting = false;
    this.bootProgress = 1.0; // 0.0 (off) to 1.0 (fully lit)
    this.bootStartTime = 0;
    this.bootDuration = 700; // ms

    // Check system preference for reduced motion
    this.prefersReducedMotion = false;
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion = mq.matches;
      mq.addEventListener('change', (e) => {
        this.prefersReducedMotion = e.matches;
      });
    }
  }

  /**
   * Smoothly animates camera and orbit target to new positions.
   * Uses cubic ease-in-out for smooth cinematic motion.
   */
  glideTo(targetCam, targetLookAt, durationMs = 900) {
    if (!this.camera || !this.controls || typeof THREE === 'undefined') return;

    if (this.prefersReducedMotion || durationMs <= 0) {
      this.camera.position.set(...targetCam);
      this.controls.target.set(...targetLookAt);
      this.controls.update();
      return;
    }

    this.isAnimating = true;
    this.animStartTime = performance.now();
    this.animDuration = durationMs;
    this.startCamPos = this.camera.position.clone();
    this.targetCamPos = new THREE.Vector3(...targetCam);
    this.startTargetPos = this.controls.target.clone();
    this.targetTargetPos = new THREE.Vector3(...targetLookAt);
  }

  toggleShowcase(enable = null) {
    this.isShowcaseActive = enable !== null ? enable : !this.isShowcaseActive;
    if (this.isShowcaseActive && this.camera && this.controls) {
      const dist = this.camera.position.distanceTo(this.controls.target);
      this.orbitRadius = Math.max(2.5, dist);
      this.orbitElevation = this.camera.position.y;
    }
    return this.isShowcaseActive;
  }

  triggerPowerOn() {
    this.isBooting = true;
    this.bootProgress = 0.0;
    this.bootStartTime = performance.now();
  }

  update(now = performance.now()) {
    // 1. Update Camera Glide Animation
    if (this.isAnimating && this.startCamPos && this.targetCamPos) {
      const elapsed = now - this.animStartTime;
      const t = Math.min(1.0, elapsed / this.animDuration);
      // Smooth cubic ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(this.startCamPos, this.targetCamPos, ease);
      this.controls.target.lerpVectors(this.startTargetPos, this.targetTargetPos, ease);
      this.controls.update();

      if (t >= 1.0) {
        this.isAnimating = false;
      }
    }

    // 2. Showcase Continuous Orbit Animation
    if (this.isShowcaseActive && !this.isAnimating && !this.prefersReducedMotion) {
      const angle = (now * 0.001 * this.orbitSpeed) % (Math.PI * 2);
      const target = this.controls.target;
      const nx = target.x + Math.sin(angle) * this.orbitRadius;
      const nz = target.z + Math.cos(angle) * this.orbitRadius;
      this.camera.position.x = nx;
      this.camera.position.z = nz;
      this.controls.update();
    }

    // 3. LED Power-On Boot Animation
    if (this.isBooting) {
      const bootElapsed = now - this.bootStartTime;
      const progress = Math.min(1.0, bootElapsed / this.bootDuration);
      this.bootProgress = progress;
      if (progress >= 1.0) {
        this.isBooting = false;
        this.bootProgress = 1.0;
      }
    }

    return {
      isAnimating: this.isAnimating,
      isShowcaseActive: this.isShowcaseActive,
      bootProgress: this.bootProgress
    };
  }
}
