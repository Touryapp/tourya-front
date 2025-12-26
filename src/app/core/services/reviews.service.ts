import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { 
  ReviewsApiResponse, 
  CreateReviewRequest, 
  CreateReviewSimpleRequest,
  ProviderAnswerRequest,
  UpdateReviewWithAnswerRequest
} from '../../shared/models/reviews.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private baseUrl = environment.apiUrl;
  private pendingReviewsCache: ReviewsApiResponse | null = null;

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) { }

  getPendingReviews(): Observable<ReviewsApiResponse> {
    // TODO: change url for deployed back service
    const url = 'https://6aa5ded6-1a98-4c3d-a307-5717b77f587c.mock.pstmn.io/api/v1/public/search/pending-reviews';
    return this.http.get<ReviewsApiResponse>(url).pipe(
      tap(response => {
        this.pendingReviewsCache = response;
      })
    );
  }

  /**
   * Obtiene las reseñas del proveedor con filtros opcionales
   * @param filters Objeto con los filtros a aplicar
   */
  getReviews(filters?: {
    rating?: number;
    tourId?: string;
    userId?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<ReviewsApiResponse> {
    // Construir parámetros de query
    const params: string[] = [];
    
    // Paginación (valores por defecto)
    // El backend usa paginación 0-indexed
    const pageSize = filters?.pageSize || 10;
    const pageNumber = filters?.pageNumber !== undefined ? filters.pageNumber : 0;
    params.push(`pageSize=${pageSize}`);
    params.push(`pageNumber=${pageNumber}`);
    
    // Filtros opcionales
    if (filters?.rating && filters.rating > 0) {
      params.push(`rating=${filters.rating}`);
    }
    if (filters?.tourId && filters.tourId !== 'all') {
      params.push(`tourId=${filters.tourId}`);
    }
    if (filters?.userId && filters.userId !== 'all') {
      params.push(`userId=${filters.userId}`);
    }
    
    const queryString = params.join('&');
    const url = `${this.baseUrl}/public/search/reviews?${queryString}`;
    
    return this.http.get<ReviewsApiResponse>(url);
  }

  /**
   * Guarda la respuesta del proveedor a una review
   * @param reviewId ID de la review a la que se responde (formato: REV-XXX)
   * @param answerComment Comentario de respuesta del proveedor
   */
  saveReviewReply(reviewId: string, answerComment: string): Observable<any> {
    const url = `${this.baseUrl}/public/save/review/${reviewId}`;
    
    // Obtener el idioma actual del usuario
    const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    
    // Construir el payload completo según la estructura del API
    // Solo llenamos el comentario en el idioma actual
    const payload: UpdateReviewWithAnswerRequest = {
      answer: {
        comment: {
          es: currentLang === 'es' ? answerComment : '',
          en: currentLang === 'en' ? answerComment : '',
          pt: currentLang === 'pt' ? answerComment : ''
        },
        providerName: '', // Se puede obtener del AuthService si es necesario
        providerImage: '', // Se puede obtener del perfil del usuario
        date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        likes: 0,
        dislikes: 0,
        hearts: 0
      }
    };
    
    return this.http.patch(url, payload);
  }

  /**
   * Rechaza una review (solo para Backoffice)
   * @param reviewId ID de la review a rechazar
   * @param rejectionReason Motivo del rechazo
   */
  rejectReview(reviewId: string, rejectionReason: string): Observable<any> {
    const url = `${this.baseUrl}/public/save/review/${reviewId}`;
    
    const payload = {
      status: 'CANCELED',
      rejectionReason: rejectionReason
    };
    
    return this.http.patch(url, payload);
  }

  /**
   * Guarda una nueva review de un cliente con comentarios multilingües
   * @param reviewData Datos de la review a guardar
   */
  saveReview(reviewData: CreateReviewRequest): Observable<any> {
    const url = `${this.baseUrl}/public/save/review`;
    return this.http.post(url, reviewData);
  }

  getFromCachePendingReviews(): Observable<ReviewsApiResponse> {
    if (this.pendingReviewsCache) {
      return of(this.pendingReviewsCache);
    }
    return of({
      content: [],
      number: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true
    })
  }

  /**
   * Crea una nueva reseña para una reserva
   * @param reviewData Datos de la reseña a crear
   */
  createReview(reviewData: CreateReviewSimpleRequest): Observable<any> {
    const url = `${this.baseUrl}/public/save/review`;
    
    // Obtener el idioma actual del usuario
    const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
    
    // Construir el payload con el comentario solo en el idioma actual
    // Los otros idiomas se envían vacíos
    const payload: CreateReviewRequest = {
      reservationId: reviewData.reservationId,
      rating: reviewData.rating,
      comment: {
        es: currentLang === 'es' ? reviewData.comment : '',
        en: currentLang === 'en' ? reviewData.comment : '',
        pt: currentLang === 'pt' ? reviewData.comment : ''
      },
      date: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
    };
    
    return this.http.post(url, payload);
  }
}
