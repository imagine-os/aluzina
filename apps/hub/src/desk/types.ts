import type { StatusTone, Text } from '../tenant/domain';
import type { DeskPerson } from './people';

/**
 * The desk system (D-103 engine, D-106 platform layer): a desk holds mats, a mat holds sub-mats, a sub-mat holds
 * objects on 64 px chess squares, and a mat may seat one person. Pure types and geometry, no React. Every client
 * (W-04's playbook desk, the page desks the DesktopShell mounts above every portal page) builds a `DeskModel`; the
 * engine lays it out (`layout.ts`) and renders it (`DeskStage`).
 */

/** One chess square in world px. Every mat, sub-mat and object sits on this grid. */
export const SQ = 64;
/** Columns of squares inside one mat. */
export const MAT_COLS = 9;
/** Mat header (the mat's label button), one square tall. */
export const MAT_HEAD = SQ;
/** Mat padding and the gap between sub-mats. */
export const MAT_PAD = SQ / 2;
/** Sub-mat label strip above its squares. */
export const SUB_HEAD = 24;
/** Gap between mats and around the world. */
export const MAT_GAP = SQ;
/** A person's station (desk, chair, figure) on a mat's near edge, below the sub-mats: 5 x 3 squares (D-104). */
export const PERSON_COLS = 5;
export const PERSON_ROWS = 3;

/**
 * Object kinds. `light` is a row of W-04's followed project (D-105); `stack` is the "+N more" pile a page desk puts
 * at the end of a capped sub-mat (D-106). The rest are the physical objects of D-103, plus the device objects
 * (hub desks): `phone`, `tablet`, `screen` (a monitor on a thin stand), `page` (one tall website page) and `pages` (a
 * fanned stack of tall pages), whose face is an image of the screen they stand for (`DeskItem.face`).
 */
export type ItemKind = 'sheet' | 'form' | 'checklist' | 'document' | 'folder' | 'box' | 'token' | 'card' | 'light' | 'stack' | 'phone' | 'tablet' | 'screen' | 'page' | 'pages' | 'profile';
export const ITEM_KINDS: readonly ItemKind[] = ['sheet', 'form', 'checklist', 'document', 'folder', 'box', 'token', 'card', 'light', 'stack', 'phone', 'tablet', 'screen', 'page', 'pages', 'profile'];
/** Device objects: drawn as a device (bezel, screen, stand or paper) with an image face and a caption strip. */
export const DEVICE_KINDS: ReadonlySet<ItemKind> = new Set<ItemKind>(['phone', 'tablet', 'screen', 'page', 'pages']);

export interface KindGeometry {
  /** Thickness in world px (translateZ of the top face). */
  t: number;
  /** Footprint in squares: `w` wide by `h` tall (multi-row footprints: devices). */
  w: 1 | 2 | 3;
  h: 1 | 2 | 3;
  /** Top-face size in world px (a device: the device body, without its caption strip). */
  face: { w: number; h: number };
  /** The face's base font size in world px (every size inside a face is em). */
  font: number;
  /** Device kinds: the caption strip's font size in world px (0 / absent: no strip; `screen` prints it on its chin). */
  cap?: number;
}

/**
 * Thickness in world px (translateZ of the top face), footprint in squares, top-face size and the face's base font
 * size in world px (every size inside a face is em, so the drawer and the legend scale the same markup).
 */
export const GEOMETRY: Record<ItemKind, KindGeometry> = {
  // Paper objects (changelog 0045): every paper face is 1em = 4 world px, so the hierarchy (caps title, body preview,
  // footer) is the same on every kind; each leaves at least 6 px to the next square, turned (paper.ts).
  sheet: { t: 1, w: 1, h: 1, face: { w: 46, h: 58 }, font: 4 },
  form: { t: 1, w: 1, h: 1, face: { w: 46, h: 58 }, font: 4 },
  checklist: { t: 1, w: 1, h: 1, face: { w: 46, h: 58 }, font: 4 },
  document: { t: 6, w: 1, h: 1, face: { w: 44, h: 53 }, font: 4 },
  folder: { t: 8, w: 2, h: 1, face: { w: 112, h: 46 }, font: 4 },
  box: { t: 20, w: 1, h: 1, face: { w: 50, h: 50 }, font: 4.4 },
  token: { t: 4, w: 1, h: 1, face: { w: 44, h: 44 }, font: 3.4 },
  card: { t: 2, w: 1, h: 1, face: { w: 56, h: 40 }, font: 4 },
  light: { t: 2, w: 1, h: 1, face: { w: 58, h: 58 }, font: 6.4 },
  stack: { t: 5, w: 1, h: 1, face: { w: 46, h: 56 }, font: 4.2 },
  // Devices. Phone 390 x 844 screens, tablet 3:4, screen 16:10 on a stand, tall website pages.
  phone: { t: 4, w: 1, h: 2, face: { w: 44, h: 96 }, font: 3.4, cap: 8.2 },
  tablet: { t: 4, w: 2, h: 2, face: { w: 78, h: 104 }, font: 4, cap: 9 },
  screen: { t: 4, w: 3, h: 2, face: { w: 176, h: 114 }, font: 5, cap: 9.5 },
  page: { t: 1, w: 1, h: 3, face: { w: 54, h: 162 }, font: 3.4, cap: 8.2 },
  pages: { t: 1, w: 2, h: 3, face: { w: 104, h: 156 }, font: 4.4, cap: 9 },
  // A lead's profile card (D-114): portrait, logo, name, company, status, budget and its networks, two squares wide.
  profile: { t: 2, w: 2, h: 1, face: { w: 118, h: 54 }, font: 5 },
};

/** Full faces per desk; objects past it render a plain tile (D-106, performance; image faces are not requested either). */
export const FACE_BUDGET = 200;

/** Height of a device's caption strip under its body (world px; `screen` prints its caption on the chin instead). */
export const CAPTION_H = 24;

/** Where the real page for an object lives (its Open navigates there). */
export interface OpenAt {
  /** A route path of the hub, e.g. `/founder/leads`; the page resolves its code and name from the manifest. */
  path: string;
}

export interface DeskItem {
  id: string;
  kind: ItemKind;
  /** The mat the object lies on (a mat id of the model). */
  phase: string;
  /** The sub-mat inside that mat (a group id; sub-mat ids are `<mat>:<group>`). */
  group: string;
  /** Where the object comes from (drawer "Source"); `row` for page desks. */
  source: string;
  /** Short code printed on the object (service code, phase id, rule id, unit). */
  code?: string;
  /** The playbook service the object belongs to (`01`, `02`, `03`, `E`, `04`): its face's band colour (D-117). */
  service?: string;
  title: Text;
  /** Second line: the service a checklist belongs to, the status set of a token, a rule kind, a row's entity. */
  subtitle?: Text;
  /** Rows of the face: field labels, checklist items, deliverable lines, a row's amount / date / fields. */
  lines: Text[];
  /** Section headings inside `lines` for grouped checklists (index -> heading). */
  sections?: { at: number; label: Text }[];
  tone?: StatusTone;
  /** A status pill on the face (page desks: the row's status in its StatusPill tone). */
  pill?: { label: Text; tone: StatusTone };
  openAt: OpenAt;
  /** The row this object is (light tiles, page desk objects): entity + id. */
  ref?: { entity: string; id: string };
  /** Rows not shown: "+N more" on the last light tile, the count of a `stack`. */
  more?: number;
  /** Past the face budget (~200 per desk) the object renders a plain tile: its title only (D-106, performance). */
  plain?: boolean;
  /** The face's base font size in world px when it differs from the kind's (page desk faces carry fewer, larger lines). */
  font?: number;
  /**
   * An image face (device kinds): the screen it stands for. Drawn over the text face, lazily; while it loads or
   * when it fails the drawn device and its title stay (never a broken image). `top` anchors a tall page at its header.
   */
  face?: { src: string; alt?: Text; fit?: 'cover' | 'top' };
  /** A person or company card with a picture (kind `profile`, lead dossiers D-114; also a lead's light tile on W-04). */
  profile?: { portrait?: string; logo?: string; company?: string; place?: string; budget?: Text; networks?: readonly string[] };
  /** On a free mat (a work mat, D-114): the square the object was put on (column, row of its sub-mat grid). */
  at?: { col: number; row: number };
}

export interface PlacedItem extends DeskItem {
  /** Cell position in world px (top left of the footprint cell; relative to its sub-mat inside `SubMat.items`). */
  x: number;
  y: number;
  /** Footprint in world px (w squares by h squares). */
  cw: number;
  ch: number;
}

export interface SubMat {
  /** `<mat>:<group>`. */
  id: string;
  group: string;
  /** The model's label for this sub-mat, when it gave one (W-04 names its groups through its string table). */
  label?: Text;
  x: number;
  y: number;
  w: number;
  h: number;
  items: PlacedItem[];
}

export interface Mat {
  id: string;
  index: number;
  label: Text;
  x: number;
  y: number;
  w: number;
  h: number;
  subs: SubMat[];
  /** Objects on the mat (light tiles are counted in `lights`; a stack counts the rows it stands for). */
  count: number;
  lights: number;
  /** The person's station, relative to the mat (world px); only on mats that seat a person. */
  person?: { x: number; y: number; w: number; h: number };
}

export interface DeskLayout {
  mats: Mat[];
  /** Every object in world coordinates (mat + sub-mat + cell). */
  items: PlacedItem[];
  width: number;
  height: number;
}

/** A mat of the model: its id, label, and (optionally) the sub-mats' labels by group id. */
export interface DeskMatDef {
  id: string;
  label: Text;
  subLabels?: Record<string, Text>;
  /**
   * A free mat (a work mat, D-114): one sub-mat of `cols` x `rows` squares (it grows to fit) where objects lie on the
   * square in their `at` (a person arranged them) instead of being packed; objects without `at` take the first free
   * squares. The layout check still proves no two objects share a square.
   */
  free?: { cols: number; rows: number; label?: Text };
}

/**
 * What a client hands the engine. Mats keep the model's order; sub-mats inside a mat follow `groups` (when given)
 * and otherwise the order of their first object; objects keep their order inside a sub-mat.
 */
export interface DeskModel {
  /** The page code the desk belongs to (height preference, ids). */
  code: string;
  mats: DeskMatDef[];
  groups?: readonly string[];
  items: DeskItem[];
  /** Mats that seat a person (W-04, D-104). */
  people?: DeskPerson[];
  /** One line for the legend: how objects are grouped into sub-mats on this desk. */
  grouping?: Text;
  /** Mats per row for a stage aspect ratio (w / h); the default rows 2 to 6 by shape. */
  perRow?: (aspect: number, mats: number) => number;
}

/** Default mats per row: 1-2 on tall phones, 3 squarish, 4 landscape, up to 6 on wide short stages. */
export function defaultPerRow(aspect: number, mats: number): number {
  const n = aspect < 0.7 ? 2 : aspect < 1.25 ? 3 : aspect < 2.2 ? 4 : 6;
  return Math.max(1, Math.min(mats, n));
}
