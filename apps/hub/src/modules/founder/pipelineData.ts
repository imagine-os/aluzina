import type { Tone } from '../../components/atom/Badge/Badge';
import type { ProjectPhase, ProjectType } from '../../data/schema';

/** The pipeline, left to right (src/data/schema/projects.ts). */
export const PHASES: readonly ProjectPhase[] = ['lead', 'concept', 'development', 'documentation', 'procurement', 'execution', 'delivered'];

export const PROJECT_TYPES: readonly ProjectType[] = ['residential', 'commercial', 'hospitality', 'wellness', 'lighting-product'];

const TONES: Record<ProjectPhase, Tone> = {
  lead: 'neutral',
  concept: 'info',
  development: 'accent',
  documentation: 'accent',
  procurement: 'warning',
  execution: 'warning',
  delivered: 'success',
};

export function phaseTone(phase: ProjectPhase): Tone {
  return TONES[phase] ?? 'neutral';
}
