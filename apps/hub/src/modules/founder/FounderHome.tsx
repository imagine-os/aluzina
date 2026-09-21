import { PageStub } from '../../components/template/PageStub/PageStub';
import { useT } from '../../i18n/I18nProvider';
import { homeSpec } from './specs';

const SECTIONS = ['approvals', 'pipeline', 'quotes', 'pdfs', 'partnerships', 'products'] as const;

export function FounderHome() {
  const { t } = useT();
  return <PageStub code={homeSpec.code} title={t('founder.home.title')} description={t('founder.home.desc')} sections={SECTIONS.map((s) => t(`founder.home.section.${s}`))} />;
}
