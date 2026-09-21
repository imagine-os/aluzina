import { PageStub } from '../../components/template/PageStub/PageStub';
import { useT } from '../../i18n/I18nProvider';
import { homeSpec } from './specs';

const SECTIONS = ['competitions', 'presentations', 'identity', 'images', 'revisions', 'assets'] as const;

export function BrandHome() {
  const { t } = useT();
  return <PageStub code={homeSpec.code} title={t('brand.home.title')} description={t('brand.home.desc')} sections={SECTIONS.map((s) => t(`brand.home.section.${s}`))} />;
}
