import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProviderUser,
  CreateProviderUserRequest,
  UpdateProviderUserRequest,
  ResetPasswordRequest
} from '../models/provider-user.model';

@Injectable({
  providedIn: 'root'
})
export class ProviderUsersService {
  private apiUrl = environment.apiUrl + '/provider/users';

  constructor(private http: HttpClient) {}

  /**
   * GET /provider/users — Lista todos los operadores del proveedor
   */
  getAll(): Observable<ProviderUser[]> {
    return this.http.get<ProviderUser[]>(this.apiUrl);
  }

  /**
   * POST /provider/users — Crea un nuevo operador
   */
  create(body: CreateProviderUserRequest): Observable<ProviderUser> {
    return this.http.post<ProviderUser>(this.apiUrl, body);
  }

  /**
   * PUT /provider/users/{providerUserId} — Actualiza nombre y tours asignados
   */
  update(providerUserId: number, body: UpdateProviderUserRequest): Observable<ProviderUser> {
    return this.http.put<ProviderUser>(`${this.apiUrl}/${providerUserId}`, body);
  }

  /**
   * PUT /provider/users/{providerUserId}/reset-password — Resetea contraseña temporal
   */
  resetPassword(providerUserId: number, body: ResetPasswordRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${providerUserId}/reset-password`, body);
  }

  /**
   * PUT /provider/users/{providerUserId}/principal-tour?tourId=X — Cambia tour principal
   */
  changePrincipalTour(providerUserId: number, tourId: number): Observable<ProviderUser> {
    const params = new HttpParams().set('tourId', tourId.toString());
    return this.http.put<ProviderUser>(`${this.apiUrl}/${providerUserId}/principal-tour`, null, { params });
  }
}
