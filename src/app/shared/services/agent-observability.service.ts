import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  AgentName,
  AgentObservabilityEnvelope,
  AgentSummaryDto,
  AgentTimeseriesPointDto,
  LatencyDistributionDto,
  OverrideMetricsDto,
  ResultTypeDistributionDto,
  TimeseriesGranularity,
  TopConsumerDto,
} from '../models/agent-observability.model';

/**
 * Cliente Angular para el Agents Observability Dashboard (backend IA-11).
 *
 * <p>Expone los 6 endpoints admin bajo GET /admin/agents/*:
 *  - summary            (resumen por agente en un rango)
 *  - timeseries         (serie temporal calls + costo)
 *  - latency            (percentiles p50/p95/p99)
 *  - top-consumers      (top usuarios por consumo)
 *  - result-types       (distribucion success/error/rejected)
 *  - overrides          (tasa de override; en MVP es proxy escalated + error)</p>
 *
 * <p>Todos los metodos:
 *  - Delegan la autorizacion JWT al AuthInterceptor global.
 *  - Requieren rol ADMIN o BACKOFFICE_OPERATION (validado server-side).
 *  - Desempaquetan el envelope `ApiResponse<T>` y solo exponen `data`.
 *  - Propagan errores del backend via Observable.throwError.</p>
 *
 * <p>NO tocamos `TravelConciergeService` ni `OperatorSupportService`: son
 * clientes de negocio de los agentes; este servicio solo consume metricas.</p>
 */
@Injectable({ providedIn: 'root' })
export class AgentObservabilityService {
  private readonly base = `${environment.apiUrl}/admin/agents`;

  constructor(private http: HttpClient) {}

  getSummary(from: string, to: string, agent?: AgentName): Observable<AgentSummaryDto[]> {
    const params = this.buildRangeParams(from, to, agent);
    return this.http
      .get<AgentObservabilityEnvelope<AgentSummaryDto[]>>(`${this.base}/summary`, { params })
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  getTimeseries(
    from: string,
    to: string,
    agent?: AgentName,
    granularity: TimeseriesGranularity = 'day',
  ): Observable<AgentTimeseriesPointDto[]> {
    let params = this.buildRangeParams(from, to, agent);
    params = params.set('granularity', granularity);
    return this.http
      .get<AgentObservabilityEnvelope<AgentTimeseriesPointDto[]>>(`${this.base}/timeseries`, { params })
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  getLatency(
    from: string,
    to: string,
    agent?: AgentName,
    capability?: string,
  ): Observable<LatencyDistributionDto[]> {
    let params = this.buildRangeParams(from, to, agent);
    if (capability) {
      params = params.set('capability', capability);
    }
    return this.http
      .get<AgentObservabilityEnvelope<LatencyDistributionDto[]>>(`${this.base}/latency`, { params })
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  getTopConsumers(
    from: string,
    to: string,
    agent?: AgentName,
    limit = 10,
  ): Observable<TopConsumerDto[]> {
    let params = this.buildRangeParams(from, to, agent);
    params = params.set('limit', String(limit));
    return this.http
      .get<AgentObservabilityEnvelope<TopConsumerDto[]>>(`${this.base}/top-consumers`, { params })
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  getResultTypes(from: string, to: string): Observable<ResultTypeDistributionDto[]> {
    const params = this.buildRangeParams(from, to);
    return this.http
      .get<AgentObservabilityEnvelope<ResultTypeDistributionDto[]>>(`${this.base}/result-types`, { params })
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  getOverrides(from: string, to: string, agent?: AgentName): Observable<OverrideMetricsDto[]> {
    const params = this.buildRangeParams(from, to, agent);
    return this.http
      .get<AgentObservabilityEnvelope<OverrideMetricsDto[]>>(`${this.base}/overrides`, { params })
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  private buildRangeParams(from: string, to: string, agent?: AgentName): HttpParams {
    let params = new HttpParams().set('from', from).set('to', to);
    if (agent) {
      params = params.set('agent', agent);
    }
    return params;
  }

  private unwrap<T>(envelope: AgentObservabilityEnvelope<T> | null | undefined): T {
    if (!envelope) {
      throw new Error('empty_response');
    }
    if (envelope.success === false || envelope.data == null) {
      throw new Error(envelope.error || 'agent_observability_error');
    }
    return envelope.data;
  }
}
