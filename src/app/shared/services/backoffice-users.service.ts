import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BackofficeUser,
  CreateBackofficeUserRequest,
  ResetBackofficeUserPasswordRequest,
  UpdateBackofficeUserRequest
} from '../models/backoffice-user.model';

/**
 * FE-15d: cliente HTTP para el modulo /admin/backoffice-users del backend
 * (PR api #204). Solo lo puede consumir un ADMIN.
 */
@Injectable({ providedIn: 'root' })
export class BackofficeUsersService {
  private apiUrl = environment.apiUrl + '/admin/backoffice-users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BackofficeUser[]> {
    return this.http.get<BackofficeUser[]>(this.apiUrl);
  }

  create(body: CreateBackofficeUserRequest): Observable<BackofficeUser> {
    return this.http.post<BackofficeUser>(this.apiUrl, body);
  }

  update(userId: number, body: UpdateBackofficeUserRequest): Observable<BackofficeUser> {
    return this.http.put<BackofficeUser>(`${this.apiUrl}/${userId}`, body);
  }

  resetPassword(userId: number, body: ResetBackofficeUserPasswordRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}/reset-password`, body);
  }

  /** Soft delete: user queda con enabled = false, no se borra del BD. */
  disable(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}`);
  }

  enable(userId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}/enable`, null);
  }
}
