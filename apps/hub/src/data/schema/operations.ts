import type { BaseRow, CentsCop, Id, ISODate } from './base';

export type SupplierCategory = 'lighting' | 'furniture' | 'stone' | 'wood' | 'textiles' | 'paint' | 'metalwork' | 'installation' | 'printing';
export type SupplierStatus = 'active' | 'trial' | 'paused';

export interface Supplier extends BaseRow {
  name: string;
  category: SupplierCategory;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  leadTimeDays: number;
  rating: 1 | 2 | 3 | 4 | 5;
  status: SupplierStatus;
}

export type QuoteStatus = 'requested' | 'received' | 'shortlisted' | 'selected' | 'rejected';

/** Supplier quotes; rows with the same `comparisonGroup` are compared side by side (Miguel's price comparisons). */
export interface Quote extends BaseRow {
  projectId: Id;
  supplierId: Id;
  comparisonGroup: string;
  item: string;
  amountCop: CentsCop;
  leadTimeDays: number;
  validUntil: ISODate | null;
  status: QuoteStatus;
  notes: string;
}

export type DeliveryStatus = 'pending' | 'confirmed' | 'delivered' | 'delayed';

export interface Delivery extends BaseRow {
  projectId: Id;
  supplierId: Id;
  item: string;
  expectedDate: ISODate;
  confirmedDate: ISODate | null;
  status: DeliveryStatus;
}

export type PaymentDirection = 'in' | 'out';
export type PaymentStatus = 'due' | 'overdue' | 'partial' | 'paid';

/** Who owes what: `in` = a client owes the studio, `out` = the studio owes a supplier. */
export interface Payment extends BaseRow {
  projectId: Id | null;
  counterparty: string;
  direction: PaymentDirection;
  concept: string;
  amountCop: CentsCop;
  paidCop: CentsCop;
  dueDate: ISODate;
  paidDate: ISODate | null;
  status: PaymentStatus;
}

export type DocumentKind = 'contract' | 'invoice' | 'plan' | 'project-pdf' | 'report' | 'spec' | 'brief' | 'quote';
export type DocumentStatus = 'draft' | 'final' | 'sent' | 'signed';

export interface Document extends BaseRow {
  projectId: Id | null;
  title: string;
  kind: DocumentKind;
  status: DocumentStatus;
  ownerRole: string;
  version: number;
  url: string | null;
}
