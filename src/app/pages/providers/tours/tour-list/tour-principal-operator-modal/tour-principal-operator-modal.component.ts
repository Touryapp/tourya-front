import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ProviderUsersService } from '../../../../../shared/services/provider-users.service';
import { ProviderUser } from '../../../../../shared/models/provider-user.model';

/**
 * BE-22b: modal que se abre desde el card del tour para asignar el operador
 * principal de ese tour. Lista operadores asignados (GET /provider/users/tour/{id}),
 * permite marcar uno como principal (PUT /provider/users/{id}/principal-tour).
 *
 * Regla (RN-009 reescrita por Luis 2026-07-19): "por default, el PROVIDER es el
 * contacto principal del tour". Si no hay operadores asignados, el modal muestra
 * un mensaje explicativo con enlace a /providers/users para asignar operadores
 * primero.
 */
@Component({
  selector: 'app-tour-principal-operator-modal',
  standalone: false,
  templateUrl: './tour-principal-operator-modal.component.html',
  styleUrls: ['./tour-principal-operator-modal.component.scss']
})
export class TourPrincipalOperatorModalComponent implements OnChanges {
  @Input() tourId: number | null = null;
  @Input() tourName: string = '';
  @Input() showModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  operators: ProviderUser[] = [];
  selectedPrincipalId: number | null = null;
  originalPrincipalId: number | null = null;
  loading: boolean = false;
  saving: boolean = false;
  errorMessage: string | null = null;

  constructor(private providerUsersService: ProviderUsersService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal'] && this.showModal && this.tourId != null) {
      this.load();
    }
    if (changes['showModal'] && !this.showModal) {
      this.reset();
    }
  }

  private load(): void {
    if (this.tourId == null) return;
    this.loading = true;
    this.errorMessage = null;
    this.providerUsersService.listByTour(this.tourId).subscribe({
      next: (list) => {
        this.operators = list ?? [];
        const principal = this.operators.find(op => op.tours?.some(t => t.isPrincipal));
        this.originalPrincipalId = principal ? principal.providerUserId : null;
        this.selectedPrincipalId = this.originalPrincipalId;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message ?? 'Error cargando operadores';
      }
    });
  }

  select(operatorId: number): void {
    this.selectedPrincipalId = operatorId;
  }

  isDirty(): boolean {
    return this.selectedPrincipalId !== this.originalPrincipalId;
  }

  save(): void {
    if (!this.isDirty() || this.selectedPrincipalId == null || this.tourId == null) return;
    this.saving = true;
    this.errorMessage = null;
    this.providerUsersService.changePrincipalTour(this.selectedPrincipalId, this.tourId).subscribe({
      next: () => {
        this.saving = false;
        this.originalPrincipalId = this.selectedPrincipalId;
        this.close();
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message ?? 'No se pudo guardar el cambio';
      }
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  private reset(): void {
    this.operators = [];
    this.selectedPrincipalId = null;
    this.originalPrincipalId = null;
    this.errorMessage = null;
  }
}
