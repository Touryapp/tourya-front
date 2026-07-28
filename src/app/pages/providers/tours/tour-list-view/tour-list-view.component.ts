import { Component, Input, Output, EventEmitter, inject } from "@angular/core";
import { routes } from "../../../../shared/routes/routes";
import { OwlOptions } from "ngx-owl-carousel-o";
import { Tour } from "../../../../shared/dto/tour-response.dto";
import { I18nFieldService } from "../../../../shared/services/i18n-field.service";
import { SearchToursService } from "../../../clients/list-tours/search-tours.service";
import { OnInit } from "@angular/core";
import { TourService } from "../tour.service";
import { AuthService } from "../../../../core/services/auth.service";
import Swal from "sweetalert2";

@Component({
  selector: "app-tour-list-view-provider",
  standalone: false,
  templateUrl: "./tour-list-view.component.html",
  styleUrls: ["./tour-list-view.component.scss"],
})
export class TourListViewComponent implements OnInit {
  public routes = routes;
  public Math = Math;

  @Input() tours: Tour[] = [];
  @Input() loading: boolean = false;
  @Input() totalItems: number = 0;
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  @Input() size: number = 10;

  @Output() toggleFavorite = new EventEmitter<number>();
  @Output() goToPage = new EventEmitter<number>();
  @Output() goToPreviousPage = new EventEmitter<void>();
  @Output() goToNextPage = new EventEmitter<void>();

  private subcategoriesMap = new Map<string, any>();

  private tourService = inject(TourService);
  private authService = inject(AuthService);

  get isProvider(): boolean {
    return this.authService.isProvider();
  }

  constructor(
    public i18nService: I18nFieldService,
    private searchToursService: SearchToursService
  ) {}

  ngOnInit(): void {
    this.searchToursService.categoriesPublic().subscribe({
      next: (categories: any[]) => {
        categories.forEach(cat => {
          cat.subCategories?.forEach((sub: any) => {
            this.subcategoriesMap.set(sub.code || sub.name, sub.name);
          });
        });
      },
      error: (err) => console.error('Error cargando categorías para traducir subcategoría', err)
    });
  }

  getSubCategoryName(code: string | undefined): any {
    if (!code) return '';
    return this.subcategoriesMap.get(code) || code;
  }

  getDurationLabel(code: string | string[] | undefined): string {
    if (!code) return '';
    
    // If it's an array, just take the first one or map all
    const valueStr = Array.isArray(code) ? code[0] : code;
    
    const durationOptions = [
      { value: '1_a_2_horas', label: '1 a 2 horas' },
      { value: '2_a_4_horas', label: 'de 2 a 4 horas' },
      { value: '4_a_6_horas', label: 'de 4 a 6 horas' },
      { value: 'hasta_1_dia', label: 'hasta 1 día' },
      { value: 'hasta_3_dias', label: 'hasta 3 días' },
      { value: 'hasta_5_dias', label: 'hasta 5 días' }
    ];

    const option = durationOptions.find(o => o.value === valueStr);
    return option ? option.label : valueStr;
  }

  getPriceTypeLabel(priceType: string | undefined | null): string {
    if (!priceType) return '';
    const upper = priceType.toUpperCase();
    if (upper === 'PRIVATE' || upper === 'PER_PERSON') return 'Individual';
    if (upper === 'GROUP' || upper === 'PER_GROUP') return 'Grupo';
    return priceType;
  }

  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';
    switch (status.toLowerCase()) {
      case 'created': return 'bg-secondary';
      case 'submitted': return 'bg-warning';
      case 'returned': return 'bg-info';
      case 'accepted': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Desconocido';
    switch (status.toLowerCase()) {
      case 'created': return 'Creado';
      case 'submitted': return 'Enviado';
      case 'returned': return 'Devuelto';
      case 'accepted': return 'Aceptado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  // Favorites functionality
  isClassAdded: boolean[] = [];

  // Image slider options
  imageSlider: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ["", ""],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
    },
    nav: true,
  };

  // Helper functions
  getLowestPrice(prices: any[] | null): string {
    if (!prices || prices.length === 0) {
      return "N/A";
    }
    const lowestPrice = Math.min(...prices.map((p) => p.price));
    return `$${lowestPrice}`;
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES");
    } catch {
      return "N/A";
    }
  }

  formatTime(timeString: string | null): string {
    if (!timeString) return "N/A";
    return timeString;
  }

  onToggleFavorite(index: number): void {
    this.isClassAdded[index] = !this.isClassAdded[index];
    this.toggleFavorite.emit(index);
  }

  onGoToPage(page: number): void {
    this.goToPage.emit(page);
  }

  onGoToPreviousPage(): void {
    this.goToPreviousPage.emit();
  }

  onGoToNextPage(): void {
    this.goToNextPage.emit();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(
        1,
        this.currentPage - Math.floor(maxVisiblePages / 2)
      );
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

  isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  isLastPage(): boolean {
    return this.currentPage === this.totalPages;
  }

  displayTourDescription(tour: Tour): any {
    return tour?.description || '';
  }

  displayTourName(tour: Tour): any {
    return tour?.name || '';
  }

  profilePicture(tour: Tour) {
    return tour?.profilePicture?.imageUrl || "assets/img/tours/tours-07.jpg";
  }

  submitTour(tourId: number | undefined): void {
    if (!tourId) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Una vez enviado, el tour pasará a revisión.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.tourService.submitTourById(tourId).subscribe({
          next: () => {
            Swal.fire('¡Enviado!', 'El tour ha sido enviado para revisión.', 'success');
            const tour = this.tours.find(t => t.id === tourId);
            if (tour) {
              tour.status = 'submitted';
            }
          },
          error: (err) => {
            console.error('Error enviando tour:', err);
            Swal.fire('Error', 'Hubo un error al enviar el tour.', 'error');
          }
        });
      }
    });
  }
}
