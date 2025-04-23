import { routes } from './../../../shared/routes/routes';
import { Component } from '@angular/core';

@Component({
  selector: 'app-destination',
  standalone: false,
  
  templateUrl: './destination.component.html',
  styleUrl: './destination.component.scss'
})
export class DestinationComponent {
routes = routes
}
