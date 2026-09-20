import { useEffect, useState } from 'react';
import { useT } from '../i18n/I18nProvider';
import type { PageSpec } from '../specs/PageSpec';
import { useDevMode } from './DevModeProvider';
import './DevTools.css';

/**
 * SpecChip + actions panel, visible in dev mode only. Ctrl+. toggles the panel.
 * Grows into the full InspectorPanel (tables, rules, components) in build plan step 4.
 */
export function DevTools({ spec }: { spec: PageSpec }) {
  const { devMode } = useDevMode();
  const { t } = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '.') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!devMode) return null;

  return (
    <>
      <button
        type="button"
        className="spec-chip"
        aria-expanded={open}
        aria-controls="dev-panel"
        aria-label={t('core.dev.chipLabel', { code: spec.code })}
        onClick={() => setOpen((o) => !o)}
      >
        {spec.code}
      </button>
      {open && (
        <section id="dev-panel" className="dev-panel" role="dialog" aria-label={t('core.dev.panelTitle', { code: spec.code })}>
          <div className="dev-panel__head">
            <span className="dev-panel__title">{t('core.dev.panelTitle', { code: spec.code })}</span>
            <button type="button" className="dev-panel__close" onClick={() => setOpen(false)}>
              {t('core.dev.close')}
            </button>
          </div>
          <p className="dev-panel__meta">{spec.purpose}</p>
          <h3>{t('core.dev.actions')}</h3>
          {spec.actions.length === 0 ? (
            <p className="dev-panel__meta">{t('core.dev.noActions')}</p>
          ) : (
            <ul>
              {spec.actions.map((a) => (
                <li key={a.id}>
                  <div>
                    <code>{a.id}</code> · {a.label}
                  </div>
                  <div className="dev-panel__meta">“{a.intent}”</div>
                  {a.permission && (
                    <div className="dev-panel__meta">
                      {t('core.dev.permission')}: <code>{a.permission}</code>
                    </div>
                  )}
                  {a.params && (
                    <div className="dev-panel__meta">
                      {t('core.dev.params')}:{' '}
                      {Object.entries(a.params).map(([k, v]) => (
                        <code key={k}>
                          {k}: {v}{' '}
                        </code>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          <h3>{t('core.dev.checkedAt')}</h3>
          <p className="dev-panel__meta">{spec.checkedAt.length ? spec.checkedAt.join(', ') : '—'}</p>
          <p className="dev-panel__hint">{t('core.dev.hint')}</p>
        </section>
      )}
    </>
  );
}
