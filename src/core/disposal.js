/**
 * JLED DESIGN STUDIO v4.0 — Memory & Resource Disposal Engine
 * Ensures complete cleanup of Geometries, Materials, Textures, and Object URLs
 * preventing VRAM leaks, GPU context exhaustion, and JS heap growth.
 */

/**
 * Disposes a Three.js material and any associated textures.
 * @param {THREE.Material|Array<THREE.Material>} material 
 * @param {Set<any>} [sharedResources] Optional set of shared textures/materials to protect from disposal
 */
export function disposeMaterial(material, sharedResources = null) {
  if (!material) return;

  if (Array.isArray(material)) {
    material.forEach((mat) => disposeMaterial(mat, sharedResources));
    return;
  }

  if (sharedResources && sharedResources.has(material)) {
    return; // Do not dispose shared material
  }

  // Iterate all texture properties of standard Three.js materials
  const textureSlots = [
    'map', 'alphaMap', 'bumpMap', 'displacementMap', 'emissiveMap',
    'envMap', 'lightMap', 'metalnessMap', 'normalMap', 'roughnessMap'
  ];

  for (const slot of textureSlots) {
    const tex = material[slot];
    if (tex && typeof tex.dispose === 'function') {
      if (!sharedResources || !sharedResources.has(tex)) {
        tex.dispose();
      }
    }
  }

  if (typeof material.dispose === 'function') {
    material.dispose();
  }
}

/**
 * Recursively disposes all Geometries, Materials, and Textures in an Object3D hierarchy.
 * @param {THREE.Object3D} root 
 * @param {Object} [options]
 * @param {Set<any>} [options.sharedResources] Set of objects/textures to skip
 * @param {boolean} [options.disposeRoot] Whether to remove root itself (default: false, clears children)
 */
export function disposeHierarchy(root, options = {}) {
  if (!root) return;
  const shared = options.sharedResources || null;

  const toDispose = [];
  root.traverse((child) => {
    if (child !== root || options.disposeRoot) {
      toDispose.push(child);
    }
  });

  for (const node of toDispose) {
    if (node.geometry && typeof node.geometry.dispose === 'function') {
      if (!shared || !shared.has(node.geometry)) {
        node.geometry.dispose();
      }
    }

    if (node.material) {
      disposeMaterial(node.material, shared);
    }

    if (node.parent && node !== root) {
      node.parent.remove(node);
    }
  }

  while (root.children && root.children.length > 0) {
    root.remove(root.children[0]);
  }
}

/**
 * Media Registry for tracking and safely revoking local Blob/Object URLs
 * and halting HTML5 Video decoding pipelines.
 */
export class MediaTracker {
  constructor() {
    this.activeUrls = new Set();
    this.activeVideos = new Set();
  }

  /**
   * Registers a Blob URL created via URL.createObjectURL.
   * @param {string} url 
   * @returns {string} url
   */
  trackUrl(url) {
    if (url && typeof url === 'string') {
      this.activeUrls.add(url);
    }
    return url;
  }

  /**
   * Revokes a specific Object URL.
   * @param {string} url 
   */
  revokeUrl(url) {
    if (!url || !this.activeUrls.has(url)) return;
    try {
      if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // Ignore URL revocation errors in test environments
    }
    this.activeUrls.delete(url);
  }

  /**
   * Safely halts and detaches an HTML5 video element.
   * @param {HTMLVideoElement} videoEl 
   */
  detachVideo(videoEl) {
    if (!videoEl) return;
    try {
      videoEl.pause();
      if (videoEl.src) {
        this.revokeUrl(videoEl.src);
      }
      videoEl.removeAttribute('src');
      if (typeof videoEl.load === 'function') {
        videoEl.load();
      }
      this.activeVideos.delete(videoEl);
    } catch (err) {
      // Ignore detach errors
    }
  }

  /**
   * Revokes all tracked Blob URLs and detaches all videos.
   */
  cleanupAll() {
    for (const url of this.activeUrls) {
      this.revokeUrl(url);
    }
    this.activeUrls.clear();

    for (const vid of this.activeVideos) {
      this.detachVideo(vid);
    }
    this.activeVideos.clear();
  }
}

export const globalMediaTracker = new MediaTracker();
