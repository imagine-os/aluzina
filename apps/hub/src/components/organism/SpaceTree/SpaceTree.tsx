import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../../design/cx';
import { useT } from '../../../i18n/I18nProvider';
import './SpaceTree.css';

export interface SpaceTreeNode {
  id: string;
  name: string;
  glyph: string;
  /** Space kind (area, topic, role, client, deliverable, tool, project, archive): sets the tone class. */
  kind: string;
  archived?: boolean;
  /** Posts filed here (shown as a count at the end of the row). */
  count?: number;
  children: SpaceTreeNode[];
}

export interface SpaceTreeProps {
  nodes: SpaceTreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Expanded node ids (controlled). */
  expanded: Record<string, boolean>;
  onToggle: (id: string, open: boolean) => void;
  /** Accessible name of the tree. */
  label: string;
}

interface Flat {
  node: SpaceTreeNode;
  level: number;
  parentId: string | null;
}

function flatten(nodes: SpaceTreeNode[], expanded: Record<string, boolean>, level = 1, parentId: string | null = null, out: Flat[] = []): Flat[] {
  for (const n of nodes) {
    out.push({ node: n, level, parentId });
    if (n.children.length && expanded[n.id]) flatten(n.children, expanded, level + 1, n.id, out);
  }
  return out;
}

/**
 * Unlimited-depth tree of spaces (K-01 / K-02, D-026) following the WAI-ARIA tree pattern with a roving
 * tabindex: one tab stop, ArrowUp / ArrowDown move, ArrowRight expands or enters, ArrowLeft collapses or
 * goes to the parent, Home / End jump, Enter / Space select, typing a letter jumps to the next match. Rows are
 * 44 px; the chevron is a pointer convenience (tabIndex -1) since the arrows already do the job (P-03).
 */
export function SpaceTree({ nodes, selectedId, onSelect, expanded, onToggle, label }: SpaceTreeProps) {
  const { t } = useT();
  const flat = flatten(nodes, expanded);
  const [focusId, setFocusId] = useState<string | null>(selectedId ?? flat[0]?.node.id ?? null);
  const ref = useRef<HTMLUListElement>(null);
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    if (selectedId) setFocusId(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!pendingFocus.current) return;
    const el = ref.current?.querySelector<HTMLElement>(`[data-id="${pendingFocus.current}"]`);
    el?.focus();
    pendingFocus.current = null;
  });

  const focusItem = (id: string) => {
    setFocusId(id);
    pendingFocus.current = id;
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>, f: Flat, i: number) => {
    const { node } = f;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (i < flat.length - 1) focusItem(flat[i + 1].node.id);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (i > 0) focusItem(flat[i - 1].node.id);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (node.children.length && !expanded[node.id]) onToggle(node.id, true);
        else if (node.children.length && flat[i + 1]) focusItem(flat[i + 1].node.id);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (node.children.length && expanded[node.id]) onToggle(node.id, false);
        else if (f.parentId) focusItem(f.parentId);
        break;
      case 'Home':
        e.preventDefault();
        if (flat[0]) focusItem(flat[0].node.id);
        break;
      case 'End':
        e.preventDefault();
        focusItem(flat[flat.length - 1].node.id);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(node.id);
        break;
      case '*':
        e.preventDefault();
        flat.filter((x) => x.level === f.level && x.node.children.length).forEach((x) => onToggle(x.node.id, true));
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const ch = e.key.toLowerCase();
          const order = [...flat.slice(i + 1), ...flat.slice(0, i + 1)];
          const hit = order.find((x) => x.node.name.toLowerCase().startsWith(ch));
          if (hit) {
            e.preventDefault();
            focusItem(hit.node.id);
          }
        }
    }
  };

  return (
    <ul className="stree" role="tree" aria-label={label} ref={ref}>
      {flat.map((f, i) => {
        const { node, level } = f;
        const hasChildren = node.children.length > 0;
        const open = Boolean(expanded[node.id]);
        const selected = node.id === selectedId;
        return (
          <li key={node.id} role="none">
            <div
              role="treeitem"
              data-id={node.id}
              tabIndex={focusId === node.id || (!focusId && i === 0) ? 0 : -1}
              aria-level={level}
              aria-expanded={hasChildren ? open : undefined}
              aria-selected={selected}
              aria-setsize={flat.filter((x) => x.parentId === f.parentId).length}
              className={cx('stree__item', `stree__item--${node.kind}`, selected && 'stree__item--selected', node.archived && 'stree__item--archived')}
              style={{ '--level': level - 1 } as React.CSSProperties}
              onClick={() => onSelect(node.id)}
              onFocus={() => setFocusId(node.id)}
              onKeyDown={(e) => onKey(e, f, i)}
            >
              {hasChildren ? (
                <button
                  type="button"
                  className="stree__chevron"
                  tabIndex={-1}
                  aria-label={t(open ? 'core.spaces.tree.collapse' : 'core.spaces.tree.expand', { name: node.name })}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(node.id, !open);
                  }}
                >
                  <span aria-hidden="true">{open ? '▾' : '▸'}</span>
                </button>
              ) : (
                <span className="stree__chevron stree__chevron--leaf" aria-hidden="true" />
              )}
              <span className="stree__glyph" aria-hidden="true">{node.glyph}</span>
              <span className="stree__name">{node.name}</span>
              {node.count !== undefined && node.count > 0 && (
                <span className="stree__count" aria-label={t('core.spaces.tree.posts', { n: node.count })}>
                  {node.count}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
