import type { ReactElement } from 'react';

/** Surfaces every project ships (P-12). */
export type Surface = 'hub' | 'business-os' | 'website' | 'customer' | 'staff' | 'docs' | 'manual' | 'dev';

export type ParamType = 'string' | 'number' | 'id' | 'date' | `enum:${string}`;

/**
 * One entry per button / menu item / form submit on a page (P-05).
 * `id` is `<module>.<verb>`, `intent` is what a person would say,
 * `permission` is the string the page checks. This is the WebMCP / voice vocabulary.
 */
export interface ActionDef {
  id: string;
  label: string;
  intent: string;
  permission?: string;
  params?: Record<string, ParamType>;
}

export interface PageSpec {
  code: string;
  name: string;
  purpose: string;
  surface: Surface;
  layout: string[];
  data: string[];
  roles: string[];
  logic: string[];
  components: string[];
  actions: ActionDef[];
  /** Widths (px) verified by a human or a screenshot pass (P-01). */
  checkedAt: number[];
  notes?: string[];
}

export function defineSpec(spec: PageSpec): PageSpec {
  return spec;
}

export type RouteStatus = 'built' | 'stub';

export interface RouteDef {
  path: string;
  code: string;
  surface: Surface;
  status: RouteStatus;
  element: ReactElement;
  spec: PageSpec;
}
