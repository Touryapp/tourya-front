import { routes } from './../../../shared/routes/routes';
import { Component } from '@angular/core';

@Component({
  selector: 'app-listings',
  standalone: false,
  
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss'
})
export class ListingsComponent {
routes = routes
}
