import { Component } from '@angular/core';
import { routes } from '../../../../shared/routes/routes';

@Component({
  selector: 'app-flight-listing',
  standalone: false,
  
  templateUrl: './flight-listing.component.html',
  styleUrl: './flight-listing.component.scss'
})
export class FlightListingComponent {
routes = routes
}
