import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useRegisterActions } from '../../actions';
import { useCan } from '../../auth/SessionProvider';
import { Badge } from '../../components/atom/Badge/Badge';
import { Button } from '../../components/atom/Button/Button';
import { FileIcon } from '../../components/atom/FileIcon/FileIcon';
import { Placeholder } from '../../components/atom/Placeholder/Placeholder';
import { Select } from '../../components/atom/Select/Select';
import { StatusPill } from '../../components/atom/StatusPill/StatusPill';
import { toast } from '../../components/atom/Toast/Toast';
import { ToggleButton } from '../../components/atom/ToggleButton/ToggleButton';
import { Card } from '../../components/molecule/Card/Card';
import { EmptyState } from '../../components/molecule/EmptyState/EmptyState';
import { FilterBar } from '../../components/molecule/FilterBar/FilterBar';
import { PageHeader } from '../../components/molecule/PageHeader/PageHeader';
import { SearchField } from '../../components/molecule/SearchField/SearchField';
import { Thumb } from '../../components/molecule/Thumb/Thumb';
import { DocumentViewer } from '../../components/organism/DocumentViewer/DocumentViewer';
import { Drawer } from '../../components/organism/Drawer/Drawer';
import { useTable } from '../../data/DataContext';
import type { Asset, Project } from '../../data/schema';
import {
  DELIVERY_STAGES,
  FILE_TYPES,
  FILE_TYPE_LABELS,
  LIFECYCLES,
  compareFolderPaths,
  deliveryStage,
  folderLabel,
  folderNumber,
  lifecycleOf,
  pick,
  type DeliveryStage,
  type PipelineGroup,
} from '../../domain';
import { copyText, downloadUrl } from '../../design/clipboard';
import { formatDate } from '../../i18n/format';
import { useT } from '../../i18n/I18nProvider';
import type { Surface } from '../../specs/PageSpec';
import { archivePortalSpec } from './specs';
import { extOf, fileTypeOfAsset, formatBytes, stageOfAsset, useArchiveData, usePortfolioSet } from './model';
import './archive.css';

/** Pipeline groups in delivery order (design comes before sale here: the studio draws, then quotes). */
const GROUPS: PipelineGroup[] = DELIVERY_STAGES.reduce<PipelineGroup[]>((acc, stage) => (acc.includes(stage.pipelineGroup) ? acc : [...acc, stage.pipelineGroup]), []);

/** All folders of a project, including the ones that hold no files themselves (the studio's numbering is the map). */
function folderTree(files: readonly Asset[]): { path: string; direct: Asset[] }[] {
  const direct = new Map<string, Asset[]>();
  const known = new Set<string>();
  for (const file of files) {
    const path = file.folderPath ?? '';
    // A folder marker (an entry the crawler recorded as a folder) names a folder rather than living in one.
    if (fileTypeOfAsset(file) === 'folder') {
      known.add([path, file.title].filter(Boolean).join('/'));
      continue;
    }
    known.add(path);
    const list = direct.get(path);
    if (list) list.push(file);
    else direct.set(path, [file]);
  }
  // Every ancestor is a folder too, so `DISEÑO` shows even when only `DISEÑO/03_PLANOS` holds files.
  for (const path of [...known]) {
    const parts = path.split('/').filter(Boolean);
    for (let i = 1; i < parts.length; i += 1) known.add(parts.slice(0, i).join('/'));
  }
  return [...known].sort(compareFolderPaths).map((path) => ({ path, direct: direct.get(path) ?? [] }));
}

/** `DISEÑO/03_PLANOS` -> breadcrumb with the studio's own number kept visible as a muted prefix. */
function FolderCrumbs({ path }: { path: string }) {
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) return <span className="arc-folder__crumbs">/</span>;
  return (
    <p className="arc-folder__crumbs">
      {segments.map((segment, i) => {
        const num = folderNumber(segment);
        return (
          <span key={`${segment}-${i}`}>
            {i > 0 && <span className="arc-folder__sep" aria-hidden="true">{' › '}</span>}
            {num !== 999 && <span className="arc-folder__num">{String(num).padStart(2, '0')} </span>}
            {folderLabel(segment)}
          </span>
        );
      })}
    </p>
  );
}

/**
 * S-13 `/<surface>/archive/:projectId`: one archived project as a portal — hero, the delivery order as a
 * stage rail, every file previewable in place (by stage or in the studio's own folder order), and what the
 * project relates to. Reads only; tagging a file is a declared Placeholder (D-047).
 */
export function ProjectPortalPage({ surface }: { surface: Surface }) {
  const { t, lang } = useT();
  const can = useCan();
  const { projectId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const { projects, filesByProject, loading } = useArchiveData();
  const set = usePortfolioSet();

  const relations = useTable('relations');
  const clients = useTable('clients');
  const spaces = useTable('spaces');
  const filings = useTable('filings');
  const posts = useTable('posts');

  const project = useMemo(() => projects.find((p) => p.id === projectId) ?? null, [projects, projectId]);
  const files = useMemo(() => filesByProject.get(projectId) ?? [], [filesByProject, projectId]);

  const stageParam = params.get('stage') ?? '';
  const typeParam = params.get('type') ?? '';
  const q = params.get('q') ?? '';
  const filesView = params.get('fview') === 'list' ? 'list' : 'grid';
  const grouping = params.get('group') === 'folder' ? 'folder' : 'stage';
  const openId = params.get('file');
  const pageParam = Number(params.get('page'));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const patch = useCallback(
    (next: Record<string, string | null>) => {
      const out = new URLSearchParams(params);
      for (const [k, v] of Object.entries(next)) {
        if (v === null || v === '') out.delete(k);
        else out.set(k, v);
      }
      setParams(out, { replace: true });
    },
    [params, setParams],
  );

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return files.filter((file) => {
      if (fileTypeOfAsset(file) === 'folder') return false;
      if (stageParam && stageOfAsset(file) !== stageParam) return false;
      if (typeParam && fileTypeOfAsset(file) !== typeParam) return false;
      if (!needle) return true;
      return `${file.title} ${file.slug} ${file.folderPath ?? ''}`.toLowerCase().includes(needle);
    });
  }, [files, q, stageParam, typeParam]);

  const realFiles = useMemo(() => files.filter((f) => fileTypeOfAsset(f) !== 'folder'), [files]);

  const countsByStage = useMemo(() => {
    const map = new Map<DeliveryStage, number>();
    for (const f of realFiles) map.set(stageOfAsset(f), (map.get(stageOfAsset(f)) ?? 0) + 1);
    return map;
  }, [realFiles]);

  const stagesWithFiles = DELIVERY_STAGES.filter((s) => (countsByStage.get(s.id) ?? 0) > 0);
  const typesPresent = useMemo(() => FILE_TYPES.filter((type) => realFiles.some((f) => fileTypeOfAsset(f) === type)), [realFiles]);

  const open = openId ? (visible.find((f) => f.id === openId) ?? realFiles.find((f) => f.id === openId) ?? null) : null;
  const openIndex = open ? visible.findIndex((f) => f.id === open.id) : -1;

  const railRef = useRef<HTMLDivElement>(null);

  /** Arrow keys walk the stage rail, Home / End jump; the buttons keep a normal tab stop each. */
  const onRailKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const buttons = [...(railRef.current?.querySelectorAll<HTMLButtonElement>('.arc-stage') ?? [])];
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i === -1) return;
    let next = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % buttons.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    else return;
    e.preventDefault();
    buttons[next]?.focus();
  };

  const goStage = (stage: DeliveryStage) => {
    const same = stageParam === stage;
    patch({ stage: same ? null : stage, page: null });
    if (!same) {
      window.requestAnimationFrame(() => document.getElementById(`arc-stage-${stage}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
    return same ? 'all' : stage;
  };

  const openFile = (asset: Asset | null | undefined) => {
    if (!asset) return 'no such file';
    patch({ file: asset.id, page: null });
    return asset.title;
  };

  const step = (delta: number) => {
    if (visible.length === 0) return 'no files';
    const i = openIndex === -1 ? (delta > 0 ? -1 : 0) : openIndex;
    const next = visible[(i + delta + visible.length) % visible.length];
    return openFile(next);
  };

  const copyLink = async (asset: Asset) => {
    const url = asset.sourceUrl ?? new URL(`#/${surface}/archive/${projectId}?file=${asset.id}`, window.location.href).toString();
    const ok = await copyText(url);
    toast(ok ? t('archive.preview.copied') : t('archive.preview.copyFailed', { url }));
    return url;
  };

  const asAsset = (value: unknown): Asset | undefined => {
    const needle = String(value ?? '').toLowerCase();
    return realFiles.find((f) => f.id === value) ?? realFiles.find((f) => f.title.toLowerCase() === needle) ?? (open ?? undefined);
  };

  useRegisterActions({
    'archive.openFile': ({ asset }) => openFile(asAsset(asset)),
    'archive.closeFile': () => {
      patch({ file: null, page: null });
      return 'closed';
    },
    'archive.nextFile': () => step(1),
    'archive.prevFile': () => step(-1),
    'archive.previewPage': ({ page: n }) => {
      const value = Number(n);
      if (!Number.isInteger(value) || value < 1) return 'page must be a positive whole number';
      patch({ page: String(value) });
      return value;
    },
    'archive.filterStage': ({ stage }) => {
      const value = String(stage ?? '');
      if (value === '' || value === 'all') {
        patch({ stage: null });
        return 'all';
      }
      return goStage(value as DeliveryStage);
    },
    'archive.filterFileType': ({ type }) => {
      const value = String(type ?? '');
      patch({ type: value === 'all' ? null : value });
      return value || 'all';
    },
    'archive.searchFiles': ({ q: needle }) => {
      patch({ q: String(needle ?? '') });
      return String(needle ?? '');
    },
    'archive.setFilesView': ({ view }) => {
      const value = view === 'list' ? 'list' : 'grid';
      patch({ fview: value === 'grid' ? null : value });
      return value;
    },
    'archive.setGrouping': ({ mode }) => {
      const value = mode === 'folder' ? 'folder' : 'stage';
      patch({ group: value === 'stage' ? null : value });
      return value;
    },
    'archive.openSource': ({ asset }) => {
      const found = asAsset(asset);
      if (!found?.sourceUrl) return 'this file has no source link';
      window.open(found.sourceUrl, '_blank', 'noreferrer');
      return found.sourceUrl;
    },
    'archive.downloadFile': ({ asset }) => {
      const found = asAsset(asset);
      if (!found?.url) return 'this file is not served by the hub; open it at the source';
      return downloadUrl(found.url, found.title);
    },
    'archive.copyFileLink': ({ asset }) => {
      const found = asAsset(asset);
      return found ? copyLink(found) : 'no such file';
    },
    'archive.openFolderSource': () => {
      if (!project?.sourceFolderUrl) return 'this project has no source folder link';
      window.open(project.sourceFolderUrl, '_blank', 'noreferrer');
      return project.sourceFolderUrl;
    },
    'archive.addToSet': () => {
      if (!project) return 'no project';
      const added = set.toggle(project.id);
      toast(added ? t('archive.portal.added', { name: project.name }) : t('archive.portal.removed', { name: project.name }));
      return added ? 'added' : 'removed';
    },
    // Declared and shown as a Placeholder; registered so the bus answers honestly (D-047).
    'archive.tagFile': can('assets.manage') && (() => 'not wired yet: tag editing writes assets.tags via the provider in the next pass'),
  });

  // Escape closes the preview even when focus never entered the Drawer body.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') patch({ file: null, page: null });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, patch]);

  const related = useMemo(() => {
    if (!project) return { client: null, post: null, space: null, examples: [] as Project[] };
    const clientRel = relations.rows.find((r) => r.fromType === 'projects' && r.fromId === project.id && r.toType === 'clients' && r.kind === 'for-client');
    const client = clientRel ? (clients.rows.find((c) => c.id === clientRel.toId) ?? null) : (clients.rows.find((c) => c.name === project.client) ?? null);
    const space = spaces.rows.find((s) => s.aboutType === 'projects' && s.aboutId === project.id) ?? null;
    const postIds = space ? filings.rows.filter((f) => f.spaceId === space.id).map((f) => f.postId) : [];
    const post = posts.rows.find((p) => postIds.includes(p.id)) ?? null;
    const tags = new Set(project.tags);
    const examples = projects
      .filter((p) => p.id !== project.id && p.tags.filter((tag) => tags.has(tag)).length >= 2)
      .sort((a, b) => b.tags.filter((tag) => tags.has(tag)).length - a.tags.filter((tag) => tags.has(tag)).length || (b.year ?? 0) - (a.year ?? 0))
      .slice(0, 6);
    return { client, post, space, examples };
  }, [project, projects, relations.rows, clients.rows, spaces.rows, filings.rows, posts.rows]);

  if (!project) {
    return (
      <>
        <PageHeader code={archivePortalSpec(surface).code} title={t('archive.portal.notFoundTitle')} breadcrumb={[{ label: t(`core.portal.${surface}`), to: `/${surface}` }, { label: t('archive.crumb.archive'), to: `/${surface}/archive` }]} />
        <EmptyState title={t('archive.portal.notFoundTitle')} description={loading ? '' : t('archive.portal.notFoundDesc')} glyph="▤">
          <Button href={`#/${surface}/archive`}>{t('archive.portal.back')}</Button>
        </EmptyState>
      </>
    );
  }

  const life = LIFECYCLES.find((l) => l.id === lifecycleOf(project.pipelineStatus));
  const cover = project.coverAssetId ? (files.find((f) => f.id === project.coverAssetId)?.thumbnailUrl ?? null) : null;

  const fileButton = (file: Asset) => {
    const type = fileTypeOfAsset(file);
    const ext = extOf(file);
    const badge = type === 'pdf' && file.pageCount ? t('archive.files.pages', { count: file.pageCount }) : ext;
    const size = formatBytes(file.bytes, lang);
    const meta = [FILE_TYPE_LABELS[type] ? pick(FILE_TYPE_LABELS[type], lang) : ext, size, formatDate(file.updated_at, lang)].filter(Boolean).join(' · ');
    return (
      <li key={file.id} data-asset={file.id}>
        <button type="button" className={`arc-file${filesView === 'list' ? ' arc-file--row' : ''}`} aria-current={open?.id === file.id ? true : undefined} aria-label={t('archive.files.openAria', { name: file.title })} onClick={() => openFile(file)}>
          {filesView === 'grid' ? (
            <Thumb src={file.thumbnailUrl} alt={file.title} type={type} ratio="4:3" badge={badge || undefined} caption={file.title} size="md" />
          ) : (
            <>
              <FileIcon type={type} size="sm" />
              <span className="arc-file__name">{file.title}</span>
              <span className="arc-file__meta">{meta}</span>
            </>
          )}
        </button>
      </li>
    );
  };

  const stageSections = stagesWithFiles
    .filter((s) => !stageParam || s.id === stageParam)
    .map((stageDef) => {
      const inStage = visible.filter((f) => stageOfAsset(f) === stageDef.id);
      if (inStage.length === 0) return null;
      const folders = folderTree(inStage).filter((group) => group.direct.length > 0);
      return (
        <section key={stageDef.id} id={`arc-stage-${stageDef.id}`} className="arc-section" aria-labelledby={`arc-stage-title-${stageDef.id}`}>
          <div className="arc-section__head">
            <h2 id={`arc-stage-title-${stageDef.id}`} className="arc-section__title">
              <span aria-hidden="true">{stageDef.glyph} </span>
              {pick(stageDef.label, lang)}
            </h2>
            <span className="arc-section__count">{inStage.length === 1 ? t('archive.files.stageCountOne') : t('archive.files.stageCount', { count: inStage.length })}</span>
          </div>
          {folders.map((group) => (
            <div key={group.path || '/'} className="arc-folder">
              <div className="arc-folder__head">
                <FileIcon type="folder" size="sm" />
                <FolderCrumbs path={group.path} />
              </div>
              <ul className={`arc-files${filesView === 'list' ? ' arc-files--list' : ''}`}>{group.direct.map(fileButton)}</ul>
            </div>
          ))}
        </section>
      );
    })
    .filter(Boolean);

  const folderSections = folderTree(visible).map((group) => (
    <div key={group.path || '/'} className="arc-folder">
      <div className="arc-folder__head">
        <FileIcon type="folder" size="sm" />
        <FolderCrumbs path={group.path} />
        {group.direct.length === 0 && <span className="arc-folder__empty">{t('archive.group.emptyFolder')}</span>}
      </div>
      {group.direct.length > 0 && <ul className={`arc-files${filesView === 'list' ? ' arc-files--list' : ''}`}>{group.direct.map(fileButton)}</ul>}
    </div>
  ));

  const openType = open ? fileTypeOfAsset(open) : 'other';

  return (
    <>
      <PageHeader
        code={archivePortalSpec(surface).code}
        title={project.name}
        subtitle={t('archive.portal.subtitle', { files: realFiles.length, stages: stagesWithFiles.length })}
        breadcrumb={[
          { label: t(`core.portal.${surface}`), to: `/${surface}` },
          { label: t('archive.crumb.archive'), to: `/${surface}/archive` },
          { label: project.name },
        ]}
      />

      <div className="arc-hero">
        <div className="arc-hero__cover">
          <Thumb src={cover} alt={t('archive.browser.cover', { name: project.name })} type="image" ratio="16:9" size="lg" />
        </div>
        <div className="arc-hero__facts">
          <h2 className="arc-hero__name">{project.name}</h2>
          <p className="arc-hero__line">
            <span>{project.client}</span>
            {project.year !== null && <span>· {project.year}</span>}
            {project.location && <span>· {project.location}</span>}
            <span>· {t(`archive.type.${project.type}`)}</span>
          </p>
          <p className="arc-hero__line">
            <StatusPill status={project.pipelineStatus} />
            {life && <Badge tone="info">{pick(life.label, lang)}</Badge>}
            {project.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </p>
          <div className="arc-hero__actions">
            {project.sourceFolderUrl && (
              <Button variant="primary" href={project.sourceFolderUrl} external>
                {t('archive.portal.openSource')}
              </Button>
            )}
            <Button href={`#/${surface}/work/${project.id}`}>{t('archive.portal.openWork')}</Button>
            {related.space && <Button href={`#/${surface}/spaces/${related.space.id}`}>{t('archive.portal.openSpace')}</Button>}
            <Button
              variant="ghost"
              aria-pressed={set.has(project.id)}
              onClick={() => {
                const added = set.toggle(project.id);
                toast(added ? t('archive.portal.added', { name: project.name }) : t('archive.portal.removed', { name: project.name }));
              }}
            >
              {set.has(project.id) ? t('archive.portal.inSet') : t('archive.portal.addToSet')}
            </Button>
          </div>
        </div>
      </div>

      <section aria-labelledby="arc-pipeline-title">
        <div className="arc-section__head">
          <h2 id="arc-pipeline-title" className="arc-section__title">
            {t('archive.pipeline.title')}
          </h2>
          <span className="arc-section__count">{t('archive.pipeline.desc')}</span>
        </div>
        <div className="arc-rail" ref={railRef} role="group" aria-label={t('archive.pipeline.railLabel')} onKeyDown={onRailKey}>
          {GROUPS.map((group) => {
            const inGroup = DELIVERY_STAGES.filter((s) => s.pipelineGroup === group);
            if (inGroup.length === 0) return null;
            return (
              <div key={group} className="arc-rail__group">
                <h3 className="arc-rail__group-title">{t(`archive.pgroup.${group}`)}</h3>
                <div className="arc-rail__stages">
                  {inGroup.map((stageDef) => {
                    const count = countsByStage.get(stageDef.id) ?? 0;
                    return (
                      <button
                        key={stageDef.id}
                        type="button"
                        className={`arc-stage${count === 0 ? ' arc-stage--empty' : ''}`}
                        aria-pressed={stageParam === stageDef.id}
                        aria-label={t('archive.pipeline.stageAria', { stage: pick(stageDef.label, lang), count })}
                        onClick={() => goStage(stageDef.id)}
                      >
                        <span className="arc-stage__label">
                          <span aria-hidden="true">{stageDef.glyph}</span>
                          {pick(stageDef.label, lang)}
                        </span>
                        <span className="arc-stage__count">{count === 0 ? t('archive.pipeline.empty') : count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="arc-section" aria-labelledby="arc-files-title">
        <div className="arc-section__head">
          <h2 id="arc-files-title" className="arc-section__title">
            {t('archive.files.title')}
          </h2>
        </div>
        <FilterBar summary={t('archive.files.summary', { shown: visible.length, total: realFiles.length })}>
          <div className="arc-toolbar__search">
            <SearchField value={q} onChange={(value) => patch({ q: value })} label={t('archive.files.searchLabel')} placeholder={t('archive.files.searchPlaceholder')} />
          </div>
          <Select
            className="arc-toolbar__field"
            label={t('archive.label.stage')}
            value={stageParam}
            onChange={(e) => patch({ stage: e.target.value || null })}
            options={[{ value: '', label: t('archive.any.stage') }, ...stagesWithFiles.map((s) => ({ value: s.id, label: pick(s.label, lang) }))]}
          />
          <Select
            className="arc-toolbar__field"
            label={t('archive.label.fileType')}
            value={typeParam}
            onChange={(e) => patch({ type: e.target.value || null })}
            options={[{ value: '', label: t('archive.any.fileType') }, ...typesPresent.map((type) => ({ value: type, label: pick(FILE_TYPE_LABELS[type], lang) }))]}
          />
          <div className="arc-views">
            <ToggleButton label={t('archive.view.toggleFiles')} pressed={filesView === 'grid'} onClick={() => patch({ fview: null })}>
              {t('archive.view.grid')}
            </ToggleButton>
            <ToggleButton label={t('archive.view.toggleFiles')} pressed={filesView === 'list'} onClick={() => patch({ fview: 'list' })}>
              {t('archive.view.list')}
            </ToggleButton>
          </div>
          <div className="arc-views">
            <ToggleButton label={t('archive.group.toggle')} pressed={grouping === 'stage'} onClick={() => patch({ group: null })}>
              {t('archive.group.stage')}
            </ToggleButton>
            <ToggleButton label={t('archive.group.toggle')} pressed={grouping === 'folder'} onClick={() => patch({ group: 'folder' })}>
              {t('archive.group.folder')}
            </ToggleButton>
          </div>
          <Placeholder what={t('archive.files.tagWhat')}>
            <Button>{t('archive.files.tag')}</Button>
          </Placeholder>
        </FilterBar>

        {realFiles.length === 0 && !loading && <EmptyState title={t('archive.files.noneTitle')} description={t('archive.files.noneDesc')} glyph="▤" />}
        {realFiles.length > 0 && visible.length === 0 && (
          <EmptyState title={t('archive.files.emptyTitle')} description={t('archive.files.emptyDesc')} glyph="⌕">
            <Button onClick={() => patch({ q: null, stage: null, type: null })}>{t('archive.browser.emptyAction')}</Button>
          </EmptyState>
        )}
        {visible.length > 0 && (grouping === 'folder' ? folderSections : stageSections)}
      </section>

      <Drawer open={open !== null} onClose={() => patch({ file: null, page: null })} title={open?.title ?? ''}>
        {open && (
          <>
            <p className="arc-preview__meta">
              <span>{pick(FILE_TYPE_LABELS[openType], lang)}</span>
              {formatBytes(open.bytes, lang) && <span>· {formatBytes(open.bytes, lang)}</span>}
              <span>· {formatDate(open.updated_at, lang)}</span>
              <Badge tone="info">{pick(deliveryStage(stageOfAsset(open))?.label ?? FILE_TYPE_LABELS.other, lang)}</Badge>
              <span className="arc-mono">{t('archive.preview.folder', { folder: open.folderPath || '/' })}</span>
            </p>
            <DocumentViewer
              asset={{ title: open.title, titleEs: open.titleEs, url: open.url, sourceUrl: open.sourceUrl, mimeType: open.mimeType, previewUrls: open.previewUrls, pageCount: open.pageCount, thumbnailUrl: open.thumbnailUrl, fileType: openType }}
              page={page}
              onPage={(n) => patch({ page: String(n) })}
              downloadName={open.title}
              controls={false}
              labels={{
                fallback: t('archive.preview.none'),
                download: t('archive.preview.download'),
                openSource: t('archive.preview.openSource'),
                page: (n, total) => t('archive.preview.position', { index: n, total }),
                prev: t('archive.preview.prev'),
                next: t('archive.preview.next'),
                thumbnails: t('archive.files.title'),
                fileType: pick(FILE_TYPE_LABELS[openType], lang),
              }}
            />
            <div className="arc-preview__actions">
              {open.url && (
                <Button href={open.url} download={open.title}>
                  {t('archive.preview.download')}
                </Button>
              )}
              {open.sourceUrl && (
                <Button href={open.sourceUrl} external>
                  {t('archive.preview.openSource')}
                </Button>
              )}
              <Button variant="ghost" onClick={() => void copyLink(open)}>
                {t('archive.preview.copyLink')}
              </Button>
              <Button onClick={() => step(-1)}>{t('archive.preview.prev')}</Button>
              <Button onClick={() => step(1)}>{t('archive.preview.next')}</Button>
              {openIndex >= 0 && <span className="arc-preview__position">{t('archive.preview.position', { index: openIndex + 1, total: visible.length })}</span>}
            </div>
          </>
        )}
      </Drawer>

      <section className="arc-related" aria-labelledby="arc-related-title">
        <h2 id="arc-related-title" className="arc-section__title">
          {t('archive.related.title')}
        </h2>
        <ul className="arc-related__grid">
          {related.client && (
            <li>
              <Card title={related.client.name} subtitle={t('archive.related.client')}>
                <p className="arc-muted">
                  {t('archive.related.clientProjects', { count: related.client.projectIds.length })}
                  {related.client.city && ` · ${related.client.city}`}
                </p>
                <Button href={`#/${surface}/spaces`}>{t('archive.related.openClient')}</Button>
              </Card>
            </li>
          )}
          {related.post && (
            <li>
              <Card title={related.post.title} subtitle={t('archive.related.post')}>
                <Button href={`#/${surface}/spaces/post/${related.post.id}`}>{t('archive.related.openPost')}</Button>
              </Card>
            </li>
          )}
          {!related.client && !related.post && related.examples.length === 0 && (
            <li>
              <p className="arc-muted">{t('archive.related.none')}</p>
            </li>
          )}
        </ul>

        {related.examples.length > 0 && (
          <div>
            <div className="arc-section__head">
              <h3 className="arc-section__title">{t('archive.related.examples')}</h3>
              <span className="arc-section__count">{t('archive.related.examplesDesc')}</span>
            </div>
            <ul className="arc-related__grid">
              {related.examples.map((p) => (
                <li key={p.id}>
                  <Card padding="sm">
                    <Link className="arc-card__link" to={`/${surface}/archive/${p.id}`} aria-label={t('archive.browser.openAria', { name: p.name })}>
                      <span className="arc-card__name">{p.name}</span>
                      <span className="arc-card__meta">
                        <span>{p.client}</span>
                        {p.year !== null && <span>· {p.year}</span>}
                      </span>
                      <span className="arc-card__badges">
                        {p.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </span>
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
