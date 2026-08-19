/**
 * Modelos para el Agents Observability Dashboard (IA-11).
 *
 * Contrato con GET /admin/agents/* (summary, timeseries, latency,
 * top-consumers, result-types, overrides). Backend expone `ApiResponse<T>`
 * (misma envolvente que el resto de la API).
 *
 * <p>Los agentes conocidos en MVP son `travel-concierge`, `operator-support`,
 * `translation`. Dejamos `AgentName` como union laxa (string) para tolerar
 * futuros agentes sin romper compilacion.</p>
 */

export type KnownAgentName = 'travel-concierge' | 'operator-support' | 'translation';
export type AgentName = KnownAgentName | string;

export type TimeseriesGranularity = 'day' | 'week' | 'month';

// ---------------------------------------------------------------------------
// Envelope (ApiResponse<T>) - reutilizamos el patron interno del repo (mismo
// shape que OperatorSupportEnvelope / ConciergeChatEnvelope).
// ---------------------------------------------------------------------------

export interface AgentObservabilityEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ---------------------------------------------------------------------------
// Endpoint 1 - summary
// ---------------------------------------------------------------------------

export interface AgentSummaryDto {
  agent: AgentName;
  totalCalls: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  avgLatencyMs: number;
  successRate: number;
  escalatedRate: number;
}

// ---------------------------------------------------------------------------
// Endpoint 2 - timeseries
// ---------------------------------------------------------------------------

export interface AgentTimeseriesPointDto {
  date: string; // ISO local date, e.g. "2026-08-14"
  agent: AgentName;
  calls: number;
  costUsd: number;
  avgLatencyMs: number;
}

// ---------------------------------------------------------------------------
// Endpoint 3 - latency percentiles
// ---------------------------------------------------------------------------

export interface LatencyDistributionDto {
  agent: AgentName;
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
}

// ---------------------------------------------------------------------------
// Endpoint 4 - top consumers
// ---------------------------------------------------------------------------

export interface TopConsumerDto {
  userId: number;
  userEmail: string | null;
  agent?: AgentName;
  calls: number;
  costUsd: number;
}

// ---------------------------------------------------------------------------
// Endpoint 5 - result types distribution
// ---------------------------------------------------------------------------

export interface ResultTypeDistributionDto {
  agent: AgentName;
  success: number;
  error: number;
  rejected: number;
}

// ---------------------------------------------------------------------------
// Endpoint 6 - overrides (MVP: proxy escalated + error)
// ---------------------------------------------------------------------------

export interface OverrideMetricsDto {
  agent: AgentName;
  capability: string | null;
  totalSuggestions: number;
  kept: number;
  edited: number;
  discarded: number;
  overrideRate: number;
}
