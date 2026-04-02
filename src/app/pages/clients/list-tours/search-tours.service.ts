import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import {
  SearchTourListDto,
  TagDto,
  TourScheduleResponseDto,
} from "../../../shared/dto/search-tour-response.dto";
import { PaginationDto } from "../../../shared/dto/pagination.dto";
import { CategoryDto } from "../../../shared/dto/category.dto";
import { TourDetail } from "../../../shared/dto/tour-response.dto";

@Injectable({
  providedIn: "root",
})
export class SearchToursService {
  private baseUrl = environment.apiUrl + "/public/tours/schedule";

  constructor(private http: HttpClient) {}

  // Endpoint para buscar tours por horarios con paginación por query params
  searchTours(
    body: Partial<SearchTourListDto>,
    page: number,
    size: number
  ): Observable<PaginationDto<TourScheduleResponseDto>> {
    const pageZeroBased = Math.max(0, (page || 1) -1);
    const pageSize = size || 10;
    const url = `${this.baseUrl}/search?page=${pageZeroBased}&size=${pageSize}`;
   // return this.http.post<PaginationDto<TourScheduleResponseDto>>(url, body);
    return this.http.post<PaginationDto<TourScheduleResponseDto>>("https://c5683a55-ac29-4dab-b77c-cf29f0f19101.mock.pstmn.io/api/v1/public/tours/schedule/search?page=0&size=10", body);
  }

  tagPublic(): Observable<TagDto[]> {
    return this.http.get<TagDto[]>(`${environment.apiUrl}/public/tags`);
  }

  categoriesPublic(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${environment.apiUrl}/public/search/categories`);
  }

  ageTypesPublic(): Observable<{name:string}[]> {
    return this.http.get<{name:string}[]>(`${environment.apiUrl}/public/age-price-types`);
  }
  detailTourPublic(tourId:number): Observable<TourDetail> {
    return this.http.get<TourDetail>(`${environment.apiUrl}/public/tour/details/${tourId}`);
  }
}
