import { useEffect, useState } from 'react';
import { useCan } from '../../auth/SessionProvider';
import { demoUserById } from '../../auth/demoUsers';
import { Button } from '../../components/atom/Button/Button';
import { Checkbox } from '../../components/atom/Checkbox/Checkbox';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { useData, useTable } from '../../data/DataContext';
import type { ConsistencyCheck } from '../../data/schema';
import { useT } from '../../i18n/I18nProvider';
import { checksSpec } from './specs';
import { useProjectIndex } from './useProjectIndex';
import './studio.css';

export function ChecksPage() {
  const { t } = useT();
  const { rows: checks, loading } = useTable('consistencyChecks', { orderBy: 'title' });

  return (
    <>
      <PageHeader
        code={checksSpec.code}
        title={t('studio.checks.title')}
        subtitle={t('studio.checks.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.checks.title') }]}
        actions={
          <Placeholder what={t('studio.checks.newWhat')}>
            <Button variant="primary">{t('studio.checks.new')}</Button>
          </Placeholder>
        }
      />

      <div className="studio-stats">
        <StatTile label={t('studio.checks.stat.pending')} value={checks.filter((c) => c.status === 'pending').length} tone="neutral" glyph="✓" />
        <StatTile label={t('studio.checks.stat.issues')} value={checks.filter((c) => c.status === 'issues').length} tone="warning" />
        <StatTile label={t('studio.checks.stat.passed')} value={checks.filter((c) => c.status === 'passed').length} tone="success" />
      </div>

      {!loading && checks.length === 0 && <EmptyState title={t('studio.checks.empty')} description={t('studio.checks.emptyDesc')} glyph="✓" />}

      <div className="studio-stack">
        {checks.map((c) => (
          <CheckCard key={c.id} check={c} />
        ))}
      </div>
    </>
  );
}

function CheckCard({ check }: { check: ConsistencyCheck }) {
  const { t } = useT();
  const can = useCan();
  const data = useData();
  const { nameOf } = useProjectIndex();
  const [notes, setNotes] = useState(check.notes);
  const writable = can('projects.check');

  // Follow the stored notes when another writer changes them, without stamping on a local edit.
  useEffect(() => {
    setNotes(check.notes);
  }, [check.notes]);

  const ticked = check.items.filter((i) => i.ok).length;
  const allTicked = check.items.length > 0 && ticked === check.items.length;

  const toggleItem = async (index: number, ok: boolean) => {
    const items = check.items.map((item, i) => (i === index ? { ...item, ok } : item));
    await data.update('consistencyChecks', check.id, { items });
  };

  const pass = async () => {
    await data.update('consistencyChecks', check.id, { status: 'passed' });
    await data.update('projects', check.projectId, { approval: 'awaiting-founder' });
    toast(t('studio.checks.passed'));
  };

  const reportIssues = async () => {
    await data.update('consistencyChecks', check.id, { status: 'issues' });
    await data.update('projects', check.projectId, { approval: 'in-check' });
    toast(t('studio.checks.reported'));
  };

  const saveNotes = async () => {
    await data.update('consistencyChecks', check.id, { notes });
    toast(t('studio.saved'));
  };

  return (
    <Card
      title={check.title}
      subtitle={`${nameOf(check.projectId)} · ${t('studio.checks.checkedBy')}: ${demoUserById(check.checkedById)?.name ?? check.checkedById}`}
      actions={<StatusPill status={check.status} />}
      footer={
        <div className="studio-foot">
          {allTicked ? <span className="studio-foot__spacer" /> : <p className="studio-hint">{t('studio.checks.passHint')}</p>}
          {writable && (
            <>
              <Button onClick={reportIssues}>{t('studio.checks.issues')}</Button>
              <Button variant="primary" onClick={pass} disabled={!allTicked}>
                {t('studio.checks.pass')}
              </Button>
            </>
          )}
        </div>
      }
    >
      <ul className="studio-items">
        {check.items.map((item, i) => (
          <li key={item.label}>
            <Checkbox label={item.label} checked={item.ok} disabled={!writable} onChange={(e) => toggleItem(i, e.target.checked)} />
          </li>
        ))}
      </ul>
      <p className="studio-progress">{t('studio.checks.progress', { ok: ticked, total: check.items.length })}</p>
      <Textarea label={t('studio.checks.notes')} hint={t('studio.checks.notesHint')} rows={2} value={notes} disabled={!writable} onChange={(e) => setNotes(e.target.value)} />
      <div className="studio-foot">
        <Placeholder what={t('studio.checks.addItemWhat')}>
          <Button size="sm">{t('studio.checks.addItem')}</Button>
        </Placeholder>
        <span className="studio-foot__spacer" />
        {writable && (
          <Button size="sm" onClick={saveNotes} disabled={notes === check.notes}>
            {t('studio.checks.saveNotes')}
          </Button>
        )}
      </div>
    </Card>
  );
}
