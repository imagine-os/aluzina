import { useEffect, useRef, useState } from 'react';
import { useRegisterActions } from '../../actions';
import { demoUserById } from '../../auth/demoUsers';
import { useCan, useSession } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { Skeleton } from '../../components/atom/Skeleton/Skeleton';
import { Textarea } from '../../components/atom/Textarea/Textarea';
import { toast } from '../../components/atom/Toast/Toast';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { Tabs } from '../../components/molecule/Tabs/Tabs';
import { useData, useTable } from '../../data/DataContext';
import { formatDateTime } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import './client.css';
import { messagesSpec } from './specs';
import { useMyProjects } from './useMyProjects';

/**
 * C-04: the official thread with the studio, one per project. Writes go through the provider by id, so a
 * second tab and the studio's own portal see a message without a reload (D-023, P-14).
 */
export function MessagesPage() {
  const { t, lang } = useT();
  const { user } = useSession();
  const can = useCan();
  const data = useData();
  const { mine, projectIds, loading } = useMyProjects();
  const { rows: messages } = useTable('messages', { where: { projectId: projectIds }, orderBy: 'at' });

  const [tab, setTab] = useState('');
  const [draft, setDraft] = useState('');
  /** Rows this session already marked read, so the effect never writes the same row twice. */
  const marked = useRef(new Set<string>());
  /** What was unread when the thread was opened, so the "New" badge does not vanish as we mark them read. */
  const initialUnread = useRef<Set<string> | null>(null);

  const mayWrite = can('messages.write');
  const current = mine.find((m) => m.project.id === tab) ?? mine[0];
  const thread = messages.filter((m) => m.projectId === current?.project.id);

  if (initialUnread.current === null && messages.length > 0) {
    initialUnread.current = new Set(messages.filter((m) => m.authorId !== user.id && !m.readBy.includes(user.id)).map((m) => m.id));
  }

  const markRead = async (projectId: string) => {
    let n = 0;
    for (const m of messages) {
      if (m.projectId !== projectId || m.readBy.includes(user.id) || marked.current.has(m.id)) continue;
      marked.current.add(m.id);
      n += 1;
      await data.update('messages', m.id, { readBy: [...m.readBy, user.id] }, { basedOn: m.updated_at });
    }
    return `${n} marked read`;
  };

  const projectId = current?.project.id;
  useEffect(() => {
    if (!projectId) return;
    // `markRead` reads the latest `messages` from the closure; the `marked` ref stops it repeating a write.
    void markRead(projectId);
  }, [projectId, messages]); // eslint-disable-line -- markRead is stable enough through the ref guard

  const send = async (toProjectId: string, body: string) => {
    if (!body.trim()) return 'empty message';
    if (!mine.some((m) => m.project.id === toProjectId)) return `unknown project ${toProjectId}`;
    await data.create('messages', {
      projectId: toProjectId,
      authorId: user.id,
      body: body.trim(),
      at: new Date().toISOString(),
      readBy: [user.id],
    });
    toast(t('client.messages.sent'));
    return `sent to ${toProjectId}`;
  };

  useRegisterActions({
    'client.sendMessage': mayWrite ? ({ project, body }) => send(String(project ?? projectId ?? ''), String(body ?? '')) : false,
    'client.markRead': mayWrite
      ? async ({ project }) => {
          const result = await markRead(String(project ?? projectId ?? ''));
          toast(t('client.messages.marked'));
          return result;
        }
      : false,
    'client.selectProject': ({ project }) => {
      const id = String(project ?? '');
      if (!mine.some((m) => m.project.id === id)) return `unknown project ${id}`;
      setTab(id);
      return `opened ${id}`;
    },
  });

  const bubbles = (
    <ul className="client-thread" aria-label={t('client.messages.threadLabel', { project: current?.project.name ?? '' })}>
      {thread.map((m) => {
        const author = demoUserById(m.authorId);
        const isMine = m.authorId === user.id;
        return (
          <li key={m.id} className={`client-bubble${isMine ? ' client-bubble--mine' : ''}`}>
            <div className="client-bubble__meta">
              <span>{isMine ? t('client.messages.you') : (author?.name ?? m.authorId)}</span>
              <span>{formatDateTime(m.at, lang)}</span>
              {initialUnread.current?.has(m.id) && <Badge tone="accent">{t('client.messages.unread')}</Badge>}
            </div>
            <p className="client-bubble__body">{m.body}</p>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="client-page">
      <PageHeader code={messagesSpec.code} title={t('client.messages.title')} subtitle={t('client.messages.desc')} />

      {loading && <Skeleton lines={4} />}

      {!loading && mine.length === 0 && <EmptyState title={t('client.common.empty')} description={t('client.common.emptyDesc')} glyph="◇" />}

      {current && (
        <Card
          title={current.project.name}
          actions={
            mayWrite ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void markRead(current.project.id).then(() => toast(t('client.messages.marked')));
                }}
              >
                {t('client.messages.markRead')}
              </Button>
            ) : undefined
          }
        >
          <div className="client-stack">
            {mine.length > 1 ? (
              <Tabs
                label={t('client.messages.tabsLabel')}
                value={current.project.id}
                onChange={setTab}
                tabs={mine.map((m) => ({ id: m.project.id, label: m.project.name }))}
              >
                {thread.length === 0 ? <EmptyState title={t('client.messages.empty')} description={t('client.messages.emptyDesc')} glyph="✉" /> : bubbles}
              </Tabs>
            ) : thread.length === 0 ? (
              <EmptyState title={t('client.messages.empty')} description={t('client.messages.emptyDesc')} glyph="✉" />
            ) : (
              bubbles
            )}

            {mayWrite && (
              <form
                className="client-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send(current.project.id, draft).then((r) => {
                    if (r.startsWith('sent')) setDraft('');
                  });
                }}
              >
                <Textarea label={t('client.messages.composer')} rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
                <div className="client-row">
                  <Button variant="primary" type="submit">
                    {t('client.messages.send')}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
