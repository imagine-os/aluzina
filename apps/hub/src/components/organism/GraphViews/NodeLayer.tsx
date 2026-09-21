import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { cx } from '../../../design/cx';
import type { Point } from './layouts';
import type { GraphViewLabels, ViewNode } from './types';

export interface NodeLayerProps {
  nodes: ViewNode[];
  /** Screen (container) coordinates per node key; the 3D view leaves this empty and moves the buttons itself. */
  positions: Map<string, Point>;
  neighbours: Map<string, string[]>;
  hops: Map<string, number>;
  focusKey: string | null;
  /** Node the drawing highlights; owned here so every view behaves the same. */
  active: string | null;
  onActive: (key: string | null) => void;
  /** Space on a node: re-centre the query on it. */
  onFocus: (key: string) => void;
  /** Enter, click, or the second tap on touch. */
  onOpen: (key: string) => void;
  /** Called whenever the active node changes by keyboard, so the camera / viewport follows. */
  onCentre: (key: string) => void;
  labels: GraphViewLabels;
  /** Set by the owner when the buttons are positioned imperatively (3D). */
  manualPositions?: boolean;
  layerRef?: (el: HTMLUListElement | null) => void;
}

/**
 * The one interactive layer of every gallery view (P-03, P-04). The drawing underneath is paint only: this
 * overlay carries the tab stop, the pointer targets (>= 44 px), the tooltip and the keyboard model, so a 3D
 * canvas and an SVG behave identically. Roving tabindex: the graph is one tab stop, arrows walk neighbours,
 * Enter opens, Space re-centres the query, Home returns to the focus node. Hover is never alone - the same
 * card shows on focus. On touch the first tap selects and centres, the second opens.
 */
export function NodeLayer({ nodes, positions, neighbours, hops, focusKey, active, onActive, onFocus, onOpen, onCentre, labels, manualPositions, layerRef }: NodeLayerProps) {
  const [tip, setTip] = useState<string | null>(null);
  const pointerKind = useRef<string>('mouse');
  const moveTo = useRef<string | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const order = nodes.map((n) => n.key);
  const current = active && order.includes(active) ? active : focusKey && order.includes(focusKey) ? focusKey : order[0] ?? null;
  const cycle = useRef(new Map<string, number>());

  useEffect(() => {
    if (!moveTo.current) return;
    const key = moveTo.current;
    moveTo.current = null;
    listRef.current?.querySelector<HTMLButtonElement>(`[data-node-key="${CSS.escape(key)}"]`)?.focus();
  });

  const go = (key: string) => {
    onActive(key);
    onCentre(key);
    setTip(key);
    moveTo.current = key;
  };

  const step = (key: string, dir: 1 | -1) => {
    const nb = neighbours.get(key) ?? [];
    if (nb.length) {
      const at = cycle.current.get(key) ?? -1;
      const next = (at + dir + nb.length) % nb.length;
      cycle.current.set(key, next);
      go(nb[next]);
      return;
    }
    const i = order.indexOf(key);
    go(order[(i + dir + order.length) % order.length]);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, key: string) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        onOpen(key);
        break;
      case ' ':
        e.preventDefault();
        onFocus(key);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        step(key, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        step(key, -1);
        break;
      case 'Home':
        e.preventDefault();
        if (focusKey && order.includes(focusKey)) go(focusKey);
        break;
    }
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    pointerKind.current = e.pointerType || 'mouse';
  };

  const activate = (key: string) => {
    if (pointerKind.current === 'touch' && key !== current) {
      onActive(key);
      onCentre(key);
      setTip(key);
      return;
    }
    onOpen(key);
  };

  const tipNode = tip ? nodes.find((n) => n.key === tip) : null;
  const tipPos = tip ? positions.get(tip) : undefined;

  return (
    <>
      <ul
        className="gview__layer"
        ref={(el) => {
          listRef.current = el;
          layerRef?.(el);
        }}
        aria-label={labels.nodeList}
      >
        {nodes.map((n) => {
          const p = positions.get(n.key);
          const isCurrent = n.key === current;
          return (
            <li key={n.key} className="gview__layer-item">
              <button
                type="button"
                data-node-key={n.key}
                className={cx('gview__hit', n.key === focusKey && 'gview__hit--focus', n.key === active && 'gview__hit--active')}
                style={manualPositions || !p ? undefined : { transform: `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)` }}
                tabIndex={isCurrent ? 0 : -1}
                aria-label={labels.node.replace('{label}', n.label).replace('{kind}', n.sub ?? n.kind).replace('{n}', String((neighbours.get(n.key) ?? []).length))}
                onPointerDown={onPointerDown}
                onClick={() => activate(n.key)}
                onKeyDown={(e) => onKey(e, n.key)}
                onFocus={() => {
                  onActive(n.key);
                  setTip(n.key);
                }}
                onBlur={() => setTip((k) => (k === n.key ? null : k))}
                onMouseEnter={() => setTip(n.key)}
                onMouseLeave={() => setTip((k) => (k === n.key ? null : k))}
              >
                <span className="visually-hidden">{n.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {tipNode && tipPos && (
        <div className="gview__tip" role="status" style={{ transform: `translate(${tipPos.x}px, ${tipPos.y}px)` }}>
          <b>{tipNode.label}</b>
          {tipNode.sub && <span className="gview__tip-sub">{tipNode.sub}</span>}
          <span className="gview__tip-meta">
            {labels.hops.replace('{n}', String(hops.get(tipNode.key) ?? 0))} · {labels.links.replace('{n}', String((neighbours.get(tipNode.key) ?? []).length))}
          </span>
        </div>
      )}
    </>
  );
}
