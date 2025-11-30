import { Component, OnInit, OnDestroy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { ReviewPendingBooking } from '../../models/pending-review.model';
import { routes } from '../../routes/routes';

@Component({
  selector: 'app-pending-reviews-modal',
  standalone: false,
  templateUrl: './pending-reviews-modal.component.html',
  styleUrls: ['./pending-reviews-modal.component.scss']
})
export class PendingReviewsModalComponent implements OnInit, OnDestroy {
  pendingReviews: ReviewPendingBooking[] = [];
 
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

  goToReview(review: ReviewPendingBooking) {
    this.bsModalRef.hide();
    // Assuming the review page takes an ID, or we navigate to the general review page
    // You might need to adjust this route parameter based on your routing configuration
    this.router.navigate([routes.review], { queryParams: { id: review.id } });
  }

  ngOnDestroy(): void {
  }
}
