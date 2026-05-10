import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PayoutOrder } from '../dto/payout-order.dto';
import { AuthService } from '../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PayoutOrdersService {
  private apiUrl = `${environment.apiUrl}/provider/payout-orders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // Provider methods
  getPayoutOrders(): Observable<PayoutOrder[]> {
    return this.http.get<PayoutOrder[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getPayoutOrderDetails(orderId: number): Observable<PayoutOrder> {
    return this.http.get<PayoutOrder>(`${this.apiUrl}/${orderId}`, { headers: this.getHeaders() });
  }

  // Admin/Backoffice methods
  getAdminPayoutOrders(): Observable<PayoutOrder[]> {
    return this.http.get<PayoutOrder[]>(`${this.apiUrl}/admin`, { headers: this.getHeaders() });
  }

  getAdminPayoutOrderDetails(orderId: number): Observable<PayoutOrder> {
    return this.http.get<PayoutOrder>(`${this.apiUrl}/admin/${orderId}`, { headers: this.getHeaders() });
  }

  uploadPaymentProof(orderId: number, file: File): Observable<PayoutOrder> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Custom headers for multipart, usually HttpClient does this automatically but we need Auth
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<PayoutOrder>(`${this.apiUrl}/admin/${orderId}/proof`, formData, { headers });
  }
}
