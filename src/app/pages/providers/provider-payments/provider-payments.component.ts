import { Component, OnInit, OnDestroy } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { Sort } from '@angular/material/sort';

// Interfaz para los pagos recibidos por el proveedor
export interface ProviderPayment {
  sNo?: number;
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  tourName: string;
  tourImage: string;
  amount: string;
  amountNumber: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId: string;
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Refunded';
  commission?: string;
  netAmount?: string;
  isSelected?: boolean;
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

  constructor() {}

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
        bookingId: 'TB-1001',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@example.com',
        tourName: 'LaughFest Carnival',
        tourImage: 'tours-21.jpg',
        amount: '$1,200.00',
        amountNumber: 1200,
        paymentMethod: 'Credit Card',
        paymentDate: '2024-10-20',
        transactionId: 'TXN-2024102001',
        status: 'Completed',
        commission: '$120.00',
        netAmount: '$1,080.00',
        isSelected: false
      },
      {
        id: 'PAY-002',
        bookingId: 'TB-1002',
        customerName: 'Michael Chen',
        customerEmail: 'm.chen@example.com',
        tourName: 'Beach Paradise Adventure',
        tourImage: 'tours-22.jpg',
        amount: '$2,500.00',
        amountNumber: 2500,
        paymentMethod: 'Wompi',
        paymentDate: '2024-10-18',
        transactionId: 'TXN-2024101801',
        status: 'Completed',
        commission: '$250.00',
        netAmount: '$2,250.00',
        isSelected: false
      },
      {
        id: 'PAY-003',
        bookingId: 'TB-1003',
        customerName: 'Emma Wilson',
        customerEmail: 'emma.w@example.com',
        tourName: 'Mountain Expedition',
        tourImage: 'tours-23.jpg',
        amount: '$1,800.00',
        amountNumber: 1800,
        paymentMethod: 'PayPal',
        paymentDate: '2024-10-15',
        transactionId: 'TXN-2024101501',
        status: 'Pending',
        commission: '$180.00',
        netAmount: '$1,620.00',
        isSelected: false
      },
      {
        id: 'PAY-004',
        bookingId: 'TB-1004',
        customerName: 'David Martinez',
        customerEmail: 'd.martinez@example.com',
        tourName: 'City Lights Tour',
        tourImage: 'tours-24.jpg',
        amount: '$950.00',
        amountNumber: 950,
        paymentMethod: 'Credit Card',
        paymentDate: '2024-10-12',
        transactionId: 'TXN-2024101201',
        status: 'Completed',
        commission: '$95.00',
        netAmount: '$855.00',
        isSelected: false
      },
      {
        id: 'PAY-005',
        bookingId: 'TB-1005',
        customerName: 'Lisa Anderson',
        customerEmail: 'lisa.a@example.com',
        tourName: 'Tropical Getaway',
        tourImage: 'tours-25.jpg',
        amount: '$3,400.00',
        amountNumber: 3400,
        paymentMethod: 'Wompi',
        paymentDate: '2024-10-10',
        transactionId: 'TXN-2024101001',
        status: 'Cancelled',
        commission: '$340.00',
        netAmount: '$3,060.00',
        isSelected: false
      },
      {
        id: 'PAY-006',
        bookingId: 'TB-1006',
        customerName: 'James Brown',
        customerEmail: 'james.b@example.com',
        tourName: 'Historic Route 66',
        tourImage: 'tours-26.jpg',
        amount: '$1,600.00',
        amountNumber: 1600,
        paymentMethod: 'Debit Card',
        paymentDate: '2024-10-08',
        transactionId: 'TXN-2024100801',
        status: 'Completed',
        commission: '$160.00',
        netAmount: '$1,440.00',
        isSelected: false
      },
      {
        id: 'PAY-007',
        bookingId: 'TB-1007',
        customerName: 'Maria Garcia',
        customerEmail: 'm.garcia@example.com',
        tourName: 'LaughFest Carnival',
        tourImage: 'tours-21.jpg',
        amount: '$1,350.00',
        amountNumber: 1350,
        paymentMethod: 'Credit Card',
        paymentDate: '2024-10-05',
        transactionId: 'TXN-2024100501',
        status: 'Completed',
        commission: '$135.00',
        netAmount: '$1,215.00',
        isSelected: false
      },
      {
        id: 'PAY-008',
        bookingId: 'TB-1008',
        customerName: 'Robert Taylor',
        customerEmail: 'r.taylor@example.com',
        tourName: 'Beach Paradise Adventure',
        tourImage: 'tours-22.jpg',
        amount: '$2,200.00',
        amountNumber: 2200,
        paymentMethod: 'Wompi',
        paymentDate: '2024-10-03',
        transactionId: 'TXN-2024100301',
        status: 'Refunded',
        commission: '$220.00',
        netAmount: '$1,980.00',
        isSelected: false
      },
      {
        id: 'PAY-009',
        bookingId: 'TB-1009',
        customerName: 'Jennifer Lee',
        customerEmail: 'j.lee@example.com',
        tourName: 'Mountain Expedition',
        tourImage: 'tours-23.jpg',
        amount: '$1,750.00',
        amountNumber: 1750,
        paymentMethod: 'Credit Card',
        paymentDate: '2024-10-01',
        transactionId: 'TXN-2024100101',
        status: 'Pending',
        commission: '$175.00',
        netAmount: '$1,575.00',
        isSelected: false
      },
      {
        id: 'PAY-010',
        bookingId: 'TB-1010',
        customerName: 'Christopher White',
        customerEmail: 'c.white@example.com',
        tourName: 'City Lights Tour',
        tourImage: 'tours-24.jpg',
        amount: '$1,100.00',
        amountNumber: 1100,
        paymentMethod: 'PayPal',
        paymentDate: '2024-09-28',
        transactionId: 'TXN-2024092801',
        status: 'Completed',
        commission: '$110.00',
        netAmount: '$990.00',
        isSelected: false
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
    const completedPayments = this.tableData.filter(p => p.status === 'Completed');
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
        payment.bookingId.toLowerCase().includes(searchTerm) ||
        payment.customerName.toLowerCase().includes(searchTerm) ||
        payment.tourName.toLowerCase().includes(searchTerm) ||
        payment.transactionId.toLowerCase().includes(searchTerm)
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
      'Completed': 'badge-success',
      'Pending': 'badge-secondary',
      'Cancelled': 'badge-danger',
      'Refunded': 'badge-warning'
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

  /**
   * Descargar factura
   */
  public downloadInvoice(paymentId: string): void {
    alert(`Descargando factura para ${paymentId} - Próximamente`);
  }
}
