import type { ReactNode } from 'react';
import { cx } from '../../../design/cx';
import { useT } from '../../../i18n/I18nProvider';
import { Badge, type Tone } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import './Kanban.css';

export interface KanbanColumn {
  id: string;
  title: string;
  tone?: Tone;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  subtitle?: string;
  meta?: ReactNode;
}

export interface KanbanProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  /** Board name. */
  label: string;
  /** Called from the move buttons (keyboard and touch friendly; there is no drag). */
  onMove?: (cardId: string, toColumnId: string) => void;
  onActivate?: (card: KanbanCard) => void;
}

/** Columns of cards with explicit "move" buttons instead of drag (P-03): everything works by keyboard, touch, pen and d-pad. */
export function Kanban({ columns, cards, label, onMove, onActivate }: KanbanProps) {
  const { t } = useT();
  return (
    <div className="kanban" role="group" aria-label={label}>
      {columns.map((col, ci) => {
        const items = cards.filter((c) => c.columnId === col.id);
        const prev = columns[ci - 1];
        const next = columns[ci + 1];
        return (
          <section key={col.id} className="kanban__col" aria-labelledby={`kcol-${col.id}`}>
            <header className="kanban__head">
              <h3 id={`kcol-${col.id}`} className="kanban__title">
                {col.title}
              </h3>
              <Badge tone={col.tone ?? 'neutral'}>{items.length}</Badge>
            </header>
            <ul className="kanban__list">
              {items.length === 0 && <li className="kanban__empty">{t('core.kanban.empty')}</li>}
              {items.map((card) => (
                <li key={card.id} className={cx('kanban__card')}>
                  {onActivate ? (
                    <button type="button" className="kanban__card-main kanban__card-main--btn" onClick={() => onActivate(card)}>
                      <span className="kanban__card-title">{card.title}</span>
                      {card.subtitle && <span className="kanban__card-sub">{card.subtitle}</span>}
                    </button>
                  ) : (
                    <div className="kanban__card-main">
                      <span className="kanban__card-title">{card.title}</span>
                      {card.subtitle && <span className="kanban__card-sub">{card.subtitle}</span>}
                    </div>
                  )}
                  {(card.meta || onMove) && (
                    <div className="kanban__card-foot">
                      <span className="kanban__card-meta">{card.meta}</span>
                      {onMove && (
                        <span className="kanban__moves">
                          <Button size="sm" variant="ghost" icon="◀" aria-label={t('core.kanban.moveTo', { title: card.title, column: prev?.title ?? '' })} disabled={!prev} onClick={() => prev && onMove(card.id, prev.id)} />
                          <Button size="sm" variant="ghost" icon="▶" aria-label={t('core.kanban.moveTo', { title: card.title, column: next?.title ?? '' })} disabled={!next} onClick={() => next && onMove(card.id, next.id)} />
                        </span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
