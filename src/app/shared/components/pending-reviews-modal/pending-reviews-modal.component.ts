import { Component, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { ProviderReview } from '../../models/reviews.model';
import { routes } from '../../routes/routes';

@Component({
  selector: 'app-pending-reviews-modal',
  standalone: false,
  templateUrl: './pending-reviews-modal.component.html',
  styleUrls: ['./pending-reviews-modal.component.scss']
})
export class PendingReviewsModalComponent implements OnInit, OnDestroy {
  pendingReviews: ProviderReview[] = [];
 
  constructor(
    public bsModalRef: BsModalRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // pendingReviews will be populated by BsModalService initialState
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  goToReview(review: ProviderReview) {
    this.bsModalRef.hide();
    // Navegar a la sección de reservas para crear la reseña
    this.router.navigate([routes.myProfile], { 
      queryParams: { 
        section: 'bookings',
        reservationId: review.reservationId,
        createReview: 'true' // Flag para abrir el modal de crear reseña
      } 
    });
  }

  ngOnDestroy(): void {
  }
}
