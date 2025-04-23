import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-flight-booking-confirmation',
  standalone: false,
  
  templateUrl: './flight-booking-confirmation.component.html',
  styleUrl: './flight-booking-confirmation.component.scss'
})
export class FlightBookingConfirmationComponent {
public routes=routes;
}
