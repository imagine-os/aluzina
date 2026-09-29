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
  onHint?: (id: string, el: HTMLElement | null) => void;
  /** Light layer (D-105): `glow` = the followed project's status token, `lit` = the trail's current stop. */
  glow?: boolean;
  lit?: boolean;
}

/**
 * One physical object: a <button> the size of its chess squares (the hit area) holding a body with thickness.
 * Thick kinds (document, folder, box) get a lifted top face plus front / left / right side faces; tokens are three
 * stacked discs; thin kinds (sheet, form, checklist, card) lie flat and draw their edge as a 1 px shadow, which keeps
 * the number of 3D layers low (changelog 0033).
 */
export const DeskObject = memo(function DeskObject({ item, left, top, lang, label, selected, moreLabel, onActivate, onFocusItem, onHint, glow, lit }: ObjectProps) {
  const g = GEOMETRY[item.kind];
  const device = DEVICE_KINDS.has(item.kind);
  /** Devices centre the body and its caption strip together (the screen prints its caption on its chin). */
  const capH = device && item.kind !== 'screen' ? CAPTION_H : 0;
  const body: CSSProperties = {
    left: (item.cw - g.face.w) / 2 - (item.kind === 'pages' ? 5 : 0),
    top: (item.ch - g.face.h - capH) / 2 + (item.kind === 'folder' ? 3 : 0) + (item.kind === 'screen' ? -4 : 0),
    width: g.face.w,
    height: g.face.h,
    fontSize: item.font ?? g.font,
    ['--t' as string]: `${g.t}px`,
  };
  const lifted = g.t >= 3 && !item.plain;
  return (
    <button
      type="button"
      className={`desk-item desk-item--${item.kind}${device ? ' desk-item--device' : ''} desk-item--g-${item.group}${item.plain ? ' is-plain' : ''}${selected ? ' is-selected' : ''}${glow ? ' is-glow' : ''}${lit ? ' is-lit' : ''}`}
      style={{ left, top, width: item.cw, height: item.ch }}
      data-desk-item={item.id}
      aria-label={label}
      onClick={(e: MouseEvent<HTMLButtonElement>) => onActivate(item.id, e.detail)}
      onFocus={(e) => {
        onFocusItem(item.id, e);
        if (e.currentTarget.matches(':focus-visible')) onHint?.(item.id, e.currentTarget);
      }}
      onBlur={() => onHint?.(item.id, null)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHint?.(item.id, e.currentTarget)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onHint?.(item.id, null)}
    >
      <span className={`desk-item__body${lifted ? ' is-lifted' : ''}`} style={body} aria-hidden="true">
        <span className="desk-item__shadow" />
        {item.kind === 'pages' && <Leaves n={(item.more ?? 3) - 1} />}
        {item.kind === 'screen' && <span className="desk-stand" aria-hidden="true" />}
        {item.kind === 'token' ? (
          <>
            <span className={`desk-coin desk-coin--0 dp--tone-${item.tone ?? 'neutral'}`} />
            <span className={`desk-coin desk-coin--1 dp--tone-${item.tone ?? 'neutral'}`} />
          </>
        ) : (
          lifted && (
            <>
              <span className="desk-side desk-side--front" />
              <span className="desk-side desk-side--left" />
              <span className="desk-side desk-side--right" />
            </>
          )
        )}
        <span className="desk-top">
          <Preview item={item} lang={lang} moreLabel={moreLabel} />
        </span>
      </span>
      {capH > 0 && (
        <span className="desk-caption" aria-hidden="true" style={{ top: body.top as number + g.face.h + 3, height: CAPTION_H - 4, fontSize: g.cap ?? 6.4 }}>
          <DeviceCaption item={item} lang={lang} />
        </span>
      )}
    </button>
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
