import type { ReactNode } from 'react';
import { useRegisterAction } from '../../actions';
import { Button } from '../../components/atom/Button/Button';
import { pick, type Text } from '../../domain';
import { useT } from '../../i18n/I18nProvider';

/**
 * Print / PDF: the real thing (`window.print()`), on every manual page, and the `manual.print` action
 * registered while the page is mounted (P-05). The print rules live in `manual.css`.
 */
export function PrintButton() {
  const { t } = useT();
  const print = () => {
    window.print();
    return 'printed';
  };
  useRegisterAction('manual.print', print);
  return (
    <Button variant="secondary" icon="⎙" onClick={print} className="manual-noprint">
      {t('manual.print')}
    </Button>
  );
}

/**
 * Read-only checklist of playbook items (the working checkboxes are `engagements.checks` on the studio
 * pages). A list with an empty-box glyph: it reads as a checklist on screen, on paper and to a screen
 * reader, and it is never a control that silently does nothing (P-09).
 */
export function Checklist({ items, label, lang }: { items: readonly Text[]; label: string; lang: 'en' | 'es' }) {
  return (
    <ul className="manual-check" aria-label={label}>
      {items.map((item, i) => (
        <li key={`${i}-${item.en}`} className="manual-check__item">
          <span className="manual-check__box" aria-hidden="true">
            ☐
          </span>
          <span>{pick(item, lang)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Section heading with a stable id so the quick links and the phase index can scroll to it. */
export function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 className="manual-h2" id={id} tabIndex={-1}>
      {children}
    </h2>
  );
}

/** Scrolls an element into view and moves focus to it (the phase index and the quick links; no anchor links under a HashRouter). */
export function focusSection(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.focus({ preventScroll: true });
  return true;
}
