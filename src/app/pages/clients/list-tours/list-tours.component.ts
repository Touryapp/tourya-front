import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { routes } from "../../../shared/routes/routes";
import { ActivatedRoute } from '@angular/router';
import { SearchTourListDto } from '../../../shared/dto/search-tour-response.dto';
import { State } from '../../../shared/dto/requestProvider-response.dto';
import { TourCategory } from '../../../shared/dto/tour-response.dto';
import { environment } from '../../../../environments/environment';
import { SearchToursDto } from '../../../shared/dto/search-tours.dto';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { SearchToursService } from './search-tours.service';
import { CartService } from '../../../shared/services/cart.service';
import { CartItem, DaySelection, CartSummary } from '../../../shared/dto/cart.dto';
import { TourSlotSelectionModalComponent } from '../../../shared/common/tour-slot-selection-modal/tour-slot-selection-modal.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-tours',
  standalone: false,
  templateUrl: './list-tours.component.html',
  styleUrl: './list-tours.component.scss'
})
export class ListToursComponent implements OnInit, OnDestroy {
  @ViewChild(TourSlotSelectionModalComponent) slotModal!: TourSlotSelectionModalComponent;
  
  public routes = routes;
  public Math = Math; // Para usar Math en el template
  
  // Cart functionality
  private destroy$ = new Subject<void>();
  isCartVisible: boolean = false;
  cartSummary: CartSummary | null = null;
  daySelections: DaySelection[] = [];
  
  // Date picker
  bsValue = new Date();
  
  // Slider values
  startValue = 200;
  endValue = 800;
  
  // Show more/less functionality
  isMore: boolean[] = [false, false, false, false, false, false, false, false];
  
  // Favorites functionality
  isSelected: boolean[] = [false, false, false, false, false, false, false, false, false];
  isClassAdded: boolean[] = [false, false, false, false, false, false, false, false];
  


  // Tour types data
  tourTypes = [
    {
      name: 'Ecotourism',
      count: '216 Hotels',
      image: 'assets/img/tours/tours-01.jpg'
    },
    {
      name: 'Adventure Tour',
      count: '569 tours',
      image: 'assets/img/tours/tours-02.jpg'
    },
    {
      name: 'Group Tours',
      count: '129 tours',
      image: 'assets/img/tours/tours-03.jpg'
    },
    {
      name: 'Beach Tours',
      count: '600 tours',
      image: 'assets/img/tours/tours-04.jpg'
    },
    {
      name: 'Historical Tours',
      count: '200 tours',
      image: 'assets/img/tours/tours-05.jpg'
    },
    {
      name: 'Summer Trip',
      count: '200 tours',
      image: 'assets/img/tours/tours-06.jpg'
    }
  ];

  // Tours data (ahora será llenado por la API)
  tours: SearchToursDto[] = [];
  loading: boolean = false;

  public states: State[] =  [{id: 1, name: 'Bogota'}];
  public categories: TourCategory[] = [
    {
      "id": 1,
      "name": "Categoria 1",
      "description": "Descripcion de la categoria"
    }
  ]

  public selectedState: string = '';
  public selectedCategory: string = '';
  public checkIn: string = '';
  public checkOut: string = '';
  
  // Nuevas propiedades para filtros basados en SearchTourListDto
  public selectedDuration: string = '';
  public selectedAgeType: string = '';
  public minPrice: number = 100;
  public maxPrice: number = 5000;
  public searchText: string = '';
  
  // Opciones para los filtros
  public durationOptions = [
    { value: '1-3', label: '1-3 días' },
    { value: '4-7', label: '4-7 días' },
    { value: '8-14', label: '8-14 días' },
    { value: '15+', label: '15+ días' }
  ];
  
  public ageTypeOptions = [
    { value: 'ADULT', label: 'Adulto' },
    { value: 'CHILD', label: 'Niño' },
    { value: 'INFANT', label: 'Infante' },
    { value: 'SENIOR', label: 'Senior' }
  ];
  
  public page: number = 1;
  public size: number = 10;
  public totalItems: number = 0;
  public totalPages: number = 0;
  public currentPage: number = 1;
  public viewMode: 'grid' | 'list' = 'grid';
  constructor(
    private fb: FormBuilder, 
    private route: ActivatedRoute,
    private searchToursService: SearchToursService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.initializeCartSubscriptions();
    
    this.route.queryParams.subscribe(params => {
      this.selectedState = params['state'] || '';
      this.selectedCategory = params['category'] || '';
      this.checkIn = params['checkIn'] || '';
      this.checkOut = params['checkOut'] || '';
      
      // Initialize cart with dates if available
      if (this.checkIn && this.checkOut) {
        console.log('Inicializando carrito con fechas:', this.checkIn, this.checkOut);
        this.cartService.initializeCart(this.checkIn, this.checkOut);
        this.isCartVisible = true;
      }
      
      this.searchToursList();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeCartSubscriptions(): void {
    // Subscribe to cart summary
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });

    // Subscribe to day selections
    this.cartService.daySelections$
      .pipe(takeUntil(this.destroy$))
      .subscribe(days => {
        this.daySelections = days;
      });
  }

  // Show more/less functionality
  showMore(index: number): void {
    this.isMore[index] = !this.isMore[index];
  }

  // Favorites functionality
  selectClass(index: number): void {
    this.isSelected[index] = !this.isSelected[index];
  }

  toggleClass(index: number): void {
    this.isClassAdded[index] = !this.isClassAdded[index];
  }

  // Slider label formatter
  formatLabel1(value: number): string {
    return `$${value}`;
  }

  // View tour details
  viewTourDetails(tourId: number): void {
    console.log('Ver detalles del tour:', tourId);
    // Navigate to tour details
  }

  // Book tour
  bookTour(tourId: number): void {
    console.log('Reservar tour:', tourId);
    // Navigate to booking page
  }

  // Search functionality
  searchTours(): void {
    console.log('Buscando tours...');
    // Implement search logic
  }

  // Filter functionality
  applyFilters(): void {
    console.log('Aplicando filtros...');
    // Implement filter logic
  }

  // Reset filters
  resetFilters(): void {
    console.log('Reseteando filtros...');
    this.selectedState = '';
    this.selectedCategory = '';
    this.checkIn = '';
    this.checkOut = '';
    this.selectedDuration = '';
    this.selectedAgeType = '';
    this.minPrice = 100;
    this.maxPrice = 5000;
    this.searchText = '';
    this.currentPage = 1;
    this.page = 1;
    this.searchToursList();
  }



  // Pagination functions
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
      let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
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
      this.searchToursList();
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

  // View mode methods
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Event handlers for tour-list-view component
  onToggleFavorite(index: number): void {
    this.toggleClass(index);
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

  // Event handlers for tour-grid-view component
  onToggleFavoriteFromGrid(index: number): void {
    this.toggleClass(index);
  }

  onGoToPageFromGrid(page: number): void {
    this.goToPage(page);
  }

  onGoToPreviousPageFromGrid(): void {
    this.goToPreviousPage();
  }

  onGoToNextPageFromGrid(): void {
    this.goToNextPage();
  }

  onSearch(): void {
    console.log('=== BÚSQUEDA PRINCIPAL ===');
    console.log('Estado seleccionado:', this.selectedState);
    console.log('Categoría seleccionada:', this.selectedCategory);
    console.log('Fecha de entrada:', this.checkIn);
    console.log('Fecha de salida:', this.checkOut);
    
    // Inicializar el carrito si hay fechas válidas
    if (this.checkIn && this.checkOut) {
      console.log('Inicializando carrito desde búsqueda principal');
      this.cartService.initializeCart(this.checkIn, this.checkOut);
      this.isCartVisible = true;
    }
    
    this.currentPage = 1;
    this.page = 1;
    this.searchToursList();
  }

  // Método para búsqueda desde filtros del sidebar
  onSearchFromFilters(): void {
    console.log('=== BÚSQUEDA DESDE FILTROS ===');
    console.log('Estado seleccionado:', this.selectedState);
    console.log('Categoría seleccionada:', this.selectedCategory);
    console.log('Fecha de entrada:', this.checkIn);
    console.log('Fecha de salida:', this.checkOut);
    console.log('Duración seleccionada:', this.selectedDuration);
    console.log('Tipo de edad seleccionado:', this.selectedAgeType);
    console.log('Precio mínimo:', this.minPrice);
    console.log('Precio máximo:', this.maxPrice);
    console.log('Texto de búsqueda:', this.searchText);
    
    //setear el checkin y checkout en el carrito
    this.cartService.initializeCart(this.checkIn, this.checkOut);
    this.isCartVisible = true;
    // Resetear a la primera página
    this.currentPage = 1;
    this.page = 1;
    
    // Ejecutar búsqueda con todos los filtros
    this.searchToursList();
  }

  // Método de prueba para verificar datos
  testSearchData(): void {
    console.log('=== PRUEBA DE DATOS DE BÚSQUEDA ===');
    const testData: Partial<SearchTourListDto> = {
      "providerStateId": Number(this.selectedState) || undefined,
      "providerCityId": 1,
      "categoryId": Number(this.selectedCategory) || undefined,
      "page": this.page,
      "size": this.size,
      "startDate": this.checkIn || undefined,
      "endDate": this.checkOut || undefined,
      "duration": this.selectedDuration || undefined,
      "ageType": this.selectedAgeType || undefined,
      "minPrice": this.minPrice || undefined,
      "maxPrice": this.maxPrice || undefined,
      "search": this.searchText || undefined
    };
    
    console.log('Datos de prueba que se enviarían a la API:', testData);
    console.log('URL del endpoint:', `${environment.apiUrl}/public/tours/schedule/search`);
  }

  // Métodos para manejar cambios en los sliders de precio
  onMinPriceChange(event: any): void {
    const value = Number(event.target.value);
    this.minPrice = value;
    
    // Asegurar que el precio mínimo no sea mayor que el máximo
    if (this.minPrice > this.maxPrice) {
      this.maxPrice = this.minPrice;
    }
    
    console.log('Precio mínimo actualizado:', this.minPrice);
  }

  onMaxPriceChange(event: any): void {
    const value = Number(event.target.value);
    this.maxPrice = value;
    
    // Asegurar que el precio máximo no sea menor que el mínimo
    if (this.maxPrice < this.minPrice) {
      this.minPrice = this.maxPrice;
    }
    
    console.log('Precio máximo actualizado:', this.maxPrice);
  }


  searchToursList(): void {
    this.loading = true;
    
    // Construir objeto de búsqueda con todos los filtros
    const searchData: Partial<SearchTourListDto> = {
      "providerStateId": Number(this.selectedState) || undefined,
      "providerCityId": 1,
      "categoryId": Number(this.selectedCategory) || undefined,
      "page": this.page,
      "size": this.size,
      "startDate": this.checkIn || undefined,
      "endDate": this.checkOut || undefined,
      "duration": this.selectedDuration || undefined,
      "ageType": this.selectedAgeType || undefined,
      "minPrice": this.minPrice || undefined,
      "maxPrice": this.maxPrice || undefined,
      "search": this.searchText || undefined
    };

    console.log('=== DATOS ENVIADOS A LA API ===');
    console.log('Objeto completo de búsqueda:', searchData);
    console.log('URL de la petición:', 'searchTours endpoint');
  
    this.searchToursService.searchTours(searchData).subscribe({
      next: (response: PaginationDto<SearchToursDto>) => {
        console.log('=== RESPUESTA DE LA API ===');
        console.log('Respuesta completa de searchTours:', response);
        
        if (response && response.content) {
          this.tours = response.content || [];
          this.totalItems = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.currentPage = response.number + 1; 
        } 
        
        console.log('=== RESULTADOS PROCESADOS ===');
        console.log('Cantidad de resultados:', this.tours.length);
        console.log('Total de elementos:', this.totalItems);
        console.log('Total de páginas:', this.totalPages);
        console.log('Página actual:', this.currentPage);
        
        this.loading = false;
        
        // Update cart with available tours for each day
        if (this.isCartVisible) {
          console.log('Actualizando tours disponibles por día. Total tours:', this.tours.length);
          this.cartService.updateAvailableToursForDays(this.tours);
        } else if (this.checkIn && this.checkOut && this.tours.length > 0) {
          // Si hay fechas y tours pero el carrito no es visible, forzar inicialización
          console.log('Forzando inicialización del carrito desde searchToursList');
          this.cartService.initializeCart(this.checkIn, this.checkOut);
          this.isCartVisible = true;
          this.cartService.updateAvailableToursForDays(this.tours);
        }
      },
      error: (error: any) => {
        console.error('=== ERROR EN LA BÚSQUEDA ===');
        console.error('Error al buscar tours:', error);
        console.error('Detalles del error:', error.message);
        this.tours = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.currentPage = 1;
        this.loading = false;
      }
    });
  }

  // ==================== CART FUNCTIONALITY ====================

  /**
   * Maneja la selección de un día en el carrito
   */
  onDaySelected(dayDate: string): void {
    console.log('Día seleccionado:', dayDate);
    
    // Find tours available for this day
    const toursForDay = this.tours.filter(tour => {
      const tourDate = new Date(tour.schedule.scheduleDate).toISOString().split('T')[0];
      return tourDate === dayDate;
    });

    if (toursForDay.length === 0) {
      console.warn('No hay tours disponibles para el día seleccionado');
      return;
    }

    // If there's only one tour, open modal directly
    if (toursForDay.length === 1) {
      this.openSlotSelectionModal(toursForDay[0], dayDate);
      return;
    }

    // If multiple tours, you could show a tour selection step first
    // For now, let's open modal with the first tour as an example
    this.openSlotSelectionModal(toursForDay[0], dayDate);
  }

  /**
   * Abre el modal para seleccionar slot de un tour
   */
  openSlotSelectionModal(tour: SearchToursDto, dayDate: string): void {
    if (this.slotModal) {
      this.slotModal.openModal(tour, dayDate);
    } else {
      console.warn('Modal component not available');
    }
  }

  /**
   * Maneja cuando se agrega un tour al carrito
   */
  onTourAddedToCart(cartItem: CartItem): void {
    console.log('Tour agregado al carrito:', cartItem);
    console.log('Estado del carrito visible:', this.isCartVisible);
    
    // Asegurar que el carrito sea visible
    if (!this.isCartVisible && this.checkIn && this.checkOut) {
      console.log('Forzando visibilidad del carrito');
      this.isCartVisible = true;
    }
    
    // Forzar actualización de datos del carrito después de agregar
    setTimeout(() => {
      if (this.isCartVisible) {
        this.cartService.updateAvailableToursForDays(this.tours);
      }
      this.debugCartState();
    }, 100);
  }

  /**
   * Maneja el toggle del carrito
   */
  onCartToggled(isExpanded: boolean): void {
    console.log('Carrito toggled:', isExpanded);
  }

  /**
   * Maneja la limpieza del carrito
   */
  onCartCleared(): void {
    console.log('Carrito limpiado');
    // Aquí podríamos mostrar una notificación de confirmación
  }

  /**
   * Selecciona un tour específico (método auxiliar para integración futura)
   */
  selectTour(tour: SearchToursDto): void {
    const tourDate = new Date(tour.schedule.scheduleDate).toISOString().split('T')[0];
    this.openSlotSelectionModal(tour, tourDate);
  }

  /**
   * Maneja el cierre del modal
   */
  onModalClosed(): void {
    console.log('Modal cerrado');
    this.debugCartState();
  }

  /**
   * Debug para verificar el estado del carrito
   */
  private debugCartState(): void {
    console.log('=== DEBUG CART STATE ===');
    console.log('isCartVisible:', this.isCartVisible);
    console.log('checkIn:', this.checkIn);
    console.log('checkOut:', this.checkOut);
    console.log('daySelections:', this.daySelections);
    console.log('cartSummary:', this.cartSummary);
    console.log('tours length:', this.tours.length);
    console.log('=========================');
  }
} 