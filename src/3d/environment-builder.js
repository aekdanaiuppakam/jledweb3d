/**
 * JLED DESIGN STUDIO v4.1 — Master 3D Environment Builder
 * Dispatches procedural scene generation across all 12 architectural environments.
 * Manages clean resource disposal and lighting synchronization.
 */

import { SCENE_DEFINITIONS } from '../core/constants.js';
import { disposeHierarchy } from '../core/disposal.js';
import {
  buildBoardroom,
  buildAuditorium,
  buildBallroom,
  buildMallAtrium
} from './environments/indoor.js';
import {
  buildBillboard,
  buildSchoolEntrance,
  buildGovBuilding,
  buildBuildingFacade
} from './environments/outdoor.js';
import {
  buildConcertStage,
  buildExhibitionBooth,
  buildRetailStore,
  buildCorporateLobby
} from './environments/event.js';

/**
 * Resolves canonical scene ID (mapping legacy aliases).
 */
export function getCanonicalSceneId(sceneType) {
  if (sceneType === 'exhibition') return 'exhibition-booth';
  if (sceneType === 'outdoor') return 'billboard';
  return sceneType || 'boardroom';
}

/**
 * Master dispatcher to build the active 3D environment.
 */
export function buildEnvironment(environmentGroup, state, specs, lightingSystem = null, sharedResources = new Set()) {
  if (!environmentGroup || typeof THREE === 'undefined') return;

  // 1. Dispose previous environment objects cleanly
  disposeHierarchy(environmentGroup, { sharedResources });

  const sceneId = getCanonicalSceneId(state.sceneType);
  const sceneDef = SCENE_DEFINITIONS[state.sceneType] || SCENE_DEFINITIONS[sceneId] || SCENE_DEFINITIONS.boardroom;

  // 2. Dispatch to specific 3D environment builder
  switch (sceneId) {
    // Indoor (4)
    case 'boardroom':
      buildBoardroom(environmentGroup, state, specs);
      break;
    case 'auditorium':
      buildAuditorium(environmentGroup, state, specs);
      break;
    case 'ballroom':
      buildBallroom(environmentGroup, state, specs);
      break;
    case 'mall-atrium':
      buildMallAtrium(environmentGroup, state, specs);
      break;

    // Outdoor (4)
    case 'billboard':
      buildBillboard(environmentGroup, state, specs);
      break;
    case 'school-entrance':
      buildSchoolEntrance(environmentGroup, state, specs);
      break;
    case 'gov-building':
      buildGovBuilding(environmentGroup, state, specs);
      break;
    case 'building-facade':
      buildBuildingFacade(environmentGroup, state, specs);
      break;

    // Event & Specialty (4)
    case 'concert-stage':
      buildConcertStage(environmentGroup, state, specs);
      break;
    case 'exhibition-booth':
      buildExhibitionBooth(environmentGroup, state, specs);
      break;
    case 'retail-store':
      buildRetailStore(environmentGroup, state, specs);
      break;
    case 'corporate-lobby':
      buildCorporateLobby(environmentGroup, state, specs);
      break;

    default:
      buildBoardroom(environmentGroup, state, specs);
      break;
  }

  // 3. Sync Lighting Preset
  if (lightingSystem) {
    const activePreset = state.lightingPreset || sceneDef.defaultLighting || 'cool';
    lightingSystem.applyPreset(activePreset);
  }
}
