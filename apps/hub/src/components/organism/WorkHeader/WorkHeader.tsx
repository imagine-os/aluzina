import { useState, type ReactNode } from 'react';
import { cx } from '../../../design/cx';
import { useT } from '../../../i18n/I18nProvider';
import { activeFilterCount, DUE_WINDOWS, EMPTY_FILTERS, GROUP_BYS, PRIORITIES, SORT_BYS, STATUSES, WORK_VIEWS, type WorkFilters, type WorkPerson, type WorkView } from '../../../work/model';
import type { SavedView, ViewState } from '../../../work/views';
import { Badge } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { Checkbox } from '../../atom/Checkbox/Checkbox';
import { Input } from '../../atom/Input/Input';
import { Select } from '../../atom/Select/Select';
import { SearchField } from '../../molecule/SearchField/SearchField';
import { Tabs } from '../../molecule/Tabs/Tabs';
import { Modal } from '../Modal/Modal';
import './WorkHeader.css';

export interface WorkHeaderProps {
  /** Accessible name of the view switcher, e.g. the project name. */
  label: string;
  state: ViewState;
  onChange: (next: Partial<ViewState>) => void;
  /** Tasks visible in each view (tab counts). */
  counts: Partial<Record<WorkView, number>>;
  people: WorkPerson[];
  projects: { id: string; name: string }[];
  tags: string[];
  /** Hide the project filter on a single-project page. */
  showProjectFilter?: boolean;
  onAddTask?: () => void;
  savedViews?: SavedView[];
  onSaveView?: (name: string) => void;
  onApplyView?: (id: string) => void;
  onDeleteView?: (id: string) => void;
  /** PresenceBar or anything else shown at the end of the first row. */
  aside?: ReactNode;
}

/**
 * The toolbar every Work view shares (D-021): view tabs with counts, search, a filters panel (assignee,
 * status, priority, due window, tag, project), sort, group-by, saved views (D-025) and "Add task".
 * Everything is a library control >= 44 px; the tab list moves with arrow keys (Tabs).
 */
export function WorkHeader({ label, state, onChange, counts, people, projects, tags, showProjectFilter = true, onAddTask, savedViews = [], onSaveView, onApplyView, onDeleteView, aside }: WorkHeaderProps) {
  const { t } = useT();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');
  const active = activeFilterCount(state.filters);
  const setFilter = <K extends keyof WorkFilters>(k: K, v: WorkFilters[K]) => onChange({ filters: { ...state.filters, [k]: v } });

  const submitSave = () => {
    const n = name.trim();
    if (!n || !onSaveView) return;
    onSaveView(n);
    setName('');
    setSaving(false);
  };

  return (
    <div className="work-header" role="group" aria-label={label}>
      <div className="work-header__row">
        <Tabs label={t('core.work.views')} value={state.view} onChange={(v) => onChange({ view: v as WorkView })} tabs={WORK_VIEWS.map((v) => ({ id: v, label: t(`core.work.view.${v}`), count: counts[v] }))} />
        <div className="work-header__spacer" />
        {aside && <div className="work-header__aside">{aside}</div>}
        {onAddTask && (
          <Button variant="primary" icon="+" onClick={onAddTask}>
            {t('core.work.addTask')}
          </Button>
        )}
      </div>
      <div className="work-header__row work-header__tools">
        <SearchField value={state.filters.q} onChange={(q) => setFilter('q', q)} placeholder={t('core.work.search')} />
        <Button variant={active ? 'secondary' : 'ghost'} icon="⚲" aria-expanded={filtersOpen} aria-controls="work-filters" onClick={() => setFiltersOpen((o) => !o)}>
          {active ? t('core.work.filtersOn', { n: active }) : t('core.work.filters')}
        </Button>
        <Select className="work-header__select" label={t('core.work.sort')} hideLabel value={state.sort} onChange={(e) => onChange({ sort: e.target.value as ViewState['sort'] })} options={SORT_BYS.map((s) => ({ value: s, label: `${t('core.work.sort')}: ${t(`core.work.sort.${s}`)}` }))} />
        <Select className="work-header__select" label={t('core.work.group')} hideLabel value={state.groupBy} onChange={(e) => onChange({ groupBy: e.target.value as ViewState['groupBy'] })} options={GROUP_BYS.map((g) => ({ value: g, label: `${t('core.work.group')}: ${t(`core.work.group.${g}`)}` }))} />
        {onSaveView && (
          <div className="work-header__views">
            <Select
              className="work-header__select"
              label={t('core.work.savedViews')}
              hideLabel
              value={currentSaved}
              onChange={(e) => {
                setCurrentSaved(e.target.value);
                if (e.target.value && onApplyView) onApplyView(e.target.value);
              }}
              options={[{ value: '', label: savedViews.length ? t('core.work.savedViews') : t('core.work.currentView') }, ...savedViews.map((v) => ({ value: v.id, label: v.name }))]}
            />
            <Button variant="ghost" onClick={() => setSaving(true)}>
              {t('core.work.saveView')}
            </Button>
            {currentSaved && onDeleteView && (
              <Button
                variant="ghost"
                icon="×"
                aria-label={t('core.work.deleteView')}
                onClick={() => {
                  onDeleteView(currentSaved);
                  setCurrentSaved('');
                }}
              />
            )}
          </div>
        )}
      </div>
      <div id="work-filters" className={cx('work-header__filters', !filtersOpen && 'work-header__filters--closed')} role="group" aria-label={t('core.work.filters')} hidden={!filtersOpen}>
        <Select className="work-header__select" label={t('core.work.filter.assignee')} value={state.filters.assignee} onChange={(e) => setFilter('assignee', e.target.value)} options={[{ value: '', label: t('core.work.filter.any') }, ...people.map((p) => ({ value: p.id, label: p.name }))]} />
        <Select className="work-header__select" label={t('core.work.filter.status')} value={state.filters.status} onChange={(e) => setFilter('status', e.target.value as WorkFilters['status'])} options={[{ value: '', label: t('core.work.filter.any') }, ...STATUSES.map((s) => ({ value: s, label: t(`core.status.${s}`) }))]} />
        <Select className="work-header__select" label={t('core.work.filter.priority')} value={state.filters.priority} onChange={(e) => setFilter('priority', e.target.value as WorkFilters['priority'])} options={[{ value: '', label: t('core.work.filter.any') }, ...PRIORITIES.map((p) => ({ value: p, label: t(`core.priority.${p}`) }))]} />
        <Select className="work-header__select" label={t('core.work.filter.due')} value={state.filters.due} onChange={(e) => setFilter('due', e.target.value as WorkFilters['due'])} options={[{ value: '', label: t('core.work.filter.any') }, ...DUE_WINDOWS.map((w) => ({ value: w, label: t(`core.work.due.${w}`) }))]} />
        <Select className="work-header__select" label={t('core.work.filter.tag')} value={state.filters.tag} onChange={(e) => setFilter('tag', e.target.value)} options={[{ value: '', label: t('core.work.filter.any') }, ...tags.map((g) => ({ value: g, label: g }))]} />
        {showProjectFilter && (
          <Select className="work-header__select" label={t('core.work.filter.project')} value={state.filters.project} onChange={(e) => setFilter('project', e.target.value)} options={[{ value: '', label: t('core.work.filter.any') }, ...projects.map((p) => ({ value: p.id, label: p.name })), { value: 'none', label: t('core.work.noProject') }]} />
        )}
        <Checkbox label={t('core.work.filter.showDone')} checked={state.filters.showDone} onChange={(e) => setFilter('showDone', e.target.checked)} />
        {active > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange({ filters: { ...EMPTY_FILTERS, q: state.filters.q } })}>
            {t('core.work.filter.clear')}
          </Button>
        )}
        {active > 0 && <Badge tone="accent">{active}</Badge>}
      </div>
      <Modal
        open={saving}
        onClose={() => setSaving(false)}
        title={t('core.work.saveViewTitle')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSaving(false)}>
              {t('core.work.cancel')}
            </Button>
            <Button variant="primary" onClick={submitSave} disabled={!name.trim()}>
              {t('core.work.saveView')}
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitSave();
          }}
        >
          <Input label={t('core.work.saveViewName')} value={name} onChange={(e) => setName(e.target.value)} hint={t('core.work.saveViewHint')} autoFocus />
        </form>
      </Modal>
    </div>
  );
}
