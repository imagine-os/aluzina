import { Button } from '../../components/atom/Button/Button';
import { toast } from '../../components/atom/Toast/Toast';
import { useT } from '../../i18n/I18nProvider';
import type { ReactNode } from 'react';

/** Copy a token value or a CSS variable name (action design.copyToken). Confirms, and says so when the clipboard is blocked. */
export function CopyButton({ value, what }: { value: string; what: string }) {
  const { t } = useT();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast(t('design.copied', { what }));
    } catch {
      toast(t('design.copyFailed', { what }));
    }
  };
  return <Button variant="ghost" size="sm" icon="⧉" aria-label={t('design.copy', { what })} title={t('design.copy', { what })} onClick={copy} />;
}

/** One manual section: a gold hairline, a wide-tracked caption like the manual's, an optional lede, then the plates. */
export function Section({ eyebrow, desc, children }: { eyebrow: string; desc?: string; children: ReactNode }) {
  return (
    <section className="ds-section">
      <hr className="hairline" />
      <p className="eyebrow eyebrow--wide ds-section__eyebrow">{eyebrow}</p>
      {desc && <p className="ds-lede">{desc}</p>}
      {children}
    </section>
  );
}

export function Plate({ caption, children, className }: { caption?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <figure className={['ds-plate', className].filter(Boolean).join(' ')}>
      <div className="ds-plate__stage">{children}</div>
      {caption && <figcaption className="ds-plate__caption">{caption}</figcaption>}
    </figure>
  );
}
