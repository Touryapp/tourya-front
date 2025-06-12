import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../../../environments/environment";
import { CreateRequestProviderDto } from '../../../shared/dto/create-request-provider.dto';
import { RequestProvider } from '../../../shared/dto/requestProvider-response.dto';


@Injectable({
  providedIn: 'root'
})
export class RequestProvidersService {

  private baseUrl = environment.apiUrl + "/requestProvider";

  constructor(private http: HttpClient) {}

  saveRequestProvider(body: CreateRequestProviderDto): Observable<any> {
    return this.http.post<RequestProvider>(`${this.baseUrl}/user/save`, body);
  }
}
