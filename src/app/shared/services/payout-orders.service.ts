import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PayoutOrder, PayoutOrdersResponse } from '../dto/payout-order.dto';
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
  getPayoutOrders(status?: string, fromDate?: string, toDate?: string): Observable<PayoutOrdersResponse> {
    let params = new HttpParams();
    if (status && status !== 'All') params = params.set('status', status);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<PayoutOrdersResponse>(this.apiUrl, { headers: this.getHeaders(), params });
  }

  getPayoutOrderDetails(orderId: number): Observable<PayoutOrder> {
    return this.http.get<PayoutOrder>(`${this.apiUrl}/${orderId}`, { headers: this.getHeaders() });
  }

  // Admin/Backoffice methods
  getAdminPayoutOrders(status?: string, fromDate?: string, toDate?: string): Observable<PayoutOrdersResponse> {
    let params = new HttpParams();
    if (status && status !== 'All') params = params.set('status', status);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<PayoutOrdersResponse>(`${this.apiUrl}/admin`, { headers: this.getHeaders(), params });
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
