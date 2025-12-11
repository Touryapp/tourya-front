import { Component, OnDestroy, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { Sort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../../shared/services/reservation.service';

// Interfaz para las reservas de tours del proveedor
export interface ProviderTourBooking {
  sNo?: number;
  id: string;
  tourName: string;
  tourType: string;
  img: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  travellers: string;
  duration: string;
  price: string;
  bookingDate: string;
  checkInDate: string;
  returnDate: string;
  status: 'Upcoming' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  destination: string;
  extraServices?: string[];
  activities?: string[];
  isSelected?: boolean;
}

@Component({
  selector: 'app-provider-tour-management',
  standalone: false,
  templateUrl: './provider-tour-management.component.html',
  styleUrl: './provider-tour-management.component.scss'
})
export class ProviderTourManagementComponent implements OnInit, OnDestroy {
  public routes = routes;
  
  // Variables de paginación y filtrado
  public pageSize = 10;
  public currentPage = 1;
  public totalBookings = 0;
  public searchDataValue = '';
  public selectedStatus = '';
  public selectedTourType = '';
  
  // Datos de la tabla
  public tableData: ProviderTourBooking[] = [];
  public tableDataCopy: ProviderTourBooking[] = [];
  
  // Modales
  public selectedBooking: ProviderTourBooking | null = null;

  // Dropdown states
  dropdownOpen = false;
  dropdownOpen1 = false;
  dropdownOpen2 = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.loadMockData();
    
    // Verificar si hay parámetros de query (desde el QR scan)
    this.route.queryParams.subscribe((params: any) => {
      console.log('📋 Query params recibidos:', params);
      
      if (params['openModal'] === 'true' && params['reservationId']) {
        console.log('🔓 Cargando reserva desde API con reservationId:', params['reservationId']);
        
        // Llamar al servicio para obtener los datos reales de la reserva
        this.reservationService.getReservationById(params['reservationId']).subscribe({
          next: (reservation) => {
            console.log('✅ Reserva obtenida del backend:', reservation);
            
            // Convertir la reserva del backend al formato ProviderTourBooking
            this.selectedBooking = this.mapReservationToBooking(reservation);
            
            // Abrir el modal automáticamente después de que la vista esté lista
            requestAnimationFrame(() => {
              const modalElement = document.getElementById('bookingDetailModal');
              if (modalElement) {
                const modal = new (window as any).bootstrap.Modal(modalElement);
                modal.show();
                console.log('✅ Modal abierto automáticamente con datos reales');
              } else {
                console.error('❌ No se encontró el elemento del modal');
              }
            });
          },
          error: (error) => {
            console.error('❌ Error al obtener la reserva:', error);
            
            // Fallback: crear objeto con los datos del QR si falla la llamada al backend
            console.log('⚠️ Usando datos del QR como fallback');
            this.selectedBooking = this.createBookingFromParams(params);
            
            // Abrir el modal de todos modos
            requestAnimationFrame(() => {
              const modalElement = document.getElementById('bookingDetailModal');
              if (modalElement) {
                const modal = new (window as any).bootstrap.Modal(modalElement);
                modal.show();
                console.log('✅ Modal abierto con datos del QR (fallback)');
              }
            });
          }
        });
      }
    });
  }
  
  /**
   * Mapea una Reservation del backend a ProviderTourBooking
   */
  private mapReservationToBooking(reservation: any): ProviderTourBooking {
    return {
      id: `RES-${reservation.id || reservation.reservationId}`,
      tourName: reservation.tourName || 'Reserva desde QR',
      tourType: reservation.tourType || 'Tour',
      img: 'tours-21.jpg',
      customerName: reservation.payer || 'Cliente',
      customerEmail: reservation.email || '',
      customerPhone: reservation.customerPhone || '+1 00000 00000',
      travellers: reservation.travellers || 'N/A',
      duration: reservation.duration || 'N/A',
      price: reservation.price ? `$${reservation.price}` : '$0',
      bookingDate: reservation.reservationDate ? new Date(reservation.reservationDate).toLocaleDateString() : 'N/A',
      checkInDate: reservation.checkInDate ? this.formatDateTime(reservation.checkInDate) : 'N/A',
      returnDate: reservation.returnDate ? this.formatDateTime(reservation.returnDate) : 'N/A',
      status: reservation.status || 'PENDING',
      destination: reservation.destination || 'N/A',
      extraServices: reservation.extraServices || [],
      activities: reservation.activities || [],
      isSelected: false
    };
  }
  
  /**
   * Formatea una fecha ISO a formato legible: "15 Oct 2025, 09:00 AM"
   */
  private formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    
    // Opciones para el formato de fecha
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    
    // Opciones para el formato de hora
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${formattedDate}, ${formattedTime}`;
  }
  
  /**
   * Crea un objeto de reserva desde los parámetros del QR
   */
  private createBookingFromParams(params: any): ProviderTourBooking {
    return {
      id: `RES-${params['reservationId']}`,
      tourName: 'Reserva desde QR',
      tourType: 'Tour',
      img: 'tours-21.jpg',
      customerName: decodeURIComponent(params['payer'] || 'Cliente'),
      customerEmail: params['email'] || '',
      customerPhone: '+1 00000 00000',
      travellers: 'N/A',
      duration: 'N/A',
      price: '$0',
      bookingDate: params['reservationDate'] ? new Date(params['reservationDate']).toLocaleDateString() : 'N/A',
      checkInDate: params['reservationDate'] ? new Date(params['reservationDate']).toLocaleString() : 'N/A',
      returnDate: 'N/A',
      status: (params['status'] || 'PENDING') as any,
      destination: 'N/A',
      extraServices: [],
      activities: [],
      isSelected: false
    };
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  /**
   * Carga datos mock para simular las reservas de tours
   */
  private loadMockData(): void {
    const mockData: ProviderTourBooking[] = [
      {
        id: 'TB-1001',
        tourName: 'LaughFest Carnival',
        tourType: 'Sightseeing Tours',
        img: 'tours-21.jpg',
        customerName: 'Chris Foxy',
        customerEmail: 'chrfo2356@example.com',
        customerPhone: '+1 12656 26654',
        travellers: '4 Adults, 2 Child',
        duration: '4 Days, 5 Nights',
        price: '$1,200',
        bookingDate: '15 May 2024',
        checkInDate: '20 May 2024, 10:50 AM',
        returnDate: '25 May 2024, 10:50 AM',
        status: 'Upcoming',
        destination: 'Las Vegas',
        extraServices: ['Local Expert Guides', 'Photography Services'],
        activities: ['Sightseeing', 'Boat Tours'],
        isSelected: false
      },
      {
        id: 'TB-1002',
        tourName: 'Beach Paradise Adventure',
        tourType: 'Adventure Tourism',
        img: 'tours-22.jpg',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@example.com',
        customerPhone: '+1 98765 43210',
        travellers: '2 Adults',
        duration: '7 Days, 6 Nights',
        price: '$2,500',
        bookingDate: '10 Jun 2024',
        checkInDate: '25 Jun 2024, 09:00 AM',
        returnDate: '02 Jul 2024, 06:00 PM',
        status: 'Confirmed',
        destination: 'Cancún',
        extraServices: ['Travel Insurance', 'Airport Transfer'],
        activities: ['Snorkeling', 'Beach Activities', 'Water Sports'],
        isSelected: false
      },
      {
        id: 'TB-1003',
        tourName: 'Mountain Expedition',
        tourType: 'Escorted Tour',
        img: 'tours-23.jpg',
        customerName: 'Michael Brown',
        customerEmail: 'm.brown@example.com',
        customerPhone: '+1 55544 33322',
        travellers: '6 Adults',
        duration: '5 Days, 4 Nights',
        price: '$1,800',
        bookingDate: '05 Jun 2024',
        checkInDate: '15 Jun 2024, 08:00 AM',
        returnDate: '20 Jun 2024, 05:00 PM',
        status: 'Pending',
        destination: 'Colorado',
        extraServices: ['Equipment Rental', 'Professional Guide'],
        activities: ['Hiking', 'Mountain Climbing'],
        isSelected: false
      },
      {
        id: 'TB-1004',
        tourName: 'City Lights Tour',
        tourType: 'Ground Tour',
        img: 'tours-24.jpg',
        customerName: 'Emma Wilson',
        customerEmail: 'emma.w@example.com',
        customerPhone: '+1 44433 22211',
        travellers: '2 Adults, 1 Child',
        duration: '3 Days, 2 Nights',
        price: '$950',
        bookingDate: '20 May 2024',
        checkInDate: '28 May 2024, 02:00 PM',
        returnDate: '31 May 2024, 11:00 AM',
        status: 'Completed',
        destination: 'New York',
        extraServices: ['City Pass', 'Museum Tickets'],
        activities: ['City Tours', 'Shopping'],
        isSelected: false
      },
      {
        id: 'TB-1005',
        tourName: 'Tropical Getaway',
        tourType: 'Adventure Tourism',
        img: 'tours-25.jpg',
        customerName: 'David Martinez',
        customerEmail: 'd.martinez@example.com',
        customerPhone: '+1 33322 11100',
        travellers: '4 Adults',
        duration: '10 Days, 9 Nights',
        price: '$3,400',
        bookingDate: '12 Jun 2024',
        checkInDate: '01 Jul 2024, 10:00 AM',
        returnDate: '11 Jul 2024, 04:00 PM',
        status: 'Cancelled',
        destination: 'Hawaii',
        extraServices: ['All-Inclusive Package'],
        activities: ['Surfing', 'Volcano Tour', 'Luau'],
        isSelected: false
      },
      {
        id: 'TB-1006',
        tourName: 'Historic Route 66',
        tourType: 'Ground Tour',
        img: 'tours-26.jpg',
        customerName: 'Lisa Anderson',
        customerEmail: 'lisa.a@example.com',
        customerPhone: '+1 22211 00099',
        travellers: '2 Adults',
        duration: '6 Days, 5 Nights',
        price: '$1,600',
        bookingDate: '18 Jun 2024',
        checkInDate: '05 Jul 2024, 07:00 AM',
        returnDate: '11 Jul 2024, 08:00 PM',
        status: 'Upcoming',
        destination: 'Route 66',
        extraServices: ['Car Rental', 'GPS Navigator'],
        activities: ['Road Trip', 'Photography'],
        isSelected: false
      }
    ];

    this.tableData = [...mockData];
    this.tableDataCopy = [...mockData];
    this.totalBookings = mockData.length;
  }

  /**
   * Busca en los datos de la tabla
   */
  public searchData(value: string): void {
    if (value === '') {
      this.tableData = [...this.tableDataCopy];
    } else {
      const searchTerm = value.trim().toLowerCase();
      this.tableData = this.tableDataCopy.filter(booking => 
        booking.id.toLowerCase().includes(searchTerm) ||
        booking.tourName.toLowerCase().includes(searchTerm) ||
        booking.customerName.toLowerCase().includes(searchTerm) ||
        booking.destination.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Filtra por estado
   */
  public filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  /**
   * Filtra por tipo de tour
   */
  public filterByTourType(tourType: string): void {
    this.selectedTourType = tourType;
    this.applyFilters();
  }

  /**
   * Aplica todos los filtros activos
   */
  private applyFilters(): void {
    let filteredData = [...this.tableDataCopy];

    // Filtrar por estado
    if (this.selectedStatus && this.selectedStatus !== '') {
      filteredData = filteredData.filter(booking => booking.status === this.selectedStatus);
    }

    // Filtrar por tipo de tour
    if (this.selectedTourType && this.selectedTourType !== '') {
      filteredData = filteredData.filter(booking => booking.tourType === this.selectedTourType);
    }

    this.tableData = filteredData;
  }

  /**
   * Limpia todos los filtros
   */
  public clearFilters(): void {
    this.selectedStatus = '';
    this.selectedTourType = '';
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
   * Abre el modal con los detalles de la reserva
   */
  public viewBookingDetails(booking: ProviderTourBooking): void {
    this.selectedBooking = booking;
    this.selectedBooking.status = 'Pending';
  }

  /**
   * Navega al escáner QR para confirmar la reserva
   */
  public navigateToQrScanner(bookingId?: string): void {
    this.router.navigate(['/providers/scan-qr']);
  }

  /**
   * Confirma una reserva (solo UI - mock)
   */
  public confirmBooking(bookingId: string): void {
    const booking = this.tableData.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'Confirmed';
      alert(`Reserva ${bookingId} confirmada exitosamente`);
    }
  }

  /**
   * Cancela una reserva (solo UI - mock)
   */
  public cancelBooking(bookingId: string): void {
    const booking = this.tableData.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'Cancelled';
      alert(`Reserva ${bookingId} cancelada`);
    }
  }

  /**
   * Marca una reserva como completada (solo UI - mock)
   */
  public completeBooking(bookingId: string): void {
    const booking = this.tableData.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'Completed';
      alert(`Reserva ${bookingId} marcada como completada`);
    }
  }

  /**
   * Exporta los datos (mock)
   */
  public exportData(format: 'pdf' | 'excel'): void {
    alert(`Exportando datos como ${format.toUpperCase()}...`);
  }

  /**
   * Obtiene la clase CSS según el estado
   */
  public getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Upcoming': 'badge-info',
      'Pending': 'badge-secondary',
      'Confirmed': 'badge-primary',
      'Cancelled': 'badge-danger',
      'Completed': 'badge-success'
    };
    return statusClasses[status] || 'badge-secondary';
  }
}
