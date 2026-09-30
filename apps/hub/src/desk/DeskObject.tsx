import { memo, useState, type CSSProperties, type FocusEvent, type MouseEvent, type ReactNode } from 'react';
import { Icon, isIconName } from '../components/atom/Icon/Icon';
import { pick, type Text } from '../tenant/domain';
import { BrandMark } from '../components/atom/BrandMark/BrandMark';
import { bandClass, faceBox, fitTitle, stageOf, turnOf } from './paper';
import { deskStrings } from './strings';
import { CAPTION_H, DEVICE_KINDS, GEOMETRY, type DeskItem, type PlacedItem } from './types';

export { faceBox } from './paper';

type Lang = 'en' | 'es';

/** Rows the top face of a page shows before "+N" (the drawer lists them all). */
const FACE_ROWS: Record<string, number> = { profile: 0, sheet: 12, form: 10, checklist: 12, document: 11, folder: 4, box: 0, token: 0, card: 0, light: 3, stack: 0, phone: 5, tablet: 7, screen: 5, page: 12, pages: 10 };

interface PreviewProps {
  item: DeskItem;
  lang: Lang;
  /** Row cap; `Infinity` in the drawer. */
  rows?: number;
  moreLabel: (n: number) => string;
  /** Drawer / legend: an image face carries its alt text (on the desk the object's button names it). */
  labelled?: boolean;
}

/**
 * The top face of an object: a miniature of the thing itself drawn from its data (field labels, checklist items,
 * status name, rule text), never an icon. All sizes are em, so the same markup is the face on the desk and the
 * large preview in the drawer. Spans only: it renders inside a <button>.
 */
export function Preview({ item, lang, rows, moreLabel, labelled = false }: PreviewProps) {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  const cap = rows ?? FACE_ROWS[item.kind] ?? 8;
  const shown = item.lines.slice(0, cap);
  const more = item.lines.length - shown.length;
  const pill = item.pill ? <span className={`dp__pill dp--tone-${item.pill.tone}`}>{p(item.pill.label)}</span> : null;

  if (DEVICE_KINDS.has(item.kind)) return <DeviceFace item={item} lang={lang} shown={shown} pill={pill} moreLabel={moreLabel} labelled={labelled} />;
  if (item.face && item.kind === 'document') {
    // A document whose first page is an image (a hub doc or manual page): the page image over its text face.
    return (
      <span className="dp dp--page dp--document dp--imaged">
        <span className="dp__fallback">
          {item.code && <span className="dp__code">{item.code}</span>}
          <span className="dp__title">{p(item.title)}</span>
        </span>
        {!item.plain && <FaceImage key={item.face.src} face={item.face} lang={lang} alt={labelled} />}
        {pill}
      </span>
    );
  }
  if (item.kind === 'stack') {
    // The "+N more" pile at the end of a capped sub-mat (page desks, D-106): the count and what it stands for.
    return (
      <span className="dp dp--stack">
        <span className="dp__big">{moreLabel(item.more ?? 0)}</span>
        <span className="dp__sub">{p(item.title)}</span>
      </span>
    );
  }
  if (item.plain) {
    // Past the face budget (D-106): the title and the status only, a handful of nodes instead of a full face.
    return (
      <span className={`dp dp--plain dp--${item.kind}`}>
        {pill}
        <span className="dp__title">{p(item.title)}</span>
      </span>
    );
  }

  if (item.kind === 'light') {
    // A row of the followed project (D-105): what it is, its real content, and "+N more" on the last of its kind.
    return (
      <span className={`dp dp--light dp--band-tone dp--tone-${item.tone ?? 'info'}${item.profile?.portrait ? ' dp--with-avatar' : ''}`}>
        <span className="dp__band">
          <span className="dp__bandtext">{p(item.subtitle)}</span>
        </span>
        <span className="dp__kicker">
          {item.profile?.portrait && <img className="dp__avatar" src={item.profile.portrait} alt="" draggable={false} />}
          <span className="dp__title">{p(item.title)}</span>
        </span>
        <span className="dp__rows">
          {shown.map((line, i) => (
            <span key={i} className={`dp__row${i === shown.length - 1 ? ' dp__row--key' : ''}`}>
              {p(line)}
            </span>
          ))}
        </span>
        {(item.more ?? 0) > 0 && <span className="dp__more dp__more--light">{moreLabel(item.more ?? 0)}</span>}
      </span>
    );
  }
  if (item.kind === 'token') {
    return (
      <span className={`dp dp--token dp--tone-${item.tone ?? 'neutral'}`}>
        <span className="dp__title">{p(item.title)}</span>
        <span className="dp__code">{item.code}</span>
      </span>
    );
  }
  if (item.kind === 'profile') {
    // A lead's card (D-114): photo top-left, logo top-right, name, company, status, budget, the networks it is on.
    const pr = item.profile ?? {};
    return (
      <span className="dp dp--profile">
        <span className="dp__head">
          {pr.portrait ? <img className="dp__portrait" src={pr.portrait} alt="" draggable={false} /> : <span className="dp__portrait dp__portrait--none" />}
          <span className="dp__who">
            <span className="dp__title">{p(item.title)}</span>
            {(pr.company || pr.place) && <span className="dp__sub">{pr.company ?? pr.place}</span>}
          </span>
          {pr.logo && <img className="dp__logo" src={pr.logo} alt="" draggable={false} />}
        </span>
        <span className="dp__foot">
          {pill}
          {pr.budget && <span className="dp__budget">{p(pr.budget)}</span>}
        </span>
        {(pr.networks?.length ?? 0) > 0 && (
          <span className="dp__nets">
            {pr.networks!.map((n) => (isIconName(n) ? <Icon key={n} name={n} size="sm" className="dp__net" /> : null))}
          </span>
        )}
      </span>
    );
  }
  if (item.kind === 'card') return <CardFace item={item} lang={lang} pill={pill} />;
  if (item.kind === 'box') return <BoxFace item={item} lang={lang} pill={pill} />;
  if (item.kind === 'folder') return <FolderFace item={item} lang={lang} pill={pill} shown={shown} more={more} moreLabel={moreLabel} />;
  if (item.kind === 'document') return <DocumentFace item={item} lang={lang} pill={pill} />;
  if (item.kind === 'form') return <FormFace item={item} lang={lang} pill={pill} />;
  if (item.kind === 'checklist') return <ChecklistFace item={item} lang={lang} pill={pill} />;
  return <SheetFace item={item} lang={lang} pill={pill} rows={rows} />;
}

// ---------------------------------------------------------------------------------------------------------------
// Paper faces (changelog 0045, D-117). One hierarchy on every kind: a band (service / status / kind colour, a tiny
// caps code), a caps title in the heading face sized to fit (`fitTitle`), a body-face preview, a footer (code or a
// count). Sizes are em of the face font (1em = 4 world px on paper), so the drawer and the legend scale the same
// markup. Row counts are computed, never clipped mid-row: a face shows whole rows only.
// ---------------------------------------------------------------------------------------------------------------

type FaceProps = { item: DeskItem; lang: Lang; pill: ReactNode };

/** A desk string in the face's language (the faces render outside the page's `t`, like the drawer's preview). */
function ft(key: string, lang: Lang, vars: Record<string, string | number> = {}): string {
  const e = deskStrings[key];
  const raw = typeof e === 'string' ? e : (lang === 'es' ? e?.es : undefined) ?? e?.en ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}

/** The band's text: service and stage, else the code (and a card's kind), else the row's entity, else the kind. */
function bandText(item: DeskItem, lang: Lang): string {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  if (item.service) {
    const stage = stageOf(item.code);
    return stage ? `${item.service} · ${ft('desk.face.stage', lang, { n: stage })}` : item.service;
  }
  if (item.kind === 'card' && item.code && item.subtitle) return `${item.code} · ${p(item.subtitle)}`;
  if (item.code) return item.code;
  if (item.source === 'row' && item.subtitle) return p(item.subtitle);
  return ft(`desk.kind.${item.kind}`, lang);
}

function Band({ item, lang }: { item: DeskItem; lang: Lang }) {
  return (
    <span className="dp__band">
      <span className="dp__bandtext">{bandText(item, lang)}</span>
    </span>
  );
}

/** Face size in em of its font: width and height of the face. */
function faceEm(item: DeskItem): { w: number; h: number } {
  const g = GEOMETRY[item.kind];
  const f = item.font ?? g.font;
  return { w: g.face.w / f, h: g.face.h / f };
}

/**
 * Caps widths measured in the face's own heading font (a canvas, once per word), 4 % wider for the tracking's
 * rounding; the estimate of paper.ts where there is no canvas. The first measure happens after the page's fonts
 * are declared, so a fallback face measures wider, never narrower, than the face that loads later.
 */
const capsCache = new Map<string, number>();
let capsCtx: CanvasRenderingContext2D | null | undefined;
function measureCaps(word: string): number {
  const hit = capsCache.get(word);
  if (hit !== undefined) return hit;
  if (capsCtx === undefined) {
    try {
      capsCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
      if (capsCtx) capsCtx.font = `700 100px ${getComputedStyle(document.documentElement).getPropertyValue('--font-display') || 'system-ui'}`;
    } catch {
      capsCtx = null;
    }
  }
  const w = capsCtx ? (capsCtx.measureText(word.toUpperCase()).width / 100 + (word === ' ' ? 0 : word.length * 0.05)) * 1.04 : word === ' ' ? 0.36 : word.length * 0.8;
  capsCache.set(word, w);
  return w;
}

/** Title size and the lines it takes, for a width in em (the face minus its padding). */
function titleFit(text: string, widthEm: number, maxEm: number, lines: number, minEm = 0.95) {
  return fitTitle(text, widthEm, maxEm, minEm, lines, measureCaps);
}

const LH_TITLE = 1.08;
const PAD_X = 0.7;

/** Sheet: one page, its top-right corner folded over (a real triangle with the lighter back of the paper). */
function SheetFace({ item, lang, pill, rows }: FaceProps & { rows?: number }) {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  const em = faceEm(item);
  const title = p(item.title);
  const t = titleFit(title, em.w - 2 * PAD_X - 0.6, 1.6, 3);
  // Rows of the preview (0.8em, 1.3 line height): what is left under band, title and footer.
  const avail = em.h - 0.95 - 0.55 - t.lines * t.size * LH_TITLE - 0.35 - 1.25 - 0.45;
  const cap = rows === Infinity ? item.lines.length : Math.max(0, Math.min(3, Math.floor(avail / 1.04)));
  const one = item.lines.length === 1;
  const shown = item.lines.slice(0, one ? 1 : cap);
  const foot = pill ?? (item.lines.length > cap && cap > 0 ? <span className="dp__count">{ft('desk.face.items', lang, { n: item.lines.length })}</span> : null);
  return (
    <span className={`dp dp--paperface dp--sheet ${bandClass(item)}`}>
      <Band item={item} lang={lang} />
      <span className="dp__fold" aria-hidden="true" />
      <span className="dp__title" style={{ fontSize: `${t.size}em`, WebkitLineClamp: t.lines }}>
        {title}
      </span>
      {cap > 0 && shown.length > 0 && (
        <span className="dp__body">
          {one ? (
            <span className="dp__para" style={{ WebkitLineClamp: rows === Infinity ? 99 : cap }}>
              {p(shown[0])}
            </span>
          ) : (
            shown.map((line, i) => (
              <span key={i} className={`dp__line${i === 0 && item.source === 'row' ? ' dp__line--key' : ''}`}>
                {p(line)}
              </span>
            ))
          )}
        </span>
      )}
      <span className="dp__foot">{foot}</span>
    </span>
  );
}

/** Form: 5 to 7 field rows (label and a rule to write on), a signature line at the foot. */
function FormFace({ item, lang, pill }: FaceProps) {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  const em = faceEm(item);
  const title = p(item.title);
  const t = titleFit(title, em.w - 2 * PAD_X, 1.3, 2);
  const avail = em.h - 0.95 - 0.5 - t.lines * t.size * LH_TITLE - 0.3 - 2.3 - 0.4;
  const n = Math.max(5, Math.min(7, Math.floor(avail / 1.08)));
  const fields = Array.from({ length: n }, (_, i) => item.lines[i]);
  return (
    <span className={`dp dp--paperface dp--form ${bandClass(item)}`}>
      <Band item={item} lang={lang} />
      <span className="dp__title" style={{ fontSize: `${t.size}em`, WebkitLineClamp: t.lines }}>
        {title}
      </span>
      <span className="dp__fields">
        {fields.map((f, i) => (
          <span key={i} className={`dp__fieldrow${f ? '' : ' is-blank'}`}>
            {f && <span className="dp__label">{p(f)}</span>}
            <span className="dp__rule" aria-hidden="true" />
          </span>
        ))}
      </span>
      <span className="dp__sign">
        <span className="dp__signline" aria-hidden="true" />
        <span className="dp__foot">
          <span>{ft('desk.face.signature', lang)}</span>
          {pill ?? <span className="dp__count">{ft('desk.face.fields', lang, { n: item.lines.length })}</span>}
        </span>
      </span>
    </span>
  );
}

/** Checklist: a title, 3 to 6 real items with square tick boxes, "n items" at the foot. */
function ChecklistFace({ item, lang, pill }: FaceProps) {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  const em = faceEm(item);
  const title = p(item.title);
  const t = titleFit(title, em.w - 2 * PAD_X, 1.35, 2);
  const avail = em.h - 0.95 - 0.5 - t.lines * t.size * LH_TITLE - 0.35 - 1.25 - 0.45;
  const n = Math.max(3, Math.min(6, Math.floor(avail / 1.12)));
  const items = item.lines.slice(0, n);
  const blanks = Math.max(0, Math.min(3, n) - items.length);
  return (
    <span className={`dp dp--paperface dp--checklist ${bandClass(item)}`}>
      <Band item={item} lang={lang} />
      <span className="dp__title" style={{ fontSize: `${t.size}em`, WebkitLineClamp: t.lines }}>
        {title}
      </span>
      <span className="dp__ticks">
        {items.map((line, i) => (
          <span key={i} className="dp__tick">
            <span className="dp__tickbox" aria-hidden="true" />
            <span className="dp__ticktext">{p(line)}</span>
          </span>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`b${i}`} className="dp__tick is-blank">
            <span className="dp__tickbox" aria-hidden="true" />
            <span className="dp__rule" aria-hidden="true" />
          </span>
        ))}
      </span>
      <span className="dp__foot">
        {pill ?? <span className="dp__count">{ft('desk.face.items', lang, { n: item.lines.length })}</span>}
      </span>
    </span>
  );
}

/** Document: a cover (title, subtitle, the brand's monogram) on three offset page edges (drawn by its shadow). */
function DocumentFace({ item, lang, pill }: FaceProps) {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  const em = faceEm(item);
  const title = p(item.title);
  const t = titleFit(title, em.w - 2 * 0.8, 1.55, 3);
  const sub = item.source === 'row' ? (item.lines[0] ? p(item.lines[0]) : '') : p(item.subtitle);
  return (
    <span className={`dp dp--paperface dp--document ${bandClass(item)}`}>
      <Band item={item} lang={lang} />
      <span className="dp__cover">
        <span className="dp__title" style={{ fontSize: `${t.size}em`, WebkitLineClamp: t.lines }}>
          {title}
        </span>
        <span className="dp__coverrule" aria-hidden="true" />
        {sub && <span className="dp__sub">{sub}</span>}
      </span>
      <span className="dp__foot">
        <span className="dp__mark" aria-hidden="true">
          <BrandMark kind="monogram" finish="flat" tone="periwinkle" size="sm" />
        </span>
        {pill ?? (item.lines.length > 0 && <span className="dp__count">{ft('desk.face.pages', lang, { n: item.lines.length })}</span>)}
      </span>
    </span>
  );
}

/** Folder: manila, a real tab with the code, papers showing at the top edge, a label plate with the name. */
function FolderFace({ item, lang, pill, shown, more, moreLabel }: FaceProps & { shown: Text[]; more: number; moreLabel: (n: number) => string }) {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  const em = faceEm(item);
  const title = p(item.title);
  const plateW = em.w * 0.62;
  const t = titleFit(title, plateW - 2 * 0.55, 1.5, 2);
  const count = item.sections?.[0] ? p(item.sections[0].label) : item.lines.length > 0 ? ft('desk.face.items', lang, { n: item.lines.length }) : '';
  const rest = shown.slice(0, 3);
  return (
    // Flow layout only (no positioned spans): inside a solid's top face a positioned span that overlaps a neighbour's
    // side becomes a compositor layer of its own (K-04 went +20 % until the tab and the plate were in the flow).
    <span className={`dp dp--folderface ${bandClass(item)}`}>
      <span className="dp__tabrow" aria-hidden="true">
        <span className="dp__tab">
          <span className="dp__tabtext">{item.code ?? bandText(item, lang)}</span>
        </span>
        <span className="dp__papers" />
      </span>
      <span className="dp__folderbody">
        <span className="dp__plate" style={{ width: `${plateW}em` }}>
          <span className="dp__title" style={{ fontSize: `${t.size}em`, WebkitLineClamp: t.lines }}>
            {title}
          </span>
          {item.subtitle && <span className="dp__sub">{p(item.subtitle)}</span>}
        </span>
        <span className="dp__side">
          {pill}
          {rest.map((line, i) => (
            <span key={i} className="dp__line">
              {p(line)}
            </span>
          ))}
          {more > 0 && rest.length === shown.length && <span className="dp__more">{moreLabel(more)}</span>}
        </span>
      </span>
      {count && <span className="dp__foot dp__foot--folder">{count}</span>}
    </span>
  );
}

/** Box: a lid (its seam on the sides), a label plate with the kit's name, the code stencilled on the kraft. */
function BoxFace({ item, lang, pill }: FaceProps) {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  const em = faceEm(item);
  const title = p(item.title);
  const t = titleFit(title, em.w - 2 * 0.9 - 2 * 0.45, 1.2, 2, 0.8);
  return (
    <span className={`dp dp--boxface ${bandClass(item)}`}>
      {item.code && <span className="dp__stencil">{item.code}</span>}
      <span className="dp__plate">
        <span className="dp__plateband" aria-hidden="true" />
        <span className="dp__title" style={{ fontSize: `${t.size}em`, WebkitLineClamp: t.lines }}>
          {title}
        </span>
        {item.subtitle && <span className="dp__sub">{p(item.subtitle)}</span>}
      </span>
      <span className="dp__foot dp__foot--box">
        {pill}
        {item.lines.length > 0 && <span className="dp__count">{ft('desk.face.items', lang, { n: item.lines.length })}</span>}
      </span>
    </span>
  );
}

/** Card: stiff card, rounded corners, a coloured rule down its left edge; a rule's text reads as a sentence. */
function CardFace({ item, lang, pill }: FaceProps) {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  const em = faceEm(item);
  const title = p(item.title);
  const sentence = title.length > 34;
  const t = sentence ? { size: 0.8, lines: 5 } : titleFit(title, em.w - 0.9 - 0.3 - 0.7, 1.35, 2);
  const avail = em.h - 0.6 - 1.05 - t.lines * t.size * (sentence ? 1.24 : LH_TITLE) - 0.4 - 0.5;
  const cap = sentence ? 0 : Math.max(0, Math.min(2, Math.floor(avail / 1.0)));
  return (
    <span className={`dp dp--paperface dp--cardface ${bandClass(item)}${sentence ? ' is-sentence' : ''}`}>
      <span className="dp__kicker">{pill ?? <span className="dp__bandtext">{bandText(item, lang)}</span>}</span>
      <span className="dp__title" style={{ fontSize: `${t.size}em`, WebkitLineClamp: t.lines }}>
        {title}
      </span>
      {cap > 0 && item.lines.length > 0 && (
        <span className="dp__body">
          {item.lines.slice(0, cap).map((line, i) => (
            <span key={i} className="dp__line">
              {p(line)}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

/**
 * An image face (device kinds): lazy, async-decoded, drawn over the text face; hidden until it has loaded and removed
 * when it fails, so a missing capture (offline, not published yet) leaves the drawn device and its title, never a
 * broken image. `alt` is empty on the desk (the object's button carries the name) and set in the drawer.
 */
function FaceImage({ face, lang, alt = false }: { face: NonNullable<DeskItem['face']>; lang: Lang; alt?: boolean }) {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  if (state === 'error') return null;
  return (
    <img
      className={`dp__img dp__img--${face.fit ?? 'cover'} is-${state}`}
      src={face.src}
      alt={alt && face.alt ? pick(face.alt, lang) : ''}
      loading="lazy"
      decoding="async"
      draggable={false}
      onLoad={() => setState('ok')}
      onError={() => setState('error')}
    />
  );
}

/** The drawn device and its screen: bezel (phone, tablet, screen), paper (page, pages), the text face under the image. */
function DeviceFace({ item, lang, shown, pill, moreLabel, labelled }: { item: DeskItem; lang: Lang; shown: Text[]; pill: ReactNode; moreLabel: (n: number) => string; labelled: boolean }) {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  const paper = item.kind === 'page' || item.kind === 'pages';
  const screen = (
    <span className="dp__screen">
      <span className="dp__fallback">
        {item.code && <span className="dp__code">{item.code}</span>}
        <span className="dp__title">{p(item.title)}</span>
        {!item.plain && shown.length > 0 && (
          <span className="dp__rows">
            {shown.map((line, i) => (
              <span key={i} className="dp__row">
                <span className="dp__text">{p(line)}</span>
              </span>
            ))}
          </span>
        )}
      </span>
      {item.face && !item.plain && <FaceImage key={item.face.src} face={item.face} lang={lang} alt={labelled} />}
    </span>
  );
  return (
    <span className={`dp dp--device dp--dev-${item.kind}${paper ? ' dp--paper' : ''}`}>
      {item.kind === 'phone' && <span className="dp__slit" aria-hidden="true" />}
      {screen}
      {item.kind === 'screen' && (
        <span className="dp__chin">
          <DeviceCaption item={item} lang={lang} />
        </span>
      )}
      {pill && <span className="dp__pillwrap">{pill}</span>}
      {item.kind === 'pages' && (item.more ?? 0) > 0 && <span className="dp__badge">{moreLabel(item.more ?? 0)}</span>}
    </span>
  );
}

/** A device's caption: code and title, em-sized (legible when zoomed, like every face). */
function DeviceCaption({ item, lang }: { item: DeskItem; lang: Lang }) {
  return (
    <span className="dp__caption">
      {item.code && <span className="dp__capcode">{item.code}</span>}
      <span className="dp__captext">{pick(item.title, lang)}</span>
    </span>
  );
}

/** The fanned leaves behind a `pages` stack (up to four, offset a few px each). */
function Leaves({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: Math.max(1, Math.min(4, n)) }, (_, i) => (
        <span key={i} className={`desk-leaf desk-leaf--${i + 1}`} aria-hidden="true" />
      ))}
    </>
  );
}

/** True for kinds whose body has thickness (a lifted top and side faces, discs or sheets): they join the 3D context. */
export function isSolid(item: Pick<DeskItem, 'kind' | 'plain'>): boolean {
  return (GEOMETRY[item.kind].t >= 3 && !item.plain) || item.kind === 'stack';
}

/** The body's inline box: the face rectangle, its thickness and font size as custom properties. */
function bodyStyle(item: PlacedItem, at?: { left: number; top: number }): CSSProperties {
  const g = GEOMETRY[item.kind];
  const f = faceBox(item);
  const turn = turnOf(item);
  return {
    ['--t' as string]: `${g.t}px`,
    ...(turn ? { ['--turn' as string]: `${turn}deg` } : {}),
    ...f,
    ...(at ? { left: at.left + f.left, top: at.top + f.top } : {}),
    fontSize: item.font ?? g.font,
  };
}

interface ObjectProps {
  item: PlacedItem;
  /** Position inside its sub-mat (world px). */
  left: number;
  top: number;
  lang: Lang;
  label: string;
  selected: boolean;
  moreLabel: (n: number) => string;
  /** `detail` is the click count (0 = keyboard): the stage opens on one click and zooms on a double click (D-106). */
  onActivate: (id: string, detail: number) => void;
  onFocusItem: (id: string, e: FocusEvent<HTMLButtonElement>) => void;
  /** Hover and focus tooltip (D-106): the element while hovered or focused, null when left or blurred. */
  onHint?: (id: string, el: HTMLElement | null, text?: undefined, source?: 'hover' | 'focus') => void;
  /** Light layer (D-105): `glow` = the followed project's status token, `lit` = the trail's current stop. */
  glow?: boolean;
  lit?: boolean;
}

/**
 * One physical object's hit area and flat part: a <button> the size of its chess squares on the sub-mat's objects
 * plane (one flat compositor layer per sub-mat, D-107), holding the object's one shadow, a device's caption strip
 * and, for thin kinds (sheet, form, checklist, card, light, page, pages, plain tiles), its face. Solid kinds
 * (document, folder, box, token, phone, tablet, screen, the "+N more" pile) draw their body on the sub-mat's bodies
 * layer (`DeskBody`), because in Chrome every element of a 3D context is a layer of its own: keeping the buttons flat
 * took K-04 from ~1 150 layers to ~570 (changelog 0038).
 */
export const DeskObject = memo(function DeskObject({ item, left, top, lang, label, selected, moreLabel, onActivate, onFocusItem, onHint, glow, lit }: ObjectProps) {
  const g = GEOMETRY[item.kind];
  const device = DEVICE_KINDS.has(item.kind);
  const solid = isSolid(item);
  const capH = device && item.kind !== 'screen' ? CAPTION_H : 0;
  const box = faceBox(item);
  return (
    <button
      type="button"
      className={`desk-item desk-item--${item.kind}${device ? ' desk-item--device' : ''} desk-item--g-${item.group}${solid ? ' is-solid' : ''}${item.plain ? ' is-plain' : ''}${selected ? ' is-selected' : ''}${glow ? ' is-glow' : ''}${lit ? ' is-lit' : ''}`}
      style={{ left, top, width: item.cw, height: item.ch }}
      data-desk-item={item.id}
      aria-label={label}
      onClick={(e: MouseEvent<HTMLButtonElement>) => onActivate(item.id, e.detail)}
      onFocus={(e) => {
        // The stage decides whether this focus came from a pointer press (no fly-to, no tooltip) or from the keyboard
        // or a script (fly into view, then show the tooltip).
        onFocusItem(item.id, e);
      }}
      onBlur={() => onHint?.(item.id, null, undefined, 'focus')}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHint?.(item.id, e.currentTarget, undefined, 'hover')}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onHint?.(item.id, null, undefined, 'hover')}
    >
      <span className="desk-item__body" style={bodyStyle(item)} aria-hidden="true">
        <span className="desk-item__shadow" />
        {item.kind === 'pages' && <Leaves n={(item.more ?? 3) - 1} />}
        {!solid && (
          <span className="desk-top">
            <Preview item={item} lang={lang} moreLabel={moreLabel} />
          </span>
        )}
      </span>
      {capH > 0 && (
        <span className="desk-caption" aria-hidden="true" style={{ top: box.top + g.face.h + 3, height: CAPTION_H - 4, fontSize: g.cap ?? 6.4 }}>
          <DeviceCaption item={item} lang={lang} />
        </span>
      )}
    </button>
  );
});

interface BodyProps {
  item: PlacedItem;
  lang: Lang;
  moreLabel: (n: number) => string;
  /** `hover` / `focus` while the object's button is hovered or keyboard-focused (the ring), else null. */
  hot: 'hover' | 'focus' | null;
  selected: boolean;
  glow?: boolean;
}

/**
 * The solid part of an object on its sub-mat's bodies layer (D-107): the lifted top face and the front face
 * (documents, folders, devices; a screen also its stand), plus the left and right faces for boxes (the only kind tall
 * enough for them to show at the 22° tilt); tokens are discs, the "+N more" pile three offset sheets. Pointer-inert
 * and hidden from assistive tech: the button on the objects plane is the object.
 */
export const DeskBody = memo(function DeskBody({ item, lang, moreLabel, hot, selected, glow }: BodyProps) {
  const pile = item.kind === 'stack';
  const device = DEVICE_KINDS.has(item.kind);
  return (
    <span
      className={`desk-body desk-item--${item.kind}${device ? ' desk-item--device' : ''} desk-item--g-${item.group}${hot ? ` is-hot is-${hot}` : ''}${selected ? ' is-selected' : ''}${glow ? ' is-glow' : ''}`}
      style={bodyStyle(item, { left: item.x, top: item.y })}
      data-desk-body={item.id}
      aria-hidden="true"
    >
      {item.kind === 'screen' && <span className="desk-stand" aria-hidden="true" />}
      {item.kind === 'token' ? (
        <>
          <span className={`desk-coin desk-coin--0 dp--tone-${item.tone ?? 'neutral'}`} />
          <span className={`desk-coin desk-coin--1 dp--tone-${item.tone ?? 'neutral'}`} />
        </>
      ) : pile ? (
        <>
          <span className="desk-sheet desk-sheet--0" />
          <span className="desk-sheet desk-sheet--1" />
        </>
      ) : (
        <>
          <span className="desk-side desk-side--front" />
          {item.kind === 'box' && (
            <>
              <span className="desk-side desk-side--left" />
              <span className="desk-side desk-side--right" />
            </>
          )}
        </>
      )}
      <span className="desk-top">
        <Preview item={item} lang={lang} moreLabel={moreLabel} />
      </span>
    </span>
  );
});

/**
 * A face drawn large (drawer) or small (legend): the same markup as the object's top face at a larger base font
 * size (every inner size is em). `box` is the longest side in px.
 */
export function DeskFace({ item, lang, box, moreLabel, rows = Infinity }: { item: DeskItem; lang: Lang; box: number; moreLabel: (n: number) => string; rows?: number }) {
  const g = GEOMETRY[item.kind];
  const k = Math.min(box / g.face.w, box / g.face.h);
  const tab = item.kind === 'folder' ? 7 * k : 0;
  const device = DEVICE_KINDS.has(item.kind);
  const capH = device && item.kind !== 'screen' ? Math.min(CAPTION_H * k, 44) : 0;
  return (
    <div className={`desk-preview${device ? ' desk-preview--device' : ''}`} style={{ width: g.face.w * k, height: g.face.h * k + tab + capH, paddingTop: tab }}>
      <span className={`desk-item--${item.kind}${device ? ' desk-item--device' : ''} desk-preview__face`} style={{ display: 'block', position: 'relative', width: g.face.w * k, height: g.face.h * k, fontSize: (item.font ?? g.font) * k, ['--t' as string]: `${g.t * k}px`, ['--k' as string]: k }}>
        {!device && <span className="desk-item__shadow" aria-hidden="true" />}
        <span className="desk-top">
          <Preview item={item} lang={lang} rows={rows} moreLabel={moreLabel} labelled />
        </span>
      </span>
      {capH > 0 && (
        <span className="desk-caption desk-caption--preview" style={{ minHeight: Math.min(capH - 4 * k, 40), fontSize: Math.min((g.cap ?? 6.4) * k, 15) }}>
          <DeviceCaption item={item} lang={lang} />
        </span>
      )}
    </div>
  );
}
