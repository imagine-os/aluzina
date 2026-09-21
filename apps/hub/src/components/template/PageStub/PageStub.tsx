import { useT } from '../../../i18n/I18nProvider';
import { Placeholder } from '../../atom/Placeholder/Placeholder';
import { Card } from '../../molecule/Card/Card';
import { PageHeader } from '../../molecule/PageHeader/PageHeader';
import './PageStub.css';

export interface PageStubProps {
  code: string;
  title: string;
  description: string;
  /** Translated names of the sections the real page will have; each renders as a Placeholder card (P-09). */
  sections: string[];
}

/** A stub route that says what it will become: header + one Placeholder card per planned section. */
export function PageStub({ code, title, description, sections }: PageStubProps) {
  const { t } = useT();
  return (
    <div className="page-stub" data-stub={code}>
      <PageHeader code={code} title={title} subtitle={description} />
      <p className="page-stub__note">{t('core.stub.note', { code })}</p>
      <ul className="page-stub__grid">
        {sections.map((s) => (
          <li key={s}>
            <Placeholder what={s} className="page-stub__card">
              <Card title={s} subtitle={t('core.stub.section')} />
            </Placeholder>
          </li>
        ))}
      </ul>
    </div>
  );
}
