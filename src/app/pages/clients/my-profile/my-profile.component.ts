import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from '../../../shared/routes/routes';
import { ClientMenuService } from '../../../shared/data/client-menu.service';
import { ReviewsService } from '../../../core/services/reviews.service';
import { ProviderReview } from '../../../shared/models/reviews.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchToursService } from '../list-tours/search-tours.service';
import { TourScheduleResponseDto } from '../../../shared/dto/search-tour-response.dto';
import { TouristService } from '../../../shared/services/tourist.service';

@Component({
  selector: 'app-my-profile',
  standalone: false,
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent implements OnInit {
  public routes = routes;
  activeSection: string = 'profile'; // 'profile' | 'bookings' | 'reviews' | 'wishlist'

  // Variables para bookings
  highlightedReservationId: number | null = null;
  shouldCreateReview: boolean = false;

  // Variables para reviews
  reviews: ProviderReview[] = [];
  totalReviews: number = 0;
  averageRating: number = 0;
  reviewsLoading: boolean = false;
  reviewsTotalPages: number = 0;
  reviewsCurrentPage: number = 1;

  // Variables para wishlist (tours)
  wishlistTours: TourScheduleResponseDto[] = [];
  wishlistLoading: boolean = false;
  wishlistTotalItems: number = 0;
  wishlistTotalPages: number = 0;
  wishlistCurrentPage: number = 1;
  wishlistSize: number = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientMenuService: ClientMenuService,
    private reviewsService: ReviewsService,
    private _snackBar: MatSnackBar,
    private searchToursService: SearchToursService,
    private touristService: TouristService
  ) {}

  ngOnInit(): void {
    // Escuchar cambios en los query params para navegar a la sección correcta
    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section && section !== this.activeSection) {
        setTimeout(() => {
          this.activeSection = section;
          this.clientMenuService.setActiveSection(section);
          
          // Capturar o resetear reservationId
          if (params['reservationId']) {
            this.highlightedReservationId = Number(params['reservationId']);
          } else {
            this.highlightedReservationId = null;
          }

          // Capturar o resetear createReview flag
          if (params['createReview'] === 'true') {
            this.shouldCreateReview = true;
          } else {
            this.shouldCreateReview = false;
          }

          if (section === 'wishlist') {
            this.loadWishlistTours();
          }
        });
      }
    });
    
    // Suscribirse a cambios de sección desde el menú
    this.clientMenuService.activeSection$.subscribe(section => {
      // Si la sección es diferente a la actual, actualizar y sincronizar URL
      if (section !== this.activeSection) {
        setTimeout(() => {
          this.activeSection = section;
          // Actualizar URL sin recargar la página
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { section: section },
            queryParamsHandling: 'merge'
          });

          if (section === 'wishlist') {
            this.loadWishlistTours();
          }
        });
      }
    });
  }

  onSectionChange(section: string): void {
    this.activeSection = section;
    this.clientMenuService.setActiveSection(section);
  }

  loadWishlistTours(): void {
    this.wishlistLoading = true;
    // Consumiendo el servicio especializado de búsqueda en wishlist
    this.touristService.searchWishlist(this.wishlistCurrentPage, this.wishlistSize).subscribe({
      next: (response) => {
        this.wishlistTours = response.content || [];
        this.wishlistTotalItems = response.totalElements || 0;
        this.wishlistTotalPages = response.totalPages || 0;
        this.wishlistCurrentPage = response.number + 1;
        this.wishlistLoading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist tours:', error);
        this.wishlistLoading = false;
      }
    });
  }

  onToggleFavoriteFromWishlist(index: number): void {
    const tourId = this.wishlistTours[index].tour.id;
    this.touristService.removeFromWishlist(tourId).subscribe({
      next: () => {
        console.log('🗑️ Tour quitado de wishlist desde perfil:', tourId);
        // Quitar el tour de la lista local para que desaparezca inmediatamente
        this.wishlistTours.splice(index, 1);
        this.wishlistTotalItems--;
      },
      error: (error) => {
        console.error('❌ Error al quitar de wishlist desde perfil:', error);
      }
    });
  }

  onGoToPageFromWishlist(page: number): void {
    this.wishlistCurrentPage = page;
    this.loadWishlistTours();
  }

  onGoToPreviousPageFromWishlist(): void {
    if (this.wishlistCurrentPage > 1) {
      this.wishlistCurrentPage--;
      this.loadWishlistTours();
    }
  }

  onGoToNextPageFromWishlist(): void {
    if (this.wishlistCurrentPage < this.wishlistTotalPages) {
      this.wishlistCurrentPage++;
      this.loadWishlistTours();
    }
  }

  selectTourFromWishlist(tour: TourScheduleResponseDto): void {
    console.log('Tour selected from wishlist:', tour);
  }

  /**
   * Carga las reviews desde el servicio
   */
  onLoadReviews(): void {
    this.reviewsLoading = true;
    this.reviewsService.getReviews().subscribe({
      next: (response) => {
        this.reviews = response.content;
        this.totalReviews = response.totalElements;
        this.reviewsTotalPages = response.totalPages;
        this.reviewsCurrentPage = response.number + 1;
        this.calculateReviewStatistics();
        this.reviewsLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.reviewsLoading = false;
      }
    });
  }

  /**
   * Aplica filtros a las reviews
   */
  onApplyFilters(filters: any): void {
    this.reviewsLoading = true;
    this.reviewsService.getReviews(filters).subscribe({
      next: (response) => {
        this.reviews = response.content;
        this.totalReviews = response.totalElements;
        this.reviewsTotalPages = response.totalPages;
        this.reviewsCurrentPage = response.number + 1;
        this.calculateReviewStatistics();
        this.reviewsLoading = false;
      },
      error: (error) => {
        console.error('Error applying filters:', error);
        this.reviewsLoading = false;
      }
    });
  }

  /**
   * Envía una respuesta a una review (si los clientes pueden responder)
   */
  onSubmitReply(event: {reviewId: string, answerData: any}): void {
    // Extraer solo el comentario del answerData
    const comment = event.answerData.comment || event.answerData;
    
    this.reviewsService.saveReviewReply(event.reviewId, comment).subscribe({
      next: (response) => {
        console.log('Respuesta guardada exitosamente:', response);
        this.openSnackBar('¡Respuesta enviada exitosamente!');
        // Recargar las reviews para mostrar la nueva respuesta
        this.onLoadReviews();
      },
      error: (error) => {
        console.error('Error al guardar la respuesta:', error);
        this.openSnackBar('Error al enviar la respuesta. Por favor intenta nuevamente.');
      }
    });
  }

  /**
   * Rechaza/elimina una review (si los clientes pueden eliminar sus propias reviews)
   */
  onSubmitReject(event: {reviewId: string, reason: string}): void {
    this.reviewsService.rejectReview(event.reviewId, event.reason).subscribe({
      next: (response) => {
        console.log('Review eliminada exitosamente:', response);
        this.openSnackBar('Review eliminada exitosamente');
        // Recargar las reviews
        this.onLoadReviews();
      },
      error: (error) => {
        console.error('Error al eliminar la review:', error);
        this.openSnackBar('Error al eliminar la review. Por favor intenta nuevamente.');
      }
    });
  }

  /**
   * Calcula las estadísticas de las reviews
   */
  private calculateReviewStatistics(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }
    const sum = this.reviews.reduce((acc, review) => acc + (review.rating ?? 0), 0);
    this.averageRating = parseFloat((sum / this.reviews.length).toFixed(1));
  }

  /**
   * Muestra un mensaje de notificación
   */
  private openSnackBar(message: string): void {
    this._snackBar.open(message, '', {
      duration: 5000,
    });
  }
}
