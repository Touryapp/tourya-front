import { Component, OnInit, OnDestroy } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { Sort } from '@angular/material/sort';
import { AuthService } from '../../../core/services/auth.service';

// Interfaz para los pagos recibidos por el proveedor
export interface ProviderPayment {
  id: string;
  tourOperatorId: string;
  creationDate: string;
  paymentDate: string;
  amount: string;
  amountNumber: number;
  status: 'Pendiente' | 'Pagada' | 'Cancelada';
}

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
  public searchDataValue = '';
  public selectedStatus = '';
  
  // Datos de la tabla
  public tableData: ProviderPayment[] = [];
  public tableDataCopy: ProviderPayment[] = [];

  public selectedPayment: ProviderPayment | null = null;
  public showPaymentDetailsModal: boolean = false;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.loadMockData();
    this.calculateTotals();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  /**
   * Carga datos mock para simular los pagos recibidos
   */
  private loadMockData(): void {
    const mockData: ProviderPayment[] = [
      {
        id: 'PAY-001',
        tourOperatorId: 'OP-1001',
        creationDate: '2024-10-15',
        paymentDate: '2024-10-20',
        amount: '$1,200.00',
        amountNumber: 1200,
        status: 'Pagada'
      },
      {
        id: 'PAY-002',
        tourOperatorId: 'OP-1002',
        creationDate: '2024-10-10',
        paymentDate: '-',
        amount: '$2,500.00',
        amountNumber: 2500,
        status: 'Pendiente'
      },
      {
        id: 'PAY-003',
        tourOperatorId: 'OP-1003',
        creationDate: '2024-10-05',
        paymentDate: '-',
        amount: '$1,800.00',
        amountNumber: 1800,
        status: 'Cancelada'
      },
      {
        id: 'PAY-004',
        tourOperatorId: 'OP-1001',
        creationDate: '2024-09-20',
        paymentDate: '2024-09-25',
        amount: '$950.00',
        amountNumber: 950,
        status: 'Pagada'
      },
      {
        id: 'PAY-005',
        tourOperatorId: 'OP-1005',
        creationDate: '2024-09-15',
        paymentDate: '-',
        amount: '$3,400.00',
        amountNumber: 3400,
        status: 'Pendiente'
      }
    ];

    this.tableData = [...mockData];
    this.tableDataCopy = [...mockData];
    this.totalPayments = mockData.length;
  }

  /**
   * Calcula totales
   */
  private calculateTotals(): void {
    const completedPayments = this.tableData.filter(p => p.status === 'Pagada');
    this.totalAmount = completedPayments.reduce((sum, payment) => sum + payment.amountNumber, 0);
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
        payment.id.toLowerCase().includes(searchTerm) ||
        payment.tourOperatorId.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Filtra por estado
   */
  public filterByStatus(status: string): void {
    this.selectedStatus = status;
    if (status === '' || status === 'All') {
      this.tableData = [...this.tableDataCopy];
    } else {
      this.tableData = this.tableDataCopy.filter(payment => payment.status === status);
    }
  }

  /**
   * Limpia todos los filtros
   */
  public clearFilters(): void {
    this.selectedStatus = '';
    this.searchDataValue = '';
    this.tableData = [...this.tableDataCopy];
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
        const aValue = (a as never)[sort.active];
        const bValue = (b as never)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  /**
   * Exporta los datos (mock)
   */
  public exportData(format: 'pdf' | 'excel'): void {
    alert(`Exportando pagos como ${format.toUpperCase()}...`);
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  public getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Pagada': 'badge-success',
      'Pendiente': 'badge-secondary',
      'Cancelada': 'badge-danger'
    };
    return statusClasses[status] || 'badge-secondary';
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

  /**
   * Ver detalles de un pago
   */
  public viewPaymentDetails(paymentId: string): void {
    alert(`Ver detalles del pago ${paymentId} - Próximamente`);
  }

  public openPaymentDetails(payment: ProviderPayment): void {
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
  public downloadInvoice(paymentId: string): void {
    alert(`Descargando factura para ${paymentId} - Próximamente`);
  }

  /**
   * Subir archivo para pago pendiente
   */
  public onFileSelected(event: any, payment: ProviderPayment): void {
    event.stopPropagation();
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1048576) { // 1MB en bytes
        alert('El archivo excede el tamaño máximo permitido de 1MB.');
        event.target.value = ''; // Limpiar el input
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos .pdf, .jpg y .png.');
        event.target.value = ''; // Limpiar el input
        return;
      }
      
      alert(`Archivo ${file.name} seleccionado para el pago ${payment.id}`);
      // Lógica para subir el archivo
    }
  }
}
