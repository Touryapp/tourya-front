import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reservation, ClientReservation, PaginatedResponse, ConsumeReservationResponse, ReservationDetails, RescheduleReservationRequest } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  // TODO: Cambiar a environment.apiUrl cuando el backend esté listo
  // private baseUrl = environment.apiUrl + '/public/bookings';
  private baseUrl = 'https://6aa5ded6-1a98-4c3d-a307-5717b77f587c.mock.pstmn.io/api/v1/public/bookings';
  private apiUrl = environment.apiUrl;
  
  // Subject para notificar cambios en las reservas
  private reservationUpdatedSource = new Subject<void>();
  reservationUpdated$ = this.reservationUpdatedSource.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una reserva por su ID
   * @param reservationId ID de la reserva
   * @returns Observable con los datos de la reserva
   */
  getReservationById(reservationId: number | string): Observable<ReservationDetails> {
    return this.http.get<ReservationDetails>(`${this.apiUrl}/reservations/${reservationId}`);
  }

  /**
   * Confirma/Consume una reserva (marca como entregada)
   * @param reservationId ID de la reserva a confirmar
   * @returns Observable con la respuesta de la confirmación
   */
  confirmReservation(reservationId: number | string): Observable<ConsumeReservationResponse> {
    return this.http.post<ConsumeReservationResponse>(`${this.apiUrl}/reservations/${reservationId}/consume`, {});
  }

  /**
   * Cancela una reserva con un motivo específico
   * @param reservationId ID de la reserva a cancelar
   * @param cancellationReason Motivo de la cancelación (RAIN o CANNOT_ATTEND)
   * @returns Observable con la reserva cancelada
   */
  cancelReservation(
    reservationId: number | string, 
    cancellationReason: string
  ): Observable<Reservation> {
    const body = {
      cancellationReason: cancellationReason
    };
    return this.http.put<Reservation>(`${this.apiUrl}/reservations/${reservationId}/cancel`, body);
  }

  /**
   * Reagenda una reserva
   * @param reservationId ID de la reserva a reagendar (formato "RES-98" o número)
   * @param body Objeto con los datos de reagendamiento (newDate, slotId, startTime, endTime, configQuantity)
   * @returns Observable con la reserva reagendada
   */
  rescheduleReservation(
    reservationId: string | number, 
    body: RescheduleReservationRequest
  ): Observable<any> {
    // Extraer el número de reserva del formato "RES-98" si es necesario
    const numericId = typeof reservationId === 'string' 
      ? reservationId.replace('RES-', '') 
      : reservationId;

    // Se consume el servicio real para el reagendamiento
    return this.http.put(`${this.apiUrl}/reservations/${numericId}/reschedule`, body);
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
  } = {}): Observable<PaginatedResponse<ClientReservation>> {
    const queryParams: any = {
      page: (params.page || 0).toString(),
      size: (params.size || 10).toString(),
      _t: new Date().getTime().toString()
    };

    if (params.status) {
      queryParams.status = params.status;
    }

    if (params.tourType) {
      queryParams.tourType = params.tourType;
    }

    return this.http.get<PaginatedResponse<ClientReservation>>(
      `${this.apiUrl}/reservations`,
      { params: queryParams }
    );
  }

  /**
   * Obtiene todas las reservas del cliente autenticado
   * @param params Parámetros de paginación
   * @returns Observable con la lista paginada de reservas del cliente
   */
  getClientReservations(params: {
    page?: number;
    size?: number;
  } = {}): Observable<PaginatedResponse<ClientReservation>> {
    const queryParams: any = {
      page: (params.page || 0).toString(),
      size: (params.size || 10).toString(),
      _t: new Date().getTime().toString()
    };

    return this.http.get<PaginatedResponse<ClientReservation>>(
      `${this.apiUrl}/reservations`,
      { params: queryParams }
    );
  }

  /**
   * Notifica a los suscriptores que una reserva ha sido actualizada
   */
  notifyReservationUpdated(): void {
    this.reservationUpdatedSource.next();
  }
}
