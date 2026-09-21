import { Fragment, type ReactNode } from 'react';
import { cx } from '../../../design/cx';
import './Markdown.css';

/**
 * Minimal, safe Markdown renderer (K-03 post bodies): headings, paragraphs, bullet and numbered lists,
 * task items, block quotes, fenced code, pipe tables; inline bold, italic, code and links. It builds React
 * elements, never HTML strings, so a body can not inject markup; only http(s) and mailto links are linked,
 * anything else renders as text. Enough for notes and procedures; a full parser is not needed (D-026).
 */
export interface MarkdownProps {
  source: string;
  className?: string;
}

const SAFE_URL = /^(https?:\/\/|mailto:)/i;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  // tokens: code, bold, italic, link
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\n]+\*|_[^_\n]+_)|(\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (m[1]) out.push(<code key={key} className="md__code">{tok.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={key}>{inline(tok.slice(2, -2), key)}</strong>);
    else if (m[3]) out.push(<em key={key}>{inline(tok.slice(1, -1), key)}</em>);
    else if (m[4]) {
      const mm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      if (mm && SAFE_URL.test(mm[2])) {
        out.push(
          <a key={key} href={mm[2]} target="_blank" rel="noreferrer">
            {mm[1]}
          </a>,
        );
      } else out.push(tok);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

interface Block {
  kind: 'h' | 'p' | 'ul' | 'ol' | 'quote' | 'code' | 'table' | 'hr';
  level?: number;
  lines: string[];
}

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      blocks.push({ kind: 'code', lines: buf });
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({ kind: 'h', level: h[1].length, lines: [h[2]] });
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ kind: 'hr', lines: [] });
      i++;
      continue;
    }
    if (/^\|/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) buf.push(lines[i++]);
      blocks.push({ kind: 'table', lines: buf });
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ kind: 'quote', lines: buf });
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
      blocks.push({ kind: 'ul', lines: buf });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ''));
      blocks.push({ kind: 'ol', lines: buf });
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|\||>|\s*[-*]\s|\s*\d+[.)]\s)/.test(lines[i])) buf.push(lines[i++]);
    blocks.push({ kind: 'p', lines: buf });
  }
  return blocks;
}

function ListItem({ text, k }: { text: string; k: string }) {
  const task = /^\[( |x|X)\]\s+(.*)$/.exec(text);
  if (task) {
    const done = task[1].toLowerCase() === 'x';
    return (
      <li className={cx('md__task', done && 'md__task--done')}>
        <span className="md__box" aria-hidden="true">{done ? '☑' : '☐'}</span>
        <span className="visually-hidden">{done ? '[x] ' : '[ ] '}</span>
        {inline(task[2], k)}
      </li>
    );
  }
  return <li>{inline(text, k)}</li>;
}

function Table({ lines, k }: { lines: string[]; k: string }) {
  const rows = lines.map((l) => l.replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim()));
  const body = rows.filter((r, i) => !(i === 1 && r.every((c) => /^:?-{2,}:?$/.test(c))));
  const [head, ...rest] = body;
  return (
    <div className="md__table-wrap">
      <table className="md__table">
        <thead>
          <tr>
            {head.map((c, i) => (
              <th key={i} scope="col">{inline(c, `${k}-h${i}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rest.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => (
                <td key={ci}>{inline(c, `${k}-${ri}-${ci}`)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Markdown({ source, className }: MarkdownProps) {
  const blocks = parseBlocks(source);
  return (
    <div className={cx('md', className)}>
      {blocks.map((b, i) => {
        const k = `b${i}`;
        switch (b.kind) {
          case 'h': {
            const level = Math.min(4, (b.level ?? 1) + 1); // an h1 in a body renders as h2: the page owns h1
            const Tag = `h${level}` as 'h2' | 'h3' | 'h4';
            return <Tag key={k} className={`md__h md__h${level}`}>{inline(b.lines[0], k)}</Tag>;
          }
          case 'p':
            return (
              <p key={k}>
                {b.lines.map((l, li) => (
                  <Fragment key={li}>
                    {li > 0 && ' '}
                    {inline(l, `${k}-${li}`)}
                  </Fragment>
                ))}
              </p>
            );
          case 'ul':
            return (
              <ul key={k}>
                {b.lines.map((l, li) => (
                  <ListItem key={li} text={l} k={`${k}-${li}`} />
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={k}>
                {b.lines.map((l, li) => (
                  <ListItem key={li} text={l} k={`${k}-${li}`} />
                ))}
              </ol>
            );
          case 'quote':
            return (
              <blockquote key={k}>
                {b.lines.map((l, li) => (
                  <p key={li}>{inline(l, `${k}-${li}`)}</p>
                ))}
              </blockquote>
            );
          case 'code':
            return (
              <pre key={k} className="md__pre">
                <code>{b.lines.join('\n')}</code>
              </pre>
            );
          case 'table':
            return <Table key={k} lines={b.lines} k={k} />;
          case 'hr':
            return <hr key={k} />;
        }
      })}
    </div>
  );
}
