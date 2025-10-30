import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { City } from "../dto/city.dto";
import { LocationsPublicDto } from "../dto/locations-public.dto";

@Injectable({
  providedIn: "root",
})
export class CityService {
  private baseUrl = environment.apiUrl + "/public/city";

  constructor(private http: HttpClient) {}

  getCitiesByDepartmentId(departmentId: number): Observable<City[]> {
    return this.http.get<City[]>(
      `${this.baseUrl}/getAllCityByStateIdList/${departmentId}`
    );
  }

  getLocationsPublic(): Observable<LocationsPublicDto[]> {
    return this.http.get<LocationsPublicDto[]>(`${environment.apiUrl}/public/search/locations`);
  }
}
