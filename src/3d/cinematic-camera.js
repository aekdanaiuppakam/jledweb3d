/**
 * JLED DESIGN STUDIO v4.1 — Cinematic Camera & Showcase Motion Engine
 * Handles smooth animated transitions, showcase 360° orbit,
 * LED screen power-on boot sequence, and motion accessibility.
 */

/** Choose an initial audience distance that keeps a display legible in its venue. */
export function getSceneFramingDistance({ defaultDistanceM = 7, widthM = 4, heightM = 2.5 } = {}) {
  const preferred = Number.isFinite(defaultDistanceM) ? defaultDistanceM : 7;
  const width = Number.isFinite(widthM) ? Math.max(0, widthM) : 4;
  const height = Number.isFinite(heightM) ? Math.max(0, heightM) : 2.5;
  return Math.min(30, Math.round(Math.max(6.5, Math.min(preferred, 9), width * 1.45, height * 2.15) * 10) / 10);
}

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
    this.roomBounds = null;

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
        if (e.matches) this.isShowcaseActive = false;
      });
    }
  }

  /** Optional room envelope, in metres, used by preset and interactive cameras. */
  setRoomBounds(bounds) {
    this.roomBounds = bounds && ['minX', 'maxX', 'minY', 'maxY', 'minZ', 'maxZ']
      .every((key) => Number.isFinite(bounds[key])) ? { ...bounds } : null;
  }

  clampPosition(position) {
    if (!this.roomBounds) return position;
    const b = this.roomBounds;
    const inset = 0.08;
    return [
      Math.max(b.minX + inset, Math.min(b.maxX - inset, position[0])),
      Math.max(b.minY + inset, Math.min(b.maxY - inset, position[1])),
      Math.max(b.minZ + inset, Math.min(b.maxZ - inset, position[2]))
    ];
  }

  constrainCamera() {
    if (!this.camera || !this.camera.position || !this.roomBounds) return;
    const p = this.camera.position;
    const [x, y, z] = this.clampPosition([p.x, p.y, p.z]);
    if (p.x !== x || p.y !== y || p.z !== z) {
      p.set(x, y, z);
      if (this.controls) this.controls.update();
    }
  }

  /** Frame the actual assembled screen dimensions using the camera's field of view. */
  getViewPose(viewId, { widthM = 4, heightM = 2.5, center = [0, 2.2, 0], viewingDistanceM = 4.5 } = {}) {
    const width = Math.max(0.25, Number(widthM) || 4);
    const height = Math.max(0.25, Number(heightM) || 2.5);
    const [cx, cy, cz] = center;
    const fovRad = ((this.camera && this.camera.fov) || 50) * Math.PI / 180;
    const aspect = Math.max(0.5, (this.camera && this.camera.aspect) || 1.5);
    const halfVertical = Math.tan(fovRad / 2);
    const fitDistance = Math.max(
      height / (2 * halfVertical),
      width / (2 * halfVertical * aspect)
    ) * 1.18;
    const d = Math.max(fitDistance, Math.max(1, Number(viewingDistanceM) || 4.5));
    let position;
    let target = [cx, cy, cz];

    switch (viewId) {
      case 'hero':
        if (this.roomBounds && this.roomBounds.kind !== 'venue') {
          // From the rear half of a boardroom, show the table and architecture
          // around the display. The FOV fit still grows with large screens.
          const heroZ = cz + Math.max(10.8, fitDistance * 1.2, d);
          position = [
            cx + Math.min(5.2, Math.max(2.65, (heroZ - cz) * 0.25)),
            cy + Math.min(0.45, Math.max(0.25, height * 0.14)),
            heroZ
          ];
        } else {
          const x = d * 0.26;
          const y = Math.min(0.8, d * 0.10);
          position = [cx + x, cy + y, cz + Math.sqrt(Math.max(0.01, d * d - x * x - y * y))];
        }
        break;
      case 'angle45':
        position = [cx + d * 0.34, cy + Math.min(1.1, d * 0.13), cz + d * 1.12];
        break;
      case 'humanEye':
        position = [cx, 1.65, cz + d];
        break;
      case 'technical':
      case 'topDown':
        position = [cx + d * 0.28, cy + Math.min(2.3, d * 0.31), cz + d * 0.92];
        break;
      case 'side':
        // Inspect cabinet depth from a steep oblique angle, still in front of the wall.
        position = [cx + d * 0.95, cy + 0.12, cz + Math.max(1.8, d * 0.35)];
        break;
      case 'detail':
      case 'closeup':
        target = [cx - width * 0.22, cy + height * 0.13, cz];
        position = [target[0] + 0.18, target[1] + 0.06, cz + 1.35];
        break;
      case 'front':
      default:
        position = [cx, cy, cz + d];
        break;
    }

    if (this.roomBounds && viewId !== 'detail' && viewId !== 'closeup' && viewId !== 'side' && viewId !== 'hero') {
      // Keep full-screen views on the audience side of the conference table.
      position[2] = Math.max(position[2], Math.min(this.roomBounds.maxZ - 0.1, cz + 4));
    }
    return { position: this.clampPosition(position), target };
  }

  applyViewPreset(viewId, screen, durationMs = 900) {
    const pose = this.getViewPose(viewId, screen);
    this.glideTo(pose.position, pose.target, durationMs);
    return pose;
  }

  /**
   * Smoothly animates camera and orbit target to new positions.
   * Uses cubic ease-in-out for smooth cinematic motion.
   */
  glideTo(targetCam, targetLookAt, durationMs = 900) {
    if (!this.camera || !this.controls || typeof THREE === 'undefined') return;

    const safeCamera = this.clampPosition(targetCam);

    if (this.prefersReducedMotion || durationMs <= 0) {
      this.isAnimating = false;
      this.camera.position.set(...safeCamera);
      this.controls.target.set(...targetLookAt);
      this.controls.update();
      return;
    }

    this.isAnimating = true;
    this.animStartTime = performance.now();
    this.animDuration = durationMs;
    this.startCamPos = this.camera.position.clone();
    this.targetCamPos = new THREE.Vector3(...safeCamera);
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
      let nx;
      let nz;
      if (this.roomBounds) {
        // A room-safe circular dolly around the audience floor, facing the screen.
        const availableX = Math.min(target.x - this.roomBounds.minX, this.roomBounds.maxX - target.x) - 0.3;
        const radius = Math.max(0.4, Math.min(this.orbitRadius * 0.45, availableX));
        const roomMidZ = (this.roomBounds.minZ + this.roomBounds.maxZ) / 2;
        nx = target.x + Math.sin(angle) * radius;
        nz = roomMidZ + Math.cos(angle) * radius * 0.5;
      } else {
        nx = target.x + Math.sin(angle) * this.orbitRadius;
        nz = target.z + Math.cos(angle) * this.orbitRadius;
      }
      this.camera.position.x = nx;
      this.camera.position.z = nz;
      this.controls.update();
    }

    this.constrainCamera();

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
