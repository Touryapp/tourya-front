import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-car-booking-confirmation',
  standalone: false,
  
  templateUrl: './car-booking-confirmation.component.html',
  styleUrl: './car-booking-confirmation.component.scss'
})
export class CarBookingConfirmationComponent {
 public routes=routes;
}
