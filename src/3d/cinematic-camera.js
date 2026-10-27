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

    // ================= First-Person Walk Mode =================
    this.isWalkModeActive = false;
    this.walkEyeHeight = 1.68; // standard human eye level in metres
    this.walkSpeed = 3.6; // m/s
    this.sprintMultiplier = 1.85;
    this.walkYaw = 0; // horizontal angle in radians
    this.walkPitch = 0; // vertical angle in radians (-82 deg to +82 deg)
    this.walkKeys = { forward: false, backward: false, left: false, right: false, sprint: false };
    this.walkBobTimer = 0;
    this.walkHeadBob = 0;
    this.walkVelocity = { x: 0, z: 0 };
    this.lastWalkTime = 0;
    this.walkDomElement = null;
    this.isPointerLocked = false;
    this.isMouseDown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.onWalkModeChange = null;
    this._listenersAttached = false;
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
    if (!this.camera || !this.controls) return;

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
    this.startCamPos = this.camera.position.clone ? this.camera.position.clone() : { ...this.camera.position };
    this.targetCamPos = typeof THREE !== 'undefined'
      ? new THREE.Vector3(...safeCamera)
      : { x: safeCamera[0], y: safeCamera[1], z: safeCamera[2] };
    this.startTargetPos = this.controls.target.clone ? this.controls.target.clone() : { ...this.controls.target };
    this.targetTargetPos = typeof THREE !== 'undefined'
      ? new THREE.Vector3(...targetLookAt)
      : { x: targetLookAt[0], y: targetLookAt[1], z: targetLookAt[2] };
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

  clampWalkPosition() {
    if (!this.camera || !this.camera.position) return;
    const p = this.camera.position;
    if (this.roomBounds) {
      const b = this.roomBounds;
      const inset = 0.4;
      p.x = Math.max(b.minX + inset, Math.min(b.maxX - inset, p.x));
      p.z = Math.max(b.minZ + inset, Math.min(b.maxZ - inset, p.z));
    }
    p.y = this.walkEyeHeight + (this.walkHeadBob || 0);
  }

  setKey(key, value) {
    if (this.walkKeys[key] !== undefined) {
      this.walkKeys[key] = !!value;
    }
  }

  toggleWalkMode(enable = null, domElement = null) {
    this.isWalkModeActive = enable !== null ? enable : !this.isWalkModeActive;
    if (domElement) this.walkDomElement = domElement;

    if (this.isWalkModeActive) {
      this.isShowcaseActive = false;
      this.isAnimating = false;
      if (this.controls) this.controls.enabled = false;

      // Initialize orientation and eye level from current camera
      if (this.camera) {
        if (typeof THREE !== 'undefined') {
          const dir = new THREE.Vector3();
          this.camera.getWorldDirection(dir);
          this.walkYaw = Math.atan2(-dir.x, -dir.z);
          this.walkPitch = Math.asin(Math.max(-0.98, Math.min(0.98, dir.y)));
        }
        this.camera.position.y = this.walkEyeHeight;
        this.clampWalkPosition();
      }

      this.setupWalkInput(domElement || this.walkDomElement);
    } else {
      if (this.controls) {
        this.controls.enabled = true;
        if (this.camera && typeof THREE !== 'undefined') {
          const dir = new THREE.Vector3();
          this.camera.getWorldDirection(dir);
          this.controls.target.copy(this.camera.position).addScaledVector(dir, 3.5);
          this.controls.update();
        }
      }
      this.teardownWalkInput();
    }

    if (typeof this.onWalkModeChange === 'function') {
      this.onWalkModeChange(this.isWalkModeActive);
    }
    return this.isWalkModeActive;
  }

  setupWalkInput(domElement) {
    if (typeof window === 'undefined' || this._listenersAttached) return;
    this.walkDomElement = domElement || this.walkDomElement;

    this._onKeyDown = (e) => {
      if (!this.isWalkModeActive) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.walkKeys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.walkKeys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.walkKeys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.walkKeys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.walkKeys.sprint = true;
          break;
        case 'Escape':
          this.toggleWalkMode(false);
          break;
      }
    };

    this._onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.walkKeys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.walkKeys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.walkKeys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.walkKeys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.walkKeys.sprint = false;
          break;
      }
    };

    this._onMouseDown = (e) => {
      if (!this.isWalkModeActive) return;
      this.isMouseDown = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      if (e.target === this.walkDomElement && this.walkDomElement?.requestPointerLock) {
        // Optional pointer lock on primary click
        try {
          this.walkDomElement.requestPointerLock();
        } catch (_) {}
      }
    };

    this._onMouseMove = (e) => {
      if (!this.isWalkModeActive) return;
      let dx = 0;
      let dy = 0;
      if (document.pointerLockElement === this.walkDomElement) {
        dx = e.movementX || 0;
        dy = e.movementY || 0;
      } else if (this.isMouseDown) {
        dx = e.clientX - this.lastMouseX;
        dy = e.clientY - this.lastMouseY;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }

      if (dx !== 0 || dy !== 0) {
        const sens = 0.0024;
        this.walkYaw -= dx * sens;
        this.walkPitch = Math.max(-1.42, Math.min(1.42, this.walkPitch - dy * sens));
      }
    };

    this._onMouseUp = () => {
      this.isMouseDown = false;
    };

    this._onTouchStart = (e) => {
      if (!this.isWalkModeActive || !e.touches || !e.touches[0]) return;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    };

    this._onTouchMove = (e) => {
      if (!this.isWalkModeActive || !e.touches || !e.touches[0]) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;

      const sens = 0.0035;
      this.walkYaw -= dx * sens;
      this.walkPitch = Math.max(-1.42, Math.min(1.42, this.walkPitch - dy * sens));
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mouseup', this._onMouseUp);

    const el = this.walkDomElement || window;
    el.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mousemove', this._onMouseMove);
    el.addEventListener('touchstart', this._onTouchStart, { passive: true });
    el.addEventListener('touchmove', this._onTouchMove, { passive: true });

    this._listenersAttached = true;
  }

  teardownWalkInput() {
    if (typeof window === 'undefined' || !this._listenersAttached) return;
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('mousemove', this._onMouseMove);

    const el = this.walkDomElement || window;
    if (el) {
      el.removeEventListener('mousedown', this._onMouseDown);
      el.removeEventListener('touchstart', this._onTouchStart);
      el.removeEventListener('touchmove', this._onTouchMove);
    }
    if (typeof document !== 'undefined' && document.exitPointerLock && document.pointerLockElement) {
      try { document.exitPointerLock(); } catch (_) {}
    }
    this._listenersAttached = false;
    this.isMouseDown = false;
    this.walkKeys = { forward: false, backward: false, left: false, right: false, sprint: false };
  }

  walkToWaypoint(waypointId, center = [0, 2.2, 0]) {
    if (!this.isWalkModeActive) {
      this.toggleWalkMode(true);
    }
    const [cx, cy, cz] = center;
    const b = this.roomBounds;
    const maxZ = b ? b.maxZ - 0.8 : cz + 9;
    const minZ = b ? Math.max(b.minZ + 1.2, cz + 1.8) : cz + 2.5;
    const maxX = b ? b.maxX - 0.8 : cx + 4;
    const minX = b ? b.minX + 0.8 : cx - 4;

    let targetPos;
    switch (waypointId) {
      case 'vip':
      case 'front_row':
        targetPos = [cx, this.walkEyeHeight, cz + 3.2];
        break;
      case 'center':
      case 'middle':
        targetPos = [cx, this.walkEyeHeight, (minZ + maxZ) / 2];
        break;
      case 'back':
      case 'rear':
        targetPos = [cx, this.walkEyeHeight, maxZ];
        break;
      case 'left_angle':
        targetPos = [minX * 0.65, this.walkEyeHeight, cz + 3.8];
        break;
      case 'right_angle':
        targetPos = [maxX * 0.65, this.walkEyeHeight, cz + 3.8];
        break;
      default:
        targetPos = [cx, this.walkEyeHeight, cz + 4.5];
        break;
    }

    // Look at center of screen
    const dx = cx - targetPos[0];
    const dy = cy - targetPos[1];
    const dz = cz - targetPos[2];
    const distXZ = Math.hypot(dx, dz);
    this.walkYaw = Math.atan2(-dx, -dz);
    this.walkPitch = Math.atan2(dy, Math.max(0.1, distXZ));

    this.glideTo(targetPos, [cx, cy, cz], 850);
  }

  triggerPowerOn() {
    this.isBooting = true;
    this.bootProgress = 0.0;
    this.bootStartTime = performance.now();
  }

  update(now = performance.now()) {
    // 1. Update Camera Glide Animation (supports both Orbit and Walk mode transitions)
    if (this.isAnimating && this.startCamPos && this.targetCamPos) {
      const elapsed = now - this.animStartTime;
      const t = Math.min(1.0, elapsed / this.animDuration);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(this.startCamPos, this.targetCamPos, ease);
      if (this.controls && this.startTargetPos && this.targetTargetPos) {
        this.controls.target.lerpVectors(this.startTargetPos, this.targetTargetPos, ease);
        this.controls.update();
      }

      if (t >= 1.0) {
        this.isAnimating = false;
      }
    }

    // 2. First-Person Walk Mode Physics & Movement
    if (this.isWalkModeActive && this.camera) {
      const last = this.lastWalkTime || now;
      const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
      this.lastWalkTime = now;

      if (!this.isAnimating) {
        let forward = 0;
        let strafe = 0;
        if (this.walkKeys.forward) forward += 1;
        if (this.walkKeys.backward) forward -= 1;
        if (this.walkKeys.left) strafe -= 1;
        if (this.walkKeys.right) strafe += 1;

        const sinY = Math.sin(this.walkYaw);
        const cosY = Math.cos(this.walkYaw);

        if (forward !== 0 || strafe !== 0) {
          const len = Math.hypot(forward, strafe);
          forward /= len;
          strafe /= len;
          const speed = this.walkSpeed * (this.walkKeys.sprint ? this.sprintMultiplier : 1.0);
          const targetVelX = (-sinY * forward + cosY * strafe) * speed;
          const targetVelZ = (-cosY * forward - sinY * strafe) * speed;

          this.walkVelocity.x += (targetVelX - this.walkVelocity.x) * Math.min(1.0, dt * 10);
          this.walkVelocity.z += (targetVelZ - this.walkVelocity.z) * Math.min(1.0, dt * 10);

          if (!this.prefersReducedMotion) {
            this.walkBobTimer += dt * (this.walkKeys.sprint ? 14 : 9);
            this.walkHeadBob = Math.sin(this.walkBobTimer) * 0.022;
          }
        } else {
          this.walkVelocity.x *= Math.max(0, 1 - dt * 10);
          this.walkVelocity.z *= Math.max(0, 1 - dt * 10);
          this.walkHeadBob *= Math.max(0, 1 - dt * 10);
        }

        this.camera.position.x += this.walkVelocity.x * dt;
        this.camera.position.z += this.walkVelocity.z * dt;
        this.camera.position.y = this.walkEyeHeight + this.walkHeadBob;
        this.clampWalkPosition();

        if (typeof THREE !== 'undefined') {
          const cosP = Math.cos(this.walkPitch);
          const sinP = Math.sin(this.walkPitch);
          const dirX = -sinY * cosP;
          const dirY = sinP;
          const dirZ = -cosY * cosP;

          const lookTarget = new THREE.Vector3(
            this.camera.position.x + dirX * 5,
            this.camera.position.y + dirY * 5,
            this.camera.position.z + dirZ * 5
          );
          this.camera.lookAt(lookTarget);
        }
      }
    }

    // 3. Showcase Continuous Orbit Animation
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
