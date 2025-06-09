import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Country } from "../dto/country.dto";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class CountryService {
  private baseUrl = environment.apiUrl + "/public/country";

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.baseUrl}/getAllCountryList`);
  }
}
