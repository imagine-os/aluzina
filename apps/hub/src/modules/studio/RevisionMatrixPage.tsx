import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { useCan, useSession } from '../../auth/SessionProvider';
import { demoUserById } from '../../auth/demoUsers';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { KeyValue } from '../../components/molecule/KeyValue/KeyValue';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { StatTile } from '../../components/molecule/StatTile/StatTile';
import { DataTable } from '../../components/organism/DataTable/DataTable';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useData, useTable } from '../../data/DataContext';
import type { RevisionItem, RevisionSource } from '../../data/schema';
import { type ValidationStatusId, pick, serviceByCode, VALIDATION_STATUSES } from '../../domain';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import { todayIso } from '../../work/model';
import { revisionsSpec } from './specs';
import './studio.css';

const SOURCES: RevisionSource[] = ['client', 'studio', 'founder'];

/** Who is writing the row: the founder signs as the founder, the client as the client, everyone else as the studio. */
function sourceForRole(role: string): RevisionSource {
  if (role === 'founder') return 'founder';
  if (role === 'client') return 'client';
  return 'studio';
}

/** RFC 4180 cell: quotes doubled, the whole cell quoted whenever it could break the row. */
function csvCell(value: string): string {
  return /[",\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * S-11 Revision matrix (`/studio/revisions`): the single revision matrix of stage 10 of service 03 (G-05) —
 * every comment from the client, the studio and the founder lives in one table per project, with its
 * validation status, never scattered through WhatsApp.
 */
export function RevisionMatrixPage() {
  const { t, lang } = useT();
  const can = useCan();
  const data = useData();
  const { user, role } = useSession();

  const { rows: projects, loading: loadingProjects } = useTable('projects', { orderBy: 'name' });
  const { rows: engagements } = useTable('engagements');
  const { rows: allItems, loading: loadingItems } = useTable('revisionItems', { orderBy: 'created_at' });
  const loading = loadingProjects || loadingItems;
  const writable = can('revisionMatrix.write');

  /** Projects that have a matrix or an engagement that could open one. */
  const tracked = useMemo(
    () => projects.filter((p) => allItems.some((r) => r.projectId === p.id) || engagements.some((e) => e.projectId === p.id)),
    [projects, allItems, engagements],
  );

  const [projectId, setProjectId] = useState('');
  const current = tracked.find((p) => p.id === projectId) ?? tracked.find((p) => allItems.some((r) => r.projectId === p.id)) ?? tracked[0];

  useEffect(() => {
    if (current && current.id !== projectId) setProjectId(current.id);
  }, [current, projectId]);

  const engagement = useMemo(() => {
    const mine = engagements.filter((e) => e.projectId === current?.id);
    return mine.find((e) => e.status === 'started' || e.status === 'in-progress') ?? mine[mine.length - 1];
  }, [engagements, current]);
  const service = serviceByCode(engagement?.serviceCode);

  const items = useMemo(() => allItems.filter((r) => r.projectId === current?.id), [allItems, current]);

  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [draftComment, setDraftComment] = useState('');
  const [formStage, setFormStage] = useState('');
  const [formItem, setFormItem] = useState('');
  const [formComment, setFormComment] = useState('');

  const open = openId ? (items.find((r) => r.id === openId) ?? null) : null;
  useEffect(() => setDraftComment(open?.comment ?? ''), [open?.id, open?.comment]);

  /** The stage Select offers the phases of the project's service, plus any label already used on the matrix. */
  const stageOptions = useMemo(() => {
    const fromService = (service?.phases ?? []).map((p) => `${p.number}. ${pick(p.title, lang)}`);
    const used = [...new Set(items.map((r) => r.stage))];
    return [...new Set([...used, ...fromService])].map((s) => ({ value: s, label: s }));
  }, [service, items, lang]);

  const shown = useMemo(
    () => items.filter((r) => (!stage || r.stage === stage) && (!status || r.status === status) && (!source || r.source === source)),
    [items, stage, status, source],
  );

  const counts = useMemo(
    () => ({
      open: items.filter((r) => r.status === 'revision').length,
      approved: items.filter((r) => r.status === 'approved').length,
      adjusted: items.filter((r) => r.status === 'approved-with-adjustments').length,
    }),
    [items],
  );

  const allDecided = items.length > 0 && items.every((r) => r.status !== 'revision');
  const readyForClient = allDecided && (current?.approval === 'awaiting-founder' || current?.approval === 'approved');

  const setFilters = useCallback((next: { stage?: string; status?: string; source?: string }) => {
    if (next.stage !== undefined) setStage(next.stage);
    if (next.status !== undefined) setStatus(next.status);
    if (next.source !== undefined) setSource(next.source);
    return next;
  }, []);

  const addItem = useCallback(
    async (row: { stage: string; item: string; comment: string }) => {
      if (!current) return t('studio.revisions.noProject');
      if (!row.item.trim()) return t('studio.revisions.itemRequired');
      const created = await data.create('revisionItems', {
        projectId: current.id,
        engagementId: engagement?.id ?? null,
        stage: row.stage.trim() || stageOptions[0]?.value || t('studio.revisions.unfiledStage'),
        item: row.item.trim(),
        comment: row.comment.trim(),
        authorId: user.id,
        source: sourceForRole(role),
        status: 'revision',
        decidedAt: null,
      });
      toast(t('studio.revisions.added'));
      setFormItem('');
      setFormComment('');
      return created.id;
    },
    [data, current, engagement, stageOptions, user.id, role, t],
  );

  const editItem = useCallback(
    async (id: string, comment: string) => {
      const row = items.find((r) => r.id === id);
      if (!row) return t('studio.revisions.unknownItem');
      await data.update('revisionItems', id, { comment }, { basedOn: row.updated_at });
      toast(t('studio.saved'));
      return id;
    },
    [data, items, t],
  );

  const setItemStatus = useCallback(
    async (id: string, next: ValidationStatusId) => {
      const row = items.find((r) => r.id === id);
      if (!row) return t('studio.revisions.unknownItem');
      await data.update('revisionItems', id, { status: next, decidedAt: next === 'revision' ? null : todayIso() }, { basedOn: row.updated_at });
      toast(t('studio.saved'));
      return `${id} → ${next}`;
    },
    [data, items, t],
  );

  const exportMatrix = useCallback(() => {
    const header = [t('studio.col.stage'), t('studio.col.item'), t('studio.col.comment'), t('studio.col.source'), t('studio.col.author'), t('studio.col.status'), t('studio.col.decidedAt')];
    const lines = [header, ...shown.map((r) => [r.stage, r.item, r.comment, t(`studio.revisions.source.${r.source}`), demoUserById(r.authorId)?.name ?? r.authorId, t(`core.status.${r.status}`), r.decidedAt ?? ''])];
    const csv = `﻿${lines.map((cells) => cells.map(csvCell).join(',')).join('\r\n')}\r\n`;
    const name = `revision-matrix-${(current?.name ?? 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    toast(t('studio.revisions.exported'));
    return name;
  }, [shown, current, t]);

  useRegisterActions({
    // Declared, shown as a Placeholder, registered so the bus answers honestly instead of `not-live` (D-047).
    'studio.sendMatrixToClient': () => 'not wired yet: sending the matrix to the client arrives with the messages integration (C-03 reads the same rows today)',
    'studio.selectRevisionProject': ({ project: p }) => {
      const id = String(p);
      if (!tracked.some((x) => x.id === id)) return t('studio.revisions.noProject');
      setProjectId(id);
      return id;
    },
    'studio.filterRevisions': (params) =>
      setFilters({
        stage: params.stage === undefined ? undefined : String(params.stage),
        status: params.status === undefined ? undefined : String(params.status),
        source: params.source === undefined ? undefined : String(params.source),
      }),
    'studio.addRevisionItem': writable
      ? ({ stage: s, item, comment }) => addItem({ stage: s === undefined ? formStage : String(s), item: String(item ?? ''), comment: String(comment ?? '') })
      : false,
    'studio.editRevisionItem': writable ? ({ item, comment }) => editItem(String(item), String(comment ?? '')) : false,
    'studio.setRevisionStatus': writable ? ({ item, status: s }) => setItemStatus(String(item), String(s) as ValidationStatusId) : false,
    'studio.exportRevisionMatrix': () => exportMatrix(),
  });

  return (
    <>
      <PageHeader
        code={revisionsSpec.code}
        title={t('studio.revisions.title')}
        subtitle={t('studio.revisions.subtitle')}
        breadcrumb={[{ label: t('core.portal.studio'), to: '/studio' }, { label: t('studio.revisions.title') }]}
        actions={
          <>
            <Placeholder what={t('studio.revisions.sendWhat')}>
              <Button>{t('studio.revisions.send')}</Button>
            </Placeholder>
            <Button variant="primary" onClick={exportMatrix} disabled={shown.length === 0}>
              {t('studio.revisions.export')}
            </Button>
          </>
        }
      />

      <div className="studio-filters">
        <FilterBar
          onClear={stage || status || source ? () => setFilters({ stage: '', status: '', source: '' }) : undefined}
          summary={t('studio.filter.summary', { shown: shown.length, total: items.length })}
        >
          <Select
            label={t('studio.col.project')}
            hideLabel
            value={current?.id ?? ''}
            onChange={(e) => setProjectId(e.target.value)}
            options={tracked.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Select
            label={t('studio.col.stage')}
            hideLabel
            value={stage}
            onChange={(e) => setFilters({ stage: e.target.value })}
            placeholder={t('studio.revisions.allStages')}
            options={[...new Set(items.map((r) => r.stage))].map((s) => ({ value: s, label: s }))}
          />
          <Select
            label={t('studio.col.status')}
            hideLabel
            value={status}
            onChange={(e) => setFilters({ status: e.target.value })}
            placeholder={t('studio.filter.allStatuses')}
            options={VALIDATION_STATUSES.map((s) => ({ value: s.id, label: pick(s.label, lang) }))}
          />
          <Select
            label={t('studio.col.source')}
            hideLabel
            value={source}
            onChange={(e) => setFilters({ source: e.target.value })}
            placeholder={t('studio.revisions.allSources')}
            options={SOURCES.map((s) => ({ value: s, label: t(`studio.revisions.source.${s}`) }))}
          />
        </FilterBar>
      </div>

      <div className="studio-stats">
        <StatTile label={t('studio.revisions.stat.open')} value={counts.open} hint={t('studio.revisions.stat.openHint')} tone="danger" glyph="◑" />
        <StatTile label={t('studio.revisions.stat.approved')} value={counts.approved} tone="success" glyph="✓" />
        <StatTile label={t('studio.revisions.stat.adjusted')} value={counts.adjusted} tone="warning" glyph="◇" />
      </div>

      {readyForClient && (
        <Card raised title={t('studio.revisions.readyTitle')} actions={<Badge tone="success">G-03</Badge>}>
          <p className="studio-note">{t('studio.revisions.readyDesc')}</p>
        </Card>
      )}

      <div className="studio-stack">
        <Card title={t('studio.revisions.matrix')} subtitle={current ? `${current.name} · ${t('studio.revisions.oneMatrix')}` : undefined}>
          <DataTable<RevisionItem>
            caption={t('studio.revisions.matrix')}
            rows={shown}
            rowKey={(r) => r.id}
            loading={loading}
            emptyTitle={t('studio.revisions.empty')}
            emptyDescription={t('studio.revisions.emptyDesc')}
            onRowActivate={(r) => setOpenId(r.id)}
            columns={[
              { key: 'stage', header: t('studio.col.stage'), sortable: true },
              { key: 'item', header: t('studio.col.item'), sortable: true },
              { key: 'comment', header: t('studio.col.comment') },
              { key: 'source', header: t('studio.col.source'), render: (r) => <Badge tone={r.source === 'client' ? 'info' : r.source === 'founder' ? 'accent' : 'neutral'}>{t(`studio.revisions.source.${r.source}`)}</Badge> },
              { key: 'authorId', header: t('studio.col.author'), render: (r) => demoUserById(r.authorId)?.name ?? r.authorId },
              { key: 'status', header: t('studio.col.status'), render: (r) => <StatusPill status={r.status} /> },
              { key: 'decidedAt', header: t('studio.col.decidedAt'), align: 'end', sortable: true, render: (r) => (r.decidedAt ? formatDate(r.decidedAt, lang) : t('studio.revisions.undecided')) },
            ]}
            rowActions={[{ id: 'open', label: t('studio.home.open'), onClick: (r) => setOpenId(r.id) }]}
          />
        </Card>

        {writable && current && (
          <Card title={t('studio.revisions.addTitle')} subtitle={t('studio.revisions.addSub')}>
            <form
              className="studio-form"
              onSubmit={(e) => {
                e.preventDefault();
                void addItem({ stage: formStage, item: formItem, comment: formComment });
              }}
            >
              <Select
                label={t('studio.col.stage')}
                value={formStage}
                onChange={(e) => setFormStage(e.target.value)}
                placeholder={t('studio.revisions.pickStage')}
                options={stageOptions}
              />
              <Input label={t('studio.col.item')} value={formItem} onChange={(e) => setFormItem(e.target.value)} required placeholder={t('studio.revisions.itemPlaceholder')} />
              <Textarea label={t('studio.col.comment')} rows={2} value={formComment} onChange={(e) => setFormComment(e.target.value)} placeholder={t('studio.revisions.commentPlaceholder')} />
              <div className="studio-foot">
                <p className="studio-hint">{t('studio.revisions.signedAs', { source: t(`studio.revisions.source.${sourceForRole(role)}`) })}</p>
                <Button type="submit" variant="primary" disabled={!formItem.trim()}>
                  {t('studio.revisions.add')}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      {!loading && tracked.length === 0 && <EmptyState title={t('studio.revisions.empty')} description={t('studio.revisions.emptyDesc')} />}

      <Drawer open={open !== null} onClose={() => setOpenId(null)} title={open?.item ?? t('studio.revisions.matrix')}>
        {open && (
          <div className="studio-detail">
            <KeyValue
              columns={2}
              items={[
                { key: t('studio.col.stage'), value: open.stage },
                { key: t('studio.col.source'), value: t(`studio.revisions.source.${open.source}`) },
                { key: t('studio.col.author'), value: demoUserById(open.authorId)?.name ?? open.authorId },
                { key: t('studio.col.status'), value: <StatusPill status={open.status} /> },
                { key: t('studio.col.decidedAt'), value: open.decidedAt ? formatDate(open.decidedAt, lang) : t('studio.revisions.undecided') },
              ]}
            />
            <Textarea label={t('studio.col.comment')} rows={4} value={draftComment} disabled={!writable} onChange={(e) => setDraftComment(e.target.value)} />
            {writable && (
              <>
                <div className="studio-foot">
                  <Button onClick={() => editItem(open.id, draftComment)} disabled={draftComment === open.comment}>
                    {t('studio.revisions.saveComment')}
                  </Button>
                </div>
                <fieldset className="studio-fieldset">
                  <legend className="studio-legend">{t('studio.revisions.setStatus')}</legend>
                  <div className="studio-foot">
                    {VALIDATION_STATUSES.map((s) => (
                      <Button key={s.id} size="sm" variant={open.status === s.id ? 'primary' : 'secondary'} onClick={() => setItemStatus(open.id, s.id)}>
                        {pick(s.label, lang)}
                      </Button>
                    ))}
                  </div>
                  <Button size="sm" onClick={() => setItemStatus(open.id, 'approved-with-adjustments')} disabled={open.status === 'approved-with-adjustments'}>
                    {t('studio.revisions.resolveAdjustment')}
                  </Button>
                </fieldset>
              </>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
