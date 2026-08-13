export interface ClientCredit {
  id: number;
  reservationId: number;
  amount: number;
  /**
   * TC-022: monto ya reservado del credito (usado en reservas activas).
   * Solo disponible cuando el backend lo expone; opcional para compatibilidad.
   */
  reservedAmount?: number;
  creationDate: string;
  expirationDate: string;
  status: string;
  /**
   * TC-022: fecha en que el turista solicito devolucion (status REFUND_REQUESTED).
   */
  refundRequestedAt?: string;
  /**
   * TC-022: fecha en que ADMIN/BACKOFFICE marco como devuelto (status REFUNDED).
   */
  refundedAt?: string;
  /**
   * TC-022: URL del comprobante subido por ADMIN/BACKOFFICE al devolver el dinero.
   */
  refundProofUrl?: string;
  /**
   * TC-022: nombre del turista (solo en respuestas del endpoint /admin/credits).
   */
  touristName?: string;
  /**
   * TC-022: email del turista (solo en respuestas del endpoint /admin/credits).
   */
  touristEmail?: string;
}

/**
 * TC-022: respuesta paginada del endpoint GET /admin/credits usado por
 * ADMIN/BACKOFFICE_OPERATION para el listado global de creditos.
 */
export interface AdminCreditsPageResponse {
  content: ClientCredit[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
