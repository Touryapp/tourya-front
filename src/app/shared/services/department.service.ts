import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Department } from "../dto/department.dto";

@Injectable({
  providedIn: "root",
})
export class DepartmentService {
  private baseUrl = environment.apiUrl + "/public/state";

  constructor(private http: HttpClient) {}

  getDepartmentsByCountryId(countryId: number): Observable<Department[]> {
    return this.http.get<Department[]>(
      `${this.baseUrl}/getAllStateByCountryIdList/${countryId}`
    );
  }
}
