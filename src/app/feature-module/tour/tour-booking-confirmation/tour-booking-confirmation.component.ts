import { Component } from '@angular/core';
import { routes } from '../../../shared/routes/routes';

@Component({
  selector: 'app-tour-booking-confirmation',
  standalone: false,
  
  templateUrl: './tour-booking-confirmation.component.html',
  styleUrl: './tour-booking-confirmation.component.scss'
})
export class TourBookingConfirmationComponent {
public routes =routes;
}
