import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HostListener } from '@angular/core';
import { routes } from "../../../shared/routes/routes";

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

  // Tours data
  tours = [
    {
      id: 1,
      name: 'Rainbow Mountain Valley',
      location: 'Ciutat Vella, Barcelona',
      type: 'Ecotourism',
      rating: 5.0,
      reviews: 105,
      price: 500,
      originalPrice: 789,
      duration: '4 Day,3 Night',
      guests: 14,
      guide: 'assets/img/users/user-08.jpg',
      images: [
        'assets/img/tours/tours-07.jpg',
        'assets/img/tours/tours-08.jpg',
        'assets/img/tours/tours-09.jpg'
      ],
      trending: true
    },
    {
      id: 2,
      name: 'Mystic Falls',
      location: 'Oxford Street, London',
      type: 'Adventure Tour',
      rating: 4.7,
      reviews: 110,
      price: 600,
      originalPrice: 700,
      duration: '3 Day, 2 Night',
      guests: 12,
      guide: 'assets/img/users/user-09.jpg',
      images: [
        'assets/img/tours/tours-08.jpg',
        'assets/img/tours/tours-09.jpg',
        'assets/img/tours/tours-10.jpg'
      ],
      trending: true
    },
    {
      id: 3,
      name: 'Crystal Lake',
      location: 'Princes Street, Edinburgh',
      type: 'Summer Trip',
      rating: 4.7,
      reviews: 180,
      price: 300,
      originalPrice: 500,
      duration: '5 Day, 4 Night',
      guests: 16,
      guide: 'assets/img/users/user-10.jpg',
      images: [
        'assets/img/tours/tours-09.jpg',
        'assets/img/tours/tours-10.jpg',
        'assets/img/tours/tours-11.jpg'
      ],
      trending: true
    },
    {
      id: 4,
      name: 'Majestic Peaks',
      location: 'Deansgate, Manchester',
      type: 'Adventure Tour',
      rating: 4.9,
      reviews: 300,
      price: 400,
      originalPrice: 480,
      duration: '3 Day, 2 Night',
      guests: 10,
      guide: 'assets/img/users/user-11.jpg',
      images: [
        'assets/img/tours/tours-10.jpg',
        'assets/img/tours/tours-11.jpg',
        'assets/img/tours/tours-12.jpg'
      ],
      trending: true
    },
    {
      id: 5,
      name: 'Enchanted Forest',
      location: 'King\'s Road, Chelsea',
      type: 'Group Tours',
      rating: 4.3,
      reviews: 250,
      price: 550,
      originalPrice: 600,
      duration: '2 Day, 1 Night',
      guests: 17,
      guide: 'assets/img/users/user-12.jpg',
      images: [
        'assets/img/tours/tours-11.jpg',
        'assets/img/tours/tours-12.jpg',
        'assets/img/tours/tours-13.jpg'
      ],
      trending: true
    },
    {
      id: 6,
      name: 'Serene Bay',
      location: 'Bold Street, Liverpool',
      type: 'Beach Tours',
      rating: 4.1,
      reviews: 280,
      price: 450,
      originalPrice: 520,
      duration: '3 D2 Night',
      guests: 8,
      guide: 'assets/img/users/user-13.jpg',
      images: [
        'assets/img/tours/tours-12.jpg',
        'assets/img/tours/tours-13.jpg',
        'assets/img/tours/tours-14.jpg'
      ],
      trending: true
    },
    {
      id: 7,
      name: 'Ancient Ruins',
      location: 'Broad Street, Bristol',
      type: 'Historical Tours',
      rating: 4.6,
      reviews: 400,
      price: 350,
      originalPrice: 400,
      duration: '2 Day, 1 Night',
      guests: 10,
      guide: 'assets/img/users/user-14.jpg',
      images: [
        'assets/img/tours/tours-13.jpg',
        'assets/img/tours/tours-14.jpg',
        'assets/img/tours/tours-15.jpg'
      ],
      trending: true
    },
    {
      id: 8,
      name: 'Mystical Caves',
      location: 'Chapel Street, Salford',
      type: 'Adventure Tour',
      rating: 4.2,
      reviews: 350,
      price: 700,
      originalPrice: 800,
      duration: '3 Day, 2 Night',
      guests: 14,
      guide: 'assets/img/users/user-15.jpg',
      images: [
        'assets/img/tours/tours-14.jpg',
        'assets/img/tours/tours-15.jpg',
        'assets/img/tours/tours-11.jpg'
      ],
      trending: true
    },
    {
      id: 9,
      name: 'Frosted Peaks',
      location: 'Castle Street, Cambridge',
      type: 'Adventure Tour',
      rating: 4.8,
      reviews: 220,
      price: 650,
      originalPrice: 720,
      duration: '6 Day, 5 Night',
      guests: 14,
      guide: 'assets/img/users/user-16.jpg',
      images: [
        'assets/img/tours/tours-15.jpg',
        'assets/img/tours/tours-11.jpg',
        'assets/img/tours/tours-12.jpg'
      ],
      trending: true
    }
  ];

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Component initialization
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
} 