import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { routes } from "../../../shared/routes/routes";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import {
  SearchTourListDto,
  TourScheduleResponseDto,
} from "../../../shared/dto/search-tour-response.dto";
import { environment } from "../../../../environments/environment";
import { PaginationDto } from "../../../shared/dto/pagination.dto";
import { SearchToursService } from "./search-tours.service";
import { CartService } from "../../../shared/services/cart.service";
import {
  CartItem,
  DaySelection,
  CartSummary,
} from "../../../shared/dto/cart.dto";
import { TourSlotSelectionModalComponent } from "../../../shared/common/tour-slot-selection-modal/tour-slot-selection-modal.component";
import { FloatingCartComponent } from "../../../shared/common/floating-cart/floating-cart.component";
import { Subject, takeUntil, filter, switchMap, of } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { PaymentService } from "../../../shared/services/payment.service";
import { CityService } from "../../../shared/services/city.service";
import { LocationsPublicDto } from "../../../shared/dto/locations-public.dto";
import { TagDto } from "../../../shared/dto/search-tour-response.dto";
import { CategoryDto } from "../../../shared/dto/category.dto";
import { PendingActionService } from "../../../shared/services/pending-action.service";
import { TouristService } from "../../../shared/services/tourist.service";
import { TranslateService } from "@ngx-translate/core";
import { I18nFieldService } from "../../../shared/services/i18n-field.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-list-tours",
  standalone: false,
  templateUrl: "./list-tours.component.html",
  styleUrl: "./list-tours.component.scss",
})
export class ListToursComponent implements OnInit, OnDestroy {
  @ViewChild(FloatingCartComponent) floatingCart!: FloatingCartComponent;
  public routes = routes;
  public Math = Math; // Para usar Math en el template

  // Cart functionality
  private destroy$ = new Subject<void>();
  isCartVisible: boolean = false;
  cartSummary: CartSummary | null = null;
  daySelections: DaySelection[] = [];

  // Date picker
  bsValue = new Date();
  minDate = new Date();

  // Slider values
  startValue = 200;
  endValue = 800;

  // Show more/less functionality
  isMore: boolean[] = [false, false, false, false, false, false, false, false];

  // Favorites functionality
  isSelected: boolean[] = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];
  isClassAdded: boolean[] = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  // Tour types data
  tourTypes = [
    {
      name: "Ecotourism",
      count: "216 Hotels",
      image: "assets/img/tours/tours-01.jpg",
    },
    {
      name: "Adventure Tour",
      count: "569 tours",
      image: "assets/img/tours/tours-02.jpg",
    },
    {
      name: "Group Tours",
      count: "129 tours",
      image: "assets/img/tours/tours-03.jpg",
    },
    {
      name: "Beach Tours",
      count: "600 tours",
      image: "assets/img/tours/tours-04.jpg",
    },
    {
      name: "Historical Tours",
      count: "200 tours",
      image: "assets/img/tours/tours-05.jpg",
    },
    {
      name: "Summer Trip",
      count: "200 tours",
      image: "assets/img/tours/tours-06.jpg",
    },
  ];

  // Tours data (ahora será llenado por la API)
  tours: TourScheduleResponseDto[] = [];
  loading: boolean = false;
  // Locations, tags, categories, age types
  public locationsPublic: LocationsPublicDto[] = [];
  public selectedLocation: LocationsPublicDto | null = null;
  public tags: TagDto[] = [];
  public categories: CategoryDto[] = [];
  public ageTypes: { name: string }[] = [];

  public selectedState: string = ""; // kept for URL param compatibility (stateId)
  selectedCity: string = "";
  
  public selectedTags: number[] = [];
  public selectedCategoryIds: number[] = [];
  public selectedSubCategories: string[] = [];
  public selectedSubCategoryIds: number[] = []; // Keep for internal filtering if needed
  public selectedSchedules: string[] = [];
  public selectedDurations: string[] = [];
  public isSubCategoriesAccordionOpen: boolean = false;

  public travellersData = {
    adults: 2,
    children: 0,
    infants: 0,
    cabinClass: 'Economy'
  };
  public checkIn: string = "";
  public checkOut: string = "";
  public bsRangeValue: Date[] = [new Date(), new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)];

  onDateRangeChange(event: any): void {
    if (Array.isArray(event) && event.length === 2 && event[0] instanceof Date && event[1] instanceof Date) {
      this.bsRangeValue = event as Date[];
      this.updateCheckInCheckOutRange();
    }
  }

  private updateCheckInCheckOutRange(): void {
    if (this.bsRangeValue && this.bsRangeValue.length === 2) {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      this.checkIn = formatDate(this.bsRangeValue[0]);
      this.checkOut = formatDate(this.bsRangeValue[1]);
    }
  }

  private syncUserActionsTrace(): void {
    const userActionsTrace = {
      city: this.selectedLocation?.cityId || this.selectedCity,
      adults: this.travellersData.adults,
      children: this.travellersData.children,
      infants: this.travellersData.infants,
      cabinClass: this.travellersData.cabinClass,
      checkIn: this.checkIn,
      checkOut: this.checkOut
    };
    localStorage.setItem('userActionsTrace', JSON.stringify(userActionsTrace));
  }

  public minPrice: number = 0;
  public maxPrice: number = 5000000;
  public language: string = 'es';

  get minPriceFormatted(): string {
    return this.minPrice !== null && this.minPrice !== undefined ? this.minPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '0';
  }

  set minPriceFormatted(value: string) {
    const numericValue = value.replace(/\./g, '');
    this.minPrice = numericValue ? parseInt(numericValue, 10) : 0;
    if (this.minPrice > this.maxPrice) {
      this.maxPrice = this.minPrice;
    }
  }

  get maxPriceFormatted(): string {
    return this.maxPrice !== null && this.maxPrice !== undefined ? this.maxPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '0';
  }

  set maxPriceFormatted(value: string) {
    const numericValue = value.replace(/\./g, '');
    this.maxPrice = numericValue ? parseInt(numericValue, 10) : 0;
    if (this.maxPrice < this.minPrice) {
      this.minPrice = this.maxPrice;
    }
  }

  public searchText: string = "";

  public durationOptions = [
    { value: '1_a_2_horas', label: 'filters.oneToTwoHours' },
    { value: '2_a_4_horas', label: 'filters.twoToFourHours' },
    { value: '4_a_6_horas', label: 'filters.fourToSixHours' },
    { value: 'hasta_1_dia', label: 'filters.upToOneDay' },
    { value: 'hasta_3_dias', label: 'filters.upToThreeDays' },
    { value: 'hasta_5_dias', label: 'filters.upToFiveDays' }
  ];

  public scheduleOptions = [
    { value: 'manana', label: 'filters.morning' },
    { value: 'tarde', label: 'filters.afternoon' },
    { value: 'noche', label: 'filters.eveningAndNight' }
  ];

  public ageTypeOptions = [
    { value: "ADULT", label: "Adulto" },
    { value: "CHILD", label: "Niño" },
    { value: "INFANT", label: "Infante" },
    { value: "SENIOR", label: "Senior" },
  ];

  public page: number = 1;
  public size: number = 10;
  public totalItems: number = 0;
  public totalPages: number = 0;
  public currentPage: number = 1;
  public viewMode: "grid" | "list" = "grid";
  public wishlistIds: number[] = [];
  public favoriteStates: boolean[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private readonly searchToursService: SearchToursService,
    private readonly cartService: CartService,
    private router: Router,
    public dialog: MatDialog,
    private paymentService: PaymentService,
    private cityService: CityService,
    private pendingActionService: PendingActionService,
    private touristService: TouristService,
    private translate: TranslateService,
    private i18nService: I18nFieldService
  ) {}

  ngOnInit(): void {
    console.log('🎬 ngOnInit - Iniciando componente list-tours');
    console.log('📦 ¿Hay acción pendiente al iniciar?', this.pendingActionService.hasPendingAction());
    
    this.initializeCartSubscriptions();
    // Ya no llamamos loadCartFromBackend aquí, el CartService lo maneja internamente
    // cuando se suscribe el componente

    // Cargar catálogos para filtros
    this.loadFiltersCatalogs();
    this.loadWishlistIds();

    this.route.queryParams.subscribe((params) => {
      console.log('� queryParams recibidos:', params);
      
      this.selectedCity = params["city"] || ""; // stateId desde Home
      this.travellersData = {
        adults: Number(params["adults"]) || 2,
        children: Number(params["children"]) || 0,
        infants: Number(params["infants"]) || 0,
        cabinClass: params["cabinClass"] || 'Economy'
      };
      this.checkIn = params["checkIn"] || "";
      this.checkOut = params["checkOut"] || "";
      
      const subCategoryParam = params["subCategory"];
      if (subCategoryParam) {
        this.selectedSubCategories = [subCategoryParam];
        this.isSubCategoriesAccordionOpen = true;
      } else {
        this.selectedSubCategories = [];
        this.isSubCategoriesAccordionOpen = false;
      }
      
      if (this.checkIn && this.checkOut) {
        this.bsRangeValue = [new Date(`${this.checkIn}T00:00:00`), new Date(`${this.checkOut}T00:00:00`)];
      }

      // Initialize cart with dates if available
      if (this.checkIn && this.checkOut) {
        this.cartService.initializeCart(this.checkIn, this.checkOut);
      }

      // IMPORTANTE: Si venimos de un reagendamiento con cobro, abrir carrito automáticamente
      if (params["action"] === "pay-reschedule") {
        console.log("💰 Reagendamiento requiere pago - Abriendo carrito automáticamente");
        this.isCartVisible = true;
        
        // Forzar recarga desde el backend porque la reserva fue modificada
        this.cartService.reloadCartFromBackend().then(() => {
          console.log("✅ Carrito recargado para el pago del reagendamiento");
        }).catch(err => {
          console.error("❌ Error recargando carrito para el reagendamiento", err);
        });

        // Esperamos un tick para que Angular renderice el componente hijo (ngIf=isVisible)
        // y luego llamamos a su método interno para expandirlo visualmente
        setTimeout(() => {
          if (this.floatingCart) {
            this.floatingCart.openCart();
          }
        }, 100);
      }

      // IMPORTANTE: Verificar si hay acción pendiente ANTES de buscar
      const hasPendingAction = this.pendingActionService.hasPendingAction();
      console.log('🔍 queryParams subscribe - ¿Hay acción pendiente?', hasPendingAction);
      
      if (hasPendingAction) {
        const pendingAction = this.pendingActionService.getPendingCartAction();
        console.log(' Datos de la acción pendiente:', pendingAction);
      }
      
      // Si recibimos stateId, preseleccionamos una ciudad de ese estado una vez cargadas las locations
      if (this.selectedCity) {
        const cityIdNum = Number(this.selectedCity);
        const trySelect = () => {
          if (this.locationsPublic && this.locationsPublic.length) {
            const loc = this.locationsPublic.find(l => l.cityId === cityIdNum);
            if (loc) this.selectedLocation = loc;
            console.log('🔍 Ejecutando búsqueda con ciudad seleccionada...');
            this.searchToursList();
          } else {
            // Si aún no cargan, reintentar en el próximo tick mínimo
            setTimeout(trySelect, 0);
          }
        };
        trySelect();
      } else {
        // Siempre ejecutar la búsqueda, especialmente si hay acción pendiente
        console.log('🔍 Ejecutando búsqueda inicial de tours...');
        this.searchToursList();
        
        // FALLBACK: Si después de 3 segundos la búsqueda no ha terminado
        // pero hay acción pendiente, intentar procesarla de todas formas
        if (hasPendingAction) {
          setTimeout(() => {
            console.log('⏰ TIMEOUT: 3 segundos después de iniciar búsqueda...');
            console.log('⏰ ¿Ya se procesó la acción pendiente?', !this.pendingActionService.hasPendingAction());
            
            if (this.pendingActionService.hasPendingAction()) {
              console.warn('⚠️ La búsqueda de tours no terminó, pero forzando procesamiento de acción pendiente...');
              this.checkForPendingAction();
            }
          }, 3000);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFiltersCatalogs(): void {
    // Ciudades/Estados
    this.cityService.getLocationsPublic().subscribe({
      next: (data) => {
        this.locationsPublic = data;
      },
      error: (err) => console.error('Error cargando locationsPublic', err)
    });
    // Tags
    this.searchToursService.tagPublic().subscribe({
      next: (data) => this.tags = data,
      error: (err) => console.error('Error cargando tags', err)
    });
    // Categorías
    this.searchToursService.categoriesPublic().subscribe({
      next: (data: any[]) => {
        this.categories = data;

        const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
        const currentTranslations: any = {};

        data.forEach(c => {
          if (c.name && c.name.es) {
            const normalized = c.name.es.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
            const key = `categories.${normalized}`;
            currentTranslations[key] = c.name[currentLang] || c.name.es;
          }
          if (c.subCategories) {
            c.subCategories.forEach((s: any) => {
              if (s.name && s.name.es) {
                const normSub = s.name.es.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
                const subKey = `subcategories.${normSub}`;
                currentTranslations[subKey] = s.name[currentLang] || s.name.es;
              }
            });
          }
        });

        this.translate.setTranslation(currentLang, currentTranslations, true);
      },
      error: (err) => console.error('Error cargando categorías', err)
    });
    // Tipos de edad
    this.searchToursService.ageTypesPublic().subscribe({
      next: (data) => this.ageTypes = data,
      error: (err) => console.error('Error cargando tipos de edad', err)
    });
  }

  private initializeCartSubscriptions(): void {
    console.log('🔔 ListTours: Inicializando suscripciones del carrito');
    
    // Subscribe to cart summary
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe((summary) => {
        this.cartSummary = summary;
        console.log('📊 ListTours: CartSummary actualizado', summary);
      });

    // Subscribe to day selections
    this.cartService.daySelections$
      .pipe(takeUntil(this.destroy$))
      .subscribe((days) => {
        this.daySelections = days;
      });

    // Subscribe to cart items - cargar del backend siempre al iniciar para sincronizar
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => {
        console.log('🛒 ListTours: CartItems actualizado', items.length, 'items');
        this.isCartVisible = items.length > 0;
      });

    // Force change detection when language changes to ensure categories AND tours update
    this.translate.onLangChange
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({ lang }) => {
          console.log('🌍 ListTours: Translation store changed for lang', lang, '- re-injecting dynamic translations and cloning objects');

          // Re-inject dynamic category translations.
          // When translate.use(lang) loads a JSON file it REPLACES the entire store for that lang,
          // wiping any translations we previously added via setTranslation. We must re-merge them.
          if (this.categories && this.categories.length > 0) {
            const dynamicTranslations: any = {};
            this.categories.forEach((c: any) => {
              if (c.name?.es) {
                const normalized = c.name.es.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
                dynamicTranslations[`categories.${normalized}`] = c.name[lang] || c.name.es;
              }
              if (c.subCategories) {
                c.subCategories.forEach((s: any) => {
                  if (s.name?.es) {
                    const normSub = s.name.es.toLowerCase()
                      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
                    dynamicTranslations[`subcategories.${normSub}`] = s.name[lang] || s.name.es;
                  }
                });
              }
            });
            this.translate.setTranslation(lang, dynamicTranslations, true); // merge, don't overwrite
          }


          
          return of(lang);
        })
      )
      .subscribe();

    // Forzar carga desde el backend al iniciar la pantalla
    this.cartService.loadCartFromBackend(true).catch(err => {
      console.error('❌ ListTours: Error cargando carrito desde backend', err);
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
    this.favoriteStates[index] = this.isClassAdded[index];
    
    // Si se acaba de seleccionar (corazón relleno), agregar a wishlist
    if (this.isClassAdded[index]) {
      const tourId = this.tours[index].tour.id;
      this.touristService.addToWishlist(tourId).subscribe({
        next: (response) => {
          console.log('✅ Tour agregado a wishlist:', tourId);
          if (!this.wishlistIds.includes(tourId)) {
            this.wishlistIds.push(tourId);
          }
        },
        error: (error) => {
          console.error('❌ Error al agregar a wishlist:', error);
        }
      });
    } else {
      // Si se acaba de deseleccionar (corazón vacío), quitar de wishlist
      const tourId = this.tours[index].tour.id;
      this.touristService.removeFromWishlist(tourId).subscribe({
        next: (response) => {
          console.log('🗑️ Tour quitado de wishlist:', tourId);
          this.wishlistIds = this.wishlistIds.filter(id => id !== tourId);
        },
        error: (error) => {
          console.error('❌ Error al quitar de wishlist:', error);
        }
      });
    }
  }

  loadWishlistIds(): void {
    this.touristService.getWishlistIds().subscribe({
      next: (response) => {
        this.wishlistIds = response.tourIds || [];
        this.updateFavoriteStates();
      },
      error: (error) => {
        console.error('❌ Error al cargar IDs de wishlist:', error);
      }
    });
  }

  updateFavoriteStates(): void {
    if (!this.tours || this.tours.length === 0) {
      this.favoriteStates = [];
      this.isClassAdded = [];
      return;
    }
    this.favoriteStates = this.tours.map(tour => 
      this.wishlistIds.includes(tour.tour.id)
    );
    this.isClassAdded = [...this.favoriteStates];
  }

  // Slider label formatter
  formatLabel1(value: number): string {
    return `$${value}`;
  }

  // View tour details
  viewTourDetails(tourId: number): void {
    console.log("Ver detalles del tour:", tourId);
    // Navigate to tour details
  }

  // Book tour
  bookTour(tourId: number): void {
    console.log("Reservar tour:", tourId);
    // Navigate to booking page
  }

  // Search functionality
  searchTours(): void {
    console.log("Buscando tours...");
    // Implement search logic
  }

  // Filter functionality
  applyFilters(): void {
    console.log("Aplicando filtros...");
    // Implement filter logic
  }

  // Reset filters
  resetFilters(): void {
    console.log("Reseteando filtros...");
    this.selectedCity = "";
    this.selectedLocation = null;
    this.selectedTags = [];
    this.selectedCategoryIds = [];
    this.selectedSubCategories = [];
    this.selectedSubCategoryIds = [];
    this.selectedSchedules = [];
    this.selectedDurations = [];
    this.travellersData = {
      adults: 2,
      children: 0,
      infants: 0,
      cabinClass: 'Economy'
    };
    this.checkIn = "";
    this.checkOut = "";
    this.minPrice = 0;
    this.maxPrice = 5000000;
    this.searchText = "";
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
  setViewMode(mode: "grid" | "list"): void {
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
    console.log("=== BÚSQUEDA PRINCIPAL ===");
    console.log("Estado seleccionado:", this.selectedCity);
    console.log("Datos de viajeros:", this.travellersData);
    console.log("Fecha de entrada:", this.checkIn);
    console.log("Fecha de salida:", this.checkOut);

    this.syncUserActionsTrace();

    // Inicializar el carrito si hay fechas válidas
    if (this.checkIn && this.checkOut) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          city: this.selectedLocation?.cityId || this.selectedCity || undefined,
          adults: this.travellersData.adults,
          children: this.travellersData.children,
          infants: this.travellersData.infants,
          cabinClass: this.travellersData.cabinClass,
          checkIn: this.checkIn,
          checkOut: this.checkOut
        },
        queryParamsHandling: 'merge'
      });
      console.log("Inicializando carrito desde búsqueda principal");
      this.cartService.initializeCart(this.checkIn, this.checkOut);
    }

    this.currentPage = 1;
    this.page = 1;
    this.searchToursList();
  }

  // Método para búsqueda desde filtros del sidebar
  onSearchFromFilters(): void {
    console.log("=== BÚSQUEDA DESDE FILTROS ===");
    console.log("Estado seleccionado:", this.selectedCity);
    console.log("Datos de viajeros:", this.travellersData);
    console.log("Fecha de entrada:", this.checkIn);
    console.log("Fecha de salida:", this.checkOut);
    console.log("Categorias:", this.selectedCategoryIds);
    console.log("SubCategorias:", this.selectedSubCategoryIds);
    console.log("Tags:", this.selectedTags);
    console.log("Horarios:", this.selectedSchedules);
    console.log("Duraciones:", this.selectedDurations);
    console.log("Precio mínimo:", this.minPrice);
    console.log("Precio máximo:", this.maxPrice);
    console.log("Texto de búsqueda:", this.searchText);

    this.syncUserActionsTrace();

    //setear el checkin y checkout en el carrito
    this.cartService.initializeCart(this.checkIn, this.checkOut);
    // Resetear a la primera página
    this.currentPage = 1;
    this.page = 1;

    // Ejecutar búsqueda con todos los filtros
    this.searchToursList();
  }

  // Métodos para manejar cambios en los sliders de precio
  onMinPriceChange(event: any): void {
    const value = Number(event.target.value);
    this.minPrice = value;

    // Asegurar que el precio mínimo no sea mayor que el máximo
    if (this.minPrice > this.maxPrice) {
      this.maxPrice = this.minPrice;
    }

    console.log("Precio mínimo actualizado:", this.minPrice);
  }

  onMaxPriceChange(event: any): void {
    const value = Number(event.target.value);
    this.maxPrice = value;

    // Asegurar que el precio máximo no sea menor que el mínimo
    if (this.maxPrice < this.minPrice) {
      this.minPrice = this.maxPrice;
    }

    console.log("Precio máximo actualizado:", this.maxPrice);
  }

  // Methods to update travellers data
  updateTravellersCount(type: 'adults' | 'children' | 'infants', count: number): void {
    this.travellersData[type] = Math.max(0, count);
    if (type === 'adults' && this.travellersData.adults < 1) {
      this.travellersData.adults = 1; // At least one adult required
    }
    this.syncUserActionsTrace();
  }

  updateCabinClass(cabinClass: string): void {
    this.travellersData.cabinClass = cabinClass;
  }

  getTotalPersons(): number {
    return this.travellersData.adults + this.travellersData.children + this.travellersData.infants;
  }

  getTravellersDisplay(): string {
    const total = this.getTotalPersons();
    const persons = total === 1 ? 'Person' : 'Persons';
    return `${total} ${persons}`;
  }

  getTravellersDetails(): string {
    const details = [];
    if (this.travellersData.adults > 0) {
      details.push(`${this.travellersData.adults} Adult${this.travellersData.adults > 1 ? 's' : ''}`);
    }
    if (this.travellersData.children > 0) {
      details.push(`${this.travellersData.children} Child${this.travellersData.children > 1 ? 'ren' : ''}`);
    }
    if (this.travellersData.infants > 0) {
      details.push(`${this.travellersData.infants} Infant${this.travellersData.infants > 1 ? 's' : ''}`);
    }
    return `${details.join(', ')}, ${this.travellersData.cabinClass}`;
  }

  public get filteredSubCategories(): any[] {
    if (this.selectedCategoryIds.length === 0) {
      if (!this.categories) return [];
      return this.categories.reduce((acc: any[], cat: any) => acc.concat(cat.subCategories || []), []);
    } else {
      return this.categories
        .filter((cat: any) => this.selectedCategoryIds.includes(cat.id))
        .reduce((acc: any[], cat: any) => acc.concat(cat.subCategories || []), []);
    }
  }

  toggleSubCategory(s: any): void {
    const value = s.code || s.name;
    const indexStr = this.selectedSubCategories.indexOf(value);
    if (indexStr > -1) {
      this.selectedSubCategories.splice(indexStr, 1);
      this.selectedSubCategoryIds = this.selectedSubCategoryIds.filter(id => id !== s.id);
    } else {
      this.selectedSubCategories.push(value);
      this.selectedSubCategoryIds.push(s.id);
    }
  }

  toggleSelection(array: any[], value: any): void {
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(value);
    }
    
    if (array === this.selectedCategoryIds) {
      const validSubCatIds = this.filteredSubCategories.map((s: any) => s.id);
      this.selectedSubCategoryIds = this.selectedSubCategoryIds.filter(id => validSubCatIds.includes(id));
    }
  }

  searchToursList(): void {
    this.loading = true;

    const userActionsTrace = {
      city: this.selectedCity,
      adults: this.travellersData.adults,
      children: this.travellersData.children,
      infants: this.travellersData.infants,
      cabinClass: this.travellersData.cabinClass,
      checkIn: this.checkIn,
      checkOut: this.checkOut
    };
    localStorage.setItem('userActionsTrace', JSON.stringify(userActionsTrace));

    // Construir objeto de búsqueda con todos los filtros según el backend
    const searchData: SearchTourListDto = {
      startDate: this.checkIn || undefined,
      endDate: this.checkOut || undefined,
      categoryIds: this.selectedCategoryIds.length ? this.selectedCategoryIds : undefined,
      subCategories: this.selectedSubCategories.length ? this.selectedSubCategories : undefined,
      tagIds: this.selectedTags.length ? this.selectedTags : undefined,
      timeOfDay: this.selectedSchedules.length ? this.selectedSchedules : undefined,
      durationEnums: this.selectedDurations.length ? this.selectedDurations : undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      textSearch: this.searchText || undefined,
      language: this.language
    };

    console.log("=== DATOS ENVIADOS A LA API ===");
    console.log("Objeto completo de búsqueda:", searchData);
    console.log("URL de la petición:", `${this.searchToursService["baseUrl"]}/search?page=${this.currentPage-1}&size=${this.size}`);

    this.searchToursService.searchTours(searchData, this.currentPage, this.size).subscribe({
      next: (response: PaginationDto<TourScheduleResponseDto>) => {
        console.log("=== RESPUESTA DE LA API ===");
        console.log("Respuesta completa de searchTours:", response);

        if (response && response.content) {
          this.tours = response.content || [];
          this.totalItems = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.currentPage = response.number + 1;
          this.updateFavoriteStates();
        }

        console.log("=== RESULTADOS PROCESADOS ===");
        console.log("Cantidad de resultados:", this.tours.length);
        console.log("Total de elementos:", this.totalItems);
        console.log("Total de páginas:", this.totalPages);
        console.log("Página actual:", this.currentPage);

        this.loading = false;

        // Update cart with available tours for each day
        if (this.isCartVisible) {
          console.log(
            "Actualizando tours disponibles por día. Total tours:",
            this.tours.length
          );
          this.cartService.updateAvailableToursForDays(this.tours);
        } else if (this.checkIn && this.checkOut && this.tours.length > 0) {
          // Si hay fechas y tours pero el carrito no es visible, forzar inicialización
          console.log(
            "Forzando inicialización del carrito desde searchToursList"
          );
          this.cartService.initializeCart(this.checkIn, this.checkOut);
          this.cartService.updateAvailableToursForDays(this.tours);
        }

        // Verificar acción pendiente DESPUÉS de cargar los tours
        console.log('🎯 searchToursList completado, llamando a checkForPendingAction()...');
        this.checkForPendingAction();
      },
      error: (error: any) => {
        console.error("=== ERROR EN LA BÚSQUEDA ===");
        console.error("Error al buscar tours:", error);
        console.error("Status:", error.status);
        console.error("Detalles del error:", error.message);
        console.error("Error completo:", error);
        this.tours = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.currentPage = 1;
        this.loading = false;
        
        // IMPORTANTE: Si hay acción pendiente, intentar ejecutarla de todas formas
        // por si los tours ya están cargados de antes
        if (this.pendingActionService.hasPendingAction() && this.tours.length > 0) {
          console.warn('⚠️ Error en búsqueda pero hay tours previos, intentando procesar acción pendiente...');
          this.checkForPendingAction();
        }
      },
    });
  }

  private computeDurationHours(option: string): number | undefined {
    if (!option) return undefined;
    const [unit, valStr] = option.split(":");
    const val = Number(valStr);
    if (!val || val < 0) return undefined;
    if (unit === 'DAYS') return val * 24;
    if (unit === 'WEEKS') return val * 7 * 24;
    return undefined;
  }

  // ==================== CART FUNCTIONALITY ====================

  /**
   * Maneja la selección de un día en el carrito
   */
  onDaySelected(dayDate: string): void {
    console.log("Día seleccionado:", dayDate);

    // Find tours available for this day
    const toursForDay = this.tours.filter((tour) => {
      const tourDate = new Date(tour.schedules[0].scheduleDate)
        .toISOString()
        .split("T")[0];
      return tourDate === dayDate;
    });

    if (toursForDay.length === 0) {
      console.warn("No hay tours disponibles para el día seleccionado");
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
  openSlotSelectionModal(
    tour: TourScheduleResponseDto,
    dayDate?: string
  ): void {
    const dialogRef = this.dialog.open(TourSlotSelectionModalComponent, {
      width: "600px",
      data: {
        tour,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        travellersData: { ...this.travellersData }, // Pass search parameters
        tourAdded: this.onTourAddedToCart.bind(this),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("Modal cerrado");
      this.debugCartState();
    });
  }

  /**
   * Maneja cuando se agrega un tour al carrito
   */
  onTourAddedToCart(cartItem: CartItem): void {
    console.log("Tour agregado al carrito:", cartItem);
    console.log("Estado del carrito visible:", this.isCartVisible);

    // Asegurar que el carrito sea visible
    if (!this.isCartVisible && this.checkIn && this.checkOut) {
      console.log("Forzando visibilidad del carrito");
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
    console.log("Carrito toggled:", isExpanded);
  }

  /**
   * Maneja la limpieza del carrito
   */
  onCartCleared(): void {
    console.log("Carrito limpiado");
    // Aquí podríamos mostrar una notificación de confirmación
  }

  /**
   * Selecciona un tour específico (método auxiliar para integración futura)
   */
  selectTour(tour: TourScheduleResponseDto): void {
    // const tourDate = new Date(tour?.schedules?.at(0)?.scheduleDate || "")
    //   .toISOString()
    //   .split("T")[0];
    this.openSlotSelectionModal(tour);
  }

  /**
   * Maneja el cierre del modal
   */
  onModalClosed(): void {
    console.log("Modal cerrado");
    this.debugCartState();
  }

  /**
   * Debug para verificar el estado del carrito
   */
  private debugCartState(): void {
    console.log("=== DEBUG CART STATE ===");
    console.log("isCartVisible:", this.isCartVisible);
    console.log("checkIn:", this.checkIn);
    console.log("checkOut:", this.checkOut);
    console.log("daySelections:", this.daySelections);
    console.log("cartSummary:", this.cartSummary);
    console.log("tours length:", this.tours.length);
    console.log("=========================");
  }

  /**
   * DEPRECATED: Ya no se usa - el CartService maneja la carga automáticamente
   * Carga el carrito desde el backend al iniciar el componente
   */
  private async loadCartFromBackend_DEPRECATED(): Promise<void> {
    try {
      console.log('🛒 Cargando carrito desde el backend...');
      
      const cartResponse = await this.paymentService.getUserShoppingCart();
      
      if (cartResponse && cartResponse.items && cartResponse.items.length > 0) {
        console.log('✅ Carrito cargado desde backend:', cartResponse);
        
        // Limpiar el carrito local antes de cargar desde el backend para evitar duplicados
        this.cartService.clearCart();
        
        // Convertir los items del backend y agregarlos al carrito SOLO LOCALMENTE
        for (const backendItem of cartResponse.items) {
          // Extraer cantidades de adultos y niños desde details
          let adults = 0;
          let children = 0;
          
          if (backendItem.details && backendItem.details.length > 0) {
            backendItem.details.forEach((detail: any) => {
              const ageType = detail.ageType.name.toUpperCase();
              if (ageType === 'ADULT') {
                adults = detail.quantity;
              } else if (ageType === 'CHILD') {
                children = detail.quantity;
              }
            });
          }
          
          // Cargar el item directamente al carrito usando addTourToCart
          this.cartService.addTourToCart(
            backendItem.productId,           // productId
            backendItem.scheduleDate,        // scheduleDate
            backendItem.tourScheduleId,      // tourScheduleId
            backendItem.slotId || 0,         // slotId
            adults,                          // adults
            children                         // children
          );
        }
        
        console.log('✅ Items del backend cargados al FloatingCart (solo local)');
      } else {
        console.log('ℹ️ No hay items en el carrito del backend');
      }
    } catch (error) {
      console.error('❌ Error al cargar carrito desde backend:', error);
    }
  }

  /**
   * Verifica si hay una acción pendiente y agrega el tour al carrito automáticamente
   */
  private checkForPendingAction(): void {
    console.log('🔎 checkForPendingAction() llamado');
    console.log('🔎 Tours disponibles:', this.tours.length);
    console.log('🔎 hasPendingAction:', this.pendingActionService.hasPendingAction());
    
    if (!this.pendingActionService.hasPendingAction()) {
      console.log('ℹ️ No hay acción pendiente en list-tours');
      return;
    }

    const pendingAction = this.pendingActionService.getPendingCartAction();
    console.log('🎯 Acción pendiente detectada en list-tours:', pendingAction);
    console.log('🎯 Contenido de sessionStorage:', sessionStorage.getItem('pendingCartAction'));

    if (!pendingAction) {
      console.warn('⚠️ hasPendingAction() devolvió true pero getPendingCartAction() devolvió null');
      return;
    }

    // Pequeño delay para asegurar que la UI esté lista
    setTimeout(async () => {
      console.log('🔍 Procesando acción pendiente...');
      console.log('📦 Datos:', {
        tourId: pendingAction.tourId,
        dayId: pendingAction.dayId,
        slotId: pendingAction.slotId,
        selectedDate: pendingAction.selectedDate,
        participants: pendingAction.participants
      });
      console.log('📋 Tours cargados:', this.tours.length);
      
      try {
        // Buscar el tour en la lista actual SOLO para mostrar el nombre en el mensaje
        // Pero intentaremos agregar al carrito de todas formas
        const tour = this.tours.find((t: TourScheduleResponseDto) => t.tour.id === pendingAction.tourId);
      
        if (!tour && this.tours.length > 0) {
          console.warn('⚠️ No se encontró el tour con ID:', pendingAction.tourId);
          console.warn('📋 IDs de tours disponibles:', this.tours.map(t => t.tour.id));
          console.warn('⚠️ Intentando agregar al carrito de todas formas...');
        } else if (tour) {
          console.log('✅ Tour encontrado:', tour.tour.name);
        } else {
          console.warn('⚠️ No hay tours cargados todavía, pero intentando agregar al carrito...');
        }
        
        // Calcular adultos y niños de los participantes
        console.log('📦 Estructura de participantes:', pendingAction.participants);
        
        // Los participantes tienen ageType (string) y quantity (number)
        let adults = 0;
        let children = 0;
        
        pendingAction.participants.forEach((p: any) => {
          if (p.ageType === 'ADULT') {
            adults += p.quantity || 0;
          } else if (p.ageType === 'CHILD') {
            children += p.quantity || 0;
          }
        });

        console.log('👥 Participantes calculados - Adultos:', adults, 'Niños:', children);

        // Agregar al carrito usando el servicio
        const dayDate = new Date(pendingAction.selectedDate);
        const dayDateFormatted = dayDate.toISOString().split('T')[0];
        
        console.log('🚀 Llamando a addTourToCart con:', {
          productId: pendingAction.tourId,
          scheduleDate: dayDateFormatted,
          tourScheduleId: pendingAction.dayId,
          slotId: pendingAction.slotId,
          adults,
          children
        });
        
        await this.cartService.addTourToCart(
          pendingAction.tourId,       // productId
          dayDateFormatted,           // scheduleDate (YYYY-MM-DD)
          pendingAction.dayId,        // tourScheduleId
          pendingAction.slotId,       // slotId
          adults,                     // adults
          children                    // children
        );

        console.log('✅ Tour agregado al carrito exitosamente desde acción pendiente');

        // Limpiar acción pendiente
        this.pendingActionService.clearPendingAction();
        console.log('🧹 Acción pendiente limpiada del sessionStorage');

        // Mostrar mensaje de bienvenida
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('listTours.welcomeBack'),
          text: tour ? this.translate.instant('listTours.tourAdded', { tourName: this.i18nService.getValue(tour.tour.name) }) : this.translate.instant('listTours.tourAddedGeneric'),
          confirmButtonText: this.translate.instant('listTours.viewCart'),
          showCancelButton: true,
          cancelButtonText: this.translate.instant('listTours.continueShopping')
        }).then((result) => {
          if (result.isConfirmed) {
            // Aquí podrías navegar a la página del carrito si existe
            console.log('Usuario quiere ver el carrito');
          }
        });

      } catch (error) {
        console.error('❌ Error al procesar acción pendiente:', error);
        this.pendingActionService.clearPendingAction();
        
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('listTours.errorTitle'),
          text: this.translate.instant('listTours.errorAddTour'),
          confirmButtonText: this.translate.instant('listTours.understood')
        });
      }
    }, 500); // Pequeño delay para asegurar que la UI esté lista
  }
}