import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HostListener } from '@angular/core';
import { routes } from "../../../shared/routes/routes";
import { ActivatedRoute } from '@angular/router';
import { SearchTourListDto, TourScheduleResponseDto, PaginatedTourScheduleResponseDto } from '../../../shared/dto/search-tour-response.dto';
import { RequestProvidersService } from '../../providers/requestproviders/request-providers.service';
import { State } from '../../../shared/dto/requestProvider-response.dto';
import { TourCategory } from '../../../shared/dto/tour-response.dto';

@Component({
  selector: 'app-list-tours',
  standalone: false,
  templateUrl: './list-tours.component.html',
  styleUrl: './list-tours.component.scss'
})
export class ListToursComponent implements OnInit {
  public routes = routes;
  public Math = Math; // Para usar Math en el template
  
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
  tours: TourScheduleResponseDto[] = [];
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
  public page: number = 1;
  public size: number = 10;
  public totalItems: number = 0;
  public totalPages: number = 0;
  public currentPage: number = 1;
  public viewMode: 'grid' | 'list' = 'grid';
  constructor(
    private fb: FormBuilder, 
    private route: ActivatedRoute,
    private requestProvidersService: RequestProvidersService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedState = params['state'] || '';
      this.selectedCategory = params['category'] || '';
      this.checkIn = params['checkIn'] || '';
      this.checkOut = params['checkOut'] || '';
      this.searchToursList();
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
    this.currentPage = 1;
    this.page = 1;
    this.searchToursList();
  }




  searchToursList(): void {
    this.loading = true;
    const searchData: Partial<SearchTourListDto> = {
      "providerStateId": Number(this.selectedState),
      "providerCityId": 1,
      "categoryId": Number(this.selectedCategory),
      "page": this.page,
      "size": this.size
    };
  
    this.requestProvidersService.searchTours(searchData).subscribe({
      next: (response: any) => {
        console.log('Respuesta completa de searchTours:', response);
        
        // Manejar tanto respuesta paginada como array simple
        if (response && response.content) {
          // Respuesta paginada
          this.tours = response.content || [];
          this.totalItems = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.currentPage = response.number + 1; // La API usa base 0, nosotros base 1
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
        
        console.log('Cantidad de resultados:', this.tours.length);
        console.log('Total de elementos:', this.totalItems);
        console.log('Total de páginas:', this.totalPages);
        console.log('Página actual:', this.currentPage);
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al buscar tours:', error);
        this.tours = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.currentPage = 1;
        this.loading = false;
      }
    });
  }
} 