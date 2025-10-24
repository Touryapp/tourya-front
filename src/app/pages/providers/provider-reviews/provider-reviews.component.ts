import { Component, OnInit, OnDestroy } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

// Interfaz para las reviews de los tours del proveedor
export interface ProviderReview {
  id: string;
  tourName: string;
  tourId: string;
  tourImage: string;
  customerName: string;
  customerImage: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  daysAgo: string;
  likes: number;
  dislikes: number;
  hearts: number;
  bookingId: string;
}

@Component({
  selector: 'app-provider-reviews',
  standalone: false,
  templateUrl: './provider-reviews.component.html',
  styleUrl: './provider-reviews.component.scss'
})
export class ProviderReviewsComponent implements OnInit, OnDestroy {
  public routes = routes;
  
  // Variables de paginación y filtrado
  public reviews: ProviderReview[] = [];
  public filteredReviews: ProviderReview[] = [];
  public totalReviews = 0;
  public averageRating = 0;
  public searchTerm = '';
  public selectedRatingFilter = 0; // 0 = todas, 1-5 = filtrar por rating

  constructor() {}

  ngOnInit(): void {
    this.loadMockReviews();
    this.calculateStatistics();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  /**
   * Carga datos mock de reviews
   */
  private loadMockReviews(): void {
    const mockReviews: ProviderReview[] = [
      {
        id: 'REV-001',
        tourName: 'LaughFest Carnival',
        tourId: 'TOUR-101',
        tourImage: 'tours-21.jpg',
        customerName: 'Sarah Johnson',
        customerImage: 'user-02.jpg',
        rating: 5.0,
        title: 'Amazing Experience!',
        comment: 'This tour exceeded all my expectations! The guides were knowledgeable and friendly, the locations were breathtaking, and everything was perfectly organized. Would definitely recommend!',
        date: '2024-10-20',
        daysAgo: '2 days ago',
        likes: 25,
        dislikes: 2,
        hearts: 18,
        bookingId: 'TB-1001'
      },
      {
        id: 'REV-002',
        tourName: 'Beach Paradise Adventure',
        tourId: 'TOUR-102',
        tourImage: 'tours-22.jpg',
        customerName: 'Michael Chen',
        customerImage: 'user-03.jpg',
        rating: 4.5,
        title: 'Great Tour with Minor Issues',
        comment: 'Overall a fantastic tour! The beach locations were stunning and the activities were fun. Only minor complaint was that lunch could have been better. But the guides made up for it with their enthusiasm!',
        date: '2024-10-18',
        daysAgo: '4 days ago',
        likes: 20,
        dislikes: 5,
        hearts: 15,
        bookingId: 'TB-1002'
      },
      {
        id: 'REV-003',
        tourName: 'Mountain Expedition',
        tourId: 'TOUR-103',
        tourImage: 'tours-23.jpg',
        customerName: 'Emma Wilson',
        customerImage: 'user-04.jpg',
        rating: 4.8,
        title: 'Breathtaking Views!',
        comment: 'The mountain views were absolutely incredible! Our guide was experienced and made sure everyone felt safe. The hiking trails were well-maintained. This is a must-do tour for nature lovers!',
        date: '2024-10-15',
        daysAgo: '7 days ago',
        likes: 32,
        dislikes: 1,
        hearts: 28,
        bookingId: 'TB-1003'
      },
      {
        id: 'REV-004',
        tourName: 'City Lights Tour',
        tourId: 'TOUR-104',
        tourImage: 'tours-24.jpg',
        customerName: 'David Martinez',
        customerImage: 'user-05.jpg',
        rating: 3.5,
        title: 'Good but Could Be Better',
        comment: 'The tour was decent but felt a bit rushed. We didn\'t get enough time at each location. The guide was nice but could have provided more historical context. Price was reasonable though.',
        date: '2024-10-12',
        daysAgo: '10 days ago',
        likes: 12,
        dislikes: 8,
        hearts: 10,
        bookingId: 'TB-1004'
      },
      {
        id: 'REV-005',
        tourName: 'Tropical Getaway',
        tourId: 'TOUR-105',
        tourImage: 'tours-25.jpg',
        customerName: 'Lisa Anderson',
        customerImage: 'user-06.jpg',
        rating: 4.9,
        title: 'Paradise Found!',
        comment: 'This was the vacation of a lifetime! The tropical locations were like something out of a magazine. Snorkeling, beach activities, amazing food - everything was perfect! The tour company thought of every detail.',
        date: '2024-10-10',
        daysAgo: '12 days ago',
        likes: 45,
        dislikes: 0,
        hearts: 38,
        bookingId: 'TB-1005'
      },
      {
        id: 'REV-006',
        tourName: 'Historic Route 66',
        tourId: 'TOUR-106',
        tourImage: 'tours-26.jpg',
        customerName: 'James Brown',
        customerImage: 'user-07.jpg',
        rating: 4.2,
        title: 'Nostalgic Journey',
        comment: 'A wonderful trip down memory lane! Visiting all the classic Route 66 stops was amazing. The guide had great stories and the pace was comfortable. A few stops could have been longer but overall great experience.',
        date: '2024-10-08',
        daysAgo: '14 days ago',
        likes: 18,
        dislikes: 3,
        hearts: 16,
        bookingId: 'TB-1006'
      },
      {
        id: 'REV-007',
        tourName: 'LaughFest Carnival',
        tourId: 'TOUR-101',
        tourImage: 'tours-21.jpg',
        customerName: 'Maria Garcia',
        customerImage: 'user-08.jpg',
        rating: 4.7,
        title: 'Fun for the Whole Family',
        comment: 'My kids absolutely loved this tour! There were activities for all ages and the staff was incredibly patient with children. Safety was clearly a priority. We\'ll definitely be booking again!',
        date: '2024-10-05',
        daysAgo: '17 days ago',
        likes: 28,
        dislikes: 2,
        hearts: 22,
        bookingId: 'TB-1007'
      },
      {
        id: 'REV-008',
        tourName: 'Beach Paradise Adventure',
        tourId: 'TOUR-102',
        tourImage: 'tours-22.jpg',
        customerName: 'Robert Taylor',
        customerImage: 'user-09.jpg',
        rating: 3.8,
        title: 'Nice Beach Tour',
        comment: 'The beaches were beautiful and the water activities were fun. However, the group was quite large which made it feel a bit crowded at times. Transportation could have been more comfortable.',
        date: '2024-10-03',
        daysAgo: '19 days ago',
        likes: 15,
        dislikes: 6,
        hearts: 12,
        bookingId: 'TB-1008'
      }
    ];

    this.reviews = mockReviews;
    this.filteredReviews = [...mockReviews];
    this.totalReviews = mockReviews.length;
  }

  /**
   * Calcula estadísticas generales
   */
  private calculateStatistics(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }

    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = parseFloat((sum / this.reviews.length).toFixed(1));
  }

  /**
   * Filtra reviews por búsqueda
   */
  public searchReviews(): void {
    this.applyFilters();
  }

  /**
   * Filtra por rating
   */
  public filterByRating(rating: number): void {
    this.selectedRatingFilter = rating;
    this.applyFilters();
  }

  /**
   * Aplica todos los filtros
   */
  private applyFilters(): void {
    let filtered = [...this.reviews];

    // Filtrar por búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(review =>
        review.tourName.toLowerCase().includes(searchLower) ||
        review.customerName.toLowerCase().includes(searchLower) ||
        review.comment.toLowerCase().includes(searchLower) ||
        review.title.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por rating
    if (this.selectedRatingFilter > 0) {
      filtered = filtered.filter(review => 
        Math.floor(review.rating) === this.selectedRatingFilter
      );
    }

    this.filteredReviews = filtered;
  }

  /**
   * Limpia todos los filtros
   */
  public clearFilters(): void {
    this.searchTerm = '';
    this.selectedRatingFilter = 0;
    this.filteredReviews = [...this.reviews];
  }

  /**
   * Exporta datos (mock)
   */
  public exportData(format: 'pdf' | 'excel'): void {
    alert(`Exportando calificaciones como ${format.toUpperCase()}...`);
  }

  /**
   * Obtiene las estrellas para mostrar el rating
   */
  public getStarsArray(rating: number): { full: boolean }[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push({ full: i <= Math.floor(rating) });
    }
    return stars;
  }

  /**
   * Obtiene la clase CSS del badge según el rating
   */
  public getRatingBadgeClass(rating: number): string {
    if (rating >= 4.5) return 'badge-success';
    if (rating >= 4.0) return 'badge-primary';
    if (rating >= 3.5) return 'badge-warning';
    return 'badge-secondary';
  }

  /**
   * Responde a una review (mock)
   */
  public respondToReview(reviewId: string): void {
    alert(`Función de respuesta para review ${reviewId} - Próximamente`);
  }
}
