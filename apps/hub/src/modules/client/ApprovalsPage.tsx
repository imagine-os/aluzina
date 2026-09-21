import { useMemo, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { useCan, useSession } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Input } from '../../components/atom/Input/Input';
import { Select } from '../../components/atom/Select/Select';
import { Skeleton } from '../../components/atom/Skeleton/Skeleton';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { useData, useTable } from '../../data/DataContext';
import type { RevisionItem } from '../../data/schema';
import { pick, VALIDATION_STATUSES, type ValidationStatusId } from '../../domain';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './client.css';
import { approvalsSpec } from './specs';
import { useMyProjects, type MyProject } from './useMyProjects';

const today = () => new Date().toISOString().slice(0, 10);

function isValidationStatus(v: unknown): v is ValidationStatusId {
  return VALIDATION_STATUSES.some((s) => s.id === v);
}

/**
 * C-03: the client side of the single revision matrix (service 03 stage 10, G-05) and the approval gate
 * before execution (G-06). Every comment is a `revisionItems` row, never free text on the project.
 */
export function ApprovalsPage() {
  const { t, lang } = useT();
  const { user } = useSession();
  const can = useCan();
  const data = useData();
  const { mine, byId, projectIds, loading } = useMyProjects();
  const { rows: items } = useTable('revisionItems', { where: { projectId: projectIds }, orderBy: 'created_at' });

  const [formProject, setFormProject] = useState('');
  const [stage, setStage] = useState('');
  const [itemText, setItemText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [decisions, setDecisions] = useState<Record<string, ValidationStatusId>>({});

  const mayWrite = can('own.revisions.write');
  const mayApprove = can('own.proposals.approve');

  const activeProject = mine.find((m) => m.project.id === formProject) ?? mine[0];
  const waiting = useMemo(() => items.filter((r) => r.decidedAt === null).length, [items]);

  const stageOptions = useMemo(() => {
    const phases = activeProject?.service?.phases ?? [];
    if (phases.length > 0) return phases.map((p) => ({ value: p.id, label: `${p.number}. ${pick(p.title, lang)}` }));
    return [];
  }, [activeProject, lang]);

  /** The stage the form is on: what the client picked, else the phase the studio is in right now. */
  const effectiveStage = stage || activeProject?.currentPhase?.id || stageOptions[0]?.value || '';

  /** One revision-matrix line. Used by the form and by the `client.addRevisionComment` action. */
  const addComment = async (projectId: string, stageLabel: string, item: string, comment: string) => {
    const my = byId.get(projectId);
    if (!my) return `unknown project ${projectId}`;
    if (!item.trim() || !comment.trim()) {
      toast(t('client.approvals.addMissing'));
      return 'missing text';
    }
    await data.create('revisionItems', {
      projectId,
      engagementId: my.engagement?.id ?? null,
      stage: stageLabel.trim() || t('client.approvals.addStage'),
      item: item.trim(),
      comment: comment.trim(),
      authorId: user.id,
      source: 'client',
      status: 'revision',
      decidedAt: null,
    });
    toast(t('client.approvals.added'));
    return `added to ${projectId}`;
  };

  const decide = async (id: string, status: ValidationStatusId) => {
    const row = items.find((r) => r.id === id);
    if (!row) return `unknown item ${id}`;
    await data.update('revisionItems', id, { status, decidedAt: today() }, { basedOn: row.updated_at });
    toast(t('client.approvals.decided'));
    return `${id} -> ${status}`;
  };

  /** G-06: execution may start only once the client approves, and only once nothing is left in revision. */
  const approveForExecution = async (projectId: string) => {
    const my = byId.get(projectId);
    if (!my) return `unknown project ${projectId}`;
    const own = items.filter((r) => r.projectId === projectId);
    const pending = own.filter((r) => r.status === 'revision').length;
    if (own.length === 0) return 'nothing to approve';
    if (pending > 0) return `${pending} still in revision`;
    await data.update('projects', projectId, { approval: 'client-approved' }, { basedOn: my.project.updated_at });
    toast(t('client.approvals.gateDone'));
    return `${projectId} approved for execution`;
  };

  const submitForm = async () => {
    const projectId = activeProject?.project.id;
    if (!projectId) return;
    const stageLabel = stageOptions.length > 0 ? (stageOptions.find((o) => o.value === effectiveStage)?.label ?? stageOptions[0].label) : stage;
    const result = await addComment(projectId, stageLabel, itemText, commentText);
    if (result.startsWith('added')) {
      setItemText('');
      setCommentText('');
    }
  };

  useRegisterActions({
    'client.addRevisionComment': mayWrite
      ? ({ project, stage: s, item, comment }) => addComment(String(project ?? activeProject?.project.id ?? ''), String(s ?? ''), String(item ?? ''), String(comment ?? ''))
      : false,
    'client.decideRevision': mayWrite
      ? ({ item, status }) => (isValidationStatus(status) ? decide(String(item ?? ''), status) : `unknown status ${String(status)}`)
      : false,
    'client.approveForExecution': mayApprove ? ({ project }) => approveForExecution(String(project ?? activeProject?.project.id ?? '')) : false,
    'client.selectProject': ({ project }) => {
      const id = String(project ?? '');
      if (!mine.some((m) => m.project.id === id)) return `unknown project ${id}`;
      setFormProject(id);
      return `selected ${id}`;
    },
  });

  return (
    <div className="client-page">
      <PageHeader code={approvalsSpec.code} title={t('client.approvals.title')} subtitle={t('client.approvals.desc')} />

      <Card raised title={t('client.approvals.rule')}>
        <div className="client-stack">
          <p className="client-note">{t('client.approvals.ruleWhy')}</p>
          <div className="client-row">
            <Badge tone={waiting > 0 ? 'warning' : 'success'} dot>
              {waiting > 0 ? t('client.approvals.awaiting', { n: waiting }) : t('client.approvals.awaitingNone')}
            </Badge>
          </div>
        </div>
      </Card>

      {loading && <Skeleton lines={4} />}

      {!loading && mine.length === 0 && <EmptyState title={t('client.common.empty')} description={t('client.common.emptyDesc')} glyph="◇" />}

      {mine.map((my) => (
        <ProjectApprovals
          key={my.project.id}
          my={my}
          items={items.filter((r) => r.projectId === my.project.id)}
          showName={mine.length > 1}
          mayWrite={mayWrite}
          mayApprove={mayApprove}
          decisions={decisions}
          onPick={(id, status) => setDecisions((d) => ({ ...d, [id]: status }))}
          onDecide={decide}
          onApprove={approveForExecution}
        />
      ))}

      {mayWrite && activeProject && (
        <Card title={t('client.approvals.addTitle')} subtitle={t('client.approvals.addDesc')}>
          <form
            className="client-form"
            onSubmit={(e) => {
              e.preventDefault();
              void submitForm();
            }}
          >
            {mine.length > 1 && (
              <Select
                label={t('client.common.selectProject')}
                value={activeProject.project.id}
                onChange={(e) => setFormProject(e.target.value)}
                options={mine.map((m) => ({ value: m.project.id, label: m.project.name }))}
              />
            )}
            {stageOptions.length > 0 ? (
              <Select label={t('client.approvals.addStage')} value={effectiveStage} onChange={(e) => setStage(e.target.value)} options={stageOptions} />
            ) : (
              <Input label={t('client.approvals.addStage')} value={stage} onChange={(e) => setStage(e.target.value)} />
            )}
            <Input label={t('client.approvals.addItem')} hint={t('client.approvals.addItemHint')} value={itemText} onChange={(e) => setItemText(e.target.value)} />
            <Textarea label={t('client.approvals.addComment')} rows={4} value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <div className="client-row">
              <Button variant="primary" type="submit">
                {t('client.approvals.addSubmit')}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

interface ProjectApprovalsProps {
  my: MyProject;
  items: RevisionItem[];
  showName: boolean;
  mayWrite: boolean;
  mayApprove: boolean;
  decisions: Record<string, ValidationStatusId>;
  onPick: (id: string, status: ValidationStatusId) => void;
  onDecide: (id: string, status: ValidationStatusId) => Promise<string>;
  onApprove: (projectId: string) => Promise<string>;
}

/** The gate and the matrix of one project, grouped by stage in the order the comments were written. */
function ProjectApprovals({ my, items, showName, mayWrite, mayApprove, decisions, onPick, onDecide, onApprove }: ProjectApprovalsProps) {
  const { t, lang } = useT();
  const pending = items.filter((r) => r.status === 'revision').length;
  const already = my.project.approval === 'client-approved';
  const ready = !already && items.length > 0 && pending === 0;

  const gateNote = already
    ? t('client.approvals.gateAlready')
    : items.length === 0
      ? t('client.approvals.gateEmpty')
      : pending > 0
        ? t('client.approvals.gateBlocked', { n: pending })
        : t('client.approvals.gateReady');

  const stages = useMemo(() => {
    const map = new Map<string, RevisionItem[]>();
    for (const r of items) map.set(r.stage, [...(map.get(r.stage) ?? []), r]);
    return [...map.entries()];
  }, [items]);

  const statusOptions = VALIDATION_STATUSES.map((s) => ({ value: s.id, label: pick(s.label, lang) }));

  return (
    <>
      <Card title={showName ? `${my.project.name} — ${t('client.approvals.gateTitle')}` : t('client.approvals.gateTitle')}>
        <div className="client-stack">
          <p className="client-note">{t('client.approvals.gateDesc')}</p>
          <p className="client-note">
            <strong>{gateNote}</strong>
          </p>
          <div className="client-row">
            <Button variant="primary" disabled={!ready || !mayApprove} onClick={() => void onApprove(my.project.id)}>
              {t('client.approvals.gateButton')}
            </Button>
            {already && <StatusPill status="client-approved" />}
          </div>
        </div>
      </Card>

      {items.length === 0 ? (
        <Card title={showName ? my.project.name : undefined}>
          <EmptyState title={t('client.approvals.empty')} description={t('client.approvals.emptyDesc')} glyph="✎" />
        </Card>
      ) : (
        stages.map(([stage, rows]) => (
          <Card key={`${my.project.id}-${stage}`} title={stage} subtitle={showName ? my.project.name : undefined}>
            <ul className="client-list">
              {rows.map((row) => {
                const open = row.decidedAt === null;
                const picked = decisions[row.id] ?? row.status;
                return (
                  <li key={row.id} className="client-rev">
                    <div className="client-row">
                      <span className="client-rev__item">{row.item}</span>
                      <StatusPill status={row.status} />
                      <Badge tone="neutral">{t('client.approvals.source', { who: t(`client.approvals.source.${row.source}`) })}</Badge>
                    </div>
                    <p className="client-rev__comment">{row.comment}</p>
                    {row.decidedAt && <p className="client-note">{t('client.approvals.decidedAt', { date: formatDate(row.decidedAt, lang) })}</p>}
                    {open && mayWrite && (
                      <form
                        className="client-form client-form--wide"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void onDecide(row.id, picked);
                        }}
                      >
                        <Select
                          label={t('client.approvals.decide')}
                          value={picked}
                          onChange={(e) => onPick(row.id, e.target.value as ValidationStatusId)}
                          options={statusOptions}
                        />
                        <div className="client-row">
                          <Button variant="secondary" type="submit">
                            {t('client.approvals.decideConfirm')}
                          </Button>
                        </div>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))
      )}
    </>
  );
}
