import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { Gallery, Tour } from "../../../shared/dto/tour-response.dto";
import { CreateTourDto } from "../../../shared/dto/create-tour.dto";

@Injectable({
  providedIn: "root",
})
export class TourService {
  private baseUrl = environment.apiUrl + "/tour";

  constructor(private http: HttpClient) {}

  getTours(
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
}
