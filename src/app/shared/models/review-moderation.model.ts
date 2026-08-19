/**
 * Modelos para el Review Moderation Admin (FE IA-10).
 *
 * <p>Contrato con:
 *  - GET  /admin/reviews/moderation                       (cola de moderacion)
 *  - POST /admin/agents/review-moderation/{id}/re-moderate (re-moderar una)</p>
 *
 * <p>El backend IA-10 (Gemini Flash) flaggea reviews en columnas paralelas
 * (`moderation_status`, `moderation_flags`, `reasoning`, `moderated_at`) sin
 * modificar nunca `review.status` ni `review.comment`. El backoffice decide
 * manualmente que hacer con cada review flaggeada; esta pantalla es la UX
 * para revisar + tomar accion.</p>
 */

// ---------------------------------------------------------------------------
// Envelope ApiResponse<T> (mismo patron que agent-observability / credits).
// ---------------------------------------------------------------------------

export interface ReviewModerationEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---------------------------------------------------------------------------
// Flags y estados
// ---------------------------------------------------------------------------

/**
 * Flags conocidos que puede emitir el agente. Dejamos union laxa (string) en
 * los DTOs para tolerar futuros flags del backend sin romper compilacion, pero
 * exponemos el subset conocido para tipar filtros y colores en UI.
 */
export type ModerationFlag =
  | 'SPAM'
  | 'OFFENSIVE'
  | 'OFF_TOPIC'
  | 'POTENTIAL_FRAUD'
  | 'INAPPROPRIATE_MEDIA';

/** Status de moderacion (columna paralela a `review.status`). */
export type ModerationStatus = 'PENDING' | 'REJECTED' | 'APPROVED';

// ---------------------------------------------------------------------------
// Endpoint 1 - GET /admin/reviews/moderation
// ---------------------------------------------------------------------------

export interface ReviewModerationSummaryDto {
  reviewId: number;
  moderationStatus: ModerationStatus | string;
  moderationFlags: string[];
  /** ISO instant, ej: "2026-08-19T15:30:00Z". Puede venir null si nunca fue moderado. */
  moderatedAt: string | null;
  /** Primeros 200 chars del texto de la review (backend trunca). */
  reviewText: string;
  tourName: string | null;
  authorEmail: string | null;
  /** Razonamiento del LLM. Puede venir null. */
  reasoning: string | null;
}

// ---------------------------------------------------------------------------
// Endpoint 2 - POST /admin/agents/review-moderation/{id}/re-moderate
// ---------------------------------------------------------------------------

export interface ModerationResult {
  decision: ModerationStatus | string;
  flags: string[];
  reasoning: string | null;
}
