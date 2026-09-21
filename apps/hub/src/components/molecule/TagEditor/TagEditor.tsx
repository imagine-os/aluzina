import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cx } from '../../../design/cx';
import { Badge } from '../../atom/Badge/Badge';
import { Button } from '../../atom/Button/Button';
import { Input } from '../../atom/Input/Input';
import './TagEditor.css';

export interface TagEditorProps {
  /** The tags as stored (already normalised); the editor never mutates the array it is given. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Everything the caller knows about: existing tags, registry names, vocabulary ids. Filtered as you type. */
  suggestions: string[];
  label: string;
  placeholder?: string;
  /** Label of the explicit "Add" button (touch and mouse people do not press Enter). */
  addLabel: string;
  removeLabel: (tag: string) => string;
  disabled?: boolean;
  /** Maximum number of tags; the field locks when it is reached. */
  max?: number;
  /** Line under the field (how tags are normalised, what the max is). */
  hint?: string;
  /** Text of the `aria-live` count; defaults to the bare number, which reads in any language. */
  countLabel?: (count: number) => string;
  className?: string;
}

/** Tags are free text, trimmed, lower-cased and de-duplicated: one canonical form per tag everywhere. */
export function normalizeTag(raw: string): string {
  return raw.trim().replace(/^#/, '').replace(/\s+/g, ' ').toLowerCase();
}

/** Splits an array or a comma / semicolon string into normalised, unique, non-empty tags (voice and WebMCP input). */
export function parseTags(input: unknown): string[] {
  const parts = Array.isArray(input) ? input : String(input ?? '').split(/[,;]/);
  const out: string[] = [];
  for (const part of parts) {
    const tag = normalizeTag(String(part));
    if (tag && !out.includes(tag)) out.push(tag);
  }
  return out;
}

const MAX_OPTIONS = 8;

/**
 * Tag chips plus a suggestion combobox (P-07). Duplicates and empty strings are rejected, every value is
 * trimmed and lower-cased, and the count is announced through `aria-live`. Keyboard: ArrowDown / ArrowUp
 * walk the suggestions, Enter adds the highlighted one (or what is typed), Backspace on an empty field
 * removes the last chip, Escape closes the list. The list opens while you type or on ArrowDown, never on a
 * bare focus, so it never covers the Save button next to the field; adding a tag closes it again. Each chip's
 * remove button is a full 44 px target (P-03).
 * The component is uncontrolled only in its draft text: the tag list is the caller's state.
 */
export function TagEditor({ value, onChange, suggestions, label, placeholder, addLabel, removeLabel, disabled, max, hint, countLabel, className }: TagEditorProps) {
  const id = useId();
  const listId = `${id}-list`;
  const hintId = `${id}-hint`;
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLDivElement>(null);

  const atMax = max !== undefined && value.length >= max;
  const locked = Boolean(disabled) || atMax;

  const options = useMemo(() => {
    const needle = normalizeTag(draft);
    const seen = new Set(value);
    const out: string[] = [];
    for (const raw of suggestions) {
      const tag = normalizeTag(raw);
      if (!tag || seen.has(tag)) continue;
      if (needle && !tag.includes(needle)) continue;
      seen.add(tag);
      out.push(tag);
      if (out.length >= MAX_OPTIONS) break;
    }
    return out;
  }, [suggestions, draft, value]);

  useEffect(() => setActive(-1), [draft]);

  const focusInput = () => inputRef.current?.querySelector('input')?.focus();

  const add = (raw: string): boolean => {
    const tag = normalizeTag(raw);
    setDraft('');
    setActive(-1);
    setOpen(false);
    if (!tag || locked || value.includes(tag)) return false;
    onChange([...value, tag]);
    return true;
  };

  const remove = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
    focusInput();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (options.length === 0) return;
      e.preventDefault();
      setOpen(true);
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (i === -1 ? (delta === 1 ? 0 : options.length - 1) : (i + delta + options.length) % options.length));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      add(open && active >= 0 ? (options[active] ?? draft) : draft);
      return;
    }
    if (e.key === ',' || e.key === ';') {
      e.preventDefault();
      add(draft);
      return;
    }
    if (e.key === 'Backspace' && draft === '' && value.length > 0 && !disabled) {
      e.preventDefault();
      remove(value[value.length - 1]);
      return;
    }
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div className={cx('tagedit', className)}>
      {value.length > 0 && (
        <ul className="tagedit__chips">
          {value.map((tag) => (
            <li key={tag} className="tagedit__chip">
              <Badge tone="neutral">{tag}</Badge>
              <button type="button" className="tagedit__remove" aria-label={removeLabel(tag)} disabled={disabled} onClick={() => remove(tag)}>
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="tagedit__row">
        <div className="tagedit__field" ref={inputRef}>
          <Input
            label={label}
            value={draft}
            placeholder={placeholder}
            disabled={locked}
            autoComplete="off"
            role="combobox"
            aria-expanded={open && options.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-describedby={hint ? hintId : undefined}
            aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
            onChange={(e) => {
              setDraft(e.target.value);
              setOpen(true);
            }}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
          />
          {open && options.length > 0 && (
            <ul className="tagedit__list" id={listId} role="listbox" aria-label={label}>
              {options.map((tag, i) => (
                <li
                  key={tag}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={cx('tagedit__option', i === active && 'tagedit__option--active')}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    add(tag);
                    focusInput();
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button variant="secondary" disabled={locked || normalizeTag(draft) === ''} onClick={() => add(draft)}>
          {addLabel}
        </Button>
      </div>

      {hint && (
        <p className="tagedit__hint" id={hintId}>
          {hint}
        </p>
      )}
      <p className="tagedit__count" aria-live="polite">
        {countLabel ? countLabel(value.length) : String(value.length)}
      </p>
    </div>
  );
}
