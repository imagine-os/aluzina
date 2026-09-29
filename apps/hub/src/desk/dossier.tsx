import { memo, useMemo, type CSSProperties, type KeyboardEvent } from 'react';
import { Button } from '../components/atom/Button/Button';
import { Icon, isIconName } from '../components/atom/Icon/Icon';
import { toast } from '../components/atom/Toast/Toast';
import type { Lead, LeadNetwork, Message } from '../data/schema';
import { copyText } from '../design/clipboard';
import { formatCop, formatDate } from '../i18n/format';
import { demoUserById } from '../tenant/auth/demoUsers';
import { LEAD_CHANNELS, QUALIFICATION_QUESTIONS, pick, type Text } from '../tenant/domain';
import { valueLabel } from './fields';
import type { Mat, PlacedItem } from './types';

type Lang = 'en' | 'es';
type T = (key: string, vars?: Record<string, string | number>) => string;

/**
 * A lead's dossier (D-114): the lead as a stack of cards, in place over its card on the desk. Contact, Company, one
 * card per social profile (front: the profile drawn from the lead's own data; back: the notes), Qualification (the ten
 * answers), Commercial and Notes / Messages. It stacks, fans out in an arc, sorts by kind / date / network and flips a
 * card. The dossier lies on an overlay plane above every object (`DEPTH.fan`, 28 world px; each open dossier 2 px
 * higher than the one before, each card 0.2 px above the one under it), so a fan never intersects or clips a
 * neighbour, it floats over it. Social profiles are never embedded: the card is drawn from the mock data and Visit
 * opens the link when there is one (privacy, network policy and no third-party scripts, changelog 0041).
 */

export type DossierCardKind = 'contact' | 'company' | 'social' | 'qualification' | 'commercial' | 'notes';
export type DossierSort = 'kind' | 'date' | 'network';
export const DOSSIER_SORTS: readonly DossierSort[] = ['kind', 'date', 'network'];

export interface DossierCard {
  id: string;
  kind: DossierCardKind;
  network?: LeadNetwork;
  /** ISO date the card is about (sort by date); undefined sorts last. */
  date?: string;
}

export interface DossierState {
  mode: 'stack' | 'fan';
  sort: DossierSort;
  /** The focused card (on top of the stack, the one Flip turns). */
  focus: string | null;
  flipped: readonly string[];
}

export const newDossier = (): DossierState => ({ mode: 'stack', sort: 'kind', focus: null, flipped: [] });

const KIND_ORDER: readonly DossierCardKind[] = ['contact', 'company', 'social', 'qualification', 'commercial', 'notes'];

/** The cards of a lead's dossier, in kind order (the Company card only when the lead is or has a company). */
export function dossierCards(lead: Lead, messages: readonly Message[]): DossierCard[] {
  const cards: DossierCard[] = [{ id: 'contact', kind: 'contact', date: lead.created_at }];
  if (lead.company || lead.logoUrl || lead.projectType !== 'residential') cards.push({ id: 'company', kind: 'company', date: lead.created_at });
  for (const s of lead.socials ?? []) cards.push({ id: `social-${s.network}`, kind: 'social', network: s.network });
  cards.push({ id: 'qualification', kind: 'qualification', date: Object.keys(lead.qualification ?? {}).length ? lead.updated_at : undefined });
  cards.push({ id: 'commercial', kind: 'commercial', date: lead.desiredStart ?? undefined });
  const last = messages.map((m) => m.at).sort().at(-1);
  cards.push({ id: 'notes', kind: 'notes', date: last ?? lead.updated_at });
  return cards;
}

export function sortCards(cards: readonly DossierCard[], by: DossierSort): DossierCard[] {
  const rank = (c: DossierCard) => KIND_ORDER.indexOf(c.kind);
  const out = [...cards];
  if (by === 'kind') return out.sort((a, b) => rank(a) - rank(b));
  if (by === 'date') return out.sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999') || rank(a) - rank(b));
  // Network: the social cards first, by network name; the rest after, in kind order.
  return out.sort((a, b) => (a.network ? 0 : 1) - (b.network ? 0 : 1) || (a.network ?? '').localeCompare(b.network ?? '') || rank(a) - rank(b));
}

/** Card size on the desk (world px) and its base font; the stack shows them at STACK_SCALE over the lead's card. */
export const CARD_W = 148;
export const CARD_H = 204;
const CARD_FONT = 7.2;
const STACK_SCALE = 0.42;
const FAN_RADIUS = 900;

/** Where a dossier's cards go (world px): in the stack over its lead card, or along an arc kept inside its mat. */
export function dossierGeometry(anchor: PlacedItem, mat: Mat | undefined, n: number, mode: 'stack' | 'fan') {
  const ax = anchor.x + anchor.cw / 2;
  const ay = anchor.y + anchor.ch / 2;
  if (mode === 'stack') return { cx: ax, cy: ay, step: 0, width: CARD_W * STACK_SCALE, top: ay - (CARD_H * STACK_SCALE) / 2 };
  // The widest arc that stays inside the mat (a fan never leaves its mat, so it reads at the mat's fit), at most 8° a card.
  const room = mat ? mat.w - 16 : 640;
  const maxTheta = (Math.asin(Math.min(0.9, Math.max(0, room / 2 - CARD_W / 2) / (FAN_RADIUS + CARD_H))) * 180) / Math.PI;
  const step = n > 1 ? Math.min(8, (2 * maxTheta) / (n - 1)) : 0;
  const spread = (Math.sin((((n - 1) / 2) * step * Math.PI) / 180) * (FAN_RADIUS + CARD_H) + CARD_W / 2) * 2;
  const mx0 = mat ? mat.x + 8 : ax - spread / 2;
  const mx1 = mat ? mat.x + mat.w - 8 : ax + spread / 2;
  const cx = mx1 - mx0 > spread ? Math.min(mx1 - spread / 2, Math.max(mx0 + spread / 2, ax)) : (mx0 + mx1) / 2;
  const top0 = mat ? mat.y + 12 : ay - CARD_H;
  const cy = Math.max(top0 + CARD_H + 54, ay + anchor.ch / 2 + 8);
  return { cx, cy, step, width: spread, top: cy - CARD_H - 24 };
}

function cardTransform(i: number, n: number, mode: 'stack' | 'fan', step: number, top: boolean): CSSProperties {
  if (mode === 'fan' && top) {
    // The focused card of a fan rises out of the hand and comes to the front (above every other card's Z).
    const theta = (i - (n - 1) / 2) * step;
    return { transformOrigin: `50% ${CARD_H + FAN_RADIUS}px`, transform: `translate(0px, ${-CARD_H / 2 - 30}px) translateZ(${n * 0.2}px) rotate(${theta}deg) scale(1.04)` };
  }
  if (mode === 'stack') {
    // A pile in place: small offsets and turns, the focused card on top.
    const k = top ? n : i;
    return {
      transformOrigin: '50% 50%',
      transform: `translate(${k * 1.6}px, ${-k * 1.6}px) translateZ(${k * 0.2}px) rotate(${((k % 3) - 1) * 1.4}deg) scale(${STACK_SCALE})`,
    };
  }
  // A hand of cards: each turns about a point FAN_RADIUS under the fan's centre; the same function list as the stack,
  // so a change of mode interpolates smoothly (transform only).
  const theta = (i - (n - 1) / 2) * step;
  return { transformOrigin: `50% ${CARD_H + FAN_RADIUS}px`, transform: `translate(0px, ${-CARD_H / 2}px) translateZ(${i * 0.2}px) rotate(${theta}deg) scale(1)` };
}

/** Mock follower numbers for a drawn profile: deterministic from the handle, labelled as mock on the card. */
function mockCounts(handle: string): { posts: number; followers: number } {
  let h = 7;
  for (const ch of handle) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { posts: 12 + (h % 240), followers: 180 + ((h >>> 8) % 9800) };
}

const NETWORK_NAME: Record<LeadNetwork, Text> = {
  instagram: { en: 'Instagram', es: 'Instagram' },
  linkedin: { en: 'LinkedIn', es: 'LinkedIn' },
  facebook: { en: 'Facebook', es: 'Facebook' },
  tiktok: { en: 'TikTok', es: 'TikTok' },
  website: { en: 'Website', es: 'Sitio web' },
  whatsapp: { en: 'WhatsApp', es: 'WhatsApp' },
};
export const networkName = (n: LeadNetwork, lang: Lang) => pick(NETWORK_NAME[n], lang);

/** A card's name for its button, the tooltip-less label, the drawer and the actions ("Instagram @x", "Contact"). */
export function cardName(card: DossierCard, lead: Lead, lang: Lang, t: T): string {
  if (card.kind === 'social' && card.network) {
    const s = lead.socials?.find((x) => x.network === card.network);
    return `${networkName(card.network, lang)} ${s?.handle ?? ''}`.trim();
  }
  return t(`desk.dossier.card.${card.kind}`);
}

interface LayerProps {
  /** Open dossiers by anchor object id (the lead's process card or its work-mat reference). */
  open: ReadonlyMap<string, DossierState>;
  anchors: ReadonlyMap<string, PlacedItem>;
  matOf: (item: PlacedItem) => Mat | undefined;
  leadOf: (item: PlacedItem) => Lead | undefined;
  messages: readonly Message[];
  lang: Lang;
  t: T;
  reduced: boolean;
  onChange: (anchorId: string, patch: Partial<DossierState> | null) => void;
  onSendCard: (anchorId: string, cardId: string) => void;
  onSendLead: (anchorId: string) => void;
}

/** Every open dossier on its overlay plane (a world overlay of the desk stage). */
export function DossierLayer(props: LayerProps) {
  const entries = [...props.open.entries()];
  return (
    <div className={`dz-layer${props.reduced ? ' is-reduced' : ''}`}>
      {entries.map(([id, state], k) => {
        const anchor = props.anchors.get(id);
        const lead = anchor && props.leadOf(anchor);
        if (!anchor || !lead) return null;
        return <Dossier key={id} anchorId={id} anchor={anchor} mat={props.matOf(anchor)} lead={lead} state={state} level={k} {...props} />;
      })}
    </div>
  );
}

type DossierProps = LayerProps & { anchorId: string; anchor: PlacedItem; mat?: Mat; lead: Lead; state: DossierState; level: number };

const Dossier = memo(function Dossier({ anchorId, anchor, mat, lead, state, level, messages, lang, t, onChange, onSendCard, onSendLead }: DossierProps) {
  const linked = useMemo(() => (lead.projectId ? messages.filter((m) => m.projectId === lead.projectId) : []), [messages, lead.projectId]);
  const cards = useMemo(() => sortCards(dossierCards(lead, linked), state.sort), [lead, linked, state.sort]);
  const n = cards.length;
  const g = dossierGeometry(anchor, mat, n, state.mode);
  const focus = state.focus && cards.some((c) => c.id === state.focus) ? state.focus : cards[0]?.id ?? null;
  const focusCard = cards.find((c) => c.id === focus);
  const flippable = (c: DossierCard | undefined) => c?.kind === 'social';
  const flip = (id: string) => onChange(anchorId, { focus: id, flipped: state.flipped.includes(id) ? state.flipped.filter((x) => x !== id) : [...state.flipped, id] });
  const name = lead.name;
  const barTop = state.mode === 'fan' ? g.top - 60 : g.top - 20;
  // The controls stay over the mat (a stack near the mat's edge would push them off it); smaller over a stack.
  const half = state.mode === 'fan' ? 135 : 82;
  const barX = mat ? Math.min(mat.x + mat.w - half, Math.max(mat.x + half, g.cx)) - g.cx : 0;
  return (
    <section
      className={`dz dz--${state.mode}`}
      aria-label={t('desk.dossier.aria', { name, n })}
      data-dossier={anchorId}
      style={{ left: g.cx, top: state.mode === 'fan' ? g.cy : g.cy, ['--dz-z' as string]: `calc(var(--z-fan) + ${level * 2}px)`, fontSize: CARD_FONT }}
    >
      <div className="dz-bar" role="toolbar" aria-label={t('desk.dossier.controls', { name })} style={{ top: barTop - g.cy, left: barX }}>
        <button type="button" className="dz-btn dz-btn--primary" aria-pressed={state.mode === 'fan'} onClick={() => onChange(anchorId, { mode: state.mode === 'fan' ? 'stack' : 'fan' })}>
          {state.mode === 'fan' ? t('desk.dossier.stack') : t('desk.dossier.fan')}
        </button>
        <label className="dz-sort">
          <span className="visually-hidden">{t('desk.dossier.sortLabel')}</span>
          <select value={state.sort} onChange={(e) => onChange(anchorId, { sort: e.target.value as DossierSort })} aria-label={t('desk.dossier.sortLabel')}>
            {DOSSIER_SORTS.map((s) => (
              <option key={s} value={s}>
                {t(`desk.dossier.sort.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="dz-btn" disabled={!flippable(focusCard)} title={flippable(focusCard) ? undefined : t('desk.dossier.flipNone')} onClick={() => focus && flip(focus)}>
          {t('desk.dossier.flip')}
        </button>
        <button type="button" className="dz-btn" onClick={() => (focus ? onSendCard(anchorId, focus) : onSendLead(anchorId))} title={t('desk.dossier.sendCardHint')}>
          {t('desk.dossier.sendCard')}
        </button>
        <button type="button" className="dz-btn dz-btn--icon" aria-label={t('desk.dossier.close', { name })} onClick={() => onChange(anchorId, null)}>
          ×
        </button>
      </div>
      {cards.map((c, i) => {
        const isTop = c.id === focus;
        const flipped = state.flipped.includes(c.id);
        return (
          <article
            key={c.id}
            className={`dz-card dz-card--${c.kind}${flippable(c) ? ' is-flippable' : ''}${isTop ? ' is-focus' : ''}${flipped ? ' is-flipped' : ''}`}
            style={{ left: -CARD_W / 2, top: -CARD_H / 2, width: CARD_W, height: CARD_H, ...cardTransform(i, n, state.mode, g.step, isTop) }}
            data-dossier-card={c.id}
          >
            <div className="dz-card__inner">
              <div className="dz-face dz-face--front">
                <button
                  type="button"
                  className="dz-card__main"
                  aria-pressed={isTop}
                  aria-label={t(flippable(c) ? 'desk.dossier.cardFlip' : 'desk.dossier.cardFocus', { card: cardName(c, lead, lang, t), name })}
                  onClick={() => (flippable(c) && isTop ? flip(c.id) : onChange(anchorId, { focus: c.id }))}
                  onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                    if (e.key === 'Enter' && flippable(c)) {
                      e.preventDefault();
                      flip(c.id);
                    }
                  }}
                >
                  <span className="dz-card__kind">
                    {c.network && isIconName(c.network) ? <Icon name={c.network} size="sm" className="dz-glyph" /> : null}
                    {c.kind === 'social' && c.network ? networkName(c.network, lang) : t(`desk.dossier.card.${c.kind}`)}
                  </span>
                </button>
                <CardFront card={c} lead={lead} messages={linked} lang={lang} t={t} />
              </div>
              {flippable(c) && (
                <div className="dz-face dz-face--back" aria-hidden={!flipped}>
                  <span className="dz-card__kind">{t('desk.dossier.back')}</span>
                  <p className="dz-notes">{lead.notes || t('desk.dossier.noNotes')}</p>
                  <button type="button" className="dz-btn" tabIndex={flipped ? 0 : -1} onClick={() => flip(c.id)}>
                    {t('desk.dossier.flipBack')}
                  </button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
});

function Copy({ value, label, t }: { value: string | null | undefined; label: string; t: T }) {
  if (!value) return <span className="dz-row dz-row--empty">{t('desk.dossier.none', { what: label })}</span>;
  return (
    <span className="dz-row">
      <span className="dz-row__k">{label}</span>
      <span className="dz-row__v">{value}</span>
      <button
        type="button"
        className="dz-btn dz-btn--copy"
        aria-label={t('desk.dossier.copy', { what: label.toLowerCase(), value })}
        onClick={() => void copyText(value).then((ok) => toast(ok ? t('desk.dossier.copied', { value }) : t('desk.dossier.copyFailed')))}
      >
        {t('desk.dossier.copyShort')}
      </button>
    </span>
  );
}

function CardFront({ card, lead, messages, lang, t }: { card: DossierCard; lead: Lead; messages: readonly Message[]; lang: Lang; t: T }) {
  switch (card.kind) {
    case 'contact':
      return (
        <div className="dz-body">
          <div className="dz-who">
            {lead.portraitUrl && <img className="dz-portrait" src={lead.portraitUrl} alt="" draggable={false} />}
            <strong className="dz-title">{lead.name}</strong>
          </div>
          <Copy value={lead.phone} label={t('desk.dossier.phone')} t={t} />
          <Copy value={lead.email} label={t('desk.dossier.email')} t={t} />
          <Copy value={lead.city} label={t('desk.dossier.city')} t={t} />
        </div>
      );
    case 'company':
      return (
        <div className="dz-body">
          <div className="dz-who">
            {lead.logoUrl && <img className="dz-logo" src={lead.logoUrl} alt="" draggable={false} />}
            <strong className="dz-title">{lead.company ?? lead.name}</strong>
          </div>
          <span className="dz-row">
            <span className="dz-row__k">{t('desk.dossier.typology')}</span>
            <span className="dz-row__v">{pick(valueLabel(lead.projectType), lang)}</span>
          </span>
          <span className="dz-row">
            <span className="dz-row__k">{t('desk.dossier.area')}</span>
            <span className="dz-row__v">{lead.areaM2 ? `${lead.areaM2} m²` : '—'}</span>
          </span>
          <span className="dz-row">
            <span className="dz-row__k">{t('desk.dossier.site')}</span>
            <span className="dz-row__v">{lead.projectStatus ? pick(valueLabel(lead.projectStatus), lang) : '—'}</span>
          </span>
        </div>
      );
    case 'social': {
      const s = lead.socials?.find((x) => x.network === card.network);
      if (!s) return null;
      const c = mockCounts(s.handle);
      return (
        <div className="dz-body dz-body--social">
          <div className="dz-profile" aria-hidden="true">
            <span className="dz-profile__banner" />
            <img className="dz-profile__avatar" src={lead.logoUrl ?? lead.portraitUrl} alt="" draggable={false} />
          </div>
          <strong className="dz-title">{lead.company ?? lead.name}</strong>
          <span className="dz-handle">{s.handle}</span>
          <span className="dz-counts">{t('desk.dossier.mockCounts', { posts: c.posts, followers: c.followers.toLocaleString(lang === 'es' ? 'es-CO' : 'en-US') })}</span>
          <span className="dz-visit">
            {s.url ? (
              <Button size="sm" variant="secondary" href={s.url} external icon="external">
                {t('desk.dossier.visit')}
              </Button>
            ) : (
              <Button size="sm" variant="secondary" disabled title={t('desk.dossier.noLink', { network: networkName(s.network, lang) })}>
                {t('desk.dossier.visit')}
              </Button>
            )}
          </span>
          {!s.url && <span className="dz-reason">{t('desk.dossier.noLink', { network: networkName(s.network, lang) })}</span>}
        </div>
      );
    }
    case 'qualification':
      return (
        <ol className="dz-body dz-qa">
          {QUALIFICATION_QUESTIONS.map((q) => {
            const a = lead.qualification?.[q.key];
            const opt = q.options?.find((o) => o.value === a);
            return (
              <li key={q.key} className={a ? '' : 'is-empty'}>
                <span className="dz-qa__q">{pick(q.question, lang)}</span>
                <span className="dz-qa__a">{a ? (opt ? pick(opt.label, lang) : a) : t('desk.dossier.notAnswered')}</span>
              </li>
            );
          })}
        </ol>
      );
    case 'commercial': {
      const owner = lead.ownerId ? demoUserById(lead.ownerId)?.name ?? lead.ownerId : null;
      const channel = LEAD_CHANNELS.find((c) => c.id === lead.channel);
      return (
        <div className="dz-body">
          <span className="dz-big">{lead.budgetCop != null ? formatCop(lead.budgetCop, lang) : t('desk.dossier.noBudget')}</span>
          <span className="dz-row">
            <span className="dz-row__k">{t('desk.dossier.start')}</span>
            <span className="dz-row__v">{lead.desiredStart ? formatDate(lead.desiredStart, lang) : '—'}</span>
          </span>
          <span className="dz-row">
            <span className="dz-row__k">{t('desk.dossier.channel')}</span>
            <span className="dz-row__v">{channel ? pick(channel.label, lang) : lead.channel}</span>
          </span>
          <span className="dz-row">
            <span className="dz-row__k">{t('desk.dossier.owner')}</span>
            <span className="dz-row__v">{owner ?? t('desk.dossier.noOwner')}</span>
          </span>
        </div>
      );
    }
    case 'notes':
      return (
        <div className="dz-body">
          <p className="dz-notes">{lead.notes || t('desk.dossier.noNotes')}</p>
          {messages.length > 0 ? (
            <ul className="dz-msgs">
              {[...messages]
                .sort((a, b) => b.at.localeCompare(a.at))
                .slice(0, 3)
                .map((m) => (
                  <li key={m.id}>
                    <span className="dz-msgs__at">{formatDate(m.at, lang)}</span> {m.body.length > 90 ? `${m.body.slice(0, 89)}…` : m.body}
                  </li>
                ))}
            </ul>
          ) : (
            <span className="dz-row dz-row--empty">{t('desk.dossier.noMessages')}</span>
          )}
        </div>
      );
  }
}
