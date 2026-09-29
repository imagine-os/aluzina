import type { DeskItem, DeskModel } from '../../desk/types';
import { buildPeople } from './deskPeople';
import { GROUP_ORDER, JOURNEY_MATS, buildItems } from './model';

/** W-04 keeps its own mats-per-row (D-103): 5 on landscape stages, 3 on squarish ones, 2 on tall phones. */
export const w04PerRow = (aspect: number) => (aspect < 0.7 ? 2 : aspect < 1.25 ? 3 : 5);

/**
 * The playbook desk model (W-04, D-103 / D-104): the ten journey mats, the playbook and template objects, a seated
 * person per phase. The first client of the desk system and the module's `desk` override (D-106); the page adds
 * the followed project's light tiles to `items` (D-105).
 */
export function playbookDeskModel(extra: readonly DeskItem[] = []): DeskModel {
  return {
    code: 'W-04',
    mats: JOURNEY_MATS,
    groups: GROUP_ORDER,
    items: extra.length ? [...buildItems(), ...extra] : buildItems(),
    people: buildPeople(),
    perRow: w04PerRow,
    grouping: { en: 'Sub-mats group each phase by what the things are: services, statuses, forms, templates and procedures, deliverables, money, communication, rules, team, measures', es: 'Los subtapetes agrupan cada fase por lo que son las cosas: servicios, estados, formularios, plantillas y procedimientos, entregables, dinero, comunicación, reglas, equipo, indicadores' },
  };
}
