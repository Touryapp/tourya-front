import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminCreditsPageResponse, ClientCredit } from '../models/credit.model';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de créditos del cliente
   * @param status Estado opcional para filtrar los créditos (CREATED, CANCELED, DELETED, REFUND_REQUESTED, REFUNDED, EXPIRED)
   * @returns Observable con el arreglo de créditos
   */
  getCredits(status?: string): Observable<ClientCredit[]> {
    let params = {};
    if (status) {
      params = { status };
    }
    return this.http.get<ClientCredit[]>(`${this.apiUrl}/credits`, { params });
  }

  /**
   * Reserva créditos para un item del carrito
   */
  reserveCredits(payload: { shoppingCartItemId: number; amountToReserve: number; creditIds: number[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/credits/reserve`, payload);
  }

  /**
   * TC-022: turista solicita devolución en efectivo de un crédito en status CREATED.
   * Transiciona CREATED -> REFUND_REQUESTED.
   */
  requestRefund(creditId: number): Observable<ClientCredit> {
    return this.http.post<ClientCredit>(`${this.apiUrl}/credits/${creditId}/request-refund`, {});
  }

  /**
   * TC-022: ADMIN/BACKOFFICE_OPERATION obtiene el listado global paginado de créditos
   * con datos del turista. Filtrable por status.
   */
  getAdminCredits(page: number, size: number, status?: string): Observable<AdminCreditsPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<AdminCreditsPageResponse>(`${this.apiUrl}/admin/credits`, { params });
  }

  /**
   * TC-022: ADMIN/BACKOFFICE_OPERATION sube el comprobante (imagen o PDF) de la
   * devolución efectuada. Transiciona REFUND_REQUESTED -> REFUNDED.
   */
  uploadRefundProof(creditId: number, file: File): Observable<ClientCredit> {
    const formData = new FormData();
    formData.append('proof', file);
    return this.http.post<ClientCredit>(
      `${this.apiUrl}/admin/credits/${creditId}/upload-refund-proof`,
      formData
    );
  }
}
