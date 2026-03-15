import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClientCredit } from '../models/credit.model';

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de créditos del cliente
   * @param status Estado opcional para filtrar los créditos (CREATED, CANCELED, DELETED)
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
}
