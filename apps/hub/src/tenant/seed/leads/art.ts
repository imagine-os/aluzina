import { tokenValues } from '../../brand/tokens.values';

/**
 * Generated placeholder art for mock leads (D-114): a portrait and, for companies, a monogram logo, as SVG data URIs
 * derived deterministically from the lead id. Nothing is fetched and nothing is a likeness: the portrait is the
 * desk's role-figure style (a head shape with no features, hair, an outfit) with skin, hair and clothing picked by a
 * hash of the id; the logo is the company's initials on a geometric mark in the brand palette. Real leads will carry
 * uploaded photos and logos (`portraitUrl` / `logoUrl` hold any image URL); this style is only the placeholder.
 */

const B = tokenValues.brand;
/** Warm neutral skin tones mixed from the brand's gold and ink (the same family as the desk's figures). */
const SKIN = ['#6E5A44', '#8A7255', '#A98E6C', '#C8AE8A', '#E1CBA8'];
const HAIR = [B.ink, '#3B3230', '#5A4636', '#7A6450', '#9A8A7A', '#2F2A2A'];
const OUTFIT = [B.silver, B.periwinkle, '#8FA9A3', B.gold, '#5E6B7A', '#B8B2A7'];
const ACCENT = [B.aqua, B.lime, B.periwinkle, B.goldHighlight];
const BACKDROP = ['#ECEDEF', '#E7ECF7', '#EEF4EC', '#F3EEE6'];

/** FNV-1a over the id: the same lead always gets the same picture. */
function hash(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
const pickOf = <T,>(xs: readonly T[], h: number, shift: number): T => xs[(h >>> shift) % xs.length];
const uri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** A bust on a round backdrop (viewBox 96 x 96): hair behind, neck, shoulders with a neckline, featureless head, hair in front. */
export function portraitSvg(id: string): string {
  const h = hash(id);
  const skin = pickOf(SKIN, h, 0);
  const hair = pickOf(HAIR, h, 3);
  const cloth = pickOf(OUTFIT, h, 6);
  const accent = pickOf(ACCENT, h, 9);
  const bg = pickOf(BACKDROP, h, 12);
  const style = (h >>> 15) % 5; // 0 long, 1 bun, 2 short, 3 curly, 4 cropped
  const neck = (h >>> 18) % 3; // 0 v-neck, 1 crew, 2 collar
  const line = 'stroke="#231F20" stroke-opacity="0.55" stroke-width="1.1" stroke-linejoin="round"';
  const back =
    style === 0
      ? `<path d="M30 40 C30 16 66 16 66 40 L70 70 C60 76 36 76 26 70 Z" fill="${hair}" ${line}/>`
      : style === 1
        ? `<circle cx="48" cy="17" r="8" fill="${hair}" ${line}/>`
        : style === 3
          ? `<g fill="${hair}" ${line}><circle cx="36" cy="30" r="9"/><circle cx="48" cy="23" r="10"/><circle cx="60" cy="30" r="9"/><circle cx="33" cy="42" r="7"/><circle cx="63" cy="42" r="7"/></g>`
          : '';
  const front =
    style === 0
      ? `<path d="M35 40 C34 22 62 22 61 40 C58 31 51 28 45 29 C42 33 38 36 35 40 Z" fill="${hair}"/>`
      : style === 1
        ? `<path d="M35.5 38 C34 22 62 22 60.5 38 C58 30 53 28 48 28 C43 28 38 30 35.5 38 Z" fill="${hair}"/>`
        : style === 2
          ? `<path d="M35.5 37 C34.5 21 61.5 21 60.5 37 L59 32 C55 27 41 27 37 32 Z" fill="${hair}"/>`
          : style === 3
            ? `<g fill="${hair}"><circle cx="42" cy="27" r="6"/><circle cx="50" cy="26" r="6"/><circle cx="56" cy="29" r="5"/></g>`
            : `<path d="M36 34 C36 24 60 24 60 34 C56 30 40 30 36 34 Z" fill="${hair}"/>`;
  const collar =
    neck === 0
      ? `<path d="M40 64 L56 64 L48 80 Z" fill="${B.ink}" fill-opacity="0.85"/>`
      : neck === 1
        ? `<path d="M39 64 C43 69 53 69 57 64" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/>`
        : `<path d="M38 63 L48 72 L58 63 L55 70 L48 76 L41 70 Z" fill="#FFFFFF" fill-opacity="0.9"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"><defs><clipPath id="c"><circle cx="48" cy="48" r="46"/></clipPath></defs><circle cx="48" cy="48" r="46" fill="${bg}"/><g clip-path="url(#c)">${back}<rect x="43" y="50" width="10" height="16" rx="3" fill="${skin}" ${line}/><path d="M12 100 L15 78 C16 69 26 65 36 63 L60 63 C70 65 80 69 81 78 L84 100 Z" fill="${cloth}" ${line}/>${collar}<ellipse cx="48" cy="40" rx="12.5" ry="14.5" fill="${skin}" ${line}/>${front}</g><circle cx="48" cy="48" r="46" fill="none" stroke="${B.ink}" stroke-opacity="0.18" stroke-width="1"/></svg>`;
  return uri(svg);
}

/** Initials of a company name (skips articles and legal forms). */
export function initialsOf(name: string): string {
  const skip = new Set(['sas', 's.a.s.', 'de', 'del', 'la', 'el', 'y', 'los', 'las', 'ltda', 'sa']);
  const words = name.split(/\s+/).filter((w) => w && !skip.has(w.toLowerCase()));
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join('') || name.slice(0, 2).toUpperCase();
}

/** A monogram on a geometric mark (viewBox 96 x 96): ring, rotated square or split disc, by hash; brand colours only. */
export function logoSvg(id: string, company: string): string {
  const h = hash(`${id}:logo`);
  const mark = h % 3;
  const fill = pickOf([B.ink, '#2F3A45', '#3C3530'], h, 4);
  const accent = pickOf(ACCENT, h, 7);
  const text = initialsOf(company);
  const shape =
    mark === 0
      ? `<circle cx="48" cy="48" r="40" fill="${fill}"/><circle cx="48" cy="48" r="33" fill="none" stroke="${accent}" stroke-width="3"/>`
      : mark === 1
        ? `<rect x="14" y="14" width="68" height="68" rx="10" transform="rotate(45 48 48)" fill="${fill}"/><rect x="24" y="24" width="48" height="48" rx="6" transform="rotate(45 48 48)" fill="none" stroke="${accent}" stroke-width="2.6"/>`
        : `<circle cx="48" cy="48" r="40" fill="${fill}"/><path d="M48 8 A40 40 0 0 1 48 88 Z" fill="${accent}" fill-opacity="0.9"/><circle cx="48" cy="48" r="26" fill="${fill}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">${shape}<text x="48" y="57" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${text.length > 1 ? 26 : 32}" font-weight="700" letter-spacing="1" fill="#FFFFFF">${text}</text></svg>`;
  return uri(svg);
}
