import { Component } from '@angular/core';
import { routes } from '../../../../shared/routes/routes';

@Component({
  selector: 'app-tour-listing',
  standalone: false,
  
  templateUrl: './tour-listing.component.html',
  styleUrl: './tour-listing.component.scss'
})
export class TourListingComponent {
routes = routes
}
