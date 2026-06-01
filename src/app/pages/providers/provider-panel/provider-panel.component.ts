import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { routes } from "../../../shared/routes/routes";
import { RequestProvider } from "../../../shared/dto/requestProvider-response.dto";
import { RequestProvidersService } from "../requestproviders/request-providers.service";
import { Tour } from "../../../shared/dto/tour-response.dto";
import { TourService } from "../tours/tour.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ReviewsService } from "../../../core/services/reviews.service";
import { ProviderReview } from "../../../shared/models/reviews.model";
import { ProviderPanelStateService } from "../../../shared/services/provider-panel-state.service";
import { I18nFieldService } from "../../../shared/services/i18n-field.service";
import { AuthService } from "../../../core/services/auth.service";
import { RequestsProvidersStatus } from "../../../shared/enums/requests-providers-status.enum";
import { PayoutOrdersService } from "../../../shared/services/payout-orders.service";
import { PayoutOrder } from "../../../shared/dto/payout-order.dto";
import { ReservationService } from "../../../shared/services/reservation.service";
import { ClientReservation } from "../../../shared/models/reservation.model";

@Component({
  selector: "app-provider-panel",
  standalone: false,
  templateUrl: "./provider-panel.component.html",
  styleUrl: "./provider-panel.component.scss",
})
export class ProviderPanelComponent implements OnInit {
  public routes = routes;
  public Math = Math;

  showModal = false;
  showRequestInfoModal = false;
  showConfirmModal = false;
  showDeclineConfirmModal = false;
  selectedProvider: RequestProvider | null = null;
  requestInfoMessage: string = "";
  requestProviders: any = { content: [] };
  mostrarTours: boolean = false;
  mostrarTemplates: boolean = false;
  mostrarTourManagement = false;
  mostrarReviews = false;
  mostrarPagos = false;
  mostrarPerfil = false;
  declinedReason: string = "";

  tours: Tour[] = [];
  loading: boolean = false;
  public page: number = 1;
  public size: number = 10;
  public totalItems: number = 0;
  public totalPages: number = 0;
  public currentPage: number = 1;
  
  providerData: RequestProvider | null = null;
  // Variables para reviews
  reviews: ProviderReview[] = [];
  totalReviews: number = 0;
  averageRating: number = 0;
  reviewsLoading: boolean = false;
  reviewsTotalPages: number = 0;
  reviewsCurrentPage: number = 1;

  // Payout Stats
  payoutOrders: PayoutOrder[] = [];
  totalPayoutAmount: number = 0;

  // Recent Dashboard Items
  recentReservations: ClientReservation[] = [];
  recentReviewsDashboard: ProviderReview[] = [];
  
  public reviewReasonsPositive: any[] = [];
  public reviewReasonsNegative: any[] = [];

  constructor(
    private requestProvidersService: RequestProvidersService,
    private toursService: TourService,
    private reviewsService: ReviewsService,
    private router: Router,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private panelStateService: ProviderPanelStateService,
    private cdr: ChangeDetectorRef,
    public i18nService: I18nFieldService,
    public authService: AuthService,
    private payoutOrdersService: PayoutOrdersService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    const requestProviderStatus = this.authService.getRequestProviderStatus();
    if (requestProviderStatus && requestProviderStatus !== RequestsProvidersStatus.APPROVED) {
      console.log('🚫 Proveedor no aprobado. Redirigiendo a requestproviders. Estado actual:', requestProviderStatus);
      this.router.navigate(['/providers/requestproviders']);
      return;
    }

    const added = !!this.route.snapshot.queryParamMap.get("addedTour");
    const edited = !!this.route.snapshot.queryParamMap.get("editedTour");
    const openModal = this.route.snapshot.queryParamMap.get("openModal");
    const reservationId = this.route.snapshot.queryParamMap.get("reservationId");

    if (added) {
      this.openSnackBar("Tour added successfully");
    } else if (edited) {
      this.openSnackBar("Tour successfully edited");
    }
    
    // Si viene desde el QR scanner, mostrar la vista de "Mis reservas" INMEDIATAMENTE
    if (openModal === 'true' && reservationId) {
      console.log('🔓 QR DETECTADO - Activando vista de Mis reservas');
      console.log('📋 Reservation ID:', reservationId);
      console.log('🎯 Estableciendo mostrarTourManagement = true');
      
      // Usar setTimeout para asegurar que Angular detecte el cambio
      setTimeout(() => {
        this.setView('reservas');
        this.cdr.detectChanges(); // Forzar detección de cambios
        console.log('✅ Vista activada - mostrarTourManagement:', this.mostrarTourManagement);
        
        // Limpiar los query params DESPUÉS de activar la vista
        // Esto evita que el modal se vuelva a abrir al cambiar de vista
        setTimeout(() => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true // Reemplazar la URL en el historial
          });
          console.log('🧹 Query params limpiados desde provider-panel');
        }, 500); // Esperar 500ms para que el componente hijo lea los params
      }, 0);
    } else {
      // Establecer vista por defecto si no hay una vista específica solicitada
      // Si el sessionStorage no tiene el providerPanelView, significa que es un login nuevo o se cerró sesión
      const savedView = sessionStorage.getItem('providerPanelView');
      if (!savedView) {
        console.log('🏠 Vista limpia detectada (nuevo inicio de sesión), forzando: dashboard');
        this.panelStateService.setView('dashboard');
      } else {
        const currentView = this.panelStateService.getCurrentView();
        if (currentView) {
          console.log('📱 Vista inicial desde servicio:', currentView);
          this.setView(currentView);
        } else {
          console.log('🏠 Estableciendo vista por defecto: dashboard');
          this.panelStateService.setView('dashboard');
        }
      }
    }

    // Suscribirse a cambios de vista desde el menú hamburguesa
    this.panelStateService.currentView$.subscribe(view => {
      console.log('📱 Cambio de vista desde menú hamburguesa:', view);
      this.setView(view);
    });

    // No limpiar los query params aquí para que provider-tour-management pueda leerlos
    // this.router.navigate([], { queryParams: null });

    // this.getProviderData(); // Unused and causes duplicate API call
    this.onLoadReviews();
    this.loadPayoutData();
    this.loadDashboardRecentItems();
    this.loadReviewReasons();
  }

  private loadReviewReasons(): void {
    this.reviewsService.getReviewReasons().subscribe({
      next: (response) => {
        if (response) {
          this.reviewReasonsPositive = response.positive || [];
          this.reviewReasonsNegative = response.negative || [];
        }
      },
      error: (error) => console.error('Error loading review reasons:', error)
    });
  }

  public getReasonLabel(reasonType: 'POSITIVE' | 'NEGATIVE' | string | undefined, reasonId: number | undefined): string {
    if (!reasonType || !reasonId) return '';
    if (reasonType === 'POSITIVE') {
      const reason = this.reviewReasonsPositive.find(r => r.id === reasonId);
      return reason ? this.i18nService.getValue(reason.label) : '';
    } else if (reasonType === 'NEGATIVE') {
      const reason = this.reviewReasonsNegative.find(r => r.id === reasonId);
      return reason ? this.i18nService.getValue(reason.label) : '';
    }
    return '';
  }

  loadPayoutData(): void {
    const observer = {
      next: (data: PayoutOrder[]) => {
        this.payoutOrders = data;
        const completedPayments = data.filter(p => p.status === 'PAID');
        this.totalPayoutAmount = completedPayments.reduce((sum, payment) => sum + payment.amountTotal, 0);
      },
      error: (error: any) => {
        console.error('Error loading payout orders:', error);
      }
    };

    if (this.authService.isAdmin()) {
      this.payoutOrdersService.getAdminPayoutOrders().subscribe(observer);
    } else {
      this.payoutOrdersService.getPayoutOrders().subscribe(observer);
    }
  }

  loadDashboardRecentItems(): void {
    this.reservationService.getProviderReservations({ page: 0, size: 5 }).subscribe({
      next: (response) => {
        this.recentReservations = response.content || [];
      },
      error: (error) => {
        console.error('Error loading recent reservations:', error);
      }
    });

    this.reviewsService.getReviews({ pageNumber: 0, pageSize: 5 }).subscribe({
      next: (response) => {
        this.recentReviewsDashboard = response.content || [];
      },
      error: (error) => {
        console.error('Error loading recent reviews:', error);
      }
    });
  }

  goToReservation(reservationId: number): void {
    this.panelStateService.setReservationToOpen(reservationId);
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/bookings-management']);
    } else {
      this.panelStateService.setView('reservas');
    }
  }

  getPaymentCountByStatus(status: string): number {
    return this.payoutOrders.filter(payment => payment.status === status).length;
  }


  /**
   * Cambia la vista activa del panel
   */
  setView(view: 'dashboard' | 'tours' | 'templates' | 'reservas' | 'reviews' | 'pagos' | 'perfil'): void {
    this.mostrarTours = view === 'tours';
    this.mostrarTemplates = view === 'templates';
    this.mostrarTourManagement = view === 'reservas';
    this.mostrarReviews = view === 'reviews';
    this.mostrarPagos = view === 'pagos';
    this.mostrarPerfil = view === 'perfil';

    if (this.mostrarTours) {
      this.getToursProvider();
    }
  }

  getProviderData() {
    this.requestProvidersService.consultData().subscribe({
      next: (response) => {
        this.providerData = response;
      },
      error: (error) => {
        console.error("Error fetching provider data:", error);
      }
    });
  }

  getToursProvider() {
    this.toursService
      .getToursProvider({ page: this.page - 1, size: this.size })
      .subscribe({
        next: (response: any) => {
          if (response && response.content) {
            // Respuesta paginada
            this.tours = response.content || [];
            this.totalItems = response.totalElements || 0;
            this.totalPages = response.totalPages || 0;
            this.currentPage = response.number + 1;
          } else if (Array.isArray(response)) {
            // Respuesta como array simple
            this.tours = response;
            this.totalItems = response.length;
            this.totalPages = Math.ceil(response.length / this.size);
            this.currentPage = 1;
          } else {
            // Respuesta vacía o inválida
            this.tours = [];
            this.totalItems = 0;
            this.totalPages = 0;
            this.currentPage = 1;
          }

          this.loading = false;
        },
        error: (error: any) => {
          console.error("=== ERROR EN LA BÚSQUEDA ===");
          console.error("Error al buscar tours:", error);
          console.error("Detalles del error:", error.message);
          this.tours = [];
          this.totalItems = 0;
          this.totalPages = 0;
          this.currentPage = 1;
          this.loading = false;
        },
      });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Si hay muchas páginas, mostrar un rango alrededor de la página actual
      let start = Math.max(
        1,
        this.currentPage - Math.floor(maxVisiblePages / 2)
      );
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

      // Ajustar el inicio si estamos cerca del final
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.page = page;
      this.getToursProvider();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  isLastPage(): boolean {
    return this.currentPage === this.totalPages;
  }

  onGoToPageFromList(page: number): void {
    this.goToPage(page);
  }

  onGoToPreviousPageFromList(): void {
    this.goToPreviousPage();
  }

  onGoToNextPageFromList(): void {
    this.goToNextPage();
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, "", {
      duration: 5000,
    });
  }
  
  // Métodos para manejar reviews
  
  /**
   * Carga las reviews desde el servicio
   */
  onLoadReviews(): void {
    this.reviewsLoading = true;
    this.reviewsService.getReviews().subscribe({
      next: (response) => {
        this.reviews = response.content;
        this.totalReviews = response.totalElements;
        this.reviewsTotalPages = response.totalPages;
        this.reviewsCurrentPage = response.number + 1;
        this.calculateReviewStatistics();
        this.reviewsLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviewsLoading = false;
      }
    });
  }
  
  /**
   * Aplica filtros a las reviews
   */
  onApplyFilters(filters: any): void {
    this.reviewsLoading = true;
    this.reviewsService.getReviews(filters).subscribe({
      next: (response) => {
        this.reviews = response.content;
        this.totalReviews = response.totalElements;
        this.reviewsTotalPages = response.totalPages;
        this.reviewsCurrentPage = response.number + 1;
        this.calculateReviewStatistics();
        this.reviewsLoading = false;
      },
      error: (error) => {
        console.error('Error applying filters:', error);
        this.reviewsLoading = false;
      }
    });
  }
  
  /**
   * Envía una respuesta a una review
   */
  /**
   * Envía una respuesta a una review
   */
  onSubmitReply(event: {reviewId: string, answerData: any}): void {
    // Extraer solo el comentario del answerData
    const comment = event.answerData.comment || event.answerData;
    // Extraer archivos si existen (agregados en ProviderReviewsComponent)
    const files = event.answerData.files || [];
    
    this.reviewsService.saveReviewReply(event.reviewId, comment, files).subscribe({
      next: (response) => {
        console.log('Respuesta guardada exitosamente:', response);
        this.openSnackBar('¡Respuesta enviada exitosamente!');
        // Recargar las reviews para mostrar la nueva respuesta
        this.onLoadReviews();
      },
      error: (error) => {
        console.error('Error al guardar la respuesta:', error);
        this.openSnackBar('Error al enviar la respuesta. Por favor intenta nuevamente.');
      }
    });
  }
  
  /**
   * Rechaza una review
   */
  onSubmitReject(event: {reviewId: string, reason: string}): void {
    this.reviewsService.rejectReview(event.reviewId, event.reason).subscribe({
      next: (response) => {
        console.log('Review rechazada exitosamente:', response);
        this.openSnackBar('Review rechazada exitosamente');
        // Recargar las reviews
        this.onLoadReviews();
      },
      error: (error) => {
        console.error('Error al rechazar la review:', error);
        this.openSnackBar('Error al rechazar la review. Por favor intenta nuevamente.');
      }
    });
  }
  
  /**
   * Calcula las estadísticas de las reviews
   */
  private calculateReviewStatistics(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }
    const sum = this.reviews.reduce((acc, review) => acc + (review.rating ?? 0), 0);
    this.averageRating = parseFloat((sum / this.reviews.length).toFixed(1));
  }

  logout(): void {
    this.authService.logout();
  }
}
