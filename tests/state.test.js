import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { StateStore } from '../src/core/state.js';

describe('Unified Project State Store', () => {
  test('Initial state defaults to normalized mm units', () => {
    const store = new StateStore();
    const state = store.getState();
    assert.equal(state.requestedWidthMm, 4000);
    assert.equal(state.requestedHeightMm, 2500);
    assert.equal(state.pitchMm, 2.5);
    assert.equal(state.viewingDistanceM, 5.0);
    assert.equal(state.sceneType, 'boardroom');
    assert.equal(state.mountType, 'wall');

    const specs = store.getSpecs();
    assert.equal(specs.actualWidthM, 4.00);
    assert.equal(specs.actualHeightM, 2.50);
    assert.equal(specs.totalCabinets, 40);
  });

  test('Updating dimensions triggers recomputation and notifies subscribers', () => {
    const store = new StateStore();
    let notificationCount = 0;
    let receivedSpecs = null;

    const unsubscribe = store.subscribe((st, sp) => {
      notificationCount++;
      receivedSpecs = sp;
    });

    store.update({ requestedWidthMm: 6000, requestedHeightMm: 3000 });
    assert.equal(notificationCount, 1);
    assert.equal(receivedSpecs.actualWidthM, 6.00);
    assert.equal(receivedSpecs.actualHeightM, 3.00);
    // 6.0m / 0.5m = 12 cols, 3.0m / 0.5m = 6 rows => 72 cabinets
    assert.equal(receivedSpecs.totalCabinets, 72);

    unsubscribe();
    store.update({ requestedWidthMm: 5000 });
    assert.equal(notificationCount, 1); // No further notifications after unsubscribe
  });

  test('Pitch update maps to corresponding catalog product and recalculates specs', () => {
    const store = new StateStore();
    store.update({ pitchMm: 5.0, sceneType: 'outdoor' });
    const product = store.getProduct();
    assert.equal(product.actualPixelPitchMm, 5.0);
    assert.equal(product.environment, 'outdoor');

    const specs = store.getSpecs();
    // 960mm outdoor cabinet
    assert.equal(specs.isOutdoor, true);
  });

  test('Reset returns state to standard defaults', () => {
    const store = new StateStore();
    store.update({ requestedWidthMm: 9000, sceneType: 'outdoor' });
    assert.equal(store.getState().requestedWidthMm, 9000);

    store.reset();
    assert.equal(store.getState().requestedWidthMm, 4000);
    assert.equal(store.getState().sceneType, 'boardroom');
  });
});
