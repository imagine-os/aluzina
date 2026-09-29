import { memo, useState, type CSSProperties, type FocusEvent, type MouseEvent, type ReactNode } from 'react';
import { pick, type Text } from '../tenant/domain';
import { CAPTION_H, DEVICE_KINDS, GEOMETRY, type DeskItem, type PlacedItem } from './types';

type Lang = 'en' | 'es';

/** Rows the top face of a page shows before "+N" (the drawer lists them all). */
const FACE_ROWS: Record<string, number> = { sheet: 12, form: 10, checklist: 12, document: 11, folder: 4, box: 0, token: 0, card: 0, light: 3, stack: 0, phone: 5, tablet: 7, screen: 5, page: 12, pages: 10 };

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
  const heading = (i: number) => item.sections?.find((s) => s.at === i && item.kind !== 'folder');
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
      <span className={`dp dp--light dp--tone-${item.tone ?? 'info'}`}>
        <span className="dp__kicker">
          <span className="dp__code">{p(item.subtitle)}</span>
        </span>
        <span className="dp__title">{p(item.title)}</span>
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
  if (item.kind === 'card') {
    return (
      <span className="dp dp--card">
        <span className="dp__kicker">
          {pill ?? <span className="dp__code">{item.code}</span>}
          <span className="dp__sub">{p(item.subtitle)}</span>
        </span>
        <span className="dp__title">{p(item.title)}</span>
        {item.pill && item.lines.length > 0 && (
          <span className="dp__rows">
            {item.lines.slice(0, 2).map((line, i) => (
              <span key={i} className="dp__row">
                {p(line)}
              </span>
            ))}
          </span>
        )}
      </span>
    );
  }
  if (item.kind === 'box') {
    return (
      <span className="dp dp--box">
        <span className="dp__tape" aria-hidden="true" />
        {pill}
        <span className="dp__big">{item.code}</span>
        <span className="dp__title">{p(item.title)}</span>
        <span className="dp__sub">{p(item.subtitle)}</span>
        {item.lines.length > 0 && <span className="dp__count">{item.lines.length}</span>}
      </span>
    );
  }
  if (item.kind === 'folder') {
    return (
      <span className="dp dp--folder">
        <span className="dp__tab">{item.code}</span>
        {pill}
        <span className="dp__title">{p(item.title)}</span>
        <span className="dp__sub">{p(item.subtitle)}</span>
        <span className="dp__rows">
          {item.sections?.[0] && <span className="dp__section">{p(item.sections[0].label)}</span>}
          {shown.map((line, i) => (
            <span key={i} className="dp__row">
              {p(line)}
            </span>
          ))}
          {more > 0 && <span className="dp__more">{moreLabel(more)}</span>}
        </span>
      </span>
    );
  }
  // Pages: sheet, form, checklist, document.
  return (
    <span className={`dp dp--page dp--${item.kind}`}>
      {item.code && <span className="dp__code">{item.code}</span>}
      {pill}
      <span className="dp__title">{p(item.title)}</span>
      {item.subtitle && <span className="dp__sub">{p(item.subtitle)}</span>}
      <span className="dp__rows">
        {shown.map((line, i) => {
          const h = heading(i);
          return (
            <span key={i} className="dp__rowwrap">
              {h && <span className="dp__section">{p(h.label)}</span>}
              <span className="dp__row">
                {item.kind === 'checklist' && <span className="dp__box" aria-hidden="true" />}
                {item.kind === 'document' && <span className="dp__num">{String(i + 1).padStart(2, '0')}</span>}
                <span className="dp__text">{p(line)}</span>
                {item.kind === 'form' && <span className="dp__field" aria-hidden="true" />}
              </span>
            </span>
          );
        })}
        {item.kind === 'form' && item.lines.length <= 1 && [0, 1, 2, 3].map((k) => <span key={`blank-${k}`} className="dp__row dp__row--blank"><span className="dp__field" aria-hidden="true" /></span>)}
        {more > 0 && <span className="dp__more">{moreLabel(more)}</span>}
      </span>
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

/** The top face's rectangle inside the object's cell (world px): the body the object draws, centred on its squares
 *  (a device together with its caption strip; a fanned `pages` stack leaves room for its leaves). */
export function faceBox(item: Pick<PlacedItem, 'kind' | 'cw' | 'ch'>): { left: number; top: number; width: number; height: number } {
  const g = GEOMETRY[item.kind];
  const capH = DEVICE_KINDS.has(item.kind) && item.kind !== 'screen' ? CAPTION_H : 0;
  return {
    left: (item.cw - g.face.w) / 2 - (item.kind === 'pages' ? 5 : 0),
    top: (item.ch - g.face.h - capH) / 2 + (item.kind === 'folder' ? 3 : 0) + (item.kind === 'screen' ? -4 : 0),
    width: g.face.w,
    height: g.face.h,
  };
}

/** True for kinds whose body has thickness (a lifted top and side faces, discs or sheets): they join the 3D context. */
export function isSolid(item: Pick<DeskItem, 'kind' | 'plain'>): boolean {
  return (GEOMETRY[item.kind].t >= 3 && !item.plain) || item.kind === 'stack';
}

/** The body's inline box: the face rectangle, its thickness and font size as custom properties. */
function bodyStyle(item: PlacedItem, at?: { left: number; top: number }): CSSProperties {
  const g = GEOMETRY[item.kind];
  const f = faceBox(item);
  return {
    ['--t' as string]: `${g.t}px`,
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
  const capH = device && item.kind !== 'screen' ? CAPTION_H * k : 0;
  return (
    <div className={`desk-preview${device ? ' desk-preview--device' : ''}`} style={{ width: g.face.w * k, height: g.face.h * k + tab + capH, paddingTop: tab }}>
      <span className={`desk-item--${item.kind}${device ? ' desk-item--device' : ''} desk-preview__face`} style={{ display: 'block', position: 'relative', width: g.face.w * k, height: g.face.h * k, fontSize: (item.font ?? g.font) * k }}>
        <span className="desk-top">
          <Preview item={item} lang={lang} rows={rows} moreLabel={moreLabel} labelled />
        </span>
      </span>
      {capH > 0 && (
        <span className="desk-caption desk-caption--preview" style={{ height: capH - 4 * k, fontSize: (g.cap ?? 6.4) * k }}>
          <DeviceCaption item={item} lang={lang} />
        </span>
      )}
    </div>
  );
}
