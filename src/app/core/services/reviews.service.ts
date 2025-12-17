import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, tap } from 'rxjs/operators';

import { ReviewsApiResponse } from '../../shared/models/reviews.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private baseUrl = environment.apiUrl + '/pendings';
  private pendingReviewsCache: ReviewsApiResponse | null = null;

  constructor(private http: HttpClient) { }

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
    providerId?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<ReviewsApiResponse> {
    // Construir parámetros de query
    const params: string[] = [];
    
    // Paginación (valores por defecto)
    const pageSize = filters?.pageSize || 10;
    const pageNumber = filters?.pageNumber || 1;
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
    if (filters?.providerId && filters.providerId !== 'all') {
      params.push(`providerId=${filters.providerId}`);
    }
    
    const queryString = params.join('&');
    const url = `https://6aa5ded6-1a98-4c3d-a307-5717b77f587c.mock.pstmn.io/api/v1/public/search/reviews?${queryString}`;
    
    return this.http.get<ReviewsApiResponse>(url);
  }

  /**
   * Guarda la respuesta del proveedor a una review
   * @param reviewId ID de la review a la que se responde
   * @param answerData Datos de la respuesta del proveedor
   */
  saveReviewReply(reviewId: string, answerData: {
    comment: string;
    providerName: string;
    providerImage: string;
    date: string;
    daysAgo: string;
    likes?: number;
    dislikes?: number;
    hearts?: number;
  }): Observable<any> {
    const url = `https://6aa5ded6-1a98-4c3d-a307-5717b77f587c.mock.pstmn.io/api/v1/public/save/review/${reviewId}`;
    
    // Estructura completa que espera el backend
    const payload = {
      answer: {
        answerId: `ANS-${Date.now()}`, // Generar ID único
        comment: answerData.comment,
        providerName: answerData.providerName,
        providerImage: answerData.providerImage,
        date: answerData.date,
        daysAgo: answerData.daysAgo,
        likes: answerData.likes || 0,
        dislikes: answerData.dislikes || 0,
        hearts: answerData.hearts || 0
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
    const url = `https://6aa5ded6-1a98-4c3d-a307-5717b77f587c.mock.pstmn.io/api/v1/public/save/review/${reviewId}`;
    
    const payload = {
      status: 'REJECTED',
      rejectionReason: rejectionReason
    };
    
    return this.http.patch(url, payload);
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
}
