import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { Tour } from "../../../shared/dto/tour-response.dto";

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
}
