import { Component, OnInit } from '@angular/core';
import { routes } from "../../../shared/routes/routes";

@Component({
  selector: 'app-booking-confirm',
  standalone: false,
  templateUrl: './booking-confirm.component.html',
  styleUrl: './booking-confirm.component.scss'
})
export class BookingConfirmComponent implements OnInit {
  public routes = routes;
  
  // Booking confirmation data
  bookingData = {
    bookingId: 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    tourName: 'Rainbow Mountain Valley',
    location: 'Ciutat Vella, Barcelona',
    duration: '4 Day, 3 Night',
    fromDate: '25 May 2025',
    toDate: '28 May 2025',
    adults: 2,
    children: 1,
    infants: 0,
    totalAmount: 850,
    status: 'Confirmed',
    paymentMethod: 'Credit Card',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+1 234 567 8900'
  };

  constructor() {}

  ngOnInit(): void {
    // Initialize component
  }

  downloadInvoice(): void {
    console.log('Downloading invoice...');
    // Implement invoice download logic
  }

  printBooking(): void {
    window.print();
  }

  goToHome(): void {
    // Navigate to home page
    console.log('Navigating to home...');
  }
} 