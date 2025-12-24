import { Component, OnInit, OnChanges, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { ProviderReview } from '../../../shared/models/reviews.model';
import { AuthService } from '../../../core/services/auth.service';
import { I18nFieldService } from '../../../shared/services/i18n-field.service';

@Component({
  selector: 'app-provider-reviews',
  standalone: false,
  templateUrl: './provider-reviews.component.html',
  styleUrl: './provider-reviews.component.scss'
})
export class ProviderReviewsComponent implements OnInit, OnChanges {
  public routes = routes;
  
  // Input para controlar la visibilidad de los filtros
  @Input() showFilters: boolean = true;
  
  // Inputs para recibir datos del padre
  @Input() reviews: ProviderReview[] = [];
  @Input() totalReviews = 0;
  @Input() averageRating = 0;
  @Input() isLoading = false;
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  
  // Outputs para emitir eventos al padre
  @Output() loadReviews = new EventEmitter<any>();
  @Output() applyFiltersEvent = new EventEmitter<any>();
  @Output() submitReplyEvent = new EventEmitter<{reviewId: string, answerData: any}>();
  @Output() submitRejectEvent = new EventEmitter<{reviewId: string, reason: string}>();
  
  // Variables de filtrado local
  public filteredReviews: ProviderReview[] = [];
  
  // Detección de roles
  public isCliente: boolean = false;
  public isProveedor: boolean = false;
  public isBackoffice: boolean = false;
  
  // Filtros por rol
  public selectedRatingFilter = 0; // 0 = todas, 1-5 = filtrar por rating
  public selectedTourFilter: string = 'all'; // 'all' o ID del tour
  public selectedProviderFilter: string = 'all'; // 'all' o ID del proveedor
  public selectedUserFilter: string = 'all'; // 'all' o ID del usuario
  
  // Términos de búsqueda para autocomplete
  public tourSearchTerm: string = 'Todos';
  public providerSearchTerm: string = 'Todos';
  public userSearchTerm: string = 'Todos';
  
  // Listas filtradas para autocomplete
  public filteredTours: any[] = [];
  public filteredProviders: any[] = [];
  public filteredUsers: any[] = [];
  
  // Datos disponibles para filtros
  public availableTours: any[] = [];
  public availableProviders: any[] = [];
  public availableUsers: any[] = [];
  
  // Control de dropdowns abiertos
  public tourDropdownOpen: boolean = false;
  public providerDropdownOpen: boolean = false;
  public userDropdownOpen: boolean = false;
  
  // Estado del formulario de respuesta
  public replyingToReviewId: string | null = null;
  public replyText: string = '';
  
  // Paginación
  public pageSize: number = 10;
  
  // Estado de rechazo (para Backoffice)
  public rejectingReviewId: string | null = null;
  public selectedRejectionReason: string = '';
  public rejectionReasons: string[] = [
    'Contenido inapropiado',
    'Información falsa o engañosa',
    'Spam o contenido irrelevante'
  ];

  constructor(
    private authService: AuthService,
    public i18nService: I18nFieldService
  ) {}

  ngOnInit(): void {
    // Detectar roles del usuario con lógica de exclusividad
    // Prioridad: Admin > Provider > User
    const isUser = this.authService.isUser();
    const isProvider = this.authService.isProvider();
    const isAdmin = this.authService.isAdmin();
    
    // Asignar rol exclusivo según prioridad
    if (isAdmin) {
      this.isBackoffice = true;
      this.isProveedor = false;
      this.isCliente = false;
    } else if (isProvider) {
      this.isBackoffice = false;
      this.isProveedor = true;
      this.isCliente = false;
    } else if (isUser) {
      this.isBackoffice = false;
      this.isProveedor = false;
      this.isCliente = true;
    }
    
    // Emitir evento para que el padre cargue las reviews
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loadReviewsData();
    });
  }
  
  ngOnChanges(): void {
    // Actualizar filteredReviews cuando cambien las reviews del Input
    this.filteredReviews = [...this.reviews];
    this.initializeFilterData();
  }

  /**
   * Cierra todos los dropdowns cuando se hace click fuera
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Verificar si el click fue fuera de los inputs de autocomplete
    if (!target.closest('.position-relative')) {
      this.tourDropdownOpen = false;
      this.providerDropdownOpen = false;
      this.userDropdownOpen = false;
    }
  }

  /**
   * Emite evento para que el padre cargue reviews
   */
  private loadReviewsData(): void {
    this.loadReviews.emit();
  }

  /**
   * Inicializa los datos para los filtros basándose en las reviews cargadas
   */
  private initializeFilterData(): void {
    // Extraer tours únicos
    this.availableTours = this.extractUniqueItems(
      this.reviews,
      'tourId',
      'tourName'
    );
    this.filteredTours = [...this.availableTours];
    
    // Extraer usuarios únicos (clientes que han hecho reviews)
    this.availableUsers = this.extractUniqueItems(
      this.reviews,
      'customerName',
      'customerName'
    );
    this.filteredUsers = [...this.availableUsers];
    
    // Para backoffice, extraer proveedores únicos (si está disponible en el modelo)
    // Por ahora usaremos datos mock o se puede extender el modelo
    if (this.isBackoffice) {
      this.availableProviders = [
        { id: 'provider1', name: 'Proveedor 1' },
        { id: 'provider2', name: 'Proveedor 2' },
        { id: 'provider3', name: 'Proveedor 3' }
      ];
      this.filteredProviders = [...this.availableProviders];
    }
  }

  /**
   * Extrae items únicos de las reviews
   */
  private extractUniqueItems(
    reviews: ProviderReview[],
    idField: string,
    nameField: string
  ): any[] {
    const uniqueMap = new Map();
    reviews.forEach(review => {
      const id = (review as any)[idField];
      const name = (review as any)[nameField];
      if (id && !uniqueMap.has(id)) {
        uniqueMap.set(id, { id, name });
      }
    });
    return Array.from(uniqueMap.values());
  }



  /**
   * Filtra por rating
   */
  public filterByRating(rating: number): void {
    this.selectedRatingFilter = rating;
    this.currentPage = 1; // Reset a la primera página al cambiar filtro
    this.applyFilters();
  }

  /**
   * Filtra tours basándose en el término de búsqueda
   */
  public filterTours(): void {
    const searchLower = this.tourSearchTerm.toLowerCase();
    if (searchLower === 'todos' || searchLower === '') {
      this.filteredTours = [...this.availableTours];
    } else {
      this.filteredTours = this.availableTours.filter(tour =>
        tour.name.toLowerCase().includes(searchLower)
      );
    }
  }

  /**
   * Filtra proveedores basándose en el término de búsqueda
   */
  public filterProviders(): void {
    const searchLower = this.providerSearchTerm.toLowerCase();
    if (searchLower === 'todos' || searchLower === '') {
      this.filteredProviders = [...this.availableProviders];
    } else {
      this.filteredProviders = this.availableProviders.filter(provider =>
        provider.name.toLowerCase().includes(searchLower)
      );
    }
  }

  /**
   * Filtra usuarios basándose en el término de búsqueda
   */
  public filterUsers(): void {
    const searchLower = this.userSearchTerm.toLowerCase();
    if (searchLower === 'todos' || searchLower === '') {
      this.filteredUsers = [...this.availableUsers];
    } else {
      this.filteredUsers = this.availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchLower)
      );
    }
  }

  /**
   * Selecciona un tour del autocomplete
   */
  public selectTour(tour: any): void {
    this.selectedTourFilter = tour.id;
    this.tourSearchTerm = tour.name;
    this.tourDropdownOpen = false;
    this.currentPage = 1; // Reset a la primera página
    this.applyFilters();
  }

  /**
   * Selecciona un proveedor del autocomplete
   */
  public selectProvider(provider: any): void {
    this.selectedProviderFilter = provider.id;
    this.providerSearchTerm = provider.name;
    this.providerDropdownOpen = false;
    this.currentPage = 1; // Reset a la primera página
    this.applyFilters();
  }

  /**
   * Selecciona un usuario del autocomplete
   */
  public selectUser(user: any): void {
    this.selectedUserFilter = user.id;
    this.userSearchTerm = user.name;
    this.userDropdownOpen = false;
    this.currentPage = 1; // Reset a la primera página
    this.applyFilters();
  }

  /**
   * Resetea el filtro de tour
   */
  public resetTourFilter(): void {
    this.selectedTourFilter = 'all';
    this.tourSearchTerm = 'Todos';
    this.filteredTours = [...this.availableTours];
    this.tourDropdownOpen = false;
    this.applyFilters();
  }

  /**
   * Resetea el filtro de proveedor
   */
  public resetProviderFilter(): void {
    this.selectedProviderFilter = 'all';
    this.providerSearchTerm = 'Todos';
    this.filteredProviders = [...this.availableProviders];
    this.providerDropdownOpen = false;
    this.applyFilters();
  }

  /**
   * Resetea el filtro de usuario
   */
  public resetUserFilter(): void {
    this.selectedUserFilter = 'all';
    this.userSearchTerm = 'Todos';
    this.filteredUsers = [...this.availableUsers];
    this.userDropdownOpen = false;
    this.applyFilters();
  }

  /**
   * Aplica todos los filtros emitiendo evento al padre
   */
  public applyFilters(): void {
    // Preparar objeto de filtros
    const filters: any = {
      pageSize: this.pageSize,
      pageNumber: this.currentPage
    };
    
    // Agregar filtros activos
    if (this.selectedRatingFilter > 0) {
      filters.rating = this.selectedRatingFilter;
    }
    
    if (this.selectedTourFilter !== 'all') {
      filters.tourId = this.selectedTourFilter;
    }
    
    if (this.selectedUserFilter !== 'all') {
      filters.userId = this.selectedUserFilter;
    }
    
    if (this.selectedProviderFilter !== 'all') {
      filters.providerId = this.selectedProviderFilter;
    }
    
    // Emitir evento al padre para que aplique los filtros
    this.applyFiltersEvent.emit(filters);
  }

  /**
   * Limpia todos los filtros y recarga las reviews
   */
  public clearFilters(): void {
    this.selectedRatingFilter = 0;
    this.selectedTourFilter = 'all';
    this.selectedProviderFilter = 'all';
    this.selectedUserFilter = 'all';
    this.tourSearchTerm = 'Todos';
    this.providerSearchTerm = 'Todos';
    this.userSearchTerm = 'Todos';
    this.filteredTours = [...this.availableTours];
    this.filteredProviders = [...this.availableProviders];
    this.filteredUsers = [...this.availableUsers];
    this.currentPage = 1; // Reset a la primera página
    
    // Emitir evento para recargar reviews sin filtros
    this.loadReviewsData();
  }

  /**
   * Navega a una página específica
   */
  public goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.applyFilters();
  }

  /**
   * Navega a la página siguiente
   */
  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  /**
   * Navega a la página anterior
   */
  public previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
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
   * Exporta datos (mock)
   */
  public exportData(format: 'pdf' | 'excel'): void {
    alert(`Exportando calificaciones como ${format.toUpperCase()}...`);
  }

  /**
   * Obtiene las estrellas para mostrar el rating
   */
  public getStarsArray(rating: number): { full: boolean }[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push({ full: i <= Math.floor(rating) });
    }
    return stars;
  }

  /**
   * Obtiene la clase CSS del badge según el rating
   */
  public getRatingBadgeClass(rating: number): string {
    if (rating >= 4.5) return 'badge-success';
    if (rating >= 4.0) return 'badge-primary';
    if (rating >= 3.5) return 'badge-warning';
    return 'badge-secondary';
  }

  /**
   * Verifica si se puede responder a una review
   * Solo si el usuario es PROVIDER y la review no tiene respuesta
   */
  public canRespondToReview(review: ProviderReview): boolean {
    return this.authService.isProvider() && !review.answer;
  }

  /**
   * Abre/cierra el formulario de respuesta para una review
   */
  public respondToReview(reviewId: string): void {
    if (this.replyingToReviewId === reviewId) {
      // Si ya está abierto, cerrarlo
      this.cancelReply();
    } else {
      // Abrir formulario para esta review
      this.replyingToReviewId = reviewId;
      this.replyText = '';
    }
  }

  /**
   * Verifica si el formulario de respuesta está abierto para una review específica
   */
  public isReplyFormOpen(reviewId: string): boolean {
    return this.replyingToReviewId === reviewId;
  }

  /**
   * Cancela la respuesta y cierra el formulario
   */
  public cancelReply(): void {
    this.replyingToReviewId = null;
    this.replyText = '';
  }

  /**
   * Envía la respuesta a la review
   */
  public submitReply(reviewId: string): void {
    if (!this.replyText.trim()) {
      alert('Por favor escribe una respuesta antes de enviar');
      return;
    }

    // Obtener información del proveedor desde el usuario autenticado
    const user = this.authService.getUser();
    const providerName = user?.name || user?.firstName + ' ' + user?.lastName || 'Provider';
    const providerImage = user?.profileImage || 'user-default.jpg';

    // Calcular fecha y días transcurridos
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const daysAgo = 'Justo ahora';

    // Preparar datos de la respuesta
    const answerData = {
      comment: this.replyText.trim(),
      providerName: providerName,
      providerImage: providerImage,
      date: dateString,
      daysAgo: daysAgo,
      likes: 0,
      dislikes: 0,
      hearts: 0
    };

    // Emitir evento al padre para que guarde la respuesta
    this.submitReplyEvent.emit({ reviewId, answerData });
    
    // Cerrar el formulario
    this.cancelReply();
  }

  /**
   * Abre/cierra el formulario de rechazo para una review (solo Backoffice)
   */
  public toggleRejectForm(reviewId: string): void {
    if (this.rejectingReviewId === reviewId) {
      // Si ya está abierto, cerrarlo
      this.cancelReject();
    } else {
      // Abrir formulario para esta review
      this.rejectingReviewId = reviewId;
      this.selectedRejectionReason = '';
    }
  }

  /**
   * Verifica si el formulario de rechazo está abierto para una review específica
   */
  public isRejectFormOpen(reviewId: string): boolean {
    return this.rejectingReviewId === reviewId;
  }

  /**
   * Cancela el rechazo y cierra el formulario
   */
  public cancelReject(): void {
    this.rejectingReviewId = null;
    this.selectedRejectionReason = '';
  }

  /**
   * Envía el rechazo de la review
   */
  public submitReject(reviewId: string): void {
    if (!this.selectedRejectionReason) {
      alert('Por favor selecciona un motivo de rechazo');
      return;
    }

    // Emitir evento al padre para que rechace la review
    this.submitRejectEvent.emit({ reviewId, reason: this.selectedRejectionReason });
    
    // Cerrar el formulario
    this.cancelReject();
  }
}
