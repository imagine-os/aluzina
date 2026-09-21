#!/usr/bin/env python3
"""Download allow-listed files of a crawled Dropbox folder, render thumbnails / page images, and re-encode the kept renders
into the hub's served folder. Intake step 3 of the project archive (prompt 0017, changelog 0019, D-058, D-059).
Promoted from the pass-0019 worker scripts (`joe-gallina/download.py`, `render.py`, `largepass.py`, `privacy.py`) with
paths and limits as arguments; the download / render logic is theirs.

Subcommands
  download  --entries=<entries.json> --files=<dir> [--budget-mb=400] [--max-single-mb=120] [--allow=<prefix>[,<prefix>]]
            [--deny-names=<regex>]   curl -L (dl=1) each file the allow-list permits, size-checked against the listing;
            writes <files>/../download-log.{json,md}. Default allow-list: `DISEÑO/` plus nothing at the root; default
            deny: the D-059 NAME_RE (RUT, seguridad social, contrato, factura, cotización, ...) and the administrative /
            supplier / closing folders. TLS: curl's default verification through HTTPS_PROXY (never disabled).
  render    --entries=<entries.json> --files=<dir> --out=<dir> [--pages=12] [--page-px=1400] [--thumb-px=640]
            PyMuPDF for pdf / ai / eps, Pillow for images, LibreOffice (soffice --headless) for Office files, ffmpeg for
            one video frame; writes <out>/thumbs/<slug>[-page-NN].jpg and <out>/index.json (shape `DeepIndex`, raw:
            build-index.mjs redacts it). Files not downloaded (or denied) get `thumb: null, pages: []`.
  stream    --index=<index.json> --out=<dir> --paths=<path>[,<path>]   one very large PDF at a time: download to a temp
            file, render, delete (`downloaded: false`, `renderer: pymupdf`), as the workers did for the 0.3-1 GB presentations.
  serve     --index=<redacted index.json> --src=<thumbs dir> --dest=<apps/hub/public/archive/<slug>> [--max-pages=8]
            [--thumb-px=640] [--thumb-q=80] [--page-px=1200] [--page-q=72]   copies the renders the REDACTED index still
            references into <dest>/thumbs and <dest>/pages, re-encoded to the served limits, and reports the bytes.
            The committed index must reference only files that exist under <dest>: `serve` prunes `pages` / `thumb`
            entries whose source render is missing and rewrites the index in place.
"""
import io, json, mimetypes, os, re, shutil, subprocess, sys, time, unicodedata

FFMPEG = os.environ.get('FFMPEG', '/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux')
SOFFICE = os.environ.get('SOFFICE', '/usr/bin/soffice')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
NAME_RE = re.compile(r'\brut\b|seguridad social|seg soc|planilla|autoliquidacion|\barus\b|cedula|tarjeta profesional|contrato|contract|agree?ment|comprobante|cuenta ?de ?cobro|cuentadecobro|factura|\bfv-|\bfra\b|\bcxc\b|pedido|cotizaci|quotation|invoice|whatsapp image|\bpagos?\b|payment|\bcash\b|asana|\.xml$|c\.m ', re.I)
FOLDER_RE = re.compile(r'administrativo y financiero|suppliers and financial status|cierre de proyecto|contables|cuentas de cobro|facturas', re.I)


def args_of(argv):
    out = {}
    for a in argv:
        m = re.match(r'^--([^=]+)(?:=(.*))?$', a)
        if m: out[m.group(1)] = m.group(2) if m.group(2) is not None else 'true'
    return out


def strip(s): return unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()


def slugify(path):
    base = re.sub(r'\.[A-Za-z0-9]{1,6}$', '', path)
    segs = []
    for seg in base.split('/'):
        s = re.sub(r'[^A-Za-z0-9]+', '-', strip(seg)).strip('-').lower()
        segs.append(s or 'x')
    return '--'.join(segs)


def slugs_for(files):
    slugs, used = {}, set()
    for e in files:
        s = slugify(e['path']); b = s; i = 2
        while s in used: s = f'{b}-{i}'; i += 1
        used.add(s); slugs[e['path']] = s
    return slugs


def deny_reason(path, allow_prefixes, deny_re):
    """None when the file may be downloaded / rendered, else a short reason (privacy first, then the allow-list)."""
    name = path.rsplit('/', 1)[-1]
    folder = path[: -len(name)].rstrip('/')
    if FOLDER_RE.search(strip(folder)): return 'privacy: administrative / supplier / closing folder (D-059)'
    if deny_re.search(strip(name).replace('_', ' ')): return 'privacy: file name pattern (D-059)'
    if not any(path.startswith(p) for p in allow_prefixes): return 'not in preview allow-list'
    return None


def unit_tol(size_text):
    try:
        num, unit = size_text.split()
        k = {'B': 1, 'KB': 1024, 'MB': 1024 ** 2, 'GB': 1024 ** 3}[unit.upper()]
        dec = len(num.split('.')[1]) if '.' in num else 0
        return 0.5 * k / (10 ** dec) + 0.01 * float(num) * k + 1024
    except Exception:
        return 0.02 * 1e9


def curl(url, dest, max_time='900'):
    p = subprocess.run(['curl', '-sS', '-L', '-A', UA, '--max-time', max_time, '-o', dest, '-w', '%{http_code}', url], capture_output=True, text=True)
    return p.returncode, p.stdout.strip(), p.stderr.strip()[:200]


def dl_url(href):
    url = href.replace('dl=0', 'dl=1')
    if 'dl=1' not in url: url += ('&' if '?' in url else '?') + 'dl=1'
    return url


# ---------------------------------------------------------------------------------------------------------------------
def cmd_download(a):
    entries = json.load(open(a['entries']))
    files = [e for e in entries['entries'] if not e['is_dir']]
    root = a['files']; os.makedirs(root, exist_ok=True)
    budget = int(a.get('budget-mb', '400')) * 1024 * 1024
    max_single = int(a.get('max-single-mb', '120')) * 1024 * 1024
    allow = [p for p in a.get('allow', 'DISEÑO/').split(',') if p]
    deny_re = re.compile(a['deny-names'], re.I) if a.get('deny-names') else NAME_RE
    log, spent = [], 0
    for e in files:
        rel = e['path']; dest = os.path.join(root, rel)
        row = {'path': rel, 'listed': e['size'], 'size_text': e.get('size_text')}
        why = deny_reason(rel, allow, deny_re)
        if why:
            if os.path.exists(dest): os.remove(dest)
            row.update(status='skipped', reason=why, bytes=0); log.append(row); continue
        if e['size'] is None:
            row.update(status='failed', reason='no size listed', bytes=0); log.append(row); continue
        if e['size'] > max_single:
            row.update(status='skipped', reason=f'over {max_single // 1024 // 1024} MB single-file limit (use stream)', bytes=0); log.append(row); continue
        if spent + e['size'] > budget:
            row.update(status='skipped', reason='total budget exhausted', bytes=0); log.append(row); continue
        if os.path.exists(dest) and abs(os.path.getsize(dest) - e['size']) <= unit_tol(e.get('size_text') or ''):
            b = os.path.getsize(dest); spent += b
            row.update(status='ok', bytes=b, reason='already present'); log.append(row); continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        ok, err = False, ''
        for _ in range(3):
            rc, code, stderr = curl(dl_url(e['href']), dest)
            if rc == 0 and code == '200' and os.path.exists(dest):
                b = os.path.getsize(dest)
                if abs(b - e['size']) <= unit_tol(e.get('size_text') or ''): ok = True; break
                err = f'size mismatch got {b} listed {e["size"]}'
            else:
                err = f'curl rc={rc} http={code} {stderr}'
            time.sleep(3)
        if ok:
            b = os.path.getsize(dest); spent += b
            row.update(status='ok', bytes=b); print(f'ok   {b:>12} {rel}', flush=True)
        else:
            row.update(status='failed', bytes=os.path.getsize(dest) if os.path.exists(dest) else 0, reason=err); print(f'FAIL {rel}: {err}', flush=True)
        log.append(row)
    logdir = os.path.dirname(os.path.abspath(root))
    json.dump({'spent': spent, 'rows': log}, open(os.path.join(logdir, 'download-log.json'), 'w'), indent=1, ensure_ascii=False)
    okc = sum(1 for r in log if r['status'] == 'ok'); sk = [r for r in log if r['status'] == 'skipped']; fl = [r for r in log if r['status'] == 'failed']
    with open(os.path.join(logdir, 'download-log.md'), 'w') as f:
        f.write(f"# Download log — {entries.get('folderName')}\n\n- Files listed: {len(files)}\n- Downloaded ok: {okc} ({spent:,} bytes)\n- Skipped: {len(sk)}\n- Failed: {len(fl)}\n\n| status | bytes | listed | path | note |\n|---|---:|---:|---|---|\n")
        for r in log: f.write(f"| {r['status']} | {r.get('bytes', 0):,} | {r.get('size_text') or ''} | {r['path']} | {r.get('reason') or ''} |\n")
    print(f'done ok={okc} skipped={len(sk)} failed={len(fl)} spent={spent:,}')


# ---------------------------------------------------------------------------------------------------------------------
def save_jpg(img, path, maxside, q=80):
    from PIL import Image
    img = img.convert('RGB'); img.thumbnail((maxside, maxside), Image.LANCZOS); img.save(path, 'JPEG', quality=q, optimize=True)


def palette(img, n=6):
    from PIL import Image
    im = img.convert('RGB'); im.thumbnail((120, 120))
    q = im.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[: n * 3]; counts = sorted(q.getcolors(), reverse=True)
    return ['#%02x%02x%02x' % tuple(pal[idx * 3: idx * 3 + 3]) for _, idx in counts[:n]]


def pix_to_img(pix):
    from PIL import Image
    return Image.frombytes('RGB', (pix.width, pix.height), pix.samples) if pix.n == 3 else Image.open(io.BytesIO(pix.tobytes('png')))


def render_pdf(doc, slug, rec, thumbs, pages_n, page_px, thumb_px):
    import pymupdf
    rec['pageCount'] = doc.page_count
    p0 = doc[0]; zoom = page_px / max(p0.rect.width, 1)
    img = pix_to_img(p0.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False))
    save_jpg(img.copy(), os.path.join(thumbs, f'{slug}.jpg'), thumb_px); rec['thumb'] = f'thumbs/{slug}.jpg'
    rec['palette'] = palette(img)
    pages = []
    for i in range(min(pages_n, doc.page_count)):
        pg = doc[i]; z = page_px / max(pg.rect.width, 1)
        im = pix_to_img(pg.get_pixmap(matrix=pymupdf.Matrix(z, z), alpha=False))
        save_jpg(im, os.path.join(thumbs, f'{slug}-page-{i + 1:02d}.jpg'), page_px); pages.append(f'thumbs/{slug}-page-{i + 1:02d}.jpg')
    rec['pages'] = pages
    txt = ''
    for i in range(min(5, doc.page_count)):
        txt += doc[i].get_text() + '\n'
        if len(txt) > 700: break
    rec['textExcerpt'] = re.sub(r'\s+', ' ', txt).strip()[:600] or ''


def cmd_render(a):
    import pymupdf
    from PIL import Image
    entries = json.load(open(a['entries']))
    files = [e for e in entries['entries'] if not e['is_dir']]
    root = a['files']; out = a['out']; thumbs = os.path.join(out, 'thumbs'); os.makedirs(thumbs, exist_ok=True)
    pages_n = int(a.get('pages', '12')); page_px = int(a.get('page-px', '1400')); thumb_px = int(a.get('thumb-px', '640'))
    logp = os.path.join(os.path.dirname(os.path.abspath(root)), 'download-log.json')
    dl = {r['path']: r for r in json.load(open(logp))['rows']} if os.path.exists(logp) else {}
    slugs = slugs_for(files)
    index = {'folderName': entries.get('folderName'), 'sourceUrl': entries['rootUrl'], 'crawledAt': entries.get('crawledAt'), 'fileCount': len(files), 'totalBytes': sum(e['size'] or 0 for e in files), 'files': []}
    stats = {}
    for e in files:
        slug = slugs[e['path']]; local = os.path.join(root, e['path']); row = dl.get(e['path'], {})
        downloaded = os.path.exists(local) and row.get('status', 'ok') == 'ok'
        rec = {'path': e['path'], 'name': e['name'], 'ext': e['ext'], 'mimeType': mimetypes.guess_type(e['name'])[0], 'bytes': os.path.getsize(local) if downloaded else e['size'], 'modified': e['modified'], 'sourceHref': e['href'],
               'downloaded': downloaded, 'downloadStatus': row.get('status'), 'downloadNote': row.get('reason'), 'thumb': None, 'pages': [], 'pageCount': None, 'textExcerpt': '', 'palette': [], 'renderer': None, 'renderError': None, 'slug': slug}
        ext = e['ext']
        if downloaded:
            try:
                if ext in ('pdf', 'ai', 'eps'):
                    doc = pymupdf.open(local); render_pdf(doc, slug, rec, thumbs, pages_n, page_px, thumb_px); rec['renderer'] = 'pymupdf'; doc.close()
                elif ext in ('jpg', 'jpeg', 'jfif', 'png', 'webp', 'tif', 'tiff', 'gif', 'bmp', 'heic'):
                    img = Image.open(local); img.load()
                    save_jpg(img.copy(), os.path.join(thumbs, f'{slug}.jpg'), thumb_px); rec['thumb'] = f'thumbs/{slug}.jpg'
                    rec['palette'] = palette(img); rec['renderer'] = 'pillow'
                elif ext in ('pptx', 'docx', 'xlsx', 'ppt', 'doc', 'xls', 'odt', 'odp', 'ods'):
                    outdir = os.path.join(out, 'lo-pdf'); os.makedirs(outdir, exist_ok=True)
                    pdf = os.path.join(outdir, os.path.splitext(os.path.basename(local))[0] + '.pdf')
                    if not os.path.exists(pdf):
                        subprocess.run([SOFFICE, '--headless', '--convert-to', 'pdf', '--outdir', outdir, local], capture_output=True, timeout=300)
                    if os.path.exists(pdf):
                        doc = pymupdf.open(pdf); render_pdf(doc, slug, rec, thumbs, pages_n, page_px, thumb_px); rec['renderer'] = 'libreoffice'; doc.close()
                    else: rec['renderError'] = 'libreoffice conversion produced no pdf'
                elif ext in ('mp4', 'mov', 'm4v', 'avi', 'webm'):
                    tmp = os.path.join(thumbs, f'{slug}.png')
                    subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-ss', '1', '-i', local, '-frames:v', '1', tmp], capture_output=True, timeout=120)
                    if os.path.exists(tmp):
                        img = Image.open(tmp); save_jpg(img.copy(), os.path.join(thumbs, f'{slug}.jpg'), thumb_px); rec['thumb'] = f'thumbs/{slug}.jpg'
                        rec['palette'] = palette(img); rec['renderer'] = 'ffmpeg'; os.remove(tmp)
                    else: rec['renderError'] = 'ffmpeg produced no frame'
                else:
                    rec['renderError'] = 'no renderer'
            except Exception as ex:
                rec['renderError'] = f'{type(ex).__name__}: {str(ex)[:120]}'
        key = rec['renderer'] or ('error:' + (rec['renderError'] or 'n/a') if downloaded else 'not-downloaded')
        stats[key] = stats.get(key, 0) + 1
        print(f"{key:<28} {e['path']}", flush=True)
        index['files'].append(rec)
    index['renderStats'] = stats
    json.dump(index, open(os.path.join(out, 'index.json'), 'w'), indent=1, ensure_ascii=False)
    print(json.dumps(stats, indent=1))


# ---------------------------------------------------------------------------------------------------------------------
def cmd_stream(a):
    import pymupdf
    idx_path = a['index']; index = json.load(open(idx_path)); out = a['out']; thumbs = os.path.join(out, 'thumbs'); os.makedirs(thumbs, exist_ok=True)
    recs = {r['path']: r for r in index['files']}
    tmpdir = os.path.join(out, 'tmp'); os.makedirs(tmpdir, exist_ok=True)
    min_free = 2.5 * 1024 ** 3
    pages_n = int(a.get('pages', '12')); page_px = int(a.get('page-px', '1400')); thumb_px = int(a.get('thumb-px', '640'))
    log = []
    for path in [p for p in a['paths'].split(',') if p]:
        rec = recs[path]; row = {'path': path, 'listed': rec['bytes']}
        if rec.get('renderer') == 'pymupdf' and rec.get('pages'):
            row['status'] = 'already rendered'; log.append(row); continue
        free = shutil.disk_usage(tmpdir).free
        if free < min_free:
            row.update(status='skipped', reason=f'only {free:,} bytes free (< 2.5 GB)'); log.append(row); continue
        local = os.path.join(tmpdir, 'stream.pdf'); ok, err = False, ''
        for attempt in range(2):
            if os.path.exists(local): os.remove(local)
            t0 = time.time(); rc, code, stderr = curl(dl_url(rec['sourceHref']), local, '1800')
            got = os.path.getsize(local) if os.path.exists(local) else 0
            if rc == 0 and code == '200' and got > 0.97 * (rec['bytes'] or 0): ok = True; break
            err = f'attempt {attempt + 1}: rc={rc} http={code} got={got:,} {stderr}'
        if not ok:
            if os.path.exists(local): os.remove(local)
            rec['renderError'] = 'stream download failed: ' + err; row.update(status='failed', reason=err); log.append(row); continue
        try:
            doc = pymupdf.open(local); render_pdf(doc, rec['slug'], rec, thumbs, pages_n, page_px, thumb_px); doc.close()
            rec['renderer'] = 'pymupdf'; rec['downloaded'] = False; rec['renderError'] = None
            rec['downloadNote'] = 'over the single-file limit: streamed to tmp, rendered, then deleted (not kept)'
            row.update(status='rendered-not-kept', bytes=os.path.getsize(local), pageCount=rec['pageCount'], secs=round(time.time() - t0))
        except Exception as ex:
            rec['renderError'] = f'{type(ex).__name__}: {str(ex)[:120]}'; row.update(status='render-failed', reason=rec['renderError'])
        finally:
            if os.path.exists(local): os.remove(local)
        log.append(row); json.dump(index, open(idx_path, 'w'), indent=1, ensure_ascii=False)
    index['largePassLog'] = index.get('largePassLog', []) + log
    json.dump(index, open(idx_path, 'w'), indent=1, ensure_ascii=False)
    shutil.rmtree(tmpdir, ignore_errors=True)
    print(json.dumps(log, indent=1, ensure_ascii=False))


# ---------------------------------------------------------------------------------------------------------------------
def cmd_serve(a):
    from PIL import Image
    idx_path = a['index']; index = json.load(open(idx_path)); src = a['src']; dest = a['dest']
    max_pages = int(a.get('max-pages', '8')); thumb_px = int(a.get('thumb-px', '640')); thumb_q = int(a.get('thumb-q', '80'))
    page_px = int(a.get('page-px', '1200')); page_q = int(a.get('page-q', '72'))
    for d in ('thumbs', 'pages'):
        shutil.rmtree(os.path.join(dest, d), ignore_errors=True); os.makedirs(os.path.join(dest, d), exist_ok=True)
    total, n_thumbs, n_pages, missing = 0, 0, 0, []

    def encode(rel_src, rel_dest, maxside, q):
        nonlocal total
        s = os.path.join(src, os.path.basename(rel_src)); d = os.path.join(dest, rel_dest)
        if not os.path.exists(s): missing.append(rel_src); return False
        img = Image.open(s).convert('RGB')
        if max(img.size) > maxside: img.thumbnail((maxside, maxside), Image.LANCZOS)
        img.save(d, 'JPEG', quality=q, optimize=True, progressive=True); total += os.path.getsize(d); return True

    for f in index['files']:
        if f.get('redacted'):
            f['thumb'] = None; f['pages'] = []; continue
        if f.get('thumb'):
            if encode(f['thumb'], f['thumb'], thumb_px, thumb_q): n_thumbs += 1
            else: f['thumb'] = None
        kept = []
        for p in (f.get('pages') or [])[:max_pages]:
            if encode(p, p, page_px, page_q): kept.append(p); n_pages += 1
        f['pages'] = kept
    index['served'] = {'thumbs': n_thumbs, 'pages': n_pages, 'bytes': total, 'maxPages': max_pages, 'pagePx': page_px, 'pageQuality': page_q, 'thumbPx': thumb_px, 'thumbQuality': thumb_q}
    json.dump(index, open(idx_path, 'w'), indent=1, ensure_ascii=False); open(idx_path, 'a').write('\n')
    print(json.dumps({'dest': dest, **index['served'], 'missingSources': missing}, indent=1))


if __name__ == '__main__':
    if len(sys.argv) < 2 or sys.argv[1] not in ('download', 'render', 'stream', 'serve'):
        print(__doc__); sys.exit(2)
    {'download': cmd_download, 'render': cmd_render, 'stream': cmd_stream, 'serve': cmd_serve}[sys.argv[1]](args_of(sys.argv[2:]))
