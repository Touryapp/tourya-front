import { AfterViewChecked, Component, OnDestroy, OnInit } from "@angular/core";
import { routes } from "../../../../shared/routes/routes";
import { ActivatedRoute, Router } from "@angular/router";
import { LightGallery } from "lightgallery/lightgallery";
import { LocationsPublicDto } from "../../../../shared/dto/locations-public.dto";
import { Gallery, TourDetail } from "../../../../shared/dto/tour-response.dto";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../../../../core/services/auth.service";
import { CartService } from "../../../../shared/services/cart.service";
import { CityService } from "../../../../shared/services/city.service";
import { SearchToursService } from "../../../clients/list-tours/search-tours.service";
import { I18nFieldService } from "../../../../shared/services/i18n-field.service";

@Component({
  selector: "app-tour-details-provider",
  standalone: false,
  templateUrl: "./tour-details.component.html",
  styleUrl: "./tour-details.component.scss",
})
export class TourDetailsProviderComponent implements OnInit, OnDestroy, AfterViewChecked {
  public routes = routes;
  
  // Date picker
  // Date pickers bound to template
  checkIn: Date =new Date();
  checkOut: Date=new Date();
  
  // Show more/less functionality
  isMore: boolean[] = [false, false, false, false, false, false, false, false];
  
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
    private route: ActivatedRoute,
    private searchService: SearchToursService,
    private cityService: CityService,
    public authService: AuthService,
    private cartService: CartService,
    private router: Router,
    public i18nService: I18nFieldService
  ) {}

  ngOnInit(): void {
    // Initialize component
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : 0;
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
    }
  }

  /**
   * Build a human readable location string using tour.locations[0] and the public locations catalog.
   */
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate([routes.tourPanelProvider]);
  }

  // ahora usamos `@angular/google-maps` para renderizar el mapa nativo y evitar parpadeos
} 