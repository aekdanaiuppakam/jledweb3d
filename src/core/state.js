/**
 * JLED DESIGN STUDIO v4.0 — Unified Project State Store
 * Single Source of Truth with normalized physical dimensions in millimeters (mm).
 * Emits reactive events to UI, 3D Scene, and Canvas renderers.
 */

import { DEFAULTS, SCENE_DEFINITIONS } from './constants.js';
import { defaultCatalog, checkCompatibility } from './product-catalog.js';
import { calculateScreenSpecs } from './calculation-engine.js';

export class StateStore {
  constructor(initialOverrides = {}) {
    this.listeners = new Set();
    this.catalog = defaultCatalog;
    this.state = this._createDefaultState(initialOverrides);
    this._recomputeSpecs();
  }

  _createDefaultState(overrides = {}) {
    const defaultProduct = this.catalog.findProductByPitch(DEFAULTS.pitchMm, 'indoor');
    const defaultScene = SCENE_DEFINITIONS[DEFAULTS.sceneType];

    return {
      schemaVersion: '4.0.0',
      sceneType: DEFAULTS.sceneType,
      mountType: DEFAULTS.mountType,
      productId: defaultProduct ? defaultProduct.id : 'JLED-IND-250',
      pitchMm: defaultProduct ? defaultProduct.actualPixelPitchMm : DEFAULTS.pitchMm,
      viewingDistanceM: DEFAULTS.viewingDistanceM,
      requestedWidthMm: DEFAULTS.requestedWidthMm,
      requestedHeightMm: DEFAULTS.requestedHeightMm,
      layoutPolicy: 'nearest', // 'nearest' | 'floor' | 'ceil'
      orientation: 'landscape', // 'landscape' | 'portrait'
      targetAspectKey: '16:9',
      showHuman: DEFAULTS.showHuman,
      showGrid: DEFAULTS.showGrid,
      contentType: DEFAULTS.contentType,
      customImage: null,
      customVideoUrl: null,
      customVideoReady: false,
      mediaFitMode: 'fit', // 'fit' | 'cover' | 'stretch'
      testPattern: null, // null | 'colorbars' | 'grid' | 'grayscale' | 'white' | 'red' | 'green' | 'blue'
      cameraPreset: 'front',
      elevationMm: Math.round((defaultScene?.defaultElevationM || 0.95) * 1000),
      positionXMm: 0,
      positionZMm: 0,
      rotationYDeg: 0,
      showMeasurements: true,
      cameraSeparated: false,
      shapeType: 'flat', // 'flat' | 'curved' | 'l-shape-inner' | 'l-shape-outer' | 'cube'
      mode: 'sales', // 'customer' | 'sales'
      ...overrides
    };
  }

  getState() {
    return { ...this.state };
  }

  getProduct() {
    return this.catalog.getProductById(this.state.productId) ||
           this.catalog.findProductByPitch(this.state.pitchMm);
  }

  getSpecs() {
    return this.specs;
  }

  getCompatibility() {
    const product = this.getProduct();
    return checkCompatibility(product, {
      sceneType: this.state.sceneType,
      mountType: this.state.mountType
    });
  }

  update(partialState) {
    let changed = false;
    for (const [key, val] of Object.entries(partialState)) {
      if (this.state[key] !== val) {
        this.state[key] = val;
        changed = true;
      }
    }

    if (changed) {
      // If productId changed, sync pitchMm
      if (partialState.productId) {
        const prod = this.catalog.getProductById(partialState.productId);
        if (prod) {
          this.state.pitchMm = prod.actualPixelPitchMm;
        }
      } else if (partialState.pitchMm != null && !partialState.productId) {
        // If pitchMm was set directly (e.g. from pitch button), find matching product
        const matched = this.catalog.findProductByPitch(
          partialState.pitchMm,
          this.state.sceneType === 'outdoor' ? 'outdoor' : null
        );
        if (matched) {
          this.state.productId = matched.id;
        }
      }

      this._recomputeSpecs();
      this.notify();
    }
  }

  _recomputeSpecs() {
    const product = this.getProduct();
    this.specs = calculateScreenSpecs({
      requestedWidthMm: this.state.requestedWidthMm,
      requestedHeightMm: this.state.requestedHeightMm,
      product,
      layoutPolicy: this.state.layoutPolicy,
      orientation: this.state.orientation,
      viewingDistanceM: this.state.viewingDistanceM,
      targetAspectKey: this.state.targetAspectKey
    });
  }

  reset() {
    this.state = this._createDefaultState();
    this._recomputeSpecs();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const currentState = this.getState();
    const currentSpecs = this.getSpecs();
    const compatibility = this.getCompatibility();
    for (const listener of this.listeners) {
      try {
        listener(currentState, currentSpecs, compatibility);
      } catch (err) {
        console.error('Error in state subscriber:', err);
      }
    }
  }
}

export const globalStateStore = new StateStore();
