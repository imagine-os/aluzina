import { defineMeta } from '../../../design/meta';

export default defineMeta({
  name: 'PostCard',
  tier: 'molecule',
  purpose: 'One post in a space list (K-01 / K-02): kind pill, draft / archived pill, "also in N spaces" chip, title, two-line excerpt, author, date and tags. The whole card is one button.',
  props: { title: 'string', kind: 'string – note | link | file | decision | procedure | brief | announcement', status: 'string?', pinned: 'boolean?', tags: 'string[]?', author: '{ name, initials? } | null', updated: 'string – formatted date', alsoIn: 'number? – other spaces the post is filed in', excerpt: 'string?', url: 'string | null?', onOpen: '() => void' },
  a11y: ['a single <button> >= 44 px: no nested interactive content', 'the pin is announced through visually hidden text', 'kind and status are text pills, never colour alone', 'excerpt clamps to two lines and wraps anywhere at 360 px'],
  usages: ['K-01 Spaces home', 'K-02 Space view', 'K-01 role banner'],
});
