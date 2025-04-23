import { routes } from './../../../../shared/routes/routes';
import { Component } from '@angular/core';

@Component({
  selector: 'app-plans-settings',
  standalone: false,
  
  templateUrl: './plans-settings.component.html',
  styleUrl: './plans-settings.component.scss'
})
export class PlansSettingsComponent {
routes = routes
}
