import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
import { routes } from "../../../../shared/routes/routes";
import { OwlOptions } from "ngx-owl-carousel-o";
import { TourScheduleResponseDto } from "../../../../shared/dto/search-tour-response.dto";
import { I18nFieldService } from "../../../../shared/services/i18n-field.service";

@Component({
  selector: "app-tour-list-view",
  standalone: false,
  templateUrl: "./tour-list-view.component.html",
  styleUrls: ["./tour-list-view.component.scss"],
})
export class TourListViewComponent implements OnChanges {
  public routes = routes;
  public Math = Math;

  @Input() tours: TourScheduleResponseDto[] = [];
  @Input() loading: boolean = false;
  @Input() totalItems: number = 0;
  @Input() totalPages: number = 0;
  @Input() currentPage: number = 1;
  @Input() size: number = 10;
  @Input() isWishlistPage: boolean = false;
  @Input() initialFavoriteStates: boolean[] = [];
  @Input() categories: any[] = [];

  @Output() toggleFavorite = new EventEmitter<number>();
  @Output() goToPage = new EventEmitter<number>();
  @Output() goToPreviousPage = new EventEmitter<void>();
  @Output() goToNextPage = new EventEmitter<void>();
  @Output() selectTour = new EventEmitter<TourScheduleResponseDto>();

  constructor(public i18nService: I18nFieldService) {}

  // Favorites functionality
  isClassAdded: boolean[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFavoriteStates'] && this.initialFavoriteStates.length > 0) {
      this.isClassAdded = [...this.initialFavoriteStates];
    } else if (changes['tours'] && this.isWishlistPage) {
      this.isClassAdded = this.tours.map(() => true);
    }
  }

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
  getLowestPrice(tour: TourScheduleResponseDto): string {
    const price = tour.tour.priceFrom;
    if (price === null || price === undefined) {
      return "N/A";
    }
    return `$ ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES");
    } catch {
      return "N/A";
    }
  }

  formatTime(timeString: string | null | undefined): string {
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

  // Maneja la selección de un tour para agregarlo al carrito
  onSelectTour(tour: TourScheduleResponseDto): void {
    this.selectTour.emit(tour);
  }

  getTranslatedCategory(tourDto: any): string {
    const code = tourDto?.subCategory;
    const nameFallback = tourDto?.subCategoryName || tourDto?.subCategory || tourDto?.categoryName || 'N/A';
    
    if (this.categories && this.categories.length > 0) {
      if (code) {
        for (const cat of this.categories) {
          if (cat.subCategories) {
            const found = cat.subCategories.find((sub: any) => sub.code === code);
            if (found && found.name) {
              return this.i18nService.getValue(found.name) || nameFallback;
            }
          }
        }
      }
      
      const catId = tourDto?.categoryId;
      if (catId) {
        const foundCat = this.categories.find(c => c.id === catId);
        if (foundCat && foundCat.name) {
          return this.i18nService.getValue(foundCat.name) || nameFallback;
        }
      }
    }
    
    return nameFallback;
  }
}
