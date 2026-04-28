import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ProviderPayment } from '../provider-payments.component';

export interface PaymentAssociatedBooking {
  id: string;
  tourImage: string;
  tourName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  travellers: number;
  startDate: string;
  price: string;
  status: string;
}

@Component({
  selector: 'app-provider-payment-details-modal',
  standalone: false,
  templateUrl: './provider-payment-details-modal.component.html',
  styleUrls: ['./provider-payment-details-modal.component.scss']
})
export class ProviderPaymentDetailsModalComponent implements OnChanges {
  @Input() selectedPayment: ProviderPayment | null = null;
  @Input() showModal: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  public associatedBookings: PaymentAssociatedBooking[] = [];
  public expandedBookingId: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPayment'] && this.selectedPayment) {
      this.loadAssociatedBookings(this.selectedPayment.id);
    }
  }

  close(): void {
    this.closeModal.emit();
    this.expandedBookingId = null;
  }

  toggleRow(bookingId: string): void {
    if (this.expandedBookingId === bookingId) {
      this.expandedBookingId = null;
    } else {
      this.expandedBookingId = bookingId;
    }
  }

  private loadAssociatedBookings(paymentId: string): void {
    // Mock data for associated bookings based on payment ID
    this.associatedBookings = [
      {
        id: 'BKG-001',
        tourImage: 'tours-21.jpg',
        tourName: 'LaughFest Carnival',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@example.com',
        customerPhone: '+1 234 567 8900',
        travellers: 2,
        startDate: '2024-11-10',
        price: '$600.00',
        status: 'Confirmed'
      },
      {
        id: 'BKG-002',
        tourImage: 'tours-22.jpg',
        tourName: 'Beach Paradise Adventure',
        customerName: 'Michael Chen',
        customerEmail: 'm.chen@example.com',
        customerPhone: '+1 987 654 3210',
        travellers: 4,
        startDate: '2024-11-15',
        price: '$600.00',
        status: 'Completed'
      }
    ];
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
