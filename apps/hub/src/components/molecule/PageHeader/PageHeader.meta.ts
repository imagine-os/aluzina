import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'PageHeader',
  tier: 'molecule',
  purpose: 'Title block for every portal page: breadcrumb, h1 (+ page code in dev mode), subtitle, actions slot.',
  props: { title: 'string', subtitle: 'string?', breadcrumb: '{ label, to? }[]?', actions: 'ReactNode? – Buttons', code: 'string? – page code chip in dev mode' },
  a11y: ['one h1 per page', 'breadcrumb is a nav with aria-label and aria-current=page on the last crumb', 'actions are library Buttons'],
  usages: ['PageStub', 'dev components page', 'dev specs page', 'every portal page'],
});
