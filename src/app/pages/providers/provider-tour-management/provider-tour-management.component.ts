import { Component, OnDestroy, OnInit, Input, OnChanges } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { Sort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../../shared/services/reservation.service';
import { ClientReservation } from '../../../shared/models/reservation.model';
import {
  BookingManagementConfig,
  BookingManagementConfigService,
  UserRole,
  ActionConfig,
  ColumnConfig
} from '../../../shared/services/booking-management-config.service';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { I18nFieldService } from '../../../shared/services/i18n-field.service';
import { ReviewsService } from '../../../core/services/reviews.service';
import { MatDialog } from '@angular/material/dialog';
import { TourSlotSelectionModalComponent } from '../../../shared/common/tour-slot-selection-modal/tour-slot-selection-modal.component';
import { SearchToursService } from '../../clients/list-tours/search-tours.service';
import { TourScheduleResponseDto } from '../../../shared/dto/search-tour-response.dto';
import { CartItem } from '../../../shared/dto/cart.dto';

// Interfaz para las reservas de tours del proveedor
export interface ProviderTourBooking {
  sNo?: number;
  id: string;
  tourId?: number; // ID del tour para reagendamiento
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
  maxCancellationDate?: string; // ISO date string - maximum date for cancellation
  maxReschedulingDate?: string; // ISO date string - maximum date for rescheduling
}

@Component({
  selector: 'app-provider-tour-management',
  standalone: false,
  templateUrl: './provider-tour-management.component.html',
  styleUrl: './provider-tour-management.component.scss'
})
export class ProviderTourManagementComponent implements OnInit, OnDestroy, OnChanges {
  public routes = routes;
  
  // Configuración dinámica según rol
  config!: BookingManagementConfig;
  currentRole!: UserRole;
  
  // Variables de paginación y filtrado
  public pageSize = 10;
  public currentPage = 1;
  public totalBookings = 0;
  public totalPages = 0; // Agregado para paginación
  public searchDataValue = '';
  public selectedStatus = '';
  public selectedTourType = '';
  
  // Datos de la tabla (any[] para permitir acceso dinámico)
  public tableData: any[] = [];
  public tableDataCopy: any[] = [];
  
  // Modales
  public selectedBooking: any | null = null;

  // Flag para evitar que el modal se abra múltiples veces desde el QR
  private modalOpenedFromQR: boolean = false;

  // Dropdown states
  dropdownOpen = false;
  dropdownOpen1 = false;
  dropdownOpen2 = false;

  // Inputs from parent component
  @Input() highlightedReservationId: number | null = null;
  @Input() shouldCreateReview: boolean = false;

  // Review modal state
  public showReviewModal: boolean = false;
  public reviewModalBooking: any | null = null;
  public reviewRating: number = 0;
  public reviewComment: string = '';
  public reviewImages: File[] = [];

  // Cancellation modal state
  public showCancelModal: boolean = false;
  public cancelModalBooking: any | null = null;
  public cancellationReason: string = '';

  // Reschedule date selection modal state
  public showRescheduleDateModal: boolean = false;
  public rescheduleDateModalBooking: any | null = null;
  public rescheduleCheckIn: string = '';
  public rescheduleCheckOut: string = '';
  public get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private configService: BookingManagementConfigService,
    private authService: AuthService,
    private translate: TranslateService,
    public i18nService: I18nFieldService,
    private reviewsService: ReviewsService,
    private dialog: MatDialog,
    private searchToursService: SearchToursService
  ) {}

  ngOnInit(): void {
    console.log('🚀 ProviderTourManagementComponent - ngOnInit iniciado');
    
    // Detectar rol y cargar configuración
    this.currentRole = this.getUserRole();
    this.config = this.configService.getConfigByRole(this.currentRole);
    
    // Cargar datos según el rol
    if (this.currentRole === 'CLIENT') {
      this.loadClientReservations();
    } else if (this.currentRole === 'PROVIDER') {
      this.loadProviderReservations();
    } else {
      this.loadMockData();
    }
    
    // Verificar si hay parámetros de query (desde el QR scan)
    this.route.queryParams.subscribe((params: any) => {
      console.log('📋 Query params recibidos en provider-tour-management:', params);
      
      // Solo procesar si openModal=true, hay reservationId y NO se ha abierto el modal antes
      if (params['openModal'] === 'true' && params['reservationId'] && !this.modalOpenedFromQR) {
        console.log('🔓 Cargando reserva desde API con reservationId:', params['reservationId']);
        
        // Marcar que el modal ya fue abierto desde QR
        this.modalOpenedFromQR = true;
        
        // NO limpiar los query params aquí, lo hace el componente padre (provider-panel)
        
        // Llamar al servicio para obtener los datos reales de la reserva
        this.reservationService.getReservationById(params['reservationId']).subscribe({
          next: (reservation) => {
            console.log('✅ Reserva obtenida del backend:', reservation);
            
            // Convertir la reserva del backend al formato ProviderTourBooking
            this.selectedBooking = this.mapReservationToBooking(reservation);
            
            // Abrir el modal con retry para asegurar que el DOM esté listo
            this.openModalWithRetry();
          },
          error: (error) => {
            console.error('❌ Error al obtener la reserva:', error);
            
            // Fallback: crear objeto con los datos del QR si falla la llamada al backend
            console.log('⚠️ Usando datos del QR como fallback');
            this.selectedBooking = this.createBookingFromParams(params);
            
            // Abrir el modal con retry
            this.openModalWithRetry();
          }
        });
      }
    });
    
    // Agregar listener para cuando se cierra el modal de detalles de la reserva
    // Esto limpiará los query params para evitar que se vuelvan a abrir los modales
    setTimeout(() => {
      const modalElement = document.getElementById('bookingDetailModal');
      if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', () => {
          console.log('🔒 Modal de detalles cerrado - limpiando query params');
          this.clearQueryParams();
        });
      }
    }, 1000);
  }
  
  /**
   * Mapea una ReservationDetails del backend a ProviderTourBooking
   */
  private mapReservationToBooking(reservation: any): ProviderTourBooking {
    // Formatear las fechas correctamente
    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return 'N/A';
      }
    };

    const formatDateTime = (dateString: string) => {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return `${dateStr}, ${timeStr}`;
      } catch {
        return 'N/A';
      }
    };

    return {
      id: `RES-${reservation.reservationId}`,
      tourId: reservation.tourId, // Mapear el ID del tour
      tourName: reservation.tourName || 'N/A',
      tourType: reservation.tourType || 'N/A',
      img: 'tours-21.jpg',
      customerName: reservation.serviceResponsible?.name || 'N/A',
      customerEmail: reservation.serviceResponsible?.email || 'N/A',
      customerPhone: reservation.serviceResponsible?.phone || 'N/A',
      travellers: reservation.travellers || 'N/A',
      duration: reservation.duration ? `${reservation.duration} días` : 'N/A',
      price: reservation.price ? `$${reservation.price.toFixed(2)}` : '$0.00',
      bookingDate: formatDate(reservation.createdDate),
      checkInDate: formatDateTime(reservation.checkInDate),
      returnDate: formatDateTime(reservation.returnDate),
      status: this.mapReservationStatus(reservation.deliveryStatus),
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
   * Obtiene el rol del usuario actual
   */
  private getUserRole(): UserRole {
    if (this.authService.isAdmin()) {
      return 'ADMIN';
    } else if (this.authService.isProvider()) {
      return 'PROVIDER';
    } else if (this.authService.isUser()) {
      return 'CLIENT';
    }
    throw new Error('Usuario sin rol válido asignado');
  }

  /**
   * Carga las reservas reales del proveedor desde el API
   */
  private loadProviderReservations(): void {
    this.reservationService.getProviderReservations({
      page: this.currentPage - 1,
      size: this.pageSize
    }).subscribe({
      next: (response) => {
        console.log('✅ Reservas del proveedor cargadas:', response);
        
        // Mapear las reservas del API al formato de la tabla
        const mappedReservations = response.content.map((reservation, index) => 
          this.mapProviderReservationToBooking(reservation, index)
        );
        
        this.tableData = mappedReservations;
        this.tableDataCopy = [...mappedReservations];
        this.totalBookings = response.totalElements;
        this.totalPages = response.totalPages;
      },
      error: (error) => {
        console.error('❌ Error al cargar reservas del proveedor:', error);
        // Fallback a datos mock en caso de error
        this.loadMockData();
      }
    });
  }

  /**
   * Carga las reservas reales del cliente desde el API
   */
  private loadClientReservations(): void {
    this.reservationService.getClientReservations({
      page: this.currentPage - 1,
      size: this.pageSize
    }).subscribe({
      next: (response) => {
        console.log('✅ Reservas del cliente cargadas:', response);
        
        // Mapear las reservas del API al formato de la tabla
        const mappedReservations = response.content.map((reservation, index) => 
          this.mapClientReservationToBooking(reservation, index)
        );
        
        this.tableData = mappedReservations;
        this.tableDataCopy = [...mappedReservations];
        this.totalBookings = response.totalElements;
        this.totalPages = response.totalPages; // Guardar total de páginas
      },
      error: (error) => {
        console.error('❌ Error al cargar reservas del cliente:', error);
        // Fallback a datos mock en caso de error
        this.loadMockData();
      }
    });
  }

  /**
   * Mapea una ClientReservation del API a ProviderTourBooking para la tabla (proveedores)
   * Nota: El API devuelve la misma estructura ClientReservation para proveedores y clientes
   */
  private mapProviderReservationToBooking(reservation: ClientReservation, index: number): ProviderTourBooking {

    return {
      sNo: index + 1,
      id: `RES-${reservation.reservationId}`,
      tourName: this.i18nService.getValue(reservation.tourName),
      tourType: 'Tour',
      img: 'tours-21.jpg',
      customerName: reservation.payerName,
      customerEmail: reservation.payerEmail,
      customerPhone: reservation.payerPhone,
      travellers: `${reservation.totalTourists} ${reservation.totalTourists === 1 ? 'Turista' : 'Turistas'}`,
      duration: `${reservation.slotTimeStart} - ${reservation.slotTimeEnd}`,
      price: `$${reservation.shoppingTotalPrice.toFixed(2)}`,
      bookingDate: new Date(reservation.reservationCreatedDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      checkInDate: `${new Date(reservation.scheduleDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}, ${reservation.slotTimeStart}`,
      returnDate: `${new Date(reservation.scheduleDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}, ${reservation.slotTimeEnd}`,
      status: this.mapReservationStatus(reservation.reservationDeliveryStatus),
      destination: 'N/A',
      extraServices: [],
      activities: [],
      isSelected: false,
      maxCancellationDate: reservation.maxCancellationDate,
      maxReschedulingDate: reservation.maxReschedulingDate
    };
  }

  /**
   * Mapea una ClientReservation del API a ProviderTourBooking para la tabla
   */
  private mapClientReservationToBooking(reservation: ClientReservation, index: number): ProviderTourBooking {
    return {
      sNo: index + 1,
      id: `RES-${reservation.reservationId}`,
      tourId: reservation.tourId, // Agregar tourId para reagendamiento
      tourName: this.i18nService.getValue(reservation.tourName),
      tourType: 'Tour', // El API no devuelve tipo de tour
      img: 'tours-21.jpg', // Imagen por defecto
      customerName: reservation.payerName,
      customerEmail: reservation.payerEmail,
      customerPhone: reservation.payerPhone,
      travellers: `${reservation.totalTourists} ${reservation.totalTourists === 1 ? 'Turista' : 'Turistas'}`,
      duration: `${reservation.slotTimeStart} - ${reservation.slotTimeEnd}`,
      price: `$${reservation.shoppingTotalPrice.toFixed(2)}`,
      bookingDate: new Date(reservation.reservationCreatedDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      checkInDate: `${new Date(reservation.scheduleDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}, ${reservation.slotTimeStart}`,
      returnDate: `${new Date(reservation.scheduleDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}, ${reservation.slotTimeEnd}`,
      status: this.mapReservationStatus(reservation.reservationDeliveryStatus),
      destination: 'N/A', // El API no devuelve destino
      extraServices: [],
      activities: [],
      isSelected: false,
      maxCancellationDate: reservation.maxCancellationDate,
      maxReschedulingDate: reservation.maxReschedulingDate
    };
  }

  /**
   * Mapea el estado de la reserva del API al formato de la tabla
   */
  private mapReservationStatus(apiStatus: 'PENDING' | 'DELIVERED' | 'CANCELLED' | 'CANCELED'): 'Upcoming' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' {
    const statusMap: Record<string, 'Upcoming' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'> = {
      'PENDING': 'Pending',
      'DELIVERED': 'Completed',
      'CANCELLED': 'Cancelled',
      'CANCELED': 'Cancelled'  // API usa ortografía americana
    };
    return statusMap[apiStatus] || 'Pending';
  }

  /**
   * Carga datos mock para simular las reservas de tours (usado para proveedores)
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
    
    // Abrir el modal programáticamente
    setTimeout(() => {
      const modalElement = document.getElementById('bookingDetailModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 0);
  }

  /**
   * Abre el modal con reintentos para asegurar que el DOM esté listo
   * Útil cuando se viene desde el QR scanner y el componente se está cargando
   */
  private openModalWithRetry(attempt: number = 0, maxAttempts: number = 20): void {
    const modalElement = document.getElementById('bookingDetailModal');
    
    if (modalElement) {
      // Modal encontrado, abrirlo
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
      console.log(`✅ Modal abierto exitosamente (intento ${attempt + 1})`);
    } else if (attempt < maxAttempts) {
      // Modal no encontrado, reintentar después de un delay
      console.log(`⏳ Modal no encontrado, reintentando... (intento ${attempt + 1}/${maxAttempts})`);
      setTimeout(() => {
        this.openModalWithRetry(attempt + 1, maxAttempts);
      }, 300); // Esperar 300ms entre intentos (total 6 segundos)
    } else {
      // Se agotaron los intentos
      console.error('❌ No se pudo abrir el modal después de múltiples intentos');
      console.error('El componente puede no haberse renderizado correctamente');
    }
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
   * Confirma/Consume una reserva desde el modal
   */
  public confirmBookingFromModal(bookingId: string): void {
    // Extraer el ID numérico del formato "RES-10" o "TB-1001"
    const numericId = bookingId.includes('-') ? bookingId.split('-')[1] : bookingId;
    
    console.log('🔄 Consumiendo reserva:', numericId);
    
    this.reservationService.confirmReservation(numericId).subscribe({
      next: (response) => {
        console.log('✅ Reserva consumida exitosamente:', response);
        
        // Actualizar el estado en la tabla local según la respuesta del API
        const booking = this.tableData.find(b => b.id === bookingId);
        if (booking) {
          // Mapear el deliveryStatus de la respuesta al status de la UI
          booking.status = response.deliveryStatus === 'DELIVERED' ? 'Completed' : 
                          response.deliveryStatus === 'PENDING' ? 'Pending' : 
                          'Cancelled';
        }
        
        // Actualizar también en tableDataCopy
        const bookingCopy = this.tableDataCopy.find(b => b.id === bookingId);
        if (bookingCopy) {
          bookingCopy.status = response.deliveryStatus === 'DELIVERED' ? 'Completed' : 
                              response.deliveryStatus === 'PENDING' ? 'Pending' : 
                              'Cancelled';
        }
        
        // Actualizar el selectedBooking si es el que está en el modal
        if (this.selectedBooking && this.selectedBooking.id === bookingId) {
          this.selectedBooking.status = response.deliveryStatus === 'DELIVERED' ? 'Completed' : 
                                       response.deliveryStatus === 'PENDING' ? 'Pending' : 
                                       'Cancelled';
        }
        
        // Cerrar el modal automáticamente
        const modalElement = document.getElementById('bookingDetailModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        
        alert(`✅ Reserva ${bookingId} confirmada y entregada exitosamente`);
      },
      error: (error) => {
        console.error('❌ Error al confirmar la reserva:', error);
        alert(`❌ Error al confirmar la reserva. Por favor intenta nuevamente.`);
      }
    });
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
   * Maneja las acciones según el rol y la acción específica
   */
  public onAction(actionId: string, row: any): void {
    switch (this.currentRole) {
      case 'CLIENT':
        this.handleClientAction(actionId, row);
        break;
      case 'PROVIDER':
        this.handleProviderAction(actionId, row);
        break;
      case 'ADMIN':
        this.handleAdminAction(actionId, row);
        break;
    }
  }

  /**
   * Maneja acciones del rol CLIENT
   */
  private handleClientAction(actionId: string, booking: any): void {
    switch (actionId) {
      case 'view':
        this.viewBookingDetails(booking);
        break;
      case 'reschedule':
        // Handle reschedule action directly
        this.handleReschedule(booking);
        break;
      case 'cancel':
        // Open cancellation modal instead of direct confirmation
        this.openCancelModal(booking);
        break;
      default:
        console.warn('Acción no reconocida:', actionId);
    }
  }

  /**
   * Maneja acciones del rol PROVIDER
   */
  private handleProviderAction(actionId: string, booking: any): void {
    switch (actionId) {
      case 'view':
        this.viewBookingDetails(booking);
        break;
      case 'confirm':
        if (confirm('¿Confirmar esta reserva?')) {
          this.confirmBooking(booking.id);
        }
        break;
      case 'complete':
        if (confirm('¿Marcar esta reserva como completada?')) {
          this.completeBooking(booking.id);
        }
        break;
      case 'cancel':
        if (confirm('¿Estás seguro de cancelar esta reserva?')) {
          this.cancelBooking(booking.id);
        }
        break;
      default:
        console.warn('Acción no reconocida:', actionId);
    }
  }

  /**
   * Maneja acciones del rol ADMIN
   */
  private handleAdminAction(actionId: string, booking: any): void {
    switch (actionId) {
      case 'view':
        this.viewBookingDetails(booking);
        break;
      case 'approve':
        if (confirm('¿Aprobar esta reserva?')) {
          this.confirmBooking(booking.id);
          alert('Reserva aprobada');
        }
        break;
      case 'suspend':
        if (confirm('¿Suspender esta reserva?')) {
          booking.status = 'Cancelled';
          alert('Reserva suspendida');
        }
        break;
      case 'cancel':
        if (confirm('¿Cancelar esta reserva?')) {
          this.cancelBooking(booking.id);
        }
        break;
      case 'delete':
        if (confirm('¿Eliminar permanentemente esta reserva?')) {
          const index = this.tableData.findIndex(b => b.id === booking.id);
          if (index > -1) {
            this.tableData.splice(index, 1);
            this.tableDataCopy = [...this.tableData];
            alert('Reserva eliminada');
          }
        }
        break;
      default:
        console.warn('Acción no reconocida:', actionId);
    }
  }

  /**
   * Verifica si una acción es visible para una fila específica
   */
  public isActionVisible(action: ActionConfig, row: any): boolean {
    if (!action.visible) {
      return true;
    }
    return action.visible(row);
  }

  /**
   * Obtiene el valor formateado de una celda según su tipo
   */
  public getCellValue(row: any, column: ColumnConfig): any {
    const value = row[column.field];
    
    switch (column.type) {
      case 'currency':
        // Si ya viene formateado con $, retornarlo tal cual
        if (typeof value === 'string' && value.includes('$')) {
          return value;
        }
        return value ? `$${value}` : '-';
      case 'date':
        return value || '-';
      case 'status':
        return value;
      case 'list':
        return Array.isArray(value) ? value.join(', ') : value || '-';
      default:
        return value || '-';
    }
  }

  /**
   * Obtiene la etiqueta traducida de un estado
   */
  public getStatusLabel(status: string): string {
    const statusKeys: Record<string, string> = {
      'Upcoming': 'provider-tour-management.status.upcoming',
      'Pending': 'provider-tour-management.status.pending',
      'Confirmed': 'provider-tour-management.status.confirmed',
      'Cancelled': 'provider-tour-management.status.cancelled',
      'Completed': 'provider-tour-management.status.completed',
      'PENDING': 'provider-tour-management.status.pending',
      'CONFIRMED': 'provider-tour-management.status.confirmed'
    };
    
    const translationKey = statusKeys[status];
    return translationKey ? this.translate.instant(translationKey) : status;
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

  /**
   * Métodos de paginación
   */
  
  /**
   * Navega a una página específica
   */
  public goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    // Recargar datos según el rol
    if (this.currentRole === 'CLIENT') {
      this.loadClientReservations();
    } else if (this.currentRole === 'PROVIDER') {
      this.loadProviderReservations();
    }
  }

  /**
   * Navega a la página anterior
   */
  public previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      // Recargar datos según el rol
      if (this.currentRole === 'CLIENT') {
        this.loadClientReservations();
      } else if (this.currentRole === 'PROVIDER') {
        this.loadProviderReservations();
      }
    }
  }

  /**
   * Navega a la página siguiente
   */
  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      // Recargar datos según el rol
      if (this.currentRole === 'CLIENT') {
        this.loadClientReservations();
      } else if (this.currentRole === 'PROVIDER') {
        this.loadProviderReservations();
      }
    }
  }

  /**
   * Obtiene el array de números de página para mostrar
   */
  public getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas alrededor de la actual
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, this.currentPage + 2);
      
      // Ajustar si estamos cerca del inicio o fin
      if (this.currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (this.currentPage >= this.totalPages - 2) {
        startPage = this.totalPages - maxPagesToShow + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  /**
   * Lifecycle hook para detectar cambios en los inputs
   */
  ngOnChanges(): void {
    // Si viene el flag shouldCreateReview y hay un reservationId, obtener la reserva del API
    if (this.shouldCreateReview && this.highlightedReservationId) {
      console.log('🔍 Detectado shouldCreateReview con reservationId:', this.highlightedReservationId);
      
      // Fetch the reservation directly from the API
      this.reservationService.getReservationById(this.highlightedReservationId.toString()).subscribe({
        next: (reservation) => {
          console.log('✅ Reserva obtenida para review:', reservation);
          
          // Map the reservation to booking format
          const booking = this.mapReservationToBooking(reservation);
          
          // Set as selected booking
          this.selectedBooking = booking;
          
          // Open booking detail modal first, then review modal
          setTimeout(() => {
            this.openBookingDetailModalThenReview(booking.id);
          }, 300);
          
          // Clear query params
          this.clearQueryParams();
        },
        error: (error) => {
          console.error('❌ Error al obtener reserva para review:', error);
          alert('Error al cargar los detalles de la reserva. Por favor intenta nuevamente.');
        }
      });
      
      // Reset flags to prevent multiple executions
      this.shouldCreateReview = false;
      this.highlightedReservationId = null;
    }
  }

  /**
   * Opens the booking detail modal, then opens the review modal on top
   */
  private openBookingDetailModalThenReview(bookingId: string): void {
    const modalElement = document.getElementById('bookingDetailModal');
    
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
      console.log('✅ Modal de detalles abierto');
      
      // After modal is shown, open review modal
      modalElement.addEventListener('shown.bs.modal', () => {
        setTimeout(() => {
          console.log('🎬 Abriendo modal de reseña...');
          this.openReviewModalForBooking(bookingId);
        }, 500);
      }, { once: true }); // Use 'once' to ensure listener is removed after first execution
    } else {
      console.error('❌ No se encontró el modal de detalles');
    }
  }

  /**
   * Abre el modal de reseña para una reserva específica
   */
  public openReviewModalForBooking(bookingId: string): void {
    // Try to find booking in tableData first, fallback to selectedBooking
    let booking = this.tableData.find(b => b.id === bookingId);
    
    // If not found in tableData, use selectedBooking (e.g., when coming from pending reviews)
    if (!booking && this.selectedBooking && this.selectedBooking.id === bookingId) {
      booking = this.selectedBooking;
      console.log('📌 Usando selectedBooking para abrir modal de reseña');
    }
    
    if (booking) {
      console.log('✅ Modal de reseña abierto para reserva:', bookingId);
      
      // Cerrar el modal de detalles de Bootstrap primero
      const modalElement = document.getElementById('bookingDetailModal');
      if (modalElement) {
        const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modalElement);
        if (bootstrapModal) {
          bootstrapModal.hide();
        }
      }
      
      // Esperar a que el modal se cierre antes de abrir el de reseña
      setTimeout(() => {
        this.reviewModalBooking = booking;
        this.showReviewModal = true;
        this.reviewRating = 0;
        this.reviewComment = '';
        this.reviewImages = [];
      }, 300);
    } else {
      console.error('❌ No se encontró la reserva con ID:', bookingId);
    }
  }

  /**
   * Cierra el modal de reseña
   */
  public closeReviewModal(): void {
    // Guardar referencia a la reserva antes de limpiar el estado
    const booking = this.reviewModalBooking;

    this.showReviewModal = false;
    this.reviewModalBooking = null;
    this.reviewRating = 0;
    this.reviewComment = '';
    this.reviewImages = [];
    
    // Limpiar los query params al cerrar el modal
    this.clearQueryParams();
    
    // Reabrir el modal de detalles automáticamente si había una reserva seleccionada
    if (booking) {
      setTimeout(() => {
        this.viewBookingDetails(booking);
      }, 300);
    }
  }

  /**
   * Establece el rating de la reseña
   */
  public setReviewRating(rating: number): void {
    this.reviewRating = rating;
  }

  /**
   * Maneja la selección de imágenes
   */
  public onReviewImagesSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      const fileList = Array.from(files) as File[];
      
      // 1. Validar cantidad máxima (5 archivos)
      if (fileList.length > 5) {
        alert('Solo puedes adjuntar un máximo de 5 imágenes.');
        // Limpiar el input
        event.target.value = '';
        this.reviewImages = [];
        return;
      }

      const validFiles: File[] = [];
      const invalidFiles: string[] = [];

      // 2. Validar tipo y tamaño por archivo
      fileList.forEach(file => {
        const isValidType = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg';
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

        if (!isValidType) {
          invalidFiles.push(`${file.name} (Tipo no permitido)`);
        } else if (!isValidSize) {
          invalidFiles.push(`${file.name} (Excede 5MB)`);
        } else {
          validFiles.push(file);
        }
      });

      if (invalidFiles.length > 0) {
        alert(`Algunos archivos no son válidos:\n${invalidFiles.join('\n')}\n\nSolo se permiten imágenes PNG/JPG de máximo 5MB.`);
        // Limpiar el input si hay error para obligar a seleccionar de nuevo correctamente
        // O podríamos dejar los válidos, pero el input file UI no se sincroniza bien
        event.target.value = '';
        this.reviewImages = [];
      } else {
        this.reviewImages = validFiles;
      }
    }
  }

  /**
   * Envía la reseña al backend
   */
  public submitReview(): void {
    if (!this.reviewRating || !this.reviewComment.trim()) {
      alert('Por favor completa todos los campos requeridos (rating y comentario)');
      return;
    }

    if (!this.reviewModalBooking) {
      alert('Error: No se encontró la reserva');
      return;
    }

    // Extraer el ID numérico de la reserva (formato "RES-29" -> 29)
    const reservationId = this.reviewModalBooking.id.includes('-') 
      ? parseInt(this.reviewModalBooking.id.split('-')[1]) 
      : parseInt(this.reviewModalBooking.id);

    // Preparar el payload - createReview maneja la internacionalización internamente
    const reviewPayload = {
      reservationId: reservationId,
      rating: this.reviewRating,
      comment: this.reviewComment
    };

    console.log('🔄 Enviando reseña:', reviewPayload);

    // Llamar al servicio de reviews
    this.reviewsService.createReview(reviewPayload, this.reviewImages).subscribe({
      next: (response: any) => {
        console.log('✅ Reseña guardada exitosamente:', response);
        alert(`¡Reseña enviada exitosamente para ${this.reviewModalBooking!.tourName}!`);
        this.closeReviewModal();
      },
      error: (error: any) => {
        console.error('❌ Error al guardar la reseña:', error);
        alert('❌ Error al enviar la reseña. Por favor intenta nuevamente.');
      }
    });
  }

  /**
   * Limpia los query parameters de la URL
   */
  private clearQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        reservationId: null,
        createReview: null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    console.log('🧹 Query params limpiados correctamente');
  }

  /**
   * Abre el modal de confirmación de cancelación
   */
  public openCancelModal(booking: any): void {
    this.cancelModalBooking = booking;
    this.cancellationReason = ''; // Reset reason
    this.showCancelModal = true;
  }

  /**
   * Cierra el modal de confirmación de cancelación
   */
  public closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelModalBooking = null;
    this.cancellationReason = '';
  }

  /**
   * Confirma la cancelación de la reserva con el motivo seleccionado
   */
  public confirmCancellation(): void {
    if (!this.cancellationReason) {
      alert('Por favor selecciona un motivo de cancelación');
      return;
    }

    if (!this.cancelModalBooking) {
      alert('Error: No se encontró la reserva');
      return;
    }

    // Mapear el motivo del usuario al valor esperado por el API
    const reasonMap: { [key: string]: string } = {
      'Lluvia': 'RAIN',
      'No puedo disfrutarlo': 'CANNOT_ATTEND'
    };

    const apiReason = reasonMap[this.cancellationReason];
    
    if (!apiReason) {
      alert('Error: Motivo de cancelación no válido');
      return;
    }

    // Extraer el ID numérico del formato "RES-10" o "TB-1001"
    const numericId = this.cancelModalBooking.id.includes('-') 
      ? this.cancelModalBooking.id.split('-')[1] 
      : this.cancelModalBooking.id;

    console.log('🔄 Cancelando reserva:', this.cancelModalBooking.id);
    console.log('📝 Motivo de cancelación (usuario):', this.cancellationReason);
    console.log('📝 Motivo de cancelación (API):', apiReason);

    // Llamar al servicio de cancelación con el motivo
    this.reservationService.cancelReservation(numericId, apiReason).subscribe({
      next: (response) => {
        console.log('✅ Reserva cancelada exitosamente:', response);
        
        // Actualizar el estado en la tabla local
        const booking = this.tableData.find(b => b.id === this.cancelModalBooking!.id);
        if (booking) {
          booking.status = 'Cancelled';
        }
        
        // Actualizar también en tableDataCopy
        const bookingCopy = this.tableDataCopy.find(b => b.id === this.cancelModalBooking!.id);
        if (bookingCopy) {
          bookingCopy.status = 'Cancelled';
        }
        
        alert(`✅ Reserva ${this.cancelModalBooking!.id} cancelada exitosamente`);
        
        // Cerrar el modal
        this.closeCancelModal();
      },
      error: (error) => {
        console.error('❌ Error al cancelar la reserva:', error);
        alert('❌ Error al cancelar la reserva. Por favor intenta nuevamente.');
      }
    });
  }

  /**
   * Maneja la acción de reagendar una reserva
   */
  public handleReschedule(booking: any): void {
    console.log('🔄 Abriendo modal de selección de fechas para:', booking.id);
    this.openRescheduleDateModal(booking);
  }

  /**
   * Abre el modal de selección de fechas para reagendar
   */
  public openRescheduleDateModal(booking: any): void {
    this.rescheduleDateModalBooking = booking;
    this.rescheduleCheckIn = new Date().toISOString().split('T')[0]; // Fecha de hoy
    this.rescheduleCheckOut = ''; // Vacío para que el usuario seleccione
    this.showRescheduleDateModal = true;
  }

  /**
   * Cierra el modal de selección de fechas
   */
  public closeRescheduleDateModal(): void {
    this.showRescheduleDateModal = false;
    this.rescheduleDateModalBooking = null;
  }

  /**
   * Confirma las fechas y abre el modal de selección de slots
   */
  public confirmRescheduleDates(): void {
    if (!this.rescheduleDateModalBooking) {
      alert('Error: No se encontró la reserva');
      return;
    }

    if (!this.rescheduleCheckIn || !this.rescheduleCheckOut) {
      alert('Por favor selecciona las fechas de Check In y Check Out');
      return;
    }

    // Comparar fechas como strings (formato YYYY-MM-DD)
    if (this.rescheduleCheckIn >= this.rescheduleCheckOut) {
      alert('La fecha de Check Out debe ser posterior a la fecha de Check In');
      return;
    }

    // Guardar los datos antes de cerrar el modal
    const bookingData = this.rescheduleDateModalBooking;
    const tourId = bookingData.tourId;
    const checkInStr = this.rescheduleCheckIn;
    const checkOutStr = this.rescheduleCheckOut;

    console.log('✅ Fechas seleccionadas:', {
      checkIn: checkInStr,
      checkOut: checkOutStr,
      tourId: tourId,
      bookingData: bookingData // Debug: ver todos los datos
    });

    // Validar que tengamos el tourId
    if (!tourId) {
      console.error('❌ tourId es undefined. Datos de la reserva:', bookingData);
      alert('Error: No se pudo obtener el ID del tour. Por favor, intenta nuevamente.');
      return;
    }

    // Cerrar el modal de fechas
    this.closeRescheduleDateModal();

    console.log('🔍 Cargando datos del tour desde API...', { tourId, checkInStr, checkOutStr });

    // Cargar el tour específico por ID
    this.searchToursService.detailTourPublic(tourId).subscribe({
      next: (tourDetail) => {
        console.log('✅ Datos del tour cargados:', tourDetail);
        
        if (tourDetail) {
          // Buscar schedules disponibles para las fechas seleccionadas
          this.searchToursService.searchTours({
            tourId: tourId,
            startDate: checkInStr,
            endDate: checkOutStr
          }, 1, 10).subscribe({
            next: (response) => {
              console.log('✅ Schedules cargados:', response);
              
              if (response && response.content && response.content.length > 0) {
                const tourData: TourScheduleResponseDto = response.content[0];
                
                console.log('🎯 Abriendo modal de slots con datos completos:', tourData);
                
                // Abrir el modal de selección de slots con los datos completos
                const dialogRef = this.dialog.open(TourSlotSelectionModalComponent, {
                  width: '600px',
                  data: {
                    tour: tourData,
                    checkIn: checkInStr,
                    checkOut: checkOutStr,
                    isRescheduling: true, // Indicar que es flujo de reagendamiento
                    reservationId: bookingData.id, // ID de la reserva para el API
                    originalPrice: parseFloat(bookingData.price.replace('$', '').replace(',', '')), // Precio original
                    tourAdded: (cartItem: CartItem) => {
                      console.log('✅ Nueva fecha/slot seleccionado:', cartItem);
                      // El callback ya no se usa aquí, la lógica está en el modal
                    }
                  }
                });
                
                dialogRef.afterClosed().subscribe(() => {
                  console.log('Modal de slots cerrado');
                });
              } else {
                console.error('❌ No se encontraron horarios disponibles para las fechas seleccionadas');
                alert('No hay horarios disponibles para las fechas seleccionadas. Por favor, intenta con otras fechas.');
              }
            },
            error: (error) => {
              console.error('❌ Error cargando schedules:', error);
              alert('Error al cargar los horarios disponibles. Por favor, intenta nuevamente.');
            }
          });
        } else {
          console.error('❌ No se encontraron datos del tour');
          alert('No se pudo cargar la información del tour. Por favor, intenta nuevamente.');
        }
      },
      error: (error) => {
        console.error('❌ Error cargando datos del tour:', error);
        alert('Error al cargar la información del tour. Por favor, intenta nuevamente.');
      }
    });
  }
}

