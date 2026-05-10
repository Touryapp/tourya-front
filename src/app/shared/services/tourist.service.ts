import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  checkAddressComplete(): Observable<AddressCompleteResponseDto> {
    return this.http.get<AddressCompleteResponseDto>(`${this.baseUrl}/profile/address-complete`);
  }

  getProfile(): Observable<TouristProfileDto> {
    return this.http.get<TouristProfileDto>(`${this.baseUrl}/profile`);
  }

  updateProfile(profile: TouristProfileDto): Observable<TouristProfileDto> {
    return this.http.put<TouristProfileDto>(`${this.baseUrl}/profile`, profile);
  }

  updateProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<any>(`${this.baseUrl}/profile/photo`, formData);
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
