import { POP_PROPS, type DeskPerson, type PropId } from '../../desk/people';
import { FACE_BUDGET, type DeskItem, type DeskMatDef, type DeskModel, type ItemKind } from '../../desk/types';
import type { StatusTone, Text } from '../../tenant/domain';
import type { Bi, HubDevice, HubExperience, HubLensId, HubMap, HubPage, HubRole, HubShots, HubTool } from './hubMap.types';

/**
 * One hub map, three points of view (prompt 0030): `buildLens(map, lens, ctx)` turns a client's hub map into a
 * `DeskModel` for the desk engine, grouped the way that host looks at the client.
 * - `aluzina`: the studio's deliverable. One mat per client role (outside-in), the role's figure seated on it, the
 *   role's experiences as sub-mats, every page as a device (phone / tall page / screen / document).
 * - `between-gigs`: the company OS's view of one gig. Mats by what the gig ships (website, apps, back office,
 *   build, tools), one figure per mat (the role owning most of it), sub-mats by experience, condensed.
 * - `standalone`: the client's own testing hub. One mat, sub-mats by band, one screen per experience (its entry
 *   page) with the hub itself first, then the tools.
 * Every object maps back to its map entry (`entries`), which the page's drawer reads.
 */

export interface LensCtx {
  /** Language of the faces (the captures), independent of the UI language. */
  facesLang: 'es' | 'en';
  theme: 'light' | 'dark';
  /** Show the tools sub-mat / mat (defaults to the lens hint's `showTools`). */
  showTools: boolean;
}

export type HubEntry =
  | { kind: 'page'; page: HubPage; experience?: HubExperience; role?: HubRole }
  | { kind: 'tool'; tool: HubTool }
  | { kind: 'site'; experience: HubExperience; pages: HubPage[] }
  | { kind: 'experience'; experience: HubExperience; page?: HubPage; role?: HubRole }
  | { kind: 'hub'; page?: HubPage }
  | { kind: 'more'; pages: HubPage[] };

export interface LensDesk {
  lens: HubLensId;
  model: DeskModel;
  entries: Map<string, HubEntry>;
  /** Mat id -> the role seated there. */
  matRole: Map<string, HubRole>;
}

/** Caps for hub desks: every page of a client hub fits (aluzina); between-gigs condenses. */
export const HUB_CAPS: Record<HubLensId, { sub: number; mat: number }> = {
  aluzina: { sub: 16, mat: 48 },
  'between-gigs': { sub: 12, mat: 30 },
  standalone: { sub: 16, mat: 48 },
};

const T = (en: string, es: string): Text => ({ en, es });
const bi = (b: Bi): Text => ({ en: b.en, es: b.es });

/** Mat labels of the aluzina lens by hoy role id (the studio's words); other roles use the map's label. */
const ALUZINA_MAT: Record<string, Text> = {
  customer: T('Customer', 'Cliente'),
  public: T('Web · Public', 'Web · Público'),
  teacher: T('Teacher', 'Profesora'),
  front_desk: T('Front desk', 'Recepción'),
  coordinator: T('Coordinator', 'Coordinación'),
  finance: T('Finance', 'Finanzas'),
  admin: T('Admin', 'Administración'),
  super_admin: T('Super admin', 'Dirección técnica'),
  maintenance: T('Maintenance', 'Mantenimiento'),
};
/** Outside-in: who practises, who visits, who teaches, then the team, then who builds. */
const ROLE_ORDER = ['customer', 'public', 'teacher', 'front_desk', 'coordinator', 'finance', 'admin', 'super_admin', 'maintenance'];

/** The customer app is ~40 screens: split by what the member is doing (Book, Pay, Account, Sign in), in the map's nav order. */
const APP_SPLIT: { id: string; label: Text; codes: readonly string[] }[] = [
  { id: 'book', label: T('Book', 'Reservar'), codes: ['C-01', 'A-05', 'C-02', 'C-02b', 'C-03', 'C-08', 'C-08b', 'C-10', 'C-20', 'C-23', 'C-18', 'C-24'] },
  { id: 'pay', label: T('Pay', 'Pagar'), codes: ['C-04', 'C-05', 'C-06', 'C-07', 'C-07b', 'C-11', 'C-16', 'C-17', 'C-22', 'E-02'] },
  { id: 'account', label: T('Account', 'Cuenta'), codes: [] },
  { id: 'enter', label: T('Sign in', 'Entrar'), codes: ['A-01', 'A-02', 'A-03', 'C-21', 'E-04', 'E-05'] },
];
const appPart = (code: string) => APP_SPLIT.find((s) => s.codes.includes(code))?.id ?? 'account';

const KIND_OF: Record<HubDevice, ItemKind> = { phone: 'phone', tablet: 'tablet', desktop: 'screen', page: 'page', sheet: 'document' };

/** The capture for a face: the faces' language first, the theme's dark variant first, then the fallbacks the kind can use. */
export function faceSrc(map: HubMap, shots: HubShots | undefined, device: HubDevice, ctx: Pick<LensCtx, 'facesLang' | 'theme'>): { src: string; fit: 'cover' | 'top' } | undefined {
  if (!shots) return undefined;
  const langs = ctx.facesLang === 'es' ? (['es', 'en'] as const) : (['en', 'es'] as const);
  const thumb = (form: 'phone' | 'desktop') => {
    for (const l of langs) {
      const dark = shots.thumbs[`${l}-${form}-dark`];
      const light = shots.thumbs[`${l}-${form}`];
      const hit = ctx.theme === 'dark' ? dark ?? light : light;
      if (hit) return hit;
    }
    return undefined;
  };
  const full = (key: '390-full' | '390' | '1280') => {
    for (const l of langs) {
      const hit = shots.full[`${l}-${key}`];
      if (hit) return hit;
    }
    return undefined;
  };
  let rel: string | undefined;
  let fit: 'cover' | 'top' = 'cover';
  if (device === 'page') {
    rel = full('390-full') ?? full('390') ?? thumb('phone') ?? thumb('desktop');
    fit = 'top';
  } else if (device === 'phone' || device === 'tablet') rel = thumb('phone') ?? full('390') ?? thumb('desktop');
  else rel = thumb('desktop') ?? full('1280') ?? thumb('phone');
  if (!rel) return undefined;
  try {
    return { src: new URL(rel, map.product.baseUrl).href, fit };
  } catch {
    return undefined;
  }
}

/** A role's two desk props, from the engine's vocabulary (unknown props fall back to a laptop and a mug). */
function propsOf(role: HubRole): [PropId, PropId] {
  const known = new Set<string>(['laptop', 'phone', 'clipboard', 'tape', 'contract', 'calculator', 'plans', 'ruler', 'sketchbook', 'pencils', 'samples', 'swatches', 'board', 'stamp', 'hardhat', 'tablet', 'book', 'keys', 'mug', 'rating', ...POP_PROPS]);
  const [a, b] = role.props;
  return [(known.has(a) ? a : 'laptop') as PropId, (known.has(b) && b !== a ? b : 'mug') as PropId];
}

function personFor(role: HubRole, matId: string, why: Text): DeskPerson {
  return {
    phase: matId,
    role: { id: `hub-${role.id}`, playbookRole: bi(role.label), roleId: null, note: bi(role.description) },
    roleId: null,
    look: role.look,
    firstName: role.demoUser?.firstName,
    basis: 'responsibility',
    inferred: false,
    rationale: why,
    props: propsOf(role),
    caption: bi(role.label),
  };
}

const pagesOf = (map: HubMap, e: HubExperience): HubPage[] => {
  const mine = map.pages.filter((p) => p.experienceId === e.id);
  const rank = (code: string) => {
    const i = e.pageCodes.indexOf(code);
    return i === -1 ? 999 : i;
  };
  return mine.sort((a, b) => rank(a.code) - rank(b.code));
};

interface Builder {
  items: DeskItem[];
  entries: Map<string, HubEntry>;
  faces: number;
}

function pageItem(map: HubMap, b: Builder, page: HubPage, mat: string, group: string, ctx: LensCtx, experience?: HubExperience, role?: HubRole, device?: HubDevice): DeskItem {
  const dev = device ?? page.device;
  const kind = KIND_OF[dev] ?? 'screen';
  const plain = b.faces >= FACE_BUDGET;
  b.faces++;
  const face = plain ? undefined : faceSrc(map, page.shots, dev, ctx);
  const entry = experience?.code === page.code;
  const pill: DeskItem['pill'] = entry && experience?.featured ? { label: T('entry', 'entrada'), tone: 'accent' as StatusTone } : page.status === 'stub' ? { label: T('stub', 'esbozo'), tone: 'warning' as StatusTone } : undefined;
  const item: DeskItem = {
    id: `hp-${page.code}`,
    kind,
    phase: mat,
    group,
    source: 'hubMap',
    code: page.code,
    title: bi(page.name),
    subtitle: experience ? bi(experience.label) : undefined,
    lines: [{ en: page.route, es: page.route }],
    pill,
    openAt: { path: page.route },
    ref: { entity: 'hubPage', id: page.code },
    plain,
    face: face ? { src: face.src, fit: face.fit, alt: T(`Capture of ${page.name.en} (${page.code})`, `Captura de ${page.name.es} (${page.code})`) } : undefined,
  };
  b.entries.set(item.id, { kind: 'page', page, experience, role });
  return item;
}

function toolItem(map: HubMap, b: Builder, tool: HubTool, mat: string, group: string, ctx: LensCtx): DeskItem {
  const plain = b.faces >= FACE_BUDGET;
  b.faces++;
  const face = plain ? undefined : faceSrc(map, tool.shots, 'desktop', ctx);
  const item: DeskItem = {
    id: `ht-${tool.id}`,
    kind: 'screen',
    phase: mat,
    group,
    source: 'hubMap',
    code: tool.code,
    title: bi(tool.label),
    subtitle: T('Tool', 'Herramienta'),
    lines: [{ en: tool.route, es: tool.route }],
    openAt: { path: tool.route },
    ref: { entity: 'hubTool', id: tool.id },
    plain,
    face: face ? { ...face, alt: T(`Capture of ${tool.label.en}`, `Captura de ${tool.label.es}`) } : undefined,
  };
  b.entries.set(item.id, { kind: 'tool', tool });
  return item;
}

/** Places a group's objects with the lens caps: past the cap, the rest become one `stack` that lists them in the drawer. */
function capped(b: Builder, list: { item: DeskItem; page?: HubPage }[], cap: number, mat: string, group: string, title: Text) {
  const shown = list.length > cap ? list.slice(0, cap - 1) : list;
  for (const x of shown) b.items.push(x.item);
  const rest = list.slice(shown.length);
  if (rest.length) {
    for (const x of rest) b.entries.delete(x.item.id);
    const id = `hm-${mat}-${group}`;
    b.items.push({ id, kind: 'stack', phase: mat, group, source: 'hubMap', title, lines: rest.map((x) => x.item.title), more: rest.length, openAt: { path: '/' } });
    b.entries.set(id, { kind: 'more', pages: rest.flatMap((x) => (x.page ? [x.page] : [])) });
  }
  return shown.length;
}

// ---------------------------------------------------------------- aluzina: one mat per client role

function aluzinaLens(map: HubMap, ctx: LensCtx): LensDesk {
  const b: Builder = { items: [], entries: new Map(), faces: 0 };
  const caps = HUB_CAPS.aluzina;
  const mats: DeskMatDef[] = [];
  const people: DeskPerson[] = [];
  const matRole = new Map<string, HubRole>();
  const rank = (id: string) => (ROLE_ORDER.includes(id) ? ROLE_ORDER.indexOf(id) : ROLE_ORDER.length);
  const roles = [...map.roles].sort((a, c) => rank(a.id) - rank(c.id));
  const known = new Set(map.experiences.map((e) => e.id));
  const orphans = map.pages.filter((p) => !known.has(p.experienceId));
  const buildRole = roles.find((r) => r.band === 'build') ?? roles[roles.length - 1];

  for (const role of roles) {
    const exps = map.experiences.filter((e) => e.roleId === role.id);
    const tools = ctx.showTools && role.id === buildRole?.id ? map.tools : [];
    const extra = role.id === buildRole?.id ? orphans : [];
    if (!exps.length && !tools.length && !extra.length) continue; // maintenance owns no experience today
    const mat = `hr-${role.id.replace(/_/g, '-')}`;
    const subLabels: Record<string, Text> = {};
    let onMat = 0;
    for (const e of exps) {
      const pages = pagesOf(map, e);
      if (pages.length > caps.sub && e.id !== 'app') {
        // A big experience (admin): balanced sub-mats in nav order, "Admin · 1 / 2".
        const parts = Math.ceil(pages.length / caps.sub);
        const size = Math.ceil(pages.length / parts);
        for (let k = 0; k < parts; k++) {
          const group = `hx-${e.id}-${k + 1}`;
          subLabels[group] = { en: `${e.label.en} · ${k + 1} / ${parts}`, es: `${e.label.es} · ${k + 1} / ${parts}` };
          const chunk = pages.slice(k * size, (k + 1) * size);
          const room = Math.max(1, Math.min(caps.sub, caps.mat - onMat));
          onMat += capped(b, chunk.map((p) => ({ item: pageItem(map, b, p, mat, group, ctx, e, role), page: p })), room, mat, group, T(`more ${e.label.en} pages`, `páginas más de ${e.label.es}`));
        }
        continue;
      }
      if (e.id === 'app') {
        // The member app: sub-mats by what the member is doing.
        for (const part of APP_SPLIT) {
          const inPart = pages.filter((p) => appPart(p.code) === part.id);
          if (!inPart.length) continue;
          const group = `hx-${e.id}-${part.id}`;
          subLabels[group] = { en: `${e.label.en} · ${part.label.en}`, es: `${e.label.es} · ${part.label.es}` };
          const room = Math.max(1, Math.min(caps.sub, caps.mat - onMat));
          onMat += capped(b, inPart.map((p) => ({ item: pageItem(map, b, p, mat, group, ctx, e, role), page: p })), room, mat, group, T(`more ${part.label.en.toLowerCase()} screens`, `pantallas más de ${(part.label.es ?? part.label.en).toLowerCase()}`));
        }
        continue;
      }
      const group = `hx-${e.id}`;
      subLabels[group] = bi(e.label);
      const list: { item: DeskItem; page?: HubPage }[] = [];
      if (e.device === 'page' && pages.length > 1) {
        // The whole website first, as a fanned stack of its tall pages; then every page on its own.
        const face = faceSrc(map, pages[0].shots, 'page', ctx);
        const id = `hs-${e.id}`;
        list.push({ item: { id, kind: 'pages', phase: mat, group, source: 'hubMap', code: e.code, title: { en: `${e.label.en} · ${pages.length} pages`, es: `${e.label.es} · ${pages.length} páginas` }, subtitle: bi(e.label), lines: pages.map((p) => bi(p.name)), more: pages.length, openAt: { path: e.route }, face: face ? { ...face, alt: T(`The ${e.label.en}`, `El ${e.label.es}`) } : undefined } });
        b.entries.set(id, { kind: 'site', experience: e, pages });
        b.faces++;
      }
      for (const p of pages) list.push({ item: pageItem(map, b, p, mat, group, ctx, e, role), page: p });
      const room = Math.max(1, Math.min(caps.sub + (list.length > pages.length ? 1 : 0), caps.mat - onMat));
      onMat += capped(b, list, room, mat, group, T(`more ${e.label.en} pages`, `páginas más de ${e.label.es}`));
    }
    if (extra.length) {
      const group = 'hx-other';
      subLabels[group] = T('Other pages', 'Otras páginas');
      onMat += capped(b, extra.map((p) => ({ item: pageItem(map, b, p, mat, group, ctx, undefined, role), page: p })), caps.sub, mat, group, T('more pages', 'páginas más'));
    }
    if (tools.length) {
      const group = 'hx-tools';
      subLabels[group] = T('Tools', 'Herramientas');
      capped(b, tools.map((tool) => ({ item: toolItem(map, b, tool, mat, group, ctx) })), caps.sub, mat, group, T('more tools', 'herramientas más'));
    }
    mats.push({ id: mat, label: ALUZINA_MAT[role.id] ?? bi(role.label), subLabels });
    matRole.set(mat, role);
    people.push(personFor(role, mat, T(`Owns ${exps.map((e) => e.label.en).join(', ') || 'the tools'} in ${map.product.name.en}.`, `Es dueña de ${exps.map((e) => e.label.es).join(', ') || 'las herramientas'} en ${map.product.name.es}.`)));
  }
  return {
    lens: 'aluzina',
    entries: b.entries,
    matRole,
    model: {
      code: 'W-05',
      mats,
      items: b.items,
      people,
      grouping: T('One mat per client role, outside-in; sub-mats are the experiences that role owns (the member app split by what the member is doing); every page is a device with its real screen as its face', 'Un tapete por rol del cliente, de fuera hacia dentro; los subtapetes son las experiencias de ese rol (la app de socios dividida por lo que la persona hace); cada página es un dispositivo con su pantalla real como cara'),
    },
  };
}

// ---------------------------------------------------------------- between-gigs: one gig, grouped by what it ships

const GIG_MATS: { id: string; label: Text; exps: readonly string[]; band?: string }[] = [
  { id: 'hg-site', label: T('Website', 'Sitio web'), exps: ['site'] },
  { id: 'hg-apps', label: T('Apps', 'Apps'), exps: ['app', 'teacher'], band: 'outside' },
  { id: 'hg-ops', label: T('Back office', 'Operación'), exps: ['desk', 'inbox', 'pos', 'crm', 'finance', 'admin'], band: 'team' },
  { id: 'hg-build', label: T('Build', 'Construcción'), exps: ['manual', 'docs', 'kb', 'dev'], band: 'build' },
];

function betweenGigsLens(map: HubMap, ctx: LensCtx): LensDesk {
  const b: Builder = { items: [], entries: new Map(), faces: 0 };
  const caps = HUB_CAPS['between-gigs'];
  const mats: DeskMatDef[] = [];
  const people: DeskPerson[] = [];
  const matRole = new Map<string, HubRole>();
  const placed = new Set<string>();
  const roleById = new Map(map.roles.map((r) => [r.id, r]));
  const matOf = (e: HubExperience) => GIG_MATS.find((m) => m.exps.includes(e.id)) ?? GIG_MATS.find((m) => m.band === e.band) ?? GIG_MATS[GIG_MATS.length - 1];

  for (const def of GIG_MATS) {
    const exps = map.experiences.filter((e) => matOf(e) === def);
    if (!exps.length) continue;
    const subLabels: Record<string, Text> = {};
    const owned = new Map<string, number>();
    let onMat = 0;
    for (const e of exps) {
      const pages = pagesOf(map, e);
      owned.set(e.roleId, (owned.get(e.roleId) ?? 0) + pages.length);
      const group = `hx-${e.id}`;
      subLabels[group] = bi(e.label);
      const list: { item: DeskItem; page?: HubPage }[] = [];
      if (e.device === 'page' && pages.length > 1) {
        const face = faceSrc(map, pages[0].shots, 'page', ctx);
        const id = `hs-${e.id}`;
        list.push({ item: { id, kind: 'pages', phase: def.id, group, source: 'hubMap', code: e.code, title: { en: `${e.label.en} · ${pages.length} pages`, es: `${e.label.es} · ${pages.length} páginas` }, lines: pages.map((p) => bi(p.name)), more: pages.length, openAt: { path: e.route }, face: face ? { ...face } : undefined } });
        b.entries.set(id, { kind: 'site', experience: e, pages });
      }
      for (const p of pages) list.push({ item: pageItem(map, b, p, def.id, group, ctx, e, roleById.get(e.roleId)), page: p });
      const room = Math.max(1, Math.min(caps.sub, caps.mat - onMat));
      onMat += capped(b, list, room, def.id, group, T(`more ${e.label.en} pages`, `páginas más de ${e.label.es}`));
      placed.add(e.id);
    }
    mats.push({ id: def.id, label: def.label, subLabels });
    const primary = [...owned.entries()].sort((a, c) => c[1] - a[1])[0]?.[0];
    const role = primary ? roleById.get(primary) : undefined;
    if (role) {
      matRole.set(def.id, role);
      people.push(personFor(role, def.id, T(`${role.label.en} owns most of what sits here.`, `${role.label.es} es dueña de casi todo lo que hay aquí.`)));
    }
  }
  if (ctx.showTools && map.tools.length) {
    const id = 'hg-tools';
    const group = 'hx-tools';
    capped(b, map.tools.map((tool) => ({ item: toolItem(map, b, tool, id, group, ctx) })), caps.sub, id, group, T('more tools', 'herramientas más'));
    mats.push({ id, label: T('Tools', 'Herramientas'), subLabels: { [group]: T('The gig’s tools', 'Las herramientas del gig') } });
    const role = map.roles.find((r) => r.band === 'build');
    if (role) {
      matRole.set(id, role);
      people.push(personFor(role, id, T('Whoever builds the gig keeps its tools.', 'Quien construye el gig lleva sus herramientas.')));
    }
  }
  return {
    lens: 'between-gigs',
    entries: b.entries,
    matRole,
    model: {
      code: 'W-05',
      mats,
      items: b.items,
      people,
      grouping: T('One mat per thing the gig ships (website, apps, back office, build, tools), with the role that owns most of it; sub-mats are the experiences, condensed past twelve screens', 'Un tapete por lo que entrega el gig (sitio, apps, operación, construcción, herramientas), con el rol que más lo lleva; los subtapetes son las experiencias, condensadas pasadas doce pantallas'),
    },
  };
}

// ---------------------------------------------------------------- standalone: the client's own testing hub

const BANDS: { id: string; label: Text }[] = [
  { id: 'outside', label: T('Outside: members, visitors, teachers', 'Fuera: socios, visitantes, profesores') },
  { id: 'team', label: T('The team', 'El equipo') },
  { id: 'build', label: T('Build: docs and dev', 'Construcción: docs y dev') },
];

function standaloneLens(map: HubMap, ctx: LensCtx): LensDesk {
  const b: Builder = { items: [], entries: new Map(), faces: 0 };
  const mat = 'hh-hub';
  const subLabels: Record<string, Text> = { 'hx-hub': T('The hub', 'El hub') };
  const hubPage = map.pages.find((p) => p.route === map.product.hubRoute || p.code === 'HUB-01');
  const hubFace = faceSrc(map, hubPage?.shots, 'desktop', ctx);
  b.items.push({ id: 'hh-home', kind: 'screen', phase: mat, group: 'hx-hub', source: 'hubMap', code: hubPage?.code ?? 'HUB', title: { en: `${map.product.name.en} hub`, es: `Hub de ${map.product.name.es}` }, subtitle: bi(map.lenses.standalone.title), lines: [{ en: map.product.hubRoute, es: map.product.hubRoute }], openAt: { path: map.product.hubRoute }, face: hubFace ? { ...hubFace } : undefined, pill: { label: T('start here', 'empieza aquí'), tone: 'accent' } });
  b.entries.set('hh-home', { kind: 'hub', page: hubPage });
  const roleById = new Map(map.roles.map((r) => [r.id, r]));
  for (const band of BANDS) {
    const exps = map.experiences.filter((e) => e.band === band.id);
    if (!exps.length) continue;
    const group = `hx-${band.id}`;
    subLabels[group] = band.label;
    for (const e of exps) {
      const entry = map.pages.find((p) => p.code === e.code && p.experienceId === e.id) ?? map.pages.find((p) => p.code === e.code);
      const face = faceSrc(map, e.shots ?? entry?.shots, 'desktop', ctx);
      const id = `he-${e.id}`;
      b.items.push({ id, kind: 'screen', phase: mat, group, source: 'hubMap', code: e.code, title: bi(e.label), subtitle: bi(roleById.get(e.roleId)?.label ?? e.label), lines: [bi(e.purpose)], openAt: { path: e.route }, face: face ? { ...face } : undefined, pill: e.featured ? { label: T('featured', 'destacada'), tone: 'accent' } : undefined });
      b.entries.set(id, { kind: 'experience', experience: e, page: entry, role: roleById.get(e.roleId) });
    }
  }
  if (ctx.showTools && map.tools.length) {
    const group = 'hx-tools';
    subLabels[group] = T('Testing tools', 'Herramientas de prueba');
    for (const tool of map.tools) b.items.push(toolItem(map, b, tool, mat, group, ctx));
  }
  const builder = map.roles.find((r) => r.band === 'build');
  const people = builder ? [personFor(builder, mat, T('Whoever builds the hub views it as any role.', 'Quien construye el hub lo ve como cualquier rol.'))] : [];
  return {
    lens: 'standalone',
    entries: b.entries,
    matRole: new Map(builder ? [[mat, builder]] : []),
    model: {
      code: 'W-05',
      mats: [{ id: mat, label: bi(map.lenses.standalone.title), subLabels }],
      items: b.items,
      people,
      perRow: () => 1,
      grouping: T('One mat: the hub itself, then one screen per experience by band (its entry page), then the testing tools, as on the client’s own hub', 'Un tapete: el hub mismo, luego una pantalla por experiencia por banda (su página de entrada), luego las herramientas de prueba, como en el hub propio del cliente'),
    },
  };
}

/** The desk model of one lens. */
export function buildLens(map: HubMap, lens: HubLensId, ctx: LensCtx): LensDesk {
  if (lens === 'between-gigs') return betweenGigsLens(map, ctx);
  if (lens === 'standalone') return standaloneLens(map, ctx);
  return aluzinaLens(map, ctx);
}

/** The lens hint's `showTools`, unless the tester chose otherwise. */
export const toolsDefault = (map: HubMap | null, lens: HubLensId) => map?.lenses[lens]?.showTools ?? lens !== 'aluzina';
