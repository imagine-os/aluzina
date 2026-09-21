/**
 * Shapes of the generated Asana seed files in this folder (D-055). `scripts/import-asana.mjs`
 * (`npm run import:asana`) reads `docs/source/asana/<date>/*.csv` and writes `hoy.ts` and `portfolio.ts`
 * against these types; `apps/hub/src/data/seed/asana.ts` turns them into rows. The generated files are
 * checked in (they are seeds) and must never be edited by hand — re-run the script instead.
 *
 * This folder is not globbed by `seed/index.ts` (`./*.ts` does not cross a `/`), so nothing here seeds
 * itself: `seed/asana.ts` is the seed module.
 */

export interface AsanaSectionRow {
  id: string;
  name: string;
  order: number;
}

export interface AsanaTaskRow {
  id: string;
  /** Section of the root task of this subtree; null only if Asana gave none. */
  sectionId: string | null;
  parentTaskId: string | null;
  title: string;
  /** `asana:<16-digit Task ID>`. */
  externalId: string;
  description: string;
  assigneeId: string;
  ownerRole: string;
  status: 'todo' | 'done';
  completedAt: string | null;
  startDate: string | null;
  dueDate: string | null;
  deliverableId: string | null;
  /** File order within the parent (or within the section for roots). */
  order: number;
}

/** One payment line of the portfolio board's vendor-job form, as written in the note. */
export interface AsanaJobPayment {
  /** `PRIMER PAGO`, `SEGUNDO PAGO`, `UNICO PAGO`, `PAGO REALIZADO`. */
  label: string;
  amountCop: number | null;
  /** ISO date when the note gave one (`dd/mm/yyyy` in the source). */
  due: string | null;
  /** The line as written, so nothing is lost when the form does not parse. */
  raw: string;
}

/**
 * A vendor job from PROYECTOS ALUZINA SEPTIEMBRE-DICIEMBRE 2026: the fixed `KEY: value` note form
 * (`docs/knowledge/asana-conventions.md` §"The portfolio board"). Data for a later purchasing pass
 * (`purchases.profitAluzina` / `aluzinaResponsibility`, O-12); nothing renders it yet.
 */
export interface AsanaVendorJob {
  id: string;
  externalId: string;
  /** Board section: a client (SPORTI, SODIME…) or an initiative (REDES SOCIALES, CONCURSOS…). */
  client: string;
  title: string;
  parentExternalId: string | null;
  /** `ENCARGADO:` — the person or company doing the work. */
  encargado: string | null;
  /** `EMPRESA:` when the person is an engineer of one. */
  empresa: string | null;
  /** `VALOR:` in COP; null when the note says there is none yet. */
  valorCop: number | null;
  /** `PROFIT ALUZINA:` in COP. */
  profitCop: number | null;
  payments: AsanaJobPayment[];
  /** `FECHA DE COMIENZO:` as ISO when it parsed, otherwise null (`rawStartDate` keeps the text). */
  startDate: string | null;
  rawStartDate: string | null;
  /** `FECHA DE ENTREGA:`. */
  deliveryDate: string | null;
  rawDeliveryDate: string | null;
  /** `DESCRIPCION:`. */
  description: string | null;
  /** `RESPONSABILIDAD DE ALUZINA:`. */
  responsibility: string | null;
  /** The whole note, so the form is never the only copy. */
  note: string;
}
