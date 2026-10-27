import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { StateStore } from '../src/core/state.js';

describe('Phase 08: Customer Mode vs Sales-Engineer Mode', () => {
  test('Toggles between customer mode and sales-engineer mode cleanly', () => {
    const store = new StateStore();
    assert.equal(store.getState().mode, 'sales');

    store.update({ mode: 'customer' });
    assert.equal(store.getState().mode, 'customer');

    store.update({ mode: 'sales' });
    assert.equal(store.getState().mode, 'sales');
  });
});
