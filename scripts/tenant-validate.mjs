#!/usr/bin/env node
// tenant-validate (tp-03, D-094): checks the root `tenant.json` (manifestVersion 1) against the checkout.
// Contract: docs/tenant/manifest.md "What tenant-validate.mjs checks". Plain Node, no browser, no TypeScript
// loader: sources are read as text. One line per failure and exit 1; a summary line and exit 0 when green.
// Tenant-agnostic: every name it looks for (namespace literals, paths, counters) comes from the manifest.
// Usage: node scripts/tenant-validate.mjs [--manifest <path/to/tenant.json>]
//   --manifest  validate another tenant's manifest in place: its directory becomes the repo root every
//               relative path resolves against (tp-12). Default: ../tenant.json next to this script's repo.
// Schema (tp-12, D-098): the manifest is first checked structurally against `tenant.schema.json` (the copy
// next to the manifest when the tenant ships one, else this repo's), with the small walker below.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const manifestArg = argv.includes('--manifest') ? argv[argv.indexOf('--manifest') + 1] : undefined;
if (argv.includes('--manifest') && !manifestArg) {
  console.error('tenant-validate: --manifest needs a path');
  process.exit(2);
}
const manifestPath = manifestArg ? resolve(manifestArg) : join(scriptRoot, 'tenant.json');
const root = dirname(manifestPath);
const manifestName = basename(manifestPath);
const failures = [];
const warnings = [];
const notes = [];
const fail = (msg) => failures.push(msg);
const abs = (p) => join(root, p);
const read = (p) => readFileSync(abs(p), 'utf8');
const exists = (p) => existsSync(abs(p));
const isDir = (p) => exists(p) && statSync(abs(p)).isDirectory();
const nonEmpty = (p) => exists(p) && (!isDir(p) || readdirSync(abs(p)).length > 0);
const sameSet = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
const diff = (a, b) => {
  const A = new Set(a), B = new Set(b);
  const missing = [...B].filter((x) => !A.has(x)), extra = [...A].filter((x) => !B.has(x));
  return [missing.length ? `not in the manifest: ${missing.join(', ')}` : '', extra.length ? `only in the manifest: ${extra.join(', ')}` : ''].filter(Boolean).join('; ');
};

let m;
try {
  m = JSON.parse(read(manifestName));
} catch (e) {
  console.error(`tenant-validate: ${manifestName} does not parse: ${e.message}`);
  process.exit(1);
}
if (!exists('package.json')) {
  console.error(`tenant-validate: ${root} has no package.json; --manifest must point at a tenant repo's root manifest`);
  process.exit(1);
}
const pkg = JSON.parse(read('package.json'));

// ---- (j) structural check against tenant.schema.json (JSON Schema draft 2020-12 subset) ----------------
// Supported keywords: type (string or array; "integer"), const, enum, pattern, required, properties,
// additionalProperties (false or a schema), items, $ref to a local #/$defs/<name>. Anything else is ignored,
// so the schema must stay inside this subset (it is checked in the same file: unknown keywords are reported).
const SCHEMA_KEYWORDS = new Set(['$schema', '$id', 'title', 'description', 'type', 'const', 'enum', 'pattern', 'required', 'properties', 'additionalProperties', 'items', '$ref', '$defs']);
const schemaPath = exists('tenant.schema.json') ? 'tenant.schema.json' : join(scriptRoot, 'tenant.schema.json');
const schemaAbs = schemaPath === 'tenant.schema.json' ? abs(schemaPath) : schemaPath;
let schema = null;
try {
  schema = JSON.parse(readFileSync(schemaAbs, 'utf8'));
} catch (e) {
  fail(`tenant.schema.json: ${e.message}`);
}
const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v === 'number' && Number.isInteger(v) ? 'integer' : typeof v);
const typeOk = (want, v) => {
  const t = typeOf(v);
  return [want].flat().some((w) => w === t || (w === 'number' && t === 'integer'));
};
let schemaChecks = 0;
function checkSchema(s, v, at) {
  if (s.$ref) {
    const name = /^#\/\$defs\/(\w+)$/.exec(s.$ref)?.[1];
    const target = name && schema.$defs?.[name];
    if (!target) { fail(`tenant.schema.json: unresolvable $ref ${s.$ref} at ${at}`); return; }
    checkSchema({ ...target, ...Object.fromEntries(Object.entries(s).filter(([k]) => k !== '$ref')) }, v, at);
    return;
  }
  for (const k of Object.keys(s)) if (!SCHEMA_KEYWORDS.has(k)) fail(`tenant.schema.json: keyword "${k}" at ${at} is outside the validator's subset`);
  schemaChecks++;
  if ('const' in s && JSON.stringify(v) !== JSON.stringify(s.const)) { fail(`schema: ${at} is ${JSON.stringify(v)}, expected ${JSON.stringify(s.const)}`); return; }
  if (s.enum && !s.enum.some((e) => JSON.stringify(e) === JSON.stringify(v))) { fail(`schema: ${at} is ${JSON.stringify(v)}, expected one of ${s.enum.map((e) => JSON.stringify(e)).join(' | ')}`); return; }
  if (s.type && !typeOk(s.type, v)) { fail(`schema: ${at} is ${typeOf(v)}, expected ${[s.type].flat().join(' | ')}`); return; }
  if (s.pattern && typeof v === 'string' && !new RegExp(s.pattern).test(v)) fail(`schema: ${at} ${JSON.stringify(v)} does not match ${s.pattern}`);
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    for (const r of s.required ?? []) if (!(r in v)) fail(`schema: ${at} is missing required key "${r}"`);
    for (const [k, child] of Object.entries(v)) {
      const sub = s.properties?.[k];
      if (sub) checkSchema(sub, child, `${at}.${k}`);
      else if (s.additionalProperties === false) fail(`schema: ${at} has unexpected key "${k}" (closed set)`);
      else if (s.additionalProperties && typeof s.additionalProperties === 'object') checkSchema(s.additionalProperties, child, `${at}.${k}`);
    }
  }
  if (Array.isArray(v) && s.items) v.forEach((item, i) => checkSchema(s.items, item, `${at}[${i}]`));
}
if (schema) checkSchema(schema, m, manifestName.replace(/\.json$/, ''));

// ---- (g) manifest version and required top-level keys ---------------------------------------------------
const REQUIRED = ['manifestVersion', 'id', 'name', 'repo', 'version', 'identity', 'brand', 'surfaces', 'hubModules', 'subProjects', 'data', 'contentMounts', 'namespace', 'routing', 'deploy', 'docs', 'actions', 'hostRequirements'];
if (m.manifestVersion !== 1) fail(`manifestVersion is ${JSON.stringify(m.manifestVersion)}, expected 1`);
for (const k of REQUIRED) if (!(k in m)) fail(`${manifestName}: required top-level key "${k}" is missing`);
if (typeof m.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(m.id)) fail(`id ${JSON.stringify(m.id)} does not match ^[a-z][a-z0-9-]*$`);

// ---- (e) version mirrors root package.json --------------------------------------------------------------
if (m.version !== pkg.version) fail(`version ${m.version} != package.json version ${pkg.version}`);

// ---- (i) routing strategy is one it supports ------------------------------------------------------------
if (!m.routing || !Array.isArray(m.routing.supports) || !m.routing.supports.includes(m.routing.strategy)) {
  fail(`routing.strategy ${JSON.stringify(m.routing?.strategy)} is not in routing.supports ${JSON.stringify(m.routing?.supports)}`);
}

// ---- single-path fields must exist ----------------------------------------------------------------------
const pathFields = {
  spec: m.spec,
  'brand.tokenValues': m.brand?.tokenValues,
  'brand.tokenSchema': m.brand?.tokenSchema,
  'brand.generatedCss': m.brand?.generatedCss,
  'brand.paths': m.brand?.paths,
  'brand.renders': m.brand?.renders,
  'brand.sourceKit': m.brand?.sourceKit,
  'brand.brief': m.brand?.brief,
  'surfaces.rolesFile': m.surfaces?.rolesFile,
  'surfaces.permissionsFile': m.surfaces?.permissionsFile,
  'surfaces.demoUsersFile': m.surfaces?.demoUsersFile,
  'surfaces.navGroupsFile': m.surfaces?.navGroupsFile,
  'surfaces.hubCardsFile': m.surfaces?.hubCardsFile,
  'data.providerInterface': m.data?.providerInterface,
  'data.schemaDir': m.data?.schemaDir,
  'data.seedDir': m.data?.seedDir,
  'data.domainDir': m.data?.domainDir,
  'namespace.config': m.namespace?.config,
  'namespace.tenantDir': m.namespace?.tenantDir,
  'deploy.workflow': m.deploy?.workflow,
  'deploy.ciWorkflow': m.deploy?.ciWorkflow,
  'docs.root': m.docs?.root,
  'docs.plan': m.docs?.plan,
  'docs.kanban': m.docs?.kanban,
  'docs.buildPlan': m.docs?.buildPlan,
  'docs.decisions': m.docs?.decisions,
  'docs.pagesDir': m.docs?.pagesDir,
  'docs.pageTemplate': m.docs?.pageTemplate,
  'docs.screenshotsDir': m.docs?.screenshotsDir,
  'docs.knowledge': m.docs?.knowledge,
  'docs.surfaces': m.docs?.surfaces,
  'docs.tenantDocs': m.docs?.tenantDocs,
  'actions.bus': m.actions?.bus,
};
let pathsChecked = 0;
for (const [field, p] of Object.entries(pathFields)) {
  if (p == null) continue;
  pathsChecked++;
  if (!exists(p)) fail(`${field}: ${p} does not exist`);
}
for (const d of m.brand?.documents ?? []) {
  pathsChecked++;
  if (!exists(d.file)) fail(`brand.documents: ${d.file} does not exist`);
}
for (const p of m.data?.providers ?? []) {
  pathsChecked++;
  if (!exists(p.file)) fail(`data.providers[${p.name}]: ${p.file} does not exist`);
}

// ---- (a) hub modules: folder set, paths, codes ----------------------------------------------------------
const modulesDir = 'apps/hub/src/modules';
const folders = isDir(modulesDir) ? readdirSync(abs(modulesDir)).filter((n) => isDir(join(modulesDir, n))) : [];
if (!isDir(modulesDir)) fail(`${modulesDir} does not exist (manifest v1 describes a hub-shaped tenant repo)`);
const listed = (m.hubModules ?? []).map((h) => h.name);
if (!sameSet(folders, listed)) fail(`hubModules names != folders of ${modulesDir}: ${diff(listed, folders)}`);

/** Page codes a specs.ts defines: `code: 'X-nn'` literals, plus codes a spec factory is called with (see below). */
function specCodes(file) {
  const src = read(file);
  const codes = new Set([...src.matchAll(/\bcode:\s*['"]((?:HUB|BOS|[A-Z])-\d{2})['"]/g)].map((x) => x[1]));
  // Generated specs (manual M-03..M-07): `serviceSpec(code)` is fed from an object literal keyed by page code
  // (`SERVICE_CODES_BY_PAGE = { 'M-03': '01', ... }`); a spec factory `function xSpec(code: string)` marks the file.
  if (/export function \w+Spec\(\s*code\b/.test(src)) {
    for (const x of src.matchAll(/['"]((?:HUB|BOS|[A-Z])-\d{2})['"]\s*:/g)) codes.add(x[1]);
  }
  return [...codes];
}
const allSpecCodes = new Set();
let codeCount = 0;
// (k) actions recount (tp-12): every `id: '<module>.<verb>'` literal in a module's specs.ts is one declaration.
const actionIdRe = new RegExp(`\\bid:\\s*['"](${(m.actions?.idPattern ?? '^[a-z][a-zA-Z0-9]*\\.[a-z][a-zA-Z0-9]*$').replace(/^\^|\$$/g, '')})['"]`, 'g');
const actionIds = [];
for (const h of m.hubModules ?? []) {
  if (!isDir(h.path)) { fail(`hubModules[${h.name}].path ${h.path} does not exist`); continue; }
  const specs = join(h.path, 'specs.ts');
  if (!exists(specs)) { fail(`hubModules[${h.name}]: ${specs} is missing`); continue; }
  const found = specCodes(specs);
  found.forEach((c) => allSpecCodes.add(c));
  codeCount += h.codes.length;
  if (!sameSet(found, h.codes)) fail(`hubModules[${h.name}].codes != codes in ${specs}: ${diff(h.codes, found)}`);
  for (const x of read(specs).matchAll(actionIdRe)) actionIds.push(x[1]);
}
// Platform declarations (D-106): shared action lists appended to routes at registry time (the page desks' `desk.*`).
for (const f of m.actions?.platformDeclarations ?? []) {
  if (!exists(f)) { fail(`actions.platformDeclarations: ${f} does not exist`); continue; }
  for (const x of read(f).matchAll(actionIdRe)) actionIds.push(x[1]);
}
for (const c of m.surfaces?.nextFreeCodes ?? []) if (allSpecCodes.has(c)) fail(`surfaces.nextFreeCodes: ${c} is already defined in a specs.ts`);
const actionsDistinct = new Set(actionIds).size;
if (m.actions?.declared !== actionIds.length) fail(`actions.declared is ${m.actions?.declared}, specs.ts declare ${actionIds.length} action ids`);
if (m.actions?.distinct !== actionsDistinct) fail(`actions.distinct is ${m.actions?.distinct}, specs.ts declare ${actionsDistinct} distinct action ids`);

// ---- surfaces and roles mirror the code -----------------------------------------------------------------
const pageSpec = exists('apps/hub/src/specs/PageSpec.ts') ? read('apps/hub/src/specs/PageSpec.ts') : '';
const surfacesSrc = /export const SURFACES[^=]*=\s*\[([^\]]*)\]/.exec(pageSpec);
if (!surfacesSrc) fail('apps/hub/src/specs/PageSpec.ts: SURFACES not found');
else {
  const surfaces = [...surfacesSrc[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  if (!sameSet(surfaces, m.surfaces.list)) fail(`surfaces.list != SURFACES in PageSpec.ts: ${diff(m.surfaces.list, surfaces)}`);
}
if (m.surfaces?.rolesFile && exists(m.surfaces.rolesFile)) {
  const rolesSrc = /export const ROLES\s*=\s*\[([^\]]*)\]/.exec(read(m.surfaces.rolesFile));
  const roles = rolesSrc ? [...rolesSrc[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : [];
  if (!sameSet(roles, m.surfaces.roles)) fail(`surfaces.roles != ROLES in ${m.surfaces.rolesFile}: ${diff(m.surfaces.roles, roles)}`);
}

// ---- (b) sub-projects, (c) content mounts ---------------------------------------------------------------
let subPaths = 0;
for (const s of m.subProjects ?? []) {
  for (const p of s.paths ?? []) {
    subPaths++;
    if (!nonEmpty(p)) fail(`subProjects[${s.id}].paths: ${p} does not exist or is empty`);
  }
  if (s.readme && !exists(s.readme)) fail(`subProjects[${s.id}].readme: ${s.readme} does not exist`);
  if (s.entry && !/^https?:/.test(s.entry) && !exists(s.entry)) fail(`subProjects[${s.id}].entry: ${s.entry} does not exist`);
  for (const d of s.dependsOn ?? []) if (!(m.subProjects ?? []).some((x) => x.id === d)) fail(`subProjects[${s.id}].dependsOn: unknown id ${d}`);
}
for (const c of m.contentMounts ?? []) if (!nonEmpty(c.path)) fail(`contentMounts[${c.id}].path: ${c.path} does not exist or is empty`);

// ---- (h) seed version, entities --------------------------------------------------------------------------
const seedIndex = join(m.data?.seedDir ?? 'apps/hub/src/tenant/seed', 'index.ts');
const seedVersion = exists(seedIndex) ? /export const SEED_VERSION\s*=\s*(\d+)/.exec(read(seedIndex))?.[1] : undefined;
const provider = (m.data?.providers ?? []).find((p) => p.name === 'mock');
if (seedVersion === undefined) fail(`${seedIndex}: SEED_VERSION not found`);
else if (Number(seedVersion) !== m.data.seedVersion) fail(`data.seedVersion ${m.data.seedVersion} != SEED_VERSION ${seedVersion} (${seedIndex})`);
if (provider && exists(provider.file) && !/\bSEED_VERSION\b/.test(read(provider.file))) fail(`${provider.file} does not use SEED_VERSION`);
const schemaIndexPath = join(m.data?.schemaDir ?? 'apps/hub/src/data/schema', 'index.ts');
const schemaIndex = exists(schemaIndexPath) ? read(schemaIndexPath) : '';
const entityMap = /export interface EntityMap\s*\{([^}]*)\}/.exec(schemaIndex);
const entities = entityMap ? [...entityMap[1].matchAll(/^\s*(\w+)\s*:/gm)].map((x) => x[1]) : [];
if (!sameSet(entities, m.data?.entities ?? [])) fail(`data.entities != EntityMap keys: ${diff(m.data?.entities ?? [], entities)}`);
const seedModules = isDir(m.data?.seedDir ?? '') ? readdirSync(abs(m.data.seedDir)).filter((n) => n.endsWith('.ts') && !['index.ts', 'types.ts'].includes(n)).map((n) => n.replace(/\.ts$/, '')) : [];
if (!sameSet(seedModules, m.data?.seedModules ?? [])) fail(`data.seedModules != modules in ${m.data?.seedDir}: ${diff(m.data?.seedModules ?? [], seedModules)}`);

// ---- (d) docs counters equal the highest numbered file --------------------------------------------------
const highest = (dir) => (isDir(dir) ? Math.max(0, ...readdirSync(abs(dir)).map((n) => /^(\d{4})-/.exec(n)?.[1]).filter(Boolean).map(Number)) : 0);
const counters = {
  prompts: highest('docs/prompts'),
  changelog: highest('docs/changelog'),
  decisions: exists(m.docs?.decisions ?? '') ? Math.max(0, ...[...read(m.docs.decisions).matchAll(/^\| D-(\d{3}) \|/gm)].map((x) => Number(x[1]))) : 0,
  qa: highest('docs/qa'),
};
for (const [k, v] of Object.entries(counters)) {
  if (m.docs?.counters?.[k] !== v) fail(`docs.counters.${k} is ${m.docs?.counters?.[k]}, highest in the repo is ${v}`);
}
if (m.docs?.pendingDir && isDir(m.docs.pendingDir) && readdirSync(abs(m.docs.pendingDir)).length) {
  notes.push(`${m.docs.pendingDir} has ${readdirSync(abs(m.docs.pendingDir)).length} draft(s) waiting for the integrator`);
}

// ---- plan.json: parses, dependsOn ids exist, every step is a build-plan row ----------------------------
try {
  const plan = JSON.parse(read(m.docs.plan));
  const ids = new Set(plan.tasks.map((t) => t.id));
  const buildPlan = read(m.docs.buildPlan);
  const steps = new Set([...buildPlan.matchAll(/^\| \*\*(\S+?)[* ]/gm)].map((x) => x[1]));
  for (const t of plan.tasks) {
    for (const d of t.dependsOn ?? []) if (!ids.has(d)) fail(`${m.docs.plan}: ${t.id} dependsOn unknown task ${d}`);
    if (!steps.has(String(t.step))) fail(`${m.docs.plan}: ${t.id} step ${t.step} has no row in ${m.docs.buildPlan}`);
    if (!plan.statuses.includes(t.status)) fail(`${m.docs.plan}: ${t.id} status ${t.status} is not one of ${plan.statuses.join('/')}`);
  }
} catch (e) {
  fail(`${m.docs.plan}: ${e.message}`);
}

// ---- (f) no namespace literal in an executable string position ------------------------------------------
// Forbidden: `${id}.<storage key>`, every channel name, the window global `__${id}`. Allowed: Markdown, comments,
// `strings.ts` (UI prose), prose fields of `specs.ts`, files under the tenant dir, and `namespace.literalAllowlist`.
const id = m.id;
const keyHeads = [...new Set(Object.values(m.namespace.storageKeys ?? {}).flat().map((k) => k.split(/[.<]/)[0]))];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const forbidden = new RegExp(`${esc(id)}\\.(?:${keyHeads.map(esc).join('|')})\\b|${(m.namespace.channels ?? []).map(esc).join('|')}|__${esc(id)}\\b`);
const PROSE_KEYS = new Set(['logic', 'label', 'intent', 'description', 'purpose', 'notes', 'layout', 'name']);
const tenantDir = m.namespace.tenantDir;
const allow = new Set(m.namespace.literalAllowlist ?? []);

/** Tokens of a JS / TS source: string literals (with offsets) and single punctuation / words; comments dropped. */
function tokenize(src) {
  const out = [];
  let i = 0;
  let prev = '';
  const regexOk = () => prev === '' || /[(,=:[!&|?{};+\-*%<>~^]$/.test(prev) || /^(return|typeof|case|in|of|new|delete|void|throw)$/.test(prev);
  while (i < src.length) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 2; continue; }
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      while (j < src.length && src[j] !== c) { if (src[j] === '\\') j++; if (c !== '`' && src[j] === '\n') break; j++; }
      out.push({ t: 'str', v: src.slice(i + 1, j), at: i });
      prev = 'str';
      i = j + 1;
      continue;
    }
    if (c === '/' && regexOk()) {
      let j = i + 1, cls = false;
      while (j < src.length && src[j] !== '\n' && (cls || src[j] !== '/')) { if (src[j] === '\\') j++; else if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; j++; }
      prev = 'regex';
      i = j + 1;
      continue;
    }
    if (/\s/.test(c)) { i++; continue; }
    const w = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, i + 64));
    if (w) { out.push({ t: 'word', v: w[0], at: i }); prev = w[0]; i += w[0].length; continue; }
    out.push({ t: 'p', v: c, at: i });
    prev = c;
    i++;
  }
  return out;
}
/** The object key a string token belongs to (`logic: ['...']` -> logic), walking back over arrays and calls. */
function ownerKey(tokens, k) {
  let depth = 0;
  for (let j = k - 1; j >= 0; j--) {
    const t = tokens[j];
    if (t.t === 'p') {
      if (t.v === ']' || t.v === ')' || t.v === '}') depth++;
      else if (t.v === '[' || t.v === '(') { if (depth > 0) depth--; }
      else if (t.v === '{') { if (depth > 0) depth--; else return null; }
      else if (t.v === ':' && depth === 0) { const key = tokens[j - 1]; return key ? key.v : null; }
      // `const BROWSER_LOGIC = [ ... ]` later spread into `logic:`: the constant's name is the owner.
      else if (t.v === '=' && depth === 0) { const key = tokens[j - 1]; return key && key.t === 'word' ? key.v : null; }
    }
  }
  return null;
}
function* walk(dir) {
  for (const n of readdirSync(abs(dir))) {
    const p = join(dir, n);
    if (n === 'node_modules') continue;
    if (isDir(p)) yield* walk(p);
    else yield p;
  }
}
const scanFiles = [
  ...['apps/hub/src', 'apps/hub/scripts', 'scripts'].filter(isDir).flatMap((d) => [...walk(d)]),
  'apps/hub/index.html',
].filter((p) => exists(p) && /\.(ts|tsx|mjs|js|html)$/.test(p));
let scanned = 0;
for (const file of scanFiles) {
  if (allow.has(file) || (tenantDir && file.startsWith(tenantDir + '/')) || /(^|\/)strings\.ts$/.test(file)) continue;
  let src = read(file);
  if (!forbidden.test(src)) { scanned++; continue; }
  scanned++;
  if (file.endsWith('.html')) {
    src = src.replace(/<!--[\s\S]*?-->/g, (s) => ' '.repeat(s.length));
    const scripts = [...src.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
    const outside = src.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    if (forbidden.test(outside)) fail(`${file}: namespace literal in markup (derive it from tenant.json, e.g. %TENANT_ID%)`);
    for (const s of scripts) for (const t of tokenize(s[1])) if (t.t === 'str' && forbidden.test(t.v)) fail(`${file}: namespace literal "${forbidden.exec(t.v)[0]}" in an inline script string`);
    continue;
  }
  const tokens = tokenize(src);
  const isSpecs = /(^|\/)specs\.ts$/.test(file);
  tokens.forEach((t, k) => {
    if (t.t === 'word' && t.v === `__${id}`) {
      fail(`${file}:${src.slice(0, t.at).split('\n').length}: the global __${id} used as an identifier (read it through GLOBAL_NAME)`);
      return;
    }
    if (t.t !== 'str' || !forbidden.test(t.v)) return;
    const owner = ownerKey(tokens, k);
    if (isSpecs && owner && (PROSE_KEYS.has(owner) || [...PROSE_KEYS].some((p) => owner.toLowerCase().split('_').includes(p)))) return;
    const line = src.slice(0, t.at).split('\n').length;
    fail(`${file}:${line}: namespace literal "${forbidden.exec(t.v)[0]}" in an executable string (derive it with storageKey() / channelName() / GLOBAL_NAME)`);
  });
}

// ---- generatedFrom freshness (warning only) -------------------------------------------------------------
try {
  const behind = Number(execSync(`git rev-list --count ${m.generatedFrom}..HEAD`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim());
  if (behind > 50) warnings.push(`generatedFrom ${m.generatedFrom} is ${behind} commits behind HEAD; re-verify the manifest`);
} catch {
  /* shallow clone or no git: skip */
}

// ---- report ---------------------------------------------------------------------------------------------
for (const w of warnings) console.warn(`tenant-validate: warning: ${w}`);
for (const n of notes) console.log(`tenant-validate: note: ${n}`);
if (failures.length) {
  for (const f of failures) console.error(`tenant-validate: FAIL ${f}`);
  console.error(`tenant-validate: ${failures.length} failure(s); fix ${manifestName} or the code it describes (spec: ${m.spec ?? 'docs/tenant/manifest.md'}, schema: tenant.schema.json)`);
  process.exit(1);
}
console.log(
  `tenant-validate: OK ${m.id} v${m.version} manifestVersion ${m.manifestVersion} — schema ${schemaChecks} nodes, ${m.hubModules.length} modules / ${codeCount} codes, ` +
    `${actionIds.length} actions (${actionsDistinct} distinct), ${m.subProjects.length} sub-projects (${subPaths} paths), ${m.contentMounts.length} content mounts, ${pathsChecked} path fields, ` +
    `seed v${seedVersion}, ${entities.length} entities, counters prompts ${counters.prompts} / changelog ${counters.changelog} / decisions ${counters.decisions} / qa ${counters.qa}, ` +
    `routing ${m.routing.strategy}, ${scanned} files scanned for namespace literals`,
);
