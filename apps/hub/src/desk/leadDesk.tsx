import { useCallback, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useRegisterActions } from '../actions';
import { Button } from '../components/atom/Button/Button';
import { Input } from '../components/atom/Input/Input';
import { Select } from '../components/atom/Select/Select';
import { toast } from '../components/atom/Toast/Toast';
import { useTable } from '../data/DataContext';
import type { Lead } from '../data/schema';
import { DOSSIER_SORTS, DossierLayer, FAN_BAR, cardName, dossierCards, dossierGeometry, newDossier, sortCards, type DossierSort, type DossierState } from './dossier';
import { findItem } from './layout';
import { SQ, SUB_HEAD, type Mat, type PlacedItem } from './types';
import type { DeskController } from './useDesk';
import { WORK_COLS, canPlace, cardRef, entryItemId, entryOfItem, firstFree, leadRef, parseRef, refWidth, type WorkMatEntry, type WorkMatState } from './workmats';

type Lang = 'en' | 'es';
type T = (key: string, vars?: Record<string, string | number>) => string;
type Row = Record<string, unknown> & { id: string };

/** Work mats are mats whose id starts with this (their objects' ids start with `workmat:` too). */
export const WORK_PREFIX = 'workmat:';
export const isWorkMat = (matId: string) => matId.startsWith(WORK_PREFIX);
export const isWorkItem = (itemId: string) => itemId.startsWith(WORK_PREFIX);
const workMatId = (matId: string) => matId.slice(WORK_PREFIX.length);

interface Options {
  enabled: boolean;
  code: string;
  works: { state: WorkMatState; update: (f: (s: WorkMatState) => WorkMatState) => WorkMatState };
  desk: DeskController;
  leads: readonly Row[];
  t: T;
  lang: Lang;
  selected: string | null;
  select: (id: string | null) => void;
}

/**
 * The leads desk (D-114): lead dossiers (stack / fan / sort / flip) over the lead cards, and work mats where a person
 * arranges leads and dossier cards by hand. Used by `PageDesk` on every desk whose page reads `leads` (A-08 first);
 * the process stacks (status sub-mats) stay the source of truth and a work mat holds references to them.
 */
export function useLeadDesk({ enabled, works, desk, leads, t, lang, selected, select }: Options) {
  const { layout, byId, api } = desk;
  const [dossiers, setDossiers] = useState<ReadonlyMap<string, DossierState>>(new Map());
  const leadById = useMemo(() => new Map(leads.map((r) => [r.id, r as unknown as Lead])), [leads]);
  const leadOf = useCallback((item: PlacedItem) => (item.ref?.entity === 'leads' ? leadById.get(item.ref.id) : undefined), [leadById]);
  const matOf = useCallback((item: PlacedItem) => layout.mats.find((m) => m.id === item.phase), [layout.mats]);
  const workMats = works.state.mats;
  const matName = useCallback((id: string) => {
    const i = workMats.findIndex((m) => m.id === id);
    const m = workMats[i];
    return m ? m.name || t('desk.workmat.default', { n: i + 1 }) : id;
  }, [workMats, t]);

  // ---------------------------------------------------------------- dossiers

  const setDossier = useCallback((anchorId: string, patch: Partial<DossierState> | null) => {
    setDossiers((prev) => {
      const next = new Map(prev);
      if (patch === null) next.delete(anchorId);
      else next.set(anchorId, { ...(prev.get(anchorId) ?? newDossier()), ...patch });
      return next;
    });
  }, []);

  /** Opens a lead's dossier as a stack over its card (selecting a lead card does this). */
  const openDossier = useCallback((anchorId: string, patch: Partial<DossierState> = {}) => setDossier(anchorId, patch), [setDossier]);

  /** The desk object a question names: an object id, a lead id or name (its process card first), a work-mat object. */
  const resolve = useCallback(
    (q: string): PlacedItem | undefined => {
      const s = q.trim();
      if (!s) return undefined;
      const direct = byId.get(s) ?? byId.get(`leads:${s}`);
      if (direct) return direct;
      const lead = leads.find((r) => r.id === s || String(r.name ?? '').toLowerCase() === s.toLowerCase()) ?? leads.find((r) => String(r.name ?? '').toLowerCase().includes(s.toLowerCase()));
      if (lead) return byId.get(`leads:${lead.id}`) ?? layout.items.find((i) => i.ref?.entity === 'leads' && i.ref.id === lead.id);
      return findItem(layout.items, s);
    },
    [byId, leads, layout.items],
  );

  // ---------------------------------------------------------------- work mats

  const matByQuery = useCallback(
    (q: unknown) => {
      const s = String(q ?? '').trim().toLowerCase();
      if (!s) return workMats[0];
      return workMats.find((m, i) => m.id.toLowerCase() === s || m.name.toLowerCase() === s || String(i + 1) === s || t('desk.workmat.default', { n: i + 1 }).toLowerCase() === s);
    },
    [workMats, t],
  );

  const send = useCallback(
    (ref: string, matId = workMats[0]?.id) => {
      if (!matId) return null;
      let placed: { col: number; row: number; already: boolean } | null = null;
      works.update((s) => {
        const have = s.entries.find((e) => e.mat === matId && e.ref === ref);
        if (have) {
          placed = { col: have.col, row: have.row, already: true };
          return s;
        }
        const at = firstFree(s, matId, refWidth(ref));
        placed = { ...at, already: false };
        return { ...s, entries: [...s.entries, { ref, mat: matId, ...at }] };
      });
      return placed as { col: number; row: number; already: boolean } | null;
    },
    [works, workMats],
  );

  const moveEntry = useCallback(
    (entry: WorkMatEntry, mat: string, col: number, row: number): boolean => {
      let ok = false;
      works.update((s) => {
        if (!canPlace(s, mat, entry.ref, col, row)) return s;
        ok = true;
        const others = s.entries.filter((e) => !(e.mat === entry.mat && e.ref === entry.ref) && !(e.mat === mat && e.ref === entry.ref));
        return { ...s, entries: [...others, { ...entry, mat, col, row }] };
      });
      return ok;
    },
    [works],
  );

  const removeEntry = useCallback((entry: WorkMatEntry) => works.update((s) => ({ ...s, entries: s.entries.filter((e) => !(e.mat === entry.mat && e.ref === entry.ref)) })), [works]);

  /** A drag ended on the desk (world px): the square under the object's new top-left, on whichever work mat it is over. */
  const drop = useCallback(
    (id: string, wx: number, wy: number, dx: number, dy: number) => {
      const item = byId.get(id);
      const entry = entryOfItem(works.state, id);
      if (!item || !entry) return;
      const target = layout.mats.find((m) => isWorkMat(m.id) && wx >= m.x && wx <= m.x + m.w && wy >= m.y && wy <= m.y + m.h);
      if (!target) {
        toast(t('desk.workmat.dropOutside'));
        return;
      }
      const sub = target.subs[0];
      const x0 = target.x + (sub?.x ?? 0);
      const y0 = target.y + (sub?.y ?? 0) + SUB_HEAD;
      const col = Math.max(0, Math.min(WORK_COLS - refWidth(entry.ref), Math.round((item.x + dx - x0) / SQ)));
      const row = Math.max(0, Math.round((item.y + dy - y0) / SQ));
      if (!moveEntry(entry, workMatId(target.id), col, row)) toast(t('desk.workmat.taken'));
    },
    [byId, works.state, layout.mats, moveEntry, t],
  );

  /** Arrow keys on a focused work-mat object move it one square (P-03: nothing is drag-only). */
  const key = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const el = (e.target as Element).closest?.('[data-desk-item]');
      const id = el?.getAttribute('data-desk-item') ?? '';
      if (!isWorkItem(id)) return false;
      const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const step = d[e.key];
      const entry = entryOfItem(works.state, id);
      if (!step || !entry) return false;
      e.preventDefault();
      const col = entry.col + step[0];
      const row = entry.row + step[1];
      if (!moveEntry(entry, entry.mat, col, row)) toast(t('desk.workmat.cannotMove'));
      return true;
    },
    [works.state, moveEntry, t],
  );

  // ---------------------------------------------------------------- the overlay, the toolbar, the drawer

  const { rows: messages } = useTable('messages');
  const overlay: ReactNode = enabled && dossiers.size > 0 && (
    <DossierLayer
      open={dossiers}
      anchors={byId}
      matOf={matOf}
      leadOf={leadOf}
      messages={messages}
      lang={lang}
      t={t}
      reduced={desk.reduced}
      onChange={setDossier}
      onSendLead={(anchorId) => {
        const lead = byId.get(anchorId) && leadOf(byId.get(anchorId)!);
        if (!lead) return;
        const r = send(leadRef(lead.id));
        if (r) toast(t(r.already ? 'desk.workmat.already' : 'desk.workmat.sent', { what: lead.name, mat: matName(workMats[0].id) }));
      }}
      onSendCard={(anchorId, cardId) => {
        const lead = byId.get(anchorId) && leadOf(byId.get(anchorId)!);
        if (!lead) return;
        const r = send(cardRef(lead.id, cardId));
        const card = dossierCards(lead, []).find((c) => c.id === cardId);
        if (r) toast(t(r.already ? 'desk.workmat.already' : 'desk.workmat.sent', { what: card ? `${cardName(card, lead, lang, t)} · ${lead.name}` : lead.name, mat: matName(workMats[0].id) }));
      }}
    />
  );

  const [mat, setMat] = useState<string>('');
  const current = workMats.find((m) => m.id === mat) ?? workMats[0];
  const [draft, setDraft] = useState('');
  const toolbar: ReactNode = enabled && (
    <div className="desk-toolbar desk-workmats" role="toolbar" aria-label={t('desk.workmat.toolbar')}>
      <span className="desk-toolbar__name">{t('desk.workmat.title')}</span>
      <Select
        label={t('desk.workmat.pick')}
        hideLabel
        className="desk-toolbar__phase"
        value={current?.id ?? ''}
        onChange={(e) => {
          setMat(e.target.value);
          setDraft('');
          api.fitMat(`${WORK_PREFIX}${e.target.value}`);
        }}
        options={workMats.map((m, i) => ({ value: m.id, label: `${m.name || t('desk.workmat.default', { n: i + 1 })} · ${works.state.entries.filter((e) => e.mat === m.id).length}` }))}
      />
      <Input label={t('desk.workmat.name')} hideLabel className="desk-workmats__name" value={draft} placeholder={current ? matName(current.id) : ''} onChange={(e) => setDraft(e.target.value)} />
      <Button size="sm" disabled={!current || !draft.trim()} onClick={() => current && (renameMat(current.id, draft.trim()), setDraft(''))}>
        {t('desk.workmat.rename')}
      </Button>
      <Button size="sm" variant="ghost" disabled={!current} onClick={() => current && removeMat(current.id)}>
        {t('desk.workmat.remove')}
      </Button>
      <Button size="sm" icon="+" onClick={() => addMat()}>
        {t('desk.workmat.add')}
      </Button>
    </div>
  );

  function addMat(name = '') {
    let id = '';
    works.update((s) => {
      let k = s.mats.length + 1;
      while (s.mats.some((m) => m.id === `wm-${k}`)) k++;
      id = `wm-${k}`;
      return { ...s, mats: [...s.mats, { id, name }] };
    });
    setMat(id);
    return id;
  }
  function renameMat(id: string, name: string) {
    works.update((s) => ({ ...s, mats: s.mats.map((m) => (m.id === id ? { ...m, name } : m)) }));
  }
  function removeMat(id: string) {
    works.update((s) => (s.mats.length <= 1 ? { mats: [{ ...s.mats[0], name: '' }], entries: [] } : { mats: s.mats.filter((m) => m.id !== id), entries: s.entries.filter((e) => e.mat !== id) }));
    setMat('');
  }

  /** Mats under an open fan dim a little (changelog 0045): their materials step down, the cards above stay bright. */
  const fanned = useMemo(() => {
    const out = new Set<string>();
    for (const [id, st] of dossiers) {
      const it = byId.get(id);
      const m = st.mode === 'fan' && it ? matOf(it) : undefined;
      if (m) out.add(m.id);
    }
    return out;
  }, [dossiers, byId, matOf]);
  const matClass = useCallback((m: Mat) => `${isWorkMat(m.id) ? ' desk-mat--work' : ''}${fanned.has(m.id) ? ' is-fanned' : ''}`, [fanned]);

  /** The drawer's dossier and work-mat section for a lead object (its process card or a work-mat reference). */
  const drawerSection = (item: PlacedItem): ReactNode => {
    const lead = leadOf(item);
    if (!enabled || !lead) return null;
    const anchorId = item.id;
    const st = dossiers.get(anchorId);
    const entry = isWorkItem(item.id) ? entryOfItem(works.state, item.id) : undefined;
    const cards = sortCards(dossierCards(lead, []), st?.sort ?? 'kind');
    const focus = st?.focus ?? cards[0]?.id;
    const focusCard = cards.find((c) => c.id === focus);
    const processCard = byId.get(`leads:${lead.id}`);
    return (
      <>
        <h3 className="desk-drawer__h">{t('desk.dossier.title', { n: cards.length })}</h3>
        <p className="desk-drawer__why">{t('desk.dossier.intro')}</p>
        <div className="desk-dossier-drawer">
          <Button size="sm" variant={st?.mode === 'fan' ? 'secondary' : 'primary'} onClick={() => setDossier(anchorId, { mode: st?.mode === 'fan' ? 'stack' : 'fan' })}>
            {st?.mode === 'fan' ? t('desk.dossier.stack') : t('desk.dossier.fan')}
          </Button>
          <Select
            label={t('desk.dossier.sortLabel')}
            hideLabel
            className="desk-ability__select"
            value={st?.sort ?? 'kind'}
            onChange={(e) => setDossier(anchorId, { sort: e.target.value as DossierSort })}
            options={DOSSIER_SORTS.map((s) => ({ value: s, label: t(`desk.dossier.sort.${s}`) }))}
          />
          <Select
            label={t('desk.dossier.focusLabel')}
            hideLabel
            className="desk-ability__select"
            value={focus ?? ''}
            onChange={(e) => setDossier(anchorId, { focus: e.target.value })}
            options={cards.map((c) => ({ value: c.id, label: cardName(c, lead, lang, t) }))}
          />
          <Button
            size="sm"
            disabled={focusCard?.kind !== 'social'}
            title={focusCard?.kind === 'social' ? undefined : t('desk.dossier.flipNone')}
            onClick={() => focus && setDossier(anchorId, { focus, flipped: st?.flipped.includes(focus) ? st.flipped.filter((x) => x !== focus) : [...(st?.flipped ?? []), focus] })}
          >
            {t('desk.dossier.flip')}
          </Button>
          {st && (
            <Button size="sm" variant="ghost" onClick={() => setDossier(anchorId, null)}>
              {t('desk.dossier.closeShort')}
            </Button>
          )}
        </div>
        <h3 className="desk-drawer__h">{t('desk.workmat.title')}</h3>
        {entry ? (
          <>
            <p className="desk-drawer__why">{t('desk.workmat.onMat', { mat: matName(entry.mat), col: entry.col + 1, row: entry.row + 1 })}</p>
            <div className="desk-dossier-drawer">
              <Select
                label={t('desk.workmat.moveTo')}
                hideLabel
                className="desk-ability__select"
                value=""
                placeholder={t('desk.workmat.moveTo')}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '__back') {
                    removeEntry(entry);
                    select(processCard?.id ?? null);
                    if (processCard) api.flyToItem(processCard, 'open');
                  } else if (v) {
                    const s = works.state;
                    const at = firstFree(s, v, refWidth(entry.ref), entry.ref);
                    moveEntry(entry, v, at.col, at.row);
                  }
                }}
                options={[...workMats.filter((m) => m.id !== entry.mat).map((m) => ({ value: m.id, label: matName(m.id) })), { value: '__back', label: t('desk.workmat.back') }]}
              />
              <Button size="sm" onClick={() => (removeEntry(entry), select(null))}>
                {t('desk.workmat.removeFrom')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={!processCard}
                onClick={() => {
                  removeEntry(entry);
                  if (processCard) {
                    select(processCard.id);
                    api.flyToItem(processCard, 'open');
                  }
                }}
              >
                {t('desk.workmat.back')}
              </Button>
            </div>
          </>
        ) : (
          <div className="desk-dossier-drawer">
            <Button
              size="sm"
              onClick={() => {
                const r = send(leadRef(lead.id), current?.id);
                if (r) toast(t(r.already ? 'desk.workmat.already' : 'desk.workmat.sent', { what: lead.name, mat: matName(current.id) }));
              }}
            >
              {t('desk.workmat.send', { mat: current ? matName(current.id) : '' })}
            </Button>
            {focusCard && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const r = send(cardRef(lead.id, focusCard.id), current?.id);
                  if (r) toast(t(r.already ? 'desk.workmat.already' : 'desk.workmat.sent', { what: `${cardName(focusCard, lead, lang, t)} · ${lead.name}`, mat: matName(current.id) }));
                }}
              >
                {t('desk.workmat.sendCard', { card: cardName(focusCard, lead, lang, t) })}
              </Button>
            )}
          </div>
        )}
      </>
    );
  };

  // ---------------------------------------------------------------- actions (D-114), registered while the desk shows leads

  // The mat and the fan over it (its controls and the focused card rise above the arc), so both read at once.
  const fitFan = (it: PlacedItem, lead: Lead) => {
    const m = matOf(it);
    const g = dossierGeometry(it, m, dossierCards(lead, []).length, 'fan');
    const top = g.top - FAN_BAR - 12;
    if (!m) return api.fitBox(g.cx - g.width / 2, top, g.cx + g.width / 2, g.bottom + 16);
    api.fitBox(Math.min(m.x, g.cx - g.width / 2), Math.min(m.y, top), Math.max(m.x + m.w, g.cx + g.width / 2), Math.max(m.y + m.h, g.bottom + 16));
    return undefined;
  };

  const leadOfObject = (q: unknown) => {
    const it = resolve(String(q ?? ''));
    const lead = it && leadOf(it);
    return it && lead ? { it, lead } : null;
  };
  // A work-mat object by its item id or id tail, else the lead (id or name) on a work mat, its lead entry first.
  const workEntryOf = (q: string): WorkMatEntry | undefined => {
    const it = byId.get(q) ?? layout.items.find((i) => isWorkItem(i.id) && (i.ref?.id === q || i.id.endsWith(`:${q}`)));
    const direct = it && entryOfItem(works.state, it.id);
    if (direct) return direct;
    const hit = leadOfObject(q);
    if (!hit) return undefined;
    const mine = works.state.entries.filter((e) => parseRef(e.ref)?.leadId === hit.lead.id);
    return mine.find((e) => e.ref === leadRef(hit.lead.id)) ?? mine[0];
  };
  useRegisterActions(
    !enabled
      ? {}
      : {
          'desk.fanOut': ({ object }) => {
            const hit = leadOfObject(object);
            if (!hit) return `no lead "${String(object ?? '')}" on the desk`;
            openDossier(hit.it.id, { mode: 'fan' });
            fitFan(hit.it, hit.lead);
            return `fanned out the dossier of ${hit.lead.name}: ${dossierCards(hit.lead, []).length} cards`;
          },
          'desk.stackUp': ({ object }) => {
            const hit = leadOfObject(object);
            if (!hit) return `no lead "${String(object ?? '')}" on the desk`;
            openDossier(hit.it.id, { mode: 'stack' });
            return `stacked the dossier of ${hit.lead.name}`;
          },
          'desk.sortStack': ({ object, by }) => {
            const hit = leadOfObject(object);
            if (!hit) return `no lead "${String(object ?? '')}" on the desk`;
            const b = String(by ?? '') as DossierSort;
            if (!DOSSIER_SORTS.includes(b)) return `by must be kind, date or network, not "${String(by)}"`;
            openDossier(hit.it.id, { sort: b });
            return `sorted the dossier of ${hit.lead.name} by ${b}: ${sortCards(dossierCards(hit.lead, []), b).map((c) => c.id).join(', ')}`;
          },
          'desk.flipCard': ({ card }) => {
            // `<lead>:<card>` (e.g. `lead-cafe-san-joaquin:social-instagram`), or a card of an open dossier by id or network.
            const q = String(card ?? '').trim();
            const [leadQ, cardQ] = q.includes(':') ? [q.slice(0, q.lastIndexOf(':')), q.slice(q.lastIndexOf(':') + 1)] : ['', q];
            const pool = leadQ ? [leadOfObject(leadQ)].filter(Boolean) : [...dossiers.keys()].map((id) => leadOfObject(id)).filter(Boolean);
            for (const hit of pool as { it: PlacedItem; lead: Lead }[]) {
              const c = dossierCards(hit.lead, []).find((x) => x.id === cardQ || x.network === cardQ || x.id === `social-${cardQ}`);
              if (!c) continue;
              if (c.kind !== 'social') return `${c.id} has no back (only social profile cards turn over)`;
              const st = dossiers.get(hit.it.id) ?? newDossier();
              const flipped = st.flipped.includes(c.id) ? st.flipped.filter((x) => x !== c.id) : [...st.flipped, c.id];
              openDossier(hit.it.id, { focus: c.id, flipped });
              return `${flipped.includes(c.id) ? 'turned over' : 'turned back'} ${c.id} of ${hit.lead.name}`;
            }
            return `no card "${q}" in an open dossier (open one with desk.fanOut, or name it as <lead>:<card>)`;
          },
          'desk.addWorkMat': () => {
            const n = workMats.length + 1;
            const id = addMat();
            return `added ${id} (${n} work mats)`;
          },
          'desk.renameWorkMat': ({ mat: m, name }) => {
            const wm = matByQuery(m);
            const n = String(name ?? '').trim();
            if (!wm) return `no work mat "${String(m ?? '')}" (${workMats.map((x) => x.id).join(', ')})`;
            if (!n) return 'name is empty';
            renameMat(wm.id, n);
            return `renamed ${wm.id} to "${n}"`;
          },
          'desk.removeWorkMat': ({ mat: m }) => {
            const wm = matByQuery(m);
            if (!wm) return `no work mat "${String(m ?? '')}"`;
            const last = workMats.length <= 1;
            removeMat(wm.id);
            return last ? `${wm.id} is the only work mat: emptied it instead` : `removed ${wm.id} and what lay on it`;
          },
          'desk.sendToWorkMat': ({ object, mat: m }) => {
            const q = String(object ?? '').trim();
            const wm = matByQuery(m);
            if (!wm) return `no work mat "${String(m ?? '')}" (${workMats.map((x) => x.id).join(', ')})`;
            const parts = q.split(':');
            const cardQ = parts.length > 1 && !q.startsWith('leads:') && !q.startsWith(WORK_PREFIX) ? parts.pop()! : '';
            const hit = leadOfObject(cardQ ? parts.join(':') : q);
            if (!hit) return `no lead "${q}" on the desk`;
            const card = cardQ ? dossierCards(hit.lead, []).find((c) => c.id === cardQ || c.network === cardQ) : undefined;
            if (cardQ && !card) return `${hit.lead.name} has no card "${cardQ}"`;
            const r = send(card ? cardRef(hit.lead.id, card.id) : leadRef(hit.lead.id), wm.id);
            return r ? `${r.already ? 'already on' : 'sent to'} ${matName(wm.id)} at square ${r.col + 1}, ${r.row + 1}: ${card ? `${card.id} of ` : ''}${hit.lead.name}` : 'no work mat';
          },
          'desk.moveOnWorkMat': ({ object, x, y }) => {
            const q = String(object ?? '').trim();
            const entry = workEntryOf(q);
            if (!entry) return `no work-mat object "${q}" (send one with desk.sendToWorkMat)`;
            const col = Math.round(Number(x)) - 1;
            const row = Math.round(Number(y)) - 1;
            if (!Number.isFinite(col) || !Number.isFinite(row)) return 'x and y are squares counted from 1 at the top left';
            return moveEntry(entry, entry.mat, col, row) ? `moved to square ${col + 1}, ${row + 1} of ${matName(entry.mat)}` : `square ${col + 1}, ${row + 1} is taken or off the mat (${WORK_COLS} squares wide)`;
          },
          'desk.removeFromWorkMat': ({ object }) => {
            const q = String(object ?? '').trim();
            const entry = workEntryOf(q);
            if (!entry) return `no work-mat object "${q}"`;
            removeEntry(entry);
            if (selected === entryItemId(entry)) select(null);
            const p = parseRef(entry.ref);
            return `removed ${p?.cardId ? `${p.cardId} of ` : ''}${p ? leadById.get(p.leadId)?.name ?? p.leadId : entry.ref} from ${matName(entry.mat)}; its process card stays where it is`;
          },
        },
  );

  return { overlay, toolbar, drawerSection, matClass, openDossier, drop, key, dossiers };
}

export { entryItemId };
