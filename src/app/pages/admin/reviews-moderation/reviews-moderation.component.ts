import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { ReviewModerationService } from '../../../shared/services/review-moderation.service';
import {
  ModerationFlag,
  ModerationResult,
  ModerationStatus,
  ReviewModerationSummaryDto,
} from '../../../shared/models/review-moderation.model';

type QueueStatus = Extract<ModerationStatus, 'PENDING' | 'REJECTED'>;
type FlagFilter = 'ALL' | ModerationFlag;

/**
 * FE IA-10: cola de moderacion de reseñas.
 *
 * <p>Consume los 2 endpoints admin expuestos por el backend IA-10 (Gemini
 * Flash):
 *  - GET  /admin/reviews/moderation                         (listado)
 *  - POST /admin/agents/review-moderation/{id}/re-moderate  (re-run)</p>
 *
 * <p>Guardada por {@link import('../../../core/guards/backoffice.guard').BackofficeGuard}
 * (ADMIN + BACKOFFICE_OPERATION). El backend NUNCA modifica `review.status`
 * ni `review.comment`: solo persiste metadata paralela. El backoffice decide
 * manualmente que hacer con cada review flaggeada desde esta pantalla.</p>
 *
 * <p>El filtro por flag es client-side sobre el array recibido (el backend
 * solo filtra por status). El toggle de status (PENDING / REJECTED) dispara
 * una nueva llamada.</p>
 */
@Component({
  selector: 'app-reviews-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './reviews-moderation.component.html',
  styleUrls: ['./reviews-moderation.component.scss'],
})
export class ReviewsModerationComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // ==== Filtros ====
  public selectedStatus: QueueStatus = 'PENDING';
  public fromDate = ''; // yyyy-MM-dd
  public toDate = '';   // yyyy-MM-dd
  public selectedFlag: FlagFilter = 'ALL';

  public readonly statusOptions: QueueStatus[] = ['PENDING', 'REJECTED'];
  public readonly flagOptions: FlagFilter[] = [
    'ALL',
    'SPAM',
    'OFFENSIVE',
    'OFF_TOPIC',
    'POTENTIAL_FRAUD',
    'INAPPROPRIATE_MEDIA',
  ];

  // ==== Estado ====
  public rows: ReviewModerationSummaryDto[] = [];
  public loading = false;
  public error = false;
  public lastUpdated: Date | null = null;

  /** Rows con re-moderacion en curso (deshabilita boton en la fila). */
  public inFlight: Set<number> = new Set<number>();

  // ==== Modal "ver reseña completa" ====
  public showDetailModal = false;
  public detailTarget: ReviewModerationSummaryDto | null = null;

  // ==== Paleta de flags (chips coloreados) ====
  private readonly flagColors: Record<string, string> = {
    SPAM: '#F79009',            // amarillo/ambar
    OFFENSIVE: '#F04438',       // rojo
    OFF_TOPIC: '#6B7280',       // gris
    POTENTIAL_FRAUD: '#DC6803', // naranja
    INAPPROPRIATE_MEDIA: '#7A5AF8', // purpura
  };
  private readonly fallbackFlagColor = '#475467';

  constructor(
    private moderationService: ReviewModerationService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.applyDefaultRange();
    this.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==== Filtros ====

  public onStatusChange(status: QueueStatus): void {
    if (this.selectedStatus === status) {
      return;
    }
    this.selectedStatus = status;
    this.reload();
  }

  public onRefresh(): void {
    if (!this.fromDate || !this.toDate) {
      this.applyDefaultRange();
    }
    this.reload();
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

  private toIsoInstant(d: string, endOfDay: boolean): string | undefined {
    if (!d) return undefined;
    // El backend acepta ISO instant. Enviamos midnight UTC (from) / next-day
    // minus 1ms (to) para que el rango sea inclusivo del dia completo.
    const suffix = endOfDay ? 'T23:59:59.999Z' : 'T00:00:00.000Z';
    return `${d}${suffix}`;
  }

  // ==== Carga ====

  private reload(): void {
    this.loading = true;
    this.error = false;
    const from = this.toIsoInstant(this.fromDate, false);
    const to = this.toIsoInstant(this.toDate, true);

    this.moderationService
      .getModerationQueue(this.selectedStatus, from, to)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rows) => {
          // Orden default: moderatedAt desc (mas reciente arriba). Filas sin
          // fecha van al final.
          this.rows = [...(rows || [])].sort((a, b) => this.compareByModeratedAtDesc(a, b));
          this.loading = false;
          this.lastUpdated = new Date();
        },
        error: () => {
          this.rows = [];
          this.loading = false;
          this.error = true;
        },
      });
  }

  private compareByModeratedAtDesc(a: ReviewModerationSummaryDto, b: ReviewModerationSummaryDto): number {
    const ta = a.moderatedAt ? new Date(a.moderatedAt).getTime() : 0;
    const tb = b.moderatedAt ? new Date(b.moderatedAt).getTime() : 0;
    return tb - ta;
  }

  // ==== Filtro client-side por flag ====

  public get filteredRows(): ReviewModerationSummaryDto[] {
    if (this.selectedFlag === 'ALL') {
      return this.rows;
    }
    return this.rows.filter((r) => (r.moderationFlags || []).includes(this.selectedFlag));
  }

  // ==== Acciones por fila ====

  public onReModerate(row: ReviewModerationSummaryDto): void {
    if (this.inFlight.has(row.reviewId)) {
      return;
    }
    this.inFlight.add(row.reviewId);

    this.moderationService
      .reModerate(row.reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ModerationResult) => {
          this.inFlight.delete(row.reviewId);
          this.applyReModerationResult(row, result);
          this.snackBar.open(
            this.translate.instant('reviewsModeration.remoderateSuccess'),
            'OK',
            { duration: 2500 },
          );
        },
        error: () => {
          this.inFlight.delete(row.reviewId);
          this.snackBar.open(
            this.translate.instant('reviewsModeration.error'),
            'OK',
            { duration: 3000 },
          );
        },
      });
  }

  /**
   * Actualiza la fila con el resultado del re-run. Si el nuevo status ya no
   * matchea el tab actual, la sacamos del listado (por ejemplo: PENDING ->
   * APPROVED tras re-moderar limpio).
   */
  private applyReModerationResult(row: ReviewModerationSummaryDto, result: ModerationResult): void {
    const updated: ReviewModerationSummaryDto = {
      ...row,
      moderationStatus: result.decision,
      moderationFlags: result.flags || [],
      reasoning: result.reasoning ?? row.reasoning,
      moderatedAt: new Date().toISOString(),
    };

    if (result.decision !== this.selectedStatus) {
      // Salio del listado actual.
      this.rows = this.rows.filter((r) => r.reviewId !== row.reviewId);
      return;
    }

    this.rows = this.rows.map((r) => (r.reviewId === row.reviewId ? updated : r));
  }

  public openDetail(row: ReviewModerationSummaryDto): void {
    this.detailTarget = row;
    this.showDetailModal = true;
  }

  public closeDetail(): void {
    this.showDetailModal = false;
    this.detailTarget = null;
  }

  public goToReviewDetail(): void {
    if (!this.detailTarget) return;
    const id = this.detailTarget.reviewId;
    this.closeDetail();
    this.router.navigate(['/admin/reviews', id]);
  }

  // ==== Formateo / helpers ====

  public isInFlight(row: ReviewModerationSummaryDto): boolean {
    return this.inFlight.has(row.reviewId);
  }

  public trackByReviewId(_index: number, item: ReviewModerationSummaryDto): number {
    return item.reviewId;
  }

  public flagColor(flag: string): string {
    return this.flagColors[flag] || this.fallbackFlagColor;
  }

  public flagLabel(flag: string): string {
    const key = `reviewsModeration.flag.${flag}`;
    const translated = this.translate.instant(key);
    // ngx-translate devuelve la key literal si no la encuentra: usamos el
    // flag crudo como fallback para no mostrar "reviewsModeration.flag.XXX".
    return translated === key ? flag : translated;
  }

  public truncateText(text: string | null | undefined, limit = 200): string {
    if (!text) return '';
    if (text.length <= limit) return text;
    return `${text.substring(0, limit)}…`;
  }

  public hasReviewText(row: ReviewModerationSummaryDto): boolean {
    return !!row.reviewText && row.reviewText.trim().length > 0;
  }
}
