import { Component, OnDestroy, OnInit, Input, OnChanges, NgZone, ChangeDetectorRef } from '@angular/core';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { routes } from '../../../shared/routes/routes';
import Swal from 'sweetalert2';
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
import { ReviewReason, ReviewReasonsResponse } from '../../../shared/models/reviews.model';
import { MatDialog } from '@angular/material/dialog';
import { TourSlotSelectionModalComponent } from '../../../shared/common/tour-slot-selection-modal/tour-slot-selection-modal.component';
import { SearchToursService } from '../../clients/list-tours/search-tours.service';
import { TourScheduleResponseDto } from '../../../shared/dto/search-tour-response.dto';
import { CartItem } from '../../../shared/dto/cart.dto';
import { ProviderPanelStateService } from '../../../shared/services/provider-panel-state.service';

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
  rawCheckInDate?: string; // ISO date YYYY-MM-DD
  rawReturnDate?: string;  // ISO date YYYY-MM-DD
  status: 'Upcoming' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Temporal' | 'No_Show' | 'Rescheduled';
  destination: string;
  extraServices?: string[];
  activities?: string[];
  isSelected?: boolean;
  maxCancellationDate?: string; // ISO date string - maximum date for cancellation
  maxReschedulingDate?: string; // ISO date string - maximum date for rescheduling
  canReschedule?: boolean; // New field from API
  canCancel?: boolean; // New field from API
  canConfirmReservation?: boolean;
  canRainCancel?: boolean;
  qrUrl?: string;
  totalTourists?: number;
  serviceResponsible?: any; // New field for reservation contact
  tourDetails?: any; // New field for public tour details
  // Payer info (for PROVIDER/ADMIN view)
  payerName?: string;
  payerDocumentType?: string;
  payerDocumentNumber?: string;
  payerEmail?: string;
  payerPhone?: string;
  // Cancellation info
  cancellationDate?: string;
  cancellationReason?: string;
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
  // FE-15c: mostrar acceso a reportes DIMAR cuando el backoffice está viendo /admin/bookings-management.
  showMaritimeReportsLink = false;

  goToMaritimeReports(): void {
    this.router.navigate(['/admin/maritime-reports']);
  }
  
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

  // Suscripciones
  private subscriptions: Subscription = new Subscription();
  
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

  // Review reasons catalog
  public reviewReasonsPositive: ReviewReason[] = [];
  public reviewReasonsNegative: ReviewReason[] = [];
  public reviewReasonsLoading: boolean = false;
  public selectedReasonId: number | null = null;

  // Computed: which reasons to show based on current rating
  public get activeReviewReasons(): ReviewReason[] {
    if (this.reviewRating >= 4) return this.reviewReasonsPositive;
    if (this.reviewRating >= 1) return this.reviewReasonsNegative;
    return [];
  }

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

  // Set of pending review reservation IDs
  public pendingReviewReservationIds = new Set<number>();


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
    private searchToursService: SearchToursService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private panelStateService: ProviderPanelStateService
  ) {}

  ngOnInit(): void {
    console.log('ðŸš€ ProviderTourManagementComponent - ngOnInit iniciado');
    
    // Detectar rol y cargar configuración
    this.currentRole = this.getUserRole();
    this.config = this.configService.getConfigByRole(this.currentRole);
    this.showMaritimeReportsLink = this.authService.isTouryaBackoffice()
      && this.router.url.includes('bookings-management');
    
    // Cargar datos según el rol
    // TC-005 post-fix: ADMIN/BACKOFFICE_OPERATION también consume el endpoint provider
    // (el backend devuelve todas las reservas cross-provider cuando no hay providerId).
    if (this.currentRole === 'CLIENT') {
      this.loadClientReservations();
      this.loadPendingReviews();
    } else if (this.currentRole === 'PROVIDER' || this.currentRole === 'ADMIN') {
      this.loadProviderReservations();
    } else {
      this.loadMockData();
    }

    this.subscriptions.add(
      this.reservationService.reservationUpdated$.subscribe(() => {
        console.log('🔄 Notificación de actualización recibida - Refrescando lista');
        this.ngZone.run(() => {
          if (this.currentRole === 'CLIENT') {
            this.loadClientReservations();
            this.loadPendingReviews();
          } else if (this.currentRole === 'PROVIDER' || this.currentRole === 'ADMIN') {
            this.loadProviderReservations();
          }
          this.cdr.detectChanges();
        });
      })
    );
    
    // Verificar si hay que abrir un modal específico desde otro panel (ej. Pagos)
    const reservationToOpen = this.panelStateService.getReservationToOpen();
    if (reservationToOpen) {
      console.log('🔓 Abriendo reserva desde ProviderPanelStateService:', reservationToOpen);
      setTimeout(() => {
        this.viewBookingDetails({ id: reservationToOpen.toString() } as any);
      }, 300);
    }

    // Escuchar el cierre del modal para el flujo de retorno
    setTimeout(() => {
      const modalElement = document.getElementById('bookingDetailModal');
      if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', () => {
          const returnPaymentId = this.panelStateService.getReturnToPayment();
          const returnToReviews = this.panelStateService.getReturnToReviews();
          
          if (returnPaymentId) {
            this.panelStateService.setPaymentToOpen(returnPaymentId);
            if (this.authService.isAdmin()) {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.panelStateService.setView('pagos');
            }
          } else if (returnToReviews) {
            this.panelStateService.setView('reviews');
          }
        });
      }
    }, 1000);
    
    // Verificar si hay parámetros de query (desde el QR scan)
    this.route.queryParams.subscribe((params: any) => {
      console.log('ðŸ“‹ Query params recibidos en provider-tour-management:', params);
      
      // Solo procesar si openModal=true, hay reservationId y NO se ha abierto el modal antes
      if (params['openModal'] === 'true' && params['reservationId'] && !this.modalOpenedFromQR) {
        console.log('ðŸ”“ Cargando reserva desde API con reservationId:', params['reservationId']);
        
        // Marcar que el modal ya fue abierto desde QR
        this.modalOpenedFromQR = true;
        
        // NO limpiar los query params aquí, lo hace el componente padre (provider-panel)
        
        // Llamar al servicio para obtener los datos reales de la reserva
        this.reservationService.getReservationById(params['reservationId']).subscribe({
          next: (reservation) => {
            console.log('✅ Reserva obtenida del backend:', reservation);
            
            // Convertir la reserva del backend al formato ProviderTourBooking
            this.selectedBooking = this.mapReservationToBooking(reservation);
            
            if (reservation.tourId) {
              const startDate = reservation.checkInDate ? reservation.checkInDate.split('T')[0] : '';
              const endDate = reservation.returnDate ? reservation.returnDate.split('T')[0] : '';
              
              const searchBody = {
                tourId: reservation.tourId,
                language: this.translate.currentLang || 'es',
                startDate: startDate,
                endDate: endDate
              };

              this.searchToursService.searchTours(searchBody, 0, 10).subscribe({
                next: (scheduleDetails) => {
                  console.log('✅ Detalles de schedule obtenidos automáticamente:', scheduleDetails);
                  if (scheduleDetails?.content?.length > 0) {
                    const tourInfo = scheduleDetails.content[0].tour;
                    if (tourInfo) {
                      if (tourInfo.profilePicture?.imageUrl) {
                        this.selectedBooking.img = tourInfo.profilePicture.imageUrl;
                      }
                      if (tourInfo.subCategoryName) {
                        this.selectedBooking.tourType = tourInfo.subCategoryName;
                      }
                      if (tourInfo.address?.address) {
                        this.selectedBooking.destination = tourInfo.address.address;
                      }
                    }
                  }
                },
                error: (err) => {
                  console.error('❌ Error al obtener detalles de schedule:', err);
                }
              });

              this.searchToursService.detailTourPublic(reservation.tourId).subscribe({
                next: (tourDetails) => {
                  console.log('✅ Detalles adicionales del tour obtenidos:', tourDetails);
                  if (this.selectedBooking) {
                    this.selectedBooking.tourDetails = tourDetails;
                    this.cdr.detectChanges();
                  }
                },
                error: (err) => {
                  console.error('❌ Error al obtener detalles adicionales del tour:', err);
                }
              });
            }

            // Abrir el modal con retry para asegurar que el DOM esté listo
            this.openModalWithRetry();
          },
          error: (error) => {
            console.error('âŒ Error al obtener la reserva:', error);
            
            // Fallback: crear objeto con los datos del QR si falla la llamada al backend
            console.log('âš ï¸ Usando datos del QR como fallback');
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
          console.log('ðŸ”’ Modal de detalles cerrado - limpiando query params');
          this.clearQueryParams();
        });
      }
    }, 1000);
  }

  /**
   * Parsea una cadena de fecha tratando de evitar el desfase de zona horaria (UTC vs Local)
   */
  private parseLocalDate(dateString: string): Date {
    if (!dateString) return new Date();
    // Si es solo YYYY-MM-DD, añadir T00:00:00 para forzar el parseo como hora local
    if (dateString.length === 10 && dateString.includes('-') && !dateString.includes('T')) {
      return new Date(dateString + 'T00:00:00');
    }
    return new Date(dateString);
  }
  
  /**
   * Mapea una ReservationDetails del backend a ProviderTourBooking
   */
  /**
   * Formatea una fecha ISO a formato legible: "15 Oct 2025"
   */
  public formatDate(dateString: string | undefined): string {
    if (!dateString) return '—';
    try {
      const date = this.parseLocalDate(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString || '—';
    }
  }

  /**
   * Formatea una fecha y hora ISO a formato legible: "15 Oct 2025, 09:00 AM"
   */
  public formatDateTime(dateString: string | undefined): string {
    if (!dateString) return '—';
    try {
      const date = this.parseLocalDate(dateString);
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
      return dateString || '—';
    }
  }

  private mapReservationToBooking(reservation: any): ProviderTourBooking {
    // TC-003 fix: el modal se alimenta de GET /reservations?reservationId=X
    // que devuelve el DTO `ReservationDetailsResponse` (SP `sp_get_provider_reservations`),
    // no `ReservationResponse`. Los nombres de campos son distintos — hay que leer
    // los del SP y componer los derivados (checkIn desde scheduleDate+slotTimeStart,
    // localizar tourName por ser TranslatedField, construir serviceResponsible plano→sub-objeto).

    const tourNameText = this.i18nService.getValue(reservation.tourName) || 'N/A';

    const checkInIso =
      reservation.scheduleDate && reservation.slotTimeStart
        ? `${reservation.scheduleDate}T${reservation.slotTimeStart}`
        : undefined;

    const rawCheckInDate = reservation.scheduleDate || '';

    const serviceResponsible = reservation.serviceResponsibleName
      ? {
          name: reservation.serviceResponsibleName,
          email: reservation.serviceResponsibleEmail,
          phone: reservation.serviceResponsiblePhone,
        }
      : undefined;

    return {
      id: `RES-${reservation.reservationId}`,
      tourId: reservation.tourId,
      tourName: tourNameText,
      tourType: reservation.tourSubCategory || reservation.tourType || 'N/A',
      img: 'tours-21.jpg',
      customerName: reservation.serviceResponsibleName || 'N/A',
      customerEmail: reservation.serviceResponsibleEmail || 'N/A',
      customerPhone: reservation.serviceResponsiblePhone || 'N/A',
      travellers: reservation.totalTourists != null ? `${reservation.totalTourists}` : 'N/A',
      duration: reservation.duration ? `${reservation.duration} días` : 'N/A',
      // TC-005: PROVIDER puro ve el neto que recibe (providerPrice del SP); ADMIN/BACKOFFICE/CLIENT ven el precio que paga el cliente.
      price: this.pickBookingPriceForRole(reservation),
      bookingDate: this.formatDate(reservation.reservationCreatedDate || reservation.createdDate),
      checkInDate: this.formatDateTime(checkInIso),
      returnDate: '—',
      rawCheckInDate,
      rawReturnDate: rawCheckInDate,
      status: this.mapReservationStatus(reservation.reservationDeliveryStatus || reservation.deliveryStatus),
      destination: reservation.destination || 'N/A',
      extraServices: reservation.extraServices || [],
      activities: reservation.activities || [],
      isSelected: false,
      qrUrl: reservation.qrUrl,
      // Payer info
      payerName: reservation.payerName || undefined,
      payerDocumentType: reservation.payerDocumentType || undefined,
      payerDocumentNumber: reservation.payerDocumentNumber || undefined,
      payerEmail: reservation.payerEmail || undefined,
      payerPhone: reservation.payerPhone || undefined,
      // Cancellation and Rescheduling info
      maxCancellationDate: reservation.maxCancellationDate,
      maxReschedulingDate: reservation.maxReschedulingDate,
      canReschedule: reservation.canReschedule,
      canCancel: reservation.canCancel,
      canConfirmReservation: reservation.canConfirmReservation,
      cancellationDate: this.formatDate(reservation.cancellationDate),
      cancellationReason: reservation.cancellationReason || undefined,
      canRainCancel: reservation.canRainCancel,
      // Service Responsible (backend planos → sub-objeto que espera el template)
      serviceResponsible,
    };
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
    this.subscriptions.unsubscribe();
  }

  /**
   * Obtiene el rol del usuario actual
   */
  private getUserRole(): UserRole {
    // TC-005 post-fix: BACKOFFICE_OPERATION comparte la vista con ADMIN (cross-provider).
    if (this.authService.isAdmin() || this.authService.isBackofficeOperation()) {
      return 'ADMIN';
    } else if (this.authService.isProvider() || this.authService.isProviderOperator()) {
      return 'PROVIDER';
    } else if (this.authService.isUser()) {
      return 'CLIENT';
    }
    throw new Error('Usuario sin rol válido asignado');
  }

  /**
   * Carga los IDs de las reservas que tienen reseñas pendientes
   */
  private loadPendingReviews(): void {
    this.reviewsService.getPendingReviews().subscribe({
      next: (response) => {
        if (response && response.content) {
          const ids = response.content.map(review => review.reservationId);
          this.pendingReviewReservationIds = new Set<number>(ids);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al cargar pending reviews', err);
      }
    });
  }

  /**
   * Verifica si la reserva actualmente seleccionada tiene una reseña pendiente
   */
  public hasPendingReview(booking: ProviderTourBooking): boolean {
    if (!booking || !booking.id) return false;
    const resId = parseInt(booking.id.replace('RES-', ''), 10);
    return this.pendingReviewReservationIds.has(resId);
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
        console.error('âŒ Error al cargar reservas del proveedor:', error);
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
        console.error('âŒ Error al cargar reservas del cliente:', error);
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
      tourName: reservation.tourName || '',
      tourType: 'Tour',
      img: 'tours-21.jpg',
      customerName: reservation.serviceResponsibleName || reservation.payerName,
      customerEmail: reservation.payerEmail,
      customerPhone: reservation.payerPhone,
      travellers: `${reservation.totalTourists} ${reservation.totalTourists === 1 ? 'Turista' : 'Turistas'}`,
      totalTourists: reservation.totalTourists,
      duration: `${reservation.slotTimeStart} - ${reservation.slotTimeEnd}`,
      price: reservation.providerPrice != null ? `$${reservation.providerPrice.toFixed(2)}` : '',
      bookingDate: this.parseLocalDate(reservation.reservationCreatedDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      checkInDate: `${this.parseLocalDate(reservation.scheduleDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}, ${reservation.slotTimeStart}`,
      returnDate: `${this.parseLocalDate(reservation.scheduleDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}, ${reservation.slotTimeEnd}`,
      rawCheckInDate: reservation.scheduleDate,
      rawReturnDate: reservation.scheduleDate,
      status: this.mapReservationStatus(reservation.reservationDeliveryStatus),
      destination: 'N/A',
      extraServices: [],
      activities: [],
      isSelected: false,
      maxCancellationDate: reservation.maxCancellationDate,
      maxReschedulingDate: reservation.maxReschedulingDate,
      canReschedule: reservation.canReschedule,
      canCancel: reservation.canCancel,
      canRainCancel: reservation.canRainCancel,
      // Payer info from list API
      payerName: reservation.payerName,
      payerEmail: reservation.payerEmail,
      payerPhone: reservation.payerPhone,
      payerDocumentType: reservation.payerDocumentType,
      payerDocumentNumber: reservation.payerDocumentNumber
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
      tourName: reservation.tourName,
      tourType: 'Tour', // El API no devuelve tipo de tour
      img: 'tours-21.jpg', // Imagen por defecto
      customerName: reservation.serviceResponsibleName || reservation.payerName,
      customerEmail: reservation.payerEmail,
      customerPhone: reservation.payerPhone,
      travellers: `${reservation.totalTourists} ${reservation.totalTourists === 1 ? 'Turista' : 'Turistas'}`,
      totalTourists: reservation.totalTourists,
      duration: `${reservation.slotTimeStart} - ${reservation.slotTimeEnd}`,
      price: `$${(reservation.shoppingTotalPrice || 0).toFixed(2)}`,
      bookingDate: this.parseLocalDate(reservation.reservationCreatedDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      checkInDate: `${this.parseLocalDate(reservation.scheduleDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}, ${reservation.slotTimeStart}`,
      returnDate: `${this.parseLocalDate(reservation.scheduleDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}, ${reservation.slotTimeEnd}`,
      rawCheckInDate: reservation.scheduleDate,
      rawReturnDate: reservation.scheduleDate,
      status: this.mapReservationStatus(reservation.reservationDeliveryStatus),
      destination: 'N/A', // El API no devuelve destino
      extraServices: [],
      activities: [],
      isSelected: false,
      maxCancellationDate: reservation.maxCancellationDate,
      maxReschedulingDate: reservation.maxReschedulingDate,
      canReschedule: reservation.canReschedule,
      canCancel: reservation.canCancel,
      canRainCancel: reservation.canRainCancel,
      // Payer info from list API
      payerName: reservation.payerName,
      payerEmail: reservation.payerEmail,
      payerPhone: reservation.payerPhone,
      payerDocumentType: reservation.payerDocumentType,
      payerDocumentNumber: reservation.payerDocumentNumber
    };
  }

  /**
   * Mapea el estado de la reserva del API al formato de la tabla
   */
  /**
   * TC-005: selecciona qué precio mostrar en la vista de reserva según el rol del usuario.
   *
   * PROVIDER puro (no ADMIN ni BACKOFFICE) ve el neto que recibe (`providerPrice` del SP,
   * ya corregido por el fix TC-005 backend para tours grupo). ADMIN, BACKOFFICE_OPERATION,
   * TURISTA y cualquier otro rol ven el monto que paga el cliente (`shoppingTotalPrice`).
   */
  private pickBookingPriceForRole(reservation: any): string {
    const isProviderOnly = this.authService.isProvider() && !this.authService.isTouryaBackoffice();
    const preferred = isProviderOnly ? reservation.providerPrice : reservation.shoppingTotalPrice;
    if (preferred != null) {
      return `$${Number(preferred).toFixed(2)}`;
    }
    // Fallbacks conservan el comportamiento previo cuando el campo preferido no llegó.
    if (reservation.shoppingTotalPrice != null) {
      return `$${Number(reservation.shoppingTotalPrice).toFixed(2)}`;
    }
    if (reservation.price != null) {
      return `$${Number(reservation.price).toFixed(2)}`;
    }
    return '$0.00';
  }

  private mapReservationStatus(apiStatus: 'PENDING' | 'DELIVERED' | 'CANCELLED' | 'CANCELED' | 'RESCHEDULED' | 'TEMPORAL' | 'NO_SHOW' | string): 'Upcoming' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Temporal' | 'No_Show' | 'Rescheduled' {
    const statusMap: Record<string, 'Upcoming' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Temporal' | 'No_Show' | 'Rescheduled'> = {
      'PENDING': 'Pending',
      'RESCHEDULED': 'Rescheduled',
      'DELIVERED': 'Completed',
      'CANCELLED': 'Cancelled',
      'CANCELED': 'Cancelled',  // API usa ortografía americana
      'TEMPORAL': 'Temporal',
      'NO_SHOW': 'No_Show'
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
   * Carga el catálogo de motivos de reseña desde el API
   */
  private loadReviewReasons(): void {
    console.log('🔄 Iniciando carga de motivos de reseña...');
    this.reviewReasonsLoading = true;
    this.reviewsService.getReviewReasons().subscribe({
      next: (response) => {
        console.log('✅ Motivos de reseña cargados exitosamente:', response);
        this.reviewReasonsPositive = response.positive || [];
        this.reviewReasonsNegative = response.negative || [];
        this.reviewReasonsLoading = false;
      },
      error: (error) => {
        console.error('âŒ Error al cargar motivos de reseña:', error);
        this.reviewReasonsLoading = false;
      }
    });
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
   * Returns the i18n label key of the selected option in a filter
   */
  public getSelectedOptionLabel(filter: any, selectedValue: string): string {
    if (!filter.options || !selectedValue) return filter.label;
    const option = filter.options.find((o: any) => o.value === selectedValue);
    return option ? option.label : filter.label;
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
    const numericId = booking.id.includes('-') ? booking.id.split('-')[1] : booking.id;
    
    console.log('🔄 Iniciando carga completa de reserva:', numericId);

    // Mostrar loading
    Swal.fire({
      title: this.translate.instant('provider-tour-management.swal.loadingDetails'),
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    this.reservationService.getReservationById(numericId).subscribe({
      next: (reservation) => {
        console.log('✅ 1/3 Reserva obtenida:', reservation);
        
        const mapped = this.mapReservationToBooking(reservation);
        // Preservar info del pagador de la fila (lista)
        this.selectedBooking = {
          ...mapped,
          payerName: mapped.payerName || booking.payerName,
          payerEmail: mapped.payerEmail || booking.payerEmail,
          payerPhone: mapped.payerPhone || booking.payerPhone,
          payerDocumentType: mapped.payerDocumentType || booking.payerDocumentType,
          payerDocumentNumber: mapped.payerDocumentNumber || booking.payerDocumentNumber,
        };
        
        if (reservation.tourId) {
          const startDate = reservation.checkInDate ? reservation.checkInDate.split('T')[0] : '';
          const endDate = reservation.returnDate ? reservation.returnDate.split('T')[0] : '';
          
          const searchBody = {
            tourId: reservation.tourId,
            language: this.translate.currentLang || 'es',
            startDate: startDate,
            endDate: endDate
          };

          // Ejecutar peticiones secundarias en paralelo y esperar ambas
          forkJoin({
            schedule: this.searchToursService.searchTours(searchBody, 0, 10).pipe(catchError(err => {
              console.error('❌ Error en searchTours:', err);
              return of(null);
            })),
            details: this.searchToursService.detailTourPublic(reservation.tourId).pipe(catchError(err => {
              console.error('❌ Error en detailTourPublic:', err);
              return of(null);
            }))
          }).subscribe({
            next: (results) => {
              console.log('✅ 2/3 y 3/3 Servicios secundarios completados');
              
              // Procesar Schedule (Imagen, Tipo, Destino)
              const scheduleContent = results.schedule?.content;
              if (scheduleContent && scheduleContent.length > 0) {
                const tourInfo = scheduleContent[0].tour;
                if (tourInfo) {
                  if (tourInfo.profilePicture?.imageUrl) this.selectedBooking.img = tourInfo.profilePicture.imageUrl;
                  if (tourInfo.subCategoryName) this.selectedBooking.tourType = tourInfo.subCategoryName;
                  if (tourInfo.address?.address) this.selectedBooking.destination = tourInfo.address.address;
                }
              }
              
              // Procesar Detalles (Políticas)
              if (results.details) {
                this.selectedBooking.tourDetails = results.details;
              }
              
              this.cdr.detectChanges();
              Swal.close();
              this.openDetailModal();
            },
            error: () => {
              // En caso de error crítico en forkJoin (que no debería por el catchError)
              Swal.close();
              this.openDetailModal();
            }
          });
        } else {
          // Si no hay tourId, terminar carga
          Swal.close();
          this.openDetailModal();
        }
      },
      error: (error) => {
        console.error('❌ Error al obtener los detalles de la reserva:', error);
        Swal.close();
        this.selectedBooking = booking; // Fallback a datos de lista
        this.openDetailModal();
      }
    });
  }

  /**
   * Helper para abrir el modal de detalles programáticamente
   */
  private openDetailModal(): void {
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
      console.log(`â³ Modal no encontrado, reintentando... (intento ${attempt + 1}/${maxAttempts})`);
      setTimeout(() => {
        this.openModalWithRetry(attempt + 1, maxAttempts);
      }, 300); // Esperar 300ms entre intentos (total 6 segundos)
    } else {
      // Se agotaron los intentos
      console.error('âŒ No se pudo abrir el modal después de múltiples intentos');
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
   * Actualiza el estado de una reserva en las listas locales
   */
  private updateLocalBookingStatus(bookingId: string, apiStatus: string): void {
    const uiStatus = this.mapReservationStatus(apiStatus);
    
    // Actualizar en tableData
    const booking = this.tableData.find(b => b.id === bookingId);
    if (booking) booking.status = uiStatus;
    
    // Actualizar en tableDataCopy (para filtros)
    const bookingCopy = this.tableDataCopy.find(b => b.id === bookingId);
    if (bookingCopy) bookingCopy.status = uiStatus;
    
    // Actualizar en selectedBooking (modal)
    if (this.selectedBooking && this.selectedBooking.id === bookingId) {
      this.selectedBooking.status = uiStatus;
    }
  }

  /**
   * Confirma/Consume una reserva (Servicio Real)
   */
  public confirmBooking(bookingId: string): void {
    const numericId = bookingId.includes('-') ? bookingId.split('-')[1] : bookingId;
    
    Swal.fire({
      title: this.translate.instant('provider-tour-management.swal.confirmDeliveryTitle'),
      text: this.translate.instant('provider-tour-management.swal.confirmDeliveryText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.translate.instant('provider-tour-management.swal.yesConfirm'),
      cancelButtonText: this.translate.instant('provider-tour-management.swal.cancel')
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: this.translate.instant('provider-tour-management.swal.processing'),
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.reservationService.confirmReservation(numericId).subscribe({
          next: (response) => {
            Swal.fire(
              this.translate.instant('provider-tour-management.swal.confirmedTitle'),
              this.translate.instant('provider-tour-management.swal.confirmedText'),
              'success'
            );
            this.updateLocalBookingStatus(bookingId, response.deliveryStatus);
            
            // Si el modal está abierto, cerrarlo
            const modalElement = document.getElementById('bookingDetailModal');
            if (modalElement) {
              const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
              if (modal) modal.hide();
            }
          },
          error: (error) => {
            console.error('❌ Error confirmando reserva:', error);
            Swal.fire(
              this.translate.instant('provider-tour-management.swal.error'),
              this.translate.instant('provider-tour-management.swal.confirmErrorText'),
              'error'
            );
          }
        });
      }
    });
  }

  /**
   * Alias para confirmBooking usado desde el modal
   */
  public confirmBookingFromModal(bookingId: string): void {
    this.confirmBooking(bookingId);
  }

  /**
   * Cancela una reserva (solo UI - mock)
   */
  public cancelBooking(bookingId: string): void {
    Swal.fire({
      title: this.translate.instant('provider-tour-management.swal.bookingCanceledTitle'),
      text: this.translate.instant('provider-tour-management.swal.bookingCanceledText', { bookingId }),
      icon: 'info'
    });
    const booking = this.tableData.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'Cancelled';
    }
  }

  /**
   * Marca una reserva como completada (solo UI - mock)
   */
  public completeBooking(bookingId: string): void {
    Swal.fire({
      title: this.translate.instant('provider-tour-management.swal.markAsCompletedTitle'),
      text: this.translate.instant('provider-tour-management.swal.markAsCompletedText'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('provider-tour-management.swal.yesComplete'),
      cancelButtonText: this.translate.instant('provider-tour-management.swal.back')
    }).then((result) => {
      if (result.isConfirmed) {
        // En un escenario real, aquí se llamaría a un servicio
        this.updateLocalBookingStatus(bookingId, 'DELIVERED');
        Swal.fire(this.translate.instant('provider-tour-management.swal.completedTitle'), this.translate.instant('provider-tour-management.swal.completedText'), 'success');
      }
    });
  }

  /**
   * Exporta los datos (mock)
   */
  public exportData(format: 'pdf' | 'excel'): void {
    Swal.fire({
      title: this.translate.instant('provider-tour-management.swal.exportingTitle', { format: format.toUpperCase() }),
      text: this.translate.instant('provider-tour-management.swal.exportingText'),
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false
    });
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
        this.confirmBooking(booking.id);
        break;
      case 'complete':
        this.completeBooking(booking.id);
        break;
      case 'reschedule':
        this.handleReschedule(booking);
        break;
      case 'cancel':
        this.openCancelModal(booking);
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
        Swal.fire({
          title: this.translate.instant('provider-tour-management.swal.approveBookingTitle'),
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: this.translate.instant('provider-tour-management.swal.yesApprove')
        }).then((result) => {
          if (result.isConfirmed) {
            this.confirmBooking(booking.id);
          }
        });
        break;
      case 'suspend':
        Swal.fire({
          title: this.translate.instant('provider-tour-management.swal.suspendBookingTitle'),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: this.translate.instant('provider-tour-management.swal.yesSuspend'),
          confirmButtonColor: '#d33'
        }).then((result) => {
          if (result.isConfirmed) {
            booking.status = 'Cancelled';
            Swal.fire(this.translate.instant('provider-tour-management.swal.suspendedTitle'), this.translate.instant('provider-tour-management.swal.suspendedText'), 'success');
          }
        });
        break;
      case 'delete':
        Swal.fire({
          title: this.translate.instant('provider-tour-management.swal.deletePermanentlyTitle'),
          text: this.translate.instant('provider-tour-management.swal.cannotBeUndone'),
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: this.translate.instant('provider-tour-management.swal.yesDelete'),
          confirmButtonColor: '#d33'
        }).then((result) => {
          if (result.isConfirmed) {
            const index = this.tableData.findIndex(b => b.id === booking.id);
            if (index > -1) {
              this.tableData.splice(index, 1);
              this.tableDataCopy = [...this.tableData];
              Swal.fire(this.translate.instant('provider-tour-management.swal.deletedTitle'), this.translate.instant('provider-tour-management.swal.deletedText'), 'success');
            }
          }
        });
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
   * Verifica si una acción específica debe mostrarse en el modal de detalles
   */
  public shouldShowModalAction(actionId: string): boolean {
    if (!this.selectedBooking || !this.config || !this.config.actions) return false;
    const action = this.config.actions.find(a => a.id === actionId);
    if (!action) return false;
    
    // Para el modal, usamos el objeto selectedBooking
    return this.isActionVisible(action, this.selectedBooking);
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
    if (status === 'TEMPORAL' || status === 'Temporal') {
      return 'Temporal';
    }
    if (status === 'NO_SHOW' || status === 'No_Show') {
      return 'No show';
    }

    const statusKeys: Record<string, string> = {
      'Upcoming': 'provider-tour-management.status.upcoming',
      'Pending': 'provider-tour-management.status.pending',
      'Confirmed': 'provider-tour-management.status.confirmed',
      'Cancelled': 'provider-tour-management.status.cancelled',
      'Completed': 'provider-tour-management.status.completed',
      'PENDING': 'provider-tour-management.status.pending',
      'CONFIRMED': 'provider-tour-management.status.confirmed',
      'Rescheduled': 'provider-tour-management.status.rescheduled'
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
      'Completed': 'badge-success',
      'Temporal': 'badge-warning',
      'TEMPORAL': 'badge-warning',
      'No_Show': 'badge-dark',
      'NO_SHOW': 'badge-dark',
      'Rescheduled': 'badge-warning'
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
   * Traduce el código de motivo de cancelación al español
   */
  public formatCancellationReason(reason: string | undefined): string {
    if (!reason) return '—';
    const mapping: { [key: string]: string } = {
      'CANNOT_ATTEND': 'No puede asistir',
      'ILLNESS': 'Enfermedad',
      'INABILITY_TO_TRAVEL': 'Incapacidad para viajar',
      'LEGAL_OBLIGATIONS': 'Obligaciones legales',
      'CHANGE_OF_PLANS': 'Cambio de planes',
      'WEATHER': 'Condiciones climáticas',
      'EMERGENCY': 'Emergencia',
      'DISSATISFIED': 'Insatisfacción con el servicio',
      'DUPLICATE': 'Reserva duplicada',
      'OTHER': 'Otro motivo',
      'PROVIDER_CANCELLED': 'Cancelado por el proveedor',
      'FORCE_MAJEURE': 'Fuerza mayor',
    };
    return mapping[reason] ?? reason.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  }

  /**
   * Convierte el durationEnum del tour a una etiqueta legible
   */
  public getDurationLabelFromEnum(durationEnum: string | string[] | undefined): string {
    if (!durationEnum) return '—';
    const value = Array.isArray(durationEnum) ? durationEnum[0] : durationEnum;
    const mapping: { [key: string]: string } = {
      '1_a_2_horas': '1 a 2 horas',
      '2_a_4_horas': '2 a 4 horas',
      '4_a_6_horas': '4 a 6 horas',
      'hasta_1_dia': 'Hasta 1 día',
      'hasta_3_dias': 'Hasta 3 días',
      'hasta_5_dias': 'Hasta 5 días'
    };
    return mapping[value] || value;
  }

  /**
   * Formatea el string de viajeros del API (ej: "2 ADULTs, 1 CHILD") al español
   */
  public formatTravellers(travellers: string | undefined): string {
    if (!travellers) return '—';
    const replacements: [RegExp, string][] = [
      [/\bADULTs\b/gi, 'Adultos'],
      [/\bADULT\b/gi, 'Adulto'],
      [/\bCHILDREN\b/gi, 'Niños'],
      [/\bCHILDs\b/gi, 'Niños'],
      [/\bCHILD\b/gi, 'Niño'],
      [/\bINFANTs\b/gi, 'Bebés'],
      [/\bINFANT\b/gi, 'Bebé'],
    ];
    let result = travellers;
    for (const [pattern, replacement] of replacements) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  /**
   * Lifecycle hook para detectar cambios en los inputs
   */
  ngOnChanges(): void {
    // Si viene el flag shouldCreateReview y hay un reservationId, obtener la reserva del API
    if (this.shouldCreateReview && this.highlightedReservationId) {
      console.log('ðŸ” Detectado shouldCreateReview con reservationId:', this.highlightedReservationId);
      
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
          console.error('âŒ Error al obtener reserva para review:', error);
          Swal.fire(this.translate.instant('provider-tour-management.swal.error'), this.translate.instant('provider-tour-management.swal.errorLoadingDetails'), 'error');
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
      console.error('âŒ No se encontró el modal de detalles');
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
        this.selectedReasonId = null;

        // Cargar los motivos solo si no se han cargado previamente
        if (this.reviewReasonsPositive.length === 0 && this.reviewReasonsNegative.length === 0) {
          this.loadReviewReasons();
        }
      }, 300);
    } else {
      console.error('âŒ No se encontró la reserva con ID:', bookingId);
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
    this.selectedReasonId = null;
    
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
   * Establece el rating de la reseña y reinicia los motivos seleccionados
   */
  public setReviewRating(rating: number): void {
    this.reviewRating = rating;
    // Al cambiar la calificación se limpian los motivos seleccionados
    // ya que cambia entre positivos y negativos
    this.selectedReasonId = null;
  }

  /**
   * Alterna la selección de un motivo de reseña
   */
  public toggleReviewReason(reasonId: number): void {
    this.selectedReasonId = this.selectedReasonId === reasonId ? null : reasonId;
  }

  /**
   * Verifica si un motivo está seleccionado
   */
  public isReasonSelected(reasonId: number): boolean {
    return this.selectedReasonId === reasonId;
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
        Swal.fire({
          icon: 'warning',
          title: this.translate.instant('provider-tour-management.swal.limitExceeded'),
          text: this.translate.instant('provider-tour-management.swal.limitExceededText'),
          confirmButtonColor: '#3085d6'
        });
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
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('provider-tour-management.swal.invalidFiles'),
          html: `${this.translate.instant('provider-tour-management.swal.invalidFilesText1')}${invalidFiles.join('<br>')}${this.translate.instant('provider-tour-management.swal.invalidFilesText2')}`,
          confirmButtonColor: '#3085d6'
        });
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
      Swal.fire({
        icon: 'warning',
        title: this.translate.instant('provider-tour-management.swal.requiredFieldsTitle'),
        text: this.translate.instant('provider-tour-management.swal.reviewValidationText'),
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (!this.reviewModalBooking) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('provider-tour-management.swal.error'),
        text: this.translate.instant('provider-tour-management.swal.noReservationFound'),
        confirmButtonColor: '#3085d6'
      });
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
      comment: this.reviewComment,
      ...(this.selectedReasonId !== null ? { reasonId: this.selectedReasonId } : {})
    };

    console.log('🔄 Enviando reseña:', reviewPayload);

    // Llamar al servicio de reviews
    this.reviewsService.createReview(reviewPayload, this.reviewImages).subscribe({
      next: (response: any) => {
        console.log('✅ Reseña guardada exitosamente:', response);

        // Remove from pending reviews so "Ya hice la reseña" shows immediately
        if (this.reviewModalBooking && this.reviewModalBooking.id) {
          const resId = parseInt(this.reviewModalBooking.id.replace('RES-', ''), 10);
          this.pendingReviewReservationIds.delete(resId);
          this.cdr.detectChanges();
        }

        // Translate parameterized text manually
        const successMsg = this.translate.instant('provider-tour-management.swal.reviewSentText', { tourName: this.reviewModalBooking!.tourName });
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('provider-tour-management.swal.reviewSent'),
          text: successMsg,
          confirmButtonColor: '#28a745'
        }).then(() => {
          this.closeReviewModal();
        });
      },
      error: (error: any) => {
        console.error('Error al guardar la reseña:', error);
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('provider-tour-management.swal.error'),
          text: this.translate.instant('provider-tour-management.swal.reviewSendError'),
          confirmButtonColor: '#d33'
        });
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
    console.log('ðŸ§¹ Query params limpiados correctamente');
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
      Swal.fire(this.translate.instant('provider-tour-management.swal.attention'), this.translate.instant('provider-tour-management.swal.selectCancellationReason'), 'warning');
      return;
    }

    if (!this.cancelModalBooking) {
      Swal.fire(this.translate.instant('provider-tour-management.swal.error'), this.translate.instant('provider-tour-management.swal.reservationNotFound'), 'error');
      return;
    }

    // Mapear el motivo del usuario al valor esperado por el API
    const reasonMap: { [key: string]: string } = {
      'CANNOT_ATTEND': 'CANNOT_ATTEND',
      'ILLNESS': 'ILLNESS',
      'INABILITY_TO_TRAVEL': 'INABILITY_TO_TRAVEL',
      'LEGAL_OBLIGATIONS': 'LEGAL_OBLIGATIONS',
      'CHANGE_OF_PLANS': 'CHANGE_OF_PLANS'
    };

    const apiReason = reasonMap[this.cancellationReason];
    
    if (!apiReason) {
      Swal.fire(this.translate.instant('provider-tour-management.swal.error'), this.translate.instant('provider-tour-management.swal.invalidCancellationReason'), 'error');
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
        const bookingId = this.cancelModalBooking?.id || '';
        
        // Cerrar el modal primero
        this.closeCancelModal();

        Swal.fire({
          icon: 'success',
          title: this.translate.instant('provider-tour-management.swal.bookingCanceledTitle'),
          text: this.translate.instant('provider-tour-management.swal.bookingCanceledText2', { bookingId }),
          confirmButtonColor: '#3085d6'
        }).then(() => {
          // Refrescar el listado de reservaciones
          if (this.currentRole === 'CLIENT') {
            this.loadClientReservations();
          } else if (this.currentRole === 'PROVIDER') {
            this.loadProviderReservations();
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al cancelar la reserva:', error);
        
        // Cerrar el modal también en caso de error
        this.closeCancelModal();
        
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('provider-tour-management.swal.error'),
          text: this.translate.instant('provider-tour-management.swal.cancelErrorText'),
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  /**
   * Abre un modal de confirmación simplificado para cancelar por lluvia
   */
  public onCancelByRain(booking: any): void {
    Swal.fire({
      title: this.translate.instant('provider-tour-management.swal.cancelByRainTitle'),
      text: this.translate.instant('provider-tour-management.swal.cancelByRainConfirmText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('provider-tour-management.swal.yesCancel'),
      cancelButtonText: this.translate.instant('provider-tour-management.swal.back'),
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        // Extraer ID numérico
        const numericId = booking.id.includes('-') 
          ? booking.id.split('-')[1] 
          : booking.id;

        // Llamar a la API de cancelación por lluvia
        this.reservationService.cancelReservationByRain(numericId).subscribe({
          next: (response) => {
            console.log('✅ Reserva cancelada por lluvia exitosamente:', response);
            Swal.fire({
              icon: 'success',
              title: this.translate.instant('provider-tour-management.swal.successfulCancelTitle'),
              text: this.translate.instant('provider-tour-management.swal.rainCanceledText', { bookingId: booking.id }),
              confirmButtonColor: '#3085d6'
            }).then(() => {
              // Refrescar los datos
              if (this.currentRole === 'CLIENT') {
                this.loadClientReservations();
              } else if (this.currentRole === 'PROVIDER') {
                this.loadProviderReservations();
              }
            });
          },
          error: (error) => {
            console.error('❌ Error al cancelar por lluvia:', error);
            Swal.fire({
              icon: 'error',
              title: this.translate.instant('provider-tour-management.swal.error'),
              text: this.translate.instant('provider-tour-management.swal.rainCancelErrorText'),
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  /**
   * Verifica si la reserva se puede cancelar basado en su estado y fecha máxima.
   */
  public canCancel(booking: any): boolean {
    if (!booking) return false;
    const isActionable = booking.status === 'Pending' || booking.status === 'PENDING' || booking.status === 'RESCHEDULED' || booking.status === 'Rescheduled';
    
    if (!booking.maxCancellationDate) return false;
    
    // Updated robust comparison logic
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    // Appending T00:00:00 ensures the date is parsed in local time
    const limitDate = new Date(booking.maxCancellationDate + 'T00:00:00');
    limitDate.setHours(0, 0, 0, 0);
    
    return isActionable && now <= limitDate;
  }

  /**
   * Verifica si la reserva se puede reagendar basado en su estado y fecha máxima.
   */
  public canReschedule(booking: any): boolean {
    if (!booking) return false;
    
    // Use the new canReschedule field from API if available
    if (booking.canReschedule !== undefined) {
      return booking.canReschedule;
    }

    // Fallback to legacy logic
    const isActionable = booking.status === 'Pending' || booking.status === 'PENDING' || booking.status === 'RESCHEDULED' || booking.status === 'Rescheduled';
    
    if (!booking.maxReschedulingDate) return false;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Robust parsing: appending T00:00:00 ensures local time parsing
    const limitDate = new Date(booking.maxReschedulingDate + 'T00:00:00');
    limitDate.setHours(0, 0, 0, 0);
    
    return isActionable && now <= limitDate;
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
    console.log('ðŸ“… Modal reagendar: Estableciendo fechas por defecto:', booking.rawCheckInDate, booking.rawReturnDate);
    this.rescheduleDateModalBooking = booking;
    
    // Prioridad: 1. Fecha original de la reserva, 2. Fecha de hoy
    this.rescheduleCheckIn = booking.rawCheckInDate || new Date().toISOString().split('T')[0];
    this.rescheduleCheckOut = booking.rawReturnDate || this.rescheduleCheckIn;
    
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
      Swal.fire(this.translate.instant('provider-tour-management.swal.error'), this.translate.instant('provider-tour-management.swal.reservationNotFoundSimple'), 'error');
      return;
    }

    if (!this.rescheduleCheckIn || !this.rescheduleCheckOut) {
      Swal.fire(this.translate.instant('provider-tour-management.swal.attention'), this.translate.instant('provider-tour-management.swal.selectDatesCheck'), 'warning');
      return;
    }

    // Comparar fechas como strings (formato YYYY-MM-DD)
    if (this.rescheduleCheckIn >= this.rescheduleCheckOut) {
      Swal.fire(this.translate.instant('provider-tour-management.swal.attention'), this.translate.instant('provider-tour-management.swal.checkOutAfterCheckIn'), 'warning');
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
      console.error('âŒ tourId es undefined. Datos de la reserva:', bookingData);
      Swal.fire(this.translate.instant('provider-tour-management.swal.error'), this.translate.instant('provider-tour-management.swal.tourIdError'), 'error');
      return;
    }

    // Cerrar el modal de fechas
    this.closeRescheduleDateModal();

    console.log('ðŸ” Cargando datos del tour desde API...', { tourId, checkInStr, checkOutStr });

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
                
                console.log('ðŸŽ¯ Abriendo modal de slots con datos completos:', tourData);
                
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
                    originalTravellers: bookingData.totalTourists || 1, // Número de turistas directo desde el API
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
                console.error('âŒ No se encontraron horarios disponibles para las fechas seleccionadas');
                Swal.fire(this.translate.instant('provider-tour-management.swal.attention'), this.translate.instant('provider-tour-management.swal.noSlotsAvailable'), 'info');
              }
            },
            error: (error) => {
              console.error('âŒ Error cargando schedules:', error);
              Swal.fire(this.translate.instant('provider-tour-management.swal.error'), this.translate.instant('provider-tour-management.swal.errorLoadingSlots'), 'error');
            }
          });
        } else {
          console.error('âŒ No se encontraron datos del tour');
          Swal.fire(this.translate.instant('provider-tour-management.swal.error'), this.translate.instant('provider-tour-management.swal.couldNotLoadTourInfo'), 'error');
        }
      },
      error: (error) => {
        console.error('âŒ Error cargando datos del tour:', error);
        Swal.fire(this.translate.instant('provider-tour-management.swal.error'), this.translate.instant('provider-tour-management.swal.errorLoadingTourInfo'), 'error');
      }
    });
  }
}


