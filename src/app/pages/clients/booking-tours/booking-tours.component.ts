import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { routes } from "../../../shared/routes/routes";

@Component({
  selector: 'app-booking-tours',
  standalone: false,
  templateUrl: './booking-tours.component.html',
  styleUrl: './booking-tours.component.scss'
})
export class BookingToursComponent implements OnInit {
  public routes = routes;
  
  // Date picker
  bsValue = new Date();
  minDate = new Date();
  
  // Form for booking
  bookingForm: FormGroup;
  
  // Tour data
  tourData = {
    name: 'Rainbow Mountain Valley',
    location: 'Ciutat Vella, Barcelona',
    price: 500,
    originalPrice: 789,
    duration: '4 Day, 3 Night',
    guests: 14,
    image: 'assets/img/tours/tours-07.jpg'
  };

  constructor(
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.required, Validators.min(0)]],
      infants: [0, [Validators.required, Validators.min(0)]],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      specialRequests: ['']
    });
  }

  ngOnInit(): void {
    // Initialize component
  }

  onSubmit(): void {
    if (this.bookingForm.valid) {
      console.log('Booking form submitted:', this.bookingForm.value);
      // Navigate to booking confirmation
      // this.router.navigate(['/pages/clients/booking-confirm']);
    }
  }

  calculateTotal(): number {
    const adults = this.bookingForm.get('adults')?.value || 0;
    const children = this.bookingForm.get('children')?.value || 0;
    const infants = this.bookingForm.get('infants')?.value || 0;
    
    return (adults * this.tourData.price) + (children * (this.tourData.price * 0.7)) + (infants * 0);
  }
} 