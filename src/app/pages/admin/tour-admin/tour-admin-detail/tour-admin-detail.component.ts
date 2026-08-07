import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourAdminService } from '../../../../shared/services/tour-admin.service';
import { TourAdminDto, TourCategoryDto, ProviderDto } from '../../../../shared/dto/tour-admin.dto';
import { CityService } from '../../../../shared/services/city.service';
import { LocationsPublicDto } from '../../../../shared/dto/locations-public.dto';
import { LightGallery } from 'lightgallery/lightgallery';
import lgZoom from 'lightgallery/plugins/zoom';
import lgVideo from 'lightgallery/plugins/video';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nFieldService } from '../../../../shared/services/i18n-field.service';

@Component({
  selector: 'app-tour-admin-detail',
  templateUrl: './tour-admin-detail.component.html',
  styleUrls: ['./tour-admin-detail.component.scss'],
  standalone: false
})
export class TourAdminDetailComponent implements OnInit, AfterViewChecked {
  tour: TourAdminDto | null = null;
  loading: boolean = false;
  showAcceptModal: boolean = false;
  // TC-015 (#218): true = editar % sin aceptar el tour; false = flujo original de aceptar tour.
  porcentajeModalEditMode: boolean = false;
  showCancelModal: boolean = false;
  showReturnModal: boolean = false;

  porcentajeTouryaInput: number = 15;
  savingPorcentajeTourya: boolean = false;
  private readonly DEFAULT_PORCENTAJE_TOURYA_PERCENT = 15;
  categories: TourCategoryDto[] = [];
  providerDetail: ProviderDto | null = null;
  locationsPublic: LocationsPublicDto[] = [];

  // Google Maps
  mapCenter?: google.maps.LatLngLiteral;
  mapZoom = 14;

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

  settings = {
    counter: false,
    plugins: [lgZoom, lgVideo],
  };

  private lightGallery!: LightGallery;
  private needRefresh = false;

  // Datos de ejemplo para el slider (deberían venir del tour)
  mainSlides: string[] = [];

  thumbSlides: string[] = [];

  images: { src: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tourAdminService: TourAdminService,
    private cityService: CityService,
    private _snackBar: MatSnackBar,
    public i18nService: I18nFieldService
  ) {}

  ngOnInit(): void {
    const tourId = this.route.snapshot.params['id'];
    if (tourId) {
      // cargar catálogo de categorías y detalle en paralelo
      this.loadCategories();
      this.loadTourDetail(+tourId);
      // cargar catálogo de ubicaciones públicas
      this.cityService.getLocationsPublic().subscribe({
        next: (list) => {
          this.locationsPublic = list || [];
        },
        error: (err) => {
          console.warn('Could not load locationsPublic', err);
        }
      });
    }
  }

  loadTourDetail(tourId: number): void {
    this.loading = true;
    this.tourAdminService.getById(tourId).subscribe({
      next: (tour) => {
        this.tour = tour;
        
        // Map galleries to sliders if available
        const galleries: any[] | undefined = (tour as any).galleries && (tour as any).galleries.length 
          ? (tour as any).galleries 
          : (tour as any).profilePicture 
            ? [(tour as any).profilePicture] 
            : undefined;
        
        if (galleries && galleries.length > 0) {
          this.mainSlides = galleries.map(g => g.imageUrl || 'assets/img/tours/tours-07.jpg');
          this.thumbSlides = galleries.map(g => g.imageUrl || 'assets/img/tours/tours-07.jpg');
          this.images = galleries.map(g => ({ src: g.imageUrl || 'assets/img/tours/gallery-tour-lg-01.jpg' }));
          // Marcar que necesitamos refrescar lightgallery después del render
          this.needRefresh = true;
        }

        // Set map center from first location when available
        const loc = tour?.locations && tour.locations.length ? tour.locations[0] : undefined;
        if (loc && loc.latitude !== undefined && loc.longitude !== undefined) {
          this.mapCenter = { lat: loc.latitude, lng: loc.longitude };
          this.mapZoom = 15;
        }

        // si la respuesta incluye provider con id, intentar cargar detalle del proveedor
        // si no, usar lo que venga embebido en la respuesta (compatibilidad)
        if ((tour as any).provider && (tour as any).provider.id) {
          this.loadProvider((tour as any).provider.id);
        } else if ((tour as any).provider) {
          this.providerDetail = (tour as any).provider;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el tour:', error);
        this.loading = false;
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  loadCategories(): void {
    this.tourAdminService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
      },
      error: (err) => {
        console.error('Error cargando categorias:', err);
      }
    });
  }

  loadProvider(providerId: number): void {
    if (!providerId) return;
    this.tourAdminService.getProviderById(providerId).subscribe({
      next: (prov) => {
        // si el endpoint no devuelve estructura completa, mantenemos null hasta que esté disponible
        this.providerDetail = prov || null;
      },
      error: (err) => {
        console.error('Error cargando proveedor:', err);
        // dejar providerDetail como null si falla
        this.providerDetail = null;
      }
    });
  }

  getCategoryName(categoryId?: number): string {
    if (!categoryId) return 'Sin categoría';
    // buscar en el catálogo
    const found = this.categories.find(c => c.id === categoryId);
    if (found) return found.name;
    // si el tour incluye objeto tourCategory (compatibilidad), usarlo
    // @ts-ignore
    if ((this.tour as any)?.tourCategory?.name) return (this.tour as any).tourCategory.name;
    return 'Sin categoría';
  }

  openAcceptModal(): void {
    this.porcentajeModalEditMode = false;
    const current = this.tour?.porcentajeTourya;
    if (typeof current === 'number' && Number.isFinite(current)) {
      this.porcentajeTouryaInput = this.round2(current * 100);
    } else {
      this.porcentajeTouryaInput = this.DEFAULT_PORCENTAJE_TOURYA_PERCENT;
    }
    this.showAcceptModal = true;
  }

  /**
   * TC-015 (#218): abre el mismo modal pero en modo edicion — el submit solo
   * actualiza el porcentajeTourya sin llamar a acceptTour. Habilitado para
   * tours ya aceptados (canEditPorcentaje()).
   */
  openEditPorcentajeModal(): void {
    this.porcentajeModalEditMode = true;
    const current = this.tour?.porcentajeTourya;
    if (typeof current === 'number' && Number.isFinite(current)) {
      this.porcentajeTouryaInput = this.round2(current * 100);
    } else {
      this.porcentajeTouryaInput = this.DEFAULT_PORCENTAJE_TOURYA_PERCENT;
    }
    this.showAcceptModal = true;
  }

  canEditPorcentaje(): boolean {
    return this.tour?.status === 'accepted';
  }

  /**
   * TC-015 (#218): visualizacion del % actual en el sidebar. Retorna null si
   * el backend aun no expone el valor (evita mostrar "0%" enganoso).
   */
  getPorcentajeTouryaDisplay(): string | null {
    const p = this.tour?.porcentajeTourya;
    if (typeof p !== 'number' || !Number.isFinite(p)) return null;
    return `${this.round2(p * 100)}%`;
  }

  closeAcceptModal(): void {
    if (this.savingPorcentajeTourya) {
      return;
    }
    this.showAcceptModal = false;
  }

  isPorcentajeTouryaValid(): boolean {
    const v = this.porcentajeTouryaInput;
    return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100;
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
  }

  openReturnModal(): void {
    this.showReturnModal = true;
  }

  closeReturnModal(): void {
    this.showReturnModal = false;
  }

  acceptTour(): void {
    if (!this.tour || !this.isPorcentajeTouryaValid()) {
      return;
    }
    const tourId = this.tour.id;
    const newDecimal = this.round2(this.porcentajeTouryaInput) / 100;
    const currentDecimal =
      typeof this.tour.porcentajeTourya === 'number' && Number.isFinite(this.tour.porcentajeTourya)
        ? this.round2(this.tour.porcentajeTourya * 100) / 100
        : null;

    // TC-015 (#218): en modo edicion, solo PATCH del %; no llama a acceptTour.
    if (this.porcentajeModalEditMode) {
      if (currentDecimal !== null && Math.abs(currentDecimal - newDecimal) <= 0.00001) {
        // Nada cambio -> cerrar sin request.
        this.showAcceptModal = false;
        return;
      }
      this.savingPorcentajeTourya = true;
      this.tourAdminService.updatePorcentajeTourya(tourId, newDecimal).subscribe({
        next: () => {
          if (this.tour) {
            this.tour.porcentajeTourya = newDecimal;
          }
          this.savingPorcentajeTourya = false;
          this.openSnackBar('Porcentaje Tourya actualizado');
          this.showAcceptModal = false;
        },
        error: (error) => {
          this.savingPorcentajeTourya = false;
          console.error('Error al actualizar el porcentaje Tourya:', error);
          this.openSnackBar('Error al actualizar el porcentaje Tourya');
        }
      });
      return;
    }

    const doAccept = () => {
      this.tourAdminService.acceptTour(tourId).subscribe({
        next: () => {
          this.savingPorcentajeTourya = false;
          this.openSnackBar('Tour aceptado exitosamente');
          this.showAcceptModal = false;
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.savingPorcentajeTourya = false;
          console.error('Error al aceptar el tour:', error);
          this.openSnackBar('Error al aceptar el tour');
        }
      });
    };

    if (currentDecimal === null || Math.abs(currentDecimal - newDecimal) > 0.00001) {
      this.savingPorcentajeTourya = true;
      this.tourAdminService.updatePorcentajeTourya(tourId, newDecimal).subscribe({
        next: () => {
          if (this.tour) {
            this.tour.porcentajeTourya = newDecimal;
          }
          doAccept();
        },
        error: (error) => {
          this.savingPorcentajeTourya = false;
          console.error('Error al actualizar el porcentaje Tourya:', error);
          this.openSnackBar('Error al actualizar el porcentaje Tourya');
        }
      });
    } else {
      this.savingPorcentajeTourya = true;
      doAccept();
    }
  }

  cancelTour(): void {
    if (this.tour) {
      this.tourAdminService.cancelTour(this.tour.id).subscribe({
        next: () => {
          this.openSnackBar('Tour cancelado exitosamente');
          this.closeCancelModal();
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          console.error('Error al cancelar el tour:', error);
          this.openSnackBar('Error al cancelar el tour');
        }
      });
    }
  }

  returnedTour(): void {
    if (this.tour) {
      this.tourAdminService.returnedTour(this.tour.id).subscribe({
        next: () => {
          this.openSnackBar('Tour devuelto exitosamente');
          this.closeCancelModal();
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          console.error('Error al devolver el tour:', error);
          this.openSnackBar('Error al devolver el tour');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'created':
        return 'bg-secondary';
      case 'submitted':
        return 'bg-warning';
      case 'returned':
        return 'bg-info';
      case 'accepted':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'created':
        return 'Creado';
      case 'submitted':
        return 'Enviado';
      case 'returned':
        return 'Devuelto';
      case 'accepted':
        return 'Aceptado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  canAccept(): boolean {
    return this.tour?.status === 'submitted';
  }

  canCancel(): boolean {
    return this.tour?.status === 'submitted';
  }

  canReturn(): boolean {
    return this.tour?.status === 'returned';
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
    if (loc.location) parts.push(loc.location); // friendly name of the location
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

  onBeforeSlide(): void {
    // Handle before slide event
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

  openSnackBar(message: string) {
    this._snackBar.open(message, "", {
      duration: 5000,
    });
  }
}
