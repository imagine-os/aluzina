/** Component metadata: no component without a meta, no meta without a usage (P-07). */
export type Tier = 'atom' | 'molecule' | 'organism' | 'template';

export interface ComponentMeta {
  name: string;
  tier: Tier;
  purpose: string;
  props: Record<string, string>;
  a11y: string[];
  usages: string[];
}

export function defineMeta(meta: ComponentMeta): ComponentMeta {
  return meta;
}
