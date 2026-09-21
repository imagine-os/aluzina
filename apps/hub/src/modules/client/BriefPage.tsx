import { useMemo, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { Button } from '../../components/atom/Button/Button';
import { Select } from '../../components/atom/Select/Select';
import { Skeleton } from '../../components/atom/Skeleton/Skeleton';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { useData } from '../../data/DataContext';
import { checkKey, isGrouped, phaseById, pick, type PhaseGroup } from '../../domain';
import { useT } from '../../i18n/I18nProvider';
import { briefSpec } from './specs';
import './client.css';
import { useMyProjects } from './useMyProjects';

/** Service 01 phase 2 of the playbook: USER / SPACE / AESTHETIC DIRECTION / EXPECTATION. */
const BRIEF_PHASE_ID = '01-2';

/** The brief questions with the `engagements.brief` key each answer is stored under. */
function briefGroups(): { group: PhaseGroup; keys: string[] }[] {
  const found = phaseById(BRIEF_PHASE_ID);
  if (!found || !isGrouped(found.phase.items)) return [];
  let index = 0;
  return found.phase.items.map((group) => ({ group, keys: group.items.map(() => checkKey(BRIEF_PHASE_ID, index++)) }));
}

/** C-06: the strategic brief the client fills in their own time; the answers live on their engagement. */
export function BriefPage() {
  const { t, lang } = useT();
  const data = useData();
  const { mine, loading } = useMyProjects();
  const [selected, setSelected] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>({});

  const groups = useMemo(briefGroups, []);
  const current = mine.find((m) => m.project.id === selected) ?? mine[0];
  const engagement = current?.engagement ?? null;
  const stored = engagement?.brief ?? {};

  const valueOf = (key: string) => draft[key] ?? stored[key] ?? '';
  const allKeys = groups.flatMap((g) => g.keys);
  const answered = allKeys.filter((k) => valueOf(k).trim().length > 0).length;

  const save = async (projectId: string) => {
    const target = mine.find((m) => m.project.id === projectId);
    if (!target?.engagement) return `no engagement for ${projectId}`;
    await data.update(
      'engagements',
      target.engagement.id,
      { brief: { ...target.engagement.brief, ...draft } },
      { basedOn: target.engagement.updated_at },
    );
    toast(t('client.brief.saved'));
    return `brief saved for ${projectId}`;
  };

  useRegisterActions({
    'client.saveBrief': ({ project }) => save(String(project ?? current?.project.id ?? '')),
    'client.selectProject': ({ project }) => {
      const id = String(project ?? '');
      if (!mine.some((m) => m.project.id === id)) return `unknown project ${id}`;
      setSelected(id);
      setDraft({});
      return `selected ${id}`;
    },
  });

  return (
    <div className="client-page">
      <PageHeader
        code={briefSpec.code}
        title={t('client.brief.title')}
        subtitle={engagement ? t('client.brief.answered', { done: answered, total: allKeys.length }) : t('client.brief.desc')}
      />

      {loading && <Skeleton lines={4} />}

      {!loading && mine.length === 0 && <EmptyState title={t('client.common.empty')} description={t('client.common.emptyDesc')} glyph="◇" />}

      {current && mine.length > 1 && (
        <Card title={t('client.common.selectProject')}>
          <Select
            label={t('client.common.selectProject')}
            hideLabel
            value={current.project.id}
            onChange={(e) => {
              setSelected(e.target.value);
              setDraft({});
            }}
            options={mine.map((m) => ({ value: m.project.id, label: m.project.name }))}
          />
        </Card>
      )}

      {current && !engagement && <EmptyState title={t('client.brief.noEngagement')} description={t('client.brief.noEngagementDesc')} glyph="✎" />}

      {current && engagement && (
        <form
          className="client-page"
          onSubmit={(e) => {
            e.preventDefault();
            void save(current.project.id);
          }}
        >
          <p className="client-note">{t('client.brief.intro')}</p>
          {groups.map(({ group, keys }) => (
            <Card key={pick(group.group, 'en')} title={pick(group.group, lang)}>
              <div className="client-form">
                {group.items.map((item, i) => (
                  <Textarea
                    key={keys[i]}
                    label={pick(item, lang)}
                    rows={2}
                    value={valueOf(keys[i])}
                    onChange={(e) => setDraft((d) => ({ ...d, [keys[i]]: e.target.value }))}
                  />
                ))}
              </div>
            </Card>
          ))}
          <div className="client-row">
            <Button variant="primary" type="submit">
              {t('client.brief.save')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
