import { memo, type FocusEvent, type ReactNode } from 'react';
import { pick } from '../tenant/domain';
import { POP_PROPS, type DeskPerson, type PropId } from './people';

type Lang = 'en' | 'es';

/**
 * W-04 people (prompt 0027, D-104): a seated professional at a small desk on the near edge of a mat. Stylised
 * layered vector figures, never a likeness: a head shape with no features, hair, an outfit per role (the same role
 * looks the same on every mat). Construction, in the desk's own CSS 3D (changelog 0034):
 * - a rug (flat) and the desk: a lifted top face plus front / left / right faces, like the thick objects;
 * - the chair back and the person are two parallel pop-up planes standing on the desk's back edge, leaning back
 *   26° so they face the tilted camera and still read in the flat view;
 * - a standing prop (laptop lid, hard hat...) and the tent nameplate are pop-up planes on the desk top, the flat
 *   props are drawn on the desk top face. 9 or 10 3D layers per station.
 */

/** Hair shapes and neckline per look (portal role). Unknown looks fall back to the neutral figure. */
const LOOKS: Record<string, { hair: 'long' | 'bun' | 'short' | 'curly'; neck: 'blazer' | 'cardigan' | 'turtle' | 'shirt'; accent?: 'necklace' | 'tie' }> = {
  founder: { hair: 'long', neck: 'blazer', accent: 'necklace' },
  studio: { hair: 'bun', neck: 'cardigan' },
  ops: { hair: 'short', neck: 'shirt', accent: 'tie' },
  brand: { hair: 'curly', neck: 'turtle' },
};
const lookOf = (look: string) => LOOKS[look] ?? { hair: 'short' as const, neck: 'shirt' as const };

/** The chair back behind the person (the person's 120 x 100 box cropped to its lower 72, where the chair is drawn). */
export const CHAIR_CROP = 0.72;
export function ChairSvg() {
  return (
    <svg className="pp" viewBox="0 28 120 72" width="100%" height="100%" aria-hidden="true" focusable="false">
      <rect className="pp-chair pp-line" x="21" y="30" width="78" height="80" rx="16" />
      <rect className="pp-chair-hi" x="27" y="35" width="66" height="5" rx="2.5" />
    </svg>
  );
}

/** The person from the desk up (viewBox 120 x 100): arms reach down to the desk, hands rest on its back edge. */
export function PersonSvg({ look }: { look: string }) {
  const l = lookOf(look);
  const back: ReactNode =
    l.hair === 'long' ? (
      <path className="pp-hair pp-line" d="M44 26 C44 10 76 10 76 26 L80 64 C73 69 47 69 40 64 Z" />
    ) : l.hair === 'curly' ? (
      <g className="pp-hair pp-line">
        <circle cx="49" cy="23" r="8" />
        <circle cx="60" cy="18" r="9" />
        <circle cx="71" cy="23" r="8" />
        <circle cx="46.5" cy="33" r="7" />
        <circle cx="73.5" cy="33" r="7" />
        <circle cx="48" cy="42" r="5.5" />
        <circle cx="72" cy="42" r="5.5" />
      </g>
    ) : l.hair === 'bun' ? (
      <circle className="pp-hair pp-line" cx="60" cy="14" r="7" />
    ) : null;
  const front: ReactNode =
    l.hair === 'long' ? (
      <path className="pp-hair" d="M48 32 C47 17 73 17 72.5 32 C70 25 63 22 58 23 C55 26 51 29 48 32 Z" />
    ) : l.hair === 'curly' ? (
      <g className="pp-hair">
        <circle cx="54" cy="21" r="5.5" />
        <circle cx="62" cy="20" r="5.5" />
        <circle cx="68" cy="23" r="4.5" />
      </g>
    ) : l.hair === 'bun' ? (
      <path className="pp-hair" d="M48.5 31 C47 17 73 17 71.5 31 C69 24 64 22.5 60 22.5 C56 22.5 51 24 48.5 31 Z" />
    ) : (
      <path className="pp-hair" d="M48.5 30 C47.5 16 72.5 16 71.5 30 L70 26 C66 22 54 22 50 26 Z" />
    );
  return (
    <svg className="pp" viewBox="0 0 120 100" width="100%" height="100%" aria-hidden="true" focusable="false">
      {back}
      <rect className="pp-skin pp-line" x="55" y="40" width="10" height="16" rx="3" />
      {/* Torso and shoulders. */}
      <path className="pp-jacket pp-line" d="M22 104 L25 68 C26 59 35 55 45 53 L75 53 C85 55 94 59 95 68 L98 104 Z" />
      {l.neck === 'blazer' && (
        <>
          <path className="pp-shirt" d="M50 53.5 L70 53.5 L60 76 Z" />
          <path className="pp-jacket-2" d="M47 54 L55 54 L60 76 L53 64 Z M73 54 L65 54 L60 76 L67 64 Z" />
        </>
      )}
      {l.neck === 'cardigan' && (
        <>
          <path className="pp-shirt" d="M49 53.5 C53 58 67 58 71 53.5 L68 104 L52 104 Z" />
          <path className="pp-jacket-2" d="M52 104 L50 60 L54 62 L55 104 Z M68 104 L70 60 L66 62 L65 104 Z" />
        </>
      )}
      {l.neck === 'turtle' && <rect className="pp-shirt pp-line" x="52" y="47" width="16" height="10" rx="4" />}
      {l.neck === 'shirt' && (
        <>
          <path className="pp-shirt" d="M52 53.5 L68 53.5 L60 66 Z" />
          <path className="pp-shirt-2" d="M51 53 L59 60 L55 64 Z M69 53 L61 60 L65 64 Z" />
        </>
      )}
      {l.accent === 'necklace' && <path className="pp-accent-line" d="M53 57 Q60 67 67 57" />}
      {l.accent === 'tie' && <path className="pp-accent" d="M58.5 60 L61.5 60 L63 78 L60 82 L57 78 Z" />}
      {/* Arms reaching to the desk, hands on its edge. */}
      <path className="pp-jacket-2 pp-line" d="M25.5 66 C21 76 21 90 29 100 L42 100 C38 90 35 80 37 71 Z" />
      <path className="pp-jacket-2 pp-line" d="M94.5 66 C99 76 99 90 91 100 L78 100 C82 90 85 80 83 71 Z" />
      <ellipse className="pp-skin pp-line" cx="40" cy="99" rx="6.5" ry="4" />
      <ellipse className="pp-skin pp-line" cx="80" cy="99" rx="6.5" ry="4" />
      {/* Head: a plain shape, no features (D-104). */}
      <ellipse className="pp-skin pp-line" cx="60" cy="31" rx="11.5" ry="13.5" />
      {front}
    </svg>
  );
}

/** Standing props (pop-up planes). Each has its own viewBox; `w` / `h` are its size on the desk in world px. */
const POP: Partial<Record<PropId, { w: number; h: number; svg: ReactNode }>> = {
  laptop: {
    w: 60,
    h: 40,
    svg: (
      <svg className="pp" viewBox="0 0 60 40" width="100%" height="100%" aria-hidden="true" focusable="false">
        <rect className="pp-metal pp-line" x="1" y="1" width="58" height="38" rx="3" />
        <circle className="pp-logo" cx="30" cy="19" r="4.5" />
      </svg>
    ),
  },
  pencils: {
    w: 26,
    h: 42,
    svg: (
      <svg className="pp" viewBox="0 0 26 42" width="100%" height="100%" aria-hidden="true" focusable="false">
        <path className="pp-p1 pp-line" d="M7 22 L7 5 L9 1 L11 5 L11 22 Z" />
        <path className="pp-p2 pp-line" d="M12 22 L13 3 L15 0 L17 3 L16 22 Z" />
        <path className="pp-p3 pp-line" d="M17 22 L18 8 L20 4 L22 8 L21 22 Z" />
        <rect className="pp-cup pp-line" x="3" y="18" width="20" height="24" rx="3" />
        <rect className="pp-band" x="3" y="26" width="20" height="3" />
      </svg>
    ),
  },
  samples: {
    w: 58,
    h: 38,
    svg: (
      <svg className="pp" viewBox="0 0 58 38" width="100%" height="100%" aria-hidden="true" focusable="false">
        <rect className="pp-s1 pp-line" x="6" y="2" width="10" height="16" rx="1.5" />
        <rect className="pp-s2 pp-line" x="17" y="5" width="10" height="13" rx="1.5" />
        <rect className="pp-s3 pp-line" x="28" y="1" width="10" height="17" rx="1.5" />
        <rect className="pp-s4 pp-line" x="39" y="4" width="10" height="14" rx="1.5" />
        <rect className="pp-kraft pp-line" x="1" y="14" width="56" height="24" rx="2" />
        <rect className="pp-label" x="18" y="21" width="22" height="9" rx="1" />
      </svg>
    ),
  },
  board: {
    w: 62,
    h: 50,
    svg: (
      <svg className="pp" viewBox="0 0 62 50" width="100%" height="100%" aria-hidden="true" focusable="false">
        <path className="pp-easel" d="M14 36 L8 50 M48 36 L54 50 M31 36 L31 50" />
        <rect className="pp-paper pp-line" x="1" y="1" width="60" height="38" rx="1.5" />
        <rect className="pp-render" x="5" y="5" width="30" height="22" rx="1" />
        <rect className="pp-rule" x="39" y="7" width="18" height="2" />
        <rect className="pp-rule" x="39" y="12" width="14" height="2" />
        <rect className="pp-rule" x="39" y="17" width="16" height="2" />
        <rect className="pp-accent" x="5" y="31" width="52" height="3" rx="1" />
      </svg>
    ),
  },
  hardhat: {
    w: 50,
    h: 28,
    svg: (
      <svg className="pp" viewBox="0 0 50 28" width="100%" height="100%" aria-hidden="true" focusable="false">
        <path className="pp-hat pp-line" d="M6 23 C6 3 44 3 44 23 Z" />
        <path className="pp-hat-2" d="M22 5 C22 10 22 17 22 23 L28 23 C28 17 28 10 28 5 Z" />
        <rect className="pp-hat-2 pp-line" x="1" y="21" width="48" height="6" rx="3" />
      </svg>
    ),
  },
  mug: {
    w: 30,
    h: 30,
    svg: (
      <svg className="pp" viewBox="0 0 30 30" width="100%" height="100%" aria-hidden="true" focusable="false">
        <path className="pp-handle" d="M21 10 C28 10 28 21 21 21" />
        <rect className="pp-cup-w pp-line" x="2" y="4" width="20" height="25" rx="3.5" />
        <rect className="pp-accent" x="2" y="12" width="20" height="3.5" />
      </svg>
    ),
  },
};

/** Flat props on the desk top, drawn in a 64 x 68 box whose origin is the prop's zone. */
function FlatProp({ id }: { id: PropId }): ReactNode {
  switch (id) {
    case 'phone':
      return (
        <g transform="translate(26 18) rotate(-14 10 18)">
          <rect className="pp-ink pp-line" width="20" height="36" rx="4" />
          <rect className="pp-screen" x="2.5" y="4" width="15" height="27" rx="1.5" />
        </g>
      );
    case 'clipboard':
      return (
        <g transform="translate(10 6) rotate(-6 22 28)">
          <rect className="pp-kraft pp-line" width="44" height="56" rx="3" />
          <rect className="pp-paper" x="4" y="7" width="36" height="46" rx="1" />
          {[16, 23, 30, 37, 44].map((y) => (
            <g key={y}>
              <rect className="pp-tick" x="8" y={y - 2.5} width="4" height="4" rx="0.8" />
              <rect className="pp-rule" x="15" y={y - 1} width="21" height="1.6" />
            </g>
          ))}
          <rect className="pp-metal pp-line" x="14" y="-2" width="16" height="7" rx="2" />
        </g>
      );
    case 'tape':
      return (
        <g transform="translate(4 20)">
          <rect className="pp-tape" x="26" y="11" width="36" height="6" />
          {[30, 36, 42, 48, 54, 60].map((x) => (
            <rect key={x} className="pp-ink" x={x} y="11" width="0.8" height="3" />
          ))}
          <rect className="pp-hat pp-line" x="2" y="2" width="26" height="26" rx="6" />
          <circle className="pp-hat-2" cx="15" cy="15" r="6" />
        </g>
      );
    case 'contract':
      return (
        <g transform="translate(8 6) rotate(4 22 28)">
          <rect className="pp-paper pp-line" width="42" height="56" rx="1" />
          {[9, 14, 19, 24, 29].map((y) => (
            <rect key={y} className="pp-rule" x="6" y={y} width={y === 29 ? 18 : 30} height="1.6" />
          ))}
          <path className="pp-sign" d="M7 46 C11 40 13 50 17 44 C20 40 22 48 27 44" />
          <rect className="pp-rule" x="6" y="49" width="26" height="1" />
          <g transform="rotate(-32 40 44)">
            <rect className="pp-ink pp-line" x="26" y="42" width="30" height="4" rx="2" />
            <rect className="pp-metal" x="50" y="42" width="6" height="4" rx="1.5" />
          </g>
        </g>
      );
    case 'calculator':
      return (
        <g transform="translate(20 12)">
          <rect className="pp-ink pp-line" width="28" height="40" rx="3.5" />
          <rect className="pp-screen" x="3.5" y="3.5" width="21" height="8" rx="1" />
          {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} className="pp-key" x={4 + c * 7.2} y={15 + r * 6} width="5.4" height="4.4" rx="1" />))}
        </g>
      );
    case 'plans':
      return (
        <g transform="translate(2 8)">
          <rect className="pp-blue pp-line" x="4" y="14" width="52" height="38" rx="1" />
          {[22, 30, 38].map((y) => (
            <rect key={y} className="pp-blue-line" x="8" y={y} width="44" height="0.8" />
          ))}
          <path className="pp-blue-ink" d="M10 20 L30 20 L30 34 L46 34 L46 48 L10 48 Z" />
          <rect className="pp-blue-roll pp-line" x="0" y="4" width="62" height="11" rx="5.5" />
        </g>
      );
    case 'sketchbook':
      return (
        <g transform="translate(0 10)">
          <rect className="pp-ink pp-line" x="0" y="0" width="64" height="44" rx="2" />
          <rect className="pp-paper" x="2" y="2" width="29.5" height="40" rx="1" />
          <rect className="pp-paper" x="32.5" y="2" width="29.5" height="40" rx="1" />
          <path className="pp-sketch" d="M6 34 L16 26 L27 34 M9 33 L9 20 L22 20 L22 33 M36 12 C42 6 52 6 58 12 M38 20 L57 20 M38 26 L52 26 M38 32 L55 32" />
        </g>
      );
    case 'swatches':
      return (
        <g transform="translate(10 8)">
          {['pp-s1', 'pp-s2', 'pp-s3', 'pp-s4'].map((c, i) => (
            <rect key={c} className={`${c} pp-line`} x="18" y="0" width="12" height="44" rx="3" transform={`rotate(${-36 + i * 22} 24 42)`} />
          ))}
          <circle className="pp-metal pp-line" cx="24" cy="42" r="2.4" />
        </g>
      );
    case 'stamp':
      return (
        <g transform="translate(6 10)">
          <rect className="pp-paper pp-line" x="0" y="8" width="38" height="46" rx="1" transform="rotate(-8 19 31)" />
          <circle className="pp-ok" cx="19" cy="36" r="8" />
          <path className="pp-ok-mark" d="M15 36 L18 39 L24 32" />
          <circle className="pp-ink pp-line" cx="48" cy="18" r="9" />
          <circle className="pp-metal" cx="48" cy="18" r="4" />
        </g>
      );
    case 'tablet':
      return (
        <g transform="translate(6 12) rotate(8 26 20)">
          <rect className="pp-ink pp-line" width="52" height="38" rx="4" />
          <rect className="pp-screen" x="3" y="3" width="46" height="32" rx="1.5" />
          <path className="pp-site" d="M3 26 L14 18 L24 24 L34 14 L49 22 L49 35 L3 35 Z" />
        </g>
      );
    case 'book':
      return (
        <g transform="translate(10 6) rotate(-4 22 28)">
          <rect className="pp-ink pp-line" width="42" height="54" rx="2" />
          <rect className="pp-metal" x="8" y="14" width="26" height="4" rx="1" />
          <rect className="pp-metal" x="12" y="22" width="18" height="2" rx="1" />
          <rect className="pp-accent" x="30" y="0" width="4" height="62" />
        </g>
      );
    case 'keys':
      return (
        <g transform="translate(14 18)">
          <circle className="pp-ring" cx="14" cy="14" r="9" />
          <g className="pp-metal pp-line">
            <circle cx="24" cy="24" r="6" />
            <rect x="27" y="22.5" width="18" height="3.5" rx="1" />
            <circle cx="10" cy="28" r="5" />
            <rect x="8" y="31" width="3.5" height="16" rx="1" />
          </g>
        </g>
      );
    case 'rating':
      return (
        <g transform="translate(4 16)">
          <rect className="pp-paper pp-line" width="56" height="30" rx="3" />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} className="pp-star" transform={`translate(${5 + i * 10} 9)`} d="M4.5 0 L5.8 3 L9 3.3 L6.6 5.4 L7.3 8.6 L4.5 7 L1.7 8.6 L2.4 5.4 L0 3.3 L3.2 3 Z" />
          ))}
          <rect className="pp-rule" x="6" y="22" width="36" height="1.6" />
        </g>
      );
    default:
      return null;
  }
}

/** Station geometry (world px, relative to the station): desk top, thickness, lean of the pop-up planes. */
export const STATION = { w: 320, h: 192, desk: { x: 16, y: 112, w: 288, d: 72, t: 22 }, figure: { w: 132, h: 110 }, plate: { w: 156, h: 52 }, zones: [4, 220] } as const;

interface PersonProps {
  person: DeskPerson;
  left: number;
  top: number;
  lang: Lang;
  label: string;
  selected: boolean;
  onActivate: (phase: string) => void;
  onFocusPerson: (phase: string, e: FocusEvent<HTMLButtonElement>) => void;
}

/** Nameplate text: the role (bilingual) and the demo user's first name when a portal role holds it. */
export function Nameplate({ person, lang }: { person: DeskPerson; lang: Lang }) {
  return (
    <span className="desk-plate__text">
      <span className="desk-plate__name">{person.firstName ?? pick(person.role.playbookRole, lang)}</span>
      {person.firstName && <span className="desk-plate__role">{pick(person.role.playbookRole, lang)}</span>}
    </span>
  );
}

export const DeskPersonStation = memo(function DeskPersonStation({ person, left, top, lang, label, selected, onActivate, onFocusPerson }: PersonProps) {
  const { desk, figure, plate, zones } = STATION;
  const fx = (STATION.w - figure.w) / 2;
  return (
    <button
      type="button"
      className={`desk-person desk-person--${person.look}${selected ? ' is-selected' : ''}`}
      style={{ left, top, width: STATION.w, height: STATION.h }}
      data-desk-person={person.phase}
      aria-label={label}
      onClick={() => onActivate(person.phase)}
      onFocus={(e) => onFocusPerson(person.phase, e)}
    >
      <span className="desk-person__rug" aria-hidden="true" />
      <span className="desk-person__stand desk-person__stand--chair" aria-hidden="true" style={{ left: fx, top: desk.y - 8 - figure.h * CHAIR_CROP, width: figure.w, height: figure.h * CHAIR_CROP }}>
        <ChairSvg />
      </span>
      <span className="desk-person__stand desk-person__stand--figure" aria-hidden="true" style={{ left: fx, top: desk.y + 1 - figure.h, width: figure.w, height: figure.h }}>
        <PersonSvg look={person.look} />
      </span>
      <span className="desk-person__desk" aria-hidden="true" style={{ left: desk.x, top: desk.y, width: desk.w, height: desk.d, ['--t' as string]: `${desk.t}px` }}>
        <span className="desk-person__shadow" />
        <span className="desk-side desk-side--front" />
        <span className="desk-side desk-side--left" />
        <span className="desk-side desk-side--right" />
        <span className="desk-person__top">
          <svg className="pp" viewBox={`0 0 ${desk.w} ${desk.d}`} width="100%" height="100%" aria-hidden="true" focusable="false">
            {person.props.map((id, i) =>
              POP_PROPS.has(id) ? (
                <ellipse key={id} className="pp-contact" cx={zones[i] + 32} cy="58" rx={(POP[id]?.w ?? 40) / 2} ry="4" />
              ) : (
                <g key={id} transform={`translate(${zones[i]} 4)`}>
                  <FlatProp id={id} />
                </g>
              ),
            )}
          </svg>
        </span>
        {person.props.map((id, i) => {
          const pop = POP_PROPS.has(id) ? POP[id] : undefined;
          return pop ? (
            <span key={id} className="desk-person__stand desk-person__stand--prop" style={{ left: zones[i] + 32 - pop.w / 2, top: 60 - pop.h, width: pop.w, height: pop.h }}>
              {pop.svg}
            </span>
          ) : null;
        })}
        <span className="desk-person__stand desk-person__stand--plate desk-plate" style={{ left: (desk.w - plate.w) / 2, top: desk.d - plate.h, width: plate.w, height: plate.h }}>
          <Nameplate person={person} lang={lang} />
        </span>
      </span>
    </button>
  );
});

/** The drawer's portrait: the same figure, chair and nameplate, flat and large. */
export function PersonPortrait({ person, lang }: { person: DeskPerson; lang: Lang }) {
  const pops = person.props.filter((id) => POP_PROPS.has(id));
  return (
    <div className={`desk-portrait desk-person--${person.look}`}>
      <span className="desk-portrait__chair">
        <ChairSvg />
      </span>
      <span className="desk-portrait__figure">
        <PersonSvg look={person.look} />
      </span>
      {pops.map((id) => {
        const pop = POP[id];
        return pop ? (
          <span key={id} className="desk-portrait__prop" style={{ width: pop.w * 1.6, height: pop.h * 1.6 }}>
            {pop.svg}
          </span>
        ) : null;
      })}
      <span className="desk-portrait__desk">
        <span className="desk-plate desk-portrait__plate">
          <Nameplate person={person} lang={lang} />
        </span>
      </span>
    </div>
  );
}
