import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GuestInfoService {

  constructor() { }

  /**
   * Mocked PUT service that always returns 200 OK after a short delay
   * @param payload Form data payload
   * @returns Observable simulating a successful HTTP response
   */
  updateGuestInfo(payload: any): Observable<any> {
    console.log('🔄 Llamando a servicio REST PUT (MOCK)... Payload:', payload);
    // Simular un retraso de red de 1.5 segundos y devolver un status 200 OK
    return of({ status: 200, message: 'Success', data: payload }).pipe(
      delay(1500)
    );
  }
}
