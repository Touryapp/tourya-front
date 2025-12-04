import { Component, OnInit, OnDestroy } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { Subscription } from 'rxjs';
import { ReviewsService } from '../../../core/services/reviews.service';
import { ProviderReview } from '../../../shared/models/reviews.model';
import { AuthService } from '../../../core/services/auth.service';

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
  public isLoading = false;
  private reviewsSubscription: Subscription | undefined;
  
  // Estado del formulario de respuesta
  public replyingToReviewId: string | null = null;
  public replyText: string = '';

  constructor(
    private reviewsService: ReviewsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnDestroy(): void {
    if (this.reviewsSubscription) {
      this.reviewsSubscription.unsubscribe();
    }
  }

  /**
   * Carga reviews del servicio
   */
  private loadReviews(): void {
    this.isLoading = true;
    this.reviewsSubscription = this.reviewsService.getReviews().subscribe({
      next: (response) => {
        this.reviews = response.content;
        this.filteredReviews = [...response.content];
        this.totalReviews = response.totalElements;
        this.calculateStatistics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      }
    });
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
        review.comment.toLowerCase().includes(searchLower)
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
   * Verifica si se puede responder a una review
   * Solo si el usuario es PROVIDER y la review no tiene respuesta
   */
  public canRespondToReview(review: ProviderReview): boolean {
    return this.authService.isProvider() && !review.answer;
  }

  /**
   * Abre/cierra el formulario de respuesta para una review
   */
  public respondToReview(reviewId: string): void {
    if (this.replyingToReviewId === reviewId) {
      // Si ya está abierto, cerrarlo
      this.cancelReply();
    } else {
      // Abrir formulario para esta review
      this.replyingToReviewId = reviewId;
      this.replyText = '';
    }
  }

  /**
   * Verifica si el formulario de respuesta está abierto para una review específica
   */
  public isReplyFormOpen(reviewId: string): boolean {
    return this.replyingToReviewId === reviewId;
  }

  /**
   * Cancela la respuesta y cierra el formulario
   */
  public cancelReply(): void {
    this.replyingToReviewId = null;
    this.replyText = '';
  }

  /**
   * Envía la respuesta a la review
   */
  public submitReply(reviewId: string): void {
    if (!this.replyText.trim()) {
      alert('Por favor escribe una respuesta antes de enviar');
      return;
    }

    // Obtener información del proveedor desde el usuario autenticado
    const user = this.authService.getUser();
    const providerName = user?.name || user?.firstName + ' ' + user?.lastName || 'Provider';
    const providerImage = user?.profileImage || 'user-default.jpg';

    // Calcular fecha y días transcurridos
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const daysAgo = 'Justo ahora';

    // Preparar datos de la respuesta
    const answerData = {
      comment: this.replyText.trim(),
      providerName: providerName,
      providerImage: providerImage,
      date: dateString,
      daysAgo: daysAgo,
      likes: 0,
      dislikes: 0,
      hearts: 0
    };

    // Llamar al servicio para guardar la respuesta
    this.reviewsService.saveReviewReply(reviewId, answerData).subscribe({
      next: (response) => {
        console.log('Respuesta guardada exitosamente:', response);
        alert('¡Respuesta enviada exitosamente!');
        
        // Cerrar el formulario
        this.cancelReply();
        
        // Recargar las reviews para mostrar la nueva respuesta
        this.loadReviews();
      },
      error: (error) => {
        console.error('Error al guardar la respuesta:', error);
        alert('Error al enviar la respuesta. Por favor intenta nuevamente.');
      }
    });
  }
}
