import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  ModerationResult,
  ModerationStatus,
  ReviewModerationEnvelope,
  ReviewModerationSummaryDto,
} from '../models/review-moderation.model';

/**
 * FE IA-10: Cliente HTTP del Review Moderation Admin (backend IA-10).
 *
 * <p>Consume los 2 endpoints admin autenticados JWT (rol ADMIN o
 * BACKOFFICE_OPERATION):
 *  - GET  /admin/reviews/moderation                         (cola)
 *  - POST /admin/agents/review-moderation/{id}/re-moderate  (backfill / retry)</p>
 *
 * <p>Detalles:
 *  - Delegan la autorizacion JWT al AuthInterceptor global.
 *  - Desempaquetan el envelope `ApiResponse<T>` (mismo patron que
 *    {@link import('./agent-observability.service').AgentObservabilityService}).
 *  - Propagan errores del backend via Observable.throwError.</p>
 *
 * <p>NO tocamos otros servicios de agentes (`travel-concierge.service.ts`,
 * `operator-support.service.ts`, `agent-observability.service.ts`,
 * `backoffice-support.service.ts`): son clientes de negocio independientes.</p>
 */
@Injectable({ providedIn: 'root' })
export class ReviewModerationService {
  private readonly queueBase = `${environment.apiUrl}/admin/reviews/moderation`;
  private readonly agentBase = `${environment.apiUrl}/admin/agents/review-moderation`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la cola de moderacion filtrada por status (PENDING / REJECTED) y
   * rango de fechas opcional. El backend limita default a 50; permitimos
   * override via `limit`.
   */
  getModerationQueue(
    status: Extract<ModerationStatus, 'PENDING' | 'REJECTED'>,
    from?: string,
    to?: string,
    limit?: number,
  ): Observable<ReviewModerationSummaryDto[]> {
    let params = new HttpParams().set('status', status);
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }
    if (limit != null) {
      params = params.set('limit', String(limit));
    }
    return this.http
      .get<ReviewModerationEnvelope<ReviewModerationSummaryDto[]>>(this.queueBase, { params })
      .pipe(
        map((envelope) => this.unwrap(envelope) ?? []),
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * Vuelve a correr el agente sobre una review puntual. Usos: backfill de
   * reviews legacy sin moderar, testing, recovery si el listener original
   * fallo. Body vacio (backend usa {reviewId} de la URL).
   */
  reModerate(reviewId: number): Observable<ModerationResult> {
    const url = `${this.agentBase}/${reviewId}/re-moderate`;
    return this.http
      .post<ReviewModerationEnvelope<ModerationResult>>(url, {})
      .pipe(
        map((envelope) => this.unwrapRequired(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private unwrap<T>(envelope: ReviewModerationEnvelope<T> | null | undefined): T | undefined {
    if (!envelope) {
      throw new Error('empty_response');
    }
    if (envelope.success === false) {
      throw new Error(envelope.error || 'review_moderation_error');
    }
    return envelope.data;
  }

  private unwrapRequired<T>(envelope: ReviewModerationEnvelope<T> | null | undefined): T {
    const data = this.unwrap(envelope);
    if (data == null) {
      throw new Error('review_moderation_empty_data');
    }
    return data;
  }
}
