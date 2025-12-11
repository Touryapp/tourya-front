import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaz para la respuesta de reserva
export interface Reservation {
  id: number;
  reservationId: string;
  paymentId: number;
  transactionId: string;
  payer: string;
  email: string;
  reservationDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  tourId?: number;
  tourName?: string;
  tourType?: string;
  price?: number;
  travellers?: string;
  duration?: string;
  checkInDate?: string;
  returnDate?: string;
  destination?: string;
  customerPhone?: string;
  extraServices?: string[];
  activities?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  // TODO: Cambiar a environment.apiUrl cuando el backend esté listo
  // private baseUrl = environment.apiUrl + '/public/bookings';
  private baseUrl = 'https://6aa5ded6-1a98-4c3d-a307-5717b77f587c.mock.pstmn.io/api/v1/public/bookings';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una reserva por su ID
   * @param reservationId ID de la reserva
   * @returns Observable con los datos de la reserva
   */
  getReservationById(reservationId: number | string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.baseUrl}/${reservationId}`);
  }

  /**
   * Confirma una reserva
   * @param reservationId ID de la reserva a confirmar
   * @returns Observable con la reserva confirmada
   */
  confirmReservation(reservationId: number | string): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.baseUrl}/${reservationId}/confirm`, {});
  }

  /**
   * Cancela una reserva
   * @param reservationId ID de la reserva a cancelar
   * @returns Observable con la reserva cancelada
   */
  cancelReservation(reservationId: number | string): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.baseUrl}/${reservationId}/cancel`, {});
  }

  /**
   * Obtiene todas las reservas del proveedor
   * @param params Parámetros de paginación y filtros
   * @returns Observable con la lista paginada de reservas
   */
  getProviderReservations(params: {
    page?: number;
    size?: number;
    status?: string;
    tourType?: string;
  } = {}): Observable<{
    content: Reservation[];
    totalElements: number;
    totalPages: number;
    number: number;
  }> {
    const queryParams: any = {
      page: (params.page || 0).toString(),
      size: (params.size || 10).toString()
    };

    if (params.status) {
      queryParams.status = params.status;
    }

    if (params.tourType) {
      queryParams.tourType = params.tourType;
    }

    return this.http.get<{
      content: Reservation[];
      totalElements: number;
      totalPages: number;
      number: number;
    }>(`${this.baseUrl}/provider`, { params: queryParams });
  }
}
