import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../../../environments/environment";
import { CreateRequestProviderDto } from '../../../shared/dto/create-request-provider.dto';
import { RequestProvider } from '../../../shared/dto/requestProvider-response.dto';
import { RequestProviderDocumentType } from '../../../shared/dto/RequestProviderDocumentTypeList.dto';


@Injectable({
  providedIn: 'root'
})
export class RequestProvidersService {

  private baseUrl = environment.apiUrl + "/requestProvider";

  constructor(private http: HttpClient) {}

  saveRequestProvider(body: CreateRequestProviderDto): Observable<any> {
    return this.http.post<RequestProvider>(`${this.baseUrl}/user/save`, body);
  }

  // Endpoint para consultar datos del usuario
  consultData(): Observable<RequestProvider> {
    return this.http.get<RequestProvider>(`${this.baseUrl}/user/consultData`);
  }

  // Endpoint para encontrar todas las solicitudes (admin)
  findAll(): Observable<RequestProvider[]> {
    return this.http.get<RequestProvider[]>(`${this.baseUrl}/admin/findAll`);
  }

  // Endpoint para consultar datos por ID (admin)
  consultDataById(requestProviderById: number): Observable<RequestProvider> {
    return this.http.get<RequestProvider>(`${this.baseUrl}/admin/consultDataById/${requestProviderById}`);
  }

  // Endpoint para aprobar solicitud (admin)
  approveRequest(requestProviderById: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/approve/${requestProviderById}`, {});
  }

  // Endpoint para rechazar solicitud (admin)
  declineRequest(requestProviderById: number, declinedReason: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/decline/${requestProviderById}`, { declinedReason: declinedReason });
  }

  // Endpoint para solicitar información adicional (admin)
  incompleteRequest(requestProviderById: number, incompleteReason: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/incomplete/${requestProviderById}`, { incompleteReason: incompleteReason });
  }

  // Endpoint para guardar galeria de documentos
  saveGallery(requestProviderById: number, documentosFiles: File[], addedGalleries: any): Observable<any> {
    //armar formdata
    const formData = new FormData();
    documentosFiles.forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('metadata', JSON.stringify(addedGalleries));

    return this.http.post<any>(`${this.baseUrl}/${requestProviderById}/gallery`, formData);
  }

  typeDocuments(): Observable<RequestProviderDocumentType[]> {
    return this.http.get<RequestProviderDocumentType[]>(`${environment.apiUrl}/requestProviderDocumentType/user/getAllRequestProviderDocumentTypeList`);
  }

  // Endpoint para consultar datos del proveedor (admin)
  consultDataByIdProviderAdmin(requestProviderById: number): Observable<RequestProvider> {
    return this.http.get<RequestProvider>(`${this.baseUrl}/admin/consultDataById/${requestProviderById}`);
  }
 }
