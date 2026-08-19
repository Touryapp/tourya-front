import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  BackofficeSupportEnvelope,
  DimarDraftResponse,
  KybChecklistResponse,
  PayoutAnomalyResponse,
  TourPrevalidationResponse,
} from '../models/backoffice-support.model';

/**
 * Cliente Angular para el Backoffice Support Agent (backend IA-08).
 *
 * <p>Expone los 4 endpoints action-specific bajo POST
 * /admin/agents/backoffice-support/*:
 *  - kyb-checklist/{requestProviderId}: audita KYB del provider (RUT/RNT/etc).
 *  - tour-prevalidation/{tourId}: valida tour antes de aprobar (i18n/gallery).
 *  - dimar-draft?date=&providerId=: borrador de listado DIMAR.
 *  - payout-anomalies?from=&to=: anomalias en payout orders del rango.</p>
 *
 * <p>Todos los metodos:
 *  - Delegan la autorizacion JWT al AuthInterceptor global.
 *  - Requieren rol ADMIN o BACKOFFICE_OPERATION (validado server-side).
 *  - Desempaquetan el envelope {@code ApiResponse<T>} y solo exponen {@code data}.
 *  - Propagan errores del backend via {@link throwError}.</p>
 *
 * <p>NO toca los otros services de agentes (TravelConciergeService,
 * OperatorSupportService, AgentObservabilityService): este cliente es
 * autonomo y solo consume el agente Backoffice Support.</p>
 */
@Injectable({ providedIn: 'root' })
export class BackofficeSupportService {
  private readonly base = `${environment.apiUrl}/admin/agents/backoffice-support`;

  constructor(private http: HttpClient) {}

  /**
   * KYB checklist automatico para un RequestProvider en estado Document-Sent.
   * Es informativo: el ADMIN sigue decidiendo aprobar/rechazar por su cuenta.
   */
  kybChecklist(requestProviderId: number): Observable<KybChecklistResponse> {
    return this.http
      .post<BackofficeSupportEnvelope<KybChecklistResponse>>(
        `${this.base}/kyb-checklist/${requestProviderId}`,
        {},
      )
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * Pre-validacion de un tour previo a aprobacion. Detecta i18n faltante,
   * galeria pobre, campos ambiguos, etc. Informativo.
   */
  tourPrevalidation(tourId: number): Observable<TourPrevalidationResponse> {
    return this.http
      .post<BackofficeSupportEnvelope<TourPrevalidationResponse>>(
        `${this.base}/tour-prevalidation/${tourId}`,
        {},
      )
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * Genera borrador del listado DIMAR para una fecha + provider marino.
   * El humano revisa e imprime antes de subir a DIMAR.
   */
  dimarDraft(date: string, providerId: number): Observable<DimarDraftResponse> {
    const params = new HttpParams()
      .set('date', date)
      .set('providerId', String(providerId));
    return this.http
      .post<BackofficeSupportEnvelope<DimarDraftResponse>>(
        `${this.base}/dimar-draft`,
        {},
        { params },
      )
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * Detecta anomalias en payout orders del rango [from, to] (ISO local date).
   * Devuelve solo las orders con al menos una anomalia; lista vacia = OK.
   */
  payoutAnomalies(from: string, to: string): Observable<PayoutAnomalyResponse[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .post<BackofficeSupportEnvelope<PayoutAnomalyResponse[]>>(
        `${this.base}/payout-anomalies`,
        {},
        { params },
      )
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  private unwrap<T>(envelope: BackofficeSupportEnvelope<T> | null | undefined): T {
    if (!envelope) {
      throw new Error('empty_response');
    }
    if (envelope.success === false || envelope.data == null) {
      throw new Error(envelope.error || 'backoffice_support_error');
    }
    return envelope.data;
  }
}
