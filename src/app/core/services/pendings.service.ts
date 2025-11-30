import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { PendingReviewResponse, ReviewPendingBooking } from '../../shared/models/pending-review.model';


@Injectable({
  providedIn: 'root'
})
export class PendingsService {
  private baseUrl = environment.apiUrl + '/pendings';
  


  constructor(private http: HttpClient) { }

  getPendingReviews(): Observable<PendingReviewResponse> {
    // TODO: change url for deployed back service
    const url = 'https://6aa5ded6-1a98-4c3d-a307-5717b77f587c.mock.pstmn.io/api/v1/public/search/pending-reviews';
    return this.http.get<PendingReviewResponse>(url);
  }


}
