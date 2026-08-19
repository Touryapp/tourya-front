import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { AgentObservabilityService } from '../../../shared/services/agent-observability.service';
import {
  AgentSummaryDto,
  AgentTimeseriesPointDto,
  KnownAgentName,
  LatencyDistributionDto,
  OverrideMetricsDto,
  ResultTypeDistributionDto,
  TopConsumerDto,
} from '../../../shared/models/agent-observability.model';

type AgentFilter = 'ALL' | KnownAgentName;

/**
 * Contenedor de las opciones de un chart ApexCharts que el componente pasa
 * a `<apx-chart>` en el template. Es un subset de los inputs disponibles;
 * solo tipamos los que efectivamente pasamos por binding.
 */
interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title?: ApexTitleSubtitle;
  colors: string[];
  legend: ApexLegend;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
}

interface SectionState<T> {
  data: T;
  loading: boolean;
  error: boolean;
}

interface ResultTypeRow {
  agent: string;
  total: number;
  success: number;
  error: number;
  rejected: number;
  successPct: number;
  errorPct: number;
  rejectedPct: number;
}

/**
 * FE IA-11: dashboard admin de observabilidad de agentes IA.
 *
 * <p>Consume los 6 endpoints GET /admin/agents/* (summary, timeseries,
 * latency, top-consumers, result-types, overrides) expuestos por el backend
 * IA-11 (PR tourya-api #269). Cubre los 3 agentes activos: `travel-concierge`,
 * `operator-support`, `translation`.</p>
 *
 * <p>Guardada por {@link import('../../../core/guards/backoffice.guard').BackofficeGuard}
 * (ADMIN + BACKOFFICE_OPERATION). Filtros globales (rango de fechas + agente)
 * disparan las 6 cargas en paralelo con {@link forkJoin}; cada seccion maneja
 * su propio loading/error para que un endpoint caido no rompa el resto.</p>
 *
 * <p><b>MVP nota (overrides)</b>: el backend calcula la override rate como
 * proxy `escalatedRate + errorRate` porque todavia no trackeamos el outcome
 * humano (kept/edited/discarded). Documentado en el tooltip del card
 * (`agentsObservability.overrides.proxyTooltip`); deuda IA-11b para tracking
 * real de `human_outcome`.</p>
 */
@Component({
  selector: 'app-agents-observability',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgApexchartsModule],
  templateUrl: './agents-observability.component.html',
  styleUrls: ['./agents-observability.component.scss'],
})
export class AgentsObservabilityComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // ==== Filtros ====
  public fromDate = ''; // yyyy-MM-dd
  public toDate = '';   // yyyy-MM-dd
  public selectedAgent: AgentFilter = 'ALL';
  public readonly agentOptions: AgentFilter[] = [
    'ALL',
    'travel-concierge',
    'operator-support',
    'translation',
  ];
  public lastUpdated: Date | null = null;

  // ==== Estado por seccion ====
  public summary: SectionState<AgentSummaryDto[]> = { data: [], loading: false, error: false };
  public timeseries: SectionState<AgentTimeseriesPointDto[]> = { data: [], loading: false, error: false };
  public latency: SectionState<LatencyDistributionDto[]> = { data: [], loading: false, error: false };
  public resultTypes: SectionState<ResultTypeDistributionDto[]> = { data: [], loading: false, error: false };
  public topConsumers: SectionState<TopConsumerDto[]> = { data: [], loading: false, error: false };
  public overrides: SectionState<OverrideMetricsDto[]> = { data: [], loading: false, error: false };

  // ==== Charts precomputados ====
  public timeseriesChart: ChartOptions | null = null;
  public latencyChart: ChartOptions | null = null;

  // Paleta consistente por agente (usada tanto en cards como en charts).
  private readonly agentPalette: Record<string, string> = {
    'travel-concierge': '#2F80ED',
    'operator-support': '#0E9384',
    'translation': '#F79009',
  };
  private readonly fallbackColor = '#6B7280';

  constructor(
    private observabilityService: AgentObservabilityService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.applyDefaultRange();
    this.reloadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==== Filtros ====

  public onRefresh(): void {
    if (!this.fromDate || !this.toDate) {
      this.applyDefaultRange();
    }
    this.reloadAll();
  }

  private applyDefaultRange(): void {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 29); // 30 dias inclusive.
    this.toDate = this.toIsoDate(to);
    this.fromDate = this.toIsoDate(from);
  }

  private toIsoDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private get agentQueryParam(): string | undefined {
    return this.selectedAgent === 'ALL' ? undefined : this.selectedAgent;
  }

  // ==== Carga ====

  private reloadAll(): void {
    // Marca todas las secciones como cargando para feedback inmediato en UI.
    this.summary = { ...this.summary, loading: true, error: false };
    this.timeseries = { ...this.timeseries, loading: true, error: false };
    this.latency = { ...this.latency, loading: true, error: false };
    this.resultTypes = { ...this.resultTypes, loading: true, error: false };
    this.topConsumers = { ...this.topConsumers, loading: true, error: false };
    this.overrides = { ...this.overrides, loading: true, error: false };

    const from = this.fromDate;
    const to = this.toDate;
    const agent = this.agentQueryParam;

    // Cada observable atrapa su propio error para que forkJoin no rompa cuando
    // una seccion falle: mapeamos el error a `null` y renderizamos "no se pudo
    // cargar" solo en esa seccion. El resto de secciones sigue viva.
    forkJoin({
      summary: this.observabilityService.getSummary(from, to).pipe(catchError(() => of(null))),
      timeseries: this.observabilityService.getTimeseries(from, to, agent, 'day').pipe(catchError(() => of(null))),
      latency: this.observabilityService.getLatency(from, to).pipe(catchError(() => of(null))),
      resultTypes: this.observabilityService.getResultTypes(from, to).pipe(catchError(() => of(null))),
      topConsumers: this.observabilityService.getTopConsumers(from, to, agent, 10).pipe(catchError(() => of(null))),
      overrides: this.observabilityService.getOverrides(from, to).pipe(catchError(() => of(null))),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this.summary = this.applyResult(result.summary, []);
        this.timeseries = this.applyResult(result.timeseries, []);
        this.latency = this.applyResult(result.latency, []);
        this.resultTypes = this.applyResult(result.resultTypes, []);
        this.topConsumers = this.applyResult(result.topConsumers, []);
        this.overrides = this.applyResult(result.overrides, []);
        this.rebuildCharts();
        this.lastUpdated = new Date();
      });
  }

  private applyResult<T>(payload: T | null, fallback: T): SectionState<T> {
    if (payload === null) {
      return { data: fallback, loading: false, error: true };
    }
    return { data: payload, loading: false, error: false };
  }

  // ==== Derivados / getters usados por el template ====

  public get resultTypeRows(): ResultTypeRow[] {
    return (this.resultTypes.data || []).map((row) => {
      const total = (row.success || 0) + (row.error || 0) + (row.rejected || 0);
      const denom = total > 0 ? total : 1;
      return {
        agent: row.agent,
        total,
        success: row.success || 0,
        error: row.error || 0,
        rejected: row.rejected || 0,
        successPct: Math.round(((row.success || 0) / denom) * 1000) / 10,
        errorPct: Math.round(((row.error || 0) / denom) * 1000) / 10,
        rejectedPct: Math.round(((row.rejected || 0) / denom) * 1000) / 10,
      };
    });
  }

  public agentColor(agent: string): string {
    return this.agentPalette[agent] || this.fallbackColor;
  }

  // ==== Formateo ====

  public formatCount(value: number | null | undefined): string {
    if (value == null) return '0';
    return value.toLocaleString();
  }

  public formatCost(value: number | null | undefined): string {
    const safe = value == null ? 0 : value;
    return `$${safe.toFixed(2)}`;
  }

  public formatPercent(value: number | null | undefined): string {
    if (value == null) return '0%';
    return `${value.toFixed(1)}%`;
  }

  public formatLatency(value: number | null | undefined): string {
    if (value == null) return '0 ms';
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} s`;
    }
    return `${Math.round(value)} ms`;
  }

  public formatTokens(value: number | null | undefined): string {
    if (value == null) return '0';
    return value.toLocaleString();
  }

  public consumerLabel(consumer: TopConsumerDto): string {
    if (consumer.userEmail) return consumer.userEmail;
    return this.translate.instant('agentsObservability.topConsumers.deletedUser', {
      id: consumer.userId,
    });
  }

  // ==== Charts ====

  private rebuildCharts(): void {
    this.timeseriesChart = this.buildTimeseriesChart(this.timeseries.data);
    this.latencyChart = this.buildLatencyChart(this.latency.data);
  }

  private buildTimeseriesChart(points: AgentTimeseriesPointDto[]): ChartOptions | null {
    if (!points || points.length === 0) return null;

    // Agrupamos por agente y ordenamos las fechas para que las series compartan
    // el mismo eje X (fechas unicas asc).
    const grouped = new Map<string, Map<string, AgentTimeseriesPointDto>>();
    const dateSet = new Set<string>();
    for (const p of points) {
      dateSet.add(p.date);
      if (!grouped.has(p.agent)) grouped.set(p.agent, new Map());
      grouped.get(p.agent)!.set(p.date, p);
    }
    const dates = Array.from(dateSet).sort();

    const callsSeries: ApexAxisChartSeries = [];
    const colors: string[] = [];
    for (const [agent, byDate] of grouped.entries()) {
      callsSeries.push({
        name: agent,
        type: 'line',
        data: dates.map((d) => byDate.get(d)?.calls ?? 0),
      });
      colors.push(this.agentColor(agent));
    }

    return {
      series: callsSeries,
      chart: {
        type: 'line',
        height: 320,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors,
      stroke: { curve: 'smooth', width: 2 },
      xaxis: {
        categories: dates,
        labels: { style: { fontSize: '11px' } },
      },
      yaxis: {
        title: { text: this.translate.instant('agentsObservability.summary.calls') },
        labels: { formatter: (v: number) => v.toLocaleString() },
      },
      dataLabels: { enabled: false },
      grid: { borderColor: '#e5e7eb' },
      legend: { position: 'bottom' },
      tooltip: {
        shared: true,
        y: { formatter: (v: number) => v.toLocaleString() },
      },
      plotOptions: {},
      fill: { opacity: 1 },
    };
  }

  private buildLatencyChart(rows: LatencyDistributionDto[]): ChartOptions | null {
    if (!rows || rows.length === 0) return null;

    const agents = rows.map((r) => r.agent);
    return {
      series: [
        { name: 'p50', data: rows.map((r) => r.p50) },
        { name: 'p95', data: rows.map((r) => r.p95) },
        { name: 'p99', data: rows.map((r) => r.p99) },
      ],
      chart: {
        type: 'bar',
        height: 320,
        toolbar: { show: false },
      },
      colors: ['#12B76A', '#F79009', '#F04438'],
      stroke: { show: true, width: 1, colors: ['transparent'] },
      xaxis: {
        categories: agents,
        labels: { style: { fontSize: '12px' } },
      },
      yaxis: {
        title: { text: 'ms' },
        labels: { formatter: (v: number) => v.toLocaleString() },
      },
      dataLabels: { enabled: false },
      grid: { borderColor: '#e5e7eb' },
      legend: { position: 'bottom' },
      tooltip: { y: { formatter: (v: number) => `${v.toLocaleString()} ms` } },
      plotOptions: {
        bar: { horizontal: false, columnWidth: '60%', borderRadius: 4 },
      },
      fill: { opacity: 1 },
    };
  }

  // ==== Helpers de estado de UI ====

  public hasAnySection(): boolean {
    return (
      this.summary.data.length > 0 ||
      this.timeseries.data.length > 0 ||
      this.latency.data.length > 0 ||
      this.resultTypes.data.length > 0 ||
      this.topConsumers.data.length > 0 ||
      this.overrides.data.length > 0
    );
  }

  public trackByAgent(_index: number, item: { agent: string }): string {
    return item.agent;
  }

  public trackByConsumer(_index: number, item: TopConsumerDto): string {
    return `${item.userId}-${item.agent ?? ''}`;
  }
}
