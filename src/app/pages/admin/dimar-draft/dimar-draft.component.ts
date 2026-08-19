import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { BackofficeSupportService } from '../../../shared/services/backoffice-support.service';
import {
  DimarDraftPassenger,
  DimarDraftResponse,
} from '../../../shared/models/backoffice-support.model';

/**
 * FE IA-08 T3: pagina admin para generar el borrador del listado DIMAR.
 *
 * <p>Consume POST /admin/agents/backoffice-support/dimar-draft?date=&providerId=
 * (backend IA-08). Renderiza el borrador en tabla + notas y ofrece dos accesos
 * para el flujo humano: exportar CSV (todo client-side, sin backend) e
 * imprimir (window.print).</p>
 *
 * <p>Guardada por {@link import('../../../core/guards/backoffice.guard').BackofficeGuard}
 * (ADMIN + BACKOFFICE_OPERATION). No expone datos del pasajero fuera de la vista
 * (garantizado por el backend); el CSV se genera solo en el navegador y no se
 * envia a ningun servicio.</p>
 *
 * <p>El selector de provider es un input numerico (ID del provider marino) — no
 * hay endpoint publico de listado de providers en el frontend actualmente, y
 * agregarlo aca queda fuera del scope de este PR. El humano copia el ID desde
 * la vista de solicitudes/tours.</p>
 */
@Component({
  selector: 'app-dimar-draft',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './dimar-draft.component.html',
  styleUrls: ['./dimar-draft.component.scss'],
})
export class DimarDraftComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Filtros
  public date = '';               // yyyy-MM-dd
  public providerId: number | null = null;

  // Estado de la request
  public loading = false;
  public errorMessage = '';
  public draft: DimarDraftResponse | null = null;

  constructor(
    private backofficeSupportService: BackofficeSupportService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.applyDefaultDate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyDefaultDate(): void {
    const today = new Date();
    this.date = this.toIsoDate(today);
  }

  private toIsoDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public canGenerate(): boolean {
    return !!this.date && typeof this.providerId === 'number' && this.providerId > 0 && !this.loading;
  }

  public onGenerate(): void {
    if (!this.canGenerate() || this.providerId == null) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.draft = null;

    this.backofficeSupportService
      .dimarDraft(this.date, this.providerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.draft = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('[FE IA-08 T3] Error generando DIMAR draft:', err);
          this.errorMessage = this.translate.instant('backofficeSupport.error');
          this.loading = false;
        }
      });
  }

  public onPrint(): void {
    window.print();
  }

  /**
   * Exporta el borrador actual a CSV client-side. Header en espanol para
   * coincidir con la copia impresa que el humano lleva a DIMAR. No envia
   * nada al backend: la generacion y descarga viven en el navegador.
   */
  public onExportCsv(): void {
    if (!this.draft || !this.draft.passengers || this.draft.passengers.length === 0) {
      return;
    }
    const header = ['Reserva', 'Tour', 'Nombre', 'TipoDoc', 'NroDoc', 'Categoria edad'];
    const rows = this.draft.passengers.map((p) => [
      String(p.reservationId),
      p.tourName || '',
      p.payerName || '',
      p.documentType || '',
      p.documentNumber || '',
      p.ageType || '',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => this.csvCell(cell)).join(','))
      .join('\r\n');

    // BOM para que Excel abra UTF-8 correctamente.
    const bom = String.fromCharCode(0xFEFF);
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dimar-draft-${this.draft.date}-provider-${this.draft.providerId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private csvCell(value: string): string {
    if (value == null) return '';
    // Doblar comillas y envolver siempre en comillas para tolerar comas y saltos de linea.
    return '"' + String(value).replace(/"/g, '""') + '"';
  }

  public trackByPassenger(_i: number, p: DimarDraftPassenger): string {
    return `${p.reservationId}-${p.documentNumber}`;
  }
}
