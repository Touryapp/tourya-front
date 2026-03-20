import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MaritimeActivityReport, PaginatedMaritimeReports } from '../models/maritime-activity-report.model';

@Injectable({
  providedIn: 'root'
})
export class MaritimeActivityReportService {
  private apiUrl = environment.apiUrl + '/maritime-activity-reports';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los reportes con paginación opcional
   */
  getAll(page: number = 0, size: number = 10, sort?: string): Observable<PaginatedMaritimeReports> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<PaginatedMaritimeReports>(this.apiUrl, { params });
  }

  /**
   * Obtiene un reporte por su ID
   */
  getById(id: number): Observable<MaritimeActivityReport> {
    return this.http.get<MaritimeActivityReport>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo reporte
   */
  create(report: MaritimeActivityReport): Observable<MaritimeActivityReport> {
    return this.http.post<MaritimeActivityReport>(this.apiUrl, report);
  }

  /**
   * Actualiza un reporte existente
   */
  update(id: number, report: MaritimeActivityReport): Observable<MaritimeActivityReport> {
    return this.http.put<MaritimeActivityReport>(`${this.apiUrl}/${id}`, report);
  }

  /**
   * Elimina un reporte por su ID
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca reportes por fecha (YYYY-MM-DD)
   */
  getByDate(reportDate: string): Observable<MaritimeActivityReport[]> {
    const params = new HttpParams().set('reportDate', reportDate);
    return this.http.get<MaritimeActivityReport[]>(`${this.apiUrl}/date`, { params });
  }

  /**
   * Busca reportes por país y ciudad
   */
  getByCountryCity(country: string, city: string): Observable<MaritimeActivityReport[]> {
    const params = new HttpParams()
      .set('country', country)
      .set('city', city);
    return this.http.get<MaritimeActivityReport[]>(`${this.apiUrl}/country-city`, { params });
  }
}
