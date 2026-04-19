import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
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
import { ProviderReview } from '../../../shared/models/reviews.model';
import { PriceType } from '../../../shared/enums/price-type.enum';

@Component({
  selector: 'app-tours-detail',
  standalone: false,
  templateUrl: './tours-detail.component.html',
  styleUrl: './tours-detail.component.scss'
})
export class ToursDetailComponent implements OnInit, OnDestroy, AfterViewChecked {
  public routes = routes;
  public PriceType = PriceType;
  
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
    private snackBar: MatSnackBar
  ) {}

  // Reviews data
  reviews: ProviderReview[] = [];
  totalReviews: number = 0;
  reviewsLoading: boolean = false;
  
  // Admin rejection state
  isBackoffice: boolean = false;
  rejectingReviewId: string | null = null;
  selectedRejectionReason: string = '';
  rejectionReasons: string[] = [
    'Contenido inapropiado',
    'Información falsa o engañosa',
    'Spam o contenido irrelevante'
  ];

    // Check if user is admin
  ngOnInit(): void {
    // Check if user is admin
    this.isBackoffice = this.authService.isAdmin();

    // Initialize component
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : 0;

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
          // set map center from first location when available
          const loc = this.tour?.locations && this.tour.locations.length ? this.tour.locations[0] : undefined;
  
          if (loc && loc.latitude !== undefined && loc.longitude !== undefined) {
          // subscribe to cart items to control floating cart visibility
          this.cartService.cartItems$
            .pipe(takeUntil(this.destroy$))
            .subscribe((items) => {
              this.isCartVisible = !!(items && items.length > 0);
            });
            this.mapCenter = { lat: loc.latitude, lng: loc.longitude };
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
    }
  }

  /**
   * Load reviews for the current tour
   */
  loadReviews(tourId: number): void {
    this.reviewsLoading = true;
    this.reviewsService.getReviews({
      tourId: tourId.toString(),
      pageNumber: 0,
      pageSize: 10
    }).subscribe({
      next: (response) => {
        this.reviews = response.content;
        this.totalReviews = response.totalElements;
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

  getLocationDisplay(): string {
    const loc = this.tour?.locations && this.tour.locations.length ? this.tour.locations[0] : undefined;
    if (!loc) return '';

    // try to find city/state names from locationsPublic
    const found = this.locationsPublic.find(lp => lp.cityId === loc.cityId && lp.stateId === loc.stateId);
    const cityName = found ? found.cityName : undefined;
    const stateName = found ? found.stateName : undefined;

    const parts: string[] = [];
    if (loc.location) parts.push(this.i18nService.getValue(loc.location)); // friendly name of the location
    if (loc.address) parts.push(loc.address);
    if (cityName) parts.push(cityName);
    else if (loc.cityId) parts.push(String(loc.cityId));
    if (stateName) parts.push(stateName);
    else if (loc.stateId) parts.push(String(loc.stateId));

    return parts.filter(p => !!p).join(', ');
  }

  /**
   * Helper to map durationEnum keys to human-readable labels.
   */
  getDurationLabel(): string {
    if (!this.tour || !this.tour.durationEnum) return this.tour?.duration || '';

    const value = Array.isArray(this.tour.durationEnum) ? this.tour.durationEnum[0] : this.tour.durationEnum;

    const mapping: { [key: string]: string } = {
      '1_a_2_horas': '1 a 2 horas',
      '2_a_4_horas': 'de 2 a 4',
      '4_a_6_horas': 'de 4 a 6 horas',
      'hasta_1_dia': 'hasta 1 día',
      'hasta_3_dias': 'hasta 3 días',
      'hasta_5_dias': 'hasta 5 días'
    };

    return mapping[value] || value;
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
    return details.length > 0 ? details.join(', ') : 'No travellers';
  }

  /**
   * Helper to map priceType to human-readable labels.
   */
  getPriceTypeLabel(): string {
    if (!this.tour) return '';
    if (this.tour.priceType === PriceType.INDIVIDUAL) {
      return 'Por Persona';
    } else if (this.tour.priceType === PriceType.GROUP) {
      return `Grupo (hasta ${this.tour.maxPeople || 0} personas)`;
    }
    return this.tour.priceType || '';
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ahora usamos `@angular/google-maps` para renderizar el mapa nativo y evitar parpadeos
} 