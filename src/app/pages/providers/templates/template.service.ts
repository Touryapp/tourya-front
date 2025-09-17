import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { TourSchedule } from "../../../shared/dto/tour-schedule.response.dto";
import { CreateTourSchedule } from "../../../shared/dto/create-tour-schedule.dto";

@Injectable({
  providedIn: "root",
})
export class TemplateService {
  private baseUrl = environment.apiUrl + "/tour-schedules";

  constructor(private http: HttpClient) {}

  // Obtener todos los templates
  getTemplates(): Observable<TourSchedule[]> {
    return this.http.get<TourSchedule[]>(`${this.baseUrl}/templates`);
  }

  // Obtener un template por ID
  getTemplateById(templateId: number): Observable<TourSchedule> {
    return this.http.get<TourSchedule>(`${this.baseUrl}/config/${templateId}`);
  }

  // Crear un nuevo template
  createTemplate(template: Partial<CreateTourSchedule>): Observable<TourSchedule> {
    const params = new HttpParams().set('isTemplate', template.isTemplate || false);
    return this.http.post<TourSchedule>(`${this.baseUrl}/config`, template, { params });
  }

  // Actualizar un template
  updateTemplate(templateId: number, template: CreateTourSchedule): Observable<TourSchedule> {
    return this.http.put<TourSchedule>(`${this.baseUrl}/config/${templateId}`, template);
  }

  // Eliminar un template
  deleteTemplate(templateId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/config/${templateId}`);
  }
}
