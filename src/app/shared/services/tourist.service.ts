import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TouristProfileDto, AddressCompleteResponseDto } from '../dto/tourist-profile.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { TourScheduleResponseDto } from '../dto/search-tour-response.dto';

@Injectable({
  providedIn: 'root'
})
export class TouristService {
  private baseUrl = environment.apiUrl + '/tourist';
  // private baseUrl = "https://c5683a55-ac29-4dab-b77c-cf29f0f19101.mock.pstmn.io/api/v1/tourist";

  constructor(private http: HttpClient) {}

  private profileCache$: Observable<TouristProfileDto> | null = null;

  /**
   * TC-009 (#196 v4): invalidar el cache del perfil. Se llama desde AuthService
   * en logout/removeTokens para evitar que un user vea datos del user anterior
   * cuando cierra sesion y entra con otro (bug reportado por Luis 2026-08-03).
   */
  clearProfileCache(): void {
    this.profileCache$ = null;
  }

  checkAddressComplete(): Observable<AddressCompleteResponseDto> {
    return this.http.get<AddressCompleteResponseDto>(`${this.baseUrl}/profile/address-complete`);
  }

  getProfile(forceRefresh: boolean = false): Observable<TouristProfileDto> {
    if (!this.profileCache$ || forceRefresh) {
      this.profileCache$ = this.http.get<TouristProfileDto>(`${this.baseUrl}/profile`).pipe(
        shareReplay(1)
      );
    }
    return this.profileCache$;
  }

  updateProfile(profile: TouristProfileDto): Observable<TouristProfileDto> {
    return this.http.put<TouristProfileDto>(`${this.baseUrl}/profile`, profile).pipe(
      tap(() => this.profileCache$ = null) // invalidate cache
    );
  }

  updateProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<any>(`${this.baseUrl}/profile/photo`, formData).pipe(
      tap(() => this.profileCache$ = null) // invalidate cache
    );
  }

  addToWishlist(tourId: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/wishlist`, { tourId });
  }

  removeFromWishlist(tourId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/wishlist`, { body: { tourId } });
  }

  searchWishlist(page: number, size: number): Observable<PaginationDto<TourScheduleResponseDto>> {
    const pageZeroBased = Math.max(0, (page || 1) - 1);
    const url = `${environment.apiUrl}/wishlist/search?page=${pageZeroBased}&size=${size}`;
    return this.http.post<PaginationDto<TourScheduleResponseDto>>(url, {});
  }

  getWishlistIds(): Observable<{ tourIds: number[] }> {
    return this.http.get<{ tourIds: number[] }>(`${environment.apiUrl}/wishlist`);
  }
}
