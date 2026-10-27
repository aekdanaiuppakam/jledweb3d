import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { disposeHierarchy, disposeMaterial, MediaTracker } from '../src/core/disposal.js';

describe('Resource Disposal & Memory Management', () => {
  test('disposeMaterial disposes material and its active texture maps', () => {
    let materialDisposed = false;
    let textureDisposed = false;

    const mockTexture = {
      dispose: () => { textureDisposed = true; }
    };
    const mockMaterial = {
      map: mockTexture,
      dispose: () => { materialDisposed = true; }
    };

    disposeMaterial(mockMaterial);
    assert.equal(materialDisposed, true);
    assert.equal(textureDisposed, true);
  });

  test('disposeMaterial respects protected shared resources', () => {
    let sharedTextureDisposed = false;
    const sharedTexture = {
      dispose: () => { sharedTextureDisposed = true; }
    };
    const mockMaterial = {
      map: sharedTexture,
      dispose: () => {}
    };

    const protectedSet = new Set([sharedTexture]);
    disposeMaterial(mockMaterial, protectedSet);
    assert.equal(sharedTextureDisposed, false, 'Shared texture must NOT be disposed');
  });

  test('disposeHierarchy recursively disposes geometries and materials of nested children', () => {
    const disposedGeometries = [];
    const disposedMaterials = [];

    function makeMockMesh() {
      const geo = { dispose: () => disposedGeometries.push(geo) };
      const mat = { dispose: () => disposedMaterials.push(mat) };
      const mesh = {
        geometry: geo,
        material: mat,
        children: [],
        parent: null,
        remove: (c) => {
          const idx = mesh.children.indexOf(c);
          if (idx !== -1) mesh.children.splice(idx, 1);
        },
        traverse: function(cb) {
          cb(this);
          for (const c of this.children) c.traverse(cb);
        }
      };
      return mesh;
    }

    const rootGroup = makeMockMesh();
    const child1 = makeMockMesh();
    const grandChild = makeMockMesh();

    child1.parent = rootGroup;
    child1.children.push(grandChild);
    grandChild.parent = child1;
    rootGroup.children.push(child1);

    disposeHierarchy(rootGroup);

    assert.equal(disposedGeometries.length, 2); // child1 and grandChild
    assert.equal(disposedMaterials.length, 2);
    assert.equal(rootGroup.children.length, 0);
  });

  test('MediaTracker tracks, revokes, and halts video safely', () => {
    const tracker = new MediaTracker();
    const testUrl = 'blob:http://localhost/mock-video-uuid';

    tracker.trackUrl(testUrl);
    assert.ok(tracker.activeUrls.has(testUrl));

    tracker.revokeUrl(testUrl);
    assert.ok(!tracker.activeUrls.has(testUrl));

    let videoPaused = false;
    const mockVideo = {
      src: 'blob:http://localhost/mock-video-2',
      pause: () => { videoPaused = true; },
      removeAttribute: (attr) => { if (attr === 'src') mockVideo.src = ''; },
      load: () => {}
    };

    tracker.trackUrl(mockVideo.src);
    tracker.detachVideo(mockVideo);

    assert.equal(videoPaused, true);
    assert.equal(mockVideo.src, '');
    assert.ok(!tracker.activeUrls.has('blob:http://localhost/mock-video-2'));
  });
});
