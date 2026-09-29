/** The desk system (D-103 engine, D-106 platform layer): see docs/design/desk-system.md. */
export * from './types';
export * from './layout';
export * from './people';
export * from './fields';
export * from './entities';
export * from './actions';
export { deskStrings } from './strings';
export { useDesk, SIZE_VH, DESK_SIZES, TILT_DEG, SLAB, clampZ, type DeskController, type DeskSize, type UseDeskOptions } from './useDesk';
export { DeskStage, type DeskStageProps } from './DeskStage';
export { DeskObject, DeskFace, Preview } from './DeskObject';
export { DeskPersonStation, PersonPortrait } from './DeskPerson';
export { PageDesk, buildPageDesk, abilitiesFor, deskEntities, scopeRows } from './PageDesk';
