import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { SharedModule } from '../../../shared/shared-module';
import { CreditService } from '../../../shared/services/credit.service';
import { AdminCreditsPageResponse, ClientCredit } from '../../../shared/models/credit.model';

type AdminCreditStatus =
  | 'ALL'
  | 'CREATED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'CANCELED'
  | 'EXPIRED'
  | 'DELETED';

/**
 * TC-022: pantalla admin/backoffice para gestion del listado global de creditos
 * de todos los turistas. Permite filtrar por status, paginar server-side, y
 * cerrar el ciclo de devolucion subiendo un comprobante (imagen o PDF) para los
 * creditos en status REFUND_REQUESTED.
 *
 * <p>Guardada por {@link import('../../../core/guards/backoffice.guard').BackofficeGuard},
 * cubre ADMIN y BACKOFFICE_OPERATION. No expone datos del turista en la vista
 * cliente (garantizado por el backend, que solo devuelve nombre/email en el
 * endpoint /admin/credits).</p>
 */
@Component({
  selector: 'app-admin-credits',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, TranslateModule],
  templateUrl: './admin-credits.component.html',
  styleUrls: ['./admin-credits.component.scss']
})
export class AdminCreditsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos y estado UI
  public credits: ClientCredit[] = [];
  public loading = false;
  public errorMessage = '';

  // Paginacion server-side (Spring Data: page es 0-based).
  public page = 0;
  public size = 10;
  public totalElements = 0;
  public totalPages = 0;

  // Filtro
  public selectedStatus: AdminCreditStatus = 'ALL';
  public readonly statusOptions: AdminCreditStatus[] = [
    'ALL',
    'CREATED',
    'REFUND_REQUESTED',
    'REFUNDED',
    'CANCELED',
    'EXPIRED',
    'DELETED'
  ];

  // Modal de subida de comprobante
  public showUploadModal = false;
  public uploadTarget: ClientCredit | null = null;
  public selectedFile: File | null = null;
  public previewUrl: string | null = null;
  public uploadInFlight = false;

  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  private readonly maxFileSizeBytes = 5 * 1024 * 1024; // 5MB

  constructor(
    private creditService: CreditService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadCredits();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.revokePreview();
  }

  public loadCredits(): void {
    this.loading = true;
    this.errorMessage = '';
    const statusParam = this.selectedStatus === 'ALL' ? undefined : this.selectedStatus;

    this.creditService
      .getAdminCredits(this.page, this.size, statusParam)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AdminCreditsPageResponse) => {
          this.credits = response.content || [];
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading admin credits', err);
          this.errorMessage =
            err?.error?.message || this.translate.instant('shared.messages.error');
          this.loading = false;
        }
      });
  }

  public onStatusChange(status: AdminCreditStatus): void {
    this.selectedStatus = status;
    this.page = 0;
    this.loadCredits();
  }

  public onPageChange(newPage: number): void {
    if (newPage < 0 || newPage >= this.totalPages) return;
    this.page = newPage;
    this.loadCredits();
  }

  public getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CREATED':
        return 'bg-success-subtle text-success';
      case 'REFUND_REQUESTED':
        return 'bg-warning-subtle text-warning';
      case 'REFUNDED':
        return 'bg-primary-subtle text-primary';
      case 'CANCELED':
      case 'DELETED':
        return 'bg-secondary-subtle text-secondary';
      case 'EXPIRED':
        return 'bg-danger-subtle text-danger';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  public getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CREATED':
        return this.translate.instant('clientCredits.statuses.created');
      case 'REFUND_REQUESTED':
        return this.translate.instant('credit.status.refundRequested');
      case 'REFUNDED':
        return this.translate.instant('credit.status.refunded');
      case 'CANCELED':
        return this.translate.instant('clientCredits.statuses.canceled');
      case 'EXPIRED':
        return this.translate.instant('clientCredits.statuses.expired');
      case 'DELETED':
        return this.translate.instant('clientCredits.statuses.eliminated');
      default:
        return status;
    }
  }

  public getStatusOptionLabel(status: AdminCreditStatus): string {
    if (status === 'ALL') return this.translate.instant('clientCredits.allStatuses');
    return this.getStatusLabel(status);
  }

  // ==== Modal comprobante ====
  public openUploadModal(credit: ClientCredit): void {
    this.uploadTarget = credit;
    this.selectedFile = null;
    this.revokePreview();
    this.showUploadModal = true;
  }

  public closeUploadModal(): void {
    this.showUploadModal = false;
    this.uploadTarget = null;
    this.selectedFile = null;
    this.revokePreview();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    if (!this.allowedMimeTypes.includes(file.type)) {
      this.snackBar.open(
        this.translate.instant('credit.upload.errorType'),
        'Ok',
        { duration: 3000 }
      );
      input.value = '';
      return;
    }
    if (file.size > this.maxFileSizeBytes) {
      this.snackBar.open(
        this.translate.instant('credit.upload.errorSize'),
        'Ok',
        { duration: 3000 }
      );
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.revokePreview();
    if (file.type.startsWith('image/')) {
      this.previewUrl = URL.createObjectURL(file);
    } else {
      // PDF: solo mostramos el nombre; no generamos preview grafico.
      this.previewUrl = null;
    }
  }

  public submitUpload(): void {
    if (!this.uploadTarget || !this.selectedFile || this.uploadInFlight) return;
    const target = this.uploadTarget;
    this.uploadInFlight = true;

    this.creditService.uploadRefundProof(target.id, this.selectedFile).subscribe({
      next: () => {
        this.uploadInFlight = false;
        this.snackBar.open(
          this.translate.instant('credit.upload.success'),
          'Ok',
          { duration: 3000 }
        );
        this.closeUploadModal();
        this.loadCredits();
      },
      error: (err) => {
        this.uploadInFlight = false;
        const backendMsg = err?.error?.message || err?.error?.error || '';
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('shared.messages.error'),
          text: backendMsg || this.translate.instant('shared.messages.error')
        });
      }
    });
  }

  private revokePreview(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  // Helpers de paginacion (numeros 1-based para la UI).
  public get displayPage(): number {
    return this.page + 1;
  }

  public get pageStart(): number {
    return this.credits.length === 0 ? 0 : this.page * this.size + 1;
  }

  public get pageEnd(): number {
    return this.page * this.size + this.credits.length;
  }
}
