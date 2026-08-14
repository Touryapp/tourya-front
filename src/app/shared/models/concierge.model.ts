/**
 * Modelos para el Travel Concierge (IA-02).
 * Contrato con POST /agents/travel-concierge/chat.
 */

export interface ConciergeChatContext {
  tourId?: number;
  cartId?: number;
}

export interface ConciergeChatRequest {
  sessionId: string;
  userMessage: string;
  locale: string;
  context?: ConciergeChatContext;
}

/**
 * Acciones ejecutadas por el asistente durante el turno actual.
 * `type` es abierto (search_tours, add_to_cart, etc.); el backend puede
 * agregar nuevos tipos sin romper el frontend.
 */
export interface ConciergeAction {
  type: string;
  params?: Record<string, unknown>;
  resultSummary?: string;
  success?: boolean;
}

export interface ConciergeChatResponse {
  assistantMessage: string;
  actionsExecuted?: ConciergeAction[];
  fraudSuspected?: boolean;
  escalatedToHuman?: boolean;
}

/**
 * Envelope estandar del backend (ApiResponse<T>).
 * El servicio lo desempaqueta y expone solo el `data`.
 */
export interface ConciergeChatEnvelope {
  success: boolean;
  data?: ConciergeChatResponse;
  error?: string;
}

/**
 * Mensaje que vive en el historial del widget (no viaja al backend).
 * El backend NO recibe el historial; usa sessionId como memoria.
 */
export interface ConciergeChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: ConciergeAction[];
  escalated?: boolean;
  timestamp: number;
}
