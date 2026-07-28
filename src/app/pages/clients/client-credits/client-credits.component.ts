import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CreditService } from '../../../shared/services/credit.service';
import { ClientCredit } from '../../../shared/models/credit.model';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-client-credits',
  standalone: false,
  templateUrl: './client-credits.component.html',
  styleUrl: './client-credits.component.scss'
})
export class ClientCreditsComponent implements OnInit {
  @Input() mode: 'profile' | 'payment' = 'profile';
  @Input() set creditsAvailable(value: ClientCredit[]) {
    if (value && value.length > 0) {
      this.tableData = [...value];
      this.totalCredits = value.length;
      this.isLoading = false;
    }
  }
  @Input() maxValue: number = 0;
  @Input() isProcessing: boolean = false;
  @Output() useCredits = new EventEmitter<ClientCredit[]>();
  @Output() cancel = new EventEmitter<void>();

  public tableData: ClientCredit[] = [];
  public totalCredits = 0;
  public isLoading = false;

  // Selección de créditos
  public selectedCreditsIds: Set<number> = new Set();
  public allSelected = false;

  // Paginación
  public pageSize = 10;
  public currentPage = 1;

  // Filtro de estado
  public selectedStatus: string = '';

  constructor(private creditService: CreditService) {}

  ngOnInit(): void {
    if (this.mode === 'profile') {
      this.loadCredits();
    } else {
      this.selectedStatus = 'CREATED';
    }
  }

  public onStatusChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedStatus = selectElement.value;
    this.loadCredits();
  }

  private loadCredits(): void {
    this.isLoading = true;
    
    // Pasar el status solo si no es vacío ('')
    const statusParam = this.selectedStatus ? this.selectedStatus : undefined;

    this.creditService.getCredits(statusParam).subscribe({
      next: (credits) => {
        this.tableData = credits;
        this.totalCredits = credits.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar créditos:', error);
        this.isLoading = false;
      }
    });
  }

  // Helper para el badge de estado
  public getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'CREATED':
        return 'bg-success-subtle text-success';
      case 'USED':
      case 'APPLIED':
      case 'CONSUMED':
        return 'bg-secondary-subtle text-secondary';
      case 'EXPIRED':
        return 'bg-danger-subtle text-danger';
      default:
        return 'bg-warning-subtle text-warning';
    }
  }

  // Lógica de selección
  public toggleSelectAll(event: any): void {
    this.allSelected = event.target.checked;
    if (this.allSelected) {
      this.tableData.forEach(credit => this.selectedCreditsIds.add(credit.id));
    } else {
      this.selectedCreditsIds.clear();
    }
  }

  public toggleCreditSelection(creditId: number): void {
    if (this.selectedCreditsIds.has(creditId)) {
      this.selectedCreditsIds.delete(creditId);
    } else {
      this.selectedCreditsIds.add(creditId);
    }
    this.allSelected = this.selectedCreditsIds.size === this.tableData.length;
  }

  public isSelected(creditId: number): boolean {
    return this.selectedCreditsIds.has(creditId);
  }

  public emitSelectedCredits(): void {
    const selected = this.tableData.filter(credit => this.selectedCreditsIds.has(credit.id));
    this.useCredits.emit(selected);
  }

  public cancelSelection(): void {
    this.cancel.emit();
  }

  get totalSelectedAmount(): number {
    return this.tableData
      .filter(credit => this.selectedCreditsIds.has(credit.id))
      .reduce((acc, credit) => acc + credit.amount, 0);
  }

  get isExceedingMax(): boolean {
    return this.maxValue > 0 && this.totalSelectedAmount > this.maxValue;
  }
}
