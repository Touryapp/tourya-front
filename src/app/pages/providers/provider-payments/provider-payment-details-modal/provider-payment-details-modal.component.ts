import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PayoutOrder, PayoutOrderReservation } from '../../../../shared/dto/payout-order.dto';
import { PayoutOrdersService } from '../../../../shared/services/payout-orders.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-provider-payment-details-modal',
  standalone: false,
  templateUrl: './provider-payment-details-modal.component.html',
  styleUrls: ['./provider-payment-details-modal.component.scss']
})
export class ProviderPaymentDetailsModalComponent implements OnChanges {
  @Input() selectedPayment: PayoutOrder | null = null;
  @Input() showModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  public associatedBookings: PayoutOrderReservation[] = [];
  public expandedBookingId: number | null = null;
  public loading: boolean = false;

  constructor(
    private payoutOrdersService: PayoutOrdersService,
    private authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPayment'] && this.selectedPayment && this.showModal) {
      this.loadAssociatedBookings(this.selectedPayment.id);
    }
  }

  close(): void {
    this.closeModal.emit();
    this.expandedBookingId = null;
    this.associatedBookings = [];
  }

  toggleRow(bookingId: number): void {
    if (this.expandedBookingId === bookingId) {
      this.expandedBookingId = null;
    } else {
      this.expandedBookingId = bookingId;
    }
  }

  private loadAssociatedBookings(paymentId: number): void {
    this.loading = true;
    const observer = {
      next: (data: PayoutOrder) => {
        this.associatedBookings = data.reservations || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading payout order details:', error);
        this.loading = false;
      }
    };

    if (this.authService.isAdmin()) {
      this.payoutOrdersService.getAdminPayoutOrderDetails(paymentId).subscribe(observer);
    } else {
      this.payoutOrdersService.getPayoutOrderDetails(paymentId).subscribe(observer);
    }
  }

  public getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Confirmed': 'badge-primary',
      'Completed': 'badge-success',
      'Pending': 'badge-warning',
      'Cancelled': 'badge-danger'
    };
    return statusClasses[status] || 'badge-secondary';
  }
}
