import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { Gallery, Tour } from "../../../shared/dto/tour-response.dto";
import { CreateTourDto } from "../../../shared/dto/create-tour.dto";
import { SearchTourListDto } from "../../../shared/dto/search-tour-response.dto";
import { PaginationDto } from "../../../shared/dto/pagination.dto";
import { SearchToursDto } from "../../../shared/dto/search-tours.dto";

@Injectable({
  providedIn: "root",
})
export class SearchToursService {
  private baseUrl = environment.apiUrl + "/public/tours/schedule";

  constructor(private http: HttpClient) {}

    // Endpoint para buscar tours por horarios
    searchTours(body: Partial<SearchTourListDto>): Observable<PaginationDto<SearchToursDto>> {
        return this.http.post<PaginationDto<SearchToursDto>>(`${this.baseUrl}/search`, body);
    }
    

}
