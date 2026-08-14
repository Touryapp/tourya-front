import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
// usando @angular/google-maps para mapa nativo
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TourSlotSelectionModalComponent } from '../../../shared/common/tour-slot-selection-modal/tour-slot-selection-modal.component';
import { CartItem } from '../../../shared/dto/cart.dto';
import { ActivatedRoute } from '@angular/router';
import { SearchToursService } from '../list-tours/search-tours.service';
import { CityService } from '../../../shared/services/city.service';
import { CartService } from '../../../shared/services/cart.service';
import { Subject, takeUntil } from 'rxjs';
import { LocationsPublicDto } from '../../../shared/dto/locations-public.dto';
import { Tour, Gallery, TourDetail } from '../../../shared/dto/tour-response.dto';
import { routes } from "../../../shared/routes/routes";
import { LightGallery } from 'lightgallery/lightgallery';
import { I18nFieldService } from '../../../shared/services/i18n-field.service';
import { ReviewsService } from '../../../core/services/reviews.service';
import { ProviderReview, ReviewReason, ReviewReasonsResponse } from '../../../shared/models/reviews.model';
import { PriceType } from '../../../shared/enums/price-type.enum';
import { TouristService } from '../../../shared/services/tourist.service';

@Component({
  selector: 'app-tours-detail',
  standalone: false,
  templateUrl: './tours-detail.component.html',
  styleUrl: './tours-detail.component.scss'
})
export class ToursDetailComponent implements OnInit, OnDestroy, AfterViewChecked {
  public routes = routes;
  public PriceType = PriceType;
  public Math = Math;
  public starsAsc = [1, 2, 3, 4, 5];
  public starsDesc = [5, 4, 3, 2, 1];
  
  // Date picker bound to template
  public bsRangeValue: Date[] = [new Date(), new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)];
  minDate = new Date();

  onDateRangeChange(event: any): void {
    if (Array.isArray(event) && event.length === 2 && event[0] instanceof Date && event[1] instanceof Date) {
      this.bsRangeValue = event as Date[];
    }
  }
  
  // Show more/less functionality
  isMore: boolean[] = [false, false, false, false, false, false, false, false];

  // Travellers data
  public travellersData = {
    adults: 2,
    children: 0,
    infants: 0,
    cabinClass: 'Economy'
  };
  
  // Configuration for the main slider
  mainSliderConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: '.slider-nav'
   
  };
  
  // Configuration for the thumbnail slider
  thumbSliderConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    vertical: true,
    asNavFor: '.slider-for',
    dots: false,
    arrows: true,
    focusOnSelect: true,
    verticalSwiping: true,
    prevArrow: "<span class='slick-next'><i class='fa-solid fa-chevron-down'></i></span>",
    nextArrow: "<span class='slick-prev'><i class='fa-solid fa-chevron-up'></i></span>",
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 768,
        settings: {
            slidesToShow: 3,
        },
      },
      {
        breakpoint: 580,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 0,
        settings: {
          vertical: false,
          slidesToShow: 2,
        },
      },
    ],


  };

  // Gallery settings
  gallerySettings = {
    counter: false,
    plugins: [],
    onInit: (detail: { instance: LightGallery }): void => {
      this.lightGallery = detail.instance;
    }
  };

  // Lightbox settings
  settings = {
    counter: false,
    plugins: []
  };

  // Main slides data
  mainSlides: string[] = [
  ];

  // Thumbnail slides data
  thumbSlides: string[] = [
  ];

  // Gallery images
  images: { src: string }[] = [
    
  ];

  // Loaded tour
  tour!: TourDetail;

  // Google Maps center and zoom
  mapCenter?: google.maps.LatLngLiteral;
  mapZoom = 14;

  // Public locations (city/state names)
  locationsPublic: LocationsPublicDto[] = [];
  // Floating cart visibility
  isCartVisible: boolean = false;

  private destroy$ = new Subject<void>();
  private needRefresh = false;
  private lightGallery!: LightGallery;

  constructor(
    private fb: FormBuilder
    ,
    private route: ActivatedRoute,
    private searchService: SearchToursService,
    private cityService: CityService,
    public authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private cartService: CartService,
    public i18nService: I18nFieldService,
    private reviewsService: ReviewsService,
    private touristService: TouristService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private location: Location
  ) {}

  /**
   * TC-017 (#220): boton "Volver" en el detalle del tour.
   * Usa history.back cuando hay historial; cae al listado si el usuario
   * abrio la URL directo (sin history previa) o si es el primer entry.
   */
  public goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate([routes.listTours]);
    }
  }

  // Reviews data
  reviews: ProviderReview[] = [];
  totalReviews: number = 0;
  reviewsLoading: boolean = false;
  public selectedRating: number | null = null;
  
  // Admin rejection state
  isBackoffice: boolean = false;
  rejectingReviewId: string | null = null;
  selectedRejectionReason: string = '';
  rejectionReasons: string[] = [
    'rejectionReasons.inappropriate',
    'rejectionReasons.fake',
    'rejectionReasons.spam'
  ];

  // Review modal state
  public showReviewModal: boolean = false;
  public reviewRating: number = 0;
  public reviewComment: string = '';
  public reviewImages: File[] = [];
  public reviewSubmitting: boolean = false;
  public reviewError: string = '';

  // Review reasons catalog
  public reviewReasonsPositive: ReviewReason[] = [];
  public reviewReasonsNegative: ReviewReason[] = [];
  public reviewReasonsLoading: boolean = false;
  public selectedReasonId: number | null = null;
  public currentTourId: number = 0;
  public canWriteReview: boolean = false;

  // Computed: reasons based on rating
  public get activeReviewReasons(): ReviewReason[] {
    if (this.reviewRating >= 4) return this.reviewReasonsPositive;
    if (this.reviewRating >= 1) return this.reviewReasonsNegative;
    return [];
  }

  // Review summary data
  public reviewSummary: any;

  // Wishlist state
  public isInWishlist: boolean = false;

  // Pagination
  public currentPage: number = 1;
  public size: number = 5;
  public totalPages: number = 0;

    // Check if user is admin
  ngOnInit(): void {
    // Check if user is admin
    // FE-15b: ADMIN + BACKOFFICE_OPERATION (subset P2 — moderar reviews cae en "gestionar reportes").
    this.isBackoffice = this.authService.isTouryaBackoffice();

    // Initialize component
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : 0;
    this.currentTourId = id;

    // Load review reasons globally to display labels in the reviews list
    this.loadReviewReasons();

    // Check if the user can write a review for this tour
    this.checkIfCanReview();

    // Sync search criteria from home selection
    const traceJson = localStorage.getItem('userActionsTrace');
    if (traceJson) {
      try {
        const trace = JSON.parse(traceJson);
        if (trace.checkIn && trace.checkOut) {
          this.bsRangeValue = [
            new Date(trace.checkIn + 'T00:00:00'),
            new Date(trace.checkOut + 'T00:00:00')
          ];
        } else if (trace.checkIn) {
          this.bsRangeValue = [
            new Date(trace.checkIn + 'T00:00:00'),
            new Date(new Date(trace.checkIn + 'T00:00:00').getTime() + 3 * 24 * 60 * 60 * 1000)
          ];
        }
        
        if (trace.adults !== undefined) this.travellersData.adults = parseInt(trace.adults);
        if (trace.children !== undefined) this.travellersData.children = parseInt(trace.children);
        if (trace.infants !== undefined) this.travellersData.infants = parseInt(trace.infants);
      } catch (e) {
        console.warn('Could not parse userActionsTrace', e);
      }
    }

    if (id > 0) {
      this.searchService.detailTourPublic(id).subscribe({
        next: (data: TourDetail) => {
          this.tour = data;
          this.checkWishlistStatus();
          // Map galleries to sliders if available
          // Prefer `galleries` array, otherwise use `profilePicture` (single image)
          const galleries: Gallery[] | undefined = (this.tour as any).galleries && (this.tour as any).galleries.length ? (this.tour as any).galleries : (this.tour as any).profilePicture ? [(this.tour as any).profilePicture] : undefined;
          if (galleries && galleries.length > 0) {
            this.mainSlides = galleries.map(g => g.imageUrl || 'assets/img/tours/tours-07.jpg');
            this.thumbSlides = galleries.map(g => g.imageUrl || 'assets/img/tours/tours-07.jpg');
            this.images = galleries.map(g => ({ src: g.imageUrl || 'assets/img/tours/gallery-tour-lg-01.jpg' }));
            // Marcar que necesitamos refrescar lightgallery después del render
            this.needRefresh = true;
          }
          // set map center from first PHYSICAL location (skip Hotel Pickup) when available.
          // TC-017 (#220): antes usaba locations[0] sin filtrar, y si backend enviaba coords por defecto
          // para Hotel Pickup el mapa se pintaba con la ubicacion equivocada.
          const physicalLoc = this.tour?.locations?.find(
            l => l?.addressType !== 'Hotel Pickup' && l?.latitude !== undefined && l?.longitude !== undefined
          );

          if (physicalLoc) {
          // subscribe to cart items to control floating cart visibility
          this.cartService.cartItems$
            .pipe(takeUntil(this.destroy$))
            .subscribe((items) => {
              this.isCartVisible = !!(items && items.length > 0);
            });
            this.mapCenter = { lat: physicalLoc.latitude, lng: physicalLoc.longitude };
            this.mapZoom = 15;
          }
          // load public locations catalog (city/state names) once tour is loaded
          this.cityService.getLocationsPublic().subscribe({
            next: (list) => {
              this.locationsPublic = list || [];
            },
            error: (err) => {
              console.warn('Could not load locationsPublic', err);
            }
          });
        },
        error: (err) => {
          console.error('Error loading tour detail', err);
        }
      });

      // Load reviews
      this.loadReviews(id);

      // Load review summary
      this.loadReviewSummary(id);
    }
  }

  /**
   * Load review summary for the current tour
   */
  loadReviewSummary(tourId: number): void {
    this.reviewsService.getReviewSummary(tourId).subscribe({
      next: (summary) => {
        this.reviewSummary = summary;
        console.log('✅ Review summary loaded:', this.reviewSummary);
      },
      error: (error) => {
        console.error('❌ Error loading review summary:', error);
      }
    });
  }

  /**
   * Load reviews for the current tour
   */
  loadReviews(tourId: number): void {
    this.reviewsLoading = true;
    
    const params: any = {
      tourId: tourId.toString(),
      pageNumber: this.currentPage - 1,
      pageSize: this.size
    };
    
    if (this.selectedRating !== null) {
      params.rating = this.selectedRating;
    }

    this.reviewsService.getReviews(params).subscribe({
      next: (response) => {
        this.reviews = response.content;
        this.totalReviews = response.totalElements;
        this.totalPages = response.totalPages;
        this.reviewsLoading = false;
        console.log('✅ Reviews loaded:', this.reviews);
      },
      error: (error) => {
        console.error('❌ Error loading reviews:', error);
        this.reviewsLoading = false;
      }
    });
  }

  /**
   * Filter reviews by rating
   */
  filterByRating(rating: number): void {
    if (this.selectedRating === rating) {
      this.selectedRating = null;
    } else {
      this.selectedRating = rating;
    }
    this.currentPage = 1;
    this.loadReviews(this.currentTourId);
  }

  /**
   * Pagination helper methods
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

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
      this.loadReviews(this.currentTourId);
      // Scroll to reviews section
      const el = document.getElementById('reviews');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  /**
   * Opens/closes the rejection form for a specific review
   */
  toggleRejectForm(reviewId: string): void {
    if (this.rejectingReviewId === reviewId) {
      this.cancelReject();
    } else {
      this.rejectingReviewId = reviewId;
      this.selectedRejectionReason = '';
    }
  }

  /**
   * Cancels the rejection action
   */
  cancelReject(): void {
    this.rejectingReviewId = null;
    this.selectedRejectionReason = '';
  }

  /**
   * Submits the review rejection
   */
  submitReject(reviewId: string): void {
    if (!this.selectedRejectionReason) {
      this.snackBar.open('Please select a reason for rejection', 'Close', { duration: 3000 });
      return;
    }

    this.reviewsService.rejectReview(reviewId, this.selectedRejectionReason).subscribe({
      next: () => {
        this.snackBar.open('Review rejected successfully', 'Close', { duration: 3000 });
        this.cancelReject();
        // Reload reviews
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
          this.loadReviews(+idParam);
        }
      },
      error: (error) => {
        console.error('Error rejecting review:', error);
        this.snackBar.open('Error rejecting review', 'Close', { duration: 3000 });
      }
    });
  }

  private _cachedLocationParts: any[] | null = null;
  getLocationDisplayParts(): { isI18n: boolean, text: any }[] {
    if (this._cachedLocationParts) return this._cachedLocationParts;
    const loc = this.tour?.locations && this.tour.locations.length ? this.tour.locations[0] : undefined;
    if (!loc) return [];

    // TC-016 (#219): el backend ahora expone countryName/stateName/cityName
    // directo en TourAddressResponse. Se usa primero; si por compatibilidad
    // hacia atras vinieran null, se cae al catalogo locationsPublic.
    const anyLoc = loc as any;
    const found = this.locationsPublic.find(lp => lp.cityId === loc.cityId && lp.stateId === loc.stateId);
    const cityName = anyLoc.cityName ?? (found ? found.cityName : undefined);
    const stateName = anyLoc.stateName ?? (found ? found.stateName : undefined);
    const countryName = anyLoc.countryName ?? (found ? (found as any).countryName : undefined);

    const parts: { isI18n: boolean, text: any }[] = [];
    if (loc.location) parts.push({ isI18n: true, text: loc.location }); // friendly name of the location
    if (loc.address) parts.push({ isI18n: false, text: loc.address });
    if (cityName) parts.push({ isI18n: false, text: cityName });
    else if (loc.cityId) parts.push({ isI18n: false, text: String(loc.cityId) });
    if (stateName) parts.push({ isI18n: false, text: stateName });
    else if (loc.stateId) parts.push({ isI18n: false, text: String(loc.stateId) });
    // TC-016 (#219): agregar country que antes no se mostraba.
    if (countryName) parts.push({ isI18n: false, text: countryName });

    this._cachedLocationParts = parts;
    return parts;
  }

  /**
   * Helper to map durationEnum keys to human-readable labels.
   */
  getDurationLabel(): string {
    if (!this.tour || !this.tour.durationEnum) return this.tour?.duration || '';

    const value = Array.isArray(this.tour.durationEnum) ? this.tour.durationEnum[0] : this.tour.durationEnum;

    const mapping: { [key: string]: string } = {
      '1_a_2_horas': 'tour-form.fields.duration.options.1_2_hours',
      '2_a_4_horas': 'tour-form.fields.duration.options.2_4_hours',
      '4_a_6_horas': 'tour-form.fields.duration.options.4_6_hours',
      'hasta_1_dia': 'tour-form.fields.duration.options.up_to_1_day',
      'hasta_3_dias': 'tour-form.fields.duration.options.up_to_3_days',
      'hasta_5_dias': 'tour-form.fields.duration.options.up_to_5_days'
    };

    const key = mapping[value] || value;
    return this.translate.instant(key);
  }

  // Methods to update travellers data
  updateTravellersCount(type: 'adults' | 'children' | 'infants', count: number): void {
    this.travellersData[type] = Math.max(0, count);
    if (type === 'adults' && this.travellersData.adults < 1) {
      this.travellersData.adults = 1; // At least one adult required
    }
  }

  getTotalPersons(): number {
    return this.travellersData.adults + this.travellersData.children + this.travellersData.infants;
  }

  getTravellersDisplay(): string {
    const total = this.getTotalPersons();
    const persons = total === 1 ? this.translate.instant('tours-detail.booking.person') : this.translate.instant('tours-detail.booking.persons');
    return `${total} ${persons}`;
  }

  getTravellersDetails(): string {
    const details = [];
    if (this.travellersData.adults > 0) {
      const label = this.travellersData.adults === 1 ? this.translate.instant('shared.adult') : this.translate.instant('shared.adults');
      details.push(`${this.travellersData.adults} ${label}`);
    }
    if (this.travellersData.children > 0) {
      const label = this.travellersData.children === 1 ? this.translate.instant('shared.child') : this.translate.instant('shared.children');
      details.push(`${this.travellersData.children} ${label}`);
    }
    if (this.travellersData.infants > 0) {
      const label = this.travellersData.infants === 1 ? this.translate.instant('shared.infant') : this.translate.instant('shared.infants');
      details.push(`${this.travellersData.infants} ${label}`);
    }
    return details.length > 0 ? details.join(', ') : this.translate.instant('tours-detail.booking.noTravellers');
  }

  /**
   * TC-017 (#220): true cuando todas las ubicaciones del tour son "Hotel Pickup" (o no hay ninguna fisica).
   * Sirve para ocultar el <google-map> aun cuando el backend devuelva coords por defecto (ej. ciudad).
   */
  get isHotelPickup(): boolean {
    const locs = this.tour?.locations;
    if (!locs || locs.length === 0) return false;
    return locs.every(l => l?.addressType === 'Hotel Pickup');
  }

  /**
   * Helper to map priceType to human-readable labels.
   * TC-017 (#220): backend devuelve valores en minusculas ('grupo' / 'individual'),
   * normalizamos a mayusculas antes de comparar. Formato para grupo: "Grupo (N)" donde N = maxPeople.
   */
  getPriceTypeLabel(): string {
    if (!this.tour?.priceType) return '';
    const upper = this.tour.priceType.toUpperCase();
    if (upper === 'GROUP' || upper === 'GRUPO' || upper === 'PER_GROUP') {
      const label = this.translate.instant('tour.priceType.group');
      return `${label} (${this.tour.maxPeople || 0})`;
    }
    if (upper === 'INDIVIDUAL' || upper === 'PRIVATE' || upper === 'PER_PERSON') {
      return this.translate.instant('tour.priceType.individual');
    }
    return this.tour.priceType;
  }

  getImage(i: number): string {
    if (!this.images) return '';
    return this.images.length > i ? this.images[i].src : '';
  }

  showLess(index: number): void {
    this.isMore[index] = !this.isMore[index];
  }

  /**
   * Refresh lightgallery after view updates (when data loads dynamically)
   */
  ngAfterViewChecked(): void {
    if (this.needRefresh && this.lightGallery) {
      this.lightGallery.refresh();
      this.needRefresh = false;
    }
  }

  onBeforeSlide(): void {
    // Handle before slide event
  }

  /**
   * Smooth-scroll to the location section when user clicks the View Location link
   */
  scrollToLocation(event: Event): void {
    event.preventDefault();
    try {
      const el = document.getElementById('location');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (e) {
      // fallback to anchor behavior
      // allow default
    }
  }

  /**
   * Redirect user to login page preserving current URL to return after auth
   */
  goToLogin(): void {
    const returnUrl = this.router.url;
    this.router.navigate(["/login"], { queryParams: { returnUrl } });
  }

  /**
   * Abre el modal de selección de slots (mismo flujo que en list-tours)
   */
  onSubmit1(): void {
    if (!this.tour) return;

    // preparar objeto 'tour' simplificado para el modal
    const tourForModal: any = {
      tour: this.tour as any,
      schedules: this.tour ? (this.tour as any).schedules || [] : []
    };
    const checkInStr = this.bsRangeValue && this.bsRangeValue[0] ? this.bsRangeValue[0].toISOString().split('T')[0] : undefined;
    const checkOutStr = this.bsRangeValue && this.bsRangeValue[1] ? this.bsRangeValue[1].toISOString().split('T')[0] : undefined;
    if(checkInStr && checkOutStr) {
      this.cartService.initializeCart(checkInStr, checkOutStr);
    }
    
    const dialogRef = this.dialog.open(TourSlotSelectionModalComponent, {
      width: '600px',
      data: {
        tour: tourForModal,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        tourAdded: (cartItem: CartItem) => {
          // manejar post-add: podríamos mostrar un toast o actualizar el estado local
          console.log('Tour agregado desde detalle', cartItem);
        }
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Modal de slots cerrado');
    });
  }
  

  /**
   * Handler invoked by FloatingCart when user selects a day
   */
  onDaySelected(dayDate: string): void {
    // Open slot modal pre-selecting the date
    if (!this.tour) return;

    const tourForModal: any = {
      tour: this.tour as any,
      schedules: this.tour ? (this.tour as any).schedules || [] : []
    };

    const dialogRef = this.dialog.open(TourSlotSelectionModalComponent, {
      width: '600px',
      data: {
        tour: tourForModal,
        dayDate,
        checkIn: this.bsRangeValue && this.bsRangeValue[0] ? this.bsRangeValue[0].toISOString().split('T')[0] : undefined,
        checkOut: this.bsRangeValue && this.bsRangeValue[1] ? this.bsRangeValue[1].toISOString().split('T')[0] : undefined,
        tourAdded: (cartItem: CartItem) => {
          console.log('Tour agregado desde floating cart (detalle)', cartItem);
        }
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Modal de slots cerrado (desde floating cart)');
    });
  }

  onCartToggled(isExpanded: boolean): void {
    // optionally react to cart expanded/collapsed
    this.isCartVisible = isExpanded || this.isCartVisible;
  }

  onCartCleared(): void {
    this.cartService.clearCart();
  }

  /**
   * Carga el catálogo de motivos de reseña
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
      error: (err) => {
        console.error('❌ Error al cargar motivos de reseña:', err);
        this.reviewReasonsLoading = false;
      }
    });
  }

  /**
   * Obtiene el label de un motivo dado su tipo y ID
   */
  public getReasonLabel(reasonType: 'POSITIVE' | 'NEGATIVE' | string | undefined, reasonId: number | undefined): string {
    if (!reasonType || !reasonId) return '';
    if (reasonType === 'POSITIVE') {
      const reason = this.reviewReasonsPositive.find(r => r.id === reasonId);
      return reason ? reason.label : '';
    } else if (reasonType === 'NEGATIVE') {
      const reason = this.reviewReasonsNegative.find(r => r.id === reasonId);
      return reason ? reason.label : '';
    }
    return '';
  }

  /**
   * Verifica si el usuario tiene una reseña pendiente para este tour específico
   */
  private checkIfCanReview(): void {
    // Si no está autenticado, no puede reseñar (o se le pedirá login)
    // El usuario quiere que el botón SOLO salga si está en la lista de pendientes
    if (!this.authService.isAuthenticated()) {
      this.canWriteReview = false;
      return;
    }

    this.reviewsService.getPendingReviews().subscribe({
      next: (response) => {
        if (response && response.content) {
          // Verificar si algún pendiente coincide con el tourId actual
          this.canWriteReview = response.content.some(review => review.tourId === this.currentTourId);
          console.log('🔍 Can write review for tour', this.currentTourId, ':', this.canWriteReview);
        }
      },
      error: (err) => {
        console.error('❌ Error al verificar reseñas pendientes:', err);
        this.canWriteReview = false;
      }
    });
  }

  /**
   * Abre el modal de creación de reseña
   */
  public openReviewModal(): void {
    if (!this.authService.isAuthenticated()) {
      this.goToLogin();
      return;
    }
    
    // Cargar los motivos solo si no se han cargado previamente
    if (this.reviewReasonsPositive.length === 0 && this.reviewReasonsNegative.length === 0) {
      this.loadReviewReasons();
    }
    
    this.showReviewModal = true;
    this.reviewRating = 0;
    this.reviewComment = '';
    this.reviewImages = [];
    this.selectedReasonId = null;
    this.reviewError = '';
  }

  /**
   * Cierra el modal de reseña
   */
  public closeReviewModal(): void {
    this.showReviewModal = false;
    this.reviewRating = 0;
    this.reviewComment = '';
    this.reviewImages = [];
    this.selectedReasonId = null;
    this.reviewError = '';
  }

  /**
   * Establece el rating y resetea los motivos seleccionados
   */
  public setReviewRating(rating: number): void {
    this.reviewRating = rating;
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
  public onReviewImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.reviewImages = Array.from(input.files);
    }
  }

  /**
   * Envía la reseña al backend
   */
  public submitReview(): void {
    if (!this.reviewRating) {
      this.reviewError = 'Por favor selecciona una calificación.';
      return;
    }
    if (!this.reviewComment.trim()) {
      this.reviewError = 'Por favor escribe una reseña.';
      return;
    }

    this.reviewSubmitting = true;
    this.reviewError = '';

    const payload = {
      reservationId: this.currentTourId,
      rating: this.reviewRating,
      comment: this.reviewComment,
      ...(this.selectedReasonId !== null ? { reasonId: this.selectedReasonId } : {})
    };

    this.reviewsService.createReview(payload, this.reviewImages).subscribe({
      next: () => {
        this.reviewSubmitting = false;
        this.closeReviewModal();
        this.loadReviews(this.currentTourId);
        this.snackBar.open('¡Reseña enviada exitosamente!', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error al enviar reseña:', err);
        this.reviewSubmitting = false;
        this.reviewError = 'Error al enviar la reseña. Por favor inténtalo de nuevo.';
      }
    });
  }

  /**
   * Verifica si el tour actual está en la wishlist
   */
  private checkWishlistStatus(): void {
    if (this.authService.isAuthenticated() && this.currentTourId > 0) {
      this.touristService.getWishlistIds().subscribe({
        next: (response) => {
          this.isInWishlist = response.tourIds.includes(this.currentTourId);
          console.log('🔍 Wishlist status for tour', this.currentTourId, ':', this.isInWishlist);
        },
        error: (err) => console.error('❌ Error al verificar estado de wishlist:', err)
      });
    }
  }

  /**
   * Alterna el estado de wishlist del tour actual
   */
  public toggleWishlist(): void {
    if (!this.authService.isAuthenticated()) {
      this.goToLogin();
      return;
    }

    if (this.isInWishlist) {
      this.touristService.removeFromWishlist(this.currentTourId).subscribe({
        next: () => {
          this.isInWishlist = false;
          this.snackBar.open('Tour quitado de tu lista de deseos', 'Cerrar', { duration: 3000 });
        },
        error: (err) => console.error('❌ Error al quitar de wishlist:', err)
      });
    } else {
      this.touristService.addToWishlist(this.currentTourId).subscribe({
        next: () => {
          this.isInWishlist = true;
          this.snackBar.open('Tour agregado a tu lista de deseos', 'Cerrar', { duration: 3000 });
        },
        error: (err) => console.error('❌ Error al agregar a wishlist:', err)
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ahora usamos `@angular/google-maps` para renderizar el mapa nativo y evitar parpadeos
} 