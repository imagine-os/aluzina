import { memo, type CSSProperties, type FocusEvent } from 'react';
import { pick, type Text } from '../../tenant/domain';
import { GEOMETRY, type DeskItem, type PlacedItem } from './model';

type Lang = 'en' | 'es';

/** Rows the top face of a page shows before "+N" (the drawer lists them all). */
const FACE_ROWS: Record<string, number> = { sheet: 12, form: 10, checklist: 12, document: 11, folder: 4, box: 0, token: 0, card: 0 };

interface PreviewProps {
  item: DeskItem;
  lang: Lang;
  /** Row cap; `Infinity` in the drawer. */
  rows?: number;
  moreLabel: (n: number) => string;
}

/**
 * The top face of an object: a miniature of the thing itself drawn from its data (field labels, checklist items,
 * status name, rule text), never an icon. All sizes are em, so the same markup is the face on the desk and the
 * large preview in the drawer. Spans only: it renders inside a <button>.
 */
export function Preview({ item, lang, rows, moreLabel }: PreviewProps) {
  const p = (x: Text | undefined) => (x ? pick(x, lang) : '');
  const cap = rows ?? FACE_ROWS[item.kind] ?? 8;
  const shown = item.lines.slice(0, cap);
  const more = item.lines.length - shown.length;
  const heading = (i: number) => item.sections?.find((s) => s.at === i && item.kind !== 'folder');

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
          <span className="dp__code">{item.code}</span>
          <span className="dp__sub">{p(item.subtitle)}</span>
        </span>
        <span className="dp__title">{p(item.title)}</span>
      </span>
    );
  }
  if (item.kind === 'box') {
    return (
      <span className="dp dp--box">
        <span className="dp__tape" aria-hidden="true" />
        <span className="dp__big">{item.code}</span>
        <span className="dp__title">{p(item.title)}</span>
        <span className="dp__sub">{p(item.subtitle)}</span>
        <span className="dp__count">{item.lines.length}</span>
      </span>
    );
  }
  if (item.kind === 'folder') {
    return (
      <span className="dp dp--folder">
        <span className="dp__tab">{item.code}</span>
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

interface ObjectProps {
  item: PlacedItem;
  /** Position inside its sub-mat (world px). */
  left: number;
  top: number;
  lang: Lang;
  label: string;
  selected: boolean;
  moreLabel: (n: number) => string;
  onActivate: (id: string) => void;
  onFocusItem: (id: string, e: FocusEvent<HTMLButtonElement>) => void;
}

/**
 * One physical object: a <button> the size of its chess squares (the hit area) holding a body with thickness.
 * Thick kinds (document, folder, box) get a lifted top face plus front / left / right side faces; tokens are three
 * stacked discs; thin kinds (sheet, form, checklist, card) lie flat and draw their edge as a 1 px shadow, which keeps
 * the number of 3D layers low (changelog 0033).
 */
export const DeskObject = memo(function DeskObject({ item, left, top, lang, label, selected, moreLabel, onActivate, onFocusItem }: ObjectProps) {
  const g = GEOMETRY[item.kind];
  const body: CSSProperties = {
    left: (item.cw - g.face.w) / 2,
    top: (item.ch - g.face.h) / 2 + (item.kind === 'folder' ? 3 : 0),
    width: g.face.w,
    height: g.face.h,
    fontSize: g.font,
    ['--t' as string]: `${g.t}px`,
  };
  const lifted = g.t >= 3;
  return (
    <button
      type="button"
      className={`desk-item desk-item--${item.kind} desk-item--g-${item.group}${selected ? ' is-selected' : ''}`}
      style={{ left, top, width: item.cw, height: item.ch }}
      data-desk-item={item.id}
      aria-label={label}
      onClick={() => onActivate(item.id)}
      onFocus={(e) => onFocusItem(item.id, e)}
    >
      <span className={`desk-item__body${lifted ? ' is-lifted' : ''}`} style={body} aria-hidden="true">
        <span className="desk-item__shadow" />
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
    </button>
  );
});
