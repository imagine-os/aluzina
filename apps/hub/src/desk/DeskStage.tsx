import { useMemo, useRef, type FocusEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Button } from '../components/atom/Button/Button';
import { Checkbox } from '../components/atom/Checkbox/Checkbox';
import { Select } from '../components/atom/Select/Select';
import { useT } from '../i18n/I18nProvider';
import { pick } from '../tenant/domain';
import { DeskFace, DeskObject } from './DeskObject';
import { DeskPersonStation } from './DeskPerson';
import type { DeskPerson } from './people';
import { DESK_SIZES, SIZE_VH, SLAB, TILT_DEG, type DeskController } from './useDesk';
import type { DeskItem, ItemKind, Mat, PlacedItem, SubMat } from './types';
import './desk.css';

export interface DeskStageProps {
  desk: DeskController;
  /** Heading of the frame (page desks: "Desk · 42 objects on 3 mats"); W-04 has its PageHeader instead. */
  title?: ReactNode;
  /** The stage's accessible name. */
  stageLabel: string;
  /** The input hint under the stage (also the stage's description). */
  hint: string;
  /** "01 Lead", "Purchases". */
  matName: (m: Mat) => string;
  matAria: (m: Mat) => string;
  matCount: (m: Mat) => string;
  matClass?: (m: Mat) => string;
  /** The mat Select's placeholder ("Go to a phase…" / "Go to a mat…"). */
  matSelectPlaceholder: string;
  subLabel: (s: SubMat, m: Mat) => string;
  itemLabel: (i: PlacedItem) => string;
  /** The tooltip's two lines: the object's name, then kind · entity. */
  tipOf: (i: PlacedItem) => { title: string; meta: string };
  glowId?: string | null;
  litId?: string | null;
  selected: string | null;
  /** People (W-04): the label, the selected mat, and what activating a station does. */
  personLabel?: (p: DeskPerson, m: Mat) => string;
  selectedPerson?: string | null;
  onActivatePerson?: (matId: string) => void;
  /** More toolbar rows after the camera toolbar (W-04's light toolbar). */
  toolbarExtra?: ReactNode;
  aboveStage?: ReactNode;
  belowStage?: ReactNode;
  worldOverlay?: ReactNode;
  stageClass?: string;
  /** The compact bar's text under 768 px. */
  compactSummary: string;
  /** The legend's grouping line ("Sub-mats are grouped by status"). */
  grouping: string;
}

/** Kinds in the legend's order (only those on this desk are listed). */
const LEGEND_ORDER: readonly ItemKind[] = ['pages', 'page', 'phone', 'tablet', 'screen', 'folder', 'document', 'sheet', 'form', 'checklist', 'card', 'box', 'token', 'light', 'stack'];

/**
 * The desk stage (D-103, platform since D-106): a frame holding the toolbar, the zoomable desk, its minimap, tooltip,
 * legend and height handle. It goes full screen as a whole (Fullscreen API, or a fixed overlay where the API is
 * missing) and collapses to a bar under 768 px when the client asks for it.
 */
export function DeskStage(props: DeskStageProps) {
  const { desk } = props;
  const { t, lang } = useT();
  const { layout, refs, handlers, api } = desk;
  const moreLabel = (n: number) => t('desk.more', { n });
  const hintId = `desk-hint-${desk.code}`;
  const tipItem = desk.tip ? desk.byId.get(desk.tip.id) : undefined;
  const tipText = tipItem ? props.tipOf(tipItem) : null;
  const legendKinds = useMemo(() => {
    const first = new Map<ItemKind, DeskItem>();
    for (const it of layout.items) if (!first.has(it.kind)) first.set(it.kind, { ...it, plain: false });
    return LEGEND_ORDER.filter((k) => first.has(k)).map((k) => first.get(k)!);
  }, [layout.items]);

  const fs = desk.fullscreen !== 'off';
  const current = desk.sizeOf(desk.vh);

  if (!desk.showStage) {
    // Phones: the page stays usable; the desk is one tap away.
    return (
      <div ref={refs.frameRef} className="desk-frame desk-frame--compact" data-desk-frame={desk.code}>
        <p className="desk-compact__text">{props.compactSummary}</p>
        <Button size="sm" variant="secondary" icon="▦" aria-expanded={false} onClick={() => desk.setOpenSmall(true)}>
          {t('desk.show')}
        </Button>
      </div>
    );
  }

  return (
    <div ref={refs.frameRef} className={`desk-frame${fs ? ' is-fullscreen' : ''}${desk.fullscreen === 'css' ? ' is-fs-css' : ''}`} data-desk-frame={desk.code}>
      <div className="desk-toolbar" role="toolbar" aria-label={t('desk.toolbar')}>
        {props.title && <div className="desk-toolbar__title">{props.title}</div>}
        <span className="desk-toolbar__group desk-toolbar__group--camera">
        <div className="desk-toolbar__zoom">
          <Button size="sm" icon="−" aria-label={t('desk.zoomOut')} onClick={() => api.zoomBy(0.8)} />
          <span className="desk-toolbar__pct" aria-live="polite">
            <span className="visually-hidden">{t('desk.zoomLabel')} </span>
            {t('desk.zoomNow', { pct: desk.zoom })}
          </span>
          <Button size="sm" icon="+" aria-label={t('desk.zoomIn')} onClick={() => api.zoomBy(1.25)} />
        </div>
        <Button size="sm" onClick={() => api.fitAll()}>
          {t('desk.fit')}
        </Button>
        <Button size="sm" aria-pressed={desk.tilt} onClick={api.toggleTilt}>
          {desk.tilt ? t('desk.tiltOn') : t('desk.tiltOff')}
        </Button>
        {layout.mats.length > 1 && (
          <Select
            label={t('desk.matSelect')}
            hideLabel
            className="desk-toolbar__phase"
            value={desk.matSel}
            placeholder={props.matSelectPlaceholder}
            onChange={(e) => e.target.value && api.fitMat(e.target.value)}
            options={layout.mats.map((m) => ({ value: m.id, label: t('desk.phaseOption', { name: props.matName(m), n: m.count }) }))}
          />
        )}
        <Button size="sm" variant="ghost" onClick={api.reset}>
          {t('desk.reset')}
        </Button>
        </span>
        <span className="desk-toolbar__group desk-toolbar__group--view">
        <Button size="sm" variant="ghost" aria-pressed={desk.legendOpen} aria-expanded={desk.legendOpen} onClick={() => desk.setLegendOpen(!desk.legendOpen)}>
          {t('desk.legend')}
        </Button>
        <span className="desk-toolbar__sizes" role="group" aria-label={t('desk.size')}>
          {DESK_SIZES.map((s) => (
            <Button key={s} size="sm" variant={current === s ? 'primary' : 'secondary'} aria-pressed={current === s} aria-label={t(`desk.size.${s}Label`)} title={t(`desk.size.${s}Label`)} disabled={fs} onClick={() => desk.setHeight(SIZE_VH[s])}>
              {t(`desk.size.${s}`)}
            </Button>
          ))}
        </span>
        <Button size="sm" icon={fs ? '✕' : '⛶'} aria-pressed={fs} title={fs ? t('desk.fullscreenExit') : t('desk.fullscreen')} onClick={() => void desk.toggleFullscreen()}>
          <span className="desk-fs-label">{fs ? t('desk.fullscreenExit') : t('desk.fullscreen')}</span>
        </Button>
        <Button size="sm" variant="ghost" icon="⚙" aria-label={t('desk.settings')} aria-expanded={desk.settingsOpen} onClick={() => desk.setSettingsOpen(!desk.settingsOpen)} />
        {desk.compact && !fs && (
          <Button size="sm" variant="ghost" aria-expanded onClick={() => desk.setOpenSmall(false)}>
            {t('desk.hide')}
          </Button>
        )}
        </span>
      </div>
      {desk.settingsOpen && (
        <div className="desk-panel desk-panel--settings" role="group" aria-label={t('desk.settingsTitle')}>
          <Checkbox label={t('desk.wheelZoom')} hint={t('desk.wheelZoomHint')} checked={desk.wheelZoom} onChange={(e) => desk.toggleWheelZoom(e.target.checked)} />
          <Button size="sm" variant="ghost" onClick={() => desk.setSettingsOpen(false)}>
            {t('desk.close')}
          </Button>
        </div>
      )}
      {props.toolbarExtra}
      {props.aboveStage}

      <div ref={refs.boxRef} className="desk-stagebox" style={fs ? undefined : { height: `${desk.vh}dvh` }}>
        <div
          ref={refs.stageRef}
          className={`desk-stage${desk.tilt ? ' is-tilted' : ''}${props.stageClass ? ` ${props.stageClass}` : ''}`}
          tabIndex={0}
          role="region"
          aria-roledescription={t('desk.roledescription')}
          aria-label={props.stageLabel}
          aria-describedby={hintId}
          style={{ perspective: `${desk.perspective}px` }}
          onKeyDown={handlers.onKeyDown}
          onKeyUp={handlers.onKeyUp}
          onPointerDown={handlers.onPointerDown}
          onPointerMove={handlers.onPointerMove}
          onPointerUp={handlers.onPointerEnd}
          onPointerCancel={handlers.onPointerEnd}
          onDoubleClick={handlers.onDoubleClick}
          onClickCapture={handlers.onClickCapture}
          onScroll={(e) => {
            // Focus inside an overflow-hidden box scrolls it; the camera moves instead.
            e.currentTarget.scrollTop = 0;
            e.currentTarget.scrollLeft = 0;
          }}
        >
          <div className="desk-camera" style={{ transform: `rotateX(${desk.tilt ? TILT_DEG : 0}deg)` }}>
            <div ref={refs.worldRef} className="desk-world">
              <div ref={refs.zoomRef} className="desk-zoom" style={{ width: layout.width, height: layout.height }}>
                <div className="desk-slab" aria-hidden="true" style={{ left: -SLAB, top: -SLAB, width: layout.width + 2 * SLAB, height: layout.height + 2 * SLAB }} />
                {layout.mats.map((m) => (
                  <section key={m.id} className={`desk-mat${props.matClass ? props.matClass(m) : ''}`} style={{ left: m.x, top: m.y, width: m.w, height: m.h }} aria-label={props.matName(m)} data-desk-mat={m.id}>
                    <button type="button" className="desk-mat__label" onClick={() => api.fitMat(m.id)} aria-label={props.matAria(m)}>
                      <span className="desk-mat__num">{String(m.index + 1).padStart(2, '0')}</span>
                      <span className="desk-mat__name">{pick(m.label, lang)}</span>
                      <span className="desk-mat__count">{props.matCount(m)}</span>
                    </button>
                    {m.subs.map((s) => {
                      const name = props.subLabel(s, m);
                      const n = s.items.reduce((k, i) => k + (i.kind === 'stack' ? i.more ?? 0 : 1), 0);
                      return (
                        <div key={s.id} className={`desk-sub desk-sub--${s.group}`} data-desk-sub={s.id} style={{ left: s.x, top: s.y, width: s.w, height: s.h }}>
                          <button type="button" className="desk-sub__label" onClick={() => api.fitSub(s, m)} aria-label={t('desk.subLabel.aria', { name, n })}>
                            {name}
                            <span className="desk-sub__n">{n}</span>
                          </button>
                          {s.items.map((it) => (
                            <DeskObject
                              key={it.id}
                              item={it}
                              left={it.x}
                              top={it.y}
                              lang={lang}
                              label={props.itemLabel(it)}
                              selected={props.selected === it.id}
                              moreLabel={moreLabel}
                              onActivate={handlers.activateItem}
                              onFocusItem={handlers.onFocusItem}
                              onHint={handlers.onHint}
                              glow={props.glowId === it.id}
                              lit={props.litId === it.id}
                            />
                          ))}
                        </div>
                      );
                    })}
                    {m.person && desk.personByMat.get(m.id) && props.personLabel && props.onActivatePerson && (
                      <DeskPersonStation
                        person={desk.personByMat.get(m.id)!}
                        left={m.person.x}
                        top={m.person.y}
                        lang={lang}
                        label={props.personLabel(desk.personByMat.get(m.id)!, m)}
                        selected={props.selectedPerson === m.id}
                        onActivate={props.onActivatePerson}
                        onFocusPerson={handlers.onFocusPerson as (phase: string, e: FocusEvent<HTMLButtonElement>) => void}
                      />
                    )}
                  </section>
                ))}
                {props.worldOverlay}
              </div>
            </div>
          </div>
        </div>
        {tipText && desk.tip && (
          <div className="desk-tip" aria-hidden="true" style={{ left: Math.max(96, Math.min(desk.size.w - 96, desk.tip.x)), top: Math.max(8, desk.tip.y) }}>
            <span className="desk-tip__title">{tipText.title}</span>
            <span className="desk-tip__meta">{tipText.meta}</span>
          </div>
        )}
        {desk.size.w >= 480 && desk.size.h >= 200 && <DeskMinimap desk={desk} label={t('desk.minimap')} />}
        {desk.legendOpen && (
          <div className="desk-panel desk-panel--legend" role="dialog" aria-label={t('desk.legendTitle')}>
            <div className="desk-panel__head">
              <h2 className="desk-panel__title">{t('desk.legendTitle')}</h2>
              <Button size="sm" variant="ghost" icon="×" aria-label={t('desk.close')} onClick={() => desk.setLegendOpen(false)} />
            </div>
            <h3 className="desk-panel__h">{t('desk.legend.kinds', { n: legendKinds.length })}</h3>
            <ul className="desk-legend">
              {legendKinds.map((it) => (
                <li key={it.kind} className="desk-legend__row">
                  <span className="desk-legend__face" aria-hidden="true">
                    <DeskFace item={it} lang={lang} box={56} moreLabel={moreLabel} rows={3} />
                  </span>
                  <span className="desk-legend__text">
                    <strong>{t(`desk.kind.${it.kind}`)}</strong> {t(`desk.help.${it.kind}`)}
                  </span>
                </li>
              ))}
            </ul>
            <h3 className="desk-panel__h">{t('desk.legend.layout')}</h3>
            <p className="desk-panel__p">{t('desk.legend.mats', { grouping: props.grouping })}</p>
            <p className="desk-panel__p">{t('desk.legend.open')}</p>
            <h3 className="desk-panel__h">{t('desk.legend.inputs')}</h3>
            <p className="desk-panel__p">{t('desk.hint.engine')}</p>
          </div>
        )}
      </div>
      {!fs && <HeightHandle desk={desk} />}
      {props.belowStage}
      <p className="desk-hint" id={hintId}>
        {props.hint}
      </p>
    </div>
  );
}

/** The whole desk small, the viewport as a trapezoid (the tilt), click or drag to move there. Pointer only: keyboard users have the mat Select. */
function DeskMinimap({ desk, label }: { desk: DeskController; label: string }) {
  const { layout, api, refs } = desk;
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const pad = 32;
  const vb = { x: -pad, y: -pad, w: layout.width + 2 * pad, h: layout.height + 2 * pad };
  const at = (e: ReactPointerEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return null;
    // preserveAspectRatio meet: the drawing is centred in the box at the smaller scale.
    const s = Math.min(r.width / vb.w, r.height / vb.h);
    const ox = (r.width - vb.w * s) / 2;
    const oy = (r.height - vb.h * s) / 2;
    return { x: vb.x + (e.clientX - r.left - ox) / s, y: vb.y + (e.clientY - r.top - oy) / s };
  };
  return (
    <svg
      ref={svgRef}
      className="desk-minimap"
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      data-desk-minimap=""
      onPointerDown={(e) => {
        e.stopPropagation();
        const p = at(e);
        if (!p) return;
        dragging.current = true;
        svgRef.current?.setPointerCapture?.(e.pointerId);
        api.miniJump(p.x, p.y, 220);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const p = at(e);
        if (p) api.miniJump(p.x, p.y, 0);
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <title>{label}</title>
      <rect className="desk-minimap__desk" x={vb.x} y={vb.y} width={vb.w} height={vb.h} rx={24} />
      {layout.mats.map((m) => (
        <rect key={m.id} className="desk-minimap__mat" x={m.x} y={m.y} width={m.w} height={m.h} rx={10} />
      ))}
      <polygon ref={refs.miniViewRef} className="desk-minimap__view" points="0,0 0,0 0,0 0,0" />
    </svg>
  );
}

/** The bottom edge of the stage: drag to resize, or focus it and use the arrow keys (a window splitter, aria-valuenow in vh). */
function HeightHandle({ desk }: { desk: DeskController }) {
  const { t } = useT();
  const start = useRef<{ y: number; h: number } | null>(null);
  const box = () => desk.refs.boxRef.current;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 5;
    const map: Record<string, number> = { ArrowUp: -step, ArrowDown: step, PageUp: -15, PageDown: 15 };
    if (e.key === 'Home') desk.setHeight(25);
    else if (e.key === 'End') desk.setHeight(95);
    else if (map[e.key] !== undefined) desk.setHeight(desk.vh + map[e.key]);
    else return;
    e.preventDefault();
  };
  return (
    <div
      className="desk-handle"
      role="separator"
      aria-orientation="horizontal"
      tabIndex={0}
      aria-label={t('desk.height')}
      aria-valuemin={25}
      aria-valuemax={95}
      aria-valuenow={Math.round(desk.vh)}
      aria-valuetext={t('desk.heightValue', { vh: Math.round(desk.vh) })}
      title={t('desk.heightHint')}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        const b = box();
        if (!b) return;
        e.preventDefault();
        start.current = { y: e.clientY, h: b.getBoundingClientRect().height };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        const s = start.current;
        const b = box();
        if (!s || !b) return;
        // Live height on the element (no React render per move); committed on release.
        b.style.height = `${Math.max(0.25 * window.innerHeight, Math.min(0.95 * window.innerHeight, s.h + e.clientY - s.y))}px`;
      }}
      onPointerUp={(e) => {
        const s = start.current;
        start.current = null;
        const b = box();
        if (!s || !b) return;
        const px = Math.max(0.25 * window.innerHeight, Math.min(0.95 * window.innerHeight, s.h + e.clientY - s.y));
        b.style.height = `${desk.setHeight((px / window.innerHeight) * 100)}dvh`;
      }}
      onPointerCancel={() => {
        start.current = null;
        const b = box();
        if (b) b.style.height = `${desk.vh}dvh`;
      }}
    >
      <span className="desk-handle__grip" aria-hidden="true" />
    </div>
  );
}
