import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  DraftReviewReplyResponse,
  ImageMetadata,
  OperatorSupportEnvelope,
  PriceAlert,
  SuggestTourContentRequest,
  TourContentSuggestion,
  ValidateGalleryRequest,
  ValidateGalleryResponse,
} from '../models/operator-support.model';

/**
 * Cliente Angular para el Operator Support Agent (backend IA-07).
 *
 * Expone los 4 endpoints action-specific bajo /agents/operator-support:
 *  - suggest-tour-content: sugerencias de nombre/descripcion/tags para un tour.
 *  - price-alert/{tourId}: alerta pricing (OK/WARN/CRITICAL) sin modificar precio.
 *  - draft-review-reply/{reviewId}: borrador de respuesta a una resena.
 *  - validate-gallery: valida metadata de imagenes (formato/tamano/dimensiones).
 *
 * Todos los metodos:
 *  - Delegan la autorizacion JWT al AuthInterceptor global.
 *  - Desempaquetan el envelope ApiResponse<T> y solo exponen `data`.
 *  - Propagan errores del backend via Observable.throwError.
 */
@Injectable({ providedIn: 'root' })
export class OperatorSupportService {
  private readonly base = `${environment.apiUrl}/agents/operator-support`;

  constructor(private http: HttpClient) {}

  /**
   * Sugiere nombres candidatos, descripcion y tags para un tour a partir del
   * draft del provider (campos basicos del wizard).
   */
  suggestTourContent(
    request: SuggestTourContentRequest,
  ): Observable<TourContentSuggestion> {
    return this.http
      .post<OperatorSupportEnvelope<TourContentSuggestion>>(
        `${this.base}/suggest-tour-content`,
        request,
      )
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * Devuelve una alerta de precio (OK/WARN/CRITICAL) para el tour indicado.
   * El backend lee el providerPrice del propio tour (no lo enviamos).
   * Guardrail server-side: nunca modifica el precio, solo alerta.
   */
  getPriceAlert(tourId: number): Observable<PriceAlert> {
    return this.http
      .post<OperatorSupportEnvelope<PriceAlert>>(
        `${this.base}/price-alert/${tourId}`,
        {},
      )
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * Genera un borrador de respuesta para la resena indicada.
   * Guardrail server-side: verifica ownership; 401 si el review no pertenece
   * a un tour del provider autenticado.
   */
  draftReviewReply(reviewId: number): Observable<DraftReviewReplyResponse> {
    return this.http
      .post<OperatorSupportEnvelope<DraftReviewReplyResponse>>(
        `${this.base}/draft-review-reply/${reviewId}`,
        {},
      )
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * Valida la metadata de una galeria (dimensiones/tamano/formato/cantidad).
   * Endpoint sin LLM (regla dura del backend); rapido y gratis.
   */
  validateGallery(
    images: ImageMetadata[],
  ): Observable<ValidateGalleryResponse> {
    const body: ValidateGalleryRequest = { images };
    return this.http
      .post<OperatorSupportEnvelope<ValidateGalleryResponse>>(
        `${this.base}/validate-gallery`,
        body,
      )
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  private unwrap<T>(envelope: OperatorSupportEnvelope<T> | null | undefined): T {
    if (!envelope) {
      throw new Error('empty_response');
    }
    if (envelope.success === false || envelope.data == null) {
      throw new Error(envelope.error || 'operator_support_error');
    }
    return envelope.data;
  }
}
