import { PageStub } from '../../components/template/PageStub/PageStub';
import { useT } from '../../i18n/I18nProvider';
import { homeSpec } from './specs';

const SECTIONS = ['proposals', 'references', 'palettes', 'plans', 'schedules', 'renders', 'checks'] as const;

export function StudioHome() {
  const { t } = useT();
  return <PageStub code={homeSpec.code} title={t('studio.home.title')} description={t('studio.home.desc')} sections={SECTIONS.map((s) => t(`studio.home.section.${s}`))} />;
}
