import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { routes } from '../../../shared/routes/routes';
import { ClientMenuService } from '../../../shared/data/client-menu.service';
import { ReviewsService } from '../../../core/services/reviews.service';
import { ProviderReview } from '../../../shared/models/reviews.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-profile',
  standalone: false,
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent implements OnInit {
  public routes = routes;
  activeSection: string = 'profile'; // 'profile' | 'bookings' | 'reviews' | 'wishlist'

  // Variables para reviews
  reviews: ProviderReview[] = [];
  totalReviews: number = 0;
  averageRating: number = 0;
  reviewsLoading: boolean = false;
  reviewsTotalPages: number = 0;
  reviewsCurrentPage: number = 1;

  constructor(
    private route: ActivatedRoute,
    private clientMenuService: ClientMenuService,
    private reviewsService: ReviewsService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Escuchar cambios en los query params para navegar a la sección correcta
    this.route.queryParams.subscribe(params => {
      if (params['section']) {
        setTimeout(() => {
          this.activeSection = params['section'];
          this.clientMenuService.setActiveSection(params['section']);
        });
      }
    });
    
    // Suscribirse a cambios de sección desde el menú
    this.clientMenuService.activeSection$.subscribe(section => {
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.activeSection = section;
      });
    });
  }

  onSectionChange(section: string): void {
    this.activeSection = section;
    this.clientMenuService.setActiveSection(section);
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
    this.reviewsService.saveReviewReply(event.reviewId, event.answerData).subscribe({
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
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
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
