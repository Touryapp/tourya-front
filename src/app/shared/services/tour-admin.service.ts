import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TourAdminDto, TourAdminListResponse, TourStatus, TourCategoryDto } from '../dto/tour-admin.dto';

@Injectable({
  providedIn: 'root'
})
export class TourAdminService {
  private baseUrl = environment.apiUrl + '/tour';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de tours con paginación y filtro por estado
   * @param page Número de página (base 0)
   * @param size Cantidad de elementos por página
   * @param status Estado del tour (opcional)
   */
  findAll(page: number = 0, size: number = 10, status?: TourStatus): Observable<TourAdminListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<TourAdminListResponse>(`${this.baseUrl}/admin/findAll`, { params });
  }

  /**
   * Obtiene los detalles de un tour por ID
   * @param tourId ID del tour
   */
  getById(tourId: number): Observable<TourAdminDto> {
    return this.http.get<TourAdminDto>(`${this.baseUrl}/admin/consultDataTourById/${tourId}`);
  }

  /**
   * Obtiene la lista de categorías de tours
   */
  getCategories(): Observable<TourCategoryDto[]> {
    return this.http.get<TourCategoryDto[]>(`${environment.apiUrl}/tourCategory/user/getAllTourCategoryList`);
  }

  /**
   * Obtiene detalle del proveedor por id (admin)
   * @param providerId
   */
  getProviderById(providerId: number) {
    return this.http.get<any>(`${environment.apiUrl}/provider/admin/consultDataById/${providerId}`);
  }

  /**
   * Acepta/Aprueba un tour
   * @param tourId ID del tour
   */
  acceptTour(tourId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/admin/acceptTourById/${tourId}`, {});
  }

  /**
   * Cancela un tour
   * @param tourId ID del tour
   */
  cancelTour(tourId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/admin/cancelTourById/${tourId}`, {});
  }

  /**
   * Returned un tour
   * @param tourId ID del tour
   */
  returnedTour(tourId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/admin/returnedTourById/${tourId}`, {});
  }
}
