import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-cruise-booking-confirmation',
  standalone: false,
  
  templateUrl: './cruise-booking-confirmation.component.html',
  styleUrl: './cruise-booking-confirmation.component.scss'
})
export class CruiseBookingConfirmationComponent {
public routes= routes;
}
