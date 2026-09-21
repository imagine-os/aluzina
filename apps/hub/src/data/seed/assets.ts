import brochureRaw from '@docs/brand/brochure/index.json';
import portfolioRaw from '@docs/brand/portfolio/index.json';
import type { ServiceCode } from '../../domain/playbook';
import type { Asset, Client, Post, ProjectType, Relation, Space } from '../schema';
import type { SeedCtx } from './types';

/**
 * Brand documents as data (prompt 0013, Justin: "properly saved by project and relational in the proper way in
 * the database"). Everything here is derived at seed time from the visual memory `docs/brand/<doc>/index.json`
 * (imported through the `@docs` alias like `docs/plan/plan.json`, D-037), so the index files stay the single
 * source of truth: two `assets` documents, one `assets` page per rendered page, one `projects` row per project
 * the portfolio shows (`pipelineStatus: closed`, `phase: delivered`), the clients it names, a Portfolio area in
 * Spaces with one project space and one note per project, and typed `relations` (D-026): page `part-of`
 * document, page `depicts` project, project `for-client` client, project `produced-by` the founder, brochure
 * pages `applies-to` the playbook services they market, the brochure's credentials page `references` the three
 * projects both documents share. Ids are stable so docs, tests and the graph can name them.
 */
export const order = 60;

interface BrandPage {
  page: number;
  image: string;
  headline: string;
  description: string;
  text: string;
  colors: string[];
  imageCount: number;
  px: number[];
  bytes: number;
}

interface BrandProject {
  slug: string;
  name: string;
  type: string;
  city: string | null;
  year: number | null;
  summary: string;
  pages: number[];
  /** Brochure only: the portfolio project the same client appears in. */
  relatedPortfolioSlug?: string;
}

interface BrandProduct {
  slug: string;
  name: string;
  summary: string;
  pages: number[];
}

interface BrandIndex {
  document: string;
  file: string;
  servedUrl: string;
  sourceOriginalName: string;
  slackFileId: string;
  sourceBytes: number;
  sharedAt: string;
  language: string;
  pageCount: number;
  palette: string[];
  fonts: string[];
  pages: BrandPage[];
  projects: BrandProject[];
  products?: BrandProduct[];
}

export const PORTFOLIO_INDEX = portfolioRaw as unknown as BrandIndex;
export const BROCHURE_INDEX = brochureRaw as unknown as BrandIndex;

export const ASSET_IDS = { portfolio: 'ast-portfolio', brochure: 'ast-brochure' } as const;
export const PORTFOLIO_SPACE_ID = 'sp-portfolio';

/** Two-digit page suffix (`ast-portfolio-p04`). */
export function pageAssetId(docId: string, page: number): string {
  return `${docId}-p${String(page).padStart(2, '0')}`;
}
export function portfolioProjectId(slug: string): string {
  return `prj-pf-${slug}`;
}
export function portfolioSpaceId(slug: string): string {
  return `sp-pf-${slug}`;
}

/**
 * What the portfolio does not print, decided once here and recorded in docs/knowledge/brand.md ("Portfolio
 * projects as records"): the Hub project type closest to the published one, the playbook service the work
 * would be sold as today (a guess; the portfolio predates the playbook), the client when the page names one.
 */
interface PortfolioMeta {
  type: ProjectType;
  serviceCode: ServiceCode | null;
  client: { id: string; name: string; sector: string | null } | null;
  location: string;
}
const UNPUBLISHED_LOCATION = 'Ubicación no publicada';
const PORTFOLIO_META: Record<string, PortfolioMeta> = {
  'brewhouse-bar-cerveza-artesanal': { type: 'hospitality', serviceCode: '03', client: { id: 'cl-brewhouse', name: 'Brew House', sector: 'hospitality' }, location: UNPUBLISHED_LOCATION },
  'club-union-sala-de-masajes': { type: 'wellness', serviceCode: '03', client: { id: 'cl-club-union', name: 'Club Unión', sector: 'wellness' }, location: UNPUBLISHED_LOCATION },
  'sodime-consultorio-medico': { type: 'commercial', serviceCode: '03', client: { id: 'cl-sodime', name: 'Sodime', sector: 'healthcare' }, location: UNPUBLISHED_LOCATION },
  'terminal-norte-plazoleta-comida': { type: 'hospitality', serviceCode: '03', client: { id: 'cl-terminal-norte', name: 'Terminal Norte', sector: 'public / food & beverage' }, location: UNPUBLISHED_LOCATION },
  'coassist-aseguradora': { type: 'commercial', serviceCode: '03', client: { id: 'cl-coassist', name: 'Coassist', sector: 'commercial / office' }, location: UNPUBLISHED_LOCATION },
  'casa-clasico-contemporanea': { type: 'residential', serviceCode: '03', client: null, location: UNPUBLISHED_LOCATION },
  'apartaestudio-i': { type: 'residential', serviceCode: '03', client: null, location: UNPUBLISHED_LOCATION },
  'apartamento-moderno': { type: 'residential', serviceCode: '03', client: null, location: UNPUBLISHED_LOCATION },
  'apartaestudio-ii': { type: 'residential', serviceCode: '03', client: null, location: UNPUBLISHED_LOCATION },
  apartamento: { type: 'residential', serviceCode: '03', client: null, location: 'Medellín' },
  'gahia-pop-up': { type: 'commercial', serviceCode: null, client: { id: 'cl-gahia', name: 'Gahia', sector: 'retail / events' }, location: UNPUBLISHED_LOCATION },
  'music-and-art-i': { type: 'commercial', serviceCode: null, client: null, location: UNPUBLISHED_LOCATION },
  'music-and-art-ii': { type: 'commercial', serviceCode: null, client: null, location: UNPUBLISHED_LOCATION },
};
const FALLBACK_META: PortfolioMeta = { type: 'commercial', serviceCode: null, client: null, location: UNPUBLISHED_LOCATION };

/** The portfolio prints no dates; the schema needs one. Recorded as `_unknown_` in docs/knowledge/brand.md. */
const UNKNOWN_START_DATE = '2024-01-01';

/** Which playbook services a marketing page argues for (brochure p. 4 capabilities, p. 6 process; portfolio p. 2 pillars). */
const SERVICE_PAGES: { docId: string; page: number; services: ServiceCode[] }[] = [
  { docId: ASSET_IDS.brochure, page: 4, services: ['03', 'E'] },
  { docId: ASSET_IDS.brochure, page: 6, services: ['03', 'E'] },
  { docId: ASSET_IDS.portfolio, page: 2, services: ['03'] },
];

type AssetRow = Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;
type SpaceRow = Omit<Space, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;
type PostRow = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;
type ClientRow = Omit<Client, 'id' | 'created_at' | 'updated_at' | 'updated_by'>;

function excerpt(text: string, max = 200): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

/**
 * The PDFs letterspace their headlines ("B A R C E R V E Z A"), and the extracted text keeps one space between
 * letters and between words alike, so the words cannot be rebuilt; such text is not quoted (the headline
 * already carries the words).
 */
function isLetterspaced(text: string): boolean {
  const tokens = text.trim().split(/ +/);
  const single = tokens.filter((tk) => tk.length === 1).length;
  return tokens.length >= 4 && single / tokens.length >= 0.6;
}

function pageTitle(docTitle: string, p: BrandPage): string {
  const n = String(p.page).padStart(2, '0');
  return p.headline ? `${docTitle} p. ${n} — ${p.headline}` : `${docTitle} p. ${n}`;
}

export function seed({ add, users }: SeedCtx): void {
  const relate = (id: string, row: Omit<Relation, 'id' | 'created_at' | 'updated_at' | 'updated_by' | 'note'> & { note?: string }) => add('relations', id, { note: '', ...row });
  const space = (id: string, row: Partial<SpaceRow> & Pick<SpaceRow, 'name' | 'slug' | 'kind'>) =>
    add('spaces', id, { parentId: null, description: '', glyph: '◇', order: 0, visibility: 'team', archived: false, aboutType: null, aboutId: null, ...row });
  const post = (id: string, spaces: string[], row: Partial<PostRow> & Pick<PostRow, 'title' | 'body' | 'kind' | 'authorId'>) => {
    add('posts', id, { url: null, pinned: false, status: 'published', tags: [], ...row });
    spaces.forEach((spaceId, i) => add('filings', `fil-${id.replace(/^post-/, '')}-${i + 1}`, { postId: id, spaceId }));
  };

  // ---- Documents and their pages (assets) ----
  const docs: { id: string; index: BrandIndex; title: string; titleEs: string; short: string; shortEs: string; tag: string }[] = [
    { id: ASSET_IDS.portfolio, index: PORTFOLIO_INDEX, title: 'Aluzina portfolio (Universo de Diseño)', titleEs: 'Portafolio Aluzina (Universo de Diseño)', short: 'Portfolio', shortEs: 'Portafolio', tag: 'portfolio' },
    { id: ASSET_IDS.brochure, index: BROCHURE_INDEX, title: 'Aluzina brochure (Interiorismo / Iluminación)', titleEs: 'Brochure Aluzina (Interiorismo / Iluminación)', short: 'Brochure', shortEs: 'Brochure', tag: 'brochure' },
  ];
  const pageById = new Map<string, BrandPage>();
  for (const d of docs) {
    const lang = d.index.language === 'es' || d.index.language === 'en' ? d.index.language : null;
    const base: Pick<AssetRow, 'sourceFileId' | 'sourceName' | 'publishedAt' | 'language' | 'status' | 'supersedesId'> = {
      sourceFileId: d.index.slackFileId,
      sourceName: d.index.sourceOriginalName,
      publishedAt: null,
      language: lang,
      status: 'current',
      supersedesId: null,
    };
    add('assets', d.id, {
      ...base,
      kind: 'document',
      title: d.title,
      titleEs: d.titleEs,
      slug: d.tag,
      url: d.index.servedUrl,
      repoPath: d.index.file,
      mimeType: 'application/pdf',
      bytes: d.index.sourceBytes,
      pageCount: d.index.pageCount,
      pageNumber: null,
      parentId: null,
      palette: d.index.palette,
      fonts: d.index.fonts,
      textExcerpt: d.index.document,
      tags: ['brand', d.tag],
    });
    for (const p of d.index.pages) {
      const id = pageAssetId(d.id, p.page);
      pageById.set(id, p);
      add('assets', id, {
        ...base,
        kind: 'page',
        title: pageTitle(d.short, p),
        titleEs: pageTitle(d.shortEs, p),
        slug: `${d.tag}-p${String(p.page).padStart(2, '0')}`,
        url: null,
        repoPath: p.image,
        mimeType: 'image/jpeg',
        bytes: p.bytes,
        pageCount: null,
        pageNumber: p.page,
        parentId: d.id,
        palette: p.colors,
        fonts: [],
        textExcerpt: p.headline || excerpt(p.description),
        tags: ['brand', d.tag],
      });
      relate(`rel-${id}-part-of`, { fromType: 'assets', fromId: id, toType: 'assets', toId: d.id, kind: 'part-of' });
    }
  }

  // ---- Marketing pages -> the services they argue for (registry `services`, id = playbook code) ----
  for (const sp of SERVICE_PAGES) {
    const pageId = pageAssetId(sp.docId, sp.page);
    for (const code of sp.services) relate(`rel-${pageId}-applies-to-${code}`, { fromType: 'assets', fromId: pageId, toType: 'services', toId: code, kind: 'applies-to', note: 'Servicio del playbook más cercano a lo que la página vende (estimación).' });
  }

  // ---- Portfolio projects as records: projects, clients, spaces, posts, relations ----
  add('tags', 'tag-portfolio', { name: 'portfolio', tone: 'accent' });
  space(PORTFOLIO_SPACE_ID, {
    name: 'Portfolio',
    slug: 'portfolio',
    kind: 'area',
    glyph: '▤',
    order: 85,
    description: 'Los proyectos que muestra el portafolio de Aluzina (docs/brand/portfolio), uno por espacio; cada página del PDF es un archivo relacionado con su proyecto. Fuente: ALUZINA.pdf, compartido por Justin el 2026-09-21 (prompt 0011 / 0013).',
  });

  const clients = new Map<string, ClientRow>();
  PORTFOLIO_INDEX.projects.forEach((prj, i) => {
    const meta = PORTFOLIO_META[prj.slug] ?? FALLBACK_META;
    const projectId = portfolioProjectId(prj.slug);
    const spaceId = portfolioSpaceId(prj.slug);
    const pages = prj.pages.map((n) => pageAssetId(ASSET_IDS.portfolio, n));
    const pageLabel = prj.pages.length > 1 ? `pp. ${prj.pages[0]}-${prj.pages[prj.pages.length - 1]}` : `p. ${prj.pages[0]}`;

    add('projects', projectId, {
      name: prj.name,
      client: meta.client?.name ?? 'unknown',
      clientUserId: null,
      type: meta.type,
      phase: 'delivered',
      serviceCode: meta.serviceCode,
      pipelineStatus: 'closed',
      creativeDirection: 'set',
      approval: 'client-approved',
      leadDesignerId: users.founder,
      budgetCop: 0,
      startDate: prj.year ? `${prj.year}-01-01` : UNKNOWN_START_DATE,
      dueDate: null,
      location: prj.city ?? meta.location,
      summary: `${prj.summary} (Portafolio ${pageLabel}; tipo publicado: ${prj.type}.)`,
    });

    if (meta.client) {
      const existing = clients.get(meta.client.id);
      if (existing) existing.projectIds.push(projectId);
      else clients.set(meta.client.id, { name: meta.client.name, kind: 'past', sector: meta.client.sector, city: prj.city, contactName: null, notes: `Nombrado en el portafolio (${pageLabel}); contacto y ciudad no publicados. Ver docs/knowledge/clients.md.`, projectIds: [projectId] });
      relate(`rel-${projectId}-for-client`, { fromType: 'projects', fromId: projectId, toType: 'clients', toId: meta.client.id, kind: 'for-client' });
    }
    relate(`rel-${projectId}-produced-by`, { fromType: 'projects', fromId: projectId, toType: 'roles', toId: 'founder', kind: 'produced-by', note: 'Proyecto anterior al Hub; autoría del estudio.' });

    space(spaceId, { name: prj.name, slug: prj.slug, kind: 'project', parentId: PORTFOLIO_SPACE_ID, glyph: '◦', order: i + 1, aboutType: 'projects', aboutId: projectId, description: prj.summary });

    const sections = prj.pages
      .map((n) => {
        const p = pageById.get(pageAssetId(ASSET_IDS.portfolio, n));
        if (!p) return '';
        const head = p.headline ? `### p. ${n} — ${p.headline}` : `### p. ${n}`;
        const quote = p.text.trim() && !isLetterspaced(p.text) ? `\n\n> ${excerpt(p.text, 400)}` : '';
        return `${head}\n\n${p.description}${quote}\n\n_Imagen: \`${p.image}\`_`;
      })
      .join('\n\n');
    const postId = `post-pf-${prj.slug}`;
    post(postId, [spaceId, PORTFOLIO_SPACE_ID], {
      title: `${prj.name} (portafolio ${pageLabel})`,
      kind: 'note',
      authorId: users.founder,
      tags: ['brand', 'portfolio'],
      body: `${prj.summary}\n\n_Portafolio ${pageLabel} · tipo publicado: ${prj.type} · cliente: ${meta.client?.name ?? 'no publicado'} · ciudad y año: no publicados._\n\n${sections}`,
    });
    relate(`rel-${postId}-references-doc`, { fromType: 'posts', fromId: postId, toType: 'assets', toId: ASSET_IDS.portfolio, kind: 'references', note: pageLabel });
    pages.forEach((pageId) => relate(`rel-${pageId}-depicts-${prj.slug}`, { fromType: 'assets', fromId: pageId, toType: 'projects', toId: projectId, kind: 'depicts' }));
  });
  clients.forEach((row, id) => add('clients', id, row));

  // ---- Brochure p. 2: twenty named clients; three are portfolio projects ----
  const brochureP2 = pageAssetId(ASSET_IDS.brochure, 2);
  const byList = (kind: string) => BROCHURE_INDEX.projects.filter((p) => p.type.startsWith(kind));
  const line = (p: BrandProject) => `- ${p.name} (\`${p.slug}\`)${p.relatedPortfolioSlug ? ` — mostrado en el portafolio: \`${portfolioProjectId(p.relatedPortfolioSlug)}\`` : ''}`;
  post('post-brochure-clients', [PORTFOLIO_SPACE_ID], {
    title: 'Clientes nombrados en el brochure (p. 2)',
    kind: 'note',
    authorId: users.founder,
    tags: ['brand', 'clientes'],
    body: `El brochure (p. 2, "SOMOS") declara **8 años, 50 proyectos en Colombia, 4 internacionales, más de 16.743 m²** y nombra veinte clientes en dos listas. Solo tres aparecen también en el portafolio; los demás no tienen imágenes ni ficha y **no** están creados como proyectos (ver docs/knowledge/clients.md).\n\n**Residencial**\n\n${byList('residencial').map(line).join('\n')}\n\n**Comercial**\n\n${byList('comercial').map(line).join('\n')}\n\nNombres transcritos tal como están impresos.`,
  });
  relate('rel-post-brochure-clients-references-page', { fromType: 'posts', fromId: 'post-brochure-clients', toType: 'assets', toId: brochureP2, kind: 'references' });
  for (const p of BROCHURE_INDEX.projects) {
    if (p.relatedPortfolioSlug) relate(`rel-${brochureP2}-references-${p.relatedPortfolioSlug}`, { fromType: 'assets', fromId: brochureP2, toType: 'projects', toId: portfolioProjectId(p.relatedPortfolioSlug), kind: 'references', note: `Lista ${p.type}: "${p.name}"` });
  }

  // ---- Portfolio pp. 29-32: the studio's own product and lighting line (not client work) ----
  const products = PORTFOLIO_INDEX.products ?? [];
  if (products.length) {
    const productPages = [...new Set(products.flatMap((p) => p.pages))].sort((a, b) => a - b);
    post('post-portfolio-products', [PORTFOLIO_SPACE_ID], {
      title: 'Línea de productos y luminarias (portafolio pp. 29-32)',
      kind: 'note',
      authorId: users.founder,
      tags: ['brand', 'iluminación'],
      body: `Producto propio de Aluzina, no trabajo para clientes. Si esta línea es la misma que "Honey Valley Lighting" (\`prj-honey-valley\`) es **desconocido**: el portafolio la llama "Línea de luminarias y producto aluzina".\n\n${products.map((p) => `- **${p.name}** (\`${p.slug}\`, p. ${p.pages.join(', ')}): ${p.summary}`).join('\n')}`,
    });
    productPages.forEach((n) => relate(`rel-post-portfolio-products-references-p${String(n).padStart(2, '0')}`, { fromType: 'posts', fromId: 'post-portfolio-products', toType: 'assets', toId: pageAssetId(ASSET_IDS.portfolio, n), kind: 'references' }));
  }
}
