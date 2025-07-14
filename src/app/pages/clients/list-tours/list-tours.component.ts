import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HostListener } from '@angular/core';
import { routes } from "../../../shared/routes/routes";
import { ActivatedRoute } from '@angular/router';
import { SearchTourListDto, TourScheduleResponseDto } from '../../../shared/dto/search-tour-response.dto';
import { RequestProvidersService } from '../../providers/requestproviders/request-providers.service';

@Component({
  selector: 'app-list-tours',
  standalone: false,
  templateUrl: './list-tours.component.html',
  styleUrl: './list-tours.component.scss'
})
export class ListToursComponent implements OnInit {
  public routes = routes;
  
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
  
  // Image slider options
  imageSlider = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 1
      },
      940: {
        items: 1
      }
    },
    nav: true
  };

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

  public cities: string[] = ['Argentina', 'Brasil', 'Chile', 'Uruguay', 'Perú'];
  public categories: string[] = ['Playa', 'Río', 'Desierto', 'Nieve', 'Rural'];

  public selectedCity: string = '';
  public selectedCategory: string = '';
  public checkIn: string = '';
  public checkOut: string = '';

  constructor(
    private fb: FormBuilder, 
    private route: ActivatedRoute,
    private requestProvidersService: RequestProvidersService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedCity = params['city'] || '';
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
    // Reset all filters
  }

  onSearch(): void {
    const params = [
      `city=${encodeURIComponent(this.selectedCity)}`,
      `category=${encodeURIComponent(this.selectedCategory)}`,
      `checkIn=${encodeURIComponent(this.checkIn)}`,
      `checkOut=${encodeURIComponent(this.checkOut)}`
    ].join('&');
    window.location.href = `/clients/list-tours?${params}`;
  }

  searchToursList(): void {
    const searchData: SearchTourListDto = {
      "providerStateId": 1,
      "providerCityId": 1,
      "categoryId": 1,
      "page": 0,
      "size": 10
    
      
    };
  
    this.requestProvidersService.searchTours(searchData).subscribe({
      next: (response: TourScheduleResponseDto[]) => {
        console.log('Respuesta completa de searchTours:', response);
        console.log('Cantidad de resultados:', response ? response.length : 0);
        this.tours = response || [];
      },
      error: (error: any) => {
        console.error('Error al buscar tours:', error);
        this.tours = [];
      }
    });
  }
} 