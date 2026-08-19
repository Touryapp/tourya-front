/**
 * Modelos para el Backoffice Support Agent (backend IA-08).
 *
 * <p>Contrato con los 4 endpoints action-specific bajo
 * POST /admin/agents/backoffice-support/*:
 *  - kyb-checklist/{requestProviderId}
 *  - tour-prevalidation/{tourId}
 *  - dimar-draft?date=&providerId=
 *  - payout-anomalies?from=&to=</p>
 *
 * <p>Envelope estandar {@code ApiResponse<T>} del backend (mismo shape que
 * OperatorSupportEnvelope / AgentObservabilityEnvelope).</p>
 */

// ---------------------------------------------------------------------------
// Envelope (ApiResponse<T>).
// ---------------------------------------------------------------------------

export interface BackofficeSupportEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---------------------------------------------------------------------------
// Endpoint 1 - KYB Checklist
// ---------------------------------------------------------------------------

export type KybItemStatus = 'OK' | 'WARN' | 'CRITICAL';
export type KybOverallStatus = 'COMPLETE' | 'INCOMPLETE' | 'REJECTED';

export interface KybChecklistItem {
  documentType: string;
  present: boolean;
  issues: string[];
  status: KybItemStatus;
}

export interface KybChecklistResponse {
  requestProviderId: number;
  overallStatus: KybOverallStatus;
  items: KybChecklistItem[];
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Endpoint 2 - Tour Prevalidation
// ---------------------------------------------------------------------------

export type IssueSeverity = 'CRITICAL' | 'WARN' | 'INFO';

export interface TourPrevalidationIssue {
  severity: IssueSeverity;
  code: string;
  field: string;
  message: string;
}

export interface TourPrevalidationResponse {
  tourId: number;
  canApprove: boolean;
  issues: TourPrevalidationIssue[];
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Endpoint 3 - DIMAR Draft
// ---------------------------------------------------------------------------

/**
 * Categoria de edad del pasajero segun DIMAR. Backend puede devolver etiquetas
 * fuera del conjunto conocido, por eso dejamos union laxa (string).
 */
export type PassengerAgeType = 'ADULT' | 'CHILD' | 'INFANT' | string;

export interface DimarDraftPassenger {
  reservationId: number;
  tourName: string;
  payerName: string;
  documentType: string;
  documentNumber: string;
  ageType: PassengerAgeType;
}

export interface DimarDraftResponse {
  date: string; // ISO local date (e.g. "2026-08-20")
  providerId: number;
  totalPassengers: number;
  passengers: DimarDraftPassenger[];
  notes: string;
}

// ---------------------------------------------------------------------------
// Endpoint 4 - Payout Anomalies
// ---------------------------------------------------------------------------

/**
 * Severidad de anomalia en payout. El backend solo emite CRITICAL / WARN
 * (INFO se reserva para tour-prevalidation).
 */
export type PayoutAnomalySeverity = 'CRITICAL' | 'WARN';

export interface PayoutAnomalyItem {
  severity: PayoutAnomalySeverity;
  code: string;
  message: string;
  explanation: string;
}

export interface PayoutAnomalyResponse {
  payoutOrderId: number;
  anomalies: PayoutAnomalyItem[];
}
