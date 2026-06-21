import { Component, OnInit, OnDestroy } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { Sort } from '@angular/material/sort';
import { AuthService } from '../../../core/services/auth.service';
import { PayoutOrdersService } from '../../../shared/services/payout-orders.service';
import { PayoutOrder, PayoutOrdersResponse } from '../../../shared/dto/payout-order.dto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProviderPanelStateService } from '../../../shared/services/provider-panel-state.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-provider-payments',
  standalone: false,
  templateUrl: './provider-payments.component.html',
  styleUrl: './provider-payments.component.scss'
})
export class ProviderPaymentsComponent implements OnInit, OnDestroy {
  public routes = routes;
  
  // Variables de paginación y filtrado
  public pageSize = 10;
  public currentPage = 1;
  public totalPayments = 0;
  public totalAmount = 0;
  public paidTotal = 0;
  public pendingTotal = 0;
  public canceledTotal = 0;
  public totalIncome = 0;
  public searchDataValue = '';
  public selectedStatus = '';
  public loading = false;
  
  // Date Filters
  public fromDate?: string;
  public toDate?: string;
  
  // Datos de la tabla
  public tableData: PayoutOrder[] = [];
  public tableDataCopy: PayoutOrder[] = [];

  public selectedPayment: PayoutOrder | null = null;
  public showPaymentDetailsModal: boolean = false;

  constructor(
    public authService: AuthService,
    private payoutOrdersService: PayoutOrdersService,
    private snackBar: MatSnackBar,
    private panelStateService: ProviderPanelStateService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  /**
   * Carga datos reales desde el servicio
   */
  public loadData(): void {
    this.loading = true;
    const observer = {
      next: (data: PayoutOrdersResponse) => {
        this.tableData = data.orders || [];
        this.tableDataCopy = [...this.tableData];
        this.totalPayments = this.tableData.length;
        this.paidTotal = data.paidTotal || 0;
        this.pendingTotal = data.pendingTotal || 0;
        this.canceledTotal = data.canceledTotal || 0;
        this.totalIncome = data.totalIncome || 0;
        this.totalAmount = this.paidTotal;
        this.loading = false;
        
        const paymentToOpenId = this.panelStateService.getPaymentToOpen();
        if (paymentToOpenId) {
          const paymentToOpen = this.tableData.find(p => p.id === paymentToOpenId);
          if (paymentToOpen) {
            setTimeout(() => this.openPaymentDetails(paymentToOpen), 300);
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading payout orders:', error);
        this.snackBar.open('Error al cargar las órdenes de pago', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    };

    if (this.authService.isAdmin()) {
      this.payoutOrdersService.getAdminPayoutOrders(this.selectedStatus, this.fromDate, this.toDate).subscribe(observer);
    } else {
      this.payoutOrdersService.getPayoutOrders(this.selectedStatus, this.fromDate, this.toDate).subscribe(observer);
    }
  }

  /**
   * Calcula totales
   */
  private calculateTotals(): void {
    const completedPayments = this.tableData.filter(p => p.status === 'PAID');
    this.totalAmount = completedPayments.reduce((sum, payment) => sum + payment.amountTotal, 0);
  }

  /**
   * Busca en los datos de la tabla
   */
  public searchData(value: string): void {
    if (value === '') {
      this.tableData = [...this.tableDataCopy];
    } else {
      const searchTerm = value.trim().toLowerCase();
      this.tableData = this.tableDataCopy.filter(payment => 
        payment.id.toString().includes(searchTerm) ||
        payment.providerId.toString().includes(searchTerm)
      );
    }
  }

  /**
   * Filtra por estado
   */
  public filterByStatus(status: string): void {
    this.selectedStatus = status === 'All' ? '' : status;
    this.loadData();
  }

  /**
   * Filtra por fecha
   */
  public onDateRangeChange(event: {fromDate: string, toDate: string} | null): void {
    if (event) {
      this.fromDate = event.fromDate;
      this.toDate = event.toDate;
    } else {
      this.fromDate = undefined;
      this.toDate = undefined;
    }
    this.loadData();
  }

  /**
   * Limpia todos los filtros
   */
  public clearFilters(): void {
    this.selectedStatus = '';
    this.searchDataValue = '';
    this.fromDate = undefined;
    this.toDate = undefined;
    this.loadData();
  }

  /**
   * Ordena los datos de la tabla
   */
  public sortData(sort: Sort): void {
    const data = this.tableData.slice();

    if (!sort.active || sort.direction === '') {
      this.tableData = data;
    } else {
      this.tableData = data.sort((a, b) => {
        const aValue = (a as any)[sort.active];
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  /**
   * Exporta los datos (mock)
   */
  public exportData(format: 'pdf' | 'excel'): void {
    Swal.fire({
      icon: 'info',
      title: 'Exportando',
      text: `Exportando pagos como ${format.toUpperCase()}...`,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6'
    });
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  public getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'PAID': 'badge-success',
      'PENDING': 'badge-secondary',
      'CANCELLED': 'badge-danger'
    };
    return statusClasses[status] || 'badge-secondary';
  }

  /**
   * Traduce el estado para visualización
   */
  public getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'PAID': 'Pagada',
      'PENDING': 'Pendiente',
      'CANCELLED': 'Cancelada'
    };
    return statusLabels[status] || status;
  }

  /**
   * Obtiene el icono según el método de pago
   */
  public getPaymentMethodIcon(method: string): string {
    const icons: { [key: string]: string } = {
      'Credit Card': 'isax-card',
      'Debit Card': 'isax-card',
      'Wompi': 'isax-wallet-money',
      'PayPal': 'isax-wallet-2',
      'Bank Transfer': 'isax-bank'
    };
    return icons[method] || 'isax-dollar-square';
  }

  /**
   * Obtiene el conteo de pagos por estado
   */
  public getPaymentCountByStatus(status: string): number {
    return this.tableDataCopy.filter(payment => payment.status === status).length;
  }

  public openPaymentDetails(payment: PayoutOrder): void {
    this.selectedPayment = payment;
    this.showPaymentDetailsModal = true;
  }

  public closePaymentDetailsModal(): void {
    this.showPaymentDetailsModal = false;
    this.selectedPayment = null;
  }

  /**
   * Descargar factura
   */
  public downloadInvoice(paymentId: number): void {
    Swal.fire({
      icon: 'info',
      title: 'Descargando factura',
      text: `Descargando factura para ${paymentId} - Próximamente`,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6'
    });
  }

  /**
   * Subir archivo para pago pendiente (Solo Admin)
   */
  public onFileSelected(event: any, payment: PayoutOrder): void {
    event.stopPropagation();
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5242880) { // 5MB en bytes (ajustado de 1MB a 5MB)
        this.snackBar.open('El archivo excede el tamaño máximo permitido de 5MB.', 'Cerrar', { duration: 3000 });
        event.target.value = ''; // Limpiar el input
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Solo se permiten archivos .pdf, .jpg y .png.', 'Cerrar', { duration: 3000 });
        event.target.value = ''; // Limpiar el input
        return;
      }
      
      this.loading = true;
      this.payoutOrdersService.uploadPaymentProof(payment.id, file).subscribe({
        next: (response) => {
          this.snackBar.open(`Comprobante subido exitosamente para la orden #${payment.id}`, 'Cerrar', { duration: 3000 });
          this.loadData(); // Recargar datos para ver el cambio de estado y el proofUrl
        },
        error: (error) => {
          console.error('Error uploading proof:', error);
          this.snackBar.open('Error al subir el comprobante', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
}
