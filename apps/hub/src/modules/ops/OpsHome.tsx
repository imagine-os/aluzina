import { PageStub } from '../../components/template/PageStub/PageStub';
import { useT } from '../../i18n/I18nProvider';
import { homeSpec } from './specs';

const SECTIONS = ['schedule', 'tasks', 'meetings', 'suppliers', 'quotes', 'deliveries', 'payments', 'alerts'] as const;

export function OpsHome() {
  const { t } = useT();
  return <PageStub code={homeSpec.code} title={t('ops.home.title')} description={t('ops.home.desc')} sections={SECTIONS.map((s) => t(`ops.home.section.${s}`))} />;
}
