import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  SearchTourListDto,
  TourScheduleResponseDto,
} from "../../../shared/dto/search-tour-response.dto";
import { PaginationDto } from "../../../shared/dto/pagination.dto";

@Injectable({
  providedIn: "root",
})
export class SearchToursService {
  private baseUrl = environment.apiUrl + "/public/tours/schedule";

  constructor(private http: HttpClient) {}

  // Endpoint para buscar tours por horarios
  searchTours(
    body: Partial<SearchTourListDto>
  ): Observable<PaginationDto<TourScheduleResponseDto>> {
    return this.http.post<PaginationDto<TourScheduleResponseDto>>(
      `${this.baseUrl}/search`,
      body
    );
  }
}
