import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { Gallery, Tour } from "../../../shared/dto/tour-response.dto";
import { CreateTourDto } from "../../../shared/dto/create-tour.dto";
import { TourSchedule } from "../../../shared/dto/tour-schedule.response.dto";
import { CreateTourSchedule } from "../../../shared/dto/create-tour-schedule.dto";
import { TourScheduleConfigResponseDto } from "../../../shared/dto/tour-schedule.response.dto";
import { I18nFieldService } from "../../../shared/services/i18n-field.service";

@Injectable({
  providedIn: "root",
})
export class TourService {
  private baseUrl = environment.apiUrl + "/tour";

  constructor(
    private http: HttpClient,
    private i18nService: I18nFieldService
  ) {}

  getToursProvider(
    data: { page: number; size: number } = { page: 0, size: 10 }
  ): Observable<any> {
    return this.http.get<{
      content: Tour[];
      totalElements: number;
      totalPages: number;
    }>(`${this.baseUrl}/user/findAllByUser`, {
      params: {
        page: data.page.toString(),
        size: data.size.toString(),
      },
    });
  }

  getTourById(tourId: number): Observable<Tour> {
    return this.http.get<Tour>(
      `${this.baseUrl}/user/consultDataTourById/${tourId}`
    );
  }

  getTourGalleries(tourId: number): Observable<Gallery[]> {
    return this.http.get<Gallery[]>(
      `${environment.apiUrl}/tours/${tourId}/gallery`
    );
  }

  saveTourDetails(body: CreateTourDto): Observable<any> {
    return this.http.post<Tour>(`${this.baseUrl}/user/saveAll`, body);
  }

  saveTourGallery(
    tourId: number,
    files: File[],
    metadata: Gallery[]
  ): Observable<Gallery[]> {
    const formData = new FormData();
    formData.append("galleryData", JSON.stringify(metadata));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("newFiles", file);
      });
    }

    return this.http.post<Gallery[]>(
      `${environment.apiUrl}/tours/${tourId}/gallery/sync`,
      formData
    );
  }

  getSchedulesByTourId(tourId: number): Observable<TourScheduleConfigResponseDto[]
  > {
    return this.http.get<TourScheduleConfigResponseDto[]>(`${environment.apiUrl}/tour-schedules/tours/${tourId}`);
  }

  getScheduleById(configId: number): Observable<TourSchedule> {
    return this.http.get<TourSchedule>(
      `${environment.apiUrl}/tour-schedules/${configId}`
    );
  }

  saveTourSchedule(body: Partial<CreateTourSchedule>): Observable<any> {
    return this.http.post<TourSchedule>(
      `${environment.apiUrl}/tour-schedules`,
      body
    );
  }


  // Método para guardar múltiples configuraciones de tour schedule
  saveTourScheduleBatch(body: any[]): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/tour-schedules/batch`,
      body
    );
  }

  // /tour/user/submitTourById/{tourId}
  submitTourById(tourId: number): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/user/submitTourById/${tourId}`,
      {}
    );
  }

  updateSlotPercentage(tourId: number, slotId: number, scheduleId: number, slotPercentageTourya: number): Observable<any> {
    return this.http.put<any>(
      `${environment.apiUrl}/tour-schedules/tours/${tourId}/percentage/${slotId}`,
      { scheduleId, slotPercentageTourya }
    );
  }

  updateTourPercentageByDateRange(tourId: number, payload: { slotPercentageTourya: number, startDate: string, endDate: string }): Observable<any> {
    return this.http.put<any>(
      `${environment.apiUrl}/tour-schedules/tours/${tourId}/percentage`,
      payload
    );
  }
}
