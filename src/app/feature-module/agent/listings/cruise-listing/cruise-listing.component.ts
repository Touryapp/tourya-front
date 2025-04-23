import { Component } from '@angular/core';
import { routes } from '../../../../shared/routes/routes';

@Component({
  selector: 'app-cruise-listing',
  standalone: false,
  
  templateUrl: './cruise-listing.component.html',
  styleUrl: './cruise-listing.component.scss'
})
export class CruiseListingComponent {
routes = routes
}
